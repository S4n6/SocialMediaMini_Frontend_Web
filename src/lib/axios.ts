import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

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
 * Auth Token Management
 */
class TokenManager {
  private static readonly TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
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
  (config: ExtendedAxiosRequestConfig) => {
    // Add authentication token
    const token = TokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
          const refreshToken = TokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(
              `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3107/api"
              }/auth/refresh`,
              { refreshToken }
            );

            const { accessToken } = response.data;
            TokenManager.setToken(accessToken);

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          }
        } catch {
          // Refresh failed - redirect to login
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
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

// Export TokenManager and default api instance
export { TokenManager };
export default api;
