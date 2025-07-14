import { api } from "@/lib/axios";
import type { Post, ApiResponse, PaginatedResponse } from "@/types";
import type { CreatePostFormData } from "@/lib/validations/schemas";

export const postsService = {
  // Get paginated posts for feed
  getFeedPosts: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Post>> => {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get posts by user
  getUserPosts: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Post>> => {
    const response = await api.get(
      `/posts/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get single post
  getPost: async (postId: string): Promise<ApiResponse<Post>> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Create new post
  createPost: async (
    postData: CreatePostFormData
  ): Promise<ApiResponse<Post>> => {
    const response = await api.post("/posts", postData);
    return response.data;
  },

  // Update post
  updatePost: async (
    postId: string,
    postData: Partial<CreatePostFormData>
  ): Promise<ApiResponse<Post>> => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Like/unlike post
  toggleLike: async (
    postId: string
  ): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Upload images for post
  uploadImages: async (files: File[]): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post("/posts/upload-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
