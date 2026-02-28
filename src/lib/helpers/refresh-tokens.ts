import axios from 'axios';

// ── Token refresh queue ────────────────────────────────────
// Only ONE refresh request flies at a time.  Every other 401
// that fires while the request is in-flight joins the queue
// and resolves/rejects together with it.
// ───────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

export async function performTokenRefresh(): Promise<string> {
  // If a refresh is already in-flight, queue this caller
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3107/api';
    await axios.post(
      `${base}/auth/refresh`,
      {},
      {
        withCredentials: true,
        timeout: 10000,
        headers: { 'x-skip-refresh': '1' },
      },
    );

    // With HTTP-only cookies the token is set automatically by the server.
    const successIndicator = 'token-refreshed';
    processQueue(null, successIndicator);
    return successIndicator;
  } catch (err) {
    const refreshError =
      err instanceof Error ? err : new Error('Token refresh failed');
    processQueue(refreshError);
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
}

export async function refreshTokenIfNeeded(): Promise<void> {
  // With HTTP-only cookies we cannot inspect token expiry client-side.
  // The Axios 401 interceptor handles refresh automatically.
}
