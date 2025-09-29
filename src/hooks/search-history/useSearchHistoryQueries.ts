import { useQuery } from "@tanstack/react-query";
import SearchHistoryService from "@/services/search-history.service";
import { createQueryKeys } from "../utils";
import type { SearchHistoryQueryOptions } from "./types";

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
    queryFn: SearchHistoryService.getSearchHistory,
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (response) => response.data,
  });

  return {
    searchHistory,
  };
};

export default useSearchHistoryQueries;
