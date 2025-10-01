import type { SearchHistoryItem as GlobalSearchHistoryItem } from "@/types/search-history";

export type UserInfo = GlobalSearchHistoryItem["user"];

export type SearchHistoryItem = GlobalSearchHistoryItem;

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
  total: number;
}

export interface AddSearchHistoryDto {
  searchedUserId: string;
}

export interface SearchHistoryApiResponse {
  data: SearchHistoryResponse;
  message: string;
  success: boolean;
}
