import type { Notification } from '../types/notification';

/**
 * Get formatted time ago string for notifications
 */
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const created = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày`;
  return `${Math.floor(diffInSeconds / 604800)} tuần`;
}

/**
 * Get notification message for display
 */
export function getNotificationMessage(notification: Notification): string {
  const username = notification.user.username;

  switch (notification.type) {
    case 'like':
      return `${username} đã thích bài viết của bạn.`;
    case 'comment':
      return `${username} đã bình luận: "${'commentText' in notification ? notification.commentText : ''}"`;
    case 'follow':
      return `${username} đã bắt đầu theo dõi bạn.`;
    case 'mention':
      return `${username} đã nhắc đến bạn trong một bài viết.`;
    case 'story_like':
      return `${username} đã thích story của bạn.`;
    case 'story_reply':
      return `${username} đã trả lời story của bạn.`;
    default:
      return `${username} đã tương tác với bạn.`;
  }
}

/**
 * Format notification count for display
 */
export function formatNotificationCount(count: number): string {
  if (count > 99) return '99+';
  return count.toString();
}

/**
 * Check if notification should show browser notification
 */
export function shouldShowBrowserNotification(
  notification: Notification,
): boolean {
  // Don't show if browser notifications are not supported
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  // Don't show if permission not granted
  if (Notification.permission !== 'granted') {
    return false;
  }

  // Don't show if already read
  if (notification.isRead) {
    return false;
  }

  // Show for all notification types by default
  return true;
}

/**
 * Get browser notification options
 */
export function getBrowserNotificationOptions(
  notification: Notification,
): NotificationOptions {
  return {
    body: getNotificationMessage(notification),
    icon: notification.user.avatar || '/icons/notification.png',
    badge: '/icons/notification-badge.png',
    tag: notification.id, // Prevent duplicate notifications
    requireInteraction: false,
    silent: false,
  };
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(
  notifications: Notification[],
): Record<string, Notification[]> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, Notification[]> = {
    'Hôm nay': [],
    'Hôm qua': [],
    'Tuần này': [],
    'Trước đó': [],
  };

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    const daysDiff = Math.floor(
      (today.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) {
      groups['Hôm nay'].push(notification);
    } else if (daysDiff === 1) {
      groups['Hôm qua'].push(notification);
    } else if (daysDiff <= 7) {
      groups['Tuần này'].push(notification);
    } else {
      groups['Trước đó'].push(notification);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * Filter notifications by type
 */
export function filterNotificationsByType(
  notifications: Notification[],
  types: Notification['type'][],
): Notification[] {
  return notifications.filter((notification) =>
    types.includes(notification.type),
  );
}

/**
 * Get notification priority (for sorting)
 */
export function getNotificationPriority(notification: Notification): number {
  const priorities = {
    follow: 1,
    mention: 2,
    comment: 3,
    like: 4,
    story_reply: 5,
    story_like: 6,
  };

  return priorities[notification.type] || 99;
}

/**
 * Sort notifications by priority and time
 */
export function sortNotifications(
  notifications: Notification[],
): Notification[] {
  return notifications.sort((a, b) => {
    // First sort by read status (unread first)
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }

    // Then sort by priority
    const priorityDiff =
      getNotificationPriority(a) - getNotificationPriority(b);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Finally sort by time (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
