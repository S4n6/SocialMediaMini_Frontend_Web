import { useEffect, useCallback } from 'react';
import { getSocketManager } from '@/lib/socket';
import { Notification } from '../types/notification';

interface UseNotificationSocketProps {
  onNewNotification: (notification: Notification) => void;
  onNotificationUpdated: (notification: Notification) => void;
  userId?: string;
}

export function useNotificationSocket({
  onNewNotification,
  onNotificationUpdated,
  userId,
}: UseNotificationSocketProps) {
  const socketManager = getSocketManager();

  // Handle new notification from socket
  const handleNewNotification = useCallback(
    (socketNotification: any) => {
      // Transform socket notification to our Notification type
      const notification: Notification = {
        id: socketNotification.id,
        type: socketNotification.type,
        userId: socketNotification.userId,
        targetUserId: socketNotification.targetUserId,
        createdAt: socketNotification.createdAt,
        isRead: socketNotification.isRead || false,
        user: socketNotification.user || {
          id: socketNotification.userId,
          username: socketNotification.username || 'Unknown',
          name: socketNotification.name || 'Unknown User',
          avatar: socketNotification.avatar,
        },
        // Type-specific properties
        ...(socketNotification.type === 'like' && {
          postId: socketNotification.entityId,
          postImage: socketNotification.data?.postImage,
        }),
        ...(socketNotification.type === 'comment' && {
          postId: socketNotification.entityId,
          postImage: socketNotification.data?.postImage,
          commentText:
            socketNotification.data?.commentText || socketNotification.message,
        }),
        ...(socketNotification.type === 'follow' && {
          isFollowingBack: socketNotification.data?.isFollowingBack,
        }),
        ...(socketNotification.type === 'mention' && {
          postId: socketNotification.entityId,
          postImage: socketNotification.data?.postImage,
          content: socketNotification.message,
        }),
        ...(socketNotification.type.startsWith('story_') && {
          storyId: socketNotification.entityId,
          content: socketNotification.message,
        }),
      };

      onNewNotification(notification);
    },
    [onNewNotification],
  );

  // Handle notification updated from socket
  const handleNotificationUpdated = useCallback(
    (socketNotification: any) => {
      // Transform and call the handler
      const notification: Notification = {
        id: socketNotification.id,
        type: socketNotification.type,
        userId: socketNotification.userId,
        targetUserId: socketNotification.targetUserId,
        createdAt: socketNotification.createdAt,
        isRead: socketNotification.isRead,
        user: socketNotification.user,
        // Add type-specific properties as needed
      } as Notification;

      onNotificationUpdated(notification);
    },
    [onNotificationUpdated],
  );

  // Set up socket listeners
  useEffect(() => {
    if (!userId || !socketManager) return;

    const notificationService = socketManager.notifications;

    // Subscribe to notification events
    notificationService.onNewNotification(handleNewNotification);
    notificationService.onNotificationUpdated(handleNotificationUpdated);

    // Join user room for real-time notifications
    socketManager.emit('user:join', { userId });

    // Cleanup on unmount
    return () => {
      notificationService.offNewNotification(handleNewNotification);
      notificationService.offNotificationUpdated(handleNotificationUpdated);
      socketManager.emit('user:leave', { userId });
    };
  }, [userId, handleNewNotification, handleNotificationUpdated]);

  // Methods to emit socket events
  const markAsReadSocket = useCallback((notificationId: string) => {
    if (!socketManager) return;
    const notificationService = socketManager.notifications;
    notificationService.markNotificationAsRead(notificationId);
  }, []);

  const clearAllNotificationsSocket = useCallback(() => {
    if (!socketManager) return;
    const notificationService = socketManager.notifications;
    notificationService.clearAllNotifications();
  }, []);

  return {
    markAsReadSocket,
    clearAllNotificationsSocket,
  };
}
