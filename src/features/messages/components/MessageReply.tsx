'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Message, User } from '../types';

export interface ReplyContext {
  message: Message;
  sender?: User;
}

interface ReplyPreviewProps {
  replyTo: ReplyContext;
  onCancel: () => void;
  className?: string;
}

interface MessageReplyProps {
  replyTo: ReplyContext;
  onClick?: () => void;
  className?: string;
}

// Component for showing reply context in message input
export function ReplyPreview({
  replyTo,
  onCancel,
  className = '',
}: ReplyPreviewProps) {
  const getContentPreview = (message: Message) => {
    switch (message.messageType) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'file':
        return '📁 File';
      default:
        return message.content.length > 50
          ? `${message.content.substring(0, 50)}...`
          : message.content;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-3 bg-secondary/30 border-l-2 border-primary',
        className,
      )}
    >
      {/* Avatar */}
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={replyTo.sender?.avatar}
          alt={replyTo.sender?.fullName}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {getInitials(replyTo.sender?.fullName || 'U')}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary mb-1">
          Replying to {replyTo.sender?.fullName || 'Unknown'}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {getContentPreview(replyTo.message)}
        </p>
      </div>

      {/* Cancel button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Component for showing replied message in a message item
export function MessageReply({
  replyTo,
  onClick,
  className = '',
}: MessageReplyProps) {
  const getContentPreview = (message: Message) => {
    switch (message.messageType) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'file':
        return '📁 File';
      default:
        return message.content.length > 40
          ? `${message.content.substring(0, 40)}...`
          : message.content;
    }
  };

  return (
    <div
      className={cn(
        'bg-secondary/20 border-l-2 border-primary/60 pl-3 py-2 mb-2 rounded-r cursor-pointer hover:bg-secondary/30 transition-colors',
        className,
      )}
      onClick={onClick}
    >
      <p className="text-xs font-medium text-primary mb-1">
        {replyTo.sender?.fullName || 'Unknown'}
      </p>
      <p className="text-xs text-muted-foreground">
        {getContentPreview(replyTo.message)}
      </p>
    </div>
  );
}

// Hook for managing reply state
export function useMessageReply() {
  const [replyTo, setReplyTo] = React.useState<ReplyContext | null>(null);

  const startReply = (message: Message, sender?: User) => {
    setReplyTo({ message, sender });
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const isReplying = replyTo !== null;

  return {
    replyTo,
    startReply,
    cancelReply,
    isReplying,
  };
}

export default { ReplyPreview, MessageReply, useMessageReply };
