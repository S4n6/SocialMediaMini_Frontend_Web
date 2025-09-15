import { api } from "@/lib/axios";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/schemas";
import type { User, ApiResponse } from "@/types";

export const authService = {
  // Login user
  login: async (
    credentials: LoginFormData
  ): Promise<
    ApiResponse<{
      user: User;
      accessToken: string;
      email?: string;
      requiresEmailVerification?: boolean;
    }>
  > => {
    const response = await api.post("/auth/login", credentials, {
      headers: { "x-skip-refresh": "1" },
    });
    console.log("Login response:", response.data);
    return response.data;
  },

  // Login with Google - postMessage approach
  loginWithGoogle: (): Promise<{
    user: User;
    accessToken: string;
    email?: string;
    requiresEmailVerification?: boolean;
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

  // Register user
  register: async (
    userData: RegisterFormData
  ): Promise<
    ApiResponse<{ email: string; requiresEmailVerification: boolean }>
  > => {
    userData.username = userData.email.split("@")[0];
    const response = await api.post("/auth/register", userData, {
      headers: { "x-skip-refresh": "1" },
    });
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

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post("/auth/refresh", undefined, {
      headers: { "x-skip-refresh": "1" },
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    const response = await api.get(`/auth/verify-email/${token}`, {
      headers: { "x-skip-refresh": "1" },
    });
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
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.post(
      `/auth/reset-password`,
      {
        newPassword,
        token,
        confirmPassword,
      },
      {
        headers: { "x-skip-refresh": "1" },
      }
    );
    return response.data;
  },
};
