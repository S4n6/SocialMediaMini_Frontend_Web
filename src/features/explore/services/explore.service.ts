import apiClient from '@/lib/axios';
import type {
  ExplorePost,
  ExplorePostsResponse,
  ExploreStatsResponse,
  ExploreQueryParams,
} from '../types/explore';

class ExploreService {
  private readonly baseUrl = '/posts';

  /**
   * Fetch explore posts with pagination and filters
   */
  async fetchExplorePosts(
    params: ExploreQueryParams = {},
  ): Promise<ExplorePostsResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      // Add filters
      if (params.category && params.category !== 'all') {
        queryParams.append('category', params.category);
      }
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);
      if (params.mediaType && params.mediaType !== 'all') {
        queryParams.append('mediaType', params.mediaType);
      }
      if (params.search) queryParams.append('search', params.search);
      if (params.hashtag) queryParams.append('hashtag', params.hashtag);
      if (params.location) queryParams.append('location', params.location);
      if (params.minLikes)
        queryParams.append('minLikes', params.minLikes.toString());
      if (params.verified)
        queryParams.append('verified', params.verified.toString());

      const response = await apiClient.get<ExplorePostsResponse>(
        `${this.baseUrl}/explore?${queryParams.toString()}`,
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching explore posts:', error);
      throw new Error('Failed to fetch explore posts');
    }
  }

  /**
   * Search posts by query
   */
  async searchPosts(
    query: string,
    params: Partial<ExploreQueryParams> = {},
  ): Promise<ExplorePostsResponse> {
    try {
      const searchParams: ExploreQueryParams = {
        ...params,
        search: query,
        page: params.page || 1,
        limit: params.limit || 20,
      };

      return await this.fetchExplorePosts(searchParams);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw new Error('Failed to search posts');
    }
  }

  /**
   * Get posts by hashtag
   */
  async getPostsByHashtag(
    hashtag: string,
    params: Partial<ExploreQueryParams> = {},
  ): Promise<ExplorePostsResponse> {
    try {
      const hashtagParams: ExploreQueryParams = {
        ...params,
        hashtag: hashtag.replace('#', ''),
        page: params.page || 1,
        limit: params.limit || 20,
      };

      return await this.fetchExplorePosts(hashtagParams);
    } catch (error) {
      console.error('Error fetching hashtag posts:', error);
      throw new Error('Failed to fetch hashtag posts');
    }
  }

  /**
   * Get posts by location
   */
  async getPostsByLocation(
    location: string,
    params: Partial<ExploreQueryParams> = {},
  ): Promise<ExplorePostsResponse> {
    try {
      const locationParams: ExploreQueryParams = {
        ...params,
        location,
        page: params.page || 1,
        limit: params.limit || 20,
      };

      return await this.fetchExplorePosts(locationParams);
    } catch (error) {
      console.error('Error fetching location posts:', error);
      throw new Error('Failed to fetch location posts');
    }
  }

  /**
   * Get explore statistics
   */
  async getExploreStats(): Promise<ExploreStatsResponse> {
    try {
      const response = await apiClient.get<ExploreStatsResponse>(
        `${this.baseUrl}/explore/stats`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching explore stats:', error);
      throw new Error('Failed to fetch explore statistics');
    }
  }

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(limit: number = 10): Promise<string[]> {
    try {
      const response = await apiClient.get<{ hashtags: string[] }>(
        `${this.baseUrl}/explore/hashtags/trending?limit=${limit}`,
      );
      return response.data.hashtags;
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      return [];
    }
  }

  /**
   * Get popular locations
   */
  async getPopularLocations(limit: number = 10): Promise<string[]> {
    try {
      const response = await apiClient.get<{ locations: string[] }>(
        `${this.baseUrl}/explore/locations/popular?limit=${limit}`,
      );
      return response.data.locations;
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      return [];
    }
  }

  /**
   * Mock data generator for development
   */
  generateMockPosts(count: number = 20): ExplorePost[] {
    const mockUsers = [
      {
        id: '1',
        username: 'photographer_pro',
        name: 'Pro Photographer',
        avatar: '/images/avatar1.jpg',
        isVerified: true,
      },
      {
        id: '2',
        username: 'travel_blogger',
        name: 'Travel Blogger',
        avatar: '/images/avatar2.jpg',
        isVerified: false,
      },
      {
        id: '3',
        username: 'food_lover',
        name: 'Food Lover',
        avatar: '/images/avatar3.jpg',
        isVerified: true,
      },
      {
        id: '4',
        username: 'artist_creative',
        name: 'Creative Artist',
        avatar: '/images/avatar4.jpg',
        isVerified: false,
      },
      {
        id: '5',
        username: 'fitness_guru',
        name: 'Fitness Guru',
        avatar: '/images/avatar5.jpg',
        isVerified: true,
      },
    ];

    const mockHashtags = [
      '#photography',
      '#travel',
      '#food',
      '#art',
      '#fitness',
      '#nature',
      '#sunset',
      '#lifestyle',
      '#fashion',
      '#music',
    ];

    const mockLocations = [
      'New York, NY',
      'Los Angeles, CA',
      'Paris, France',
      'Tokyo, Japan',
      'London, UK',
    ];

    return Array.from({ length: count }, (_, i) => {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const mediaType = ['image', 'video', 'carousel'][
        Math.floor(Math.random() * 3)
      ] as 'image' | 'video' | 'carousel';
      const mediaCount =
        mediaType === 'carousel' ? Math.floor(Math.random() * 5) + 2 : 1;

      return {
        id: `mock-post-${i + 1}`,
        userId: user.id,
        content: `This is a sample post content ${i + 1}. Amazing content here! ${mockHashtags[Math.floor(Math.random() * mockHashtags.length)]}`,
        mediaUrls: Array.from(
          { length: mediaCount },
          (_, j) => `/images/post-${(i % 10) + 1}-${j + 1}.jpg`,
        ),
        mediaType,
        thumbnailUrl: `/images/post-${(i % 10) + 1}-thumb.jpg`,
        aspectRatio: [1, 0.75, 1.25, 1.33, 0.8][Math.floor(Math.random() * 5)],
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: Math.floor(Math.random() * 10000),
        commentsCount: Math.floor(Math.random() * 500),
        sharesCount: Math.floor(Math.random() * 100),
        viewsCount:
          mediaType === 'video' ? Math.floor(Math.random() * 50000) : undefined,
        isSponsored: Math.random() > 0.9,
        isPinned: Math.random() > 0.95,
        visibility: 'public' as const,
        user,
        mediaCount: mediaType === 'carousel' ? mediaCount : undefined,
        hashtags: [
          mockHashtags[Math.floor(Math.random() * mockHashtags.length)],
        ],
        location:
          Math.random() > 0.7
            ? {
                name: mockLocations[
                  Math.floor(Math.random() * mockLocations.length)
                ],
              }
            : undefined,
      };
    });
  }

  /**
   * Mock API response for development
   */
  async getMockExploreResponse(
    params: ExploreQueryParams = {},
  ): Promise<ExplorePostsResponse> {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 500),
    );

    const page = params.page || 1;
    const limit = params.limit || 20;
    const allPosts = this.generateMockPosts(100); // Generate large set for pagination

    // Apply filters
    let filteredPosts = allPosts;

    if (params.mediaType && params.mediaType !== 'all') {
      filteredPosts = filteredPosts.filter(
        (post) => post.mediaType === params.mediaType,
      );
    }

    if (params.search) {
      const query = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.content.toLowerCase().includes(query) ||
          post.user.username.toLowerCase().includes(query) ||
          post.hashtags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (params.hashtag) {
      const hashtag = params.hashtag.toLowerCase();
      filteredPosts = filteredPosts.filter((post) =>
        post.hashtags?.some((tag) => tag.toLowerCase().includes(hashtag)),
      );
    }

    if (params.minLikes) {
      filteredPosts = filteredPosts.filter(
        (post) => post.likesCount >= params.minLikes!,
      );
    }

    // Sort posts
    if (params.sortBy === 'popular') {
      filteredPosts.sort((a, b) => b.likesCount - a.likesCount);
    } else if (params.sortBy === 'recent') {
      filteredPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit),
        hasMore: endIndex < filteredPosts.length,
      },
    };
  }
}

export const exploreService = new ExploreService();
