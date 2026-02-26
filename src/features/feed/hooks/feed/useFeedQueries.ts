import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../../services/feed.service';
import type {
  GetTimelineFeedParams,
  TimelineFeedResponse,
  FeedQueryOptions,
  InfiniteFeedResult,
} from '../../types/feed.types';

/**
 * Query keys for feed-related queries
 */
export const FEED_QUERY_KEYS = {
  all: ['feed'] as const,
  timeline: () => [...FEED_QUERY_KEYS.all, 'timeline'] as const,
  timelineWithParams: (params: GetTimelineFeedParams) =>
    [...FEED_QUERY_KEYS.timeline(), params] as const,
} as const;

/**
 * Hook to get timeline feed with standard pagination
 */
export const useTimelineFeed = (
  params: GetTimelineFeedParams = {},
  options: FeedQueryOptions = {},
) => {
  const {
    staleTime = 1000 * 60 * 5, // 5 minutes
    cacheTime = 1000 * 60 * 10, // 10 minutes
    retry = 3,
    refetchOnWindowFocus = false,
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: FEED_QUERY_KEYS.timelineWithParams(params),
    queryFn: () => feedService.getTimelineFeed(params),
    staleTime,
    gcTime: cacheTime, // Updated from cacheTime to gcTime in newer react-query
    retry,
    refetchOnWindowFocus,
    enabled,
    ...queryOptions,
  });
};

/**
 * Hook to get timeline feed with infinite scroll support
 */
export const useInfiniteTimelineFeed = (
  params: Omit<GetTimelineFeedParams, 'page'> = {},
  options: FeedQueryOptions = {},
) => {
  const {
    staleTime = 1000 * 60 * 5, // 5 minutes
    cacheTime = 1000 * 60 * 10, // 10 minutes
    retry = 3,
    refetchOnWindowFocus = false,
    enabled = true,
    initialPageParam = 1,
    ...queryOptions
  } = options;

  return useInfiniteQuery<
    TimelineFeedResponse,
    Error,
    InfiniteFeedResult,
    ReturnType<typeof FEED_QUERY_KEYS.timelineWithParams>,
    number
  >({
    queryKey: FEED_QUERY_KEYS.timelineWithParams(params),
    queryFn: ({ pageParam = 1 }) =>
      feedService.getTimelineFeed({
        ...params,
        page: pageParam,
      }),
    initialPageParam,
    getNextPageParam: (lastPage, allPages) => {
      // Check if there are more pages based on pagination info
      if (lastPage.pagination?.hasNext) {
        return allPages.length + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      // For potential "pull to refresh" functionality
      if (allPages.length > 1) {
        return allPages.length - 1;
      }
      return undefined;
    },
    staleTime,
    gcTime: cacheTime,
    retry,
    refetchOnWindowFocus,
    enabled,
    ...queryOptions,
  });
};

/**
 * Hook to refresh timeline feed (get latest posts)
 */
export const useRefreshTimelineFeed = (options: FeedQueryOptions = {}) => {
  const {
    staleTime = 0, // Always fresh for refresh
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: [...FEED_QUERY_KEYS.timeline(), 'refresh'],
    queryFn: () => feedService.refreshTimelineFeed(),
    staleTime,
    enabled,
    ...queryOptions,
  });
};
