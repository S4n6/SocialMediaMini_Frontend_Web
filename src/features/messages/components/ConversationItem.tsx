'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Conversation } from '../types';
import { OnlineStatus } from './OnlineStatus';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onClick,
}: ConversationItemProps) {
  // Get the other participant (for 1-on-1 conversations)
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId,
  );

  // Determine display name and avatar
  const displayName = conversation.isGroup
    ? conversation.groupName || 'Group Chat'
    : otherParticipant?.fullName || 'Unknown User';

  const displayAvatar = conversation.isGroup
    ? conversation.groupAvatar
    : otherParticipant?.avatar;

  const displayUsername = conversation.isGroup
    ? ''
    : otherParticipant?.username || '';

  // Format last message preview
  const getMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';

    const { content, senderId, messageType } = conversation.lastMessage;
    const isFromCurrentUser = senderId === currentUserId;
    const prefix = isFromCurrentUser ? 'You: ' : '';

    switch (messageType) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'video':
        return `${prefix}🎥 Video`;
      case 'audio':
        return `${prefix}🎵 Audio`;
      case 'file':
        return `${prefix}📁 File`;
      default:
        return `${prefix}${content}`;
    }
  };

  // Format time
  const getTimeAgo = () => {
    if (!conversation.lastMessage) return '';

    try {
      const now = new Date();
      const messageDate = new Date(conversation.lastMessage.createdAt);
      const diffInMinutes = Math.floor(
        (now.getTime() - messageDate.getTime()) / 60000,
      );

      if (diffInMinutes < 1) return 'now';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d`;

      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks}w`;
    } catch {
      return 'now';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const messagePreview = getMessagePreview();
  const timeAgo = getTimeAgo();
  const hasUnread = conversation.unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center space-x-3 p-4 hover:bg-secondary/50 cursor-pointer transition-colors',
        isSelected && 'bg-secondary/80',
        hasUnread && 'bg-accent/20',
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Online status for 1-on-1 conversations */}
        {!conversation.isGroup && otherParticipant && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <OnlineStatus
              isOnline={otherParticipant.isOnline || false}
              lastSeen={otherParticipant.lastSeen}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium truncate',
                hasUnread && 'font-semibold',
              )}
            >
              {displayName}
            </p>
            {!conversation.isGroup && displayUsername && (
              <p className="text-xs text-muted-foreground">
                @{displayUsername}
              </p>
            )}
          </div>

          {/* Time and unread count */}
          <div className="flex items-center space-x-2 ml-2">
            {timeAgo && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo}
              </span>
            )}
            {hasUnread && (
              <Badge
                variant="default"
                className="h-5 min-w-[20px] px-1.5 text-xs font-semibold bg-primary text-primary-foreground"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Last message preview */}
        <p
          className={cn(
            'text-sm text-muted-foreground truncate mt-0.5',
            hasUnread && 'text-foreground font-medium',
          )}
        >
          {messagePreview}
        </p>
      </div>
    </div>
  );
}
