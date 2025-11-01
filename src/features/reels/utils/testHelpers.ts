/**
 * Testing Utilities for Reels Feature
 * Mock data generators and test helpers for Instagram 2025 Reels components
 */

// Types for better TypeScript support
export interface MockUser {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  isVerified: boolean;
  isFollowed: boolean;
}

export interface MockReel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  title: string;
  description: string;
  user: MockUser;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  engagement: {
    isLiked: boolean;
    isBookmarked: boolean;
    hasCommented: boolean;
  };
  hashtags: string[];
  mentions: string[];
  location?: string;
  createdAt: string;
}

// Mock data generators
export const createMockReel = (
  overrides: Partial<MockReel> = {},
): MockReel => ({
  id: 'reel_123',
  videoUrl: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  duration: 30,
  title: 'Amazing sunset',
  description: 'Beautiful sunset at the beach #sunset #nature',
  user: {
    id: 'user_123',
    username: 'johndoe',
    fullName: 'John Doe',
    profilePicture: 'https://example.com/profile.jpg',
    isVerified: false,
    isFollowed: false,
  },
  metrics: {
    likes: 1250,
    comments: 89,
    shares: 45,
    views: 15600,
  },
  engagement: {
    isLiked: false,
    isBookmarked: false,
    hasCommented: false,
  },
  hashtags: ['#sunset', '#nature', '#photography'],
  mentions: [],
  location: 'Malibu Beach, CA',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockReelsList = (count: number = 5): MockReel[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockReel({
      id: `reel_${index + 1}`,
      title: `Test Reel ${index + 1}`,
      user: {
        id: `user_${index + 1}`,
        username: `testuser${index + 1}`,
        fullName: `Test User ${index + 1}`,
        profilePicture: `https://example.com/profile${index + 1}.jpg`,
        isVerified: index % 2 === 0,
        isFollowed: index % 3 === 0,
      },
      metrics: {
        likes: Math.floor(Math.random() * 10000),
        comments: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 50000),
      },
    }),
  );
};

// Mock video element factory
export const createMockVideoElement = (
  overrides: Partial<HTMLVideoElement> = {},
): Partial<HTMLVideoElement> => {
  return {
    play: () => Promise.resolve(),
    pause: () => {},
    load: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    currentTime: 0,
    duration: 30,
    volume: 1,
    muted: false,
    paused: true,
    ended: false,
    readyState: 4, // HAVE_ENOUGH_DATA
    videoWidth: 1080,
    videoHeight: 1920,
    ...overrides,
  };
};

// Mock intersection observer for testing
export const createMockIntersectionObserver = () => {
  const mockObserve = () => {};
  const mockUnobserve = () => {};
  const mockDisconnect = () => {};

  const mockIntersectionObserver = (
    callback: IntersectionObserverCallback,
  ) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    callback,
  });

  return {
    mockObserve,
    mockUnobserve,
    mockDisconnect,
    mockIntersectionObserver,
    triggerIntersection: (entries: IntersectionObserverEntry[]) => {
      // Would trigger callback in real implementation
      console.log('Mock intersection triggered:', entries);
    },
  };
};

// Mock performance metrics for testing
export const createMockPerformanceMetrics = () => ({
  fps: 60,
  memoryUsage: 50000000, // 50MB
  cpuUsage: 25, // 25%
  networkSpeed: 'fast' as const,
  videoQuality: 'high' as const,
  bufferHealth: 85, // 85%
  timestamp: Date.now(),
});

// Mock user interactions for testing
export const createMockUserInteraction = (type: string, data: any = {}) => ({
  type,
  timestamp: Date.now(),
  reelId: 'reel_123',
  userId: 'user_123',
  data,
});

// Test data generators for different scenarios
export const testDataGenerators = {
  // Generate reels with specific characteristics
  popularReels: () =>
    createMockReelsList(5).map((reel) => ({
      ...reel,
      metrics: {
        ...reel.metrics,
        likes: Math.floor(Math.random() * 100000) + 50000,
        views: Math.floor(Math.random() * 1000000) + 500000,
      },
    })),

  // Generate reels from verified users
  verifiedUserReels: () =>
    createMockReelsList(3).map((reel) => ({
      ...reel,
      user: {
        ...reel.user,
        isVerified: true,
      },
    })),

  // Generate short reels (under 15 seconds)
  shortReels: () =>
    createMockReelsList(5).map((reel) => ({
      ...reel,
      duration: Math.floor(Math.random() * 15) + 5,
    })),

  // Generate reels with lots of engagement
  highEngagementReels: () =>
    createMockReelsList(3).map((reel) => ({
      ...reel,
      metrics: {
        likes: Math.floor(Math.random() * 50000) + 10000,
        comments: Math.floor(Math.random() * 2000) + 500,
        shares: Math.floor(Math.random() * 1000) + 200,
        views: Math.floor(Math.random() * 500000) + 100000,
      },
      engagement: {
        isLiked: Math.random() > 0.5,
        isBookmarked: Math.random() > 0.7,
        hasCommented: Math.random() > 0.6,
      },
    })),
};

// Mock API responses
export const mockApiResponses = {
  getReels: (page: number = 1, limit: number = 10) => ({
    data: createMockReelsList(limit),
    pagination: {
      page,
      limit,
      total: 100,
      hasMore: page * limit < 100,
    },
  }),

  likeReel: (reelId: string) => ({
    success: true,
    message: 'Reel liked successfully',
    data: {
      reelId,
      isLiked: true,
      newLikeCount: Math.floor(Math.random() * 10000),
    },
  }),

  followUser: (userId: string) => ({
    success: true,
    message: 'User followed successfully',
    data: {
      userId,
      isFollowed: true,
      newFollowerCount: Math.floor(Math.random() * 5000),
    },
  }),

  getComments: (reelId: string) => ({
    data: Array.from({ length: 10 }, (_, index) => ({
      id: `comment_${index + 1}`,
      text: `This is comment ${index + 1}`,
      user: {
        id: `user_${index + 1}`,
        username: `commenter${index + 1}`,
        profilePicture: `https://example.com/commenter${index + 1}.jpg`,
      },
      createdAt: new Date().toISOString(),
      likes: Math.floor(Math.random() * 100),
    })),
  }),
};

// Performance testing utilities
export const performanceTestUtils = {
  // Simulate different device capabilities
  lowEndDevice: () => ({
    memory: 2, // 2GB
    cores: 2,
    connection: 'slow-2g',
    pixelRatio: 1.5,
  }),

  midRangeDevice: () => ({
    memory: 4, // 4GB
    cores: 4,
    connection: '3g',
    pixelRatio: 2,
  }),

  highEndDevice: () => ({
    memory: 8, // 8GB
    cores: 8,
    connection: '4g',
    pixelRatio: 3,
  }),

  // Simulate network conditions
  networkConditions: {
    offline: { effectiveType: 'none', downlink: 0, rtt: 0 },
    slow: { effectiveType: 'slow-2g', downlink: 0.25, rtt: 2000 },
    fast: { effectiveType: '4g', downlink: 10, rtt: 100 },
  },
};

// Accessibility testing helpers
export const a11yTestHelpers = {
  // Check if element has proper ARIA attributes
  checkAriaAttributes: (element: Element) => {
    const ariaAttributes = [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-expanded',
      'aria-pressed',
      'role',
    ];

    return ariaAttributes.filter((attr) => element.hasAttribute(attr));
  },

  // Generate screen reader friendly descriptions
  generateVideoDescription: (reel: MockReel) => {
    return `Video by ${reel.user.fullName}. ${reel.title}. ${reel.description}. ${reel.metrics.likes} likes, ${reel.metrics.comments} comments.`;
  },

  // Mock screen reader announcements
  mockScreenReaderAnnouncements: [] as string[],

  announce: (message: string) => {
    a11yTestHelpers.mockScreenReaderAnnouncements.push(message);
    console.log(`Screen Reader: ${message}`);
  },

  clearAnnouncements: () => {
    a11yTestHelpers.mockScreenReaderAnnouncements.length = 0;
  },
};

// Export default collection
export default {
  createMockReel,
  createMockReelsList,
  createMockVideoElement,
  createMockIntersectionObserver,
  createMockPerformanceMetrics,
  createMockUserInteraction,
  testDataGenerators,
  mockApiResponses,
  performanceTestUtils,
  a11yTestHelpers,
};
