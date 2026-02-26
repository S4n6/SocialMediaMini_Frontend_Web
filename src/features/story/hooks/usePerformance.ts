'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

// Hook đơn giản để theo dõi performance
export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  // Đếm số lần render
  renderCount.current += 1;

  // Log performance trong development
  if (process.env.NODE_ENV === 'development') {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (renderCount.current > 1 && timeSinceLastRender < 100) {
      console.warn(
        `⚠️ ${componentName} re-rendered ${renderCount.current} times (${timeSinceLastRender}ms ago)`,
      );
    }

    lastRenderTime.current = now;
  }

  return {
    renderCount: renderCount.current,
  };
};

// Hook debounce đơn giản
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook để optimize callbacks
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
): T => {
  const ref = useRef(callback);
  ref.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []) as T;
};

// Hook lazy loading đơn giản
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useMemo(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return { isVisible, elementRef, hasLoaded };
};
