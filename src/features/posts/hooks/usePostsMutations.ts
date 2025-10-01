import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsService } from "@/services/api.service";
import { useAppDispatch } from "@/hooks/redux";
import {
  addPost,
  updatePost,
  deletePost,
  likePost,
} from "@/store/slices/postsSlice";
import { toast } from "sonner";
import type { CreatePostFormData } from "./types";

// Create query keys for posts domain
const postsKeys = {
  all: ["posts"] as const,
  lists: () => ["posts", "list"] as const,
  list: (filters: any) => ["posts", "list", filters] as const,
  details: () => ["posts", "detail"] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
};

/**
 * Posts mutations hook - handles all write operations
 */
export const usePostsMutations = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  /**
   * Create post mutation
   */
  const createPostMutation = useMutation({
    mutationFn: (postData: CreatePostFormData) =>
      postsService.createPost(postData),
    onSuccess: (response) => {
      try {
        const newPost = response.data;

        // Update Redux state
        dispatch(addPost(newPost));

        // Invalidate and refetch posts
        queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: [...postsKeys.lists(), "feed"],
        });

        if (newPost.author.id) {
          queryClient.invalidateQueries({
            queryKey: postsKeys.list({ userId: newPost.author.id }),
          });
        }

        toast.success("Post created successfully!");
      } catch (error) {
        console.error("CREATE_POST_SUCCESS_HANDLER:", error);
      }
    },
    onError: (error) => {
      console.error("CREATE_POST:", error);
      toast.error("Failed to create post");
    },
  });

  /**
   * Update post mutation
   */
  const updatePostMutation = useMutation({
    mutationFn: ({
      postId,
      postData,
    }: {
      postId: string;
      postData: Partial<CreatePostFormData>;
    }) => postsService.updatePost(postId, postData),
    onSuccess: (response) => {
      try {
        const updatedPost = response.data;

        // Update Redux state
        dispatch(updatePost(updatedPost));

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: postsKeys.detail(updatedPost.id),
        });
        queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: [...postsKeys.lists(), "feed"],
        });

        if (updatedPost.author.id) {
          queryClient.invalidateQueries({
            queryKey: postsKeys.list({ userId: updatedPost.author.id }),
          });
        }

        toast.success("Post updated successfully!");
      } catch (error) {
        console.error("UPDATE_POST_SUCCESS_HANDLER:", error);
      }
    },
    onError: (error) => {
      console.error("UPDATE_POST:", error);
      toast.error("Failed to update post");
    },
  });

  /**
   * Delete post mutation
   */
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: (_, postId) => {
      try {
        // Update Redux state
        dispatch(deletePost(postId));

        // Remove from cache and invalidate queries
        queryClient.removeQueries({ queryKey: postsKeys.detail(postId) });
        queryClient.invalidateQueries({ queryKey: postsKeys.all });

        toast.success("Post deleted successfully!");
      } catch (error) {
        console.error("DELETE_POST_SUCCESS_HANDLER:", error);
      }
    },
    onError: (error) => {
      console.error("DELETE_POST:", error);
      toast.error("Failed to delete post");
    },
  });

  /**
   * Like/unlike post mutation
   */
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postsService.toggleLike(postId),
    onMutate: async (postId) => {
      // Optimistically update the UI
      dispatch(likePost(postId));

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postsKeys.all });

      return { postId };
    },
    onError: (error, postId, context) => {
      try {
        // Revert the optimistic update on error
        if (context?.postId) {
          dispatch(likePost(context.postId));
        }
        console.error("LIKE_POST:", error);
        toast.error("Failed to like post");
      } catch (err) {
        console.error("Error in like post error handler:", err);
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });

  /**
   * Upload images mutation
   */
  const uploadImagesMutation = useMutation({
    mutationFn: (files: File[]) => postsService.uploadImages(files),
    onSuccess: (response) => {
      toast.success(`${response.data.length} images uploaded successfully!`);
    },
    onError: (error) => {
      console.error("UPLOAD_IMAGES:", error);
      toast.error("Failed to upload images");
    },
  });

  return {
    createPost: createPostMutation,
    updatePost: updatePostMutation,
    deletePost: deletePostMutation,
    likePost: likePostMutation,
    uploadImages: uploadImagesMutation,
  };
};

export default usePostsMutations;
