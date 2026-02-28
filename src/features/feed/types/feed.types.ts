import type {
  CursorPaginatedPostsResponse,
  Post,
} from '@/features/posts/types';

// Feed timeline query parameters (cursor-based)
export interface GetTimelineFeedParams {
  cursor?: string | null;
  limit?: number;
  algorithm?: 'chronological' | 'smart' | 'diversified';
}

/**
 * The API response shape from GET /posts/feed/timeline
 * After the Axios interceptor unwraps, we receive:
 *   { data: { data: Post[], nextCursor: string | null, hasNextPage: boolean }, ... }
 * So the "inner" data accessed via `response.data.data` is CursorPaginatedPostsResponse.
 */
export type TimelineFeedResponse = CursorPaginatedPostsResponse;

// Feed hook configuration
export interface FeedConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enableToast?: boolean;
  refetchOnWindowFocus?: boolean;
}

// Feed state interface
export interface FeedState {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  error: FeedError | null;
  lastUpdated?: Date;
}

// Feed actions interface
export interface FeedActions {
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refetchFeed: () => Promise<void>;
}

// Feed error interface
export interface FeedError {
  code: string;
  message: string;
  status?: number;
}

// Feed query options
export interface FeedQueryOptions extends FeedConfig {
  enabled?: boolean;
  select?: (data: any) => any;
}

// Infinite query result type (cursor-based pages)
export interface InfiniteFeedResult {
  pages: TimelineFeedResponse[];
  pageParams: (string | null)[];
}

// Feed mutations options
export interface FeedMutationOptions {
  onSuccess?: (data: TimelineFeedResponse) => void;
  onError?: (error: FeedError) => void;
}
