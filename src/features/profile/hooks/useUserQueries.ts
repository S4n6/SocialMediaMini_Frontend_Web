import {
  useQuery,
  UseQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { User } from "@/types";
import { authService, usersService } from "@/services/api.service";
import {
  UserQueryConfig,
  UserSearchConfig,
  UserSuggestionConfig,
  UserSearchParams,
  UserSearchResult,
  UserSearchResponse,
  UserSuggestion,
  UserSuggestionsResponse,
  UserStatistics,
  UserActivityItem,
  GetCurrentUserResponse,
  UserError,
  UserQueryKeys,
} from "./types";

// ===== QUERY KEY FACTORY =====

/**
 * Factory for generating consistent user query keys
 */
export const userQueryKeys: UserQueryKeys = {
  all: ["users"] as const,
  currentUser: () => ["users", "current"] as const,
  user: (id: string) => ["users", "detail", id] as const,
  userWithStats: (id: string) => ["users", "detail", id, "with-stats"] as const,
  search: (params: UserSearchParams) =>
    [
      "users",
      "search",
      params.query,
      params.filters || {},
      params.sortBy || "relevance",
      params.page || 1,
      params.limit || 20,
    ] as const,
  suggestions: (config?: UserSuggestionConfig) =>
    [
      "users",
      "suggestions",
      config?.limit || 10,
      config?.basedOnNetwork ?? true,
      config?.includeMutualConnections ?? true,
    ] as const,
  statistics: (userId: string) => ["users", "statistics", userId] as const,
  activity: (userId: string, options?: { limit?: number; offset?: number }) =>
    [
      "users",
      "activity",
      userId,
      options?.limit || 20,
      options?.offset || 0,
    ] as const,
} as const;

// ===== ERROR HANDLER =====

/**
 * Centralized error handler for user queries
 */
const handleUserQueryError = (error: unknown, operation: string): UserError => {
  const userError = error as UserError;
  return {
    ...userError,
    operation,
    timestamp: new Date().toISOString(),
  };
};

// ===== CURRENT USER QUERIES =====

/**
 * Hook for fetching current user data
 */
export const useCurrentUserQuery = (config?: UserQueryConfig) => {
  const queryConfig: UseQueryOptions<GetCurrentUserResponse | null, UserError> =
    {
      queryKey: userQueryKeys.currentUser(),
      queryFn: async (): Promise<GetCurrentUserResponse | null> => {
        try {
          const response = await authService.getCurrentUser();
          return {
            user: response.data || null,
            // Note: Add preferences and statistics when API supports them
          };
        } catch (error) {
          throw handleUserQueryError(error, "getCurrentUser");
        }
      },
      staleTime: config?.staleTime ?? 1000 * 60, // 1 minute
      gcTime: config?.cacheTime ?? 1000 * 60 * 5, // 5 minutes
      retry: config?.retry ?? 1,
      refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
      enabled: true, // Always enabled for current user
    };

  return useQuery(queryConfig);
};

// ===== USER PROFILE QUERIES =====

/**
 * Hook for fetching user by ID
 */
export const useUserByIdQuery = (
  userId: string | undefined,
  config?: UserQueryConfig
) => {
  const queryConfig: UseQueryOptions<User, UserError> = {
    queryKey: userQueryKeys.user(userId || ""),
    queryFn: async (): Promise<User> => {
      if (!userId) {
        throw handleUserQueryError(
          new Error("No userId provided"),
          "getUserById"
        );
      }

      try {
        const response = await usersService.getUserById(userId);
        return response.data as User;
      } catch (error) {
        throw handleUserQueryError(error, "getUserById");
      }
    },
    enabled: !!userId,
    staleTime: config?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    gcTime: config?.cacheTime ?? 1000 * 60 * 10, // 10 minutes
    retry: config?.retry ?? 2,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  };

  return useQuery(queryConfig);
};

/**
 * Hook for fetching user with detailed statistics
 */
export const useUserWithStatsQuery = (
  userId: string | undefined,
  config?: UserQueryConfig
) => {
  const queryConfig: UseQueryOptions<
    User & { statistics?: UserStatistics },
    UserError
  > = {
    queryKey: userQueryKeys.userWithStats(userId || ""),
    queryFn: async (): Promise<User & { statistics?: UserStatistics }> => {
      if (!userId) {
        throw handleUserQueryError(
          new Error("No userId provided"),
          "getUserWithStats"
        );
      }

      try {
        // For now, we'll fetch user data and mock statistics
        // In a real implementation, you'd have an API endpoint that returns both
        const response = await usersService.getUserById(userId);
        const user = response.data as User;

        // Mock statistics - replace with actual API call when available
        const statistics: UserStatistics = {
          content: {
            postsCount: user._count?.posts || 0,
            likesReceived: 0, // Would come from API
            commentsReceived: 0, // Would come from API
            sharesReceived: 0, // Would come from API
            engagementRate: 0, // Would come from API
          },
          network: {
            followersCount: user._count?.followers || 0,
            followingCount: user._count?.following || 0,
            mutualConnectionsCount: 0, // Would come from API
            followerGrowthRate: 0, // Would come from API
          },
          activity: {
            profileViews: 0, // Would come from API
            lastLogin: user.updatedAt,
            joinedDate: user.createdAt,
            daysSinceLastPost: 0, // Would come from API
          },
        };

        return { ...user, statistics };
      } catch (error) {
        throw handleUserQueryError(error, "getUserWithStats");
      }
    },
    enabled: !!userId,
    staleTime: config?.staleTime ?? 1000 * 60 * 2, // 2 minutes
    gcTime: config?.cacheTime ?? 1000 * 60 * 10, // 10 minutes
    retry: config?.retry ?? 2,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  };

  return useQuery(queryConfig);
};

// ===== USER SEARCH QUERIES =====

/**
 * Hook for searching users
 */
export const useUserSearchQuery = (
  searchParams: UserSearchParams | undefined,
  config?: UserSearchConfig
) => {
  const minQueryLength = config?.minQueryLength ?? 2;
  const isSearchEnabled =
    !!searchParams?.query && searchParams.query.length >= minQueryLength;

  const queryConfig: UseQueryOptions<UserSearchResponse, UserError> = {
    queryKey: userQueryKeys.search(searchParams || { query: "" }),
    queryFn: async (): Promise<UserSearchResponse> => {
      if (!searchParams?.query) {
        throw handleUserQueryError(
          new Error("No search query provided"),
          "searchUsers"
        );
      }

      try {
        const response = await usersService.searchUsers(searchParams.query);

        // Transform the basic response into enhanced search results
        // In a real implementation, the API would handle filtering, sorting, etc.
        const users = (response.data || []) as User[];
        const searchResults: UserSearchResult[] = users.map((user) => ({
          ...user,
          relevanceScore: 100, // Mock relevance score
          followStatus: "none" as const, // Would be determined by API
        }));

        return {
          users: searchResults,
          pagination: {
            currentPage: searchParams.page || 1,
            totalPages: Math.ceil(
              searchResults.length / (searchParams.limit || 20)
            ),
            totalResults: searchResults.length,
            hasNextPage: false, // Would be determined by API
            hasPreviousPage: (searchParams.page || 1) > 1,
          },
          filters: {
            appliedFilters: searchParams.filters || {},
            availableFilters: {
              locations: [], // Would come from API
              categories: [], // Would come from API
            },
          },
        };
      } catch (error) {
        throw handleUserQueryError(error, "searchUsers");
      }
    },
    enabled: isSearchEnabled,
    staleTime: config?.staleTime ?? 1000 * 30, // 30 seconds for search
    gcTime: config?.cacheTime ?? 1000 * 60 * 2, // 2 minutes for search
    retry: config?.retry ?? 1,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  };

  return useQuery(queryConfig);
};

/**
 * Hook for infinite user search (pagination)
 */
export const useInfiniteUserSearchQuery = (
  baseSearchParams: Omit<UserSearchParams, "page">,
  config?: UserSearchConfig
) => {
  const minQueryLength = config?.minQueryLength ?? 2;
  const isSearchEnabled =
    !!baseSearchParams?.query &&
    baseSearchParams.query.length >= minQueryLength;

  return useInfiniteQuery({
    queryKey: [
      ...userQueryKeys.search({ ...baseSearchParams, page: 1 }),
      "infinite",
    ],
    queryFn: async ({ pageParam = 1 }): Promise<UserSearchResponse> => {
      const currentPage = pageParam as number;
      const searchParams = { ...baseSearchParams, page: currentPage };

      try {
        const response = await usersService.searchUsers(searchParams.query);
        const users = (response.data || []) as User[];
        const searchResults: UserSearchResult[] = users.map((user) => ({
          ...user,
          relevanceScore: 100,
          followStatus: "none" as const,
        }));

        return {
          users: searchResults,
          pagination: {
            currentPage,
            totalPages: Math.ceil(
              searchResults.length / (searchParams.limit || 20)
            ),
            totalResults: searchResults.length,
            hasNextPage: searchResults.length >= (searchParams.limit || 20),
            hasPreviousPage: currentPage > 1,
          },
          filters: {
            appliedFilters: searchParams.filters || {},
            availableFilters: { locations: [], categories: [] },
          },
        };
      } catch (error) {
        throw handleUserQueryError(error, "infiniteSearchUsers");
      }
    },
    getNextPageParam: (lastPage: UserSearchResponse) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage: UserSearchResponse) =>
      firstPage.pagination.hasPreviousPage
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
    enabled: isSearchEnabled,
    staleTime: config?.staleTime ?? 1000 * 30,
    gcTime: config?.cacheTime ?? 1000 * 60 * 2,
    retry: config?.retry ?? 1,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  });
};

// ===== USER SUGGESTIONS QUERIES =====

/**
 * Hook for fetching user suggestions
 */
export const useUserSuggestionsQuery = (config?: UserSuggestionConfig) => {
  const queryConfig: UseQueryOptions<UserSuggestionsResponse, UserError> = {
    queryKey: userQueryKeys.suggestions(config),
    queryFn: async (): Promise<UserSuggestionsResponse> => {
      try {
        // Mock implementation - replace with actual API call
        // In a real implementation, you'd have a suggestions endpoint
        const mockSuggestions: UserSuggestion[] = [
          // This would come from your suggestions API
        ];

        return {
          suggestions: mockSuggestions,
          meta: {
            totalAvailable: mockSuggestions.length,
            refreshedAt: new Date().toISOString(),
            nextRefreshIn: 3600, // 1 hour
          },
        };
      } catch (error) {
        throw handleUserQueryError(error, "getUserSuggestions");
      }
    },
    staleTime: config?.staleTime ?? 1000 * 60 * 30, // 30 minutes
    gcTime: config?.cacheTime ?? 1000 * 60 * 60, // 1 hour
    retry: config?.retry ?? 2,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  };

  return useQuery(queryConfig);
};

// ===== USER STATISTICS QUERIES =====

/**
 * Hook for fetching detailed user statistics
 */
export const useUserStatisticsQuery = (
  userId: string | undefined,
  config?: UserQueryConfig
) => {
  const queryConfig: UseQueryOptions<UserStatistics, UserError> = {
    queryKey: userQueryKeys.statistics(userId || ""),
    queryFn: async (): Promise<UserStatistics> => {
      if (!userId) {
        throw handleUserQueryError(
          new Error("No userId provided"),
          "getUserStatistics"
        );
      }

      try {
        // Mock implementation - replace with actual statistics API
        // In a real implementation, you'd have a statistics endpoint
        const user = await usersService.getUserById(userId);
        const userData = user.data as User;

        return {
          content: {
            postsCount: userData._count?.posts || 0,
            likesReceived: 0,
            commentsReceived: 0,
            sharesReceived: 0,
            engagementRate: 0,
          },
          network: {
            followersCount: userData._count?.followers || 0,
            followingCount: userData._count?.following || 0,
            mutualConnectionsCount: 0,
            followerGrowthRate: 0,
          },
          activity: {
            profileViews: 0,
            lastLogin: userData.updatedAt,
            joinedDate: userData.createdAt,
            daysSinceLastPost: 0,
          },
        };
      } catch (error) {
        throw handleUserQueryError(error, "getUserStatistics");
      }
    },
    enabled: !!userId,
    staleTime: config?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    gcTime: config?.cacheTime ?? 1000 * 60 * 15, // 15 minutes
    retry: config?.retry ?? 2,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  };

  return useQuery(queryConfig);
};

// ===== USER ACTIVITY QUERIES =====

/**
 * Hook for fetching user activity timeline
 */
export const useUserActivityQuery = (
  userId: string | undefined,
  options?: { limit?: number; offset?: number },
  config?: UserQueryConfig
) => {
  const queryConfig: UseQueryOptions<UserActivityItem[], UserError> = {
    queryKey: userQueryKeys.activity(userId || "", options),
    queryFn: async (): Promise<UserActivityItem[]> => {
      if (!userId) {
        throw handleUserQueryError(
          new Error("No userId provided"),
          "getUserActivity"
        );
      }

      try {
        // Mock implementation - replace with actual activity API
        // In a real implementation, you'd have an activity timeline endpoint
        return [];
      } catch (error) {
        throw handleUserQueryError(error, "getUserActivity");
      }
    },
    enabled: !!userId,
    staleTime: config?.staleTime ?? 1000 * 60 * 2, // 2 minutes
    gcTime: config?.cacheTime ?? 1000 * 60 * 10, // 10 minutes
    retry: config?.retry ?? 2,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
  };

  return useQuery(queryConfig);
};

// ===== UTILITY FUNCTIONS =====

/**
 * Pre-built query configurations for common use cases
 */
export const userQueryConfigs = {
  /** Configuration for real-time user data */
  realtime: {
    staleTime: 0,
    cacheTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    realtime: true,
  } as UserQueryConfig,

  /** Configuration for cached user data */
  cached: {
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  } as UserQueryConfig,

  /** Configuration for search operations */
  search: {
    minQueryLength: 2,
    debounceMs: 300,
    limit: 20,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 2,
  } as UserSearchConfig,

  /** Configuration for suggestions */
  suggestions: {
    limit: 10,
    basedOnNetwork: true,
    includeMutualConnections: true,
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
  } as UserSuggestionConfig,
} as const;
