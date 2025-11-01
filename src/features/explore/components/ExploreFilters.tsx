'use client';

import React from 'react';
import { ExploreCategory } from '../types/explore';
import { Grid3X3, Play, ShoppingBag, Video, Tag, Grid } from 'lucide-react';

interface ExploreFiltersProps {
  activeCategory: ExploreCategory;
  onCategoryChange: (category: ExploreCategory) => void;
  showAllCategories?: boolean;
}

export const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  activeCategory,
  onCategoryChange,
  showAllCategories = true,
}) => {
  const categories = [
    {
      key: 'all' as const,
      label: 'All',
      icon: Grid,
      description: 'All posts',
    },
    {
      key: 'posts' as const,
      label: 'Posts',
      icon: Grid3X3,
      description: 'Photo posts',
    },
    {
      key: 'reels' as const,
      label: 'Reels',
      icon: Play,
      description: 'Short videos',
    },
    {
      key: 'shopping' as const,
      label: 'Shopping',
      icon: ShoppingBag,
      description: 'Products',
    },
    {
      key: 'igtv' as const,
      label: 'IGTV',
      icon: Video,
      description: 'Long videos',
    },
    {
      key: 'tagged' as const,
      label: 'Tagged',
      icon: Tag,
      description: 'Tagged posts',
    },
  ];

  const displayCategories = showAllCategories
    ? categories
    : categories.filter((cat) => ['all', 'posts', 'reels'].includes(cat.key));

  return (
    <div className="mb-8">
      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-fit mx-auto">
          {displayCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;

            return (
              <button
                key={category.key}
                onClick={() => onCategoryChange(category.key)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg
                  text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                title={category.description}
              >
                <Icon size={18} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 -mx-4">
          {displayCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;

            return (
              <button
                key={category.key}
                onClick={() => onCategoryChange(category.key)}
                className={`
                  flex flex-col items-center gap-1 px-4 py-3 rounded-xl
                  text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-[70px]
                  ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={20} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Description */}
      {showAllCategories && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categories.find((cat) => cat.key === activeCategory)?.description}
          </p>
        </div>
      )}
    </div>
  );
};
