import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/api.service";
import { useErrorHandler, createQueryKeys } from "../utils";

// Create query keys for follow domain
const followKeys = createQueryKeys("follow");

/**
 * Follow mutations hook - handles all write operations
 */
export const useFollowMutations = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ component: "FollowMutations" });

  /**
   * Follow user mutation
   */
  const followUserMutation = useMutation({
    mutationFn: (targetId: string) => followService.followUser(targetId),
    onSuccess: (response, targetId) => {
      try {
        // Invalidate all follow-related queries
        queryClient.invalidateQueries({ queryKey: followKeys.all });

        // Invalidate specific queries
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(`status-${targetId}`),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail("stats-me"),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(`stats-${targetId}`),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail("following-me"),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(`followers-${targetId}`),
        });

        console.log("Successfully followed user!");
      } catch (error) {
        handleError(error, { component: "FOLLOW_SUCCESS_HANDLER" });
      }
    },
    onError: (error) => handleError(error, { component: "FOLLOW_USER" }),
  });

  /**
   * Unfollow user mutation
   */
  const unfollowUserMutation = useMutation({
    mutationFn: (targetId: string) => followService.unfollowUser(targetId),
    onSuccess: (response, targetId) => {
      try {
        // Invalidate all follow-related queries
        queryClient.invalidateQueries({ queryKey: followKeys.all });

        // Invalidate specific queries
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(`status-${targetId}`),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail("stats-me"),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(`stats-${targetId}`),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail("following-me"),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(`followers-${targetId}`),
        });

        console.log("Successfully unfollowed user!");
      } catch (error) {
        handleError(error, { component: "UNFOLLOW_SUCCESS_HANDLER" });
      }
    },
    onError: (error) => handleError(error, { component: "UNFOLLOW_USER" }),
  });

  return {
    followUser: followUserMutation,
    unfollowUser: unfollowUserMutation,
  };
};

export default useFollowMutations;
