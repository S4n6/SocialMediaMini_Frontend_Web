'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, UserPlus, AtSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkRead,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'post_mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'comment_mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <Eye className="w-5 h-5 text-gray-500" />;
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'birthday':
        return <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />;
      case 'post_share':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = () => {
    const username = notification.user?.username || 'Someone';

    switch (notification.type) {
      case 'follow':
        return `${username} đã bắt đầu theo dõi bạn.`;
      case 'message':
        return `${username} đã gửi tin nhắn cho bạn.`;
      case 'post_mention':
        return `${username} đã nhắc đến bạn trong một bài viết.`;
      case 'comment_mention':
        return `${username} đã nhắc đến bạn trong một bình luận.`;
      case 'system':
        return notification.content || 'Thông báo hệ thống.';
      case 'friend_request':
        return `${username} đã gửi lời mời kết bạn.`;
      case 'birthday':
        return `Hôm nay là sinh nhật của ${username}!`;
      case 'post_share':
        return `${username} đã chia sẻ bài viết của bạn.`;
      default:
        return `${username} đã tương tác với bạn.`;
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - created.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày`;
    return `${Math.floor(diffInSeconds / 604800)} tuần`;
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    onClick();
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors ${
        !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : ''
      }`}
      onClick={handleClick}
    >
      {/* User Avatar */}
      <div className="w-11 h-11 relative">
        {notification.user?.avatar ? (
          <Image
            src={notification.user.avatar}
            alt={notification.user.name || notification.user.username || 'User'}
            className="rounded-full object-cover"
            fill
            sizes="44px"
          />
        ) : (
          <div className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-200">
            <span className="text-sm font-medium text-gray-600">
              {notification.user?.name?.charAt(0) ||
                notification.user?.username?.charAt(0) ||
                'U'}
            </span>
          </div>
        )}

        {/* Notification Icon Badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
          {getNotificationIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between">
          <p
            className={`text-sm leading-relaxed ${!notification.isRead ? 'font-medium' : ''}`}
          >
            <span className="font-semibold">
              {notification.user?.username || 'Someone'}
            </span>
            {notification.user?.isVerified && (
              <span className="inline-block w-4 h-4 ml-1 text-blue-500">✓</span>
            )}
            <span className="ml-1">
              {getNotificationText()
                .replace(notification.user?.username || 'Someone', '')
                .trim()}
            </span>
          </p>

          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
          )}
        </div>

        <p className="text-xs text-gray-500">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Related Media (for media-related notifications) */}
      {(notification.type === 'post_mention' ||
        notification.type === 'comment_mention' ||
        notification.type === 'post_share') &&
        notification.postImage && (
          <div className="w-11 h-11 relative flex-shrink-0">
            <Image
              src={notification.postImage}
              alt="Related content"
              className="rounded-lg object-cover"
              fill
              sizes="44px"
            />
          </div>
        )}

      {/* Action Button (for follow notifications) */}
      {notification.type === 'follow' && (
        <div className="flex flex-col gap-1">
          <Button
            variant="default"
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 h-8 text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              // Handle follow back action
              console.log('Follow back:', notification.user?.username);
              // TODO: Implement follow back API call
            }}
          >
            Theo dõi lại
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-4 py-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete notification
              console.log('Delete notification:', notification.id);
              // TODO: Implement delete notification
            }}
          >
            Xóa
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
