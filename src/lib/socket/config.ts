/**
 * Socket configuration and setup for the application
 */

import type { SocketConfig } from "@/types/socket";

// Environment-based socket configuration
export const getSocketConfig = (): SocketConfig => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (isDevelopment ? "ws://localhost:3001" : "wss://api.yourdomain.com");

  return {
    url: socketUrl,
    options: {
      autoConnect: false, // We'll connect manually after user authentication
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: false,
      transports: ["websocket", "polling"], // Fallback to polling if websocket fails
    },
  };
};

// Socket events that should be monitored for performance
export const CRITICAL_EVENTS = [
  "connect",
  "disconnect",
  "connect_error",
  "reconnect",
  "reconnect_error",
  "message:received",
  "notification:new",
] as const;

// Socket rooms configuration
export const SOCKET_ROOMS = {
  PROFILE: (profileId: string) => `profile:${profileId}`,
  POST: (postId: string) => `post:${postId}`,
  CHAT: (chatId: string) => `chat:${chatId}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  PRESENCE: "presence:global",
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  MESSAGE_SEND: { limit: 10, window: 60000 }, // 10 messages per minute
  PROFILE_VIEW: { limit: 50, window: 60000 }, // 50 profile views per minute
  POST_INTERACTION: { limit: 100, window: 60000 }, // 100 interactions per minute
} as const;

// Connection retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 5,
  BASE_DELAY: 1000,
  MAX_DELAY: 30000,
  BACKOFF_FACTOR: 2,
  JITTER: true,
} as const;
