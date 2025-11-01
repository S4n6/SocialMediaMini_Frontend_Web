import api from '@/lib/axios';
import {
  Notification,
  NotificationListResponse,
  NotificationStats,
  NotificationQueryParams,
  BulkNotificationAction,
  ApiResponse,
  NotificationType,
} from '../types/notification';

interface FetchNotificationsParams extends NotificationQueryParams {
  // Extends backend query params
}

interface MarkAsReadParams {
  notificationId: string;
}

interface MarkAllAsReadParams {
  type?: NotificationType;
}

class NotificationService {
  private baseUrl = '/notifications';

  /**
   * Fetch notifications from API
   */
  async fetchNotifications(
    params: FetchNotificationsParams = {},
  ): Promise<NotificationListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        isRead,
        type,
        sortBy = 'newest',
        dateFrom,
        dateTo,
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });

      // Add optional parameters
      if (isRead !== undefined) queryParams.append('isRead', isRead.toString());
      if (type) queryParams.append('type', type);
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await api.get<ApiResponse<NotificationListResponse>>(
        `${this.baseUrl}?${queryParams}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch notifications',
        );
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(params: MarkAsReadParams): Promise<void> {
    try {
      const response = await api.patch(
        `${this.baseUrl}/${params.notificationId}/read`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to mark notification as read',
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(params: MarkAllAsReadParams = {}): Promise<void> {
    try {
      const { type } = params;

      const requestBody: any = {};
      if (type) requestBody.type = type;

      const response = await api.patch(
        `${this.baseUrl}/mark-all-read`,
        requestBody,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to mark all notifications as read',
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get(`${this.baseUrl}/unread-count`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch unread count',
        );
      }

      return response.data.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/${notificationId}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to delete notification',
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.get<ApiResponse<NotificationStats>>(
        `${this.baseUrl}/stats`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch notification stats',
        );
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Bulk actions on notifications
   */
  async bulkAction(action: BulkNotificationAction): Promise<void> {
    try {
      let endpoint = '';
      switch (action.action) {
        case 'mark_read':
          endpoint = `${this.baseUrl}/bulk/mark-read`;
          break;
        case 'mark_unread':
          endpoint = `${this.baseUrl}/bulk/mark-unread`;
          break;
        case 'delete':
          endpoint = `${this.baseUrl}/bulk/delete`;
          break;
      }

      const response = await api.post(endpoint, {
        notificationIds: action.notificationIds,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || `Failed to ${action.action} notifications`,
        );
      }
    } catch (error) {
      console.error(`Error performing bulk ${action.action}:`, error);
      throw error;
    }
  }

  /**
   * Search notifications
   */
  async searchNotifications(
    query: string,
    params: FetchNotificationsParams = {},
  ): Promise<NotificationListResponse> {
    try {
      const { page = 1, limit = 20, sortBy = 'newest' } = params;

      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });

      const response = await api.get<ApiResponse<NotificationListResponse>>(
        `${this.baseUrl}/search?${queryParams}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to search notifications',
        );
      }

      return response.data.data;
    } catch (error) {
      console.error('Error searching notifications:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    followNotifications?: boolean;
    likeNotifications?: boolean;
    commentNotifications?: boolean;
    mentionNotifications?: boolean;
  }): Promise<void> {
    try {
      const response = await api.patch(
        `${this.baseUrl}/preferences`,
        preferences,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to update notification preferences',
        );
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
