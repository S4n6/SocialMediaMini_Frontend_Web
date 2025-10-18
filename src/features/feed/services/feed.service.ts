import api from '@/lib/axios';
import type {
  GetTimelineFeedParams,
  TimelineFeedResponse,
} from '../types/feed.types';

/**
 * Feed service for timeline-related API calls
 */
export class FeedService {
  /**
   * Get user's timeline feed with pagination
   */
  static async getTimelineFeed(
    params: GetTimelineFeedParams = {},
  ): Promise<TimelineFeedResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) {
      searchParams.set('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params.lastPostId) {
      searchParams.set('lastPostId', params.lastPostId);
    }

    const queryString = searchParams.toString();
    const url = `/posts/feed/timeline${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<TimelineFeedResponse>(url);
    return response.data;
  }

  /**
   * Refresh timeline feed (get latest posts)
   */
  static async refreshTimelineFeed(): Promise<TimelineFeedResponse> {
    return this.getTimelineFeed({ page: 1 });
  }
}

/**
 * Export individual functions for easier imports
 */
export const feedService = {
  getTimelineFeed: FeedService.getTimelineFeed,
  refreshTimelineFeed: FeedService.refreshTimelineFeed,
};

export default feedService;
