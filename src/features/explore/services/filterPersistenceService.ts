import { ExploreCategory } from '../types/explore';

export interface FilterPreferences {
  category: ExploreCategory;
  filters: Record<string, string[]>;
  searchQuery?: string;
  lastUsed: Date;
}

export interface FilterPreset {
  id: string;
  name: string;
  category: ExploreCategory;
  filters: Record<string, string[]>;
  isDefault?: boolean;
  createdAt: Date;
  usageCount: number;
}

class FilterPersistenceService {
  private readonly STORAGE_KEY = 'explore_filter_preferences';
  private readonly PRESETS_KEY = 'explore_filter_presets';
  private readonly MAX_RECENT_FILTERS = 10;

  // Built-in presets
  private readonly builtInPresets: FilterPreset[] = [
    {
      id: 'trending-videos',
      name: '🔥 Trending Videos',
      category: 'all',
      filters: {
        mediaType: ['video'],
        engagement: ['trending'],
        timeframe: ['week'],
      },
      isDefault: true,
      createdAt: new Date('2024-01-01'),
      usageCount: 0,
    },
    {
      id: 'popular-photos',
      name: '📸 Popular Photos',
      category: 'posts',
      filters: {
        mediaType: ['image'],
        engagement: ['popular'],
        timeframe: ['month'],
      },
      isDefault: true,
      createdAt: new Date('2024-01-01'),
      usageCount: 0,
    },
    {
      id: 'recent-content',
      name: '⏰ Fresh Content',
      category: 'all',
      filters: {
        engagement: ['recent'],
        timeframe: ['today', 'week'],
      },
      isDefault: true,
      createdAt: new Date('2024-01-01'),
      usageCount: 0,
    },
    {
      id: 'verified-users',
      name: '✓ Verified Creators',
      category: 'all',
      filters: {
        user: ['verified'],
        engagement: ['popular'],
      },
      isDefault: true,
      createdAt: new Date('2024-01-01'),
      usageCount: 0,
    },
  ];

  // Save current filter preferences
  savePreferences(
    category: ExploreCategory,
    filters: Record<string, string[]>,
    searchQuery?: string,
  ): void {
    const preferences: FilterPreferences = {
      category,
      filters,
      searchQuery,
      lastUsed: new Date(),
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save filter preferences:', error);
      }
    }
  }

  // Load saved filter preferences
  loadPreferences(): FilterPreferences | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        return {
          ...preferences,
          lastUsed: new Date(preferences.lastUsed),
        };
      }
    } catch (error) {
      console.warn('Failed to load filter preferences:', error);
    }

    return null;
  }

  // Save a filter combination as a preset
  savePreset(
    name: string,
    category: ExploreCategory,
    filters: Record<string, string[]>,
  ): FilterPreset {
    const preset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      category,
      filters,
      createdAt: new Date(),
      usageCount: 1,
    };

    const presets = this.loadPresets();
    const updatedPresets = [...presets, preset];

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.PRESETS_KEY, JSON.stringify(updatedPresets));
      } catch (error) {
        console.warn('Failed to save preset:', error);
      }
    }

    return preset;
  }

  // Load all filter presets (built-in + custom)
  loadPresets(): FilterPreset[] {
    let customPresets: FilterPreset[] = [];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.PRESETS_KEY);
        if (stored) {
          customPresets = JSON.parse(stored).map((preset: any) => ({
            ...preset,
            createdAt: new Date(preset.createdAt),
          }));
        }
      } catch (error) {
        console.warn('Failed to load custom presets:', error);
      }
    }

    return [...this.builtInPresets, ...customPresets].sort((a, b) => {
      // Sort by usage count, then by creation date
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // Use a preset (increment usage count)
  usePreset(presetId: string): FilterPreset | null {
    const presets = this.loadPresets();
    const preset = presets.find((p) => p.id === presetId);

    if (!preset) return null;

    // Increment usage count for custom presets
    if (!preset.isDefault) {
      const customPresets = this.loadCustomPresets();
      const updatedPresets = customPresets.map((p) =>
        p.id === presetId ? { ...p, usageCount: p.usageCount + 1 } : p,
      );

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            this.PRESETS_KEY,
            JSON.stringify(updatedPresets),
          );
        } catch (error) {
          console.warn('Failed to update preset usage:', error);
        }
      }
    }

    return { ...preset, usageCount: preset.usageCount + 1 };
  }

  // Delete a custom preset
  deletePreset(presetId: string): boolean {
    const customPresets = this.loadCustomPresets();
    const filteredPresets = customPresets.filter((p) => p.id !== presetId);

    if (filteredPresets.length === customPresets.length) {
      return false; // Preset not found or is built-in
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.PRESETS_KEY, JSON.stringify(filteredPresets));
        return true;
      } catch (error) {
        console.warn('Failed to delete preset:', error);
        return false;
      }
    }

    return false;
  }

  // Get popular filter combinations
  getPopularCombinations(): Array<{
    filters: Record<string, string[]>;
    count: number;
  }> {
    // This would analyze usage patterns - for now return mock data
    return [
      {
        filters: { mediaType: ['video'], engagement: ['trending'] },
        count: 1250,
      },
      {
        filters: { mediaType: ['image'], engagement: ['popular'] },
        count: 980,
      },
      {
        filters: { user: ['verified'], timeframe: ['week'] },
        count: 756,
      },
    ];
  }

  // Get recently used filters
  getRecentFilters(): FilterPreferences[] {
    // In a real app, this would track filter history
    // For now, return recent from localStorage if available
    const current = this.loadPreferences();
    return current ? [current] : [];
  }

  // Clear all saved data
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.PRESETS_KEY);
    }
  }

  // Smart filter suggestions based on usage patterns
  getSuggestedFilters(
    currentCategory: ExploreCategory,
    currentFilters: Record<string, string[]>,
  ): string[] {
    const suggestions: string[] = [];

    // If user selected videos, suggest trending
    if (
      currentFilters.mediaType?.includes('video') &&
      !currentFilters.engagement?.includes('trending')
    ) {
      suggestions.push('Add "Trending" filter - popular with videos');
    }

    // If user selected trending, suggest recent timeframe
    if (
      currentFilters.engagement?.includes('trending') &&
      !currentFilters.timeframe?.length
    ) {
      suggestions.push('Try "This Week" timeframe for best trending content');
    }

    // If user selected popular, suggest verified users
    if (
      currentFilters.engagement?.includes('popular') &&
      !currentFilters.user?.includes('verified')
    ) {
      suggestions.push(
        'Include "Verified Users" for high-quality popular content',
      );
    }

    return suggestions;
  }

  private loadCustomPresets(): FilterPreset[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.PRESETS_KEY);
      if (stored) {
        return JSON.parse(stored).map((preset: any) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
        }));
      }
    } catch (error) {
      console.warn('Failed to load custom presets:', error);
    }

    return [];
  }
}

export const filterPersistenceService = new FilterPersistenceService();
