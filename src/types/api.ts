// Import shared API types to avoid duplication
import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationInfo,
} from './shared/common';

// Re-export for convenience
export type { ApiResponse, ApiError, PaginatedResponse, PaginationInfo };

// Unified Response Type
export type UnifiedResponse<T = any> = ApiResponse<T> | ApiError;

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface PaginatedState<T> extends LoadingState {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  hasMore: boolean;
}

// Request States for forms and mutations
export interface RequestState extends LoadingState {
  isSuccess: boolean;
}

// API Endpoints types
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    verify: string;
    forgotPassword: string;
    resetPassword: string;
  };
  users: {
    profile: string;
    updateProfile: string;
    follow: string;
    unfollow: string;
    followers: string;
    following: string;
    search: string;
  };
  posts: {
    feed: string;
    create: string;
    delete: string;
    like: string;
    unlike: string;
    comment: string;
    share: string;
  };
  upload: {
    image: string;
    video: string;
  };
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Config
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
}
