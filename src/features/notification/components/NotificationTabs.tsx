import React from 'react';
import { NotificationFilter } from '../types/notification';

interface NotificationTabsProps {
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  counts: {
    all: number;
    following: number;
    you: number;
  };
  className?: string;
}

function NotificationTabs({
  activeFilter,
  onFilterChange,
  counts,
  className = '',
}: NotificationTabsProps) {
  const tabs = [
    { key: 'all' as const, label: 'Tất cả', count: counts.all },
    { key: 'following' as const, label: 'Theo dõi', count: counts.following },
    { key: 'you' as const, label: 'Bạn', count: counts.you },
  ];

  return (
    <div className={`flex gap-6 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`
            flex items-center gap-2 px-1 py-2 text-sm font-medium
            transition-colors duration-200 border-b-2
            ${
              activeFilter === tab.key
                ? 'text-gray-900 dark:text-white border-gray-900 dark:border-white'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          <span>{tab.label}</span>
          {tab.count > 0 && (
            <span
              className={`
              text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center
              ${
                activeFilter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default NotificationTabs;
