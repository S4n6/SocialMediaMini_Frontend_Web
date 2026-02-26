import { ExplorePost } from '../types/explore';

export interface RealtimeUpdate {
  type: 'like' | 'save' | 'view' | 'comment';
  postId: string;
  userId?: string;
  timestamp: number;
  data?: any;
}

export interface EngagementStats {
  likes: number;
  saves: number;
  views: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

class RealtimeService {
  private subscribers = new Map<
    string,
    Set<(update: RealtimeUpdate) => void>
  >();
  private postStats = new Map<string, EngagementStats>();
  private updateQueue = new Map<string, RealtimeUpdate[]>();
  private isProcessing = false;
  private batchInterval = 1000; // 1 second batching

  constructor() {
    this.startBatchProcessor();
    this.simulateRealtimeActivity();
  }

  // Subscribe to post updates
  subscribe(
    postId: string,
    callback: (update: RealtimeUpdate) => void,
  ): () => void {
    if (!this.subscribers.has(postId)) {
      this.subscribers.set(postId, new Set());
    }

    this.subscribers.get(postId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const postSubscribers = this.subscribers.get(postId);
      if (postSubscribers) {
        postSubscribers.delete(callback);
        if (postSubscribers.size === 0) {
          this.subscribers.delete(postId);
        }
      }
    };
  }

  // Subscribe to multiple posts (for explore grid)
  subscribeToMultiple(
    postIds: string[],
    callback: (postId: string, update: RealtimeUpdate) => void,
  ): () => void {
    const unsubscribeFunctions = postIds.map((postId) =>
      this.subscribe(postId, (update) => callback(postId, update)),
    );

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }

  // Get current stats for a post
  getPostStats(postId: string): EngagementStats | null {
    return this.postStats.get(postId) || null;
  }

  // Initialize stats for posts
  initializePostStats(posts: ExplorePost[]): void {
    posts.forEach((post) => {
      if (!this.postStats.has(post.id)) {
        this.postStats.set(post.id, {
          likes: post.likesCount,
          saves: 0, // Will be fetched from user's saved posts
          views: post.viewsCount || 0,
          comments: post.commentsCount,
          isLiked: false, // Will be determined by checking user's liked posts
          isSaved: false, // Will be determined by checking user's saved posts
        });
      }
    });
  }

  // Update stats from external data
  updatePostStats(postId: string, stats: Partial<EngagementStats>): void {
    const currentStats = this.postStats.get(postId);
    if (currentStats) {
      this.postStats.set(postId, { ...currentStats, ...stats });
    }
  }

  // Simulate user interactions
  simulateLike(postId: string, userId: string = 'current-user'): void {
    const stats = this.postStats.get(postId);
    if (!stats) return;

    const wasLiked = stats.isLiked;
    stats.isLiked = !wasLiked;
    stats.likes += wasLiked ? -1 : 1;

    this.queueUpdate({
      type: 'like',
      postId,
      userId,
      timestamp: Date.now(),
      data: { isLiked: stats.isLiked, totalLikes: stats.likes },
    });
  }

  simulateSave(postId: string, userId: string = 'current-user'): void {
    const stats = this.postStats.get(postId);
    if (!stats) return;

    const wasSaved = stats.isSaved;
    stats.isSaved = !wasSaved;
    stats.saves += wasSaved ? -1 : 1;

    this.queueUpdate({
      type: 'save',
      postId,
      userId,
      timestamp: Date.now(),
      data: { isSaved: stats.isSaved, totalSaves: stats.saves },
    });
  }

  simulateView(postId: string): void {
    const stats = this.postStats.get(postId);
    if (!stats) return;

    stats.views += 1;

    this.queueUpdate({
      type: 'view',
      postId,
      timestamp: Date.now(),
      data: { totalViews: stats.views },
    });
  }

  // Queue update for batch processing
  private queueUpdate(update: RealtimeUpdate): void {
    if (!this.updateQueue.has(update.postId)) {
      this.updateQueue.set(update.postId, []);
    }
    this.updateQueue.get(update.postId)!.push(update);
  }

  // Process queued updates in batches
  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.isProcessing || this.updateQueue.size === 0) return;

      this.isProcessing = true;

      // Process all queued updates
      for (const [postId, updates] of this.updateQueue.entries()) {
        const subscribers = this.subscribers.get(postId);
        if (subscribers && subscribers.size > 0) {
          // Send the latest update for each type
          const latestUpdates = new Map<string, RealtimeUpdate>();

          updates.forEach((update) => {
            latestUpdates.set(update.type, update);
          });

          // Notify subscribers
          for (const update of latestUpdates.values()) {
            subscribers.forEach((callback) => {
              try {
                callback(update);
              } catch (error) {
                console.error('Error in realtime callback:', error);
              }
            });
          }
        }
      }

      // Clear processed updates
      this.updateQueue.clear();
      this.isProcessing = false;
    }, this.batchInterval);
  }

  // Simulate background activity from other users
  private simulateRealtimeActivity(): void {
    const activityTypes: ('like' | 'save' | 'view' | 'comment')[] = [
      'like',
      'save',
      'view',
      'comment',
    ];

    setInterval(
      () => {
        const postIds = Array.from(this.postStats.keys());
        if (postIds.length === 0) return;

        // Random activity on random posts
        const randomPostId =
          postIds[Math.floor(Math.random() * postIds.length)];
        const randomType =
          activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const randomUserId = `user-${Math.floor(Math.random() * 1000)}`;

        this.simulateExternalActivity(randomPostId, randomType, randomUserId);
      },
      5000 + Math.random() * 10000,
    ); // Every 5-15 seconds
  }

  private simulateExternalActivity(
    postId: string,
    type: RealtimeUpdate['type'],
    userId: string,
  ): void {
    const stats = this.postStats.get(postId);
    if (!stats) return;

    switch (type) {
      case 'like':
        stats.likes += Math.random() > 0.7 ? -1 : 1; // 30% chance to unlike
        break;
      case 'save':
        stats.saves += Math.random() > 0.8 ? -1 : 1; // 20% chance to unsave
        break;
      case 'view':
        stats.views += 1;
        break;
      case 'comment':
        stats.comments += 1;
        break;
    }

    this.queueUpdate({
      type,
      postId,
      userId,
      timestamp: Date.now(),
      data: this.getPostStats(postId),
    });
  }

  // Get aggregated stats for multiple posts
  getBatchStats(postIds: string[]): Map<string, EngagementStats> {
    const result = new Map<string, EngagementStats>();
    postIds.forEach((postId) => {
      const stats = this.postStats.get(postId);
      if (stats) {
        result.set(postId, { ...stats });
      }
    });
    return result;
  }

  // Cleanup
  destroy(): void {
    this.subscribers.clear();
    this.postStats.clear();
    this.updateQueue.clear();
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

// React hook for using realtime updates
import { useEffect, useState } from 'react';

export const useRealtimePost = (
  postId: string,
  initialStats?: EngagementStats,
) => {
  const [stats, setStats] = useState<EngagementStats | null>(
    initialStats || realtimeService.getPostStats(postId),
  );

  useEffect(() => {
    // Initialize stats if provided
    if (initialStats) {
      realtimeService.updatePostStats(postId, initialStats);
      setStats(initialStats);
    }

    // Subscribe to updates
    const unsubscribe = realtimeService.subscribe(postId, (update) => {
      setStats((prevStats) => {
        if (!prevStats) return null;

        const newStats = { ...prevStats };

        switch (update.type) {
          case 'like':
            newStats.likes = update.data.totalLikes;
            if (update.userId === 'current-user') {
              newStats.isLiked = update.data.isLiked;
            }
            break;
          case 'save':
            newStats.saves = update.data.totalSaves;
            if (update.userId === 'current-user') {
              newStats.isSaved = update.data.isSaved;
            }
            break;
          case 'view':
            newStats.views = update.data.totalViews;
            break;
          case 'comment':
            newStats.comments =
              update.data.totalComments || newStats.comments + 1;
            break;
        }

        return newStats;
      });
    });

    return unsubscribe;
  }, [postId, initialStats]);

  const toggleLike = () => {
    realtimeService.simulateLike(postId);
  };

  const toggleSave = () => {
    realtimeService.simulateSave(postId);
  };

  const recordView = () => {
    realtimeService.simulateView(postId);
  };

  return {
    stats,
    toggleLike,
    toggleSave,
    recordView,
  };
};
