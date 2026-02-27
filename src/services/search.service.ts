import { ApiResponse } from '@/types';
import { User, Post } from '@/types';
import { ok } from './helpers';

// ============ SEARCH & DISCOVERY ENDPOINTS ============
export const searchHistoryService = {
  searchAll: async (
    query: string,
  ): Promise<
    ApiResponse<{
      users: User[];
      posts: Post[];
      hashtags: string[];
    }>
  > => {
    return ok({ users: [], posts: [], hashtags: [] }, 'search.searchAll');
  },

  getSearchHistory: async (): Promise<ApiResponse<string[]>> => {
    return ok([] as string[], 'search.getSearchHistory');
  },

  saveSearchQuery: async (query: string): Promise<ApiResponse<null>> => {
    return ok(null, 'search.saveSearchQuery');
  },

  deleteSearchHistory: async (): Promise<ApiResponse<null>> => {
    return ok(null, 'search.deleteSearchHistory');
  },

  getTrendingHashtags: async (): Promise<ApiResponse<string[]>> => {
    return ok([] as string[], 'search.getTrendingHashtags');
  },
};
