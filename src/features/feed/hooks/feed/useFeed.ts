import { useCallback } from 'react';
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

/**
 * Main feed hook that combines queries and business logic
 * This is the public API that components should use for feed functionality
 */
export const useFeed = (
  params: GetTimelineFeedParams = {},
  options: FeedConfig = {},
) => {
  const queryClient = useQueryClient();
  const { enableToast = true, ...queryOptions } = options;

  // Get infinite timeline feed (recommended for most use cases)
  const infiniteTimelineFeed = useInfiniteTimelineFeed(params, queryOptions);

  // Get single page timeline feed (for specific page needs)
  const singlePageFeed = useTimelineFeed(params, {
    ...queryOptions,
    enabled: false, // Only enable when explicitly requested
  });

  // Flatten posts from infinite query pages
  const allPosts =
    infiniteTimelineFeed.data?.pages.flatMap((page) => page.data) || [];

  // Create action methods
  const actions: FeedActions = {
    refreshFeed: useCallback(async () => {
      await infiniteTimelineFeed.refetch();

      if (enableToast) {
        // You can integrate toast notification here
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
      // Invalidate and refetch all feed-related queries
      await queryClient.invalidateQueries({
        queryKey: FEED_QUERY_KEYS.all,
      });
    }, [queryClient]),
  };

  // Create state object
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

    // Pagination info from the latest page
    pagination:
      infiniteTimelineFeed.data?.pages[
        infiniteTimelineFeed.data.pages.length - 1
      ]?.pagination,

    // Helper methods
    retry: infiniteTimelineFeed.refetch,
    canLoadMore:
      infiniteTimelineFeed.hasNextPage &&
      !infiniteTimelineFeed.isFetchingNextPage,
  };
};

export default useFeed;
