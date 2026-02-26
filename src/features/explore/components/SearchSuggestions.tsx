'use client';

import React from 'react';
import { Search, Hash, MapPin, User, TrendingUp, Clock, X } from 'lucide-react';
import {
  SearchSuggestion,
  SearchHistory,
} from '../services/advancedSearchService';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  searchHistory: SearchHistory[];
  showHistory: boolean;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onHistoryClick: (query: string) => void;
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  loading?: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  searchHistory,
  showHistory,
  onSuggestionClick,
  onHistoryClick,
  onClearHistory,
  onRemoveHistoryItem,
  loading = false,
}) => {
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'hashtag':
        return <Hash size={16} className="text-blue-500" />;
      case 'user':
        return <User size={16} className="text-green-500" />;
      case 'location':
        return <MapPin size={16} className="text-red-500" />;
      case 'keyword':
        return <Search size={16} className="text-gray-500" />;
      default:
        return <Search size={16} className="text-gray-500" />;
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-10 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
      {/* Search History Section */}
      {showHistory && searchHistory.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clock size={14} />
              Recent Searches
            </div>
            <button
              onClick={onClearHistory}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear All
            </button>
          </div>
          <div className="pb-2">
            {searchHistory.slice(0, 5).map((history) => (
              <button
                key={history.id}
                onClick={() => onHistoryClick(history.query)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-gray-900 dark:text-white text-sm">
                    {history.query}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {history.resultCount} results
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistoryItem(history.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X size={12} className="text-gray-400" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div>
          {showHistory && searchHistory.length > 0 && (
            <div className="p-3 pb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Search size={14} />
                Suggestions
              </div>
            </div>
          )}
          <div
            className={showHistory && searchHistory.length > 0 ? '' : 'pt-2'}
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {getSuggestionIcon(suggestion.type)}
                  <span className="text-gray-900 dark:text-white text-sm">
                    {suggestion.text}
                  </span>
                  {suggestion.trending && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs">
                      <TrendingUp size={10} />
                      Trending
                    </div>
                  )}
                </div>
                {suggestion.count && (
                  <span className="text-xs text-gray-500">
                    {formatCount(suggestion.count)} posts
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!showHistory && suggestions.length === 0 && (
        <div className="p-6 text-center">
          <Search size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            Start typing to see search suggestions
          </p>
        </div>
      )}

      {/* Trending Footer */}
      {!showHistory && suggestions.some((s) => s.trending) && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp size={12} />
            Trending searches are updated hourly
          </div>
        </div>
      )}
    </div>
  );
};
