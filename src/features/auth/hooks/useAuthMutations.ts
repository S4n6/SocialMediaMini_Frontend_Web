'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/hooks/redux';
import { loginSuccess, logout } from '@/store/slices/authSlice';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useErrorHandler, createQueryKeys } from '../utils';
import { authSyncBroadcast } from '../utils/cross-tab-sync';
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordData,
  VerifyEmailData,
} from './types';
import { authService } from '../services/auth.service';

// Create query keys for auth domain
const authKeys = createQueryKeys.auth;

/**
 * Auth mutations hook - handles all write operations
 */
export const useAuthMutations = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuthContext();
  const router = useRouter();
  const { handleError } = useErrorHandler();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => authService.login(credentials),
    onSuccess: async (response) => {
      try {
        if (response.data?.requiresEmailVerification) {
          // Email verification required - don't update auth state
          return;
        }

        if (response.data?.user) {
          // Login successful - update state
          dispatch(
            loginSuccess({
              user: response.data.user,
              token: 'http-only-cookie',
            }),
          );

          // Refresh user data and invalidate queries
          await refetchUser();
          queryClient.invalidateQueries({ queryKey: authKeys.all() });

          // Cross-tab sync via BroadcastChannel
          authSyncBroadcast.send({
            action: 'login',
            userId: response.data?.user?.id,
          });

          console.log('Login successful!');
        }
      } catch (error) {
        handleError(error, { action: 'LOGIN_SUCCESS_HANDLER' });
      }
    },
    onError: (error) => handleError(error, { action: 'LOGIN' }),
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
            token: 'http-only-cookie',
          }),
        );

        // Refresh user data and invalidate queries
        await refetchUser();
        queryClient.invalidateQueries({ queryKey: authKeys.all() });

        // Cross-tab sync via BroadcastChannel
        authSyncBroadcast.send({
          action: 'login',
          userId: user?.id,
        });

        console.log('Google login successful!');
      } catch (error) {
        handleError(error, { action: 'GOOGLE_LOGIN_SUCCESS_HANDLER' });
      }
    },
    onError: (error) => handleError(error, { action: 'GOOGLE_LOGIN' }),
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterFormData) => {
      // Transform RegisterFormData to match API expected format
      const apiData = {
        // API expects 'fullname' (lowercase) instead of 'fullName'
        fullname:
          (userData as any).fullName ?? (userData as any).fullname ?? '',
        // Normalize username field name
        username:
          (userData as any).userName ?? (userData as any).username ?? '',
        email: userData.email,
        // Provide defaults for required API fields that may be optional in the form
        birthDate: (userData as any).birthDate ?? '',
        gender: (userData as any).gender ?? '',
        // Keep password as an extra property in case the backend needs it at runtime
        password: (userData as any).password,
      };
      return authService.register(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all() });
      console.log('Registration successful! Please check your email.');
    },
    onError: (error) => handleError(error, { action: 'REGISTER' }),
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

      // Cross-tab sync via BroadcastChannel
      authSyncBroadcast.send({ action: 'logout' });

      // Redirect to login
      router.push('/login');
      console.log('Logged out successfully');
    },
    onError: (error) => {
      // Clear local state even on error
      dispatch(logout());
      queryClient.clear();
      handleError(error, { action: 'LOGOUT' });
    },
  });

  /**
   * Forgot password mutation
   */
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => console.log('Password reset email sent!'),
    onError: (error) => handleError(error, { action: 'FORGOT_PASSWORD' }),
  });

  /**
   * Reset password mutation
   */
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) =>
      authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => console.log('Password reset successful!'),
    onError: (error) => handleError(error, { action: 'RESET_PASSWORD' }),
  });

  /**
   * Verify email mutation
   */
  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyEmailData) =>
      authService.verifyEmail({ token: data.token, password: data.password }),
    onSuccess: async () => {
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: authKeys.all() });
      console.log('Email verified successfully!');
    },
    onError: (error) => handleError(error, { action: 'VERIFY_EMAIL' }),
  });

  /**
   * Resend verification mutation
   */
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => console.log('Verification email sent!'),
    onError: (error) => handleError(error, { action: 'RESEND_VERIFICATION' }),
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
