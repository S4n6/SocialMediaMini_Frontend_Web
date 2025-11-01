'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReelsVideo } from '../types/reels';

/**
 * Intelligent Auto-play Hook for Reels
 * Instagram 2025 style auto-play with intersection observer and performance optimization
 */

interface UseAutoPlayOptions {
  threshold?: number; // Percentage of video visible to trigger play (0.5 = 50%)
  rootMargin?: string; // Margin around viewport for preloading
  enablePreloading?: boolean;
  playDelay?: number; // Delay before playing (ms)
  pauseDelay?: number; // Delay before pausing (ms)
  enableBackgroundPause?: boolean; // Pause when tab not visible
  debugMode?: boolean;
}

interface VideoIntersection {
  videoId: string;
  element: HTMLVideoElement;
  isIntersecting: boolean;
  intersectionRatio: number;
  entry: IntersectionObserverEntry;
}

export const useAutoPlay = (
  videos: ReelsVideo[],
  options: UseAutoPlayOptions = {},
) => {
  const {
    threshold = 0.7, // 70% visible to play
    rootMargin = '20px', // 20px margin for preloading
    enablePreloading = true,
    playDelay = 200,
    pauseDelay = 100,
    enableBackgroundPause = true,
    debugMode = false,
  } = options;

  // State management
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [visibleVideos, setVisibleVideos] = useState<Set<string>>(new Set());
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(
    new Set(),
  );
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Refs for cleanup and timing
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const playTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pauseTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Debug logging
  const debugLog = useCallback(
    (message: string, data?: any) => {
      if (debugMode) {
        console.log(`[AutoPlay] ${message}`, data);
      }
    },
    [debugMode],
  );

  // Clear timeouts for a video
  const clearVideoTimeouts = useCallback((videoId: string) => {
    const playTimeout = playTimeoutsRef.current.get(videoId);
    const pauseTimeout = pauseTimeoutsRef.current.get(videoId);

    if (playTimeout) {
      clearTimeout(playTimeout);
      playTimeoutsRef.current.delete(videoId);
    }

    if (pauseTimeout) {
      clearTimeout(pauseTimeout);
      pauseTimeoutsRef.current.delete(videoId);
    }
  }, []);

  // Play video with delay
  const schedulePlay = useCallback(
    (videoId: string, element: HTMLVideoElement) => {
      clearVideoTimeouts(videoId);

      const timeout = setTimeout(async () => {
        try {
          // Check if video is still visible and tab is active
          if (visibleVideos.has(videoId) && isTabVisible) {
            debugLog(`Playing video: ${videoId}`);

            // Ensure video is not muted for autoplay (browser policy)
            element.muted = true;

            await element.play();
            setCurrentlyPlaying(videoId);

            // Track play event
            debugLog(`Video started: ${videoId}`, {
              currentTime: element.currentTime,
            });
          }
        } catch (error) {
          debugLog(`Failed to play video: ${videoId}`, error);
        }
      }, playDelay);

      playTimeoutsRef.current.set(videoId, timeout);
    },
    [visibleVideos, isTabVisible, playDelay, debugLog],
  );

  // Pause video with delay
  const schedulePause = useCallback(
    (videoId: string, element: HTMLVideoElement) => {
      clearVideoTimeouts(videoId);

      const timeout = setTimeout(() => {
        try {
          debugLog(`Pausing video: ${videoId}`);
          element.pause();

          if (currentlyPlaying === videoId) {
            setCurrentlyPlaying(null);
          }

          // Track pause event
          debugLog(`Video paused: ${videoId}`, {
            currentTime: element.currentTime,
          });
        } catch (error) {
          debugLog(`Failed to pause video: ${videoId}`, error);
        }
      }, pauseDelay);

      pauseTimeoutsRef.current.set(videoId, timeout);
    },
    [currentlyPlaying, pauseDelay, debugLog],
  );

  // Preload video
  const preloadVideo = useCallback(
    (videoId: string, element: HTMLVideoElement) => {
      if (!enablePreloading || preloadedVideos.has(videoId)) return;

      try {
        // Set preload attribute
        element.preload = 'metadata';

        // Load first few seconds
        element.load();

        setPreloadedVideos((prev) => new Set(prev).add(videoId));
        debugLog(`Preloaded video: ${videoId}`);
      } catch (error) {
        debugLog(`Failed to preload video: ${videoId}`, error);
      }
    },
    [enablePreloading, preloadedVideos, debugLog],
  );

  // Handle intersection changes
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const intersections: VideoIntersection[] = [];

      entries.forEach((entry) => {
        const element = entry.target as HTMLVideoElement;
        const videoId = element.getAttribute('data-video-id');

        if (!videoId) return;

        const intersection: VideoIntersection = {
          videoId,
          element,
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          entry,
        };

        intersections.push(intersection);

        debugLog(`Intersection change: ${videoId}`, {
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
          threshold,
        });

        // Update visible videos
        setVisibleVideos((prev) => {
          const newSet = new Set(prev);

          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            newSet.add(videoId);
          } else {
            newSet.delete(videoId);
          }

          return newSet;
        });

        // Handle auto-play logic
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          // Video is sufficiently visible - schedule play
          schedulePlay(videoId, element);

          // Also preload adjacent videos
          if (enablePreloading) {
            preloadVideo(videoId, element);
          }
        } else {
          // Video is not visible enough - schedule pause
          schedulePause(videoId, element);
        }
      });

      // Ensure only one video plays at a time
      const visibleVideoIds = intersections
        .filter((i) => i.isIntersecting && i.intersectionRatio >= threshold)
        .map((i) => i.videoId);

      if (visibleVideoIds.length > 1) {
        // Multiple videos visible - play the most visible one
        const mostVisible = intersections
          .filter((i) => visibleVideoIds.includes(i.videoId))
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          // Pause others
          intersections
            .filter(
              (i) => i.videoId !== mostVisible.videoId && i.isIntersecting,
            )
            .forEach((i) => schedulePause(i.videoId, i.element));
        }
      }
    },
    [
      threshold,
      schedulePlay,
      schedulePause,
      preloadVideo,
      enablePreloading,
      debugLog,
    ],
  );

  // Initialize intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.25, 0.5, 0.75, threshold, 1.0],
      rootMargin,
    });

    intersectionObserverRef.current = observer;
    debugLog('Intersection observer initialized', { threshold, rootMargin });

    return () => {
      observer.disconnect();
      intersectionObserverRef.current = null;
      debugLog('Intersection observer cleaned up');
    };
  }, [handleIntersection, threshold, rootMargin, debugLog]);

  // Handle tab visibility changes
  useEffect(() => {
    if (!enableBackgroundPause) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);

      debugLog(`Tab visibility changed: ${isVisible ? 'visible' : 'hidden'}`);

      if (!isVisible && currentlyPlaying) {
        // Tab is hidden - pause current video
        const element = videoElementsRef.current.get(currentlyPlaying);
        if (element) {
          schedulePause(currentlyPlaying, element);
        }
      } else if (isVisible && visibleVideos.size > 0) {
        // Tab is visible again - resume most visible video
        const visibleVideoId = Array.from(visibleVideos)[0];
        const element = videoElementsRef.current.get(visibleVideoId);
        if (element) {
          schedulePlay(visibleVideoId, element);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    enableBackgroundPause,
    currentlyPlaying,
    visibleVideos,
    schedulePlay,
    schedulePause,
    debugLog,
  ]);

  // Register video element
  const registerVideo = useCallback(
    (videoId: string, element: HTMLVideoElement | null) => {
      if (!element) {
        // Cleanup
        videoElementsRef.current.delete(videoId);
        clearVideoTimeouts(videoId);
        intersectionObserverRef.current?.unobserve(element!);
        return;
      }

      // Store element reference
      videoElementsRef.current.set(videoId, element);
      element.setAttribute('data-video-id', videoId);

      // Start observing
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.observe(element);
        debugLog(`Registered video for observation: ${videoId}`);
      }

      // Preload if enabled
      if (enablePreloading) {
        preloadVideo(videoId, element);
      }
    },
    [clearVideoTimeouts, preloadVideo, enablePreloading, debugLog],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      pauseTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));

      // Clear refs
      videoElementsRef.current.clear();
      playTimeoutsRef.current.clear();
      pauseTimeoutsRef.current.clear();

      debugLog('Auto-play hook cleaned up');
    };
  }, [debugLog]);

  // Manual controls
  const playVideo = useCallback(
    async (videoId: string) => {
      const element = videoElementsRef.current.get(videoId);
      if (element) {
        clearVideoTimeouts(videoId);
        try {
          element.muted = true;
          await element.play();
          setCurrentlyPlaying(videoId);
          debugLog(`Manually played video: ${videoId}`);
        } catch (error) {
          debugLog(`Failed to manually play video: ${videoId}`, error);
        }
      }
    },
    [clearVideoTimeouts, debugLog],
  );

  const pauseVideo = useCallback(
    (videoId: string) => {
      const element = videoElementsRef.current.get(videoId);
      if (element) {
        clearVideoTimeouts(videoId);
        element.pause();
        if (currentlyPlaying === videoId) {
          setCurrentlyPlaying(null);
        }
        debugLog(`Manually paused video: ${videoId}`);
      }
    },
    [clearVideoTimeouts, currentlyPlaying, debugLog],
  );

  const pauseAll = useCallback(() => {
    videoElementsRef.current.forEach((element, videoId) => {
      clearVideoTimeouts(videoId);
      element.pause();
    });
    setCurrentlyPlaying(null);
    debugLog('Paused all videos');
  }, [clearVideoTimeouts, debugLog]);

  return {
    // State
    currentlyPlaying,
    visibleVideos: Array.from(visibleVideos),
    preloadedVideos: Array.from(preloadedVideos),
    isTabVisible,

    // Actions
    registerVideo,
    playVideo,
    pauseVideo,
    pauseAll,

    // Status
    isVideoVisible: (videoId: string) => visibleVideos.has(videoId),
    isVideoPreloaded: (videoId: string) => preloadedVideos.has(videoId),
    isVideoPlaying: (videoId: string) => currentlyPlaying === videoId,
  };
};
