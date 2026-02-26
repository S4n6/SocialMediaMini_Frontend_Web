// API Types matching backend DTOs
export interface ApiUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

// Conversation API Types
export interface ApiConversationParticipant {
  userId: string;
  role: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  user?: ApiUser; // Will be populated by backend
}

export interface ApiConversationSettings {
  isEncrypted?: boolean;
  allowNotifications?: boolean;
  muteUntil?: string;
  autoDeleteMessages?: boolean;
  autoDeleteDuration?: number;
  maxParticipants?: number;
  allowInviteLinks?: boolean;
  adminOnlyMessaging?: boolean;
}

export interface ApiConversation {
  id: string;
  type: string; // 'private' | 'group'
  title?: string;
  description?: string;
  avatarUrl?: string;
  participants: ApiConversationParticipant[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  lastActivityAt: string;
  isArchived: boolean;
  unreadCount: number;
  settings?: ApiConversationSettings;
}

export interface ApiConversationWithLastMessage {
  id: string;
  type: string;
  title?: string;
  participantCount: number;
  isActive: boolean;
  lastActivity: string;
  unreadCount: number;
  participants?: ApiConversationParticipant[];
  lastMessage?: {
    content: string;
    sentAt: string;
    senderId: string;
  };
}

// Message API Types
export interface ApiMessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string;
  type: string; // 'text' | 'image' | 'video' | 'audio' | 'file'
  status: string; // 'sent' | 'delivered' | 'read'
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  attachmentUrl?: string;
  replyToMessageId?: string;
  reactions: ApiMessageReaction[];
  sender?: ApiUser; // Will be populated by backend
  replyToMessage?: ApiMessage; // Will be populated by backend
}

// Request/Response DTOs
export interface CreatePrivateConversationRequest {
  participantIds: string[];
}

export interface CreateGroupConversationRequest {
  title: string;
  participantIds: string[];
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: string;
  attachmentUrl?: string;
  replyToMessageId?: string;
}

export interface UpdateMessageRequest {
  content?: string;
  status?: string;
}

export interface AddReactionRequest {
  emoji: string;
}

export interface GetConversationsQuery {
  limit?: number;
  cursor?: string;
}

export interface GetMessagesQuery {
  limit?: number;
  cursor?: string;
  before?: string; // For loading older messages
}

// Paginated responses
export interface PaginatedConversationsResponse {
  conversations: ApiConversationWithLastMessage[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface PaginatedMessagesResponse {
  messages: ApiMessage[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

// WebSocket Event Types (for later use)
export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageEvent {
  type:
    | 'message_sent'
    | 'message_delivered'
    | 'message_read'
    | 'message_edited'
    | 'message_deleted';
  message: ApiMessage;
  conversationId: string;
}

export interface ReactionEvent {
  type: 'reaction_added' | 'reaction_removed';
  messageId: string;
  conversationId: string;
  emoji: string;
  userId: string;
}

export interface OnlineStatusEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}
