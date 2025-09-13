import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { TokenManager } from "./tokenManager";
import {
  performTokenRefresh,
  refreshTokenIfNeeded,
} from "@/lib/helpers/refresh";

/**
 * Extended Axios Request Config with metadata
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
  _retry?: boolean;
}

/**
 * Standard API Response Structure for Social Media App
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  statusCode?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Error Response Structure
 */
export interface ApiError {
  message: string;
  success: false;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Create Axios Instance with base configuration
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3107/api",
  timeout: 30000, // 30 seconds for social media uploads
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor - Add auth token and handle common request logic
 */
api.interceptors.request.use(
  async (config: ExtendedAxiosRequestConfig) => {
    // Proactive token refresh check
    await refreshTokenIfNeeded();

    // Add authentication token (TokenManager methods are async)
    try {
      const token = await TokenManager.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token retrieval errors - proceed without auth header
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle responses and errors globally
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (
      process.env.NODE_ENV === "development" &&
      (response.config as ExtendedAxiosRequestConfig).metadata
    ) {
      const duration =
        Date.now() -
        (response.config as ExtendedAxiosRequestConfig).metadata!.startTime;
      console.log(`✅ API Response: ${response.config.url} (${duration}ms)`);
    }

    // Transform response to match our ApiResponse interface
    const transformedResponse: ApiResponse = {
      data: response.data.data || response.data,
      message: response.data.message || "Success",
      success: response.data.success !== false,
      statusCode: response.status,
      pagination: response.data.pagination,
    };

    return { ...response, data: transformedResponse };
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Token expired - attempt refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Use centralized refresh logic to prevent race conditions
          const newAccessToken = await performTokenRefresh();

          if (newAccessToken && originalRequest.headers) {
            // Update the failed request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            console.log("🔄 Retrying request with new token");
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect handled in performTokenRefresh
          console.error("❌ Token refresh failed, redirecting to login");
          return Promise.reject(refreshError);
        }
      }

      // Forbidden - show error message
      if (status === 403) {
        console.error("❌ Access forbidden");
      }

      // Server error
      if (status >= 500) {
        console.error("❌ Server error:", status);
      }

      // Transform error response
      const errorResponse: ApiError = {
        message:
          ((data as Record<string, unknown>)?.message as string) ||
          "An error occurred",
        success: false,
        statusCode: status,
        errors: (data as Record<string, unknown>)?.errors as
          | Array<{ field: string; message: string }>
          | undefined,
      };

      return Promise.reject({
        ...error,
        response: { ...error.response, data: errorResponse },
      });
    }

    // Network error
    if (error.request) {
      console.error("❌ Network Error:", error.message);
      const networkError: ApiError = {
        message: "Network error. Please check your connection.",
        success: false,
        statusCode: 0,
      };
      return Promise.reject({ ...error, response: { data: networkError } });
    }

    // Request setup error
    console.error("❌ Request Setup Error:", error.message);
    return Promise.reject(error);
  }
);

export default api;
