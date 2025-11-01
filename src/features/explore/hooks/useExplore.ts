import React, { useState, useCallback, useEffect } from 'react';
import { exploreService } from '../services/explore.service';
import {
  advancedSearchService,
  AdvancedSearchParams,
} from '../services/advancedSearchService';
import { filterPersistenceService } from '../services/filterPersistenceService';
import type {
  ExplorePost,
  ExploreFilters,
  ExploreSearchParams,
  ExploreQueryParams,
  ExploreCategory,
} from '../types/explore';

interface UseExploreResult {
  // State
  posts: ExplorePost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;

  // Filters and search
  filters: ExploreFilters;
  searchParams: ExploreSearchParams;
  enhancedFilters: Record<string, string[]>;

  // Actions
  fetchPosts: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  advancedSearchPosts: (params: AdvancedSearchParams) => Promise<void>;
  setCategory: (category: ExploreCategory) => void;
  setFilters: (filters: Partial<ExploreFilters>) => void;
  setSearchParams: (params: Partial<ExploreSearchParams>) => void;
  setEnhancedFilters: (filters: Record<string, string[]>) => void;
  clearSearch: () => void;
  clearAllFilters: () => void;
  refetch: () => Promise<void>;
  applyFilterPreset: (
    category: ExploreCategory,
    filters: Record<string, string[]>,
  ) => void;

  // Utils
  isSearching: boolean;
  isEmpty: boolean;
}

const POSTS_PER_PAGE = 20;

export function useExplore(): UseExploreResult {
  // State
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters and search
  const [filters, setFiltersState] = useState<ExploreFilters>({
    category: 'all',
    sortBy: 'trending',
    timeRange: 'all',
    mediaType: 'all',
  });

  const [searchParams, setSearchParamsState] = useState<ExploreSearchParams>(
    {},
  );

  // Enhanced filters state
  const [enhancedFilters, setEnhancedFiltersState] = useState<
    Record<string, string[]>
  >({});

  // Computed values
  const isSearching = Boolean(
    searchParams.query ||
      searchParams.hashtag ||
      searchParams.location ||
      searchParams.userId,
  );

  const isEmpty = !loading && posts.length === 0;

  // Build query parameters
  const buildQueryParams = useCallback((): ExploreQueryParams => {
    return {
      page: currentPage,
      limit: POSTS_PER_PAGE,
      category: filters.category,
      sortBy: filters.sortBy,
      timeRange: filters.timeRange,
      mediaType: filters.mediaType !== 'all' ? filters.mediaType : undefined,
      search: searchParams.query,
      hashtag: searchParams.hashtag,
      location: searchParams.location,
      minLikes: searchParams.minLikes,
      verified: searchParams.verified,
    };
  }, [currentPage, filters, searchParams]);

  // Fetch posts
  const fetchPosts = useCallback(
    async (reset: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = {
          ...buildQueryParams(),
          page: reset ? 1 : currentPage,
        };

        // Use mock data for development
        const response =
          await exploreService.getMockExploreResponse(queryParams);

        if (reset) {
          setPosts(response.posts);
          setCurrentPage(1);
        } else {
          setPosts((prev) => [...prev, ...response.posts]);
        }

        setHasMore(response.pagination.hasMore);
        setTotalCount(response.pagination.total);

        if (!reset) {
          setCurrentPage((prev) => prev + 1);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams, currentPage],
  );

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchPosts(false);
  }, [hasMore, loading, fetchPosts]);

  // Search posts
  const searchPosts = useCallback(
    async (query: string) => {
      setSearchParamsState((prev) => ({ ...prev, query }));
      setCurrentPage(1);
      await fetchPosts(true);
    },
    [fetchPosts],
  );

  // Advanced search posts
  const advancedSearchPosts = useCallback(
    async (params: AdvancedSearchParams) => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await advancedSearchService.performAdvancedSearch(params);

        setPosts(result.results);
        setTotalCount(result.totalCount);
        setCurrentPage(1);
        setHasMore(result.results.length < result.totalCount);

        // Update search params
        setSearchParamsState({
          query: params.query,
          sortBy: params.sortBy || 'relevance',
          mediaType:
            params.mediaType && params.mediaType !== 'text'
              ? params.mediaType
              : undefined,
          dateRange: params.dateRange,
          minEngagement:
            params.minLikes || params.minComments
              ? {
                  likes: params.minLikes,
                  comments: params.minComments,
                }
              : undefined,
        });

        // Update filters if category provided
        if (params.category) {
          setFiltersState((prev) => ({
            ...prev,
            category: params.category as ExploreCategory,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Advanced search failed');
        setPosts([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Set category
  const setCategory = useCallback((category: ExploreCategory) => {
    setFiltersState((prev) => ({ ...prev, category }));
    setCurrentPage(1);
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<ExploreFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Set search params
  const setSearchParams = useCallback(
    (newParams: Partial<ExploreSearchParams>) => {
      setSearchParamsState((prev) => ({ ...prev, ...newParams }));
      setCurrentPage(1);
    },
    [],
  );

  // Enhanced filters management
  const setEnhancedFilters = useCallback(
    (newFilters: Record<string, string[]>) => {
      setEnhancedFiltersState(newFilters);
      setCurrentPage(1);

      // Save preferences
      filterPersistenceService.savePreferences(
        filters.category,
        newFilters,
        searchParams.query,
      );
    },
    [filters.category, searchParams.query],
  );

  // Apply filter preset
  const applyFilterPreset = useCallback(
    (category: ExploreCategory, presetFilters: Record<string, string[]>) => {
      setFiltersState((prev) => ({ ...prev, category }));
      setEnhancedFiltersState(presetFilters);
      setCurrentPage(1);

      // Save preferences
      filterPersistenceService.savePreferences(
        category,
        presetFilters,
        searchParams.query,
      );
    },
    [searchParams.query],
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setEnhancedFiltersState({});
    setSearchParamsState({});
    setFiltersState((prev) => ({ ...prev, category: 'all' }));
    setCurrentPage(1);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchParamsState({});
    setCurrentPage(1);
  }, []);

  // Refetch
  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchPosts(true);
  }, [fetchPosts]);

  // Initial load and filter/search changes
  useEffect(() => {
    fetchPosts(true);
  }, [filters.category, filters.sortBy, filters.timeRange, filters.mediaType]);

  // Search params changes
  useEffect(() => {
    if (isSearching) {
      fetchPosts(true);
    }
  }, [
    searchParams.query,
    searchParams.hashtag,
    searchParams.location,
    searchParams.minLikes,
    searchParams.verified,
  ]);

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,

    // Filters and search
    filters,
    searchParams,
    enhancedFilters,

    // Actions
    fetchPosts,
    loadMore,
    searchPosts,
    advancedSearchPosts,
    setCategory,
    setFilters,
    setSearchParams,
    setEnhancedFilters,
    clearSearch,
    clearAllFilters,
    refetch,
    applyFilterPreset,

    // Utils
    isSearching,
    isEmpty,
  };
}
