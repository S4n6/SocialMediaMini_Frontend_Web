import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAppDispatch } from "@/hooks/redux";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useErrorHandler, createQueryKeys } from "../utils";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordData,
  VerifyEmailData,
} from "./types";

// Create query keys for auth domain
const authKeys = createQueryKeys("auth");

/**
 * Auth mutations hook - handles all write operations
 */
export const useAuthMutations = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuthContext();
  const router = useRouter();
  const { handleError, handleSuccess } = useErrorHandler();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => authService.login(credentials),
    onSuccess: async (response) => {
      try {
        if (response.data.requiresEmailVerification) {
          // Email verification required - don't update auth state
          return;
        }

        if (response.data.user) {
          // Login successful - update state
          dispatch(
            loginSuccess({
              user: response.data.user,
              token: "http-only-cookie",
            })
          );

          // Refresh user data and invalidate queries
          await refetchUser();
          queryClient.invalidateQueries({ queryKey: authKeys.all });

          // Cross-tab sync
          window.dispatchEvent(
            new CustomEvent("auth-sync", {
              detail: { action: "login", user: response.data.user },
            })
          );

          handleSuccess("Login successful!");
        }
      } catch (error) {
        handleError(error, "LOGIN_SUCCESS_HANDLER");
      }
    },
    onError: (error) => handleError(error, "LOGIN"),
  });

  /**
   * Google login mutation
   */
  const googleLoginMutation = useMutation({
    mutationFn: () => authService.loginWithGoogle(),
    onSuccess: async (response) => {
      try {
        const { user } = response;

        // Update Redux state
        dispatch(
          loginSuccess({
            user,
            token: "http-only-cookie",
          })
        );

        // Refresh user data and invalidate queries
        await refetchUser();
        queryClient.invalidateQueries({ queryKey: authKeys.all });

        // Cross-tab sync
        window.dispatchEvent(
          new CustomEvent("auth-sync", {
            detail: { action: "login", user },
          })
        );

        handleSuccess("Google login successful!");
      } catch (error) {
        handleError(error, "GOOGLE_LOGIN_SUCCESS_HANDLER");
      }
    },
    onError: (error) => handleError(error, "GOOGLE_LOGIN"),
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterFormData) => authService.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      handleSuccess("Registration successful! Please check your email.");
    },
    onError: (error) => handleError(error, "REGISTER"),
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear Redux state and cache
      dispatch(logout());
      queryClient.clear();

      // Cross-tab sync
      window.dispatchEvent(
        new CustomEvent("auth-sync", {
          detail: { action: "logout" },
        })
      );

      // Redirect to login
      router.push("/login");
      handleSuccess("Logged out successfully");
    },
    onError: (error) => {
      // Clear local state even on error
      dispatch(logout());
      queryClient.clear();
      handleError(error, "LOGOUT");
    },
  });

  /**
   * Forgot password mutation
   */
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => handleSuccess("Password reset email sent!"),
    onError: (error) => handleError(error, "FORGOT_PASSWORD"),
  });

  /**
   * Reset password mutation
   */
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) =>
      authService.resetPassword(
        data.token,
        data.newPassword,
        data.confirmPassword
      ),
    onSuccess: () => handleSuccess("Password reset successful!"),
    onError: (error) => handleError(error, "RESET_PASSWORD"),
  });

  /**
   * Verify email mutation
   */
  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyEmailData) =>
      authService.verifyEmail(data.token, data.password),
    onSuccess: async () => {
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      handleSuccess("Email verified successfully!");
    },
    onError: (error) => handleError(error, "VERIFY_EMAIL"),
  });

  /**
   * Resend verification mutation
   */
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => handleSuccess("Verification email sent!"),
    onError: (error) => handleError(error, "RESEND_VERIFICATION"),
  });

  return {
    login: loginMutation,
    googleLogin: googleLoginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
    verifyEmail: verifyEmailMutation,
    resendVerification: resendVerificationMutation,
  };
};
