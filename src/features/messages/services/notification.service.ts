export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPermissionResult {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermissionResult {
    return {
      granted: this.permission === 'granted',
      denied: this.permission === 'denied',
      default: this.permission === 'default',
    };
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermissionResult> {
    if (!this.isSupported) {
      return { granted: false, denied: true, default: false };
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { granted: false, denied: true, default: false };
    }
  }

  // Show a notification
  async showNotification(
    options: NotificationOptions,
  ): Promise<Notification | null> {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/message-icon.png',
        badge: options.badge || '/icons/badge-icon.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Auto-close notification after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show message notification
  async showMessageNotification(
    senderName: string,
    messageContent: string,
    conversationId: string,
    messageId: string,
    senderAvatar?: string,
  ): Promise<Notification | null> {
    const options: NotificationOptions = {
      title: senderName,
      body: messageContent,
      icon: senderAvatar || '/icons/message-icon.png',
      tag: `message-${conversationId}`, // Group notifications by conversation
      data: {
        type: 'message',
        conversationId,
        messageId,
        senderName,
        timestamp: new Date().toISOString(),
      },
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icons/reply-icon.png',
        },
        {
          action: 'mark-read',
          title: 'Mark as Read',
          icon: '/icons/check-icon.png',
        },
      ],
    };

    const notification = await this.showNotification(options);

    if (notification) {
      // Handle notification click - focus app and navigate to conversation
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to the conversation (you can customize this based on your routing)
        const url = `/messages?conversation=${conversationId}`;

        if (window.location.pathname !== '/messages') {
          window.location.href = url;
        } else {
          // If already on messages page, just switch conversation
          window.dispatchEvent(
            new CustomEvent('navigate-to-conversation', {
              detail: { conversationId },
            }),
          );
        }

        notification.close();
      };
    }

    return notification;
  }

  // Show typing notification (less intrusive)
  async showTypingNotification(
    senderName: string,
    conversationId: string,
  ): Promise<Notification | null> {
    const options: NotificationOptions = {
      title: `${senderName} is typing...`,
      body: '',
      icon: '/icons/typing-icon.png',
      tag: `typing-${conversationId}`,
      silent: true, // Don't make sound for typing
      requireInteraction: false,
      data: {
        type: 'typing',
        conversationId,
        senderName,
      },
    };

    const notification = await this.showNotification(options);

    // Auto-close typing notification quickly
    if (notification) {
      setTimeout(() => {
        notification.close();
      }, 2000);
    }

    return notification;
  }

  // Clear notifications by tag
  clearNotificationsByTag(tag: string): void {
    // Note: There's no direct way to clear notifications by tag in the browser API
    // This would typically be handled by a service worker
    console.log(`Clearing notifications with tag: ${tag}`);
  }

  // Clear all notifications for a conversation
  clearConversationNotifications(conversationId: string): void {
    this.clearNotificationsByTag(`message-${conversationId}`);
    this.clearNotificationsByTag(`typing-${conversationId}`);
  }

  // Check if page is in focus
  isPageInFocus(): boolean {
    return !document.hidden && document.hasFocus();
  }

  // Check if should show notification (only when page is not in focus)
  shouldShowNotification(conversationId?: string): boolean {
    if (!this.isSupported || this.permission !== 'granted') {
      return false;
    }

    // Don't show notifications if page is in focus
    if (this.isPageInFocus()) {
      return false;
    }

    return true;
  }

  // Register service worker for advanced notification features
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Handle notification events from service worker
  setupNotificationHandlers(): void {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'notification-click':
          this.handleNotificationClick(data);
          break;
        case 'notification-action':
          this.handleNotificationAction(data);
          break;
        default:
          console.log('Unknown service worker message:', event.data);
      }
    });
  }

  private handleNotificationClick(data: any): void {
    console.log('Notification clicked:', data);

    if (data.conversationId) {
      // Focus window and navigate to conversation
      window.focus();
      window.location.href = `/messages?conversation=${data.conversationId}`;
    }
  }

  private handleNotificationAction(data: any): void {
    console.log('Notification action:', data);

    const { action, conversationId, messageId } = data;

    switch (action) {
      case 'reply':
        // Open quick reply or navigate to conversation
        window.focus();
        window.location.href = `/messages?conversation=${conversationId}&reply=true`;
        break;

      case 'mark-read':
        // Mark message as read (would typically call an API)
        window.dispatchEvent(
          new CustomEvent('mark-message-read', {
            detail: { conversationId, messageId },
          }),
        );
        break;

      default:
        console.log('Unknown notification action:', action);
    }
  }
}

// Export singleton instance
export const notificationService = PushNotificationService.getInstance();
