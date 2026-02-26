/**
 * Comment-related type definitions
 */

import { BaseEntity } from '@/types/shared';

// ===== CORE COMMENT TYPES =====

export interface Comment extends BaseEntity {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string; // For nested replies
  author: CommentAuthor;
  replies?: Comment[];
  reactions: CommentReaction[];
  _count?: {
    reactions: number;
    replies: number;
  };
}

export interface CommentAuthor {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
}

export interface CommentReaction {
  id: string;
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  userId: string;
  commentId: string;
  createdAt: string;
}

// ===== COMMENT DISPLAY TYPES =====

export interface CommentWithDetails extends Comment {
  isLiked: boolean;
  likesCount: number;
  repliesCount: number;
  canEdit: boolean;
  canDelete: boolean;
}

// ===== COMMENT FORMS =====

export interface CreateCommentData {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

// ===== COMMENT API RESPONSES =====

export interface CommentResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ===== COMMENT HOOKS TYPES =====

export interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  addComment: (content: string, parentId?: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseCommentsProps {
  postId: string;
  initialComments?: Comment[];
  currentUserId?: string;
  pageSize?: number;
}

// ===== COMMENT COMPONENT PROPS =====

export interface CommentItemProps {
  comment: CommentWithDetails;
  onLike?: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  level?: number;
  className?: string;
}

export interface CommentInputProps {
  placeholder?: string;
  onSubmit?: (content: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

export interface CommentsListProps {
  postId: string;
  comments: Comment[];
  onAddComment?: (content: string, parentId?: string) => void;
  onLikeComment?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  className?: string;
  showInput?: boolean;
  maxDepth?: number;
}

// ===== EXPORTS =====

export type { Comment as CommentEntity };
