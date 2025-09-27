import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SearchHistoryService from "@/services/search-history.service";
import {
  SearchHistoryItem,
  SearchHistoryResponse,
} from "@/types/search-history";
import { toast } from "sonner";

/**
 * Custom hook for managing search history
 */
export const useSearchHistory = () => {
  const queryClient = useQueryClient();

  // Query Keys
  const QUERY_KEYS = {
    searchHistory: ["search-history"] as const,
  };

  /**
   * Get search history query
   */
  const {
    data: searchHistoryData,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: QUERY_KEYS.searchHistory,
    queryFn: SearchHistoryService.getSearchHistory,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Add to search history mutation
   */
  const addToHistoryMutation = useMutation({
    mutationFn: (searchedUserId: string) =>
      SearchHistoryService.addToSearchHistory(searchedUserId),
    onSuccess: () => {
      // Invalidate and refetch search history
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchHistory });
    },
    onError: (error) => {
      console.error("Failed to add to search history:", error);
      // Don't show toast for this as it's usually done silently
    },
  });

  /**
   * Clear search history mutation
   */
  const clearHistoryMutation = useMutation({
    mutationFn: SearchHistoryService.clearSearchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchHistory });
      toast.success("Search history cleared successfully");
    },
    onError: (error) => {
      console.error("Failed to clear search history:", error);
      toast.error("Failed to clear search history");
    },
  });

  /**
   * Remove specific user from search history mutation
   */
  const removeUserMutation = useMutation({
    mutationFn: (userId: string) =>
      SearchHistoryService.removeUserFromHistory(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchHistory });
      toast.success("User removed from search history");
    },
    onError: (error) => {
      console.error("Failed to remove user from search history:", error);
      toast.error("Failed to remove user from search history");
    },
  });

  /**
   * Add user to search history (manual)
   */
  const addUserToHistory = useCallback(
    (searchedUserId: string) => {
      if (searchedUserId && searchedUserId.trim().length > 0) {
        addToHistoryMutation.mutate(searchedUserId.trim());
      }
    },
    [addToHistoryMutation]
  );

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(() => {
    clearHistoryMutation.mutate();
  }, [clearHistoryMutation]);

  /**
   * Remove specific user from history
   */
  const removeUserFromHistory = useCallback(
    (userId: string) => {
      removeUserMutation.mutate(userId);
    },
    [removeUserMutation]
  );

  /**
   * Get search suggestions based on history
   */
  const getSearchSuggestions = useCallback(
    (currentQuery: string): SearchHistoryItem[] => {
      if (!searchHistoryData?.history || !currentQuery.trim()) {
        return searchHistoryData?.history || [];
      }

      const query = currentQuery.toLowerCase().trim();
      return searchHistoryData.history.filter(
        (item) =>
          item.user.userName.toLowerCase().includes(query) ||
          item.user.fullName.toLowerCase().includes(query)
      );
    },
    [searchHistoryData]
  );

  return {
    // Data
    searchHistory: searchHistoryData?.history || [],
    totalHistory: searchHistoryData?.total || 0,

    // Loading states
    isLoadingHistory,
    isAddingToHistory: addToHistoryMutation.isPending,
    isClearingHistory: clearHistoryMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,

    // Error states
    historyError,

    // Actions
    addUserToHistory,
    clearHistory,
    removeUserFromHistory,
    refetchHistory,
    getSearchSuggestions,

    // Utility
    hasHistory: (searchHistoryData?.total || 0) > 0,
  };
};

export default useSearchHistory;
