'use client';

import React, { useState } from 'react';
import { Reply, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message, User } from '../types';
import { MediaPreview } from './MediaPreview';
import {
  MessageReactions,
  MessageReaction,
  useMessageReactions,
} from './MessageReactions';
import { MessageReply, ReplyContext } from './MessageReply';
import { MessageActions } from './MessageActions';
import { MessageEdit } from './MessageEdit';

interface MessageItemProps {
  message: Message;
  isFromCurrentUser: boolean;
  conversationId?: string;
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
  useWebSocket?: boolean;
}

export function MessageItem({
  message,
  isFromCurrentUser,
  conversationId = '',
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
  useWebSocket = false,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {
    reactions: messageReactions,
    addReaction,
    removeReaction,
  } = useMessageReactions(reactions);

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

  // Message action handlers
  const handleEditMessage = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleDeleteMessage = () => {
    onDelete?.(message.id);
    setShowActions(false);
  };

  const handleEditComplete = (newContent: string) => {
    // TODO: Call API to update message
    console.log('Editing message:', message.id, 'New content:', newContent);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // Handle message actions
  const handleReply = () => {
    if (onReply) {
      const sender: User = {
        id: message.senderId,
        username: senderName || 'unknown',
        fullName: senderName || 'Unknown',
        avatar: senderAvatar,
      };
      onReply(message, sender);
    }
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  const handleAddReaction = (emoji: string) => {
    addReaction(message.id, emoji);
    if (onAddReaction) {
      onAddReaction(message.id, emoji);
    }
  };

  const handleRemoveReaction = (emoji: string) => {
    removeReaction(message.id, emoji);
    if (onRemoveReaction) {
      onRemoveReaction(message.id, emoji);
    }
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return message.mediaUrl ? (
          <div className="space-y-2">
            <MediaPreview
              src={message.mediaUrl}
              alt="Shared image"
              type="image"
              className="max-w-xs"
            />
            {message.content && (
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-secondary/50 p-4 text-center text-muted-foreground rounded-lg max-w-xs">
            📷 Image unavailable
          </div>
        );

      case 'video':
        return message.mediaUrl ? (
          <div className="space-y-2">
            <MediaPreview
              src={message.mediaUrl}
              alt="Shared video"
              type="video"
              className="max-w-xs"
            />
            {message.content && (
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-secondary/50 p-4 text-center text-muted-foreground rounded-lg max-w-xs">
            🎥 Video unavailable
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-3 max-w-xs">
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
        if (isEditing) {
          return (
            <MessageEdit
              message={{
                id: message.id,
                content: message.content || '',
                type: 'text' as const,
                status: 'sent' as const,
                sentAt: message.createdAt.toISOString(),
                conversationId: conversationId || '',
                senderId: message.senderId || '',
                reactions: [],
              }}
              isEditing={true}
              onSave={(messageId, newContent) => handleEditComplete(newContent)}
              onCancel={handleEditCancel}
            />
          );
        }

        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        );
    }
  };

  const messageTime = formatTime(message.createdAt);

  return (
    <div
      className={cn(
        'flex items-end space-x-2 group relative',
        isFromCurrentUser ? 'justify-end' : 'justify-start',
        isGroupedWithPrevious ? 'mt-1' : 'mt-3',
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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

      {/* Message content */}
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

        {/* Reply context */}
        {replyTo && (
          <MessageReply
            replyTo={replyTo}
            className="mb-2"
            onClick={() => {
              // In real app, scroll to original message
              console.log('Scroll to replied message:', replyTo.message.id);
            }}
          />
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm relative',
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

        {/* Reactions */}
        {messageReactions.length > 0 && (
          <div className="mt-1">
            <MessageReactions
              reactions={messageReactions}
              messageId={message.id}
              conversationId={conversationId}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              className="opacity-100"
              showAddButton={false}
              useWebSocket={useWebSocket}
            />
          </div>
        )}

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

      {/* Action buttons */}
      <div
        className={cn(
          'absolute flex items-center space-x-1 transition-opacity bg-background border rounded-lg shadow-sm p-1',
          showActions ? 'opacity-100' : 'opacity-0 pointer-events-none',
          isFromCurrentUser ? 'left-0 top-0' : 'right-0 top-0',
        )}
      >
        {/* Reply button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReply}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
          title="Reply"
        >
          <Reply className="h-3 w-3" />
        </Button>

        {/* Add reaction button */}
        <div className="relative">
          <MessageReactions
            reactions={[]}
            messageId={message.id}
            conversationId={conversationId}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
            showAddButton={true}
            className="opacity-100"
            useWebSocket={useWebSocket}
          />
        </div>

        {/* Message Actions */}
        <MessageActions
          message={{
            id: message.id,
            content: message.content || '',
            type: 'text' as const,
            status: 'sent' as const,
            sentAt: message.createdAt.toISOString(),
            conversationId: conversationId || '',
            senderId: message.senderId || '',
            reactions: [],
          }}
          isOwner={isFromCurrentUser}
          canEdit={isFromCurrentUser}
          canDelete={isFromCurrentUser}
          canForward={true}
          onEdit={(messageId, newContent) => handleEditComplete(newContent)}
          onDelete={handleDeleteMessage}
          onCopy={handleCopy}
          onReply={() => onReply?.(message)}
        />

        {/* Delete (only for current user's messages) */}
        {isFromCurrentUser && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
