import { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketEventHandler,
} from "@/types/socket";

export class SocketEventManager {
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;

  constructor() {}

  // ===== SOCKET REFERENCE =====

  setSocket(
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  ): void {
    this.socket = socket;

    // Re-register all existing handlers if socket is available
    if (this.socket && this.eventHandlers.size > 0) {
      this.reregisterAllHandlers();
    }
  }

  // ===== EVENT MANAGEMENT =====

  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler as SocketEventHandler);

    if (this.socket) {
      this.socket.on(event as any, handler as any);
    }
  }

  off<K extends keyof ServerToClientEvents>(
    event: K,
    handler?: ServerToClientEvents[K]
  ): void {
    if (handler) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler as SocketEventHandler);
        if (this.socket) {
          this.socket.off(event as any, handler as any);
        }
      }
    } else {
      // Remove all handlers for this event
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.removeAllListeners(event as any);
      }
    }
  }

  emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): void {
    if (this.socket?.connected) {
      (this.socket.emit as any)(event, ...args);
    } else {
      console.warn(`Cannot emit ${String(event)}: Socket not connected`);
    }
  }

  // ===== UTILITY METHODS =====

  removeAllListeners(): void {
    this.eventHandlers.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getEventCount(): number {
    return this.eventHandlers.size;
  }

  getHandlerCount(event: keyof ServerToClientEvents): number {
    return this.eventHandlers.get(event)?.size ?? 0;
  }

  // ===== PRIVATE METHODS =====

  private reregisterAllHandlers(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket!.on(event as any, handler as any);
      });
    });
  }

  // ===== CLEANUP =====

  destroy(): void {
    this.removeAllListeners();
    this.socket = null;
  }
}
