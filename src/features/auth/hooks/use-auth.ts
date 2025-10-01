import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { RootState } from "@/store";
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  GoogleAuthData,
  AuthContextType,
} from "../types";

/**
 * Main authentication hook with all auth operations
 */
export const useAuth = (): AuthContextType => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler("useAuth");

  // Get auth state from Redux
  const authState = useSelector((state: RootState) => state.auth);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response: any) => {
      // authService returns ApiResponse<T> (response.data) but some callers
      // (like loginWithGoogle) may return a raw object. Normalize to `data`.
      const data =
        response && response.data ? (response.data as any) : (response as any);

      // Store tokens if present
      if (data.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      // Update Redux store
      dispatch({
        type: "auth/loginSuccess",
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });

      // Handle email verification
      if (!data.isEmailVerified && data.requiresEmailVerification) {
        toast.info("Please verify your email address");
        router.push("/verify-email");
        return;
      }

      // Success login
      toast.success(
        `Welcome back, ${data.user?.fullName || data.user?.userName}!`
      );
      router.push("/feed");
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "login",
        component: "useAuth",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    // authService.register expects a simplified userData object. Cast to any
    // here so callers can pass RegisterFormData and we rely on runtime shape.
    mutationFn: (userData: any) => authService.register(userData),
    onSuccess: (response: any) => {
      const data = response && response.data ? response.data : response;
      toast.success("Account created successfully!");

      if (data.requiresEmailVerification) {
        toast.info("Please check your email to verify your account");
        router.push("/verify-email");
      } else {
        router.push("/login");
      }
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "register",
        component: "useAuth",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear Redux store
      dispatch({ type: "auth/logout" });

      // Clear all queries
      queryClient.clear();

      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: (error) => {
      // Even if logout fails on server, clear client state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: "auth/logout" });
      queryClient.clear();

      handleError(error, {
        action: "logout",
        component: "useAuth",
      });

      router.push("/login");
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (response) => {
      const data = response.data as any;
      toast.success(`Password reset email sent to ${data.email}`);
    },
    onError: (error) => {
      handleError(error, {
        action: "forgot_password",
        component: "useAuth",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    // callers pass ResetPasswordFormData; authService.resetPassword expects
    // a single object. Normalize here by forwarding the data object.
    mutationFn: (data: any) => authService.resetPassword(data),
    onSuccess: (response) => {
      toast.success("Password reset successfully!");
      router.push("/login");
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "reset_password",
        component: "useAuth",
      });
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmail({ token }),
    onSuccess: (response: any) => {
      const data = response && response.data ? response.data : response;

      // Store tokens if present
      if (data.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      // Update Redux store
      dispatch({
        type: "auth/loginSuccess",
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });

      toast.success("Email verified successfully!");
      router.push("/feed");
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "verify_email",
        component: "useAuth",
      });
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: (response: any) => {
      const data = response && response.data ? response.data : response;
      toast.success(
        `Verification email sent to ${data?.email || "your email"}`
      );
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "resend_verification",
        component: "useAuth",
      });
    },
  });

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: (payload?: any) => authService.loginWithGoogle(payload),
    onSuccess: (response: any) => {
      const data = response && response.data ? response.data : response;

      // Store tokens
      if (data.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      // Update Redux store
      dispatch({
        type: "auth/loginSuccess",
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });

      const welcomeMessage = data.isNewUser
        ? `Welcome to SocialMini, ${
            data.user?.fullName || data.user?.userName
          }!`
        : `Welcome back, ${data.user?.fullName || data.user?.userName}!`;

      toast.success(welcomeMessage);
      router.push("/feed");
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "google_login",
        component: "useAuth",
      });
    },
  });

  // Refresh auth mutation
  const refreshMutation = useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (response: any) => {
      const data = response && response.data ? response.data : response;

      // Store new tokens
      if (data.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      // Update Redux store
      dispatch({
        type: "auth/refreshSuccess",
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
    },
    onError: (error: unknown) => {
      // Refresh failed, logout user
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: "auth/logout" });

      handleError(error, {
        action: "refresh_auth",
        component: "useAuth",
      });

      router.push("/login");
    },
  });

  // Action functions
  const login = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterFormData) => {
    // Map RegisterFormData to the simplified userData expected by authService
    const payload = {
      fullname: (data as any).fullname || (data as any).fullName || "",
      username: (data as any).username,
      email: (data as any).email,
      birthDate: (data as any).birthDate || "",
      gender: (data as any).gender || "",
    };
    await registerMutation.mutateAsync(payload);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const forgotPassword = async (email: string) => {
    await forgotPasswordMutation.mutateAsync(email);
  };

  const resetPassword = async (data: ResetPasswordFormData) => {
    // Normalize form shape to the API shape
    const payload = {
      token: (data as any).token,
      newPassword: (data as any).newPassword || (data as any).password,
      confirmPassword: (data as any).confirmPassword || (data as any).password,
    } as any;
    await resetPasswordMutation.mutateAsync(payload);
  };

  const verifyEmail = async (token: string) => {
    await verifyEmailMutation.mutateAsync(token);
  };

  const resendVerification = async (email: string) => {
    await resendVerificationMutation.mutateAsync(email);
  };

  const loginWithGoogle = async (googleData?: GoogleAuthData) => {
    await googleLoginMutation.mutateAsync(googleData as any);
  };

  const refreshAuth = async () => {
    await refreshMutation.mutateAsync();
  };

  return {
    // State
    isAuthenticated: (authState as any).isAuthenticated,
    user: (authState as any).user,
    isLoading: (authState as any).isLoading,
    error: (authState as any).error,

    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    loginWithGoogle,
    refreshAuth,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,
    isLoggingInWithGoogle: googleLoginMutation.isPending,
    isRefreshingAuth: refreshMutation.isPending,
  };
};

/**
 * Hook for checking authentication status on app load
 */
export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler("useAuthCheck");

  return useQuery({
    queryKey: ["auth", "check"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        dispatch({ type: "auth/logout" });
        return null;
      }

      try {
        const user = await authService.getCurrentUser();
        dispatch({
          type: "auth/loginSuccess",
          payload: {
            user,
            accessToken: token,
            refreshToken: localStorage.getItem("refreshToken"),
          },
        });
        return user;
      } catch (error) {
        // Token invalid, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch({ type: "auth/logout" });
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for email validation
 */
export const useEmailCheck = (email: string) => {
  return useQuery({
    queryKey: ["auth", "email-exists", email],
    queryFn: () => authService.checkEmailExists(email),
    select: (res: any) => (res && res.data ? res.data : null),
    enabled: !!email && email.includes("@"),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook for username validation
 */
export const useUsernameCheck = (userName: string) => {
  return useQuery({
    queryKey: ["auth", "username-exists", userName],
    queryFn: () => authService.checkUsernameExists(userName),
    select: (res: any) => (res && res.data ? res.data : null),
    enabled: !!userName && userName.length > 2,
    staleTime: 30000, // 30 seconds
  });
};
