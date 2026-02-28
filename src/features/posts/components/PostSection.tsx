'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { PostCard } from './PostCard';
import PostsSkeleton from './PostsSkeleton';
import type { LegacyPost as Post, ImageItem } from '@/types';

interface PostSectionProps {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  onLoadMore: () => void;
  hasMore: boolean;
  isFetchingMore?: boolean;
}

export default function PostSection({
  posts,
  isLoading,
  error,
  onLoadMore,
  hasMore,
  isFetchingMore = false,
}: PostSectionProps) {
  /**
   * Intersection Observer sentinel ref.
   * When this invisible div enters the viewport, we trigger `onLoadMore`.
   * The observer is disconnected while a fetch is in-flight to prevent
   * race conditions from rapid scroll events.
   */
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isFetchingMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    // Clean up any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersect, {
      // Fire when sentinel is within 300px of the viewport bottom
      rootMargin: '0px 0px 300px 0px',
      threshold: 0,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleIntersect]);

  if (isLoading && posts.length === 0) {
    return <PostsSkeleton />;
  }

  return (
    <div className="w-full space-y-4 mt-8">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={(updatedPost) => {
            console.log('Post updated:', updatedPost);
          }}
        />
      ))}

      {/* Spinner while fetching the next page */}
      {isFetchingMore && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Invisible sentinel — triggers the next fetch when scrolled into view */}
      {hasMore && !isFetchingMore && (
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      )}

      {/* End-of-feed message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center p-4">
          <p className="text-sm text-gray-500">No more posts to load</p>
        </div>
      )}
    </div>
  );
}
