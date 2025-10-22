/**
 * Entity types index
 */

// User types
export * from './user';

// Post types (with aliasing for conflicts)
export type {
  Post,
  PostWithDetails,
  CreatePostData,
  UpdatePostData,
  LegacyPost,
  StandardPost,
} from './post';

// Import and re-export with aliases to avoid conflicts
export type { Reaction as PostReaction, Comment as PostComment } from './post';

// Story types
export * from './story';

// Comment types (standalone)
export type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  CommentReaction,
} from './comment';

// Notification types
export * from './notification';

// Interaction types (standalone)
export type {
  ReactionType,
  Reaction,
  Like,
  Share,
  BookMark,
  Block,
  InteractionCounts,
} from './interaction';

// Follow types (standalone)
export type {
  Follow,
  FollowStats,
  FollowRequest,
  FollowOperation,
  FollowResponse,
} from './follow';

// Message types
export * from './message';

// Search types
export * from './search';
