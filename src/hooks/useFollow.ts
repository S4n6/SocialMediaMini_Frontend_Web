import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/follow.service";
import type { FollowStats, FollowStatus } from "@/services/follow.service";

// Query keys
export const followKeys = {
  all: ["follow"] as const,
  followers: (userId?: string) =>
    userId
      ? ([...followKeys.all, "followers", userId] as const)
      : ([...followKeys.all, "followers"] as const),
  following: (userId?: string) =>
    userId
      ? ([...followKeys.all, "following", userId] as const)
      : ([...followKeys.all, "following"] as const),
  status: (targetUserId: string) =>
    [...followKeys.all, "status", targetUserId] as const,
  stats: (userId?: string) =>
    userId
      ? ([...followKeys.all, "stats", userId] as const)
      : ([...followKeys.all, "stats"] as const),
};

// Get followers of a user
export const useFollowers = (userId?: string) => {
  return useQuery({
    queryKey: followKeys.followers(userId),
    queryFn: () =>
      userId
        ? followService.getFollowers(userId)
        : followService.getMyFollowers(),
    enabled: !!userId || userId === undefined, // Enable if userId provided or getting own followers
  });
};

// Get following list of a user
export const useFollowing = (userId?: string) => {
  return useQuery({
    queryKey: followKeys.following(userId),
    queryFn: () =>
      userId
        ? followService.getFollowing(userId)
        : followService.getMyFollowing(),
    enabled: !!userId || userId === undefined, // Enable if userId provided or getting own following
  });
};

// Get follow status with a specific user
export const useFollowStatus = (targetUserId: string) => {
  return useQuery({
    queryKey: followKeys.status(targetUserId),
    queryFn: () => followService.checkFollowStatus(targetUserId),
    enabled: !!targetUserId,
  });
};

// Get user stats (followers/following counts)
export const useUserStats = (userId?: string) => {
  return useQuery({
    queryKey: followKeys.stats(userId),
    queryFn: () =>
      userId ? followService.getUserStats(userId) : followService.getMyStats(),
    enabled: !!userId || userId === undefined, // Enable if userId provided or getting own stats
  });
};

// Follow user mutation
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) =>
      followService.followUser(targetUserId),
    onSuccess: (_, targetUserId) => {
      // Invalidate follow-related queries
      queryClient.invalidateQueries({ queryKey: followKeys.all });
      queryClient.invalidateQueries({
        queryKey: followKeys.status(targetUserId),
      });

      // Invalidate stats for both users
      queryClient.invalidateQueries({ queryKey: followKeys.stats() }); // Current user
      queryClient.invalidateQueries({
        queryKey: followKeys.stats(targetUserId),
      }); // Target user

      // Invalidate followers/following lists
      queryClient.invalidateQueries({ queryKey: followKeys.following() }); // Current user's following
      queryClient.invalidateQueries({
        queryKey: followKeys.followers(targetUserId),
      }); // Target user's followers
    },
    onError: (error) => {
      console.error("Failed to follow user:", error);
    },
  });
};

// Unfollow user mutation
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) =>
      followService.unfollowUser(targetUserId),
    onSuccess: (_, targetUserId) => {
      // Invalidate follow-related queries
      queryClient.invalidateQueries({ queryKey: followKeys.all });
      queryClient.invalidateQueries({
        queryKey: followKeys.status(targetUserId),
      });

      // Invalidate stats for both users
      queryClient.invalidateQueries({ queryKey: followKeys.stats() }); // Current user
      queryClient.invalidateQueries({
        queryKey: followKeys.stats(targetUserId),
      }); // Target user

      // Invalidate followers/following lists
      queryClient.invalidateQueries({ queryKey: followKeys.following() }); // Current user's following
      queryClient.invalidateQueries({
        queryKey: followKeys.followers(targetUserId),
      }); // Target user's followers
    },
    onError: (error) => {
      console.error("Failed to unfollow user:", error);
    },
  });
};

// Combined hook for easier use in components
export const useFollowActions = (targetUserId: string) => {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { data: followStatus, isLoading: statusLoading } =
    useFollowStatus(targetUserId);

  const isFollowing = followStatus?.data?.isFollowing ?? false;
  const isLoading =
    followMutation.isPending || unfollowMutation.isPending || statusLoading;

  const toggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate(targetUserId);
    } else {
      followMutation.mutate(targetUserId);
    }
  };

  return {
    isFollowing,
    isLoading,
    toggleFollow,
    followUser: () => followMutation.mutate(targetUserId),
    unfollowUser: () => unfollowMutation.mutate(targetUserId),
    error: followMutation.error || unfollowMutation.error,
  };
};
