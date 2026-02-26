import { useCallback } from 'react';
import { useFollowQueries } from './useFollowQueries';
import { useFollowMutations } from './useFollowMutations';
import type {
  FollowConfig,
  FollowState,
  FollowActions,
  FollowActionsResult,
} from '../../types/follow.types';

/**
 * Main follow hook that combines queries, mutations, and business logic
 * This is the public API that components should use
 */
export const useFollow = (options: FollowConfig = {}) => {
  const { userId, targetUserId, enableToast = true, ...queryOptions } = options;

  // Get queries and mutations
  const queries = useFollowQueries({ userId, targetUserId, ...queryOptions });
  const mutations = useFollowMutations();

  // Create action methods
  const actions: FollowActions = {
    followUser: useCallback(
      async (targetId: string) => {
        return mutations.followUser.mutateAsync(targetId);
      },
      [mutations.followUser],
    ),

    unfollowUser: useCallback(
      async (targetId: string) => {
        return mutations.unfollowUser.mutateAsync(targetId);
      },
      [mutations.unfollowUser],
    ),

    toggleFollowUser: useCallback(
      async (targetId: string) => {
        const isFollowing = queries.followStatus.data?.isFollowing ?? false;
        if (isFollowing) {
          await mutations.unfollowUser.mutateAsync(targetId);
        } else {
          await mutations.followUser.mutateAsync(targetId);
        }
      },
      [queries.followStatus.data, mutations.followUser, mutations.unfollowUser],
    ),
  };

  // Create state object
  const state: FollowState = {
    followers: queries.followers.data || [],
    following: queries.following.data || [],
    followStatus: queries.followStatus.data || null,
    userStats: queries.userStats.data || null,
    isFollowing: queries.followStatus.data?.isFollowing ?? false,
    isLoading:
      Object.values(queries).some((q) => q.isLoading) ||
      Object.values(mutations).some((m) => m.isPending),
    error: null, // Will be handled by individual error states
  };

  // Convenience method for specific target user
  const getFollowActions = useCallback(
    (targetId: string): FollowActionsResult => {
      const isFollowing = queries.followStatus.data?.isFollowing ?? false;
      const isLoading =
        queries.followStatus.isLoading ||
        mutations.followUser.isPending ||
        mutations.unfollowUser.isPending;

      const toggleFollow = async () => {
        await actions.toggleFollowUser(targetId);
      };

      const followUser = async () => {
        await actions.followUser(targetId);
      };

      const unfollowUser = async () => {
        await actions.unfollowUser(targetId);
      };

      const error = null; // Will be handled by component-specific error states

      return {
        isFollowing,
        isLoading,
        toggleFollow,
        followUser,
        unfollowUser,
        error,
      };
    },
    [
      queries.followStatus.data,
      queries.followStatus.isLoading,
      queries.followStatus.error,
      mutations.followUser,
      mutations.unfollowUser,
      actions,
    ],
  );

  return {
    // State
    ...state,

    // Actions (high-level API)
    ...actions,

    // Loading states (detailed)
    isLoadingFollowers: queries.followers.isLoading,
    isLoadingFollowing: queries.following.isLoading,
    isLoadingFollowStatus: queries.followStatus.isLoading,
    isLoadingUserStats: queries.userStats.isLoading,
    isFollowingUser: mutations.followUser.isPending,
    isUnfollowingUser: mutations.unfollowUser.isPending,

    // Error states (detailed)
    followersError: queries.followers.error,
    followingError: queries.following.error,
    followStatusError: queries.followStatus.error,
    userStatsError: queries.userStats.error,
    followError: mutations.followUser.error,
    unfollowError: mutations.unfollowUser.error,

    // Refetch methods
    refetchFollowers: queries.followers.refetch,
    refetchFollowing: queries.following.refetch,
    refetchFollowStatus: queries.followStatus.refetch,
    refetchUserStats: queries.userStats.refetch,

    // Convenience methods
    getFollowActions,

    // Raw mutations (for advanced usage with custom callbacks)
    mutations: {
      followUserMutation: mutations.followUser,
      unfollowUserMutation: mutations.unfollowUser,
    },

    // Legacy aliases for backward compatibility
    followUserMutation: mutations.followUser,
    unfollowUserMutation: mutations.unfollowUser,

    // Computed states
    isProcessing:
      mutations.followUser.isPending || mutations.unfollowUser.isPending,
    followersCount: queries.userStats.data?.followersCount || 0,
    followingCount: queries.userStats.data?.followingCount || 0,
  };
};

export default useFollow;
