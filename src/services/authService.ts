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
  ): Promise<ApiResponse<{ user: User; accessToken: string }>> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Register user
  register: async (
    userData: RegisterFormData
  ): Promise<ApiResponse<{ user: User; accessToken: string }>> => {
    const response = await api.post("/auth/register", userData);
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
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};
