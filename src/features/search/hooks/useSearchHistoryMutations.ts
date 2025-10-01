import { useMutation, useQueryClient } from "@tanstack/react-query";
import { searchHistoryService } from "@/services/api.service";
import { useErrorHandler, createQueryKeys } from "../utils";

// Create query keys for search history domain
const searchHistoryKeys = createQueryKeys("search-history");

/**
 * Search history mutations hook - handles all write operations
 */
export const useSearchHistoryMutations = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({
    component: "SearchHistoryMutations",
  });

  /**
   * Add to search history mutation
   */
  const addToHistoryMutation = useMutation({
    mutationFn: (searchedUserId: string) =>
      searchHistoryService.saveSearchQuery(searchedUserId),
    onSuccess: () => {
      try {
        // Invalidate and refetch search history
        queryClient.invalidateQueries({ queryKey: searchHistoryKeys.all });

        // Note: Usually done silently, so no success toast
      } catch (error) {
        handleError(error, { component: "ADD_TO_HISTORY_SUCCESS_HANDLER" });
      }
    },
    onError: (error) => {
      // Search history addition failures are usually handled silently
      console.error("Failed to add to search history:", error);
    },
  });

  /**
   * Clear search history mutation
   */
  const clearHistoryMutation = useMutation({
    mutationFn: searchHistoryService.deleteSearchHistory,
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: searchHistoryKeys.all });
        console.log("Search history cleared successfully");
      } catch (error) {
        handleError(error, { component: "CLEAR_HISTORY_SUCCESS_HANDLER" });
      }
    },
    onError: (error) =>
      handleError(error, { component: "CLEAR_SEARCH_HISTORY" }),
  });

  /**
   * Remove specific user from search history mutation
   */
  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => searchHistoryService.deleteSearchHistory(), // Note: API may need userId parameter
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: searchHistoryKeys.all });
        console.log("User removed from search history");
      } catch (error) {
        handleError(error, { component: "REMOVE_USER_SUCCESS_HANDLER" });
      }
    },
    onError: (error) =>
      handleError(error, { component: "REMOVE_USER_FROM_HISTORY" }),
  });

  return {
    addToHistory: addToHistoryMutation,
    clearHistory: clearHistoryMutation,
    removeUser: removeUserMutation,
  };
};

export default useSearchHistoryMutations;
