'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReelsVideo } from '../types/reels';

/**
 * Video Preloader Hook for Reels
 * Intelligent preloading strategy for smooth video transitions
 */

interface UseVideoPreloaderOptions {
  preloadRange?: number; // Number of videos to preload before/after current
  maxPreloadedVideos?: number; // Maximum videos to keep preloaded
  preloadQuality?: 'low' | 'medium' | 'high'; // Quality for preloading
  enableAdaptive?: boolean; // Adapt based on connection speed
  memoryThreshold?: number; // MB - cleanup when exceeded
  debugMode?: boolean;
}

interface PreloadedVideo {
  videoId: string;
  url: string;
  element: HTMLVideoElement;
  loadedBytes: number;
  totalBytes: number;
  loadProgress: number; // 0-100
  loadStartTime: number;
  isFullyLoaded: boolean;
  quality: string;
}

interface ConnectionInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

export const useVideoPreloader = (
  videos: ReelsVideo[],
  currentIndex: number,
  options: UseVideoPreloaderOptions = {},
) => {
  const {
    preloadRange = 2, // Preload 2 videos before/after
    maxPreloadedVideos = 5,
    preloadQuality = 'medium',
    enableAdaptive = true,
    memoryThreshold = 100, // 100MB
    debugMode = false,
  } = options;

  // State management
  const [preloadedVideos, setPreloadedVideos] = useState<
    Map<string, PreloadedVideo>
  >(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const [totalMemoryUsage, setTotalMemoryUsage] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
    null,
  );

  // Refs
  const preloadQueueRef = useRef<string[]>([]);
  const preloadingRef = useRef<Set<string>>(new Set());
  const memoryMonitorRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  const debugLog = useCallback(
    (message: string, data?: any) => {
      if (debugMode) {
        console.log(`[VideoPreloader] ${message}`, data);
      }
    },
    [debugMode],
  );

  // Get connection information
  const getConnectionInfo = useCallback((): ConnectionInfo => {
    const nav = navigator as any;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 1,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false,
      };
    }

    return {
      effectiveType: 'unknown',
      downlink: 1,
      rtt: 100,
      saveData: false,
    };
  }, []);

  // Get optimal quality based on connection
  const getOptimalQuality = useCallback(
    (baseQuality: string): string => {
      if (!enableAdaptive || !connectionInfo) return baseQuality;

      const { effectiveType, saveData, downlink } = connectionInfo;

      if (saveData) return '360p';

      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return '360p';
        case '3g':
          return downlink > 1 ? '480p' : '360p';
        case '4g':
          return downlink > 5 ? '720p' : '480p';
        default:
          return baseQuality === 'low'
            ? '360p'
            : baseQuality === 'medium'
              ? '480p'
              : '720p';
      }
    },
    [enableAdaptive, connectionInfo],
  );

  // Calculate video priority for preloading
  const calculatePreloadPriority = useCallback(
    (videoIndex: number): number => {
      const distance = Math.abs(videoIndex - currentIndex);

      if (distance === 0) return 100; // Current video
      if (distance === 1) return 80; // Next/prev video
      if (distance === 2) return 60; // Two videos away
      if (distance <= preloadRange) return 40; // Within range

      return 0; // Don't preload
    },
    [currentIndex, preloadRange],
  );

  // Estimate memory usage of a video
  const estimateVideoMemory = useCallback(
    (video: ReelsVideo, quality: string): number => {
      // Rough estimation based on quality and duration
      const qualityMultiplier =
        {
          '360p': 1,
          '480p': 2,
          '720p': 4,
          '1080p': 8,
        }[quality] || 2;

      const durationMinutes = video.duration / 60;
      return durationMinutes * qualityMultiplier * 10; // ~10MB per minute for 480p
    },
    [],
  );

  // Create preload video element
  const createPreloadElement = useCallback(
    (video: ReelsVideo, quality: string): HTMLVideoElement => {
      const element = document.createElement('video');

      // Set attributes for preloading
      element.preload = 'metadata';
      element.muted = true;
      element.playsInline = true;
      element.crossOrigin = 'anonymous';

      // Set video source based on quality
      const videoUrl =
        video.qualities?.[quality as keyof typeof video.qualities] ||
        video.videoUrl;
      element.src = videoUrl;

      // Add data attributes
      element.setAttribute('data-video-id', video.id);
      element.setAttribute('data-preload-quality', quality);

      debugLog(`Created preload element: ${video.id}`, {
        quality,
        url: videoUrl,
      });

      return element;
    },
    [debugLog],
  );

  // Monitor memory usage
  const updateMemoryUsage = useCallback(() => {
    let totalMemory = 0;

    preloadedVideos.forEach((preloaded) => {
      totalMemory += preloaded.loadedBytes / (1024 * 1024); // Convert to MB
    });

    setTotalMemoryUsage(totalMemory);

    if (totalMemory > memoryThreshold) {
      debugLog(`Memory threshold exceeded: ${totalMemory.toFixed(2)}MB`, {
        threshold: memoryThreshold,
      });
      cleanupOldVideos();
    }
  }, [preloadedVideos, memoryThreshold, debugLog]);

  // Cleanup old preloaded videos
  const cleanupOldVideos = useCallback(() => {
    const videosToRemove: string[] = [];
    const currentTime = Date.now();

    // Sort by distance from current index and age
    const sortedVideos = Array.from(preloadedVideos.entries())
      .map(([videoId, preloaded]) => {
        const videoIndex = videos.findIndex((v) => v.id === videoId);
        const distance = Math.abs(videoIndex - currentIndex);
        const age = currentTime - preloaded.loadStartTime;

        return { videoId, distance, age, preloaded };
      })
      .sort((a, b) => {
        // Prioritize by distance, then by age
        if (a.distance !== b.distance) return b.distance - a.distance;
        return b.age - a.age;
      });

    // Remove videos that are far from current position
    sortedVideos.forEach(({ videoId, distance }) => {
      if (distance > preloadRange * 2 && videosToRemove.length < 2) {
        videosToRemove.push(videoId);
      }
    });

    // Remove videos if we have too many
    if (preloadedVideos.size > maxPreloadedVideos) {
      const excessCount = preloadedVideos.size - maxPreloadedVideos;
      const additionalRemoval = sortedVideos
        .slice(0, excessCount)
        .map((item) => item.videoId)
        .filter((id) => !videosToRemove.includes(id));

      videosToRemove.push(...additionalRemoval);
    }

    // Perform cleanup
    videosToRemove.forEach((videoId) => {
      const preloaded = preloadedVideos.get(videoId);
      if (preloaded) {
        preloaded.element.src = '';
        preloaded.element.load(); // Release memory

        setPreloadedVideos((prev) => {
          const newMap = new Map(prev);
          newMap.delete(videoId);
          return newMap;
        });

        debugLog(`Cleaned up preloaded video: ${videoId}`);
      }
    });
  }, [
    preloadedVideos,
    videos,
    currentIndex,
    preloadRange,
    maxPreloadedVideos,
    debugLog,
  ]);

  // Preload a specific video
  const preloadVideo = useCallback(
    async (video: ReelsVideo): Promise<void> => {
      if (
        preloadingRef.current.has(video.id) ||
        preloadedVideos.has(video.id)
      ) {
        return; // Already preloading or preloaded
      }

      try {
        preloadingRef.current.add(video.id);
        setIsPreloading(true);

        const quality = getOptimalQuality(preloadQuality);
        const element = createPreloadElement(video, quality);
        const estimatedMemory = estimateVideoMemory(video, quality);

        debugLog(`Starting preload: ${video.id}`, { quality, estimatedMemory });

        // Create preloaded video object
        const preloadedVideo: PreloadedVideo = {
          videoId: video.id,
          url: element.src,
          element,
          loadedBytes: 0,
          totalBytes: 0,
          loadProgress: 0,
          loadStartTime: Date.now(),
          isFullyLoaded: false,
          quality,
        };

        // Set up progress tracking
        const updateProgress = () => {
          const buffered = element.buffered;
          if (buffered.length > 0) {
            const loadedSeconds = buffered.end(buffered.length - 1);
            const progress = (loadedSeconds / video.duration) * 100;

            preloadedVideo.loadProgress = Math.min(progress, 100);
            preloadedVideo.loadedBytes = estimatedMemory * (progress / 100);

            if (progress >= 25) {
              // Consider 25% as sufficient for smooth playback
              preloadedVideo.isFullyLoaded = true;
              debugLog(`Video preloaded: ${video.id}`, {
                progress: `${progress.toFixed(1)}%`,
              });
            }
          }
        };

        // Event listeners
        element.addEventListener('loadstart', () => {
          debugLog(`Load started: ${video.id}`);
        });

        element.addEventListener('progress', updateProgress);
        element.addEventListener('canplay', updateProgress);

        element.addEventListener('error', (error) => {
          debugLog(`Preload error: ${video.id}`, error);
          preloadingRef.current.delete(video.id);
        });

        element.addEventListener('loadedmetadata', () => {
          preloadedVideo.totalBytes = estimatedMemory;
          updateProgress();
        });

        // Start loading
        element.load();

        // Add to preloaded videos
        setPreloadedVideos((prev) =>
          new Map(prev).set(video.id, preloadedVideo),
        );
      } catch (error) {
        debugLog(`Failed to preload video: ${video.id}`, error);
      } finally {
        preloadingRef.current.delete(video.id);

        // Update preloading status
        if (preloadingRef.current.size === 0) {
          setIsPreloading(false);
        }
      }
    },
    [
      preloadedVideos,
      getOptimalQuality,
      preloadQuality,
      createPreloadElement,
      estimateVideoMemory,
      debugLog,
    ],
  );

  // Update preload queue based on current index
  const updatePreloadQueue = useCallback(() => {
    const queue: string[] = [];

    // Add videos within preload range, prioritized by distance
    for (let i = -preloadRange; i <= preloadRange; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < videos.length) {
        const video = videos[index];
        if (video && !preloadedVideos.has(video.id)) {
          queue.push(video.id);
        }
      }
    }

    // Sort by priority (distance from current)
    queue.sort((a, b) => {
      const indexA = videos.findIndex((v) => v.id === a);
      const indexB = videos.findIndex((v) => v.id === b);
      const distanceA = Math.abs(indexA - currentIndex);
      const distanceB = Math.abs(indexB - currentIndex);
      return distanceA - distanceB;
    });

    preloadQueueRef.current = queue;
    debugLog(`Updated preload queue`, {
      queue: queue.slice(0, 3),
      currentIndex,
    });
  }, [currentIndex, preloadRange, videos, preloadedVideos, debugLog]);

  // Process preload queue
  const processPreloadQueue = useCallback(async () => {
    if (
      preloadQueueRef.current.length === 0 ||
      preloadingRef.current.size >= 2
    ) {
      return; // No videos to preload or already preloading enough
    }

    const videoId = preloadQueueRef.current.shift();
    if (!videoId) return;

    const video = videos.find((v) => v.id === videoId);
    if (video) {
      await preloadVideo(video);
    }
  }, [videos, preloadVideo]);

  // Initialize connection monitoring
  useEffect(() => {
    const info = getConnectionInfo();
    setConnectionInfo(info);
    debugLog('Connection info', info);

    const updateConnection = () => {
      const newInfo = getConnectionInfo();
      setConnectionInfo(newInfo);
      debugLog('Connection changed', newInfo);
    };

    const nav = navigator as any;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, [getConnectionInfo, debugLog]);

  // Update preload queue when current index changes
  useEffect(() => {
    updatePreloadQueue();
  }, [updatePreloadQueue]);

  // Process preload queue periodically
  useEffect(() => {
    const interval = setInterval(() => {
      processPreloadQueue();
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [processPreloadQueue]);

  // Monitor memory usage
  useEffect(() => {
    memoryMonitorRef.current = setInterval(updateMemoryUsage, 5000); // Check every 5 seconds

    return () => {
      if (memoryMonitorRef.current) {
        clearInterval(memoryMonitorRef.current);
      }
    };
  }, [updateMemoryUsage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all preloaded videos
      preloadedVideos.forEach((preloaded) => {
        preloaded.element.src = '';
        preloaded.element.load();
      });

      preloadedVideos.clear();
      preloadingRef.current.clear();

      debugLog('Video preloader cleaned up');
    };
  }, [preloadedVideos, debugLog]);

  // Get preloaded video element
  const getPreloadedVideo = useCallback(
    (videoId: string): HTMLVideoElement | null => {
      const preloaded = preloadedVideos.get(videoId);
      return preloaded?.element || null;
    },
    [preloadedVideos],
  );

  return {
    // State
    preloadedVideos: Array.from(preloadedVideos.values()),
    isPreloading,
    totalMemoryUsage,
    connectionInfo,

    // Methods
    getPreloadedVideo,
    cleanupOldVideos,

    // Status
    isVideoPreloaded: (videoId: string) => preloadedVideos.has(videoId),
    getPreloadProgress: (videoId: string) =>
      preloadedVideos.get(videoId)?.loadProgress || 0,
    getPreloadedCount: () => preloadedVideos.size,
  };
};
