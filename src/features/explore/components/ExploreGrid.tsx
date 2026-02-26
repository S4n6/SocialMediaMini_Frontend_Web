'use client';

import React, { useEffect, useRef } from 'react';
import { ExplorePost } from '../types/explore';
import { ExplorePostCard } from './ExplorePostCard';
import { MasonryGrid } from './MasonryGrid';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import {
  PostSkeleton,
  PostGridSkeleton,
  LoadingGridSkeleton,
} from './PostSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Grid3X3, LayoutGrid } from 'lucide-react';

interface ExploreGridProps {
  posts: ExplorePost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  isEmpty: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  layoutMode?: 'grid' | 'masonry';
}

export const ExploreGrid: React.FC<ExploreGridProps> = ({
  posts,
  loading,
  error,
  hasMore,
  isEmpty,
  onLoadMore,
  onRefresh,
  layoutMode = 'masonry',
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [currentLayoutMode, setCurrentLayoutMode] = React.useState(layoutMode);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  // Handle post click
  const handlePostClick = (post: ExplorePost) => {
    console.log('Post clicked:', post.id);
    // TODO: Open post modal or navigate to post page
  };

  // Loading skeleton
  if (loading && posts.length === 0) {
    return currentLayoutMode === 'masonry' ? (
      <LoadingGridSkeleton variant="masonry" count={12} />
    ) : (
      <LoadingGridSkeleton variant="grid" count={12} />
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout Switcher */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setCurrentLayoutMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              currentLayoutMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Grid Layout"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setCurrentLayoutMode('masonry')}
            className={`p-2 rounded-md transition-colors ${
              currentLayoutMode === 'masonry'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Masonry Layout"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Posts Display */}
      {currentLayoutMode === 'masonry' ? (
        <MasonryGrid
          posts={posts}
          loading={loading}
          onPostClick={handlePostClick}
          onLoadMore={hasMore ? onLoadMore : undefined}
          hasMore={hasMore}
          showAdvancedInteractions={true}
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {posts.map((post, index) => (
            <ExplorePostCard
              key={`${post.id}-${index}`}
              post={post}
              onClick={handlePostClick}
              showAdvancedInteractions={true}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <InfiniteScrollTrigger
          onLoadMore={onLoadMore}
          loading={loading}
          error={error}
          hasMore={hasMore}
          threshold={0.1}
          rootMargin="100px"
        />
      )}

      {/* Loading more skeletons */}
      {loading && posts.length > 0 && (
        <div className="mt-4">
          {currentLayoutMode === 'masonry' ? (
            <PostGridSkeleton count={6} variant="masonry" />
          ) : (
            <PostGridSkeleton count={6} variant="grid" />
          )}
        </div>
      )}

      {/* End Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end!
            <button
              onClick={onRefresh}
              className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Refresh to see new posts
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
