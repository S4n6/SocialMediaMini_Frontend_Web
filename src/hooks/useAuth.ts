import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/schemas";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

/**
 * Hook to get current user data
 */
export const useCurrentUser = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401 (auth errors)
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
};

/**
 * Hook for login functionality
 * Only perform API calls here; DO NOT redirect (middleware handles redirects)
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuthContext();

  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      return authService.login(credentials);
    },

    onSuccess: async (response) => {
      if (
        "requiresEmailVerification" in response.data &&
        response.data.requiresEmailVerification
      ) {
        // Email verification case - do not update auth state
        return;
      }

      if ("user" in response.data && response.data.user) {
        // Login successful - update state
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: "http-only-cookie",
          })
        );

        // Refresh user data to ensure state sync
        await refetchUser();

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });

        // Emit cross-tab sync event
        window.dispatchEvent(
          new CustomEvent("auth-sync", {
            detail: { action: "login", user: response.data.user },
          })
        );

        // Trigger storage event for cross-tab sync
        localStorage.setItem("auth-sync", Date.now().toString());
        localStorage.removeItem("auth-sync");
      }
    },

    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

/**
 * Hook cho Google login functionality
 */
export const useGoogleLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      return authService.loginWithGoogle();
    },

    onSuccess: async (response) => {
      const { user } = response;

      // Update Redux state
      dispatch(
        loginSuccess({
          user,
          token: "http-only-cookie",
        })
      );

      // Refresh user data
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Cross-tab sync
      window.dispatchEvent(
        new CustomEvent("auth-sync", {
          detail: { action: "login", user },
        })
      );

      localStorage.setItem("auth-sync", Date.now().toString());
      localStorage.removeItem("auth-sync");
    },

    onError: (error) => {
      console.error("Google login failed:", error);
    },
  });
};

/**
 * Hook cho register functionality
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      return authService.register(userData);
    },

    onSuccess: () => {
      // Registration succeeded but email not yet verified
      // No need to update auth state here
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },

    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      return authService.logout();
    },

    onSuccess: () => {
      // Clear Redux state
      dispatch(logout());

      // Clear React Query cache
      queryClient.clear();

      // Emit cross-tab sync event
      window.dispatchEvent(
        new CustomEvent("auth-sync", {
          detail: { action: "logout" },
        })
      );

      // Trigger storage event for cross-tab sync
      localStorage.setItem("auth-sync", Date.now().toString());
      localStorage.removeItem("auth-sync");

      // Middleware will automatically redirect when it detects the user logged out
      router.push("/login");
    },

    onError: (error) => {
      console.error("Logout failed:", error);
      // Vẫn clear local state ngay cả khi API call fail
      dispatch(logout());
      queryClient.clear();
    },
  });
};

/**
 * Hook cho forgot password
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return authService.forgotPassword(email);
    },

    onError: (error) => {
      console.error("Forgot password failed:", error);
    },
  });
};

/**
 * Hook cho reset password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      return authService.resetPassword(
        data.token,
        data.newPassword,
        data.confirmPassword
      );
    },

    onError: (error) => {
      console.error("Reset password failed:", error);
    },
  });
};

/**
 * Hook cho verify email
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuthContext();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      return authService.verifyEmail(data.token, data.password);
    },

    onSuccess: async () => {
      // Email verified thành công - có thể auto login
      // Refetch user để update state
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },

    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });
};

/**
 * Hook để resend verification email
 */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return authService.resendVerification(email);
    },

    onError: (error) => {
      console.error("Resend verification failed:", error);
    },
  });
};
