'use client';

import React from 'react';
import { ExploreHeader } from '@/features/explore/components/ExploreHeader';
import { ExploreFilters } from '@/features/explore/components/ExploreFilters';
import { ExploreGrid } from '@/features/explore/components/ExploreGrid';
import { ExploreStats } from '@/features/explore/components/ExploreStats';
import { EnhancedFilters } from '@/features/explore/components/EnhancedFilters';
import { FilterPresets } from '@/features/explore/components/FilterPresets';
import { ExploreErrorBoundary } from '@/features/explore/components/ExploreErrorBoundary';
import { useExplore } from '@/features/explore/hooks/useExplore';

export default function ExplorePage() {
  const {
    posts,
    loading,
    error,
    hasMore,
    filters,
    searchParams,
    enhancedFilters,
    isSearching,
    isEmpty,
    searchPosts,
    advancedSearchPosts,
    setCategory,
    setEnhancedFilters,
    clearSearch,
    clearAllFilters,
    applyFilterPreset,
    loadMore,
    refetch,
  } = useExplore();

  return (
    <ExploreErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header with search */}
          <ExploreHeader
            onSearch={searchPosts}
            onAdvancedSearch={advancedSearchPosts}
            onClearSearch={clearSearch}
            isSearching={isSearching}
            searchQuery={searchParams.query || ''}
            searchFilters={{
              query: searchParams.query || '',
              category: filters.category,
              mediaType: searchParams.mediaType,
              dateRange: searchParams.dateRange,
              minLikes: searchParams.minEngagement?.likes,
              minComments: searchParams.minEngagement?.comments,
              hasLocation: searchParams.hasLocation,
              sortBy: searchParams.sortBy || 'relevance',
            }}
          />

          {/* Show stats when not searching */}
          {!isSearching && <ExploreStats />}

          {/* Filter Presets */}
          <FilterPresets
            activeCategory={filters.category}
            activeFilters={enhancedFilters}
            onPresetApply={applyFilterPreset}
          />

          {/* Enhanced Filters */}
          <EnhancedFilters
            activeCategory={filters.category}
            activeFilters={enhancedFilters}
            onFiltersChange={setEnhancedFilters}
            onClearAll={clearAllFilters}
            resultCount={posts.length}
          />

          {/* Category Filters */}
          <ExploreFilters
            activeCategory={filters.category}
            onCategoryChange={setCategory}
            showAllCategories={!isSearching}
          />

          {/* Search Results Info */}
          {isSearching && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {loading ? 'Searching...' : `${posts.length} results found`}
                  {searchParams.query && (
                    <span className="ml-1">for "{searchParams.query}"</span>
                  )}
                </div>
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          <ExploreGrid
            posts={posts}
            loading={loading}
            error={error}
            hasMore={hasMore}
            isEmpty={isEmpty}
            onLoadMore={loadMore}
            onRefresh={refetch}
          />
        </div>
      </div>
    </ExploreErrorBoundary>
  );
}
