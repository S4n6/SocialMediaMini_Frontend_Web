// ===== MAIN EXPORTS =====

export {
  SocketManager,
  createSocketManager,
  getSocketManager,
} from "./SocketManager";

// ===== CORE MODULES (for advanced usage) =====

export { SocketConnection } from "./core/SocketConnection";
export { SocketEventManager } from "./core/SocketEventManager";
export { SocketStateManager } from "./core/SocketStateManager";

// ===== FEATURE SERVICES =====

export { PostSocketService } from "./services/PostSocketService";
export { ProfileSocketService } from "./services/ProfileSocketService";
export { MessageSocketService } from "./services/MessageSocketService";
export { NotificationSocketService } from "./services/NotificationSocketService";

// ===== TYPES (re-export from types) =====

export type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketConfig,
  SocketConnectionState,
  SocketEventHandler,
  Room,
  UserPresence,
  SocketUser,
  Message,
  Comment,
  Notification,
} from "@/types/socket";

// ===== CONVENIENCE HOOKS (would be implemented later) =====

// export { useSocket } from "./hooks/useSocket";
// export { useSocketEvent } from "./hooks/useSocketEvent";
// export { useSocketState } from "./hooks/useSocketState";
