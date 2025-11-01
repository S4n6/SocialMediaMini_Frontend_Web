import React from 'react';
import { IoClose } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Notification, NotificationFilter } from '../types/notification';
import { useNotifications } from '../hooks';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import { NotificationTabs } from './index';
import { InfiniteScrollList } from './InfiniteScrollList';
import { NotificationSearch } from './NotificationSearch';
import { NotificationQueryParams } from '../types/notification';

interface NotificationDrawerProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({
  isOpen,
  isCollapsed,
  onClose,
}: NotificationDrawerProps) {
  const [activeFilter, setActiveFilter] =
    React.useState<NotificationFilter>('all');
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFilters, setSearchFilters] =
    React.useState<NotificationQueryParams>({});
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Use notifications hook
  const {
    notifications,
    unreadCount,
    totalCount,
    currentPage,
    totalPages,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    markAsRead,
    markAllAsRead,
    loadMore,
    refetch,
    searchNotifications,
    filterNotifications,
  } = useNotifications();

  // Use navigation hook
  const { navigateToNotification } = useNotificationNavigation();

  // Handle click outside to close drawer (same as search)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore clicks that originate from the notification toggle
      const target = event.target as HTMLElement | null;
      if (target) {
        const toggleEl =
          target.closest && target.closest('[data-notification-toggle]');
        if (toggleEl) return;
      }

      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Event handlers
  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleNotificationRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleNotificationRead(notification.id);
    }

    // Navigate to the appropriate page
    navigateToNotification(notification);

    // Close drawer after navigation
    onClose();
  };

  // Handle search
  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        searchNotifications(query);
      } else {
        refetch();
      }
    },
    [searchNotifications, refetch],
  );

  // Handle filters
  const handleFilter = React.useCallback(
    (filters: NotificationQueryParams) => {
      setSearchFilters(filters);
      filterNotifications(filters);
    },
    [filterNotifications],
  );

  // Handle clear search and filters
  const handleClearSearch = React.useCallback(() => {
    setSearchQuery('');
    setSearchFilters({});
    setShowSearch(false);
    refetch();
  }, [refetch]); // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notification) => {
      switch (activeFilter) {
        case 'following':
          return [
            'post_mention',
            'comment_mention',
            'post_share',
            'message',
          ].includes(notification.type);
        case 'you':
          return ['follow', 'friend_request'].includes(notification.type);
        default:
          return true;
      }
    });
  }, [notifications, activeFilter]);

  // Calculate tab counts
  const tabCounts = React.useMemo(
    () => ({
      all: totalCount || notifications.length,
      following: notifications.filter((n) =>
        ['post_mention', 'comment_mention', 'post_share', 'message'].includes(
          n.type,
        ),
      ).length,
      you: notifications.filter((n) =>
        ['follow', 'friend_request'].includes(n.type),
      ).length,
    }),
    [notifications, totalCount],
  );

  return (
    <>
      {/* Notification Drawer - Same structure as SearchDrawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-screen z-20 border-r border-gray-200 w-96 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen
            ? 'translate-x-0 opacity-100 bg-[var(--color-background)]'
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
        style={{
          left: isCollapsed ? '80px' : '256px',
        }}
      >
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Thông báo</h2>
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {showSearch ? 'Hide Search' : 'Search'}
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0"
              >
                <IoClose className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Interface */}
          {showSearch && (
            <div className="mb-6">
              <NotificationSearch
                onSearch={handleSearch}
                onFilter={handleFilter}
                onClear={handleClearSearch}
                isLoading={isLoading}
                resultCount={filteredNotifications.length}
              />
              {(searchQuery || Object.keys(searchFilters).length > 0) && (
                <div className="mt-3 text-sm text-gray-500">
                  Showing {filteredNotifications.length} of {totalCount}{' '}
                  notifications
                  {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </div>
              )}
            </div>
          )}

          {/* Tabs - Only show when not searching */}
          {!showSearch && (
            <>
              <NotificationTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={tabCounts}
                className="mb-6"
              />
              <Separator className="mb-6" />
            </>
          )}

          {/* Notifications List with Infinite Scroll */}
          <div className="flex-1 min-h-0">
            <InfiniteScrollList
              notifications={filteredNotifications}
              hasMore={hasMore}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              error={error}
              onLoadMore={loadMore}
              onMarkAsRead={handleNotificationRead}
              onNotificationClick={handleNotificationClick}
              groupByDate={!showSearch} // Group by date when not searching
              className="h-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
