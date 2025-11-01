export interface SearchQuery {
  text: string;
  conversationId?: string;
  userId?: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
  fromMe?: boolean;
}

export interface SearchResult {
  id: string;
  messageId: string;
  conversationId: string;
  content: string;
  snippet: string; // Highlighted search result snippet
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  matchedText: string[];
  contextBefore?: string;
  contextAfter?: string;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
}

export interface SearchFilters {
  conversations: string[]; // Conversation IDs to search in
  users: string[]; // User IDs to search from
  messageTypes: ('text' | 'image' | 'video' | 'audio' | 'file')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'relevance' | 'date' | 'sender';
  sortOrder: 'asc' | 'desc';
}

export interface MessageHistory {
  conversationId: string;
  messages: HistoryMessage[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface HistoryMessage {
  id: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  reactions?: {
    emoji: string;
    users: string[];
    count: number;
  }[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnail?: string;
  }[];
}

export interface PaginationOptions {
  limit: number;
  cursor?: string;
  direction: 'before' | 'after';
}

export interface MessageFilter {
  type: 'sender' | 'date' | 'messageType' | 'hasAttachments';
  value: any;
  operator: 'equals' | 'contains' | 'before' | 'after' | 'between';
}

export interface ConversationSummary {
  conversationId: string;
  name: string;
  type: 'direct' | 'group';
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
  messageCount: number;
  participantCount: number;
  createdAt: string;
}

export interface SearchHighlight {
  start: number;
  end: number;
  text: string;
}

export interface AdvancedSearchOptions {
  exactPhrase?: boolean;
  caseSensitive?: boolean;
  includeDeleted?: boolean;
  searchInFiles?: boolean;
  regex?: boolean;
}

// Search history for user's previous searches
export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  timestamp: string;
  resultCount: number;
}

// Export interface for search statistics
export interface SearchStats {
  totalMessages: number;
  totalConversations: number;
  messagesByType: Record<string, number>;
  messagesByDate: Record<string, number>;
  topSenders: {
    userId: string;
    name: string;
    messageCount: number;
  }[];
}
