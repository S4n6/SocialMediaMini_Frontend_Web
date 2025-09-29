import { useCallback } from "react";
import { usePostsQueries } from "./usePostsQueries";
import { usePostsMutations } from "./usePostsMutations";
import type {
  PostsConfig,
  PostsState,
  PostsActions,
  CreatePostFormData,
} from "./types";

/**
 * Main posts hook that combines queries, mutations, and business logic
 * This is the public API that components should use
 */
export const usePosts = (options: PostsConfig = {}) => {
  const {
    userId,
    postId,
    enableToast = true,
    pageSize = 10,
    ...queryOptions
  } = options;

  // Get queries and mutations
  const queries = usePostsQueries({
    userId,
    postId,
    pageSize,
    ...queryOptions,
  });
  const mutations = usePostsMutations();

  // Create action methods
  const actions: PostsActions = {
    createPost: useCallback(
      async (postData: CreatePostFormData) => {
        return mutations.createPost.mutateAsync(postData);
      },
      [mutations.createPost]
    ),

    updatePost: useCallback(
      async (postId: string, postData: Partial<CreatePostFormData>) => {
        return mutations.updatePost.mutateAsync({ postId, postData });
      },
      [mutations.updatePost]
    ),

    deletePost: useCallback(
      async (postId: string) => {
        return mutations.deletePost.mutateAsync(postId);
      },
      [mutations.deletePost]
    ),

    toggleLikePost: useCallback(
      async (postId: string) => {
        return mutations.likePost.mutateAsync(postId);
      },
      [mutations.likePost]
    ),

    uploadImages: useCallback(
      async (files: File[]) => {
        return mutations.uploadImages.mutateAsync(files);
      },
      [mutations.uploadImages]
    ),

    fetchNextFeedPage: useCallback(async () => {
      return queries.feedPosts.fetchNextPage();
    }, [queries.feedPosts]),

    fetchNextUserPage: useCallback(async () => {
      return queries.userPosts.fetchNextPage();
    }, [queries.userPosts]),
  };

  // Create state object
  const state: PostsState = {
    feedPosts: queries.feedPosts.data?.pages.flatMap((page) => page.data) || [],
    userPosts: queries.userPosts.data?.pages.flatMap((page) => page.data) || [],
    currentPost: queries.singlePost.data || null,
    isLoading:
      Object.values(queries).some((q) => q.isLoading) ||
      Object.values(mutations).some((m) => m.isPending),
    error: null, // Will be handled by individual error states
    pagination: {
      hasNextFeedPage: queries.feedPosts.hasNextPage || false,
      hasNextUserPage: queries.userPosts.hasNextPage || false,
      isFetchingNextFeedPage: queries.feedPosts.isFetchingNextPage || false,
      isFetchingNextUserPage: queries.userPosts.isFetchingNextPage || false,
    },
  };

  return {
    // State
    ...state,

    // Actions (high-level API)
    ...actions,

    // Loading states (detailed)
    isLoadingFeedPosts: queries.feedPosts.isLoading,
    isLoadingUserPosts: queries.userPosts.isLoading,
    isLoadingPost: queries.singlePost.isLoading,
    isCreatingPost: mutations.createPost.isPending,
    isUpdatingPost: mutations.updatePost.isPending,
    isDeletingPost: mutations.deletePost.isPending,
    isLikingPost: mutations.likePost.isPending,
    isUploadingImages: mutations.uploadImages.isPending,

    // Error states (detailed)
    feedPostsError: queries.feedPosts.error,
    userPostsError: queries.userPosts.error,
    postError: queries.singlePost.error,
    createPostError: mutations.createPost.error,
    updatePostError: mutations.updatePost.error,
    deletePostError: mutations.deletePost.error,
    likePostError: mutations.likePost.error,
    uploadImagesError: mutations.uploadImages.error,

    // Refetch methods
    refetchFeedPosts: queries.feedPosts.refetch,
    refetchUserPosts: queries.userPosts.refetch,
    refetchPost: queries.singlePost.refetch,

    // Pagination methods (aliases)
    fetchNextFeedPage: queries.feedPosts.fetchNextPage,
    fetchNextUserPage: queries.userPosts.fetchNextPage,
    hasNextFeedPage: queries.feedPosts.hasNextPage,
    hasNextUserPage: queries.userPosts.hasNextPage,
    isFetchingNextFeedPage: queries.feedPosts.isFetchingNextPage,
    isFetchingNextUserPage: queries.userPosts.isFetchingNextPage,

    // Raw mutations (for advanced usage with custom callbacks)
    mutations: {
      createPostMutation: mutations.createPost,
      updatePostMutation: mutations.updatePost,
      deletePostMutation: mutations.deletePost,
      likePostMutation: mutations.likePost,
      uploadImagesMutation: mutations.uploadImages,
    },

    // Legacy aliases for backward compatibility
    createPostMutation: mutations.createPost,
    updatePostMutation: mutations.updatePost,
    deletePostMutation: mutations.deletePost,
    likePostMutation: mutations.likePost,
    uploadImagesMutation: mutations.uploadImages,

    // Data aliases for backward compatibility
    feedPostsData: queries.feedPosts.data,
    userPostsData: queries.userPosts.data,
    postData: queries.singlePost.data,

    // Legacy action aliases
    updatePost: actions.updatePost,
    deletePost: actions.deletePost,
  };
};

export default usePosts;
