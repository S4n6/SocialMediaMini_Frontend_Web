'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Performance Monitor Hook for Reels
 * Tracks video performance metrics and system resources
 */

interface PerformanceMetrics {
  // Video specific metrics
  frameDrops: number;
  averageFrameRate: number;
  loadTime: number; // Time to first frame (ms)
  bufferHealth: number; // Percentage of video buffered ahead
  playbackStalls: number; // Number of buffering events

  // System metrics
  memoryUsage: number; // MB
  cpuUsage: number; // Estimated %
  networkSpeed: number; // Mbps
  batteryLevel?: number; // 0-100%

  // User experience metrics
  timeToPlay: number; // Time from user action to play start
  watchTime: number; // Total seconds watched
  engagementRate: number; // Percentage of video watched

  // Performance scores
  overallScore: number; // 0-100
  videoQualityScore: number; // 0-100
  loadingScore: number; // 0-100
}

interface VideoPerformanceData {
  videoId: string;
  startTime: number;
  endTime?: number;
  playTime: number;
  pauseTime: number;
  metrics: PerformanceMetrics;
  events: PerformanceEvent[];
}

interface PerformanceEvent {
  type: 'play' | 'pause' | 'buffer' | 'error' | 'quality_change' | 'frame_drop';
  timestamp: number;
  data?: any;
}

interface UsePerformanceMonitorOptions {
  enableCPUMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  sampleInterval?: number; // ms
  maxEventHistory?: number;
  debugMode?: boolean;
}

export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions = {},
) => {
  const {
    enableCPUMonitoring = true,
    enableMemoryMonitoring = true,
    enableNetworkMonitoring = true,
    sampleInterval = 1000, // 1 second
    maxEventHistory = 100,
    debugMode = false,
  } = options;

  // State management
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    frameDrops: 0,
    averageFrameRate: 0,
    loadTime: 0,
    bufferHealth: 0,
    playbackStalls: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkSpeed: 0,
    timeToPlay: 0,
    watchTime: 0,
    engagementRate: 0,
    overallScore: 0,
    videoQualityScore: 0,
    loadingScore: 0,
  });

  const [videoSessions, setVideoSessions] = useState<
    Map<string, VideoPerformanceData>
  >(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs for monitoring
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const frameCountRef = useRef<
    Map<string, { frames: number; lastTime: number }>
  >(new Map());

  // Debug logging
  const debugLog = useCallback(
    (message: string, data?: any) => {
      if (debugMode) {
        console.log(`[PerformanceMonitor] ${message}`, data);
      }
    },
    [debugMode],
  );

  // Get memory usage
  const getMemoryUsage = useCallback((): number => {
    if (!enableMemoryMonitoring) return 0;

    try {
      const nav = navigator as any;
      if (nav.memory) {
        return nav.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }

      // Fallback estimation
      const perf = performance as any;
      return perf.memory?.usedJSHeapSize / (1024 * 1024) || 0;
    } catch (error) {
      return 0;
    }
  }, [enableMemoryMonitoring]);

  // Estimate CPU usage
  const estimateCPUUsage = useCallback((): number => {
    if (!enableCPUMonitoring) return 0;

    try {
      // Use performance timing to estimate CPU load
      const start = performance.now();

      // Perform a small computation
      let sum = 0;
      for (let i = 0; i < 10000; i++) {
        sum += Math.random();
      }

      const duration = performance.now() - start;

      // Estimate CPU usage based on how long the computation took
      // This is a rough approximation
      const baseline = 1; // Expected time for this computation on average CPU
      const cpuLoad = Math.min((duration / baseline) * 10, 100);

      return cpuLoad;
    } catch (error) {
      return 0;
    }
  }, [enableCPUMonitoring]);

  // Get network speed
  const getNetworkSpeed = useCallback((): number => {
    if (!enableNetworkMonitoring) return 0;

    try {
      const nav = navigator as any;
      const connection =
        nav.connection || nav.mozConnection || nav.webkitConnection;

      if (connection && connection.downlink) {
        return connection.downlink; // Mbps
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }, [enableNetworkMonitoring]);

  // Get battery level
  const getBatteryLevel = useCallback(async (): Promise<number | undefined> => {
    try {
      const nav = navigator as any;
      if (nav.getBattery) {
        const battery = await nav.getBattery();
        return battery.level * 100;
      }
    } catch (error) {
      // Battery API not supported
    }
    return undefined;
  }, []);

  // Calculate video quality score
  const calculateVideoQualityScore = useCallback(
    (frameRate: number, frameDrops: number, bufferHealth: number): number => {
      let score = 100;

      // Penalize low frame rate
      if (frameRate < 30) {
        score -= (30 - frameRate) * 2;
      }

      // Penalize frame drops
      score -= frameDrops * 5;

      // Reward good buffer health
      if (bufferHealth < 10) {
        score -= (10 - bufferHealth) * 3;
      }

      return Math.max(0, Math.min(100, score));
    },
    [],
  );

  // Calculate loading score
  const calculateLoadingScore = useCallback(
    (loadTime: number, timeToPlay: number, playbackStalls: number): number => {
      let score = 100;

      // Penalize slow load times
      if (loadTime > 2000) {
        score -= (loadTime - 2000) / 100;
      }

      // Penalize slow time to play
      if (timeToPlay > 1000) {
        score -= (timeToPlay - 1000) / 50;
      }

      // Penalize playback stalls
      score -= playbackStalls * 10;

      return Math.max(0, Math.min(100, score));
    },
    [],
  );

  // Calculate overall performance score
  const calculateOverallScore = useCallback(
    (metrics: PerformanceMetrics): number => {
      const weights = {
        videoQuality: 0.4,
        loading: 0.3,
        engagement: 0.2,
        system: 0.1,
      };

      const systemScore = Math.max(
        0,
        100 - metrics.memoryUsage / 10 - metrics.cpuUsage,
      );

      const overallScore =
        metrics.videoQualityScore * weights.videoQuality +
        metrics.loadingScore * weights.loading +
        metrics.engagementRate * weights.engagement +
        systemScore * weights.system;

      return Math.round(overallScore);
    },
    [],
  );

  // Update performance metrics
  const updateMetrics = useCallback(async () => {
    try {
      const memoryUsage = getMemoryUsage();
      const cpuUsage = estimateCPUUsage();
      const networkSpeed = getNetworkSpeed();
      const batteryLevel = await getBatteryLevel();

      setCurrentMetrics((prev) => {
        const videoQualityScore = calculateVideoQualityScore(
          prev.averageFrameRate,
          prev.frameDrops,
          prev.bufferHealth,
        );

        const loadingScore = calculateLoadingScore(
          prev.loadTime,
          prev.timeToPlay,
          prev.playbackStalls,
        );

        const updatedMetrics = {
          ...prev,
          memoryUsage,
          cpuUsage,
          networkSpeed,
          batteryLevel,
          videoQualityScore,
          loadingScore,
        };

        updatedMetrics.overallScore = calculateOverallScore(updatedMetrics);

        return updatedMetrics;
      });

      debugLog('Metrics updated', {
        memoryUsage: `${memoryUsage.toFixed(1)}MB`,
        cpuUsage: `${cpuUsage.toFixed(1)}%`,
        networkSpeed: `${networkSpeed}Mbps`,
        batteryLevel: batteryLevel ? `${batteryLevel.toFixed(0)}%` : 'unknown',
      });
    } catch (error) {
      debugLog('Failed to update metrics', error);
    }
  }, [
    getMemoryUsage,
    estimateCPUUsage,
    getNetworkSpeed,
    getBatteryLevel,
    calculateVideoQualityScore,
    calculateLoadingScore,
    calculateOverallScore,
    debugLog,
  ]);

  // Start monitoring a video
  const startVideoSession = useCallback(
    (videoId: string) => {
      const session: VideoPerformanceData = {
        videoId,
        startTime: performance.now(),
        playTime: 0,
        pauseTime: 0,
        metrics: { ...currentMetrics },
        events: [],
      };

      setVideoSessions((prev) => new Map(prev).set(videoId, session));
      frameCountRef.current.set(videoId, {
        frames: 0,
        lastTime: performance.now(),
      });

      debugLog(`Started video session: ${videoId}`);
    },
    [currentMetrics, debugLog],
  );

  // End monitoring a video
  const endVideoSession = useCallback(
    (videoId: string) => {
      setVideoSessions((prev) => {
        const session = prev.get(videoId);
        if (session) {
          const updatedSession = {
            ...session,
            endTime: performance.now(),
          };

          // Calculate final metrics
          const totalTime = updatedSession.endTime - updatedSession.startTime;
          const watchPercentage = (updatedSession.playTime / totalTime) * 100;

          updatedSession.metrics.engagementRate = Math.min(
            100,
            watchPercentage,
          );

          const newMap = new Map(prev);
          newMap.set(videoId, updatedSession);

          debugLog(`Ended video session: ${videoId}`, {
            duration: `${(totalTime / 1000).toFixed(1)}s`,
            engagement: `${watchPercentage.toFixed(1)}%`,
          });

          return newMap;
        }
        return prev;
      });

      frameCountRef.current.delete(videoId);
    },
    [debugLog],
  );

  // Record performance event
  const recordEvent = useCallback(
    (videoId: string, type: PerformanceEvent['type'], data?: any) => {
      const event: PerformanceEvent = {
        type,
        timestamp: performance.now(),
        data,
      };

      setVideoSessions((prev) => {
        const session = prev.get(videoId);
        if (session) {
          const updatedEvents = [...session.events, event].slice(
            -maxEventHistory,
          );
          const updatedSession = {
            ...session,
            events: updatedEvents,
          };

          // Update specific metrics based on event type
          switch (type) {
            case 'buffer':
              updatedSession.metrics.playbackStalls++;
              break;
            case 'frame_drop':
              updatedSession.metrics.frameDrops++;
              break;
            case 'play':
              if (data?.timeToPlay) {
                updatedSession.metrics.timeToPlay = data.timeToPlay;
              }
              break;
          }

          return new Map(prev).set(videoId, updatedSession);
        }
        return prev;
      });

      debugLog(`Recorded event: ${type} for ${videoId}`, data);
    },
    [maxEventHistory, debugLog],
  );

  // Track video element performance
  const trackVideoElement = useCallback(
    (videoId: string, element: HTMLVideoElement) => {
      const updateVideoMetrics = () => {
        try {
          // Calculate buffer health
          const buffered = element.buffered;
          let bufferHealth = 0;
          if (buffered.length > 0 && element.duration > 0) {
            const bufferedEnd = buffered.end(buffered.length - 1);
            const ahead = bufferedEnd - element.currentTime;
            bufferHealth = (ahead / element.duration) * 100;
          }

          // Update frame count for frame rate calculation
          const frameData = frameCountRef.current.get(videoId);
          if (frameData) {
            const now = performance.now();
            const timeDiff = now - frameData.lastTime;

            if (timeDiff >= 1000) {
              // Update every second
              const fps = (frameData.frames * 1000) / timeDiff;

              setCurrentMetrics((prev) => ({
                ...prev,
                averageFrameRate: fps,
                bufferHealth,
              }));

              frameCountRef.current.set(videoId, {
                frames: 0,
                lastTime: now,
              });
            } else {
              frameCountRef.current.set(videoId, {
                ...frameData,
                frames: frameData.frames + 1,
              });
            }
          }
        } catch (error) {
          debugLog(`Failed to update video metrics for ${videoId}`, error);
        }
      };

      // Set up event listeners
      element.addEventListener('loadstart', () => {
        recordEvent(videoId, 'play', { loadStartTime: performance.now() });
      });

      element.addEventListener('canplay', () => {
        const loadTime = performance.now() - (performance.now() - 2000); // Rough estimation
        setCurrentMetrics((prev) => ({ ...prev, loadTime }));
      });

      element.addEventListener('play', () => {
        recordEvent(videoId, 'play');
      });

      element.addEventListener('pause', () => {
        recordEvent(videoId, 'pause');
      });

      element.addEventListener('waiting', () => {
        recordEvent(videoId, 'buffer');
      });

      element.addEventListener('error', (error) => {
        recordEvent(videoId, 'error', { error });
      });

      // Update metrics periodically
      const interval = setInterval(updateVideoMetrics, 100); // 100ms for smooth updates

      return () => {
        clearInterval(interval);
      };
    },
    [recordEvent, debugLog],
  );

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);

    // Start periodic metrics update
    monitoringIntervalRef.current = setInterval(updateMetrics, sampleInterval);

    // Set up Performance Observer if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (
              entry.entryType === 'measure' ||
              entry.entryType === 'navigation'
            ) {
              debugLog('Performance entry', {
                type: entry.entryType,
                name: entry.name,
                duration: entry.duration,
              });
            }
          });
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });
        performanceObserverRef.current = observer;
      } catch (error) {
        debugLog('Failed to set up PerformanceObserver', error);
      }
    }

    debugLog('Performance monitoring started');
  }, [isMonitoring, updateMetrics, sampleInterval, debugLog]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);

    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }

    debugLog('Performance monitoring stopped');
  }, [isMonitoring, debugLog]);

  // Get session data for a video
  const getVideoSession = useCallback(
    (videoId: string): VideoPerformanceData | null => {
      return videoSessions.get(videoId) || null;
    },
    [videoSessions],
  );

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const sessions = Array.from(videoSessions.values());
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        averageLoadTime: 0,
        averageEngagement: 0,
        totalStalls: 0,
      };
    }

    const averageScore =
      sessions.reduce((sum, s) => sum + s.metrics.overallScore, 0) /
      totalSessions;
    const averageLoadTime =
      sessions.reduce((sum, s) => sum + s.metrics.loadTime, 0) / totalSessions;
    const averageEngagement =
      sessions.reduce((sum, s) => sum + s.metrics.engagementRate, 0) /
      totalSessions;
    const totalStalls = sessions.reduce(
      (sum, s) => sum + s.metrics.playbackStalls,
      0,
    );

    return {
      totalSessions,
      averageScore: Math.round(averageScore),
      averageLoadTime: Math.round(averageLoadTime),
      averageEngagement: Math.round(averageEngagement),
      totalStalls,
    };
  }, [videoSessions]);

  // Auto-start monitoring
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      frameCountRef.current.clear();
    };
  }, []);

  return {
    // Current state
    currentMetrics,
    isMonitoring,
    videoSessions: Array.from(videoSessions.values()),

    // Actions
    startVideoSession,
    endVideoSession,
    recordEvent,
    trackVideoElement,
    startMonitoring,
    stopMonitoring,

    // Data retrieval
    getVideoSession,
    getPerformanceSummary,

    // Utilities
    isVideoBeingTracked: (videoId: string) => videoSessions.has(videoId),
  };
};
