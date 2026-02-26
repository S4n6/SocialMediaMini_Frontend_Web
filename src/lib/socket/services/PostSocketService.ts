import type { SocketEventManager } from "../core/SocketEventManager";

export class PostSocketService {
  constructor(private eventManager: SocketEventManager) {}

  // ===== POST INTERACTIONS =====

  likePost(postId: string): void {
    this.eventManager.emit("post:like", postId);
  }

  unlikePost(postId: string): void {
    this.eventManager.emit("post:unlike", postId);
  }

  commentOnPost(postId: string, comment: string): void {
    this.eventManager.emit("post:comment", { postId, comment });
  }

  sharePost(postId: string): void {
    // Assuming we have a share event
    this.eventManager.emit("post:share" as any, postId);
  }

  // ===== POST EVENT LISTENERS =====

  onPostLiked(
    handler: (data: {
      postId: string;
      userId: string;
      likesCount: number;
    }) => void
  ): void {
    this.eventManager.on("post:liked", handler as any);
  }

  onPostCommented(
    handler: (data: {
      postId: string;
      comment: {
        id: string;
        content: string;
        authorId: string;
        createdAt: string;
      };
      commentsCount: number;
    }) => void
  ): void {
    this.eventManager.on("post:commented", handler as any);
  }

  onPostUpdated(
    handler: (data: { postId: string; updates: any }) => void
  ): void {
    this.eventManager.on("post:updated", handler as any);
  }

  onPostDeleted(handler: (data: { postId: string }) => void): void {
    this.eventManager.on("post:deleted", handler as any);
  }

  // ===== REMOVE LISTENERS =====

  offPostLiked(handler?: (data: any) => void): void {
    this.eventManager.off("post:liked", handler as any);
  }

  offPostCommented(handler?: (data: any) => void): void {
    this.eventManager.off("post:commented", handler as any);
  }

  offPostUpdated(handler?: (data: any) => void): void {
    this.eventManager.off("post:updated", handler as any);
  }

  offPostDeleted(handler?: (data: any) => void): void {
    this.eventManager.off("post:deleted", handler as any);
  }

  // ===== CLEANUP =====

  removeAllListeners(): void {
    this.offPostLiked();
    this.offPostCommented();
    this.offPostUpdated();
    this.offPostDeleted();
  }
}
