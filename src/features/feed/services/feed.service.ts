import api from '@/lib/axios';
import type {
  GetTimelineFeedParams,
  TimelineFeedResponse,
} from '../types/feed.types';

/**
 * Feed service for timeline-related API calls.
 * Uses cursor-based pagination — no page numbers.
 */
export class FeedService {
  /**
   * Get user's timeline feed with cursor-based pagination.
   *
   * First page:  getTimelineFeed({ limit: 10 })
   * Next pages:  getTimelineFeed({ cursor: '<postId>', limit: 10 })
   */
  static async getTimelineFeed(
    params: GetTimelineFeedParams = {},
  ): Promise<TimelineFeedResponse> {
    const searchParams = new URLSearchParams();

    if (params.cursor) {
      searchParams.set('cursor', params.cursor);
    }
    if (params.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params.algorithm) {
      searchParams.set('algorithm', params.algorithm);
    }

    const queryString = searchParams.toString();
    const url = `/posts/feed/timeline${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<TimelineFeedResponse>(url);

    // The Axios interceptor wraps the raw response into { data, message, success }.
    // `response.data` is that wrapper; `.data` inside it is the actual API payload.
    const payload = response.data as any;

    // Normalise: the interceptor puts the real body under `payload.data`
    const inner: TimelineFeedResponse = payload?.data ?? payload;

    return {
      data: inner.data ?? [],
      nextCursor: inner.nextCursor ?? null,
      hasNextPage: inner.hasNextPage ?? false,
    };
  }

  /**
   * Refresh timeline feed (get latest posts — first page with no cursor)
   */
  static async refreshTimelineFeed(): Promise<TimelineFeedResponse> {
    return this.getTimelineFeed({});
  }
}

/**
 * Export individual functions for easier imports
 */
export const feedService = {
  getTimelineFeed: FeedService.getTimelineFeed.bind(FeedService),
  refreshTimelineFeed: FeedService.refreshTimelineFeed.bind(FeedService),
};

export default feedService;
