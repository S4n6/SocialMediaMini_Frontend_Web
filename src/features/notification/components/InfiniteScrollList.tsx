'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Notification } from '../types/notification';
import { NotificationItem } from './NotificationItem';

interface InfiniteScrollListProps {
  notifications: Notification[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onNotificationClick: (notification: Notification) => void;
  groupByDate?: boolean;
  className?: string;
}

interface NotificationGroup {
  title: string;
  notifications: Notification[];
}

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  notifications,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  onMarkAsRead,
  onNotificationClick,
  groupByDate = true,
  className = '',
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Group notifications by date
  const groupNotificationsByDate = useCallback(
    (notifications: Notification[]): NotificationGroup[] => {
      if (!groupByDate) {
        return [
          {
            title: 'All Notifications',
            notifications,
          },
        ];
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);

      const groups: { [key: string]: Notification[] } = {
        Today: [],
        Yesterday: [],
        'This Week': [],
        Earlier: [],
      };

      notifications.forEach((notification) => {
        const notificationDate = new Date(notification.createdAt);
        notificationDate.setHours(0, 0, 0, 0);

        if (notificationDate.getTime() === today.getTime()) {
          groups['Today'].push(notification);
        } else if (notificationDate.getTime() === yesterday.getTime()) {
          groups['Yesterday'].push(notification);
        } else if (notificationDate >= thisWeek) {
          groups['This Week'].push(notification);
        } else {
          groups['Earlier'].push(notification);
        }
      });

      // Convert to array and remove empty groups
      return Object.keys(groups)
        .map((title) => ({
          title,
          notifications: groups[title],
        }))
        .filter((group) => group.notifications.length > 0);
    },
    [groupByDate],
  );

  const notificationGroups = groupNotificationsByDate(notifications);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Load more when 100px from bottom
      },
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Show loading state for initial load
  if (isLoading && notifications.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && notifications.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Failed to load notifications
            </p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!isLoading && notifications.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">🔔</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              No notifications yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              When someone likes, comments, or follows you, you'll see it here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {notificationGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          {/* Group Header */}
          {groupByDate && (
            <div className="sticky top-0 bg-white/80 backdrop-blur-sm px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                {group.title}
              </h3>
            </div>
          )}

          {/* Notification Items */}
          <div className="space-y-0">
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
                onMarkRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Error message for load more */}
      {error && notifications.length > 0 && (
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-red-500">
            Failed to load more notifications
          </p>
          <button
            onClick={onLoadMore}
            className="text-sm text-blue-500 hover:text-blue-600 mt-1"
          >
            Try again
          </button>
        </div>
      )}

      {/* Load More Trigger & Loading Indicator */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-4"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading more...</span>
            </div>
          ) : (
            <div className="w-4 h-4" /> // Invisible trigger element
          )}
        </div>
      )}

      {/* End of List Indicator */}
      {!hasMore && notifications.length > 0 && (
        <div className="text-center py-4 px-4">
          <p className="text-xs text-gray-400">
            You've reached the end of your notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollList;
