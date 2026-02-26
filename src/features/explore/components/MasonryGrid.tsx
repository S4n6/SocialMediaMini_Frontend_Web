'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExplorePost } from '../types/explore';
import { ExplorePostCard } from './ExplorePostCard';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import { PostSkeleton, useMasonrySkeletonHeights } from './PostSkeleton';

interface MasonryGridProps {
  posts: ExplorePost[];
  loading: boolean;
  onPostClick: (post: ExplorePost) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
  showAdvancedInteractions?: boolean;
}

interface GridItem extends ExplorePost {
  height: number;
  column: number;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  posts,
  loading,
  onPostClick,
  onLoadMore,
  hasMore = false,
  className = '',
  showAdvancedInteractions = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [columns, setColumns] = useState(3);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate responsive columns based on screen width
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;
    setContainerWidth(width);

    let newColumns = 3; // Default
    if (width < 640)
      newColumns = 2; // sm
    else if (width < 1024)
      newColumns = 3; // md
    else if (width < 1280)
      newColumns = 4; // lg
    else newColumns = 5; // xl

    setColumns(newColumns);
    setColumnHeights(new Array(newColumns).fill(0));
  }, []);

  // Handle window resize
  useEffect(() => {
    updateColumns();

    const handleResize = () => updateColumns();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateColumns]);

  // Calculate grid layout
  useEffect(() => {
    if (posts.length === 0 || columns === 0) return;

    const gap = 8; // 2 in Tailwind
    const baseHeight = 200; // Base height for aspect ratio calculations
    const newColumnHeights = new Array(columns).fill(0);

    const items: GridItem[] = posts.map((post, index) => {
      // Calculate height based on aspect ratio with some variation
      let height = baseHeight / post.aspectRatio;

      // Add some randomness for more natural masonry look
      const variation = 0.1 + Math.random() * 0.3; // 10-40% variation
      height = height * (0.8 + variation);

      // Ensure minimum and maximum heights
      height = Math.max(180, Math.min(400, height));

      // Find shortest column
      const shortestColumn = newColumnHeights.indexOf(
        Math.min(...newColumnHeights),
      );

      // Update column height
      newColumnHeights[shortestColumn] += height + gap;

      return {
        ...post,
        height: Math.round(height),
        column: shortestColumn,
      };
    });

    setGridItems(items);
    setColumnHeights(newColumnHeights);
  }, [posts, columns]);

  // Calculate container height
  const containerHeight = Math.max(...columnHeights);
  const columnWidth =
    containerWidth > 0 ? (containerWidth - (columns - 1) * 8) / columns : 0;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: containerHeight || 'auto' }}
      >
        {/* Grid Items */}
        {gridItems.map((item, index) => {
          const x = item.column * (columnWidth + 8);
          const y = gridItems
            .filter((gi) => gi.column === item.column)
            .slice(
              0,
              gridItems.findIndex((gi) => gi.id === item.id),
            )
            .reduce((sum, gi) => sum + gi.height + 8, 0);

          return (
            <div
              key={`${item.id}-${index}`}
              className="absolute transition-all duration-300 ease-out"
              style={{
                left: x,
                top: y,
                width: columnWidth,
                height: item.height,
              }}
            >
              <ExplorePostCard
                post={item}
                onClick={onPostClick}
                height={item.height}
                showAdvancedInteractions={showAdvancedInteractions}
              />
            </div>
          );
        })}

        {/* Loading Skeletons */}
        {loading && posts.length > 0 && (
          <>
            {Array.from({ length: 6 }).map((_, i) => {
              const skeletonHeights = useMasonrySkeletonHeights(6);
              const column = i % columns;
              const existingItemsInColumn = gridItems.filter(
                (gi) => gi.column === column,
              ).length;

              const x = column * (columnWidth + 8);
              const y =
                gridItems
                  .filter((gi) => gi.column === column)
                  .reduce((sum, gi) => sum + gi.height + 8, 0) +
                (existingItemsInColumn > 0 ? 8 : 0);

              return (
                <div
                  key={`skeleton-${i}`}
                  className="absolute"
                  style={{
                    left: x,
                    top: y + Math.floor(i / columns) * 220,
                    width: columnWidth,
                  }}
                >
                  <PostSkeleton
                    height={skeletonHeights[i % skeletonHeights.length]}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && onLoadMore && (
        <div className="mt-8">
          <InfiniteScrollTrigger
            onLoadMore={onLoadMore}
            loading={loading}
            hasMore={hasMore}
            threshold={0.1}
            rootMargin="100px"
          />
        </div>
      )}
    </div>
  );
};
