'use client';

import React from 'react';

interface PostSkeletonProps {
  height?: number;
  variant?: 'masonry' | 'grid';
  showStats?: boolean;
  className?: string;
}

export const PostSkeleton: React.FC<PostSkeletonProps> = ({
  height = 300,
  variant = 'grid',
  showStats = false,
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}
      style={{ height: variant === 'masonry' ? height : undefined }}
    >
      {/* Image placeholder */}
      <div
        className={`bg-gray-300 dark:bg-gray-700 ${variant === 'grid' ? 'aspect-square' : 'h-full'}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded opacity-50">
            {/* Camera icon placeholder */}
            <svg
              className="w-full h-full"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-3L9 1H7L4 3zm5 7a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats overlay for masonry/hover states */}
      {showStats && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white/60 rounded"></div>
              <div className="w-8 h-3 bg-white/60 rounded"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white/60 rounded"></div>
              <div className="w-6 h-3 bg-white/60 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PostGridSkeletonProps {
  count?: number;
  variant?: 'masonry' | 'grid';
  showStats?: boolean;
  className?: string;
}

export const PostGridSkeleton: React.FC<PostGridSkeletonProps> = ({
  count = 12,
  variant = 'grid',
  showStats = false,
  className = '',
}) => {
  // Generate different heights for masonry
  const getRandomHeight = () => {
    const heights = [250, 300, 350, 400, 450];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  return (
    <div
      className={`grid gap-4 ${
        variant === 'masonry'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      } ${className}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton
          key={index}
          height={variant === 'masonry' ? getRandomHeight() : undefined}
          variant={variant}
          showStats={showStats}
        />
      ))}
    </div>
  );
};

interface LoadingGridSkeletonProps {
  variant?: 'masonry' | 'grid';
  className?: string;
  count?: number;
}

export const LoadingGridSkeleton: React.FC<LoadingGridSkeletonProps> = ({
  variant = 'grid',
  className = '',
  count = 12,
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Grid skeleton */}
      <PostGridSkeleton variant={variant} count={count} />

      {/* Load more skeleton */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-20 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Hook for masonry skeleton heights
export const useMasonrySkeletonHeights = (count: number) => {
  return React.useMemo(() => {
    const baseHeights = [280, 320, 360, 400, 440, 380, 300, 420];
    const heights = [];

    for (let i = 0; i < count; i++) {
      heights.push(baseHeights[i % baseHeights.length]);
    }

    return heights;
  }, [count]);
};
