import { api } from "@/lib/axios";
import type { User, ApiResponse } from "@/types";

// Follow-related types
export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface FollowRequest {
  friendId: string;
}

export const followService = {
  // Follow a user
  followUser: async (targetUserId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.post("/friends/follow", {
      friendId: targetUserId,
    });
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (targetUserId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.delete(`/friends/unfollow/${targetUserId}`);
    return response.data;
  },

  // Get followers of a specific user
  getFollowers: async (userId: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get(`/friends/followers/${userId}`);
    return response.data;
  },

  // Get following list of a specific user
  getFollowing: async (userId: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get(`/friends/following/${userId}`);
    return response.data;
  },

  // Get current user's followers
  getMyFollowers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get("/friends/my-followers");
    return response.data;
  },

  // Get current user's following list
  getMyFollowing: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get("/friends/my-following");
    return response.data;
  },

  // Check follow status between current user and target user
  checkFollowStatus: async (
    targetUserId: string
  ): Promise<ApiResponse<FollowStatus>> => {
    const response = await api.get(`/friends/check-status/${targetUserId}`);
    return response.data;
  },

  // Get user stats (followers/following counts)
  getUserStats: async (userId: string): Promise<ApiResponse<FollowStats>> => {
    const response = await api.get(`/friends/stats/${userId}`);
    return response.data;
  },

  // Get current user's stats
  getMyStats: async (): Promise<ApiResponse<FollowStats>> => {
    const response = await api.get("/friends/my-stats");
    return response.data;
  },
};
