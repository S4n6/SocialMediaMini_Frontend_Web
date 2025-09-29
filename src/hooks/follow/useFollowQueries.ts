import { useQuery } from "@tanstack/react-query";
import { followService } from "@/services/follow.service";
import { createQueryKeys } from "../utils";
import type { FollowQueryOptions } from "./types";

// Create query keys for follow domain
const followKeys = createQueryKeys("follow");

/**
 * Follow queries hook - handles all read operations
 */
export const useFollowQueries = (options: FollowQueryOptions = {}) => {
  const {
    userId,
    targetUserId,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    enabled = true,
  } = options;

  /**
   * Get followers query
   */
  const followers = useQuery({
    queryKey: [...followKeys.detail(`followers-${userId || "me"}`)],
    queryFn: () =>
      userId
        ? followService.getFollowers(userId)
        : followService.getMyFollowers(),
    enabled: enabled && (!!userId || userId === undefined),
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (response) => response.data,
  });

  /**
   * Get following query
   */
  const following = useQuery({
    queryKey: [...followKeys.detail(`following-${userId || "me"}`)],
    queryFn: () =>
      userId
        ? followService.getFollowing(userId)
        : followService.getMyFollowing(),
    enabled: enabled && (!!userId || userId === undefined),
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (response) => response.data,
  });

  /**
   * Get follow status query
   */
  const followStatus = useQuery({
    queryKey: [...followKeys.detail(`status-${targetUserId}`)],
    queryFn: () => followService.checkFollowStatus(targetUserId!),
    enabled: enabled && !!targetUserId,
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (response) => response.data,
  });

  /**
   * Get user stats query
   */
  const userStats = useQuery({
    queryKey: [...followKeys.detail(`stats-${userId || "me"}`)],
    queryFn: () =>
      userId ? followService.getUserStats(userId) : followService.getMyStats(),
    enabled: enabled && (!!userId || userId === undefined),
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (response) => response.data,
  });

  return {
    followers,
    following,
    followStatus,
    userStats,
  };
};

export default useFollowQueries;
