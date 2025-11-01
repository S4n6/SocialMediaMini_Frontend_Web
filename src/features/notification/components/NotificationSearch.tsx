'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NotificationType,
  NotificationQueryParams,
} from '../types/notification';

interface NotificationSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: NotificationQueryParams) => void;
  onClear: () => void;
  isLoading?: boolean;
  className?: string;
  resultCount?: number;
}

interface FilterState {
  types: NotificationType[];
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

export const NotificationSearch: React.FC<NotificationSearchProps> = ({
  onSearch,
  onFilter,
  onClear,
  isLoading = false,
  className = '',
  resultCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    types: [],
  });

  // Available filter options
  const notificationTypes: {
    value: NotificationType;
    label: string;
    color: string;
  }[] = [
    { value: 'follow', label: 'Follows', color: 'bg-green-100 text-green-700' },
    { value: 'message', label: 'Messages', color: 'bg-blue-100 text-blue-700' },
    {
      value: 'post_mention',
      label: 'Post Mentions',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      value: 'comment_mention',
      label: 'Comment Mentions',
      color: 'bg-purple-100 text-purple-700',
    },
    { value: 'system', label: 'System', color: 'bg-gray-100 text-gray-700' },
    {
      value: 'friend_request',
      label: 'Friend Requests',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      value: 'birthday',
      label: 'Birthdays',
      color: 'bg-pink-100 text-pink-700',
    },
    {
      value: 'post_share',
      label: 'Post Shares',
      color: 'bg-indigo-100 text-indigo-700',
    },
  ];

  // Handle search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch(value);
    },
    [onSearch],
  );

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  // Toggle notification type filter
  const toggleNotificationType = useCallback((type: NotificationType) => {
    setFilters((prev) => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types: newTypes };
    });
  }, []);

  // Handle read status filter
  const handleReadStatusChange = useCallback((isRead: boolean | undefined) => {
    setFilters((prev) => ({ ...prev, isRead }));
  }, []);

  // Handle date range
  const handleDateChange = useCallback(
    (field: 'startDate' | 'endDate', value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Apply filters
  const applyFilters = useCallback(() => {
    const queryParams: NotificationQueryParams = {};

    // Backend only supports single type filter, so use the first selected type
    if (filters.types.length > 0) {
      queryParams.type = filters.types[0];
    }

    if (filters.isRead !== undefined) {
      queryParams.isRead = filters.isRead;
    }

    if (filters.startDate) {
      queryParams.dateFrom = filters.startDate;
    }

    if (filters.endDate) {
      queryParams.dateTo = filters.endDate;
    }

    onFilter(queryParams);
  }, [filters, onFilter]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      types: [],
    });
    setSearchQuery('');
    onClear();
  }, [onClear]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.isRead !== undefined ||
      filters.startDate ||
      filters.endDate ||
      searchQuery.length > 0
    );
  }, [filters, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.isRead !== undefined) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Count */}
        {resultCount !== undefined && (
          <div className="mt-2 text-xs text-gray-500">
            {resultCount} notification{resultCount !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Filter Toggle & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Notification Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Notification Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleNotificationType(type.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filters.types.includes(type.value)
                      ? `${type.color} border-current`
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Read Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Read Status
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleReadStatusChange(undefined)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.isRead === undefined
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                All
              </button>
              <button
                onClick={() => handleReadStatusChange(false)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.isRead === false
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                Unread
              </button>
              <button
                onClick={() => handleReadStatusChange(true)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.isRead === true
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                Read
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Date Range
            </h4>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    handleDateChange('startDate', e.target.value)
                  }
                  className="text-xs"
                  disabled={isLoading}
                />
              </div>
              <span className="text-gray-400 text-xs">to</span>
              <div className="flex-1">
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="text-xs"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                applyFilters();
                setShowFilters(false);
              }}
              disabled={isLoading}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSearch;
