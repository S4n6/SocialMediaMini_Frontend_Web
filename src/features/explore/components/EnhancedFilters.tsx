'use client';

import React, { useState, useEffect } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  Image,
  Video,
  Camera,
  Heart,
  MessageCircle,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle,
  Star,
  Clock,
  Users,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExploreCategory } from '../types/explore';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  trending?: boolean;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'single' | 'multi' | 'range';
  options: FilterOption[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface EnhancedFiltersProps {
  activeCategory: ExploreCategory;
  activeFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  onClearAll: () => void;
  resultCount?: number;
}

export const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  activeCategory,
  activeFilters,
  onFiltersChange,
  onClearAll,
  resultCount,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['mediaType']),
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter groups configuration
  const filterGroups: FilterGroup[] = [
    {
      id: 'mediaType',
      label: 'Media Type',
      type: 'multi',
      icon: Image,
      options: [
        {
          id: 'image',
          label: 'Photos',
          value: 'image',
          icon: Image,
          count: 15420,
        },
        {
          id: 'video',
          label: 'Videos',
          value: 'video',
          icon: Video,
          count: 8930,
        },
        {
          id: 'carousel',
          label: 'Carousels',
          value: 'carousel',
          icon: Camera,
          count: 3210,
        },
      ],
    },
    {
      id: 'engagement',
      label: 'Engagement',
      type: 'multi',
      icon: Heart,
      options: [
        {
          id: 'trending',
          label: 'Trending',
          value: 'trending',
          icon: TrendingUp,
          trending: true,
        },
        { id: 'popular', label: 'Popular', value: 'popular', icon: Star },
        { id: 'viral', label: 'Viral', value: 'viral', icon: Heart },
        { id: 'recent', label: 'Recent', value: 'recent', icon: Clock },
      ],
    },
    {
      id: 'timeframe',
      label: 'Time Period',
      type: 'single',
      icon: Calendar,
      options: [
        { id: 'today', label: 'Today', value: 'today', count: 234 },
        { id: 'week', label: 'This Week', value: 'week', count: 1890 },
        { id: 'month', label: 'This Month', value: 'month', count: 7654 },
        { id: 'year', label: 'This Year', value: 'year', count: 45321 },
        { id: 'all', label: 'All Time', value: 'all' },
      ],
    },
    {
      id: 'location',
      label: 'Location',
      type: 'multi',
      icon: MapPin,
      options: [
        {
          id: 'hasLocation',
          label: 'Has Location',
          value: 'hasLocation',
          icon: MapPin,
        },
        { id: 'nearby', label: 'Nearby', value: 'nearby', icon: MapPin },
        {
          id: 'popular-places',
          label: 'Popular Places',
          value: 'popularPlaces',
          icon: Star,
        },
      ],
    },
    {
      id: 'user',
      label: 'User Type',
      type: 'multi',
      icon: Users,
      options: [
        {
          id: 'verified',
          label: 'Verified',
          value: 'verified',
          icon: CheckCircle,
          count: 892,
        },
        {
          id: 'following',
          label: 'Following',
          value: 'following',
          icon: Users,
          count: 234,
        },
        { id: 'suggested', label: 'Suggested', value: 'suggested', icon: Star },
      ],
    },
  ];

  const getActiveFilterCount = (): number => {
    return Object.values(activeFilters).reduce(
      (total, filters) => total + filters.length,
      0,
    );
  };

  const handleFilterToggle = (groupId: string, optionValue: string) => {
    const group = filterGroups.find((g) => g.id === groupId);
    if (!group) return;

    const currentFilters = activeFilters[groupId] || [];
    let newFilters: string[];

    if (group.type === 'single') {
      newFilters = currentFilters.includes(optionValue) ? [] : [optionValue];
    } else {
      newFilters = currentFilters.includes(optionValue)
        ? currentFilters.filter((f) => f !== optionValue)
        : [...currentFilters, optionValue];
    }

    onFiltersChange({
      ...activeFilters,
      [groupId]: newFilters,
    });
  };

  const handleGroupToggle = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getSmartSuggestions = () => {
    const suggestions = [];

    // If user selected videos, suggest trending and recent
    if (activeFilters.mediaType?.includes('video')) {
      if (!activeFilters.engagement?.includes('trending')) {
        suggestions.push({
          group: 'engagement',
          option: 'trending',
          reason: 'Popular with videos',
        });
      }
    }

    // If user selected trending, suggest this week
    if (activeFilters.engagement?.includes('trending')) {
      if (!activeFilters.timeframe?.includes('week')) {
        suggestions.push({
          group: 'timeframe',
          option: 'week',
          reason: 'Best timeframe for trending',
        });
      }
    }

    return suggestions;
  };

  const activeFilterCount = getActiveFilterCount();
  const smartSuggestions = getSmartSuggestions();

  return (
    <div className="mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`relative ${showAdvanced ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}
          >
            <Filter size={16} className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {resultCount !== undefined && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {resultCount.toLocaleString()} results
              {activeCategory !== 'all' && (
                <span className="ml-1">in {activeCategory}</span>
              )}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).map(([groupId, filters]) =>
            filters.map((filterValue) => {
              const group = filterGroups.find((g) => g.id === groupId);
              const option = group?.options.find(
                (o) => o.value === filterValue,
              );
              if (!option) return null;

              return (
                <div
                  key={`${groupId}-${filterValue}`}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {option.icon && <option.icon size={14} />}
                  <span>{option.label}</span>
                  <button
                    onClick={() => handleFilterToggle(groupId, filterValue)}
                    className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            }),
          )}
        </div>
      )}

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && showAdvanced && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings
              size={16}
              className="text-amber-600 dark:text-amber-400"
            />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Smart Suggestions
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((suggestion, index) => {
              const group = filterGroups.find((g) => g.id === suggestion.group);
              const option = group?.options.find(
                (o) => o.value === suggestion.option,
              );
              if (!option) return null;

              return (
                <button
                  key={index}
                  onClick={() =>
                    handleFilterToggle(suggestion.group, suggestion.option)
                  }
                  className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-xs transition-colors"
                  title={suggestion.reason}
                >
                  {option.icon && <option.icon size={12} />}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {filterGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const hasActiveFilters = (activeFilters[group.id] || []).length > 0;

            return (
              <div key={group.id} className="space-y-2">
                {/* Group Header */}
                <button
                  onClick={() => handleGroupToggle(group.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    hasActiveFilters
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <group.icon
                      size={16}
                      className={
                        hasActiveFilters
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500'
                      }
                    />
                    <span
                      className={`text-sm font-medium ${hasActiveFilters ? 'text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {group.label}
                    </span>
                    {hasActiveFilters && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {(activeFilters[group.id] || []).length}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Group Options */}
                {isExpanded && (
                  <div className="space-y-1 pl-2">
                    {group.options.map((option) => {
                      const isActive = (activeFilters[group.id] || []).includes(
                        option.value,
                      );

                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleFilterToggle(group.id, option.value)
                          }
                          className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {option.icon && <option.icon size={14} />}
                            <span>{option.label}</span>
                            {option.trending && (
                              <TrendingUp
                                size={12}
                                className="text-orange-500"
                              />
                            )}
                          </div>
                          {option.count && (
                            <span className="text-xs text-gray-500">
                              {option.count.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
