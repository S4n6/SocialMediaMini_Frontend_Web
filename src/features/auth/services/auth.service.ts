import { api } from "@/lib/axios";
import type { LoginFormData } from "@/lib/validations/schemas";
import type { User, ApiResponse } from "@/types";

export const authService = {
  // Login user
  login: async (
    credentials: LoginFormData
  ): Promise<
    ApiResponse<{
      user: User;
      accessToken?: string;
      refreshToken?: string;
      token?: string;
      email?: string;
      requiresEmailVerification?: boolean;
      isEmailVerified?: boolean;
    }>
  > => {
    const response = await api.post("/auth/login", credentials, {
      headers: { "x-skip-refresh": "1" },
    });
    console.log("Login response:", response.data);
    return response.data;
  },

  // Login with Google - postMessage approach
  // Accept optional data to match callers that may pass info
  loginWithGoogle: (
    data?: any
  ): Promise<{
    user: User;
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    email?: string;
    requiresEmailVerification?: boolean;
    isNewUser?: boolean;
  }> => {
    return new Promise((resolve, reject) => {
      const googleAuthUrl = `http://localhost:3107/auth/google`;

      // Open popup window for Google authentication
      const popup = window.open(
        googleAuthUrl,
        "google-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      // Listen for postMessage from popup
      const messageListener = (event: MessageEvent) => {
        // Allow both backend domain and current domain for development
        const allowedOrigins = [
          window.location.origin,
          "http://localhost:3107", // Backend domain
          "http://localhost:3000", // Frontend domain
        ];

        console.log("Received message from origin:", event.origin);
        console.log("Message data:", event.data);

        if (!allowedOrigins.includes(event.origin)) {
          console.warn("Message from unauthorized origin:", event.origin);
          return;
        }

        if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
          window.removeEventListener("message", messageListener);
          clearTimeout(timeoutId);
          clearInterval(checkClosed);
          popup.close();

          const { user } = event.data.payload;
          resolve({
            user,
            accessToken: "from_cookie", // Token is in httpOnly cookie
            refreshToken: undefined,
          });
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          window.removeEventListener("message", messageListener);
          clearTimeout(timeoutId);
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error || "Google authentication failed"));
        }
      };

      window.addEventListener("message", messageListener);

      // Check if popup is closed manually without success
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          clearTimeout(timeoutId);
          window.removeEventListener("message", messageListener);
          reject(new Error("Authentication cancelled"));
        }
      }, 1000);

      // Timeout after 5 minutes
      const timeoutId = setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageListener);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error("Authentication timeout"));
      }, 5 * 60 * 1000);
    });
  },

  // Register user (simplified - no password)
  register: async (userData: {
    fullname: string;
    username: string;
    email: string;
    birthDate: string;
    gender: string;
  }): Promise<
    ApiResponse<{ email: string; requiresEmailVerification: boolean }>
  > => {
    const response = await api.post("/auth/register", userData, {
      headers: { "x-skip-refresh": "1" },
    });
    return response.data;
  },

  // Setup password with verification token
  setupPassword: async (data: {
    token: string;
    password: string;
  }): Promise<ApiResponse<null>> => {
    const response = await api.post(
      "/auth/setup-password",
      { token: data.token, password: data.password },
      {
        headers: { "x-skip-refresh": "1" },
      }
    );
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post(
      "/auth/resend-verification",
      { email },
      {
        headers: { "x-skip-refresh": "1" },
      }
    );
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Logout user
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Check if email exists
  checkEmailExists: async (
    email: string
  ): Promise<ApiResponse<{ exists: boolean }>> => {
    const response = await api.get(`/auth/check-email`, { params: { email } });
    return response.data;
  },

  // Check if username exists
  checkUsernameExists: async (
    username: string
  ): Promise<ApiResponse<{ exists: boolean }>> => {
    const response = await api.get(`/auth/check-username`, {
      params: { username },
    });
    return response.data;
  },

  // Refresh token
  // Refresh tokens — return a broader shape that may include user and tokens
  refreshToken: async (): Promise<
    ApiResponse<{
      token?: string;
      accessToken?: string;
      refreshToken?: string;
      user?: User;
    }>
  > => {
    const response = await api.post("/auth/refresh", undefined, {
      headers: { "x-skip-refresh": "1" },
      withCredentials: true, // Ensure cookies are sent
    });
    return response.data;
  },

  // Verify email
  // Verify email and optionally return auth tokens/user
  verifyEmail: async (data: {
    token: string;
    password?: string;
  }): Promise<
    ApiResponse<{
      user?: User;
      accessToken?: string;
      refreshToken?: string;
      token?: string;
      isNewUser?: boolean;
    }>
  > => {
    const response = await api.post(
      `/auth/verify-email`,
      { token: data.token, password: data.password },
      {
        headers: { "x-skip-refresh": "1" },
      }
    );
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post(
      "/auth/forgot-password",
      { email },
      {
        headers: { "x-skip-refresh": "1" },
      }
    );
    return response.data;
  },

  // Reset password
  // Accept a single data object for reset to match callers
  resetPassword: async (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> => {
    const response = await api.post(
      `/auth/reset-password`,
      {
        newPassword: data.newPassword,
        token: data.token,
        confirmPassword: data.confirmPassword,
      },
      {
        headers: { "x-skip-refresh": "1" },
      }
    );
    return response.data;
  },
};
