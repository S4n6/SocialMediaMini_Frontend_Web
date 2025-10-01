/**
 * Authentication and Authorization Types
 * Consolidated from features/auth/types
 */

import type { User } from "./domain";
import type { ApiResponse } from "./api";

// ===== FORM DATA TYPES =====

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  userName: string;
  termsAccepted: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface VerifyEmailFormData {
  token: string;
}

export interface ResendVerificationFormData {
  email: string;
}

// ===== RESPONSE TYPES =====

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse extends AuthResponse {
  isEmailVerified: boolean;
  requiresEmailVerification: boolean;
}

export interface RegisterResponse {
  user: User;
  message: string;
  verificationEmailSent: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
  emailSent: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface VerifyEmailResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
  emailSent: boolean;
}

// ===== STATE TYPES =====

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isEmailVerified: boolean;
}

export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginFormData) => Promise<AuthResponse>;
  register: (data: RegisterFormData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  forgotPassword: (
    data: ForgotPasswordFormData
  ) => Promise<ForgotPasswordResponse>;
  resetPassword: (
    data: ResetPasswordFormData
  ) => Promise<ResetPasswordResponse>;
  verifyEmail: (data: VerifyEmailFormData) => Promise<VerifyEmailResponse>;
  resendVerification: (
    data: ResendVerificationFormData
  ) => Promise<ResendVerificationResponse>;
  refreshToken: () => Promise<AuthResponse>;

  // Utils
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

// ===== SOCIAL AUTH TYPES =====

export interface GoogleAuthData {
  credential: string;
  clientId: string;
}

export interface SocialAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

// ===== ERROR TYPES =====

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthError {
  type:
    | "validation"
    | "authentication"
    | "authorization"
    | "network"
    | "server";
  message: string;
  details?: ValidationError[];
}

// ===== CONFIG TYPES =====

export interface AuthConfig {
  apiUrl: string;
  tokenStorageKey: string;
  refreshTokenKey: string;
  tokenExpirationBuffer: number; // minutes before expiration to refresh
  maxRetryAttempts: number;
  socialAuth: {
    google: {
      clientId: string;
      enabled: boolean;
    };
    facebook: {
      appId: string;
      enabled: boolean;
    };
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}
