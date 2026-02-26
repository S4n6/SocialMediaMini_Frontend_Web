export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  replyToMessageId?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface MessageInputData {
  content: string;
  receiverId: string;
  conversationId?: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  replyToMessageId?: string;
}

export interface ConversationListItem {
  conversation: Conversation;
  lastMessagePreview: string;
  timeAgo: string;
  hasUnread: boolean;
}

// Status cho typing indicator
export interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

// Response types for API
export interface GetConversationsResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
