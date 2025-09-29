import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";
import { useAppSelector } from "@/store/hooks";

// Import all query hooks
import {
  useCurrentUserQuery,
  useUserByIdQuery,
  useUserWithStatsQuery,
  useUserSearchQuery,
  useInfiniteUserSearchQuery,
  useUserSuggestionsQuery,
  useUserStatisticsQuery,
  useUserActivityQuery,
  userQueryKeys,
  userQueryConfigs,
} from "./useUserQueries";

// Import all mutation hooks
import {
  useUpdateUserProfileMutation,
  useUpdateUserAvatarMutation,
  useUpdateAccountSettingsMutation,
  useUpdatePasswordMutation,
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
  useRefreshSuggestionsMutation,
  useUserCacheManager,
  userMutationConfigs,
} from "./useUserMutations";

// Import types
import {
  UseUserConfig,
  UserSearchParams,
  UserSearchConfig,
  UserSuggestionConfig,
  UserProfileUpdate,
  UserAvatarUpdate,
  UserAccountSettings,
  UserPasswordUpdate,
  UserError,
} from "./types";

// ===== MAIN HOOK INTERFACE =====

/**
 * Options for the useUser hook
 */
export interface UseUserOptions {
  /** Specific user ID to fetch (optional) */
  userId?: string;
  /** Search parameters for user search (optional) */
  searchParams?: UserSearchParams;
  /** Configuration for the hook behavior */
  config?: UseUserConfig;
  /** Enable specific features */
  features?: {
    /** Enable current user query (default: true) */
    currentUser?: boolean;
    /** Enable user profile query when userId provided (default: true) */
    userProfile?: boolean;
    /** Enable user search when searchParams provided (default: true) */
    userSearch?: boolean;
    /** Enable user suggestions (default: false) */
    suggestions?: boolean;
    /** Enable user statistics (default: false) */
    statistics?: boolean;
    /** Enable user activity (default: false) */
    activity?: boolean;
  };
}

// ===== UNIFIED USER HOOK =====

/**
 * Unified user management hook that provides all user-related functionality
 *
 * @example
 * ```tsx
 * // Basic usage - get current user
 * const { currentUser, isLoadingCurrentUser } = useUser();
 *
 * // Get specific user profile
 * const { user, updateUserProfile } = useUser({
 *   userId: 'user-123'
 * });
 *
 * // Search users with infinite scroll
 * const { searchResults, searchNext, updateUserProfile } = useUser({
 *   searchParams: { query: 'john', limit: 20 },
 *   features: { userSearch: true }
 * });
 *
 * // Get user suggestions and statistics
 * const { suggestions, statistics } = useUser({
 *   userId: 'user-123',
 *   features: { suggestions: true, statistics: true }
 * });
 * ```
 */
export const useUser = (options: UseUserOptions = {}) => {
  const { userId, searchParams, config, features } = options;
  const queryClient = useQueryClient();
  const currentUserFromStore = useAppSelector((s) => s.auth.user);
  const cacheManager = useUserCacheManager();

  // Feature flags with defaults
  const enableCurrentUser = features?.currentUser ?? true;
  const enableUserProfile = features?.userProfile ?? !!userId;
  const enableUserSearch = features?.userSearch ?? !!searchParams;
  const enableSuggestions = features?.suggestions ?? false;
  const enableStatistics = features?.statistics ?? false;
  const enableActivity = features?.activity ?? false;

  // ===== QUERIES =====

  // Current user query
  const currentUserQuery = useCurrentUserQuery(
    enableCurrentUser ? config : undefined
  );

  // User profile query
  const userProfileQuery = useUserByIdQuery(
    enableUserProfile ? userId : undefined,
    config
  );

  // User with statistics query
  const userWithStatsQuery = useUserWithStatsQuery(
    enableStatistics ? userId : undefined,
    config
  );

  // User search query
  const userSearchQuery = useUserSearchQuery(
    enableUserSearch ? searchParams : undefined,
    config as UserSearchConfig
  );

  // Infinite user search query
  const infiniteUserSearchQuery = useInfiniteUserSearchQuery(
    enableUserSearch && searchParams ? { ...searchParams } : { query: "" },
    config as UserSearchConfig
  );

  // User suggestions query
  const userSuggestionsQuery = useUserSuggestionsQuery(
    enableSuggestions ? (config as UserSuggestionConfig) : undefined
  );

  // User statistics query
  const userStatisticsQuery = useUserStatisticsQuery(
    enableStatistics ? userId : undefined,
    config
  );

  // User activity query
  const userActivityQuery = useUserActivityQuery(
    enableActivity ? userId : undefined,
    undefined,
    config
  );

  // ===== MUTATIONS =====

  const updateProfileMutation = useUpdateUserProfileMutation(config);
  const updateAvatarMutation = useUpdateUserAvatarMutation(config);
  const updateAccountSettingsMutation =
    useUpdateAccountSettingsMutation(config);
  const updatePasswordMutation = useUpdatePasswordMutation(config);
  const deactivateAccountMutation = useDeactivateAccountMutation(config);
  const deleteAccountMutation = useDeleteAccountMutation(config);
  const refreshSuggestionsMutation = useRefreshSuggestionsMutation(config);

  // ===== ACTION FUNCTIONS =====

  /**
   * Update user profile information
   */
  const updateUserProfile = useCallback(
    (data: UserProfileUpdate) => {
      updateProfileMutation.mutate(data);
    },
    [updateProfileMutation]
  );

  /**
   * Update user avatar/profile picture
   */
  const updateUserAvatar = useCallback(
    (data: UserAvatarUpdate) => {
      updateAvatarMutation.mutate(data);
    },
    [updateAvatarMutation]
  );

  /**
   * Update account settings
   */
  const updateAccountSettings = useCallback(
    (settings: UserAccountSettings) => {
      updateAccountSettingsMutation.mutate(settings);
    },
    [updateAccountSettingsMutation]
  );

  /**
   * Update user password
   */
  const updatePassword = useCallback(
    (data: UserPasswordUpdate) => {
      updatePasswordMutation.mutate(data);
    },
    [updatePasswordMutation]
  );

  /**
   * Deactivate user account
   */
  const deactivateAccount = useCallback(
    (data: { reason?: string }) => {
      deactivateAccountMutation.mutate(data);
    },
    [deactivateAccountMutation]
  );

  /**
   * Delete user account permanently
   */
  const deleteAccount = useCallback(
    (data: { confirmPassword: string; reason?: string }) => {
      deleteAccountMutation.mutate(data);
    },
    [deleteAccountMutation]
  );

  /**
   * Refresh user suggestions
   */
  const refreshSuggestions = useCallback(() => {
    refreshSuggestionsMutation.mutate();
  }, [refreshSuggestionsMutation]);

  /**
   * Search users with a new query
   */
  const searchUsers = useCallback(
    (newSearchParams: UserSearchParams) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.search(newSearchParams),
      });
    },
    [queryClient]
  );

  /**
   * Load next page for infinite search
   */
  const searchNext = useCallback(() => {
    if (infiniteUserSearchQuery.hasNextPage) {
      infiniteUserSearchQuery.fetchNextPage();
    }
  }, [infiniteUserSearchQuery]);

  /**
   * Get user by ID (direct service call)
   */
  const getUserById = useCallback(
    async (id: string) => {
      const existingUser = queryClient.getQueryData(userQueryKeys.user(id));
      if (existingUser) {
        return existingUser as User;
      }

      // Trigger query if not in cache
      queryClient.prefetchQuery({
        queryKey: userQueryKeys.user(id),
        queryFn: async () => {
          const { UserService } = await import("@/services/users.service");
          const response = await UserService.getUserById(id);
          return response.data as User;
        },
      });

      return null;
    },
    [queryClient]
  );

  /**
   * Prefetch user data for better UX
   */
  const prefetchUser = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: userQueryKeys.user(id),
        queryFn: async () => {
          const { UserService } = await import("@/services/users.service");
          const response = await UserService.getUserById(id);
          return response.data as User;
        },
      });
    },
    [queryClient]
  );

  // ===== CACHE MANAGEMENT =====

  /**
   * Manually refresh current user
   */
  const refreshCurrentUser = useCallback(() => {
    currentUserQuery.refetch();
  }, [currentUserQuery]);

  /**
   * Manually refresh user profile
   */
  const refreshUserProfile = useCallback(() => {
    if (userId) {
      userProfileQuery.refetch();
    }
  }, [userProfileQuery, userId]);

  /**
   * Clear user caches
   */
  const clearUserCaches = useCallback(() => {
    cacheManager.invalidateUserCaches({
      invalidateCurrentUser: true,
      invalidateSearches: true,
      invalidateSuggestions: true,
    });
  }, [cacheManager]);

  // ===== COMPUTED VALUES =====

  // Get the most up-to-date current user data
  const currentUser = currentUserQuery.data?.user || currentUserFromStore;

  // Determine which user data to return
  const user = enableStatistics
    ? userWithStatsQuery.data
    : userProfileQuery.data;

  // Combine search results
  const searchResults = enableUserSearch
    ? userSearchQuery.data?.users || []
    : [];

  const infiniteSearchResults = enableUserSearch
    ? infiniteUserSearchQuery.data?.pages.flatMap((page) => page.users) || []
    : [];

  // Get suggestions
  const suggestions = enableSuggestions
    ? userSuggestionsQuery.data?.suggestions || []
    : [];

  // Get statistics
  const statistics = enableStatistics
    ? userWithStatsQuery.data?.statistics || userStatisticsQuery.data
    : undefined;

  // Get activity
  const activity = enableActivity ? userActivityQuery.data || [] : [];

  // ===== LOADING STATES =====

  const isLoadingCurrentUser = currentUserQuery.isLoading;
  const isLoadingUser =
    userProfileQuery.isLoading || userWithStatsQuery.isLoading;
  const isLoadingSearch = userSearchQuery.isLoading;
  const isLoadingSuggestions = userSuggestionsQuery.isLoading;
  const isLoadingStatistics = userStatisticsQuery.isLoading;
  const isLoadingActivity = userActivityQuery.isLoading;

  // Mutation loading states
  const isUpdatingProfile = updateProfileMutation.isPending;
  const isUpdatingAvatar = updateAvatarMutation.isPending;
  const isUpdatingSettings = updateAccountSettingsMutation.isPending;
  const isUpdatingPassword = updatePasswordMutation.isPending;
  const isDeactivatingAccount = deactivateAccountMutation.isPending;
  const isDeletingAccount = deleteAccountMutation.isPending;
  const isRefreshingSuggestions = refreshSuggestionsMutation.isPending;

  // ===== ERROR STATES =====

  const currentUserError = currentUserQuery.error;
  const userError = userProfileQuery.error || userWithStatsQuery.error;
  const searchError = userSearchQuery.error;
  const suggestionsError = userSuggestionsQuery.error;
  const statisticsError = userStatisticsQuery.error;
  const activityError = userActivityQuery.error;

  // Mutation error states
  const updateProfileError = updateProfileMutation.error;
  const updateAvatarError = updateAvatarMutation.error;
  const updateSettingsError = updateAccountSettingsMutation.error;
  const updatePasswordError = updatePasswordMutation.error;

  // ===== RETURN VALUE =====

  return {
    // ===== DATA =====
    currentUser,
    user,
    searchResults,
    infiniteSearchResults,
    suggestions,
    statistics,
    activity,

    // ===== LOADING STATES =====
    isLoadingCurrentUser,
    isLoadingUser,
    isLoadingSearch,
    isLoadingSuggestions,
    isLoadingStatistics,
    isLoadingActivity,

    // Mutation loading states
    isUpdatingProfile,
    isUpdatingAvatar,
    isUpdatingSettings,
    isUpdatingPassword,
    isDeactivatingAccount,
    isDeletingAccount,
    isRefreshingSuggestions,

    // ===== ERROR STATES =====
    currentUserError,
    userError,
    searchError,
    suggestionsError,
    statisticsError,
    activityError,
    updateProfileError,
    updateAvatarError,
    updateSettingsError,
    updatePasswordError,

    // ===== ACTIONS =====
    updateUserProfile,
    updateUserAvatar,
    updateAccountSettings,
    updatePassword,
    deactivateAccount,
    deleteAccount,
    refreshSuggestions,
    searchUsers,
    searchNext,
    getUserById,
    prefetchUser,

    // ===== CACHE MANAGEMENT =====
    refreshCurrentUser,
    refreshUserProfile,
    clearUserCaches,

    // ===== INFINITE SEARCH =====
    hasNextPage: infiniteUserSearchQuery.hasNextPage,
    hasPreviousPage: infiniteUserSearchQuery.hasPreviousPage,
    isFetchingNextPage: infiniteUserSearchQuery.isFetchingNextPage,
    fetchNextPage: infiniteUserSearchQuery.fetchNextPage,
    fetchPreviousPage: infiniteUserSearchQuery.fetchPreviousPage,

    // ===== RAW QUERY OBJECTS (for advanced usage) =====
    queries: {
      currentUser: currentUserQuery,
      userProfile: userProfileQuery,
      userWithStats: userWithStatsQuery,
      userSearch: userSearchQuery,
      infiniteUserSearch: infiniteUserSearchQuery,
      suggestions: userSuggestionsQuery,
      statistics: userStatisticsQuery,
      activity: userActivityQuery,
    },

    mutations: {
      updateProfile: updateProfileMutation,
      updateAvatar: updateAvatarMutation,
      updateSettings: updateAccountSettingsMutation,
      updatePassword: updatePasswordMutation,
      deactivateAccount: deactivateAccountMutation,
      deleteAccount: deleteAccountMutation,
      refreshSuggestions: refreshSuggestionsMutation,
    },

    // ===== UTILITIES =====
    cacheManager,
    queryKeys: userQueryKeys,
    configs: {
      queries: userQueryConfigs,
      mutations: userMutationConfigs,
    },
  };
};

// ===== LEGACY COMPATIBILITY =====

/**
 * Legacy useUser hook for backward compatibility
 * @deprecated Use the new useUser hook with options parameter
 */
export const useLegacyUser = (options?: {
  userId?: string;
  searchQuery?: string;
}) => {
  const searchParams = options?.searchQuery
    ? { query: options.searchQuery }
    : undefined;

  return useUser({
    userId: options?.userId,
    searchParams,
    features: {
      currentUser: true,
      userProfile: !!options?.userId,
      userSearch: !!options?.searchQuery,
    },
  });
};

// ===== EXPORTS =====

// Re-export everything from the domain
export * from "./types";
export * from "./useUserQueries";
export * from "./useUserMutations";

// Export the main hook as default
export default useUser;
