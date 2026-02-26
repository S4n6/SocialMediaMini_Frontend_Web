'use client';

import React, { useState, useEffect } from 'react';
import { ReelsFeed } from '@/features/reels/components';
import {
  usePerformanceMonitor,
  useAutoPlay,
  useVideoPreloader,
} from '@/features/reels/hooks';
import { ReelsVideo } from '@/features/reels/types/reels';

/**
 * Demo page for testing Reels Auto-play & Performance Features
 * Giai đoạn 4A: Complete performance optimization system
 */

export default function ReelsPerformanceDemo() {
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [preloadingEnabled, setPreloadingEnabled] = useState(true);

  // Sample videos for testing
  const sampleVideos: ReelsVideo[] = [
    {
      id: 'perf_test_1',
      userId: 'performance_tester',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      duration: 30,
      aspectRatio: 9 / 16,
      description:
        '🚀 Performance Test Video #1 - Testing auto-play and preloading',
      likesCount: 1250,
      commentsCount: 87,
      sharesCount: 23,
      viewsCount: 15600,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'performance_tester',
        username: 'perf_test_user',
        name: 'Performance Tester',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=perftest',
        isVerified: true,
      },
      visibility: 'public',
      qualities: {
        '360p':
          'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
        '720p':
          'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      },
    },
    {
      id: 'perf_test_2',
      userId: 'performance_tester',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_2mb.mp4',
      duration: 45,
      aspectRatio: 9 / 16,
      description: '⚡ Performance Test Video #2 - Memory management testing',
      likesCount: 890,
      commentsCount: 45,
      sharesCount: 12,
      viewsCount: 8900,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'performance_tester',
        username: 'perf_test_user',
        name: 'Performance Tester',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=perftest',
        isVerified: true,
      },
      visibility: 'public',
      qualities: {
        '360p':
          'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_2mb.mp4',
        '720p':
          'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_2mb.mp4',
      },
    },
  ];

  // Performance monitoring hook
  const {
    currentMetrics,
    isMonitoring,
    getPerformanceSummary,
    startMonitoring,
    stopMonitoring,
  } = usePerformanceMonitor({
    enableCPUMonitoring: true,
    enableMemoryMonitoring: true,
    enableNetworkMonitoring: true,
    debugMode: true,
  });

  // Auto-play hook for testing
  const { currentlyPlaying, visibleVideos, isTabVisible, pauseAll } =
    useAutoPlay(sampleVideos, {
      threshold: 0.7,
      enablePreloading: preloadingEnabled,
      enableBackgroundPause: true,
      debugMode: true,
    });

  // Video preloader for testing
  const {
    preloadedVideos,
    isPreloading,
    totalMemoryUsage,
    connectionInfo,
    getPreloadedCount,
  } = useVideoPreloader(sampleVideos, 0, {
    preloadRange: 2,
    enableAdaptive: true,
    debugMode: true,
  });

  // Performance summary
  const performanceSummary = getPerformanceSummary();

  // Format metrics for display
  const formatMetric = (value: number, unit: string = '') => {
    if (value === 0) return '0' + unit;
    return value < 1 ? value.toFixed(2) + unit : Math.round(value) + unit;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">🚀 Performance Demo</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPerformancePanel(!showPerformancePanel)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              📊 Metrics
            </button>
            <button
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                autoPlayEnabled
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {autoPlayEnabled ? '⏸️ Auto-play ON' : '▶️ Auto-play OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Panel */}
      {showPerformancePanel && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📊 Performance Metrics</h2>
            <button
              onClick={() => setShowPerformancePanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-400">
                {formatMetric(currentMetrics.averageFrameRate)}
              </div>
              <div className="text-xs text-gray-400">FPS</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">
                {formatMetric(currentMetrics.memoryUsage, 'MB')}
              </div>
              <div className="text-xs text-gray-400">Memory</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-purple-400">
                {formatMetric(currentMetrics.loadTime, 'ms')}
              </div>
              <div className="text-xs text-gray-400">Load Time</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-orange-400">
                {currentMetrics.overallScore}
              </div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
          </div>

          {/* Auto-play Status */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">🎬 Auto-play Status</h3>
            <div className="text-sm space-y-1">
              <div>
                Currently Playing:{' '}
                <span className="text-blue-400">
                  {currentlyPlaying || 'None'}
                </span>
              </div>
              <div>
                Visible Videos:{' '}
                <span className="text-green-400">{visibleVideos.length}</span>
              </div>
              <div>
                Tab Visible:{' '}
                <span
                  className={isTabVisible ? 'text-green-400' : 'text-red-400'}
                >
                  {isTabVisible ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Preloader Status */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">📦 Preloader Status</h3>
            <div className="text-sm space-y-1">
              <div>
                Preloaded Count:{' '}
                <span className="text-purple-400">{getPreloadedCount()}</span>
              </div>
              <div>
                Is Preloading:{' '}
                <span
                  className={isPreloading ? 'text-yellow-400' : 'text-gray-400'}
                >
                  {isPreloading ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                Memory Usage:{' '}
                <span className="text-orange-400">
                  {formatMetric(totalMemoryUsage, 'MB')}
                </span>
              </div>
              {connectionInfo && (
                <div>
                  Connection:{' '}
                  <span className="text-blue-400">
                    {connectionInfo.effectiveType} (
                    {formatMetric(connectionInfo.downlink, 'Mbps')})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">📈 Session Summary</h3>
            <div className="text-sm space-y-1">
              <div>
                Total Sessions:{' '}
                <span className="text-blue-400">
                  {performanceSummary.totalSessions}
                </span>
              </div>
              <div>
                Avg Score:{' '}
                <span className="text-green-400">
                  {performanceSummary.averageScore}
                </span>
              </div>
              <div>
                Avg Load Time:{' '}
                <span className="text-purple-400">
                  {formatMetric(performanceSummary.averageLoadTime, 'ms')}
                </span>
              </div>
              <div>
                Total Stalls:{' '}
                <span className="text-red-400">
                  {performanceSummary.totalStalls}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPreloadingEnabled(!preloadingEnabled)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                preloadingEnabled
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {preloadingEnabled ? 'Disable Preload' : 'Enable Preload'}
            </button>

            <button
              onClick={pauseAll}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Pause All
            </button>

            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isMonitoring
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
            </button>
          </div>
        </div>
      )}

      {/* Main Feed */}
      <div className="h-screen">
        <ReelsFeed className="h-full" autoPlay={autoPlayEnabled} />
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-4 z-30">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
          <div className="text-center text-sm">
            <div className="font-semibold mb-1">
              🎬 Giai đoạn 4A: Auto-play & Performance
            </div>
            <div className="text-gray-300 text-xs">
              Intelligent auto-play • Video preloading • Performance monitoring
              • Memory management
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
