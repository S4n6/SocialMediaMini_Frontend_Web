import { User } from "@/features/profile";

// ===== SOCKET EVENT TYPES =====

// Client to Server Events
export interface ClientToServerEvents {
  // User presence
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;

  // Profile events
  "profile:view": (profileId: string) => void;
  "profile:follow": (targetUserId: string) => void;
  "profile:unfollow": (targetUserId: string) => void;

  // Post events
  "post:like": (postId: string) => void;
  "post:unlike": (postId: string) => void;
  "post:comment": (data: { postId: string; comment: string }) => void;

  // Chat/Message events
  "message:send": (data: {
    receiverId: string;
    message: string;
    type?: "text" | "image" | "video";
  }) => void;
  "message:typing": (data: { receiverId: string; isTyping: boolean }) => void;
  "message:read": (messageIds: string[]) => void;

  // Notification events
  "notification:read": (notificationId: string) => void;
  "notification:clear": () => void;

  // Room management
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
}

// Server to Client Events
export interface ServerToClientEvents {
  // Connection events
  connected: (data: { userId: string; socketId: string }) => void;
  "user:status_change": (data: {
    userId: string;
    status: "online" | "offline";
    lastSeen?: string;
  }) => void;

  // Profile real-time updates
  "profile:updated": (profile: Partial<User>) => void;
  "profile:follower_count_changed": (data: {
    userId: string;
    followerCount: number;
  }) => void;
  "profile:new_follower": (data: { userId: string; follower: User }) => void;
  "profile:view_count": (data: {
    profileId: string;
    viewCount: number;
  }) => void;
  "follow:updated": (data: {
    userId: string;
    targetUserId: string;
    isFollowing: boolean;
  }) => void;
  "presence:updated": (data: {
    userId: string;
    status: "online" | "offline";
    lastSeen?: string;
  }) => void;

  // Post real-time updates
  "post:liked": (data: {
    postId: string;
    userId: string;
    likesCount: number; // Changed to match service usage
  }) => void;
  "post:unliked": (data: {
    postId: string;
    userId: string;
    likesCount: number;
  }) => void;
  "post:commented": (data: {
    postId: string;
    comment: Comment;
    commentCount: number;
  }) => void;
  "post:updated": (data: { postId: string; updates: any }) => void;
  "post:deleted": (data: { postId: string }) => void;

  // Message events
  "message:received": (message: Message) => void;
  "message:typing": (data: { senderId: string; isTyping: boolean }) => void;
  "message:delivered": (messageId: string) => void;
  "message:read": (data: {
    messageId: string;
    readBy: string;
    readAt: string;
  }) => void;
  "room:joined": (data: { roomId: string; userId: string }) => void;
  "room:left": (data: { roomId: string; userId: string }) => void;
  "room:updated": (data: { roomId: string; updates: any }) => void;

  // Notification events
  "notification:new": (
    notification: Notification & { targetUserId: string }
  ) => void;
  "notification:updated": (notification: Notification) => void;

  // Error events
  error: (error: { message: string; code?: string; data?: any }) => void;
  reconnect: (attemptNumber: number) => void;
}

// ===== DATA TYPES =====

export interface SocketUser {
  id: string;
  userName: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "video" | "file";
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  replyTo?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: Pick<User, "id" | "userName" | "avatar">;
}

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "comment" | "follow" | "message" | "mention";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  actor?: Pick<User, "id" | "userName" | "avatar">;
}

// ===== SOCKET CONFIGURATION =====

export interface SocketConfig {
  url: string;
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
    forceNew?: boolean;
    transports?: ("websocket" | "polling")[];
  };
}

// ===== HOOK TYPES =====

export interface UseSocketOptions {
  autoConnect?: boolean;
  namespace?: string;
  reconnectOnMount?: boolean;
}

export interface SocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastPing?: number;
  reconnectAttempt: number;
}

// ===== EVENT HANDLER TYPES =====

export type SocketEventHandler<T = any> = (data: T) => void;

export interface SocketEventMap {
  [key: string]: SocketEventHandler;
}

// ===== ROOM TYPES =====

export interface Room {
  id: string;
  type: "chat" | "profile" | "post" | "live";
  participants: string[];
  metadata?: any;
}

// ===== PRESENCE TYPES =====

export interface UserPresence {
  userId: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
  currentRoom?: string;
}

export interface PresenceUpdate {
  userId: string;
  status: "online" | "offline" | "away";
  timestamp: string;
}
