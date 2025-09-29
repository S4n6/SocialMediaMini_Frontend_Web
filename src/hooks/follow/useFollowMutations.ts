import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/follow.service";
import { useErrorHandler, createQueryKeys } from "../utils";

// Create query keys for follow domain
const followKeys = createQueryKeys("follow");

/**
 * Follow mutations hook - handles all write operations
 */
export const useFollowMutations = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

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

        handleSuccess("Successfully followed user!");
      } catch (error) {
        handleError(error, "FOLLOW_SUCCESS_HANDLER");
      }
    },
    onError: (error) => handleError(error, "FOLLOW_USER"),
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

        handleSuccess("Successfully unfollowed user!");
      } catch (error) {
        handleError(error, "UNFOLLOW_SUCCESS_HANDLER");
      }
    },
    onError: (error) => handleError(error, "UNFOLLOW_USER"),
  });

  return {
    followUser: followUserMutation,
    unfollowUser: unfollowUserMutation,
  };
};

export default useFollowMutations;
