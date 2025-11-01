'use client';

// Simple caching utility cho fresher level
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class SimpleCache {
  private prefix = 'story_cache_';

  // Lưu data vào cache
  set<T>(key: string, data: T, expiresInMinutes: number = 5): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresInMinutes * 60 * 1000, // convert to milliseconds
      };

      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  // Lấy data từ cache
  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${this.prefix}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  // Xóa cache
  delete(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.warn('Failed to delete cache:', error);
    }
  }

  // Clear tất cả cache
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Check if cache exists và chưa expire
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Export singleton instance
export const storyCache = new SimpleCache();

// Hook để sử dụng cache trong components
export const useSimpleCache = () => {
  return {
    setCache: storyCache.set.bind(storyCache),
    getCache: storyCache.get.bind(storyCache),
    deleteCache: storyCache.delete.bind(storyCache),
    clearCache: storyCache.clear.bind(storyCache),
    hasCache: storyCache.has.bind(storyCache),
  };
};
