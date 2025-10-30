import { useEffect, useRef, useCallback } from 'react';
import {
  notificationService,
  NotificationPermissionResult,
} from '../services/notification.service';
import { useWebSocket } from './useWebSocket';
import { ApiMessage, ApiUser } from '../types/api.types';

export interface UseNotificationsOptions {
  enabled?: boolean;
  requestPermissionOnMount?: boolean;
  showTypingNotifications?: boolean;
  conversationId?: string;
}

export interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermissionResult;
  requestPermission: () => Promise<NotificationPermissionResult>;
  showMessageNotification: (
    message: ApiMessage,
    sender: ApiUser,
  ) => Promise<void>;
  clearConversationNotifications: (conversationId: string) => void;
}

export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsReturn {
  const {
    enabled = true,
    requestPermissionOnMount = false,
    showTypingNotifications = false,
    conversationId,
  } = options;

  const { isConnected } = useWebSocket({ autoConnect: false }); // Just get connection status
  const permissionRef = useRef<NotificationPermissionResult>(
    notificationService.getPermissionStatus(),
  );

  // Request permission on mount if requested
  useEffect(() => {
    if (enabled && requestPermissionOnMount) {
      const currentPermission = notificationService.getPermissionStatus();
      if (currentPermission.default) {
        notificationService.requestPermission().then((result) => {
          permissionRef.current = result;
        });
      }
    }
  }, [enabled, requestPermissionOnMount]);

  // Set up service worker and notification handlers
  useEffect(() => {
    if (enabled) {
      notificationService.registerServiceWorker();
      notificationService.setupNotificationHandlers();
    }
  }, [enabled]);

  // Handle page visibility changes to clear notifications when page becomes visible
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && conversationId) {
        // Clear notifications when user returns to the page
        notificationService.clearConversationNotifications(conversationId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, conversationId]);

  // Handle focus changes to clear notifications when user focuses on the app
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      if (conversationId) {
        notificationService.clearConversationNotifications(conversationId);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, conversationId]);

  // Handle custom events for navigation
  useEffect(() => {
    if (!enabled) return;

    const handleNavigateToConversation = (event: CustomEvent) => {
      const { conversationId: targetConversationId } = event.detail;
      if (targetConversationId) {
        notificationService.clearConversationNotifications(
          targetConversationId,
        );
      }
    };

    const handleMarkMessageRead = (event: CustomEvent) => {
      const { conversationId: targetConversationId } = event.detail;
      if (targetConversationId) {
        notificationService.clearConversationNotifications(
          targetConversationId,
        );
      }
    };

    window.addEventListener(
      'navigate-to-conversation',
      handleNavigateToConversation as EventListener,
    );
    window.addEventListener(
      'mark-message-read',
      handleMarkMessageRead as EventListener,
    );

    return () => {
      window.removeEventListener(
        'navigate-to-conversation',
        handleNavigateToConversation as EventListener,
      );
      window.removeEventListener(
        'mark-message-read',
        handleMarkMessageRead as EventListener,
      );
    };
  }, [enabled]);

  const requestPermission = async (): Promise<NotificationPermissionResult> => {
    const result = await notificationService.requestPermission();
    permissionRef.current = result;
    return result;
  };

  const showMessageNotification = async (
    message: ApiMessage,
    sender: ApiUser,
  ): Promise<void> => {
    if (!enabled || !isConnected) return;

    // Only show notification if page is not in focus
    if (!notificationService.shouldShowNotification(message.conversationId)) {
      return;
    }

    // Don't show notification for current user's messages
    if (message.senderId === sender.id) {
      return;
    }

    try {
      await notificationService.showMessageNotification(
        sender.fullName || sender.username,
        message.content,
        message.conversationId,
        message.id,
        sender.avatar,
      );
    } catch (error) {
      console.error('Error showing message notification:', error);
    }
  };

  const clearConversationNotifications = (
    targetConversationId: string,
  ): void => {
    if (enabled) {
      notificationService.clearConversationNotifications(targetConversationId);
    }
  };

  return {
    isSupported: notificationService.isNotificationSupported(),
    permission: permissionRef.current,
    requestPermission,
    showMessageNotification,
    clearConversationNotifications,
  };
}

// Specialized hook for WebSocket message notifications
export function useMessageNotifications(conversationId?: string) {
  const notifications = useNotifications({
    enabled: true,
    requestPermissionOnMount: false,
    conversationId,
  });

  // Return method to manually show notification when new message is received
  const showNotificationForMessage = useCallback(
    async (message: ApiMessage, sender: ApiUser) => {
      await notifications.showMessageNotification(message, sender);
    },
    [notifications],
  );

  return {
    ...notifications,
    showNotificationForMessage,
  };
}
