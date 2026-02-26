import { useCallback } from "react";
import { useSearchHistoryQueries } from "./useSearchHistoryQueries";
import { useSearchHistoryMutations } from "./useSearchHistoryMutations";
import type {
  SearchHistoryConfig,
  SearchHistoryState,
  SearchHistoryActions,
  SearchHistoryItem,
  SearchSuggestionOptions,
} from "./types";

/**
 * Main search history hook that combines queries, mutations, and business logic
 * This is the public API that components should use
 */
export const useSearchHistory = (options: SearchHistoryConfig = {}) => {
  const { enableToast = true, maxHistoryItems = 50, ...queryOptions } = options;

  // Get queries and mutations
  const queries = useSearchHistoryQueries(queryOptions);
  const mutations = useSearchHistoryMutations();

  // Create action methods
  const actions: SearchHistoryActions = {
    addUserToHistory: useCallback(
      async (searchedUserId: string) => {
        if (searchedUserId && searchedUserId.trim().length > 0) {
          return mutations.addToHistory.mutateAsync(searchedUserId.trim());
        }
        throw new Error("Invalid user ID provided");
      },
      [mutations.addToHistory]
    ),

    clearHistory: useCallback(async () => {
      return mutations.clearHistory.mutateAsync();
    }, [mutations.clearHistory]),

    removeUserFromHistory: useCallback(
      async (userId: string) => {
        return mutations.removeUser.mutateAsync(userId);
      },
      [mutations.removeUser]
    ),

    getSearchSuggestions: useCallback(
      (
        currentQuery: string,
        suggestionOptions: SearchSuggestionOptions = {}
      ): SearchHistoryItem[] => {
        const {
          maxResults = 10,
          includeUserName = true,
          includeFullName = true,
          caseSensitive = false,
        } = suggestionOptions;

        const historyData: SearchHistoryItem[] =
          queries.searchHistory.data?.history || [];

        if (!currentQuery.trim()) {
          return historyData.slice(0, maxResults);
        }

        const query = caseSensitive
          ? currentQuery.trim()
          : currentQuery.toLowerCase().trim();

        const filtered = historyData.filter((item: SearchHistoryItem) => {
          const userName = caseSensitive
            ? item.user.userName
            : item.user.userName.toLowerCase();
          const fullNameRaw = item.user.fullName ?? "";
          const fullName = caseSensitive
            ? fullNameRaw
            : fullNameRaw.toLowerCase();

          let matches = false;
          if (includeUserName && userName.includes(query)) {
            matches = true;
          }
          if (includeFullName && fullName.includes(query)) {
            matches = true;
          }

          return matches;
        });

        return filtered.slice(0, maxResults);
      },
      [queries.searchHistory.data]
    ),
  };

  // Create state object
  const state: SearchHistoryState = {
    searchHistory: queries.searchHistory.data?.history || [],
    totalHistory: queries.searchHistory.data?.total || 0,
    isLoading:
      queries.searchHistory.isLoading ||
      Object.values(mutations).some((m) => m.isPending),
    error: null, // Will be handled by individual error states
    hasHistory: (queries.searchHistory.data?.total || 0) > 0,
  };

  return {
    // State
    ...state,

    // Actions (high-level API)
    ...actions,

    // Loading states (detailed)
    isLoadingHistory: queries.searchHistory.isLoading,
    isAddingToHistory: mutations.addToHistory.isPending,
    isClearingHistory: mutations.clearHistory.isPending,
    isRemovingUser: mutations.removeUser.isPending,

    // Error states (detailed)
    historyError: queries.searchHistory.error,
    addToHistoryError: mutations.addToHistory.error,
    clearHistoryError: mutations.clearHistory.error,
    removeUserError: mutations.removeUser.error,

    // Refetch methods
    refetchHistory: queries.searchHistory.refetch,

    // Raw mutations (for advanced usage with custom callbacks)
    mutations: {
      addToHistoryMutation: mutations.addToHistory,
      clearHistoryMutation: mutations.clearHistory,
      removeUserMutation: mutations.removeUser,
    },

    // Legacy aliases for backward compatibility
    addToHistoryMutation: mutations.addToHistory,
    clearHistoryMutation: mutations.clearHistory,
    removeUserMutation: mutations.removeUser,

    // Data aliases for backward compatibility
    searchHistoryData: queries.searchHistory.data,

    // Utility methods
    getRecentSearches: useCallback(
      (limit: number = 5) => {
        return (queries.searchHistory.data?.history || []).slice(0, limit);
      },
      [queries.searchHistory.data]
    ),

    isUserInHistory: useCallback(
      (userId: string) => {
        return (queries.searchHistory.data?.history || []).some(
          (item: any) => item.user.id === userId
        );
      },
      [queries.searchHistory.data]
    ),

    getHistoryByTimeRange: useCallback(
      (hours: number = 24) => {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return (queries.searchHistory.data?.history || []).filter(
          (item: any) => new Date(item.searchedAt) > cutoffTime
        );
      },
      [queries.searchHistory.data]
    ),
  };
};

export default useSearchHistory;
