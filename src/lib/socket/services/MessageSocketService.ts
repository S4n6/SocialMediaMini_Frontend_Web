import type { SocketEventManager } from "../core/SocketEventManager";

export class MessageSocketService {
  constructor(private eventManager: SocketEventManager) {}

  // ===== MESSAGING =====

  sendMessage(
    receiverId: string,
    message: string,
    type: "text" | "image" | "video" = "text"
  ): void {
    this.eventManager.emit("message:send", { receiverId, message, type });
  }

  setTyping(receiverId: string, isTyping: boolean): void {
    this.eventManager.emit("message:typing", { receiverId, isTyping });
  }

  markMessageAsRead(messageIds: string[]): void {
    this.eventManager.emit("message:read", messageIds);
  }

  // ===== ROOM MANAGEMENT =====

  joinRoom(roomId: string): void {
    this.eventManager.emit("room:join", roomId);
  }

  leaveRoom(roomId: string): void {
    this.eventManager.emit("room:leave", roomId);
  }

  // ===== MESSAGE EVENT LISTENERS =====

  onMessageReceived(
    handler: (message: {
      id: string;
      senderId: string;
      receiverId: string;
      content: string;
      type: "text" | "image" | "video" | "file";
      timestamp: string;
      isRead: boolean;
      isDelivered: boolean;
      replyTo?: string;
    }) => void
  ): void {
    this.eventManager.on("message:received", handler);
  }

  onTypingUpdate(
    handler: (data: { senderId: string; isTyping: boolean }) => void
  ): void {
    this.eventManager.on("message:typing", handler);
  }

  onMessageDelivered(handler: (messageId: string) => void): void {
    this.eventManager.on("message:delivered", handler);
  }

  onMessageRead(
    handler: (data: {
      messageId: string;
      readBy: string;
      readAt: string;
    }) => void
  ): void {
    this.eventManager.on("message:read", handler);
  }

  // ===== ROOM EVENT LISTENERS =====

  onRoomJoined(
    handler: (data: { roomId: string; userId: string }) => void
  ): void {
    this.eventManager.on("room:joined", handler);
  }

  onRoomLeft(
    handler: (data: { roomId: string; userId: string }) => void
  ): void {
    this.eventManager.on("room:left", handler);
  }

  onRoomUpdated(handler: (room: any) => void): void {
    this.eventManager.on("room:updated", handler);
  }

  // ===== REMOVE LISTENERS =====

  offMessageReceived(handler?: (data: any) => void): void {
    this.eventManager.off("message:received", handler);
  }

  offTypingUpdate(handler?: (data: any) => void): void {
    this.eventManager.off("message:typing", handler);
  }

  offMessageDelivered(handler?: (data: any) => void): void {
    this.eventManager.off("message:delivered", handler);
  }

  offMessageRead(handler?: (data: any) => void): void {
    this.eventManager.off("message:read", handler);
  }

  offRoomJoined(handler?: (data: any) => void): void {
    this.eventManager.off("room:joined", handler);
  }

  offRoomLeft(handler?: (data: any) => void): void {
    this.eventManager.off("room:left", handler);
  }

  offRoomUpdated(handler?: (data: any) => void): void {
    this.eventManager.off("room:updated", handler);
  }

  // ===== CLEANUP =====

  removeAllListeners(): void {
    this.offMessageReceived();
    this.offTypingUpdate();
    this.offMessageDelivered();
    this.offMessageRead();
    this.offRoomJoined();
    this.offRoomLeft();
    this.offRoomUpdated();
  }
}
