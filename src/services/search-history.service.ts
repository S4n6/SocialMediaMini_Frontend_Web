import { ApiResponse, api } from "@/lib/axios";
import {
  SearchHistoryResponse,
  AddSearchHistoryDto,
  SearchHistoryItem,
} from "@/types/search-history";

/**
 * Search History Service
 * Handles all API calls related to user search history
 */
export class SearchHistoryService {
  /**
   * Get user's search history
   */
  static async getSearchHistory(): Promise<ApiResponse<SearchHistoryResponse>> {
    try {
      const response = await api.get<ApiResponse<SearchHistoryResponse>>(
        "/search-history"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching search history:", error);
      throw error;
    }
  }

  /**
   * Add a searched user to user's history
   */
  static async addToSearchHistory(
    searchedUserId: string
  ): Promise<ApiResponse<null>> {
    try {
      const payload: AddSearchHistoryDto = { searchedUserId };
      const response = await api.post<ApiResponse<null>>(
        "/search-history",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error adding to search history:", error);
      throw error;
    }
  }

  /**
   * Clear all search history for the user
   */
  static async clearSearchHistory(): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(
        "/search-history/clear"
      );
      return response.data;
    } catch (error) {
      console.error("Error clearing search history:", error);
      throw error;
    }
  }

  /**
   * Remove a specific user from user's history
   */
  static async removeUserFromHistory(
    userId: string
  ): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>("/search-history", {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error removing user from search history:", error);
      throw error;
    }
  }
}

export default SearchHistoryService;
