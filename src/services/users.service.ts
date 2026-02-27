import { ApiResponse, PaginatedResponse } from '@/types';
import { User } from '@/types';
import { ok, emptyPage } from './helpers';

// ============ USERS ENDPOINTS ============
export const usersService = {
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    return ok({} as User, 'users.getUserById');
  },

  getUserByUsername: async (username: string): Promise<ApiResponse<User>> => {
    return ok({} as User, 'users.getUserByUsername');
  },

  updateProfile: async (
    userId: string,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> => {
    return ok({} as User, 'users.updateProfile');
  },

  searchUsers: async (
    query: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<User>> => {
    return emptyPage<User>('users.searchUsers');
  },

  getRecommendedUsers: async (limit = 5): Promise<ApiResponse<User[]>> => {
    return ok([] as User[], 'users.getRecommendedUsers');
  },

  uploadAvatar: async (
    file: File,
  ): Promise<ApiResponse<{ avatarUrl: string }>> => {
    return ok({ avatarUrl: '' }, 'users.uploadAvatar');
  },
};
