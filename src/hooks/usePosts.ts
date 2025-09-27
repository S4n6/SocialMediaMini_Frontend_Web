import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { postsService } from "@/services/posts.service";
import { useAppDispatch } from "@/hooks/redux";
import {
  addPost,
  updatePost,
  deletePost,
  likePost,
} from "@/store/slices/postsSlice";
import type { CreatePostFormData } from "@/lib/validations/schemas";

// Query keys
export const postsKeys = {
  all: ["posts"] as const,
  feed: () => [...postsKeys.all, "feed"] as const,
  userPosts: (userId: string) => [...postsKeys.all, "user", userId] as const,
  post: (postId: string) => [...postsKeys.all, "post", postId] as const,
};

// Infinite query for feed posts
export const useFeedPosts = () => {
  return useInfiniteQuery({
    queryKey: postsKeys.feed(),
    queryFn: ({ pageParam = 1 }) => postsService.getFeedPosts(pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

// Get user posts
export const useUserPosts = (userId: string) => {
  return useInfiniteQuery({
    queryKey: postsKeys.userPosts(userId),
    queryFn: ({ pageParam = 1 }) =>
      postsService.getUserPosts(userId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
  });
};

// Get single post
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postsKeys.post(postId),
    queryFn: () => postsService.getPost(postId),
    enabled: !!postId,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: CreatePostFormData) =>
      postsService.createPost(postData),
    onSuccess: (data) => {
      const newPost = data.data;

      // Update Redux state
      dispatch(addPost(newPost));

      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });
      if (newPost.author.id) {
        queryClient.invalidateQueries({
          queryKey: postsKeys.userPosts(newPost.author.id),
        });
      }
    },
  });
};

// Update post mutation
export const useUpdatePost = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      postData,
    }: {
      postId: string;
      postData: Partial<CreatePostFormData>;
    }) => postsService.updatePost(postId, postData),
    onSuccess: (data) => {
      const updatedPost = data.data;

      // Update Redux state
      dispatch(updatePost(updatedPost));

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: postsKeys.post(updatedPost.id),
      });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });
      if (updatedPost.author.id) {
        queryClient.invalidateQueries({
          queryKey: postsKeys.userPosts(updatedPost.author.id),
        });
      }
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: (_, postId) => {
      // Update Redux state
      dispatch(deletePost(postId));

      // Remove from cache and invalidate queries
      queryClient.removeQueries({ queryKey: postsKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });
      queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
};

// Like/unlike post mutation
export const useLikePost = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsService.toggleLike(postId),
    onMutate: async (postId) => {
      // Optimistically update the UI
      dispatch(likePost(postId));

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postsKeys.all });

      return { postId };
    },
    onError: (error, postId, context) => {
      // Revert the optimistic update on error
      if (context?.postId) {
        dispatch(likePost(context.postId));
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
};

// Upload images mutation
export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => postsService.uploadImages(files),
  });
};
