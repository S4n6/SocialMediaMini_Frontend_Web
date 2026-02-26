import type {
  SearchHistoryItem,
  SearchHistoryResponse,
  SearchHistoryApiResponse,
} from "../types/search-history";
import type { ApiResponse } from "@/types/api";

// Search history hook configuration
export interface SearchHistoryConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enableToast?: boolean;
  maxHistoryItems?: number;
}

// Search history state interface
export interface SearchHistoryState {
  searchHistory: SearchHistoryItem[];
  totalHistory: number;
  isLoading: boolean;
  error: SearchHistoryError | null;
  hasHistory: boolean;
}

// Search history actions interface
export interface SearchHistoryActions {
  addUserToHistory: (searchedUserId: string) => Promise<ApiResponse<null>>;
  clearHistory: () => Promise<ApiResponse<null>>;
  removeUserFromHistory: (userId: string) => Promise<ApiResponse<null>>;
  getSearchSuggestions: (currentQuery: string) => SearchHistoryItem[];
}

// Search history error interface
export interface SearchHistoryError {
  code: string;
  message: string;
  status?: number;
}

// Search history query options
export interface SearchHistoryQueryOptions extends SearchHistoryConfig {
  enabled?: boolean;
  select?: (data: SearchHistoryApiResponse) => any;
}

// Search history mutation options
export interface SearchHistoryMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: SearchHistoryError) => void;
  enableToast?: boolean;
}

// Search suggestion options
export interface SearchSuggestionOptions {
  maxResults?: number;
  includeUserName?: boolean;
  includeFullName?: boolean;
  caseSensitive?: boolean;
}

// Re-export types for convenience
export type {
  SearchHistoryItem,
  SearchHistoryApiResponse,
  SearchHistoryResponse,
};
