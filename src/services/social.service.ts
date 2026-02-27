import { ApiResponse, PaginatedResponse } from '@/types';
import { User } from '@/types';
import { ok, emptyPage } from './helpers';

// ============ FOLLOW / SOCIAL ENDPOINTS ============
export const followService = {
  followUser: async (userId: string): Promise<ApiResponse<null>> => {
    return ok(null, 'social.followUser');
  },

  unfollowUser: async (userId: string): Promise<ApiResponse<null>> => {
    return ok(null, 'social.unfollowUser');
  },

  isFollowing: async (userId: string): Promise<ApiResponse<boolean>> => {
    return ok(false, 'social.isFollowing');
  },

  getFollowStatus: async (
    userId: string,
  ): Promise<ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean }>> => {
    return ok(
      { isFollowing: false, isFollowedBy: false },
      'social.getFollowStatus',
    );
  },

  getFollowers: async (
    userId: string,
    page = 1,
  ): Promise<PaginatedResponse<User>> => {
    return emptyPage<User>('social.getFollowers');
  },

  getFollowing: async (
    userId: string,
    page = 1,
  ): Promise<PaginatedResponse<User>> => {
    return emptyPage<User>('social.getFollowing');
  },

  getMyFollowers: async (): Promise<PaginatedResponse<User>> => {
    return emptyPage<User>('social.getMyFollowers');
  },

  getMyFollowing: async (): Promise<PaginatedResponse<User>> => {
    return emptyPage<User>('social.getMyFollowing');
  },

  checkFollowStatus: async (
    userId: string,
  ): Promise<ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean }>> => {
    return ok(
      { isFollowing: false, isFollowedBy: false },
      'social.checkFollowStatus',
    );
  },

  getUserStats: async (
    userId: string,
  ): Promise<
    ApiResponse<{ followersCount: number; followingCount: number }>
  > => {
    return ok({ followersCount: 0, followingCount: 0 }, 'social.getUserStats');
  },

  getMyStats: async (): Promise<
    ApiResponse<{ followersCount: number; followingCount: number }>
  > => {
    return ok({ followersCount: 0, followingCount: 0 }, 'social.getMyStats');
  },
};
