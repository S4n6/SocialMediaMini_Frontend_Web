'use client';

import React, { useState } from 'react';
import {
  Filter,
  Calendar,
  Heart,
  MessageCircle,
  MapPin,
  CheckCircle,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdvancedSearchParams } from '../services/advancedSearchService';

interface AdvancedSearchFiltersProps {
  filters: AdvancedSearchParams;
  onFiltersChange: (filters: AdvancedSearchParams) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] =
    useState<AdvancedSearchParams>(filters);

  const handleFilterChange = (key: keyof AdvancedSearchParams, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleReset = () => {
    const resetFilters: AdvancedSearchParams = {
      query: filters.query,
      sortBy: 'relevance',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onResetFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.mediaType) count++;
    if (localFilters.dateRange) count++;
    if (localFilters.minLikes) count++;
    if (localFilters.minComments) count++;
    if (localFilters.hasLocation) count++;
    if (localFilters.isVerifiedUser) count++;
    if (localFilters.sortBy && localFilters.sortBy !== 'relevance') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`relative ${isOpen ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}
      >
        <SlidersHorizontal size={16} className="mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-80 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Advanced Filters
            </h3>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Media Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Media Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: undefined, label: 'All' },
                  { value: 'image', label: 'Images' },
                  { value: 'video', label: 'Videos' },
                  { value: 'carousel', label: 'Carousels' },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() =>
                      handleFilterChange('mediaType', option.value)
                    }
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      localFilters.mediaType === option.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={localFilters.sortBy || 'relevance'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="relevance">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Engagement Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Heart size={14} className="inline mr-1" />
                  Min Likes
                </label>
                <input
                  type="number"
                  value={localFilters.minLikes || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minLikes',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="0"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MessageCircle size={14} className="inline mr-1" />
                  Min Comments
                </label>
                <input
                  type="number"
                  value={localFilters.minComments || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minComments',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="0"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.hasLocation || false}
                  onChange={(e) =>
                    handleFilterChange(
                      'hasLocation',
                      e.target.checked || undefined,
                    )
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Has Location
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.isVerifiedUser || false}
                  onChange={(e) =>
                    handleFilterChange(
                      'isVerifiedUser',
                      e.target.checked || undefined,
                    )
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <CheckCircle size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Verified Users Only
                </span>
              </label>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={
                    localFilters.dateRange?.from
                      ? localFilters.dateRange.from.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    const from = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleFilterChange(
                      'dateRange',
                      from
                        ? {
                            ...localFilters.dateRange,
                            from,
                          }
                        : undefined,
                    );
                  }}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={
                    localFilters.dateRange?.to
                      ? localFilters.dateRange.to.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    const to = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleFilterChange(
                      'dateRange',
                      to
                        ? {
                            ...localFilters.dateRange,
                            to,
                          }
                        : undefined,
                    );
                  }}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
