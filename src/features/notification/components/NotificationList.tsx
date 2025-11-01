'use client';

import React from 'react';
import { Notification } from '../types/notification';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onNotificationRead: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  onNotificationClick,
  onNotificationRead,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 animate-pulse"
          >
            <div className="w-11 h-11 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="w-11 h-11 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h4a1 1 0 011 1v12z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Chưa có thông báo
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Khi có hoạt động trên tài khoản của bạn, thông báo sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => onNotificationClick(notification)}
          onMarkRead={onNotificationRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;
