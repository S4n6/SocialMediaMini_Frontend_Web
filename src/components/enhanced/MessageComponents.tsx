'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedCard,
  TypingIndicator,
  AnimatedButton,
} from '@/components/ui/animated';
import { Loading, LoadingOverlay } from '@/components/ui/loading';
import {
  MessageSkeleton,
  ConversationSkeleton,
  SearchResultSkeleton,
  MessagesListSkeleton,
} from '@/components/skeletons/MessageSkeletons';
import { responsivePatterns } from '@/lib/responsive';
import {
  Search,
  Filter,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  ArrowLeft,
  X,
} from 'lucide-react';

interface EnhancedMessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: string;
    isOwn: boolean;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    attachments?: any[];
    reactions?: any[];
    editedAt?: string;
    replyTo?: any;
  };
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export function EnhancedMessageBubble({
  message,
  onReply,
  onReact,
  onEdit,
  onDelete,
  className,
}: EnhancedMessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Stagger message appearance
    const timer = setTimeout(() => setIsVisible(true), Math.random() * 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatedCard
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 transform translate-y-0'
          : 'opacity-0 transform translate-y-4',
        responsivePatterns.messageContainer,
        className,
      )}
      hoverEffect={false}
      delay={0}
    >
      <div
        className={cn(
          'flex gap-3 group',
          message.isOwn ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        {/* Avatar */}
        {!message.isOwn && (
          <div className="flex-shrink-0">
            <div
              className={cn(
                'rounded-full bg-primary/10 flex items-center justify-center',
                responsivePatterns.messageBubble.replace(
                  'px-3 py-2 md:px-4 md:py-3 text-sm md:text-base',
                  'w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm',
                ),
              )}
            >
              {message.senderAvatar ? (
                <img
                  src={message.senderAvatar}
                  alt={message.senderName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-medium">
                  {message.senderName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={cn(
            'flex flex-col space-y-1 max-w-[85%] md:max-w-[70%] lg:max-w-[60%]',
            message.isOwn ? 'items-end' : 'items-start',
          )}
        >
          {/* Sender Name (for group chats) */}
          {!message.isOwn && (
            <span className="text-xs text-muted-foreground px-1">
              {message.senderName}
            </span>
          )}

          {/* Reply Reference */}
          {message.replyTo && (
            <div
              className={cn(
                'text-xs p-2 rounded-lg border-l-2 bg-muted/50',
                message.isOwn ? 'border-l-primary' : 'border-l-secondary',
              )}
            >
              <p className="font-medium text-muted-foreground">
                {message.replyTo.senderName}
              </p>
              <p className="text-muted-foreground truncate">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={cn(
              'relative rounded-lg transition-all duration-200',
              responsivePatterns.messageBubble,
              message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted',
              'group-hover:shadow-sm',
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            <p className="break-words">{message.content}</p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="p-2 bg-background/10 rounded border"
                  >
                    <p className="text-xs font-medium">{attachment.name}</p>
                    <p className="text-xs opacity-75">
                      {attachment.size} bytes
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Message Actions */}
            {showActions && (
              <div
                className={cn(
                  'absolute -top-2 flex items-center space-x-1 bg-background rounded-lg shadow-md border p-1',
                  'transform transition-all duration-200 scale-100 opacity-100',
                  'animate-fade-in-scale',
                  message.isOwn ? '-left-2' : '-right-2',
                )}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onReact?.(message.id, '👍')}
                >
                  <Smile className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onReply?.(message.id)}
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center space-x-1">
              {message.reactions.map((reaction, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 animate-bounce-in"
                >
                  {reaction.emoji} {reaction.count}
                </Badge>
              ))}
            </div>
          )}

          {/* Timestamp & Status */}
          <div
            className={cn(
              'flex items-center space-x-1 text-xs text-muted-foreground px-1',
              message.isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row',
            )}
          >
            {message.editedAt && <span className="italic">edited</span>}
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.isOwn && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

interface EnhancedChatHeaderProps {
  conversation: {
    id: string;
    name: string;
    type: 'direct' | 'group';
    avatar?: string;
    isOnline?: boolean;
    memberCount?: number;
    lastSeen?: string;
  };
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onInfo?: () => void;
  className?: string;
}

export function EnhancedChatHeader({
  conversation,
  onBack,
  onCall,
  onVideoCall,
  onInfo,
  className,
}: EnhancedChatHeaderProps) {
  return (
    <Card
      className={cn(
        'flex items-center justify-between border-b rounded-none',
        responsivePatterns.navContainer,
        className,
      )}
    >
      <div className="flex items-center space-x-3">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={cn('md:hidden', responsivePatterns.interactiveElement)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="font-medium text-sm md:text-base">
                {conversation.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {conversation.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm md:text-base truncate">
            {conversation.name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {conversation.type === 'group'
              ? `${conversation.memberCount} members`
              : conversation.isOnline
                ? 'Online'
                : conversation.lastSeen
                  ? `Last seen ${conversation.lastSeen}`
                  : 'Offline'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        {onCall && (
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={onCall}
            className={responsivePatterns.interactiveElement}
          >
            <Phone className="h-4 w-4" />
          </AnimatedButton>
        )}
        {onVideoCall && (
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            className={responsivePatterns.interactiveElement}
          >
            <Video className="h-4 w-4" />
          </AnimatedButton>
        )}
        {onInfo && (
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={onInfo}
            className={responsivePatterns.interactiveElement}
          >
            <Info className="h-4 w-4" />
          </AnimatedButton>
        )}
      </div>
    </Card>
  );
}

interface EnhancedMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isTyping?: boolean;
  maxLength?: number;
  className?: string;
}

export function EnhancedMessageInput({
  value,
  onChange,
  onSend,
  onAttach,
  placeholder = 'Type a message...',
  disabled = false,
  isTyping = false,
  maxLength = 1000,
  className,
}: EnhancedMessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!value.trim() || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSend(value);
      onChange('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card
      className={cn(
        'border-t rounded-none p-3 md:p-4',
        responsivePatterns.searchInput,
        className,
      )}
    >
      <div className="flex items-end space-x-2">
        {/* Attachment Button */}
        {onAttach && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAttach}
            disabled={disabled}
            className={responsivePatterns.interactiveElement}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className={cn(
              'w-full resize-none border rounded-lg px-3 py-2',
              'text-sm md:text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-muted-foreground',
              'transition-all duration-200',
              isFocused && 'ring-2 ring-primary/50',
              responsivePatterns.interactiveElement,
            )}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto',
            }}
          />

          {/* Character Count */}
          {maxLength && value.length > maxLength * 0.8 && (
            <div
              className={cn(
                'absolute -bottom-5 right-0 text-xs',
                value.length >= maxLength
                  ? 'text-red-500'
                  : 'text-muted-foreground',
              )}
            >
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={responsivePatterns.interactiveElement}
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Send Button */}
        <AnimatedButton
          variant="default"
          size="sm"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          isLoading={isSending}
          loadingText="Sending..."
          className={cn('min-w-[44px]', responsivePatterns.interactiveElement)}
        >
          <Send className="h-4 w-4" />
        </AnimatedButton>
      </div>

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator isTyping={true} className="mt-2" />}
    </Card>
  );
}

// Enhanced conversation list with loading states
interface EnhancedConversationListProps {
  conversations: any[];
  onSelect: (conversationId: string) => void;
  selectedId?: string;
  isLoading?: boolean;
  className?: string;
}

export function EnhancedConversationList({
  conversations,
  onSelect,
  selectedId,
  isLoading = false,
  className,
}: EnhancedConversationListProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)}>
        <MessagesListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {conversations.map((conversation, index) => (
        <AnimatedCard
          key={conversation.id}
          delay={index * 50}
          onClick={() => onSelect(conversation.id)}
          className={cn(
            'p-3 cursor-pointer transition-all duration-200',
            'hover:bg-muted/80 border border-transparent',
            selectedId === conversation.id && 'bg-muted border-primary/50',
            responsivePatterns.mobileCard,
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-medium">
                  {conversation.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {conversation.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium truncate">{conversation.name}</h4>
                <span className="text-xs text-muted-foreground">
                  {conversation.lastMessage?.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage?.content || 'No messages yet'}
              </p>
              {conversation.unreadCount > 0 && (
                <Badge variant="default" className="mt-1 text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
}
