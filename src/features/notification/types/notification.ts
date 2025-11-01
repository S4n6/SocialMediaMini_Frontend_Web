export interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

// Match with backend NotificationType enum
export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'message'
  | 'post_mention'
  | 'comment_mention'
  | 'system'
  | 'friend_request'
  | 'birthday'
  | 'post_share';

// Match with backend NotificationEntityType enum
export type NotificationEntityType = 'post' | 'user' | 'comment' | 'message';

// Match with backend NotificationResponseDto
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  userId: string;
  isRead: boolean;
  entityId?: string;
  entityType?: NotificationEntityType;
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
  // Frontend specific fields (populated from metadata or API)
  user?: UserInfo;
  postImage?: string;
}
export type NotificationFilter = 'all' | 'following' | 'you';

// Match with backend NotificationListResponseDto
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Match with backend NotificationStatsResponseDto
export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  typeBreakdown: Record<NotificationType, number>;
  priorityBreakdown: Record<'high' | 'medium' | 'low', number>;
}

// API Query parameters to match backend
export interface NotificationQueryParams {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest';
  dateFrom?: string;
  dateTo?: string;
}

// Bulk action request
export interface BulkNotificationAction {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'delete';
}

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode?: number;
}
