import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '@/types';

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  page: number;
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
  hasNextPage: true,
  page: 1,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    fetchPostsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPostsSuccess: (
      state,
      action: PayloadAction<{ posts: Post[]; hasNextPage: boolean }>,
    ) => {
      state.isLoading = false;
      state.posts = action.payload.posts;
      state.hasNextPage = action.payload.hasNextPage;
      state.error = null;
    },
    fetchPostsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id,
      );
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    likePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((post) => post.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likesCount = (post.likesCount || 0) + (post.isLiked ? 1 : -1);
      }
    },
    clearPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasNextPage = true;
    },
  },
});

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  addPost,
  updatePost,
  deletePost,
  likePost,
  clearPosts,
} = postsSlice.actions;

export default postsSlice.reducer;
