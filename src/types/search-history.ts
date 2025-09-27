export interface UserInfo {
  id: string;
  userName: string;
  fullName: string;
  avatar: string | null;
}

export interface SearchHistoryItem {
  userId: string;
  searchedAt: string;
  user: UserInfo;
}

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
