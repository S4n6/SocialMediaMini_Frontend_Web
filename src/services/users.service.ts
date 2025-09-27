import api, { ApiResponse } from "@/lib/axios";
import { User } from "@/types";

export const UserService = {
  updateProfile: async (userId: string, data: Partial<User>) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get<ApiResponse<User[]>>("/users/search", {
      params: { q: query },
    });
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data; // ApiResponse transformed in axios interceptor
  },
};
