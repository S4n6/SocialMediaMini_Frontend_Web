import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { User } from "@/types";
import { usersService } from "@/services/api.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser as updateUserAction } from "@/store/slices/authSlice";
import { toast } from "sonner";
import {
  UserProfileUpdate,
  UserAvatarUpdate,
  UserAccountSettings,
  UserPasswordUpdate,
  UserError,
  UserCacheOptions,
  UseUserConfig,
} from "./types";
import { userQueryKeys } from "./useUserQueries";

// ===== ERROR HANDLER =====

/**
 * Centralized error handler for user mutations
 */
const handleUserMutationError = (
  error: unknown,
  operation: string
): UserError => {
  const userError = error as UserError;
  return {
    ...userError,
    operation,
    timestamp: new Date().toISOString(),
  };
};

// ===== CACHE MANAGEMENT =====

/**
 * Utility for managing user-related cache operations
 */
export const useUserCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate user caches based on options
     */
    invalidateUserCaches: (options: UserCacheOptions) => {
      const promises: Promise<void>[] = [];

      if (options.invalidateCurrentUser) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: userQueryKeys.currentUser(),
          })
        );
      }

      if (options.invalidateUser) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: userQueryKeys.user(options.invalidateUser),
          })
        );
        promises.push(
          queryClient.invalidateQueries({
            queryKey: userQueryKeys.userWithStats(options.invalidateUser),
          })
        );
        promises.push(
          queryClient.invalidateQueries({
            queryKey: userQueryKeys.statistics(options.invalidateUser),
          })
        );
      }

      if (options.invalidateSearches) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ["users", "search"],
            exact: false,
          })
        );
      }

      if (options.invalidateSuggestions) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ["users", "suggestions"],
            exact: false,
          })
        );
      }

      return Promise.all(promises);
    },

    /**
     * Update specific user data in cache
     */
    updateUserInCache: (userId: string, updates: Partial<User>) => {
      // Update user detail cache
      queryClient.setQueryData(
        userQueryKeys.user(userId),
        (oldData: User | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updates };
        }
      );

      // Update user with stats cache
      queryClient.setQueryData(
        userQueryKeys.userWithStats(userId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updates };
        }
      );

      // Update current user cache if it's the same user
      queryClient.setQueryData(userQueryKeys.currentUser(), (oldData: any) => {
        if (!oldData?.user || oldData.user.id !== userId) return oldData;
        return {
          ...oldData,
          user: { ...oldData.user, ...updates },
        };
      });

      // Invalidate search caches to reflect changes
      queryClient.invalidateQueries({
        queryKey: ["users", "search"],
        exact: false,
      });
    },

    /**
     * Remove user from all caches
     */
    removeUserFromCache: (userId: string) => {
      queryClient.removeQueries({ queryKey: userQueryKeys.user(userId) });
      queryClient.removeQueries({
        queryKey: userQueryKeys.userWithStats(userId),
      });
      queryClient.removeQueries({ queryKey: userQueryKeys.statistics(userId) });
      queryClient.invalidateQueries({
        queryKey: ["users", "search"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["users", "suggestions"],
        exact: false,
      });
    },
  };
};

// ===== PROFILE UPDATE MUTATIONS =====

/**
 * Hook for updating user profile information
 */
export const useUpdateUserProfileMutation = (config?: UseUserConfig) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const cacheManager = useUserCacheManager();

  const mutationConfig: UseMutationOptions<User, UserError, UserProfileUpdate> =
    {
      mutationFn: async (data: UserProfileUpdate): Promise<User> => {
        if (!currentUser?.id) {
          throw handleUserMutationError(
            new Error("No current user ID available"),
            "updateUserProfile"
          );
        }

        try {
          const response = await usersService.updateProfile(
            currentUser.id,
            data
          );
          return response.data;
        } catch (error) {
          throw handleUserMutationError(error, "updateUserProfile");
        }
      },
      onSuccess: async (updated: User) => {
        // Update Redux state
        dispatch(updateUserAction({ data: updated }));

        // Update all relevant caches
        cacheManager.updateUserInCache(updated.id, updated);

        // Show success message
        toast.success("Profile updated successfully!");

        // Call custom success handler
        config?.onSuccess?.("updateProfile", updated);
      },
      onError: (error) => {
        console.error("Failed to update user profile:", error);
        toast.error("Failed to update profile");
        config?.onError?.(error);
      },
    };

  return useMutation(mutationConfig);
};

/**
 * Hook for updating user avatar/profile picture
 */
export const useUpdateUserAvatarMutation = (config?: UseUserConfig) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const cacheManager = useUserCacheManager();

  const mutationConfig: UseMutationOptions<User, UserError, UserAvatarUpdate> =
    {
      mutationFn: async (data: UserAvatarUpdate): Promise<User> => {
        if (!currentUser?.id) {
          throw handleUserMutationError(
            new Error("No current user ID available"),
            "updateUserAvatar"
          );
        }

        try {
          // In a real implementation, you'd handle file upload to a service like Cloudinary
          // For now, we'll assume the avatar is a URL or base64 string
          const avatarData =
            typeof data.avatar === "string"
              ? { avatar: data.avatar }
              : { avatar: "uploaded-avatar-url" }; // Mock for file upload

          const response = await usersService.updateProfile(
            currentUser.id,
            avatarData
          );
          return response.data;
        } catch (error) {
          throw handleUserMutationError(error, "updateUserAvatar");
        }
      },
      onSuccess: async (updated: User) => {
        // Update Redux state
        dispatch(updateUserAction({ data: updated }));

        // Update all relevant caches
        cacheManager.updateUserInCache(updated.id, updated);

        // Show success message
        toast.success("Avatar updated successfully!");

        // Call custom success handler
        config?.onSuccess?.("updateAvatar", updated);
      },
      onError: (error) => {
        console.error("Failed to update avatar:", error);
        toast.error("Failed to update avatar");
        config?.onError?.(error);
      },
    };

  return useMutation(mutationConfig);
};

// ===== ACCOUNT SETTINGS MUTATIONS =====

/**
 * Hook for updating user account settings
 */
export const useUpdateAccountSettingsMutation = (config?: UseUserConfig) => {
  const currentUser = useAppSelector((s) => s.auth.user);

  const mutationConfig: UseMutationOptions<
    void,
    UserError,
    UserAccountSettings
  > = {
    mutationFn: async (settings: UserAccountSettings): Promise<void> => {
      if (!currentUser?.id) {
        throw handleUserMutationError(
          new Error("No current user ID available"),
          "updateAccountSettings"
        );
      }

      try {
        // Mock implementation - in reality, you'd have a settings API endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Store settings in localStorage for now
        localStorage.setItem(
          `user-settings-${currentUser.id}`,
          JSON.stringify(settings)
        );
      } catch (error) {
        throw handleUserMutationError(error, "updateAccountSettings");
      }
    },
    onSuccess: (_, variables) => {
      toast.success("Account settings updated successfully!");
      config?.onSuccess?.("updateAccountSettings", variables);
    },
    onError: (error) => {
      console.error("Failed to update account settings:", error);
      toast.error("Failed to update account settings");
      config?.onError?.(error);
    },
  };

  return useMutation(mutationConfig);
};

/**
 * Hook for updating user password
 */
export const useUpdatePasswordMutation = (config?: UseUserConfig) => {
  const currentUser = useAppSelector((s) => s.auth.user);

  const mutationConfig: UseMutationOptions<
    void,
    UserError,
    UserPasswordUpdate
  > = {
    mutationFn: async (data: UserPasswordUpdate): Promise<void> => {
      if (!currentUser?.id) {
        throw handleUserMutationError(
          new Error("No current user ID available"),
          "updatePassword"
        );
      }

      if (data.newPassword !== data.confirmPassword) {
        throw handleUserMutationError(
          new Error("Passwords do not match"),
          "updatePassword"
        );
      }

      try {
        // Mock implementation - in reality, you'd have a password update API endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        throw handleUserMutationError(error, "updatePassword");
      }
    },
    onSuccess: () => {
      toast.success("Password updated successfully!");
      config?.onSuccess?.("updatePassword", true);
    },
    onError: (error) => {
      console.error("Failed to update password:", error);
      toast.error(error.message || "Failed to update password");
      config?.onError?.(error);
    },
  };

  return useMutation(mutationConfig);
};

// ===== ACCOUNT MANAGEMENT MUTATIONS =====

/**
 * Hook for deactivating user account
 */
export const useDeactivateAccountMutation = (config?: UseUserConfig) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);

  const mutationConfig: UseMutationOptions<
    void,
    UserError,
    { reason?: string }
  > = {
    mutationFn: async (data: { reason?: string }): Promise<void> => {
      if (!currentUser?.id) {
        throw handleUserMutationError(
          new Error("No current user ID available"),
          "deactivateAccount"
        );
      }

      try {
        // Mock implementation - in reality, you'd have an account deactivation API endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        throw handleUserMutationError(error, "deactivateAccount");
      }
    },
    onSuccess: () => {
      // Clear all user-related caches
      queryClient.clear();

      // Clear Redux state (this would typically trigger a logout)
      // dispatch(logout());

      toast.success("Account deactivated successfully");
      config?.onSuccess?.("deactivateAccount", true);
    },
    onError: (error) => {
      console.error("Failed to deactivate account:", error);
      toast.error("Failed to deactivate account");
      config?.onError?.(error);
    },
  };

  return useMutation(mutationConfig);
};

/**
 * Hook for deleting user account permanently
 */
export const useDeleteAccountMutation = (config?: UseUserConfig) => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((s) => s.auth.user);

  const mutationConfig: UseMutationOptions<
    void,
    UserError,
    {
      confirmPassword: string;
      reason?: string;
    }
  > = {
    mutationFn: async (data: {
      confirmPassword: string;
      reason?: string;
    }): Promise<void> => {
      if (!currentUser?.id) {
        throw handleUserMutationError(
          new Error("No current user ID available"),
          "deleteAccount"
        );
      }

      try {
        // Mock implementation - in reality, you'd have an account deletion API endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        throw handleUserMutationError(error, "deleteAccount");
      }
    },
    onSuccess: () => {
      // Clear all caches
      queryClient.clear();

      toast.success("Account deleted successfully");
      config?.onSuccess?.("deleteAccount", true);
    },
    onError: (error) => {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
      config?.onError?.(error);
    },
  };

  return useMutation(mutationConfig);
};

// ===== SOCIAL ACTIONS MUTATIONS =====

/**
 * Hook for refreshing user suggestions
 */
export const useRefreshSuggestionsMutation = (config?: UseUserConfig) => {
  const queryClient = useQueryClient();

  const mutationConfig: UseMutationOptions<void, UserError, void> = {
    mutationFn: async (): Promise<void> => {
      try {
        // Mock implementation - in reality, you'd trigger a suggestions refresh
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        throw handleUserMutationError(error, "refreshSuggestions");
      }
    },
    onSuccess: () => {
      // Invalidate suggestions cache to force refetch
      queryClient.invalidateQueries({
        queryKey: ["users", "suggestions"],
        exact: false,
      });

      toast.success("Suggestions refreshed!");
      config?.onSuccess?.("refreshSuggestions", true);
    },
    onError: (error) => {
      console.error("Failed to refresh suggestions:", error);
      toast.error("Failed to refresh suggestions");
      config?.onError?.(error);
    },
  };

  return useMutation(mutationConfig);
};

// ===== UTILITY FUNCTIONS =====

/**
 * Pre-built mutation configurations for common use cases
 */
export const userMutationConfigs = {
  /** Configuration for silent operations (no toasts) */
  silent: {
    onSuccess: undefined,
    onError: undefined,
  } as Partial<UseUserConfig>,

  /** Configuration for operations with custom success messages */
  withCustomMessages: (successMessage: string, errorMessage: string) =>
    ({
      onSuccess: () => toast.success(successMessage),
      onError: () => toast.error(errorMessage),
    } as Partial<UseUserConfig>),

  /** Configuration for critical operations that should retry */
  critical: {
    retry: true,
    onError: (error: UserError) => {
      console.error("Critical user operation failed:", error);
      toast.error("A critical error occurred. Please try again.");
    },
  } as Partial<UseUserConfig>,
} as const;
