import { useQuery } from "@tanstack/react-query";
import { searchHistoryService } from "@/services/api.service";
import { createQueryKeys } from "../utils";
import type { SearchHistoryQueryOptions } from "./types";
import type { SearchHistoryResponse, SearchHistoryApiResponse } from "./types";

// Create query keys for search history domain
const searchHistoryKeys = createQueryKeys("search-history");

/**
 * Search history queries hook - handles all read operations
 */
export const useSearchHistoryQueries = (
  options: SearchHistoryQueryOptions = {}
) => {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 2,
    enabled = true,
  } = options;

  /**
   * Get search history query
   */
  const searchHistory = useQuery({
    queryKey: [...searchHistoryKeys.lists()],
    queryFn: searchHistoryService.getSearchHistory,
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (
      response: SearchHistoryApiResponse | any
    ): SearchHistoryResponse => {
      const raw = response && response.data ? response.data : response;

      // backend might return { items: [...], total } or { history: [...], total } or an array directly
      if (Array.isArray(raw)) {
        // assume array of items
        return { history: raw, total: raw.length } as SearchHistoryResponse;
      }

      if (raw.items && Array.isArray(raw.items)) {
        return {
          history: raw.items,
          total: raw.total ?? raw.items.length,
        } as SearchHistoryResponse;
      }

      if (raw.history && Array.isArray(raw.history)) {
        return {
          history: raw.history,
          total: raw.total ?? raw.history.length,
        } as SearchHistoryResponse;
      }

      // fallback: try to coerce into the shape
      return {
        history: raw as any[],
        total: (raw && raw.total) || 0,
      } as SearchHistoryResponse;
    },
  });

  return {
    searchHistory,
  };
};

export default useSearchHistoryQueries;
