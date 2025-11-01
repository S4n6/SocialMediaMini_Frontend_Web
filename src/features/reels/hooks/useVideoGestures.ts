'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for handling video gesture controls
 * Instagram 2025 style gestures: tap to pause/play, double tap controls, swipe volume
 */

interface UseVideoGesturesOptions {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onSwipeUp?: (distance: number) => void;
  onSwipeDown?: (distance: number) => void;
  onSwipeLeft?: (distance: number) => void;
  onSwipeRight?: (distance: number) => void;
  enableVolumeSwipe?: boolean;
  enableSeekSwipe?: boolean;
  swipeThreshold?: number;
  doubleTapDelay?: number;
}

export const useVideoGestures = (
  elementRef: React.RefObject<HTMLElement>,
  options: UseVideoGesturesOptions = {},
) => {
  const {
    onTap,
    onDoubleTap,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    enableVolumeSwipe = true,
    enableSeekSwipe = true,
    swipeThreshold = 50,
    doubleTapDelay = 300,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const isSwipe = distance > swipeThreshold;
      const isTap = distance < 20 && deltaTime < 500;

      if (isSwipe) {
        // Determine swipe direction
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.(deltaX);
          } else {
            onSwipeLeft?.(Math.abs(deltaX));
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.(deltaY);
          } else {
            onSwipeUp?.(Math.abs(deltaY));
          }
        }
      } else if (isTap) {
        // Handle tap or double tap
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < doubleTapDelay) {
          // Double tap detected
          if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;
          }
          onDoubleTap?.();
        } else {
          // Single tap - wait for potential double tap
          tapTimeoutRef.current = setTimeout(() => {
            onTap?.();
            tapTimeoutRef.current = null;
          }, doubleTapDelay);
        }

        lastTapRef.current = now;
      }

      touchStartRef.current = null;
    },
    [
      onTap,
      onDoubleTap,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight,
      swipeThreshold,
      doubleTapDelay,
    ],
  );

  // Handle mouse events for desktop
  const handleMouseDown = useCallback((e: MouseEvent) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = e.clientX - touchStartRef.current.x;
      const deltaY = e.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const isTap = distance < 10 && deltaTime < 500;

      if (isTap) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < doubleTapDelay) {
          // Double click detected
          if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;
          }
          onDoubleTap?.();
        } else {
          // Single click
          tapTimeoutRef.current = setTimeout(() => {
            onTap?.();
            tapTimeoutRef.current = null;
          }, doubleTapDelay);
        }

        lastTapRef.current = now;
      }

      touchStartRef.current = null;
    },
    [onTap, onDoubleTap, doubleTapDelay],
  );

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events for desktop
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    elementRef,
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseUp,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Utility functions for manual gesture handling
    simulateTap: () => onTap?.(),
    simulateDoubleTap: () => onDoubleTap?.(),
  };
};
