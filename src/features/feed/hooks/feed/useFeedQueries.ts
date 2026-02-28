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
  timelineWithParams: (params: Omit<GetTimelineFeedParams, 'cursor'>) =>
    [...FEED_QUERY_KEYS.timeline(), params] as const,
} as const;

/**
 * Hook to get timeline feed with standard (single-page) fetch.
 * Useful for SSR or one-off requests.
 */
export const useTimelineFeed = (
  params: GetTimelineFeedParams = {},
  options: FeedQueryOptions = {},
) => {
  const {
    staleTime = 1000 * 60 * 5,
    cacheTime = 1000 * 60 * 10,
    retry = 3,
    refetchOnWindowFocus = false,
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: FEED_QUERY_KEYS.timelineWithParams(params),
    queryFn: () => feedService.getTimelineFeed(params),
    staleTime,
    gcTime: cacheTime,
    retry,
    refetchOnWindowFocus,
    enabled,
    ...queryOptions,
  });
};

/**
 * Hook to get timeline feed with cursor-based infinite scroll.
 *
 * Page params are `string | null` (the nextCursor value).
 * First page uses `null` as initialPageParam, which means "no cursor → first page".
 *
 * `getNextPageParam` reads `lastPage.nextCursor`:
 *   - if non-null → there are more posts, return the cursor for the next fetch
 *   - if null → end of feed, return `undefined` to signal no more pages
 */
export const useInfiniteTimelineFeed = (
  params: Omit<GetTimelineFeedParams, 'cursor'> = {},
  options: FeedQueryOptions = {},
) => {
  const {
    staleTime = 1000 * 60 * 5,
    cacheTime = 1000 * 60 * 10,
    retry = 3,
    refetchOnWindowFocus = false,
    enabled = true,
    ...queryOptions
  } = options;

  return useInfiniteQuery<
    TimelineFeedResponse,
    Error,
    InfiniteFeedResult,
    ReturnType<typeof FEED_QUERY_KEYS.timelineWithParams>,
    string | null
  >({
    queryKey: FEED_QUERY_KEYS.timelineWithParams(params),
    queryFn: ({ pageParam }) =>
      feedService.getTimelineFeed({
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: null, // null = first page (no cursor)
    getNextPageParam: (lastPage) => {
      // If the API says there are more pages, return the cursor for the next fetch
      if (lastPage.hasNextPage && lastPage.nextCursor) {
        return lastPage.nextCursor;
      }
      // undefined signals to react-query: no more pages
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
  const { staleTime = 0, enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: [...FEED_QUERY_KEYS.timeline(), 'refresh'],
    queryFn: () => feedService.refreshTimelineFeed(),
    staleTime,
    enabled,
    ...queryOptions,
  });
};
