// Message Search & History Components - Task 3
export { MessageSearch } from '../components/MessageSearch';
export { MessageHistoryView } from '../components/MessageHistory';
export { MessageSearchAndHistory } from '../components/MessageSearchAndHistory';

// Search & History Types
export type {
  SearchQuery,
  SearchResult,
  SearchFilters,
  MessageHistory,
  HistoryMessage,
  PaginationOptions,
  SearchStats,
  ConversationSummary,
  SearchHighlight,
  AdvancedSearchOptions,
  SearchHistoryItem,
  MessageFilter,
} from '../types/search';

// Search Hook
export { useMessageSearch } from '../hooks/useMessageSearch';

// Search Constants
export const SEARCH_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_SEARCH_HISTORY: 10,
  DEBOUNCE_MS: 300,
  MAX_RESULTS_PER_QUERY: 100,
};

export const MESSAGE_TYPE_LABELS = {
  text: 'Text Messages',
  image: 'Images',
  video: 'Videos',
  audio: 'Audio Messages',
  file: 'Files',
} as const;

export const SEARCH_SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date' },
  { value: 'sender', label: 'Sender' },
] as const;
