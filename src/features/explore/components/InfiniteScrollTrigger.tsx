'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  loading: boolean;
  error?: string | null;
  onLoadMore: () => void;
  onRetry?: () => void;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({
  hasMore,
  loading,
  error,
  onLoadMore,
  onRetry,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !loading && !error) {
        onLoadMore();
      }
    },
    [hasMore, loading, error, onLoadMore],
  );

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      rootMargin: '100px', // Start loading 100px before reaching the trigger
    });

    observerRef.current.observe(trigger);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  if (!hasMore && !loading && !error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 text-sm">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>You've reached the end</span>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="inline-flex flex-col items-center gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">
              Failed to load more content
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {error}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw size={14} className="mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Loading more content...
          </span>
        </div>
      </div>
    );
  }

  // Invisible trigger element
  return (
    <div ref={triggerRef} className={`h-4 ${className}`} aria-hidden="true" />
  );
};
