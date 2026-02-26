import { User } from "@/features/profile";

// Simple in-memory cache for profile data
interface ProfileCache {
  [userId: string]: {
    user: User;
    timestamp: number;
    expiresAt: number;
  };
}

class ProfileCacheManager {
  private cache: ProfileCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(userId: string, user: User): void {
    const now = Date.now();
    this.cache[userId] = {
      user,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    };
  }

  get(userId: string): User | null {
    const entry = this.cache[userId];
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      delete this.cache[userId];
      return null;
    }

    return entry.user;
  }

  invalidate(userId: string): void {
    delete this.cache[userId];
  }

  clear(): void {
    this.cache = {};
  }

  // Preload profile data (useful for prefetching)
  preload(userId: string, user: User): void {
    this.set(userId, user);
  }

  // Get cache stats for debugging
  getStats() {
    const total = Object.keys(this.cache).length;
    const expired = Object.values(this.cache).filter(
      (entry) => Date.now() > entry.expiresAt
    ).length;

    return {
      total,
      active: total - expired,
      expired,
    };
  }
}

// Export singleton instance
export const profileCache = new ProfileCacheManager();

// Hook for using profile cache in components
export const useProfileCache = () => {
  return {
    getProfile: profileCache.get.bind(profileCache),
    setProfile: profileCache.set.bind(profileCache),
    invalidateProfile: profileCache.invalidate.bind(profileCache),
    clearCache: profileCache.clear.bind(profileCache),
    preloadProfile: profileCache.preload.bind(profileCache),
    getCacheStats: profileCache.getStats.bind(profileCache),
  };
};
