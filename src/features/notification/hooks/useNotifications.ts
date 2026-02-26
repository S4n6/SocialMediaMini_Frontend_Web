import React from 'react';
import type {
  Notification,
  NotificationListResponse,
  NotificationQueryParams,
  NotificationStats,
} from '../types/notification';
import { notificationService } from '../services/notification.service';
import { useNotificationSocket } from './useNotificationSocket';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  loadMore: () => void;
  refetch: () => void;
  searchNotifications: (query: string) => void;
  filterNotifications: (params: NotificationQueryParams) => void;
  toggleApiMode: () => void;
  isUsingRealApi: boolean;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [useRealApi, setUseRealApi] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<NotificationQueryParams>({});

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Mock data - will be replaced with real API calls
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      title: 'New like on your post',
      content: 'John Doe liked your post',
      userId: '1',
      entityId: 'post1',
      entityType: 'post',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      isRead: false,
      priority: 'medium',
      user: {
        id: '2',
        username: 'john_doe',
        name: 'John Doe',
        avatar: '/images/placeholder-avatar.jpg',
      },
      postImage: '/images/placeholder-post.jpg',
    },
    {
      id: '2',
      type: 'comment',
      title: 'New comment on your post',
      content: 'Jane Smith commented: "Amazing photo! 🔥"',
      userId: '1',
      entityId: 'post2',
      entityType: 'post',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      priority: 'high',
      user: {
        id: '3',
        username: 'jane_smith',
        name: 'Jane Smith',
        avatar: '/images/placeholder-avatar2.jpg',
        isVerified: true,
      },
      postImage: '/images/placeholder-post2.jpg',
    },
    {
      id: '3',
      type: 'follow',
      title: 'New follower',
      content: 'Mike Wilson is now following you',
      userId: '1',
      entityId: '4',
      entityType: 'user',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isRead: true,
      priority: 'low',
      user: {
        id: '4',
        username: 'photographer_mike',
        name: 'Mike Wilson',
        avatar: '/images/placeholder-avatar3.jpg',
      },
    },
  ];

  const fetchNotifications = React.useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        if (useRealApi) {
          // Use real API with pagination
          const params = {
            page,
            limit: 20,
            ...filters,
          };

          const response = await notificationService.fetchNotifications(params);

          if (append) {
            setNotifications((prev) => [...prev, ...response.notifications]);
          } else {
            setNotifications(response.notifications);
          }

          setUnreadCount(response.unreadCount);
          setTotalCount(response.total);
          setCurrentPage(response.page);
          setTotalPages(response.totalPages);
        } else {
          // Use mock data for development
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (append) {
            // Simulate loading more with duplicated data
            setNotifications((prev) => [...prev, ...mockNotifications]);
          } else {
            setNotifications(mockNotifications);
          }

          setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
          setTotalCount(mockNotifications.length);
          setCurrentPage(page);
          setTotalPages(2); // Mock 2 pages
        }
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error('Error fetching notifications:', err);

        // Fallback to mock data on API error
        if (!append) {
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
          setTotalCount(mockNotifications.length);
          setCurrentPage(1);
          setTotalPages(1);
        }
      } finally {
        if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [useRealApi, filters],
  );

  const markAsRead = React.useCallback(
    async (notificationId: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        if (useRealApi) {
          await notificationService.markAsRead({ notificationId });
        }
        console.log('Notification marked as read:', notificationId);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: false }
              : notification,
          ),
        );
        setUnreadCount((prev) => prev + 1);
      }
    },
    [useRealApi],
  );

  const markAllAsRead = React.useCallback(async () => {
    // Store original notifications for rollback
    const originalNotifications = notifications;
    const originalUnreadCount = unreadCount;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);

    try {
      if (useRealApi) {
        await notificationService.markAllAsRead();
      }
      console.log('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Revert optimistic update on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  }, [useRealApi, notifications, unreadCount]);

  // Socket event handlers
  const handleNewNotification = React.useCallback(
    (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`New ${notification.type}`, {
          body: `${notification.user?.username || 'Someone'} ${getNotificationMessage(notification)}`,
          icon: notification.user?.avatar || '/icons/notification.png',
        });
      }
    },
    [],
  );

  const handleNotificationUpdated = React.useCallback(
    (updatedNotification: Notification) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification,
        ),
      );
    },
    [],
  );

  // Use socket integration
  const { markAsReadSocket, clearAllNotificationsSocket } =
    useNotificationSocket({
      onNewNotification: handleNewNotification,
      onNotificationUpdated: handleNotificationUpdated,
      userId: currentUser?.id,
    });

  // Request notification permission
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const loadMore = React.useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, fetchNotifications]);

  const refetch = React.useCallback(() => {
    setCurrentPage(1);
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const searchNotifications = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      // In real implementation, this would call API with search params
      fetchNotifications(1, false);
    },
    [fetchNotifications],
  );

  const filterNotifications = React.useCallback(
    (newFilters: NotificationQueryParams) => {
      setFilters(newFilters);
      setCurrentPage(1);
      fetchNotifications(1, false);
    },
    [fetchNotifications],
  );

  const toggleApiMode = React.useCallback(() => {
    setUseRealApi((prev) => !prev);
    setCurrentPage(1);
    setNotifications([]);
  }, []);

  // Initial fetch
  React.useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Helper function to get notification message
  const getNotificationMessage = (notification: Notification): string => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'post_mention':
        return 'mentioned you in a post';
      case 'comment_mention':
        return 'mentioned you in a comment';
      default:
        return 'interacted with you';
    }
  };

  return {
    notifications,
    unreadCount,
    totalCount,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,
    isLoading,
    isLoadingMore,
    error,
    markAsRead,
    markAllAsRead,
    loadMore,
    refetch,
    searchNotifications,
    filterNotifications,
    toggleApiMode,
    isUsingRealApi: useRealApi,
  };
}
