'use client';

import { useState, useCallback } from 'react';
import { STORY_ERRORS } from '../constants';

export interface StoryErrorState {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
  lastErrorTime: number | null;
}

export interface UseStoryErrorHandlerReturn {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  retry: (retryFn: () => Promise<void> | void) => Promise<void>;
  canRetry: boolean;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000; // 1 second

export const useStoryErrorHandler = (): UseStoryErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<StoryErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastErrorTime: null,
  });

  const setError = useCallback((error: string | null) => {
    setErrorState((prev) => ({
      ...prev,
      error,
      lastErrorTime: error ? Date.now() : null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastErrorTime: null,
    });
  }, []);

  const handleError = useCallback((error: unknown, context?: string) => {
    let errorMessage: string = STORY_ERRORS.NETWORK_ERROR;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Add context if provided
    const finalMessage = context ? `${context}: ${errorMessage}` : errorMessage;

    setErrorState((prev) => ({
      ...prev,
      error: finalMessage,
      lastErrorTime: Date.now(),
    }));

    // Log error for debugging
    console.error('Story Error:', {
      error,
      context,
      message: finalMessage,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const retry = useCallback(
    async (retryFn: () => Promise<void> | void) => {
      if (errorState.retryCount >= MAX_RETRY_COUNT) {
        console.warn('Max retry count reached');
        return;
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
      }));

      try {
        // Add delay before retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

        await retryFn();

        // Success - clear error
        clearError();
      } catch (retryError) {
        // Retry failed - increment count and set new error
        setErrorState((prev) => ({
          ...prev,
          isRetrying: false,
          retryCount: prev.retryCount + 1,
          error:
            retryError instanceof Error ? retryError.message : 'Retry failed',
          lastErrorTime: Date.now(),
        }));

        console.error('Retry failed:', retryError);
      }
    },
    [errorState.retryCount, clearError],
  );

  const canRetry =
    errorState.retryCount < MAX_RETRY_COUNT && !errorState.isRetrying;

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    setError,
    clearError,
    handleError,
    retry,
    canRetry,
  };
};

// Specialized hook for async operations with automatic error handling
export const useStoryAsyncOperation = () => {
  const errorHandler = useStoryErrorHandler();
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: string,
    ): Promise<T | null> => {
      try {
        setLoading(true);
        errorHandler.clearError();

        const result = await operation();
        return result;
      } catch (error) {
        errorHandler.handleError(error, context);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [errorHandler],
  );

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: string,
    ): Promise<T | null> => {
      const result = await execute(operation, context);

      if (result === null && errorHandler.canRetry) {
        // Auto-retry once for network errors
        await errorHandler.retry(async () => {
          await execute(operation, context);
        });
        // After retry, try to get the result again
        return await execute(operation, context);
      }

      return result;
    },
    [execute, errorHandler],
  );

  return {
    ...errorHandler,
    loading,
    execute,
    executeWithRetry,
  };
};
