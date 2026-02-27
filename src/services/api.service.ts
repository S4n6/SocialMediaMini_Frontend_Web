import { ApiResponse, PaginatedResponse } from '@/types';
import { User, Post } from '@/types';

// ───────────────────────────────────────────────────────────
// Consolidated API Service – All backend interactions in one place
// Methods return typed stub responses in development so the UI
// never crashes.  Replace each stub with a real `axiosClient.get/post`
// call once the backend endpoint is available.
// ───────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === 'development';

/** Log a one-time warning per endpoint that it is still stubbed. */
const warned = new Set<string>();
function warnStub(label: string) {
  if (IS_DEV && !warned.has(label)) {
    warned.add(label);
    console.warn(
      `[apiService] ${label} is not implemented – returning stub response`,
    );
  }
}

// ───── helpers ─────
function ok<T>(data: T, label: string): ApiResponse<T> {
  warnStub(label);
  return { success: true, data };
}

function emptyPage<T>(label: string): PaginatedResponse<T> {
  warnStub(label);
  return {
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}

// ───────────────────────────────────────────────────────────
export const apiService = {
  // ============ AUTH ENDPOINTS ============
  auth: {
    login: async (credentials: {
      identifier: string;
      password: string;
    }): Promise<
      ApiResponse<{
        user: User;
        token: string;
        requiresEmailVerification?: boolean;
      }>
    > => {
      return ok(
        { user: {} as User, token: '', requiresEmailVerification: false },
        'auth.login',
      );
    },

    register: async (userData: {
      email: string;
      password: string;
      username: string;
      fullName?: string;
    }): Promise<
      ApiResponse<{
        user: User;
        token: string;
        requiresEmailVerification?: boolean;
      }>
    > => {
      return ok(
        { user: {} as User, token: '', requiresEmailVerification: true },
        'auth.register',
      );
    },

    logout: async (): Promise<ApiResponse<null>> => {
      return ok(null, 'auth.logout');
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
      return ok({} as User, 'auth.getCurrentUser');
    },

    refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
      return ok({ token: '' }, 'auth.refreshToken');
    },

    forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
      return ok(null, 'auth.forgotPassword');
    },

    resetPassword: async (
      token: string,
      password: string,
      confirmPassword?: string,
    ): Promise<ApiResponse<null>> => {
      return ok(null, 'auth.resetPassword');
    },

    verifyEmail: async (
      token: string,
      password?: string,
    ): Promise<ApiResponse<null>> => {
      return ok(null, 'auth.verifyEmail');
    },

    resendVerification: async (email?: string): Promise<ApiResponse<null>> => {
      return ok(null, 'auth.resendVerification');
    },

    checkEmailExists: async (
      email: string,
    ): Promise<ApiResponse<{ exists: boolean }>> => {
      return ok({ exists: false }, 'auth.checkEmailExists');
    },

    checkUsernameExists: async (
      username: string,
    ): Promise<ApiResponse<{ exists: boolean }>> => {
      return ok({ exists: false }, 'auth.checkUsernameExists');
    },

    loginWithGoogle: async (): Promise<ApiResponse<{ user: User }>> => {
      return ok({ user: {} as User }, 'auth.loginWithGoogle');
    },
  },

  // ============ USERS ENDPOINTS ============
  users: {
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
  },

  // ============ FOLLOW / SOCIAL ENDPOINTS ============
  social: {
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
    ): Promise<
      ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean }>
    > => {
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
    ): Promise<
      ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean }>
    > => {
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
      return ok(
        { followersCount: 0, followingCount: 0 },
        'social.getUserStats',
      );
    },

    getMyStats: async (): Promise<
      ApiResponse<{ followersCount: number; followingCount: number }>
    > => {
      return ok({ followersCount: 0, followingCount: 0 }, 'social.getMyStats');
    },
  },

  // ============ POSTS ENDPOINTS ============
  posts: {
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
  },

  // ============ SEARCH & DISCOVERY ENDPOINTS ============
  search: {
    searchAll: async (
      query: string,
    ): Promise<
      ApiResponse<{
        users: User[];
        posts: Post[];
        hashtags: string[];
      }>
    > => {
      return ok({ users: [], posts: [], hashtags: [] }, 'search.searchAll');
    },

    getSearchHistory: async (): Promise<ApiResponse<string[]>> => {
      return ok([] as string[], 'search.getSearchHistory');
    },

    saveSearchQuery: async (query: string): Promise<ApiResponse<null>> => {
      return ok(null, 'search.saveSearchQuery');
    },

    deleteSearchHistory: async (): Promise<ApiResponse<null>> => {
      return ok(null, 'search.deleteSearchHistory');
    },

    getTrendingHashtags: async (): Promise<ApiResponse<string[]>> => {
      return ok([] as string[], 'search.getTrendingHashtags');
    },
  },
};

// Export individual services for backward compatibility
export const authService = apiService.auth;
export const usersService = apiService.users;
export const followService = apiService.social;
export const postsService = apiService.posts;
export const searchHistoryService = apiService.search;
