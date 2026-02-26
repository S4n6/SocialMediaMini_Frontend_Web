'use client';

import { useCallback, useRef } from 'react';

// Utility functions cho performance optimization

// Simple debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Throttle function (limit executions per time period)
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): T => {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

// Hook for debounced callbacks
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  ) as T;
};

// Hook for throttled callbacks
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
): T => {
  const throttling = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!throttling.current) {
        callback(...args);
        throttling.current = true;
        setTimeout(() => {
          throttling.current = false;
        }, limit);
      }
    },
    [callback, limit],
  ) as T;
};

// Story-specific optimized interactions
export const useOptimizedStoryInteractions = () => {
  // Debounce story view tracking (avoid spam)
  const debouncedViewStory = useDebouncedCallback((storyId: string) => {
    console.log('📊 Tracking story view:', storyId);
    // Call your story service here
  }, 500);

  // Throttle story navigation (prevent rapid clicking)
  const throttledNavigateStory = useThrottledCallback(
    (direction: 'next' | 'prev') => {
      console.log('➡️ Navigate story:', direction);
      // Handle story navigation
    },
    300,
  );

  // Debounce search input
  const debouncedSearch = useDebouncedCallback((query: string) => {
    console.log('🔍 Search stories:', query);
    // Call search API
  }, 400);

  // Throttle scroll events for story feeds
  const throttledScrollHandler = useThrottledCallback((scrollY: number) => {
    console.log('📜 Story feed scroll:', scrollY);
    // Handle infinite scroll loading
  }, 100);

  return {
    debouncedViewStory,
    throttledNavigateStory,
    debouncedSearch,
    throttledScrollHandler,
  };
};

// Performance measurement utilities
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};

// Memory usage monitoring (simple)
export const checkMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('💾 Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
    });
  }
};

// Bundle size optimization helper
export const lazyImport = <T>(importFn: () => Promise<T>) => {
  return importFn();
};
