/**
 * Consolidated Types - Single source of truth for all type exports
 * Import from this file instead of individual type files
 */

// ===== SHARED TYPES =====
export * from './shared';

// ===== CORE API TYPES =====
export * from './api';
export * from './forms';

// ===== SOCKET TYPES (with aliases to avoid conflicts) =====
export type {
  SocketConfig,
  SocketConnectionState,
  SocketUser,
  SocketMessage,
  SocketComment,
  SocketNotification,
  Message,
  Comment,
  Notification,
  UseSocketOptions,
  SocketEventHandler,
  SocketEventMap,
  Room,
  UserPresence,
  PresenceUpdate,
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket';

// ===== DOMAIN TYPES =====
export * from './domain';

// ===== AUTHENTICATION TYPES =====
export * from './auth';
