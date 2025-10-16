import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useState } from 'react';
import { postsService } from '../services/post.service';
import { CreatePostPayload } from '../types/create-post.types';
import type { Post, PaginatedResponse } from '@/types';
import { toast } from 'sonner';
import { useUploadProgress } from './useUploadProgress';

// Query keys
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => ['posts', 'list'] as const,
  list: (filters: any) => ['posts', 'list', filters] as const,
  details: () => ['posts', 'detail'] as const,
  detail: (id: string) => ['posts', 'detail', id] as const,
  feed: () => ['posts', 'feed'] as const,
  userPosts: (userId: string) => ['posts', 'user', userId] as const,
};

/**
 * Hook for post queries (read operations)
 */
export const usePostsQuery = () => {
  const queryClient = useQueryClient();

  // Get single post
  const usePost = (postId: string, enabled = true) =>
    useQuery({
      queryKey: postsKeys.detail(postId),
      queryFn: () => postsService.getPost(postId),
      enabled: enabled && !!postId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  // Get user posts
  const useUserPosts = (userId: string, enabled = true) =>
    useInfiniteQuery<
      PaginatedResponse<Post>,
      Error,
      PaginatedResponse<Post>,
      readonly ['posts', 'user', string],
      number
    >({
      queryKey: postsKeys.userPosts(userId),
      queryFn: ({ pageParam }) =>
        postsService.getUserPosts(userId, pageParam, 10),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.page < lastPage.pagination.totalPages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      enabled: enabled && !!userId,
      staleTime: 2 * 60 * 1000,
    });

  // Get feed posts
  const useFeedPosts = (enabled = true) =>
    useInfiniteQuery<
      PaginatedResponse<Post>,
      Error,
      PaginatedResponse<Post>,
      readonly ['posts', 'feed'],
      number
    >({
      queryKey: postsKeys.feed(),
      queryFn: ({ pageParam }) => postsService.getFeedPosts(pageParam, 10),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.page < lastPage.pagination.totalPages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      enabled,
      staleTime: 1 * 60 * 1000, // 1 minute for feed
    });

  // Get posts with filters
  const usePosts = (
    filters: { authorId?: string; hashtag?: string; search?: string } = {},
    enabled = true,
  ) =>
    useInfiniteQuery<
      PaginatedResponse<Post>,
      Error,
      PaginatedResponse<Post>,
      readonly ['posts', 'list', any],
      number
    >({
      queryKey: postsKeys.list(filters),
      queryFn: ({ pageParam }) => postsService.getPosts(pageParam, 10, filters),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.page < lastPage.pagination.totalPages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      enabled,
      staleTime: 2 * 60 * 1000,
    });

  return {
    usePost,
    useUserPosts,
    useFeedPosts,
    usePosts,
  };
};

/**
 * Hook for post mutations (write operations)
 */
export const usePostsMutation = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { progress, resetProgress, updateFileProgress, initializeFiles } =
    useUploadProgress();

  // Create post mutation with enhanced error handling and progress tracking
  const createPost = useMutation({
    mutationFn: async ({
      payload,
      mediaFiles,
    }: {
      payload: CreatePostPayload;
      mediaFiles?: File[];
    }) => {
      try {
        setIsUploading(true);
        resetProgress();

        // Initialize progress tracking for files
        if (mediaFiles && mediaFiles.length > 0) {
          initializeFiles(mediaFiles);
        }

        // Use the new createPostWithMedia method that handles everything
        return await postsService.createPostWithMedia(payload, mediaFiles);
      } catch (error) {
        // Enhanced error handling with user-friendly messages
        if (error instanceof Error) {
          if (error.message.includes('upload')) {
            throw new Error(
              'Failed to upload media files. Please check your internet connection and try again.',
            );
          } else if (error.message.includes('post')) {
            throw new Error(
              'Failed to create post. Your media files have been cleaned up.',
            );
          } else if (error.message.includes('signature')) {
            throw new Error(
              'Failed to get upload permissions. Please try again.',
            );
          }
        }
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });

      toast.success('Post created successfully!');
      resetProgress(); // Clear progress after success
    },
    onError: (error: Error) => {
      console.error('Failed to create post:', error);
      toast.error(error.message || 'Failed to create post');
    },
  });

  // Update post mutation
  const updatePost = useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: Partial<CreatePostPayload>;
    }) => postsService.updatePost(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });

      toast.success('Post updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });

      toast.success('Post deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  return {
    createPost,
    updatePost,
    deletePost,
    // Progress tracking
    progress,
    isUploading,
    // expose progress reset so callers can clear UI after success/close
    resetProgress,
  };
};
