/**
 * Notification types (based on Prisma Notification model)
 */

import { BaseEntity, NotificationType } from '../shared';
import { User } from './user';

// ===== CORE NOTIFICATION ENTITY =====

export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  userId: string;
  user: User;
  entityId?: string;
  entityType?: 'post' | 'user' | 'comment';
}

// ===== NOTIFICATION WITH DETAILS =====

export interface NotificationWithDetails extends Notification {
  actor?: User; // User who triggered the notification
  targetEntity?: any; // The actual entity (post, comment, etc.)
}

// ===== NOTIFICATION FORMS =====

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  content: string;
  userId: string;
  entityId?: string;
  entityType?: string;
}

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  mentions: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// ===== LEGACY COMPATIBILITY =====

export interface LegacyNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  userId: string;
  targetUserId: string;
  entityId?: string;
  entityType?: 'post' | 'comment' | 'user';
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}
