import { ApiResponse, PaginatedResponse } from '@/types';
import { Post } from '@/types';
import { ok, emptyPage } from './helpers';

// ============ POSTS ENDPOINTS ============
export const postsService = {
  getFeed: async (page = 1, limit = 10): Promise<PaginatedResponse<Post>> => {
    return emptyPage<Post>('posts.getFeed');
  },

  getFeedPosts: async (
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Post>> => {
    return emptyPage<Post>('posts.getFeedPosts');
  },

  getPostById: async (postId: string): Promise<ApiResponse<Post>> => {
    return ok({} as Post, 'posts.getPostById');
  },

  getUserPosts: async (
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Post>> => {
    return emptyPage<Post>('posts.getUserPosts');
  },

  getPost: async (postId: string): Promise<ApiResponse<Post>> => {
    return ok({} as Post, 'posts.getPost');
  },

  createPost: async (postData: {
    content: string;
    images?: string[];
    location?: string;
  }): Promise<ApiResponse<Post>> => {
    return ok({} as Post, 'posts.createPost');
  },

  updatePost: async (
    postId: string,
    data: Partial<Post>,
  ): Promise<ApiResponse<Post>> => {
    return ok({} as Post, 'posts.updatePost');
  },

  deletePost: async (postId: string): Promise<ApiResponse<null>> => {
    return ok(null, 'posts.deletePost');
  },

  likePost: async (postId: string): Promise<ApiResponse<null>> => {
    return ok(null, 'posts.likePost');
  },

  unlikePost: async (postId: string): Promise<ApiResponse<null>> => {
    return ok(null, 'posts.unlikePost');
  },

  addComment: async (
    postId: string,
    content: string,
  ): Promise<ApiResponse<any>> => {
    return ok(null, 'posts.addComment');
  },

  getComments: async (
    postId: string,
    page = 1,
  ): Promise<PaginatedResponse<any>> => {
    return emptyPage<any>('posts.getComments');
  },

  toggleLike: async (
    postId: string,
  ): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> => {
    return ok({ isLiked: false, likesCount: 0 }, 'posts.toggleLike');
  },

  uploadImages: async (files: File[]): Promise<ApiResponse<string[]>> => {
    return ok([] as string[], 'posts.uploadImages');
  },
};
