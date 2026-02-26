import React, { Suspense } from "react";
import { AsyncState, PaginatedState, RequestState } from "@/types/api";
import { PostListSkeleton, PostSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingWrapperProps<T> {
  state: AsyncState<T>;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: (error: string, retry?: () => void) => React.ReactNode;
  onRetry?: () => void;
}

/**
 * Generic loading wrapper component
 */
export function LoadingWrapper<T>({
  state,
  children,
  fallback,
  errorFallback,
  onRetry,
}: LoadingWrapperProps<T>) {
  if (state.isLoading && !state.data) {
    return <>{fallback || <div>Loading...</div>}</>;
  }

  if (state.error) {
    if (errorFallback) {
      return <>{errorFallback(state.error, onRetry)}</>;
    }

    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center justify-center text-center space-y-3">
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">{state.error}</p>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!state.data) {
    return <div>No data available</div>;
  }

  return <>{children(state.data)}</>;
}

interface PaginatedLoadingWrapperProps<T> {
  state: PaginatedState<T>;
  children: (data: T[]) => React.ReactNode;
  fallback?: React.ReactNode;
  loadMoreFallback?: React.ReactNode;
  errorFallback?: (error: string, retry?: () => void) => React.ReactNode;
  onRetry?: () => void;
  onLoadMore?: () => void;
}

/**
 * Paginated loading wrapper component
 */
export function PaginatedLoadingWrapper<T>({
  state,
  children,
  fallback,
  errorFallback,
  onRetry,
  onLoadMore,
}: PaginatedLoadingWrapperProps<T>) {
  if (state.isLoading && state.data.length === 0) {
    return <>{fallback || <PostListSkeleton />}</>;
  }

  if (state.error && state.data.length === 0) {
    if (errorFallback) {
      return <>{errorFallback(state.error, onRetry)}</>;
    }

    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center justify-center text-center space-y-3">
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Failed to load</h4>
              <p className="text-sm text-red-600 mt-1">{state.error}</p>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {children(state.data)}

      {/* Load More Section */}
      {state.hasMore && (
        <div className="flex justify-center pt-4">
          {state.isLoading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading more...</span>
            </div>
          ) : (
            <Button
              onClick={onLoadMore}
              variant="outline"
              disabled={state.isLoading}
            >
              Load More
            </Button>
          )}
        </div>
      )}

      {/* Load More Error */}
      {state.error && state.data.length > 0 && (
        <div className="flex justify-center pt-4">
          <Card className="p-3 border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Failed to load more</span>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="ghost"
                  className="text-red-700 hover:bg-red-100 h-auto p-1"
                >
                  Retry
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface RequestLoadingProps {
  state: RequestState;
  children: React.ReactNode;
  loadingText?: string;
  successMessage?: string;
}

/**
 * Request loading wrapper for forms and mutations
 */
export function RequestLoadingWrapper({
  state,
  children,
  loadingText = "Processing...",
  successMessage,
}: RequestLoadingProps) {
  return (
    <div className="relative">
      {children}

      {state.isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText}</span>
          </div>
        </div>
      )}

      {state.isSuccess && successMessage && (
        <div className="mt-2 text-green-600 text-sm">{successMessage}</div>
      )}

      {state.error && (
        <div className="mt-2 text-red-600 text-sm">{state.error}</div>
      )}
    </div>
  );
}

/**
 * Higher-order component for lazy loading with custom fallback
 */
export function withLazyLoading<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: T) {
    return (
      <Suspense fallback={fallback || <PostSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Infinite scroll loading indicator
 */
export function InfiniteScrollLoader({
  isLoading,
  hasMore,
  error,
  onRetry,
}: {
  isLoading: boolean;
  hasMore: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  if (!hasMore) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No more content to load</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <Card className="inline-block p-3 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load more</span>
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="ghost"
                className="text-red-700 hover:bg-red-100 h-auto p-1"
              >
                Retry
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading more content...</span>
        </div>
      </div>
    );
  }

  return null;
}
