'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance optimization hook for Reels feed
 * Handles preloading, memory management, and smooth scrolling
 */

interface UseReelsPerformanceOptions {
  preloadDistance?: number; // Number of videos to preload ahead
  maxCachedVideos?: number; // Maximum videos to keep in memory
  enablePreloading?: boolean;
  enableVirtualization?: boolean;
}

export const useReelsPerformance = (
  videos: any[],
  currentIndex: number,
  options: UseReelsPerformanceOptions = {},
) => {
  const {
    preloadDistance = 3,
    maxCachedVideos = 10,
    enablePreloading = true,
    enableVirtualization = false,
  } = options;

  const preloadedVideos = useRef<Set<string>>(new Set());
  const videoElements = useRef<Map<string, HTMLVideoElement>>(new Map());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Preload videos near current position
  const preloadVideo = useCallback(
    (videoUrl: string, videoId: string) => {
      if (!enablePreloading || preloadedVideos.current.has(videoId)) return;

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = videoUrl;
      video.muted = true;

      // Store reference
      videoElements.current.set(videoId, video);
      preloadedVideos.current.add(videoId);

      // Cleanup when video is ready
      video.addEventListener('loadeddata', () => {
        // Video is ready for smooth playback
      });

      video.addEventListener('error', () => {
        // Handle preload error
        preloadedVideos.current.delete(videoId);
        videoElements.current.delete(videoId);
      });

      // Start preloading
      video.load();
    },
    [enablePreloading],
  );

  // Manage video preloading based on current position
  useEffect(() => {
    if (!enablePreloading) return;

    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(
      videos.length - 1,
      currentIndex + preloadDistance,
    );

    // Preload videos in range
    for (let i = startIndex; i <= endIndex; i++) {
      const video = videos[i];
      if (video) {
        preloadVideo(video.videoUrl, video.id);
      }
    }

    // Cleanup videos outside range
    const videosToCleanup: string[] = [];
    preloadedVideos.current.forEach((videoId) => {
      const videoIndex = videos.findIndex((v) => v.id === videoId);
      if (videoIndex < startIndex - 2 || videoIndex > endIndex + 2) {
        videosToCleanup.push(videoId);
      }
    });

    videosToCleanup.forEach((videoId) => {
      const videoElement = videoElements.current.get(videoId);
      if (videoElement) {
        videoElement.src = '';
        videoElement.remove();
      }
      videoElements.current.delete(videoId);
      preloadedVideos.current.delete(videoId);
    });
  }, [currentIndex, videos, preloadDistance, preloadVideo]);

  // Memory management - limit cached videos
  useEffect(() => {
    if (preloadedVideos.current.size > maxCachedVideos) {
      const videosArray = Array.from(preloadedVideos.current);
      const videosToRemove = videosArray.slice(
        0,
        videosArray.length - maxCachedVideos,
      );

      videosToRemove.forEach((videoId) => {
        const videoElement = videoElements.current.get(videoId);
        if (videoElement) {
          videoElement.src = '';
          videoElement.remove();
        }
        videoElements.current.delete(videoId);
        preloadedVideos.current.delete(videoId);
      });
    }
  }, [preloadedVideos.current.size, maxCachedVideos]);

  // Get preloaded video element
  const getPreloadedVideo = useCallback(
    (videoId: string): HTMLVideoElement | null => {
      return videoElements.current.get(videoId) || null;
    },
    [],
  );

  // Check if video is preloaded
  const isVideoPreloaded = useCallback((videoId: string): boolean => {
    return preloadedVideos.current.has(videoId);
  }, []);

  // Virtualization - calculate visible range
  const getVisibleRange = useCallback(
    (containerHeight: number, itemHeight: number, scrollTop: number) => {
      if (!enableVirtualization) {
        return { start: 0, end: videos.length - 1 };
      }

      const start = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const end = Math.min(start + visibleCount + 2, videos.length - 1); // +2 for buffer

      return { start: Math.max(0, start - 1), end }; // -1 for buffer
    },
    [enableVirtualization, videos.length],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      videoElements.current.forEach((video) => {
        video.src = '';
        video.remove();
      });
      videoElements.current.clear();
      preloadedVideos.current.clear();
    };
  }, []);

  return {
    preloadVideo,
    getPreloadedVideo,
    isVideoPreloaded,
    getVisibleRange,
    preloadedCount: preloadedVideos.current.size,
  };
};
