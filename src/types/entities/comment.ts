import { BaseEntity } from '../shared/common';
import { User } from './user';

export interface Comment extends BaseEntity {
  id: string;
  content: string;
  postId: string;
  parentId?: string; // For nested comments
  authorId: string;
  author: User;
  likes: number;
  replies?: Comment[];
  isLiked?: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
  editedAt?: Date;
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  type: 'LIKE' | 'DISLIKE';
  createdAt: Date;
}
