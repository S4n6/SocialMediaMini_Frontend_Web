import { ExplorePost } from '../types/explore';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'hashtag' | 'user' | 'location' | 'keyword';
  count?: number;
  trending?: boolean;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface AdvancedSearchParams {
  query: string;
  category?: string;
  mediaType?: 'image' | 'video' | 'carousel' | 'text';
  dateRange?: {
    from: Date;
    to: Date;
  };
  minLikes?: number;
  minComments?: number;
  hasLocation?: boolean;
  isVerifiedUser?: boolean;
  sortBy?: 'relevance' | 'recent' | 'popular' | 'oldest';
}

class AdvancedSearchService {
  private searchHistory: SearchHistory[] = [];
  private debounceTimeout: NodeJS.Timeout | null = null;

  // Mock trending searches and suggestions
  private mockTrendingSearches: SearchSuggestion[] = [
    {
      id: '1',
      text: '#photography',
      type: 'hashtag',
      count: 15420,
      trending: true,
    },
    { id: '2', text: '#travel', type: 'hashtag', count: 12340, trending: true },
    { id: '3', text: '#food', type: 'hashtag', count: 9876, trending: true },
    { id: '4', text: '#art', type: 'hashtag', count: 8765, trending: true },
    { id: '5', text: '#nature', type: 'hashtag', count: 7654, trending: true },
    { id: '6', text: 'john_doe', type: 'user', count: 543, trending: false },
    {
      id: '7',
      text: 'jane_photographer',
      type: 'user',
      count: 321,
      trending: false,
    },
    {
      id: '8',
      text: 'New York',
      type: 'location',
      count: 2345,
      trending: false,
    },
    { id: '9', text: 'Paris', type: 'location', count: 1876, trending: false },
    { id: '10', text: 'sunset', type: 'keyword', count: 4321, trending: false },
  ];

  private mockUsers = [
    'john_doe',
    'jane_photographer',
    'travel_blogger',
    'food_lover',
    'art_creator',
    'nature_explorer',
    'city_walker',
    'beach_life',
    'mountain_hiker',
    'coffee_addict',
  ];

  private mockHashtags = [
    '#photography',
    '#travel',
    '#food',
    '#art',
    '#nature',
    '#sunset',
    '#city',
    '#beach',
    '#mountains',
    '#coffee',
    '#lifestyle',
    '#fashion',
    '#fitness',
    '#music',
  ];

  private mockLocations = [
    'New York',
    'Paris',
    'Tokyo',
    'London',
    'Sydney',
    'Barcelona',
    'Rome',
    'Amsterdam',
    'Berlin',
    'San Francisco',
    'Los Angeles',
    'Miami',
  ];

  // Debounced search with suggestions
  async searchWithDebounce(
    query: string,
    callback: (suggestions: SearchSuggestion[]) => void,
    delay: number = 300,
  ): Promise<void> {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(async () => {
      const suggestions = await this.getSuggestions(query);
      callback(suggestions);
    }, delay);
  }

  // Get search suggestions based on query
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query.trim()) {
      return this.getTrendingSuggestions();
    }

    const lowerQuery = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Search in hashtags
    const matchingHashtags = this.mockHashtags
      .filter((hashtag) => hashtag.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((hashtag) => ({
        id: `hashtag-${hashtag}`,
        text: hashtag,
        type: 'hashtag' as const,
        count: Math.floor(Math.random() * 10000) + 100,
      }));

    // Search in users
    const matchingUsers = this.mockUsers
      .filter((user) => user.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((user) => ({
        id: `user-${user}`,
        text: user,
        type: 'user' as const,
        count: Math.floor(Math.random() * 1000) + 50,
      }));

    // Search in locations
    const matchingLocations = this.mockLocations
      .filter((location) => location.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .map((location) => ({
        id: `location-${location}`,
        text: location,
        type: 'location' as const,
        count: Math.floor(Math.random() * 5000) + 200,
      }));

    // Add keyword suggestion if not starting with # or @
    if (!query.startsWith('#') && !query.startsWith('@')) {
      suggestions.push({
        id: `keyword-${query}`,
        text: query,
        type: 'keyword',
        count: Math.floor(Math.random() * 2000) + 100,
      });
    }

    return [
      ...suggestions,
      ...matchingHashtags,
      ...matchingUsers,
      ...matchingLocations,
    ].slice(0, 8); // Limit to 8 suggestions
  }

  // Get trending suggestions for empty search
  getTrendingSuggestions(): SearchSuggestion[] {
    return this.mockTrendingSearches.filter((s) => s.trending).slice(0, 5);
  }

  // Perform advanced search
  async performAdvancedSearch(params: AdvancedSearchParams): Promise<{
    results: ExplorePost[];
    totalCount: number;
    suggestions: SearchSuggestion[];
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add to search history
    this.addToSearchHistory(params.query, Math.floor(Math.random() * 100) + 10);

    // Mock search results - in real app, this would call backend API
    const mockResults: ExplorePost[] = Array.from({ length: 20 }, (_, i) => ({
      id: `search-result-${i}`,
      userId: `user-${i}`,
      content: `Search result for "${params.query}" - ${i + 1}`,
      mediaUrls: [`https://picsum.photos/400/${300 + i * 50}?random=${i}`],
      mediaType: ['image', 'video', 'carousel'][
        Math.floor(Math.random() * 3)
      ] as any,
      thumbnailUrl: `https://picsum.photos/400/${300 + i * 50}?random=${i}`,
      aspectRatio: 1 + Math.random() * 0.5,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: Math.floor(Math.random() * 10000),
      commentsCount: Math.floor(Math.random() * 500),
      sharesCount: Math.floor(Math.random() * 100),
      viewsCount: Math.floor(Math.random() * 50000),
      visibility: 'public',
      user: {
        id: `user-${i}`,
        username: `user_${i}`,
        name: `User ${i}`,
        fullName: `Full Name ${i}`,
        avatar: `https://i.pravatar.cc/100?img=${i}`,
        isVerified: Math.random() > 0.7,
        bio: `Bio for user ${i}`,
        postsCount: Math.floor(Math.random() * 500),
        followersCount: Math.floor(Math.random() * 10000),
        followingCount: Math.floor(Math.random() * 1000),
        isFollowing: Math.random() > 0.5,
        isPrivate: Math.random() > 0.8,
      },
      hashtags: [`#${params.query}`, '#photography', '#explore'],
      location:
        Math.random() > 0.5
          ? {
              id: `location-${i}`,
              name: `Location ${i}`,
              latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
              longitude: -74.006 + (Math.random() - 0.5) * 0.1,
            }
          : undefined,
    }));

    // Filter results based on search params
    let filteredResults = mockResults;

    if (params.mediaType) {
      filteredResults = filteredResults.filter(
        (post) => post.mediaType === params.mediaType,
      );
    }

    if (params.minLikes) {
      filteredResults = filteredResults.filter(
        (post) => post.likesCount >= params.minLikes!,
      );
    }

    if (params.minComments) {
      filteredResults = filteredResults.filter(
        (post) => post.commentsCount >= params.minComments!,
      );
    }

    if (params.hasLocation) {
      filteredResults = filteredResults.filter((post) => post.location);
    }

    if (params.isVerifiedUser) {
      filteredResults = filteredResults.filter((post) => post.user.isVerified);
    }

    // Sort results
    if (params.sortBy === 'recent') {
      filteredResults.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (params.sortBy === 'popular') {
      filteredResults.sort((a, b) => b.likesCount - a.likesCount);
    } else if (params.sortBy === 'oldest') {
      filteredResults.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    const relatedSuggestions = await this.getSuggestions(params.query);

    return {
      results: filteredResults,
      totalCount: filteredResults.length,
      suggestions: relatedSuggestions,
    };
  }

  // Add search to history
  private addToSearchHistory(query: string, resultCount: number): void {
    const existingIndex = this.searchHistory.findIndex(
      (h) => h.query === query,
    );

    if (existingIndex !== -1) {
      // Update existing search
      this.searchHistory[existingIndex] = {
        ...this.searchHistory[existingIndex],
        timestamp: new Date(),
        resultCount,
      };
    } else {
      // Add new search
      this.searchHistory.unshift({
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        resultCount,
      });
    }

    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'explore_search_history',
        JSON.stringify(this.searchHistory),
      );
    }
  }

  // Get search history
  getSearchHistory(): SearchHistory[] {
    // Load from localStorage on first call
    if (this.searchHistory.length === 0 && typeof window !== 'undefined') {
      const stored = localStorage.getItem('explore_search_history');
      if (stored) {
        try {
          this.searchHistory = JSON.parse(stored).map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          }));
        } catch (error) {
          console.error('Error loading search history:', error);
        }
      }
    }

    return this.searchHistory;
  }

  // Clear search history
  clearSearchHistory(): void {
    this.searchHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('explore_search_history');
    }
  }

  // Get popular searches
  getPopularSearches(): SearchSuggestion[] {
    return this.mockTrendingSearches
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10);
  }
}

export const advancedSearchService = new AdvancedSearchService();
