// Search history types

export interface SearchHistoryItem {
  id: string;
  userId: string;
  searchedUserId: string;
  searchedAt: string;
  user: {
    id: string;
    userName: string;
    fullName?: string;
    avatar?: string;
  };
}

export interface SearchHistoryResponse {
  items: SearchHistoryItem[];
  total: number;
}
