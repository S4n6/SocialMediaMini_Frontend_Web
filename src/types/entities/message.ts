/**
 * Message and conversation types (based on Prisma models)
 */

import { BaseEntity } from '../shared';
import { User } from './user';

// ===== CORE MESSAGE ENTITY =====

export interface Message extends BaseEntity {
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  senderId: string;
  sender: User;
  conversationId: string;
}

// ===== CONVERSATION ENTITY =====

export interface Conversation extends BaseEntity {
  name?: string;
  isGroup: boolean;
  participants: UserConversation[];
  messages: Message[];
  lastMessage?: Message;
}

export interface UserConversation extends BaseEntity {
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
  userId: string;
  user: User;
  conversationId: string;
}

// ===== CONVERSATION WITH DETAILS =====

export interface ConversationWithDetails extends Conversation {
  unreadCount: number;
  participantUsers: User[];
}

// ===== MESSAGE FORMS =====

export interface SendMessageData {
  content: string;
  messageType?: 'text' | 'image' | 'file';
  conversationId: string;
  replyTo?: string;
}

export interface CreateConversationData {
  name?: string;
  isGroup?: boolean;
  participantIds: string[];
}

// ===== LEGACY COMPATIBILITY =====

export interface LegacyMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  replyTo?: string;
}

export interface LegacyConversation {
  id: string;
  participants: User[];
  lastMessage?: LegacyMessage;
  unreadCount: number;
  updatedAt: string;
}
