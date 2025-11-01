'use client';

import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Plus,
  X,
  Star,
  Clock,
  TrendingUp,
  Save,
  Trash2,
  Settings,
  Users,
  Heart,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  filterPersistenceService,
  FilterPreset,
} from '../services/filterPersistenceService';
import { ExploreCategory } from '../types/explore';

interface FilterPresetsProps {
  activeCategory: ExploreCategory;
  activeFilters: Record<string, string[]>;
  onPresetApply: (
    category: ExploreCategory,
    filters: Record<string, string[]>,
  ) => void;
  onSavePreset?: (name: string) => void;
}

export const FilterPresets: React.FC<FilterPresetsProps> = ({
  activeCategory,
  activeFilters,
  onPresetApply,
  onSavePreset,
}) => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showAllPresets, setShowAllPresets] = useState(false);

  useEffect(() => {
    setPresets(filterPersistenceService.loadPresets());
  }, []);

  const handlePresetClick = (preset: FilterPreset) => {
    filterPersistenceService.usePreset(preset.id);
    onPresetApply(preset.category, preset.filters);

    // Update usage count in local state
    setPresets((prev) =>
      prev.map((p) =>
        p.id === preset.id ? { ...p, usageCount: p.usageCount + 1 } : p,
      ),
    );
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    const newPreset = filterPersistenceService.savePreset(
      presetName.trim(),
      activeCategory,
      activeFilters,
    );

    setPresets((prev) => [...prev, newPreset]);
    setPresetName('');
    setShowSaveDialog(false);
    onSavePreset?.(presetName.trim());
  };

  const handleDeletePreset = (presetId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (filterPersistenceService.deletePreset(presetId)) {
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
    }
  };

  const getPresetIcon = (preset: FilterPreset) => {
    if (preset.filters.engagement?.includes('trending')) return TrendingUp;
    if (preset.filters.user?.includes('verified')) return Star;
    if (preset.filters.engagement?.includes('popular')) return Heart;
    if (preset.filters.engagement?.includes('recent')) return Clock;
    return Bookmark;
  };

  const getPresetDescription = (preset: FilterPreset): string => {
    const parts: string[] = [];

    if (preset.filters.mediaType?.length) {
      parts.push(preset.filters.mediaType.join(', '));
    }
    if (preset.filters.engagement?.length) {
      parts.push(preset.filters.engagement.join(', '));
    }
    if (preset.filters.timeframe?.length) {
      parts.push(preset.filters.timeframe.join(', '));
    }

    return parts.join(' • ') || 'Custom filter combination';
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (filters) => filters.length > 0,
  );
  const displayPresets = showAllPresets ? presets : presets.slice(0, 4);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark size={18} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Filter Presets
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="text-xs"
            >
              <Save size={14} className="mr-1" />
              Save
            </Button>
          )}

          {presets.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllPresets(!showAllPresets)}
              className="text-xs"
            >
              {showAllPresets ? 'Show Less' : `+${presets.length - 4} More`}
            </Button>
          )}
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap gap-2">
        {displayPresets.map((preset) => {
          const Icon = getPresetIcon(preset);
          const isPopular = preset.usageCount > 10;

          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className="group relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm"
              title={getPresetDescription(preset)}
            >
              <Icon
                size={14}
                className={preset.isDefault ? 'text-blue-500' : 'text-gray-500'}
              />
              <span className="text-gray-900 dark:text-white font-medium">
                {preset.name}
              </span>

              {isPopular && <Zap size={12} className="text-orange-500" />}

              {preset.usageCount > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {preset.usageCount}
                </span>
              )}

              {!preset.isDefault && (
                <button
                  onClick={(e) => handleDeletePreset(preset.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-opacity"
                  title="Delete preset"
                >
                  <Trash2 size={12} className="text-red-500" />
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* No presets message */}
      {presets.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Settings size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No saved presets yet</p>
          <p className="text-xs">Apply some filters and save them as presets</p>
        </div>
      )}

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Save Filter Preset
              </h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preset Name
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., My Favorite Videos"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
                autoFocus
              />
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current filters:
              </p>
              <div className="text-xs text-gray-800 dark:text-gray-200">
                {getPresetDescription({
                  filters: activeFilters,
                } as FilterPreset) || 'No filters applied'}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1"
              >
                <Save size={16} className="mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
