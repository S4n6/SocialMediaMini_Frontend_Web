import { User } from "@/types/user";

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
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

// API Response Types
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
  requiresEmailVerification: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
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
  email: string;
}

// Auth State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refreshAuth: () => Promise<void>;

  // Loading states
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isForgettingPassword: boolean;
  isResettingPassword: boolean;
  isVerifyingEmail: boolean;
  isResendingVerification: boolean;
  isLoggingInWithGoogle: boolean;
  isRefreshingAuth: boolean;
}

// OAuth Types
export interface GoogleAuthData {
  credential: string;
  clientId: string;
}

export interface SocialAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthError {
  message: string;
  code: string;
  validationErrors?: ValidationError[];
}

// Auth Configuration
export interface AuthConfig {
  apiUrl: string;
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
  tokenExpirationBuffer: number; // minutes
  autoRefreshInterval: number; // milliseconds
  loginRedirectPath: string;
  logoutRedirectPath: string;
  registrationRedirectPath: string;
}

// Password Policy
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
}
