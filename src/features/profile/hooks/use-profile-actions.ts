import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { followService, usersService } from "@/services/api.service";
import type { ProfileData, UpdateProfileData } from "../types";

/**
 * Hook for profile actions (follow, unfollow, block, etc.)
 */
export const useProfileActions = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleError } = useErrorHandler({ component: "useProfileActions" });

  // Follow user
  const followMutation = useMutation({
    mutationFn: followService.followUser,
    onSuccess: (_, userId) => {
      // Update profile data
      queryClient.setQueryData(
        ["profile", userId],
        (oldData: ProfileData | undefined) =>
          oldData
            ? {
                ...oldData,
                isFollowing: true,
                stats: {
                  ...oldData.stats,
                  followersCount: oldData.stats.followersCount + 1,
                },
              }
            : oldData
      );

      // Update user's own following count
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

      toast.success("Following user!");
    },
    onError: (error, userId) => {
      handleError(error, {
        action: "follow_user",
        component: "useProfileActions",
        userId: userId,
      });
    },
  });

  // Unfollow user
  const unfollowMutation = useMutation({
    mutationFn: followService.unfollowUser,
    onSuccess: (_, userId) => {
      // Update profile data
      queryClient.setQueryData(
        ["profile", userId],
        (oldData: ProfileData | undefined) =>
          oldData
            ? {
                ...oldData,
                isFollowing: false,
                stats: {
                  ...oldData.stats,
                  followersCount: Math.max(0, oldData.stats.followersCount - 1),
                },
              }
            : oldData
      );

      // Update user's own following count
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

      toast.success("Unfollowed user");
    },
    onError: (error, userId) => {
      handleError(error, {
        action: "unfollow_user",
        component: "useProfileActions",
        userId: userId,
      });
    },
  });

  // Block user
  const blockMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Assuming we have a block service
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      return response.json();
    },
    onSuccess: (_, userId) => {
      // Remove user from all queries
      queryClient.removeQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });

      toast.success("User blocked successfully");
    },
    onError: (error, userId) => {
      handleError(error, {
        action: "block_user",
        component: "useProfileActions",
        userId: userId,
      });
    },
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (updatedProfile) => {
      // Update all profile queries
      queryClient.setQueryData(["profile", "me"], updatedProfile);
      queryClient.setQueryData(["profile", updatedProfile.id], updatedProfile);

      // Update auth store if needed
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      handleError(error, {
        action: "update_profile",
        component: "useProfileActions",
      });
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();

      // Redirect to login
      router.push("/login");

      toast.success("Account deleted successfully");
    },
    onError: (error) => {
      handleError(error, {
        action: "delete_account",
        component: "useProfileActions",
      });
    },
  });

  return {
    // Actions
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    blockUser: blockMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,

    // Loading states
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
    isBlocking: blockMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,

    // Error states
    followError: followMutation.error,
    unfollowError: unfollowMutation.error,
    blockError: blockMutation.error,
    updateProfileError: updateProfileMutation.error,
    deleteAccountError: deleteAccountMutation.error,
  };
};

/**
 * Hook for fetching profile data
 */
export const useProfile = (userId?: string) => {
  const { handleError } = useErrorHandler({ component: "useProfile" });

  return useQuery({
    queryKey: ["profile", userId || "me"],
    queryFn: async () => {
      const endpoint = userId ? `/api/users/${userId}` : "/api/profile";
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return response.json();
    },
    enabled: true, // Always enabled, will fetch current user if no userId
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching user's followers
 */
export const useFollowers = (userId: string, page = 1) => {
  const { handleError } = useErrorHandler({ component: "useFollowers" });

  return useQuery({
    queryKey: ["followers", userId, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/users/${userId}/followers?page=${page}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch followers");
      }

      return response.json();
    },
    enabled: !!userId,
  });
};

/**
 * Hook for fetching user's following
 */
export const useFollowing = (userId: string, page = 1) => {
  const { handleError } = useErrorHandler({ component: "useFollowing" });

  return useQuery({
    queryKey: ["following", userId, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/users/${userId}/following?page=${page}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch following");
      }

      return response.json();
    },
    enabled: !!userId,
  });
};
