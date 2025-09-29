import { useCallback } from "react";
import { useAuthQueries } from "./useAuthQueries";
import { useAuthMutations } from "./useAuthMutations";
import { useAppSelector } from "@/hooks/redux";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordData,
  VerifyEmailData,
  AuthState,
  AuthActions,
} from "./types";

/**
 * Main auth hook that combines queries, mutations, and business logic
 * This is the public API that components should use
 */
export const useAuth = () => {
  // Get auth state from Redux
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Get queries and mutations
  const queries = useAuthQueries();
  const mutations = useAuthMutations();

  // Create action methods
  const actions: AuthActions = {
    login: useCallback(
      async (credentials: LoginFormData) => {
        return mutations.login.mutateAsync(credentials);
      },
      [mutations.login]
    ),

    logout: useCallback(async () => {
      return mutations.logout.mutateAsync();
    }, [mutations.logout]),

    register: useCallback(
      async (data: RegisterFormData) => {
        return mutations.register.mutateAsync(data);
      },
      [mutations.register]
    ),

    forgotPassword: useCallback(
      async (email: string) => {
        return mutations.forgotPassword.mutateAsync(email);
      },
      [mutations.forgotPassword]
    ),

    resetPassword: useCallback(
      async (data: ResetPasswordData) => {
        return mutations.resetPassword.mutateAsync(data);
      },
      [mutations.resetPassword]
    ),

    verifyEmail: useCallback(
      async (data: VerifyEmailData) => {
        return mutations.verifyEmail.mutateAsync(data);
      },
      [mutations.verifyEmail]
    ),

    resendVerification: useCallback(
      async (email: string) => {
        return mutations.resendVerification.mutateAsync(email);
      },
      [mutations.resendVerification]
    ),
  };

  // Google login action (separate from main actions interface)
  const loginWithGoogle = useCallback(async () => {
    return mutations.googleLogin.mutateAsync();
  }, [mutations.googleLogin]);

  // Legacy method aliases for backward compatibility
  const loginUser = actions.login;
  const registerUser = actions.register;
  const logoutUser = actions.logout;

  // Create state object
  const state: AuthState = {
    isAuthenticated,
    user: queries.currentUser.data || user,
    isLoading:
      queries.currentUser.isLoading ||
      Object.values(mutations).some((m) => m.isPending),
    error: (() => {
      const error =
        queries.currentUser.error ||
        Object.values(mutations).find((m) => m.error)?.error ||
        null;
      return error ? { message: error.message, code: "AUTH_ERROR" } : null;
    })(),
  };

  return {
    // State
    ...state,

    // Actions (high-level API)
    ...actions,

    // Google login action
    loginWithGoogle,

    // Legacy method aliases (for backward compatibility)
    loginUser,
    registerUser,
    logoutUser,

    // Loading states (detailed)
    isLoadingCurrentUser: queries.currentUser.isLoading,
    isLoggingIn: mutations.login.isPending,
    isLoggingOut: mutations.logout.isPending,
    isRegistering: mutations.register.isPending,
    isLoggingInWithGoogle: mutations.googleLogin.isPending,
    isForgotPasswordPending: mutations.forgotPassword.isPending,
    isResetPasswordPending: mutations.resetPassword.isPending,
    isVerifyingEmail: mutations.verifyEmail.isPending,
    isResendingVerification: mutations.resendVerification.isPending,

    // Error states (detailed)
    currentUserError: queries.currentUser.error,
    loginError: mutations.login.error,
    logoutError: mutations.logout.error,
    registerError: mutations.register.error,
    googleLoginError: mutations.googleLogin.error,
    forgotPasswordError: mutations.forgotPassword.error,
    resetPasswordError: mutations.resetPassword.error,
    verifyEmailError: mutations.verifyEmail.error,
    resendVerificationError: mutations.resendVerification.error,

    // Refetch methods
    refetchCurrentUser: queries.currentUser.refetch,

    // Raw mutations (for advanced usage with custom callbacks)
    mutations: {
      loginMutation: mutations.login,
      googleLoginMutation: mutations.googleLogin,
      logoutMutation: mutations.logout,
      registerMutation: mutations.register,
      forgotPasswordMutation: mutations.forgotPassword,
      resetPasswordMutation: mutations.resetPassword,
      verifyEmailMutation: mutations.verifyEmail,
      resendVerificationMutation: mutations.resendVerification,
    },

    // Legacy mutation aliases
    loginMutation: mutations.login,
    googleLoginMutation: mutations.googleLogin,
    registerMutation: mutations.register,
    resetPasswordMutation: mutations.resetPassword,
    verifyEmailMutation: mutations.verifyEmail,
    resendVerificationMutation: mutations.resendVerification,
    forgotPasswordMutation: mutations.forgotPassword,
  };
};

export default useAuth;
