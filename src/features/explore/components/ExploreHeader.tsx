'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, TrendingUp, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchSuggestions } from './SearchSuggestions';
import { AdvancedSearchFilters } from './AdvancedSearchFilters';
import {
  advancedSearchService,
  SearchSuggestion,
  AdvancedSearchParams,
} from '../services/advancedSearchService';

interface ExploreHeaderProps {
  onSearch: (query: string) => void;
  onAdvancedSearch: (params: AdvancedSearchParams) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  searchQuery: string;
  searchFilters?: AdvancedSearchParams;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  onSearch,
  onAdvancedSearch,
  onClearSearch,
  isSearching,
  searchQuery,
  searchFilters = { query: '', sortBy: 'relevance' },
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(
    advancedSearchService.getSearchHistory(),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] =
    useState<AdvancedSearchParams>(searchFilters);

  // Trending searches/hashtags for suggestions
  const trendingSuggestions = [
    '#photography',
    '#travel',
    '#food',
    '#art',
    '#nature',
    '#sunset',
    '#lifestyle',
    '#fashion',
    '#music',
    '#fitness',
  ];

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchParams = { ...currentFilters, query: query.trim() };
      onAdvancedSearch(searchParams);
      setShowSuggestions(false);
      setShowFilters(false);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (value.length > 0) {
        setSuggestionLoading(true);
        advancedSearchService.searchWithDebounce(value, (newSuggestions) => {
          setSuggestions(newSuggestions);
          setSuggestionLoading(false);
          setShowSuggestions(true);
        });
      } else {
        setSuggestions(advancedSearchService.getTrendingSuggestions());
        setShowSuggestions(isFocused);
        setSuggestionLoading(false);
      }
    },
    [isFocused],
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setShowSuggestions(false);
    onClearSearch();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleHistoryClick = (query: string) => {
    setInputValue(query);
    handleSearch(query);
  };

  const handleClearHistory = () => {
    advancedSearchService.clearSearchHistory();
    setSearchHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    const updatedHistory = searchHistory.filter((h) => h.id !== id);
    setSearchHistory(updatedHistory);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!inputValue) {
      setSuggestions(advancedSearchService.getTrendingSuggestions());
    }
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleFiltersChange = (newFilters: AdvancedSearchParams) => {
    setCurrentFilters(newFilters);
  };

  const handleApplyFilters = () => {
    if (inputValue.trim()) {
      const searchParams = { ...currentFilters, query: inputValue.trim() };
      onAdvancedSearch(searchParams);
    }
    setShowFilters(false);
  };

  return (
    <div className="mb-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Explore
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover amazing content from our community
        </p>
      </div>

      {/* Search Section */}
      <div className="relative max-w-md mx-auto lg:max-w-lg">
        {/* Search Input */}
        <div
          className={`
          relative flex items-center bg-gray-100 dark:bg-gray-800 
          rounded-xl transition-all duration-200 shadow-sm
          ${isFocused ? 'ring-2 ring-blue-500 shadow-md' : ''}
        `}
        >
          <Search
            size={18}
            className="absolute left-4 text-gray-400 dark:text-gray-500"
          />

          <input
            type="text"
            placeholder="Search posts, hashtags, or users..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="
              w-full pl-12 pr-12 py-4 bg-transparent 
              text-gray-900 dark:text-white placeholder-gray-500 
              outline-none text-sm font-medium
            "
          />

          {/* Clear Button */}
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Advanced Search Suggestions */}
        {showSuggestions && (
          <SearchSuggestions
            suggestions={suggestions}
            searchHistory={searchHistory}
            showHistory={!inputValue}
            onSuggestionClick={handleSuggestionClick}
            onHistoryClick={handleHistoryClick}
            onClearHistory={handleClearHistory}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            loading={suggestionLoading}
          />
        )}

        {/* Search Actions */}
        <div className="flex justify-center items-center gap-3 mt-4">
          {isSearching && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-gray-600 dark:text-gray-400"
            >
              Clear search
            </Button>
          )}

          {/* Advanced Search Filters */}
          <AdvancedSearchFilters
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={() => {
              const resetFilters = {
                query: inputValue,
                sortBy: 'relevance' as const,
              };
              setCurrentFilters(resetFilters);
              handleApplyFilters();
            }}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>
      </div>
    </div>
  );
};
