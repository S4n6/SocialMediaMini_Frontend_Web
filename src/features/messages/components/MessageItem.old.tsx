'use client';

import React, { useState } from 'react';
import { Reply, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message, User } from '../types';
import { MediaPreview } from './MediaPreview';
import { MessageReactions, MessageReaction, useMessageReactions } from './MessageReactions';
import { MessageReply, ReplyContext } from './MessageReply';

interface MessageItemProps {
  message: Message;
  isFromCurrentUser: boolean;
  isGroupedWithPrevious?: boolean;
  isGroupedWithNext?: boolean;
  senderAvatar?: string;
  senderName?: string;
  showAvatar?: boolean;
  replyTo?: ReplyContext;
  reactions?: MessageReaction[];
  onReply?: (message: Message, sender?: User) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageItem({
  message,
  isFromCurrentUser,
  isGroupedWithPrevious = false,
  isGroupedWithNext = false,
  senderAvatar,
  senderName,
  showAvatar = false,
  replyTo,
  reactions = [],
  onReply,
  onAddReaction,
  onRemoveReaction,
  onDelete,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const { reactions: messageReactions, addReaction, removeReaction } = useMessageReactions(reactions);
  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="rounded-lg overflow-hidden max-w-xs">
            {message.mediaUrl ? (
              <img
                src={message.mediaUrl}
                alt="Shared image"
                className="w-full h-auto"
              />
            ) : (
              <div className="bg-secondary/50 p-4 text-center text-muted-foreground">
                📷 Image
              </div>
            )}
            {message.content && <p className="mt-2">{message.content}</p>}
          </div>
        );

      case 'video':
        return (
          <div className="rounded-lg overflow-hidden max-w-xs">
            {message.mediaUrl ? (
              <video src={message.mediaUrl} controls className="w-full h-auto">
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="bg-secondary/50 p-4 text-center text-muted-foreground">
                🎥 Video
              </div>
            )}
            {message.content && <p className="mt-2">{message.content}</p>}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-3">
            <div className="text-lg">🎵</div>
            {message.mediaUrl ? (
              <audio src={message.mediaUrl} controls className="flex-1" />
            ) : (
              <span className="text-muted-foreground">Audio message</span>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-3 max-w-xs">
            <div className="text-lg">📁</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.content || 'File attachment'}
              </p>
              {message.mediaUrl && (
                <a
                  href={message.mediaUrl}
                  download
                  className="text-xs text-primary hover:underline"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        );

      default:
        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        );
    }
  };

  const messageTime = formatTime(message.createdAt);

  return (
    <div
      className={cn(
        'flex items-end space-x-2 group',
        isFromCurrentUser ? 'justify-end' : 'justify-start',
        isGroupedWithPrevious ? 'mt-1' : 'mt-3',
      )}
    >
      {/* Avatar for other users */}
      {!isFromCurrentUser && showAvatar && !isGroupedWithNext && (
        <Avatar className="h-6 w-6 mb-1">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(senderName || 'U')}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer when avatar is hidden but needed for alignment */}
      {!isFromCurrentUser && showAvatar && isGroupedWithNext && (
        <div className="w-6" />
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[70%] relative',
          isFromCurrentUser ? 'order-2' : 'order-1',
        )}
      >
        {/* Sender name for group chats */}
        {!isFromCurrentUser &&
          showAvatar &&
          senderName &&
          !isGroupedWithPrevious && (
            <p className="text-xs text-muted-foreground mb-1 px-1">
              {senderName}
            </p>
          )}

        {/* Message content */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm',
            isFromCurrentUser
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-secondary text-secondary-foreground',

            // Adjust border radius for grouped messages
            isFromCurrentUser && isGroupedWithPrevious && 'rounded-tr-md',
            isFromCurrentUser && isGroupedWithNext && 'rounded-br-md',
            !isFromCurrentUser && isGroupedWithPrevious && 'rounded-tl-md',
            !isFromCurrentUser && isGroupedWithNext && 'rounded-bl-md',
          )}
        >
          {renderMessageContent()}
        </div>

        {/* Message status and time */}
        <div
          className={cn(
            'flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isFromCurrentUser ? 'justify-end' : 'justify-start',
          )}
        >
          <span className="text-xs text-muted-foreground">{messageTime}</span>

          {/* Read status for current user's messages */}
          {isFromCurrentUser && (
            <div className="text-xs">
              {message.isRead ? (
                <span className="text-blue-500">✓✓</span>
              ) : (
                <span className="text-muted-foreground">✓</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
