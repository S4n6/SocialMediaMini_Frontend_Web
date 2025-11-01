import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SearchQuery,
  SearchResult,
  SearchFilters,
  MessageHistory,
  HistoryMessage,
  PaginationOptions,
  SearchStats,
} from '../types/search';

interface UseMessageSearchOptions {
  debounceMs?: number;
  pageSize?: number;
  maxSearchHistory?: number;
}

export function useMessageSearch(options: UseMessageSearchOptions = {}) {
  const { debounceMs = 300, pageSize = 20, maxSearchHistory = 10 } = options;

  // Search state
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    text: '',
    messageType: 'all',
    hasAttachments: false,
    fromMe: false,
  });

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    conversations: [],
    users: [],
    messageTypes: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);

  // History state
  const [messageHistory, setMessageHistory] = useState<MessageHistory | null>(
    null,
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mock API functions
  const searchMessages = useCallback(
    async (
      query: SearchQuery,
      filters: SearchFilters,
    ): Promise<SearchResult[]> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockResults: SearchResult[] = [
        {
          id: 'result1',
          messageId: 'msg1',
          conversationId: 'conv1',
          content: `Great work on the ${query.text} feature! I think we should implement this in the next sprint.`,
          snippet: `Great work on the **${query.text}** feature! I think we should...`,
          messageType: 'text',
          senderId: 'user1',
          senderName: 'John Doe',
          senderAvatar: '',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          matchedText: [query.text],
          contextBefore: 'In our previous discussion about the roadmap,',
          contextAfter: 'Let me know what you think about the timeline.',
        },
        {
          id: 'result2',
          messageId: 'msg2',
          conversationId: 'conv2',
          content: `The ${query.text} looks fantastic in the mockups. Can we proceed?`,
          snippet: `The **${query.text}** looks fantastic in the mockups. Can we proceed?`,
          messageType: 'text',
          senderId: 'user2',
          senderName: 'Alice Designer',
          senderAvatar: '',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          matchedText: [query.text],
          contextBefore: 'After reviewing the design requirements,',
          contextAfter: 'I think we should move forward with this approach.',
        },
      ];

      return mockResults.filter((result) => {
        if (
          filters.conversations?.length &&
          !filters.conversations.includes(result.conversationId)
        ) {
          return false;
        }
        if (
          filters.messageTypes?.length &&
          !filters.messageTypes.includes(result.messageType)
        ) {
          return false;
        }
        if (filters.users?.length && !filters.users.includes(result.senderId)) {
          return false;
        }
        return true;
      });
    },
    [],
  );

  const loadMessageHistory = useCallback(
    async (
      conversationId: string,
      paginationOptions?: Partial<PaginationOptions>,
    ): Promise<MessageHistory> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const limit = paginationOptions?.limit || 20;
      const mockMessages: HistoryMessage[] = Array.from(
        { length: limit },
        (_, i) => ({
          id: `hist_msg_${i}`,
          content: `This is a historical message #${i + 1}. It contains some sample content for testing.`,
          messageType: 'text' as const,
          senderId: `user${(i % 3) + 1}`,
          senderName: [`John Doe`, `Alice Smith`, `Bob Wilson`][i % 3],
          senderAvatar: '',
          timestamp: new Date(
            Date.now() - (i + 1) * 60 * 60 * 1000,
          ).toISOString(),
          attachments:
            i % 5 === 0
              ? [
                  {
                    id: `att_${i}`,
                    name: `document_${i}.pdf`,
                    type: 'file',
                    size: 1024 * (i + 1),
                    url: '#',
                  },
                ]
              : [],
          reactions:
            i % 3 === 0
              ? [{ emoji: '👍', users: ['user1', 'user2'], count: 2 }]
              : [],
          editedAt:
            i % 7 === 0
              ? new Date(Date.now() - i * 30 * 60 * 1000).toISOString()
              : undefined,
          replyTo:
            i % 4 === 0
              ? {
                  id: `hist_msg_${i - 1}`,
                  content: 'Previous message content',
                  senderName: 'Previous Sender',
                }
              : undefined,
        }),
      );

      return {
        conversationId,
        messages: mockMessages,
        totalCount: 500,
        hasMore: limit < 500,
        nextCursor: `cursor_${limit}`,
        prevCursor: 'cursor_0',
      };
    },
    [],
  );

  const getSearchStats = useCallback(async (): Promise<SearchStats> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      totalMessages: 12547,
      totalConversations: 45,
      messagesByType: {
        text: 9847,
        image: 1562,
        video: 423,
        audio: 287,
        file: 428,
      },
      messagesByDate: {
        '2024-01': 1245,
        '2024-02': 1387,
        '2024-03': 1562,
        '2024-04': 1423,
        '2024-05': 1356,
        '2024-06': 1478,
      },
      topSenders: [
        { userId: 'user1', name: 'John Doe', messageCount: 2847 },
        { userId: 'user2', name: 'Jane Smith', messageCount: 2156 },
        { userId: 'user3', name: 'Alice Cooper', messageCount: 1923 },
      ],
    };
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    async (query: SearchQuery, filters: SearchFilters) => {
      if (!query.text.trim()) {
        setSearchResults([]);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsSearching(true);

      try {
        const results = await searchMessages(query, filters);

        if (!abortControllerRef.current.signal.aborted) {
          setSearchResults(results);

          if (query.text.trim()) {
            setSearchHistory((prev) => {
              const updated = [
                query.text,
                ...prev.filter((item) => item !== query.text),
              ];
              return updated.slice(0, maxSearchHistory);
            });
          }
        }
      } catch (error) {
        if (!abortControllerRef.current.signal.aborted) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setIsSearching(false);
        }
      }
    },
    [searchMessages, maxSearchHistory],
  );

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery, searchFilters);
    }, debounceMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchFilters, performSearch, debounceMs]);

  // Search functions
  const updateSearchText = useCallback((text: string) => {
    setSearchQuery((prev) => ({ ...prev, text }));
  }, []);

  const updateSearchQuery = useCallback((updates: Partial<SearchQuery>) => {
    setSearchQuery((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setSearchFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery((prev) => ({ ...prev, text: '' }));
    setSearchResults([]);
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // History functions
  const loadHistory = useCallback(
    async (
      conversationId: string,
      paginationOptions?: Partial<PaginationOptions>,
    ) => {
      setIsLoadingHistory(true);
      try {
        const history = await loadMessageHistory(
          conversationId,
          paginationOptions,
        );
        setMessageHistory(history);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [loadMessageHistory],
  );

  const loadMoreHistory = useCallback(async () => {
    if (!messageHistory || !messageHistory.hasMore || isLoadingHistory) {
      return;
    }

    setIsLoadingHistory(true);

    try {
      const additionalHistory = await loadMessageHistory(
        messageHistory.conversationId,
        {
          limit: 20,
          cursor: messageHistory.nextCursor,
          direction: 'after',
        },
      );

      setMessageHistory((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, ...additionalHistory.messages],
              hasMore: additionalHistory.hasMore,
              nextCursor: additionalHistory.nextCursor,
            }
          : additionalHistory,
      );
    } catch (error) {
      console.error('Error loading more history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [messageHistory, isLoadingHistory, loadMessageHistory]);

  // Stats function
  const loadStats = useCallback(async () => {
    try {
      const stats = await getSearchStats();
      setSearchStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [getSearchStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Search state
    searchQuery,
    searchFilters,
    searchResults,
    isSearching,
    searchHistory,
    searchStats,

    // History state
    messageHistory,
    isLoadingHistory,

    // Search functions
    updateSearchText,
    updateSearchQuery,
    updateFilters,
    clearSearch,
    clearSearchHistory,

    // History functions
    loadHistory,
    loadMoreHistory,

    // Stats function
    loadStats,
  };
}
