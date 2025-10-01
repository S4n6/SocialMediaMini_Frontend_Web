import type { SocketEventManager } from "../core/SocketEventManager";

export class ProfileSocketService {
  constructor(private eventManager: SocketEventManager) {}

  // ===== PROFILE INTERACTIONS =====

  viewProfile(profileId: string): void {
    this.eventManager.emit("profile:view", profileId);
  }

  followUser(targetUserId: string): void {
    this.eventManager.emit("profile:follow", targetUserId);
  }

  unfollowUser(targetUserId: string): void {
    this.eventManager.emit("profile:unfollow", targetUserId);
  }

  // ===== USER PRESENCE =====

  setUserOnline(userId: string): void {
    this.eventManager.emit("user:online", userId);
  }

  setUserOffline(userId: string): void {
    this.eventManager.emit("user:offline", userId);
  }

  // ===== PROFILE EVENT LISTENERS =====

  onProfileUpdated(handler: (profile: any) => void): void {
    this.eventManager.on("profile:updated", handler as any);
  }

  onUserStatusChange(
    handler: (data: {
      userId: string;
      status: "online" | "offline";
      lastSeen?: string;
    }) => void
  ): void {
    this.eventManager.on("user:status_change", handler as any);
  }

  onFollowUpdate(
    handler: (data: {
      userId: string;
      targetUserId: string;
      action: "follow" | "unfollow";
      followersCount: number;
      followingCount: number;
    }) => void
  ): void {
    this.eventManager.on("follow:updated", handler as any);
  }

  onPresenceUpdate(
    handler: (data: {
      userId: string;
      isOnline: boolean;
      lastSeen?: string;
    }) => void
  ): void {
    this.eventManager.on("presence:updated", handler as any);
  }

  // ===== REMOVE LISTENERS =====

  offProfileUpdated(handler?: (data: any) => void): void {
    this.eventManager.off("profile:updated", handler as any);
  }

  offUserStatusChange(handler?: (data: any) => void): void {
    this.eventManager.off("user:status_change", handler as any);
  }

  offFollowUpdate(handler?: (data: any) => void): void {
    this.eventManager.off("follow:updated", handler as any);
  }

  offPresenceUpdate(handler?: (data: any) => void): void {
    this.eventManager.off("presence:updated", handler as any);
  }

  // ===== CLEANUP =====

  removeAllListeners(): void {
    this.offProfileUpdated();
    this.offUserStatusChange();
    this.offFollowUpdate();
    this.offPresenceUpdate();
  }
}
