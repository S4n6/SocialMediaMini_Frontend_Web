import { ApiResponse } from '@/types';
import { User } from '@/types';
import { ok } from './helpers';

// ============ AUTH ENDPOINTS ============
export const authService = {
  login: async (credentials: {
    identifier: string;
    password: string;
  }): Promise<
    ApiResponse<{
      user: User;
      token: string;
      requiresEmailVerification?: boolean;
    }>
  > => {
    return ok(
      { user: {} as User, token: '', requiresEmailVerification: false },
      'auth.login',
    );
  },

  register: async (userData: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
  }): Promise<
    ApiResponse<{
      user: User;
      token: string;
      requiresEmailVerification?: boolean;
    }>
  > => {
    return ok(
      { user: {} as User, token: '', requiresEmailVerification: true },
      'auth.register',
    );
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return ok(null, 'auth.logout');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return ok({} as User, 'auth.getCurrentUser');
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return ok({ token: '' }, 'auth.refreshToken');
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    return ok(null, 'auth.forgotPassword');
  },

  resetPassword: async (
    token: string,
    password: string,
    confirmPassword?: string,
  ): Promise<ApiResponse<null>> => {
    return ok(null, 'auth.resetPassword');
  },

  verifyEmail: async (
    token: string,
    password?: string,
  ): Promise<ApiResponse<null>> => {
    return ok(null, 'auth.verifyEmail');
  },

  resendVerification: async (email?: string): Promise<ApiResponse<null>> => {
    return ok(null, 'auth.resendVerification');
  },

  checkEmailExists: async (
    email: string,
  ): Promise<ApiResponse<{ exists: boolean }>> => {
    return ok({ exists: false }, 'auth.checkEmailExists');
  },

  checkUsernameExists: async (
    username: string,
  ): Promise<ApiResponse<{ exists: boolean }>> => {
    return ok({ exists: false }, 'auth.checkUsernameExists');
  },

  loginWithGoogle: async (): Promise<ApiResponse<{ user: User }>> => {
    return ok({ user: {} as User }, 'auth.loginWithGoogle');
  },
};
