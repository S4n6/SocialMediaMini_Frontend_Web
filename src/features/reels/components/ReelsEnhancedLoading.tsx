'use client';

import React from 'react';

/**
 * Enhanced Loading States for Reels
 * Instagram 2025 style loading animations and skeletons
 */

interface ReelsLoadingProps {
  type?: 'feed' | 'video' | 'comments' | 'profile' | 'minimal';
  count?: number;
  message?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
  className?: string;
}

export const ReelsLoading: React.FC<ReelsLoadingProps> = ({
  type = 'video',
  count = 1,
  message,
  showProgress = false,
  progress = 0,
  className = '',
}) => {
  // Feed skeleton - multiple video cards
  if (type === 'feed') {
    return (
      <div className={`space-y-0 ${className}`}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="h-screen w-full bg-gray-900 relative">
            {/* Video skeleton */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
            </div>

            {/* Right side controls skeleton */}
            <div className="absolute right-3 bottom-24 space-y-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex flex-col items-center space-y-1"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
                  <div className="w-8 h-3 bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Bottom content skeleton */}
            <div className="absolute left-3 right-20 bottom-6 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
                <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                <div className="w-4 h-4 bg-blue-500 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-700 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>

            {/* Top navigation skeleton */}
            <div className="absolute top-4 left-3 right-3 flex items-center justify-between">
              <div className="w-16 h-6 bg-gray-700 rounded animate-pulse" />
              <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Single video loading
  if (type === 'video') {
    return (
      <div
        className={`h-screen w-full bg-gray-900 relative flex items-center justify-center ${className}`}
      >
        {/* Main loading spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin" />

          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="absolute bottom-1/3 left-1/4 right-1/4">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="bg-white h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">
              {Math.round(progress)}%
            </div>
          </div>
        )}

        {/* Loading message */}
        {message && (
          <div className="absolute bottom-1/4 left-0 right-0 text-center">
            <p className="text-white text-sm">{message}</p>
          </div>
        )}

        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm" />
      </div>
    );
  }

  // Comments loading
  if (type === 'comments') {
    return (
      <div className={`space-y-4 p-4 ${className}`}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex space-x-3 animate-pulse">
            {/* Avatar skeleton */}
            <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0" />

            {/* Comment content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-3 bg-gray-700 rounded" />
                <div className="w-12 h-3 bg-gray-600 rounded" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-3 bg-gray-700 rounded" />
                <div className="w-2/3 h-3 bg-gray-700 rounded" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-3 bg-gray-600 rounded" />
                <div className="w-12 h-3 bg-gray-600 rounded" />
                <div className="w-10 h-3 bg-gray-600 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Profile loading
  if (type === 'profile') {
    return (
      <div className={`bg-gray-900 rounded-t-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-700 rounded" />
                <div className="w-16 h-3 bg-gray-600 rounded" />
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
          </div>

          {/* Bio */}
          <div className="space-y-2 mb-6">
            <div className="w-full h-3 bg-gray-700 rounded" />
            <div className="w-4/5 h-3 bg-gray-700 rounded" />
            <div className="w-3/5 h-3 bg-gray-700 rounded" />
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center space-y-1">
                <div className="w-12 h-5 bg-gray-700 rounded mx-auto" />
                <div className="w-16 h-3 bg-gray-600 rounded" />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 mb-6">
            <div className="flex-1 h-10 bg-gray-700 rounded-lg" />
            <div className="flex-1 h-10 bg-gray-700 rounded-lg" />
          </div>

          {/* Recent content grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-700 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Minimal loading (small spinner)
  if (type === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
        {message && (
          <span className="ml-2 text-sm text-gray-400">{message}</span>
        )}
      </div>
    );
  }

  return null;
};

// Skeleton wrapper for any content
export const ReelsSkeleton: React.FC<{
  children?: React.ReactNode;
  isLoading: boolean;
  skeleton?: React.ReactNode;
  className?: string;
}> = ({ children, isLoading, skeleton, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {skeleton || (
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-700 rounded w-5/6" />
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Progressive loading with stages
export const ReelsProgressiveLoading: React.FC<{
  stage: 'initial' | 'loading' | 'processing' | 'finalizing' | 'complete';
  className?: string;
}> = ({ stage, className = '' }) => {
  const stages = [
    { key: 'initial', label: 'Initializing...', progress: 0 },
    { key: 'loading', label: 'Loading videos...', progress: 25 },
    { key: 'processing', label: 'Processing content...', progress: 60 },
    { key: 'finalizing', label: 'Almost ready...', progress: 90 },
    { key: 'complete', label: 'Complete!', progress: 100 },
  ];

  const currentStage = stages.find((s) => s.key === stage) || stages[0];
  const isComplete = stage === 'complete';

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {/* Main loader */}
      <div className="relative">
        {isComplete ? (
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Progress bar */}
      <div className="w-64 bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${currentStage.progress}%` }}
        />
      </div>

      {/* Stage label */}
      <p className="text-white text-sm font-medium">{currentStage.label}</p>

      {/* Progress percentage */}
      <p className="text-gray-400 text-xs">{currentStage.progress}%</p>
    </div>
  );
};

// Shimmer effect for content placeholders
export const ReelsShimmer: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`relative overflow-hidden bg-gray-700 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>
);
