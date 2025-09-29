import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/schemas";

// Auth hook types and interfaces
export interface AuthConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enableToast?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthActions {
  login: (
    credentials: LoginFormData
  ) => Promise<
    ApiResponse<{
      user: User;
      accessToken: string;
      email?: string;
      requiresEmailVerification?: boolean;
    }>
  >;
  logout: () => Promise<ApiResponse<null>>;
  register: (
    data: RegisterFormData
  ) => Promise<
    ApiResponse<{ email: string; requiresEmailVerification: boolean }>
  >;
  forgotPassword: (email: string) => Promise<ApiResponse<null>>;
  resetPassword: (data: ResetPasswordData) => Promise<ApiResponse<null>>;
  verifyEmail: (data: VerifyEmailData) => Promise<ApiResponse<null>>;
  resendVerification: (email: string) => Promise<ApiResponse<null>>;
}

export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

// Re-export the validation types
export type { LoginFormData, RegisterFormData };

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
  password: string;
}
