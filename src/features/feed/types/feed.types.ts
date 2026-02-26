import type { PostsResponse } from '@/features/posts/types';
import type { ApiResponse } from '@/types/api';

// Feed timeline query parameters
export interface GetTimelineFeedParams {
  page?: number;
  limit?: number;
  lastPostId?: string; // For cursor-based pagination
}

// Feed timeline response
export type TimelineFeedResponse = PostsResponse;

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
  posts: any[]; // Will be typed based on your post type
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
  initialPageParam?: number;
}

// Infinite query result type
export interface InfiniteFeedResult {
  pages: TimelineFeedResponse[];
  pageParams: any[];
}

// Feed mutations options
export interface FeedMutationOptions {
  onSuccess?: (data: TimelineFeedResponse) => void;
  onError?: (error: FeedError) => void;
}
