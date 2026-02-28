import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useTimelineFeed,
  useInfiniteTimelineFeed,
  useRefreshTimelineFeed,
  FEED_QUERY_KEYS,
} from './useFeedQueries';
import type {
  GetTimelineFeedParams,
  FeedConfig,
  FeedState,
  FeedActions,
} from '../../types/feed.types';
import type { Post } from '@/features/posts/types';

/**
 * Main feed hook that combines queries and business logic.
 * This is the public API that components should use for feed functionality.
 *
 * Uses cursor-based pagination — pages are keyed by nextCursor, not page numbers.
 */
export const useFeed = (
  params: Omit<GetTimelineFeedParams, 'cursor'> = {},
  options: FeedConfig = {},
) => {
  const queryClient = useQueryClient();
  const { enableToast = true, ...queryOptions } = options;

  // Infinite timeline feed (cursor-based)
  const infiniteTimelineFeed = useInfiniteTimelineFeed(params, queryOptions);

  // Single page feed (for specific one-off needs)
  const singlePageFeed = useTimelineFeed(params, {
    ...queryOptions,
    enabled: false,
  });

  // Flatten posts from all fetched pages.
  // Each page has a stable `.data: Post[]` array — no guessing needed.
  const allPosts: Post[] = useMemo(() => {
    if (!infiniteTimelineFeed.data?.pages) return [];

    const seen = new Set<string>();
    const posts: Post[] = [];

    for (const page of infiniteTimelineFeed.data.pages) {
      for (const post of page.data ?? []) {
        // Deduplicate by post ID to prevent React key collisions
        // (can happen if a post is prepended between refetches)
        if (!seen.has(post.id)) {
          seen.add(post.id);
          posts.push(post);
        }
      }
    }

    return posts;
  }, [infiniteTimelineFeed.data?.pages]);

  // Action methods
  const actions: FeedActions = {
    refreshFeed: useCallback(async () => {
      await infiniteTimelineFeed.refetch();
      if (enableToast) {
        console.log('Feed refreshed successfully');
      }
    }, [infiniteTimelineFeed, enableToast]),

    loadMorePosts: useCallback(async () => {
      if (
        infiniteTimelineFeed.hasNextPage &&
        !infiniteTimelineFeed.isFetchingNextPage
      ) {
        await infiniteTimelineFeed.fetchNextPage();
      }
    }, [infiniteTimelineFeed]),

    refetchFeed: useCallback(async () => {
      await queryClient.invalidateQueries({
        queryKey: FEED_QUERY_KEYS.all,
      });
    }, [queryClient]),
  };

  // State object
  const state: FeedState = {
    posts: allPosts,
    isLoading: infiniteTimelineFeed.isLoading,
    isRefreshing: infiniteTimelineFeed.isRefetching,
    hasNextPage: infiniteTimelineFeed.hasNextPage || false,
    isFetchingNextPage: infiniteTimelineFeed.isFetchingNextPage,
    error: infiniteTimelineFeed.error
      ? {
          code: 'FEED_ERROR',
          message: infiniteTimelineFeed.error.message,
        }
      : null,
    lastUpdated: infiniteTimelineFeed.dataUpdatedAt
      ? new Date(infiniteTimelineFeed.dataUpdatedAt)
      : undefined,
  };

  return {
    // State
    ...state,

    // Actions
    ...actions,

    // Additional computed states
    isEmpty: !state.isLoading && allPosts.length === 0,
    totalPosts: allPosts.length,

    // Loading states (detailed)
    isInitialLoading: infiniteTimelineFeed.isLoading && !allPosts.length,
    isLoadingMore: infiniteTimelineFeed.isFetchingNextPage,

    // Error states (detailed)
    hasError: !!state.error,
    errorMessage: state.error?.message,

    // Raw query objects for advanced usage
    infiniteQuery: infiniteTimelineFeed,
    singlePageQuery: singlePageFeed,

    // Helper methods
    retry: infiniteTimelineFeed.refetch,
    canLoadMore:
      infiniteTimelineFeed.hasNextPage &&
      !infiniteTimelineFeed.isFetchingNextPage,
  };
};

export default useFeed;
