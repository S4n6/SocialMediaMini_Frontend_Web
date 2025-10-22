'use client';

import React, { Suspense } from 'react';
import { PostSection } from '@/features/posts';
import PostsSkeleton from '@/features/posts/components/PostsSkeleton';
import { useFeed } from '../hooks';

interface FeedSectionProps {
  mockPosts?: any[]; // Fallback mock data for development
}

const PostsContainer: React.FC<FeedSectionProps> = ({ mockPosts = [] }) => {
  // Use real feed hook
  const {
    posts,
    isLoading: postsLoading,
    error: postsError,
    loadMorePosts,
    hasNextPage,
    isFetchingNextPage,
    isEmpty: postsEmpty,
    retry: retryFeed,
  } = useFeed();

  // Event handlers
  const handleLoadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      loadMorePosts();
    }
  };

  // Handle error messages
  const postsErrorMessage = postsError?.message || null;

  return (
    <PostSection
      posts={posts.length > 0 ? posts : mockPosts}
      isLoading={postsLoading}
      error={postsErrorMessage}
      onLoadMore={handleLoadMorePosts}
      hasMore={hasNextPage}
    />
  );
};

export const FeedSection: React.FC<FeedSectionProps> = ({ mockPosts = [] }) => {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <PostsContainer mockPosts={mockPosts} />
    </Suspense>
  );
};

export default FeedSection;
