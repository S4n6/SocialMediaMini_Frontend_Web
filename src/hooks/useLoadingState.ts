import { useState, useCallback, useRef, useEffect } from "react";
import { AsyncState, PaginatedState, RequestState } from "@/types/api";

/**
 * Hook for managing async operations with loading states
 */
export function useAsyncState<T>(initialData: T | null = null): {
  state: AsyncState<T>;
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await asyncFn();
      setState((prev) => ({ ...prev, data: result, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  return { state, execute, setData, setError, reset };
}

/**
 * Hook for managing paginated data with loading states
 */
export function usePaginatedState<T>(initialLimit: number = 10): {
  state: PaginatedState<T>;
  loadPage: (
    asyncFn: (
      page: number,
      limit: number
    ) => Promise<{
      data: T[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>
  ) => Promise<void>;
  loadMore: (
    asyncFn: (
      page: number,
      limit: number
    ) => Promise<{
      data: T[];
      pagination: any;
    }>
  ) => Promise<void>;
  reset: () => void;
  setData: (data: T[]) => void;
} {
  const [state, setState] = useState<PaginatedState<T>>({
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
    hasMore: true,
  });

  const loadPage = useCallback(
    async (
      asyncFn: (
        page: number,
        limit: number
      ) => Promise<{
        data: T[];
        pagination: any;
      }>
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const page = state.pagination?.page || 1;
        const result = await asyncFn(page, initialLimit);

        setState((prev) => ({
          ...prev,
          data: result.data,
          pagination: result.pagination,
          isLoading: false,
          hasMore: result.pagination.hasNext,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [initialLimit, state.pagination?.page]
  );

  const loadMore = useCallback(
    async (
      asyncFn: (
        page: number,
        limit: number
      ) => Promise<{
        data: T[];
        pagination: any;
      }>
    ) => {
      if (state.isLoading || !state.hasMore) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const nextPage = (state.pagination?.page || 0) + 1;
        const result = await asyncFn(nextPage, initialLimit);

        setState((prev) => ({
          ...prev,
          data: [...prev.data, ...result.data],
          pagination: result.pagination,
          isLoading: false,
          hasMore: result.pagination.hasNext,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [
      initialLimit,
      state.pagination?.page,
      state.isLoading,
      state.hasMore,
      state.data,
    ]
  );

  const reset = useCallback(() => {
    setState({
      data: [],
      pagination: null,
      isLoading: false,
      error: null,
      hasMore: true,
    });
  }, []);

  const setData = useCallback((data: T[]) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { state, loadPage, loadMore, reset, setData };
}

/**
 * Hook for managing request states (forms, mutations)
 */
export function useRequestState(): {
  state: RequestState;
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<RequestState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const execute = useCallback(async <T>(asyncFn: () => Promise<T>) => {
    setState({ isLoading: true, error: null, isSuccess: false });

    try {
      const result = await asyncFn();
      setState({ isLoading: false, error: null, isSuccess: true });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState({ isLoading: false, error: errorMessage, isSuccess: false });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, isSuccess: false });
  }, []);

  return { state, execute, reset };
}

/**
 * Hook for debounced loading states
 */
export function useDebouncedLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isLoading) {
      // Show loading immediately for better UX
      setDebouncedLoading(true);
    } else {
      // Delay hiding loading to prevent flashing
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, delay]);

  return {
    isLoading: debouncedLoading,
    setIsLoading,
  };
}

/**
 * Hook for optimistic updates with rollback
 */
export function useOptimisticState<T>(initialState: T): {
  state: T;
  optimisticUpdate: (
    newState: T,
    asyncFn: () => Promise<void>
  ) => Promise<void>;
  setState: (state: T) => void;
} {
  const [state, setState] = useState<T>(initialState);
  const [previousState, setPreviousState] = useState<T>(initialState);

  const optimisticUpdate = useCallback(
    async (newState: T, asyncFn: () => Promise<void>) => {
      // Store current state for potential rollback
      setPreviousState(state);

      // Apply optimistic update immediately
      setState(newState);

      try {
        await asyncFn();
        // Success - keep the optimistic state
        setPreviousState(newState);
      } catch (error) {
        // Error - rollback to previous state
        setState(previousState);
        throw error;
      }
    },
    [state, previousState]
  );

  return {
    state,
    optimisticUpdate,
    setState,
  };
}
