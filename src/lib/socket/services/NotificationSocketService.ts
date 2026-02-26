import type { SocketEventManager } from "../core/SocketEventManager";

export class NotificationSocketService {
  constructor(private eventManager: SocketEventManager) {}

  // ===== NOTIFICATION ACTIONS =====

  markNotificationAsRead(notificationId: string): void {
    this.eventManager.emit("notification:read", notificationId);
  }

  clearAllNotifications(): void {
    this.eventManager.emit("notification:clear");
  }

  // ===== NOTIFICATION EVENT LISTENERS =====

  onNewNotification(
    handler: (notification: {
      id: string;
      type: "like" | "comment" | "follow" | "mention" | "message";
      userId: string;
      targetUserId: string;
      entityId?: string;
      entityType?: "post" | "comment" | "user";
      message: string;
      isRead: boolean;
      createdAt: string;
      data?: any;
    }) => void
  ): void {
    this.eventManager.on("notification:new", handler);
  }

  onNotificationUpdated(handler: (notification: any) => void): void {
    this.eventManager.on("notification:updated", handler);
  }

  // ===== REMOVE LISTENERS =====

  offNewNotification(handler?: (data: any) => void): void {
    this.eventManager.off("notification:new", handler);
  }

  offNotificationUpdated(handler?: (data: any) => void): void {
    this.eventManager.off("notification:updated", handler);
  }

  // ===== CLEANUP =====

  removeAllListeners(): void {
    this.offNewNotification();
    this.offNotificationUpdated();
  }
}
