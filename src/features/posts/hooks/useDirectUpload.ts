'use client';

/**
 * useDirectUpload
 *
 * Encapsulates the entire "Direct Upload via Presigned URL + SSE confirmation"
 * flow for post media.
 *
 * Flow:
 *  idle
 *    → requesting_url  (POST /post-medias/presigned-urls)
 *    → uploading_to_s3 (XHR PUT to each presigned URL)
 *    → waiting_for_sse (EventSource listening for backend "complete" event)
 *    → success | error
 *
 * Key guarantees:
 *  - Single source of truth via useReducer (no stale-closure race conditions)
 *  - XHR used for upload so we get granular per-file progress events
 *  - EventSource is always closed on unmount (no memory leaks)
 *  - SSE retry with exponential back-off (up to `maxRetries` attempts)
 *  - Polling fallback if SSE times out before the "complete" event arrives
 *  - AbortController wired to every in-flight HTTP request
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { postsService } from '../services/post.service';
import type {
  DirectUploadContext,
  FileUploadProgress,
  PresignedUrlResponse,
  UploadState,
} from '../types/create-post.types';

// =============================================================================
// ACTIONS
// =============================================================================

type UploadAction =
  | { type: 'START_UPLOAD'; payload: File[] }
  | { type: 'PRESIGNED_URLS_RECEIVED'; payload: PresignedUrlResponse[] }
  | { type: 'PRESIGNED_URL_ERROR'; payload: string }
  | { type: 'FILE_PROGRESS'; payload: { index: number; progress: number } }
  | { type: 'FILE_UPLOAD_SUCCESS'; payload: { index: number; s3Key: string } }
  | { type: 'FILE_UPLOAD_ERROR'; payload: { index: number; error: string } }
  | { type: 'ALL_S3_UPLOADS_COMPLETE'; payload: { sessionId: string } }
  | { type: 'SSE_PROCESSING_UPDATE'; payload: { progress: number } }
  | { type: 'SSE_SUCCESS'; payload: { urls: string[] } }
  | { type: 'SSE_ERROR'; payload: string }
  | { type: 'SSE_TIMEOUT' }
  | { type: 'RESET' }
  | { type: 'ABORT' };

// =============================================================================
// REDUCER  (pure — no side effects)
// =============================================================================

const INITIAL_STATE: DirectUploadContext = {
  state: 'idle',
  files: [],
  overallProgress: 0,
  error: null,
  sessionId: null,
  completedUrls: [],
};

function calcOverall(files: FileUploadProgress[]): number {
  if (files.length === 0) return 0;
  return files.reduce((sum, f) => sum + f.progress, 0) / files.length;
}

function uploadReducer(
  state: DirectUploadContext,
  action: UploadAction,
): DirectUploadContext {
  switch (action.type) {
    case 'START_UPLOAD':
      return {
        ...INITIAL_STATE,
        state: 'requesting_url',
        files: action.payload.map((file) => ({
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'pending',
        })),
      };

    case 'PRESIGNED_URLS_RECEIVED':
      return {
        ...state,
        state: 'uploading_to_s3',
        files: state.files.map((file, idx) => ({
          ...file,
          s3Key: action.payload[idx]?.s3Key,
          status: 'uploading' as const,
        })),
      };

    case 'PRESIGNED_URL_ERROR':
      return { ...state, state: 'error', error: action.payload };

    case 'FILE_PROGRESS': {
      const newFiles = state.files.map((f, i) =>
        i === action.payload.index
          ? { ...f, progress: action.payload.progress }
          : f,
      );
      return {
        ...state,
        files: newFiles,
        overallProgress: calcOverall(newFiles),
      };
    }

    case 'FILE_UPLOAD_SUCCESS': {
      const newFiles = state.files.map((f, i) =>
        i === action.payload.index
          ? {
              ...f,
              status: 'success' as const,
              progress: 100,
              s3Key: action.payload.s3Key,
            }
          : f,
      );
      return {
        ...state,
        files: newFiles,
        overallProgress: calcOverall(newFiles),
      };
    }

    case 'FILE_UPLOAD_ERROR': {
      const newFiles = state.files.map((f, i) =>
        i === action.payload.index
          ? {
              ...f,
              status: 'error' as const,
              errorMessage: action.payload.error,
            }
          : f,
      );
      const allFailed = newFiles.every((f) => f.status === 'error');
      return {
        ...state,
        files: newFiles,
        ...(allFailed
          ? { state: 'error' as UploadState, error: 'All file uploads failed' }
          : {}),
      };
    }

    case 'ALL_S3_UPLOADS_COMPLETE':
      return {
        ...state,
        state: 'waiting_for_sse',
        sessionId: action.payload.sessionId,
        overallProgress: 100,
      };

    case 'SSE_PROCESSING_UPDATE':
      // Optionally surface backend processing progress (0-100)
      return { ...state, overallProgress: action.payload.progress };

    case 'SSE_SUCCESS':
      return {
        ...state,
        state: 'success',
        completedUrls: action.payload.urls,
      };

    case 'SSE_ERROR':
      return { ...state, state: 'error', error: action.payload };

    case 'SSE_TIMEOUT':
      return {
        ...state,
        state: 'error',
        // Intentionally descriptive: files ARE on S3, just confirmation was lost.
        error:
          'Processing timed out. Your files were uploaded — they may still appear shortly.',
      };

    case 'ABORT':
      return { ...INITIAL_STATE, error: 'Upload cancelled' };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// =============================================================================
// HOOK OPTIONS
// =============================================================================

export interface UseDirectUploadOptions {
  /**
   * Base path for the SSE endpoint (appended to NEXT_PUBLIC_API_URL).
   * The hook will use: `${NEXT_PUBLIC_API_URL}${sseEndpoint}?sessionId=<id>`
   */
  sseEndpoint?: string;
  /** How long (ms) to wait for SSE "complete" before falling back to polling. */
  sseTimeout?: number;
  /** Max number of times to re-open the EventSource after an unexpected close. */
  maxSseRetries?: number;
  /** How many polling rounds to attempt after SSE timeout. Each round is 2 s. */
  maxPollAttempts?: number;
  onSuccess?: (urls: string[]) => void;
  onError?: (error: string) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useDirectUpload(options: UseDirectUploadOptions = {}) {
  const {
    sseEndpoint = '/post-medias/events',
    sseTimeout = 60_000,
    maxSseRetries = 3,
    maxPollAttempts = 30,
    onSuccess,
    onError,
  } = options;

  const [context, dispatch] = useReducer(uploadReducer, INITIAL_STATE);

  // ── Refs (no re-renders, safe to read/write in callbacks) ──────────────────
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseRetryCountRef = useRef(0);
  // Keep a live reference to context.state so SSE retry callbacks can read it
  // without capturing a stale closure value.
  const stateRef = useRef<UploadState>(context.state);
  stateRef.current = context.state;

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    if (sseTimeoutRef.current) {
      clearTimeout(sseTimeoutRef.current);
      sseTimeoutRef.current = null;
    }

    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    sseRetryCountRef.current = 0;
  }, []);

  // Ensure cleanup on unmount — prevents EventSource memory leaks.
  useEffect(() => () => cleanup(), [cleanup]);

  // ── Step 2a: Upload a single file to S3 via XHR ───────────────────────────

  /**
   * Why XHR instead of fetch()?
   * The Fetch API does not expose upload progress. XHR's `xhr.upload.onprogress`
   * is the only standard way to get granular byte-level progress events.
   *
   * CORS note: if xhr.status === 0 on error, the S3 bucket CORS policy is
   * likely missing `PUT` from AllowedMethods or the origin isn't whitelisted.
   */
  const uploadFileToS3 = useCallback(
    (file: File, uploadUrl: string, index: number): Promise<void> =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (evt) => {
          if (evt.lengthComputable) {
            dispatch({
              type: 'FILE_PROGRESS',
              payload: {
                index,
                progress: Math.round((evt.loaded / evt.total) * 100),
              },
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(
              new Error(
                `S3 responded with status ${xhr.status}: ${xhr.statusText}`,
              ),
            );
          }
        });

        xhr.addEventListener('error', () => {
          // status 0 almost always means a CORS preflight rejection.
          const msg =
            xhr.status === 0
              ? 'CORS error — verify the S3 bucket CORS config allows PUT from this origin'
              : `Network error (status ${xhr.status})`;
          reject(new Error(msg));
        });

        xhr.addEventListener('abort', () =>
          reject(new Error('Upload aborted by user')),
        );

        // Wire AbortController → XHR so abort() cancels in-flight uploads.
        abortControllerRef.current?.signal.addEventListener('abort', () =>
          xhr.abort(),
        );

        xhr.open('PUT', uploadUrl);
        // S3 presigned PUT URLs require the Content-Type used when the URL was signed.
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      }),
    [],
  );

  // ── Step 3: Polling fallback ───────────────────────────────────────────────

  /**
   * Called after SSE timeout. Polls the backend every 2 s up to `maxPollAttempts`
   * times. If the backend reports 'completed', resolves the outer promise.
   * This handles the case where: S3 upload succeeded + SSE dropped before
   * the 'complete' event arrived.
   */
  const startPollingFallback = useCallback(
    (sessionId: string): Promise<string[]> =>
      new Promise((resolve, reject) => {
        let attempts = 0;

        const poll = async () => {
          attempts++;
          try {
            const result = await postsService.pollUploadStatus(sessionId);
            if (result.status === 'completed' && result.urls) {
              dispatch({ type: 'SSE_SUCCESS', payload: { urls: result.urls } });
              resolve(result.urls);
              return;
            }
            if (result.status === 'failed') {
              dispatch({
                type: 'SSE_ERROR',
                payload: 'Backend reported processing failure',
              });
              reject(new Error('Processing failed on server'));
              return;
            }
          } catch {
            // Transient network error — keep polling
          }

          if (attempts >= maxPollAttempts) {
            dispatch({ type: 'SSE_TIMEOUT' });
            reject(new Error('Polling timeout'));
            return;
          }

          pollIntervalRef.current = setTimeout(poll, 2_000);
        };

        poll();
      }),
    [maxPollAttempts],
  );

  // ── Step 3: SSE connection ─────────────────────────────────────────────────

  /**
   * Opens an EventSource to the backend SSE endpoint keyed by `sessionId`.
   * Returns a Promise that resolves with the final CDN URLs from "complete".
   *
   * Retry: on unexpected close we exponentially back-off and re-open the
   * connection up to `maxSseRetries` times.
   * Timeout: if the "complete" event hasn't arrived within `sseTimeout` ms,
   * we close the EventSource and fall back to polling.
   */
  const establishSSEConnection = useCallback(
    (sessionId: string): Promise<string[]> =>
      new Promise((resolve, reject) => {
        // Guard: don't open if the component unmounted or user aborted.
        if (stateRef.current === 'idle' || stateRef.current === 'error') {
          reject(new Error('Upload was aborted'));
          return;
        }

        // Set the overall SSE deadline timer.
        sseTimeoutRef.current = setTimeout(async () => {
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
          try {
            const urls = await startPollingFallback(sessionId);
            resolve(urls);
          } catch (err) {
            reject(err);
          }
        }, sseTimeout);

        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
        const url = `${apiBase}${sseEndpoint}?sessionId=${encodeURIComponent(sessionId)}`;

        const eventSource = new EventSource(url, { withCredentials: true });
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          sseRetryCountRef.current = 0; // Reset counter on successful open
        };

        // Optional: backend emits incremental processing progress
        eventSource.addEventListener('processing', (evt) => {
          try {
            const data = JSON.parse((evt as MessageEvent).data);
            if (typeof data.progress === 'number') {
              dispatch({
                type: 'SSE_PROCESSING_UPDATE',
                payload: { progress: data.progress },
              });
            }
          } catch {
            // Malformed event — not fatal
          }
        });

        // Terminal success event
        eventSource.addEventListener('complete', (evt) => {
          try {
            const data = JSON.parse((evt as MessageEvent).data);
            if (sseTimeoutRef.current) {
              clearTimeout(sseTimeoutRef.current);
              sseTimeoutRef.current = null;
            }
            eventSource.close();
            dispatch({
              type: 'SSE_SUCCESS',
              payload: { urls: data.urls ?? [] },
            });
            resolve(data.urls ?? []);
          } catch {
            reject(new Error('Malformed SSE "complete" event'));
          }
        });

        // Terminal error event sent by the server intentionally
        eventSource.addEventListener('error-event', (evt) => {
          const data = JSON.parse((evt as MessageEvent).data ?? '{}');
          eventSource.close();
          dispatch({
            type: 'SSE_ERROR',
            payload: data.message ?? 'Server reported a processing error',
          });
          reject(new Error(data.message ?? 'Server processing error'));
        });

        // Connection-level error (network drop, server restart, etc.)
        eventSource.onerror = () => {
          if (eventSource.readyState === EventSource.CLOSED) {
            if (stateRef.current !== 'waiting_for_sse') {
              // Already resolved/aborted — do nothing
              return;
            }

            if (sseRetryCountRef.current < maxSseRetries) {
              sseRetryCountRef.current++;
              const backoffMs = Math.min(
                1000 * Math.pow(2, sseRetryCountRef.current),
                16_000, // cap at 16 s
              );
              setTimeout(() => {
                if (stateRef.current === 'waiting_for_sse') {
                  // Re-open the connection — reuse the outer promise
                  establishSSEConnection(sessionId).then(resolve).catch(reject);
                }
              }, backoffMs);
            } else {
              // Max retries exhausted — fall through to polling
              if (sseTimeoutRef.current) {
                clearTimeout(sseTimeoutRef.current);
                sseTimeoutRef.current = null;
              }
              startPollingFallback(sessionId).then(resolve).catch(reject);
            }
          }
        };
      }),
    [sseEndpoint, sseTimeout, maxSseRetries, startPollingFallback],
  );

  // ── Main upload orchestrator ───────────────────────────────────────────────

  const upload = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (files.length === 0) throw new Error('No files provided');

      // ── Double-submit guard ──────────────────────────────────────────────
      if (
        stateRef.current !== 'idle' &&
        stateRef.current !== 'success' &&
        stateRef.current !== 'error'
      ) {
        console.warn('[useDirectUpload] Upload already in progress — ignoring');
        return [];
      }

      cleanup();
      abortControllerRef.current = new AbortController();

      dispatch({ type: 'START_UPLOAD', payload: files });

      try {
        // ── Step 1: Fetch presigned URLs ─────────────────────────────────
        const { sessionId, presignedUrls } =
          await postsService.getPresignedUrls(
            files.map((f) => ({
              filename: f.name,
              contentType: f.type,
              size: f.size,
            })),
            abortControllerRef.current.signal,
          );

        dispatch({ type: 'PRESIGNED_URLS_RECEIVED', payload: presignedUrls });

        // ── Step 2: Upload all files to S3 in parallel via XHR ──────────
        const results = await Promise.allSettled(
          files.map(async (file, index) => {
            try {
              await uploadFileToS3(file, presignedUrls[index].uploadUrl, index);
              dispatch({
                type: 'FILE_UPLOAD_SUCCESS',
                payload: { index, s3Key: presignedUrls[index].s3Key },
              });
              return presignedUrls[index].s3Key;
            } catch (err) {
              dispatch({
                type: 'FILE_UPLOAD_ERROR',
                payload: {
                  index,
                  error: err instanceof Error ? err.message : 'Upload failed',
                },
              });
              throw err;
            }
          }),
        );

        const successfulKeys = results
          .filter(
            (r): r is PromiseFulfilledResult<string> =>
              r.status === 'fulfilled',
          )
          .map((r) => r.value);

        if (successfulKeys.length === 0) {
          throw new Error('All file uploads failed');
        }

        dispatch({
          type: 'ALL_S3_UPLOADS_COMPLETE',
          payload: { sessionId },
        });

        // ── Step 2b: Notify backend that S3 uploads are done ────────────
        await postsService.notifyUploadsComplete(
          sessionId,
          successfulKeys,
          abortControllerRef.current?.signal,
        );

        // ── Step 3: Wait for SSE backend confirmation ────────────────────
        const urls = await establishSSEConnection(sessionId);

        onSuccess?.(urls);
        return urls;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        if (message !== 'Upload aborted by user') {
          dispatch({ type: 'PRESIGNED_URL_ERROR', payload: message });
          onError?.(message);
        }
        throw err;
      }
    },
    [cleanup, uploadFileToS3, establishSSEConnection, onSuccess, onError],
  );

  // ── Public controls ────────────────────────────────────────────────────────

  const abort = useCallback(() => {
    cleanup();
    dispatch({ type: 'ABORT' });
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    dispatch({ type: 'RESET' });
  }, [cleanup]);

  // ── Computed helpers ───────────────────────────────────────────────────────

  const isUploading =
    context.state === 'requesting_url' ||
    context.state === 'uploading_to_s3' ||
    context.state === 'waiting_for_sse';

  return {
    // State
    uploadState: context.state,
    files: context.files,
    overallProgress: context.overallProgress,
    error: context.error,
    completedUrls: context.completedUrls,
    sessionId: context.sessionId,

    // Computed
    isUploading,
    canRetry: context.state === 'error',

    // Actions
    upload,
    abort,
    reset,
  };
}
