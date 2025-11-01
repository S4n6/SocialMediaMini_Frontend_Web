'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook for managing vertical viewport and scroll snap behavior
 * Optimized for Instagram 2025 Reels feed with smooth scrolling
 */

interface UseVerticalViewportOptions {
  threshold?: number;
  rootMargin?: string;
  snapBehavior?: 'smooth' | 'auto';
  debounceMs?: number;
}

interface ViewportItem {
  id: string;
  index: number;
  isVisible: boolean;
  visibilityRatio: number;
}

export const useVerticalViewport = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseVerticalViewportOptions = {},
) => {
  const {
    threshold = [0.1, 0.5, 0.9],
    rootMargin = '0px',
    snapBehavior = 'smooth',
    debounceMs = 100,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<ViewportItem[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Initialize intersection observer
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const updates: ViewportItem[] = [];
        let mostVisibleIndex = 0;
        let maxVisibility = 0;

        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-video-id') || '';
          const index = parseInt(
            entry.target.getAttribute('data-index') || '0',
            10,
          );

          const item: ViewportItem = {
            id,
            index,
            isVisible: entry.intersectionRatio > 0.1,
            visibilityRatio: entry.intersectionRatio,
          };

          updates.push(item);

          // Track most visible item for current index
          if (entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            mostVisibleIndex = index;
          }
        });

        setVisibleItems(updates);

        // Update current index to most visible item
        if (maxVisibility > 0.5) {
          setCurrentIndex(mostVisibleIndex);
        }
      },
      {
        root: containerRef.current,
        rootMargin,
        threshold: Array.isArray(threshold) ? threshold : [threshold],
      },
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef, rootMargin, threshold]);

  // Register item for observation
  const registerItem = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (!observerRef.current) return;

      // Unregister previous element
      const previousElement = itemsRef.current.get(id);
      if (previousElement) {
        observerRef.current.unobserve(previousElement);
      }

      if (element) {
        itemsRef.current.set(id, element);
        observerRef.current.observe(element);
      } else {
        itemsRef.current.delete(id);
      }
    },
    [],
  );

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!containerRef.current) return;

      const targetY = index * window.innerHeight;

      containerRef.current.scrollTo({
        top: targetY,
        behavior: snapBehavior,
      });
    },
    [containerRef, snapBehavior],
  );

  // Navigate to next item
  const scrollToNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, visibleItems.length - 1);
    scrollToIndex(nextIndex);
  }, [currentIndex, visibleItems.length, scrollToIndex]);

  // Navigate to previous item
  const scrollToPrevious = useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    scrollToIndex(prevIndex);
  }, [currentIndex, scrollToIndex]);

  // Handle scroll events with debouncing
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, debounceMs);
  }, [debounceMs]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentIndex,
    visibleItems,
    isScrolling,
    registerItem,
    scrollToIndex,
    scrollToNext,
    scrollToPrevious,
    handleScroll,
  };
};
