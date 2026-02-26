import { User } from '@/features/profile';
import { profileCache } from '@/lib/cache/profileCache';

interface PreloadOptions {
  priority?: 'high' | 'low';
  timeout?: number;
}

// Preload profile data for better UX
export const preloadProfile = async (
  userId: string,
  options: PreloadOptions = {},
): Promise<User | null> => {
  const { priority = 'low', timeout = 5000 } = options;

  // Check cache first
  const cachedProfile = profileCache.get(userId);
  if (cachedProfile) {
    return cachedProfile;
  }

  try {
    // In real app, this would be an API call
    // For now, we simulate with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Simulate API call
    const mockUser: User = {
      id: userId,
      username: `user_${userId}`,
      userName: `user_${userId}`, // compatibility
      fullName: `User ${userId}`,
      email: `${userId}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      bio: `This is ${userId}'s bio`,
      websiteUrl: `https://${userId}.com`,
      _count: {
        posts: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clearTimeout(timeoutId);

    // Cache the result
    profileCache.set(userId, mockUser);

    return mockUser;
  } catch (error) {
    console.warn(`Failed to preload profile for ${userId}:`, error);
    return null;
  }
};

// Preload multiple profiles
export const preloadProfiles = async (
  userIds: string[],
  options: PreloadOptions = {},
): Promise<(User | null)[]> => {
  const promises = userIds.map((id) => preloadProfile(id, options));
  return Promise.allSettled(promises).then((results) =>
    results.map((result) =>
      result.status === 'fulfilled' ? result.value : null,
    ),
  );
};

// Utility to preload profiles from a list of posts or interactions
export const preloadProfilesFromPosts = async (
  posts: Array<{ userId?: string; authorId?: string }>,
  options: PreloadOptions = {},
): Promise<void> => {
  const userIds = posts
    .map((post) => post.userId || post.authorId)
    .filter((id): id is string => !!id)
    .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

  await preloadProfiles(userIds, options);
};
