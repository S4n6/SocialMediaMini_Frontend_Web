import api from "@/lib/axios";
import { User } from "@/types";

export const UserService = {
  updateProfile: async (userId: string, data: Partial<User>) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },
};
