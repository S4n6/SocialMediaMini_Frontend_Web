'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';

interface StatsData {
  totalPosts: number;
  todayPosts: number;
  weekPosts: number;
  trendingHashtags: string[];
}

export const ExploreStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0,
    todayPosts: 0,
    weekPosts: 0,
    trendingHashtags: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for stats
    const mockStats: StatsData = {
      totalPosts: 45672,
      todayPosts: 234,
      weekPosts: 1543,
      trendingHashtags: ['#photography', '#travel', '#food', '#art', '#nature'],
    };

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="mb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Posts */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart size={18} />
            </div>
            <TrendingUp size={16} className="opacity-70" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatNumber(stats.totalPosts)}
          </div>
          <div className="text-sm opacity-90">Total Posts</div>
        </div>

        {/* Today's Posts */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={18} />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatNumber(stats.todayPosts)}
          </div>
          <div className="text-sm opacity-90">Today</div>
        </div>

        {/* This Week */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageCircle size={18} />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatNumber(stats.weekPosts)}
          </div>
          <div className="text-sm opacity-90">This Week</div>
        </div>

        {/* Trending */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={18} />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Hot
            </span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {stats.trendingHashtags.length}
          </div>
          <div className="text-sm opacity-90">Trending</div>
        </div>
      </div>

      {/* Trending Hashtags */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-orange-500" />
          <span className="font-medium text-gray-900 dark:text-white">
            Trending Hashtags
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.trendingHashtags.map((hashtag, index) => (
            <button
              key={index}
              className="
                px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                text-gray-700 dark:text-gray-300 
                rounded-full text-sm font-medium
                hover:bg-gray-200 dark:hover:bg-gray-600
                transition-colors duration-200
              "
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
