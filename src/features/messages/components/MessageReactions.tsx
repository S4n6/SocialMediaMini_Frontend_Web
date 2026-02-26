'use client';

import React, { useState } from 'react';
import { Plus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAddReaction, useRemoveReaction } from '../hooks/useMessagingApi';
import { getWebSocketService } from '../services/websocket.service';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
  hasCurrentUser: boolean; // if current user reacted
}

interface MessageReactionsProps {
  reactions: MessageReaction[];
  messageId: string;
  conversationId: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  className?: string;
  showAddButton?: boolean;
  useWebSocket?: boolean;
}

interface QuickReactionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position?: 'top' | 'bottom';
}

// Quick emoji picker for reactions
function QuickReactionPicker({
  isOpen,
  onClose,
  onSelect,
  position = 'top',
}: QuickReactionPickerProps) {
  const quickEmojis = [
    '❤️',
    '👍',
    '👎',
    '😂',
    '😮',
    '😢',
    '😡',
    '🔥',
    '👏',
    '🎉',
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Picker */}
      <div
        className={cn(
          'absolute z-50 bg-background border rounded-lg shadow-lg p-2 flex gap-1',
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {quickEmojis.map((emoji, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="h-8 w-8 p-0 hover:bg-secondary text-lg"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </>
  );
}

// Individual reaction button
function ReactionButton({
  reaction,
  messageId,
  onToggle,
  className = '',
}: {
  reaction: MessageReaction;
  messageId: string;
  onToggle: (messageId: string, emoji: string, isAdd: boolean) => void;
  className?: string;
}) {
  const handleClick = () => {
    onToggle(messageId, reaction.emoji, !reaction.hasCurrentUser);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'h-6 px-2 py-1 text-xs rounded-full transition-all',
        reaction.hasCurrentUser
          ? 'bg-primary/20 text-primary border border-primary/30'
          : 'bg-secondary/50 hover:bg-secondary',
        className,
      )}
    >
      <span className="mr-1">{reaction.emoji}</span>
      <span className="font-medium">{reaction.count}</span>
    </Button>
  );
}

// Main MessageReactions component
export function MessageReactions({
  reactions,
  messageId,
  conversationId,
  onAddReaction,
  onRemoveReaction,
  className = '',
  showAddButton = true,
  useWebSocket = false,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  // API hooks for reactions
  const addReactionMutation = useAddReaction();
  const removeReactionMutation = useRemoveReaction();

  // Filter out reactions with 0 count
  const visibleReactions = reactions.filter((r) => r.count > 0);

  const handleToggleReaction = async (
    messageId: string,
    emoji: string,
    isAdd: boolean,
  ) => {
    if (useWebSocket) {
      // Use WebSocket for real-time reactions
      const wsService = getWebSocketService();
      if (wsService?.isConnected()) {
        if (isAdd) {
          wsService.addReaction(conversationId, messageId, emoji);
        } else {
          wsService.removeReaction(conversationId, messageId, emoji);
        }
        return;
      }
    }

    // Fallback to API or callback
    if (isAdd) {
      if (onAddReaction) {
        onAddReaction(messageId, emoji);
      } else {
        addReactionMutation.mutate({
          conversationId,
          messageId,
          emoji,
        });
      }
    } else {
      if (onRemoveReaction) {
        onRemoveReaction(messageId, emoji);
      } else {
        removeReactionMutation.mutate({
          conversationId,
          messageId,
          emoji,
        });
      }
    }
  };

  const handleAddReaction = async (emoji: string) => {
    await handleToggleReaction(messageId, emoji, true);
  };

  if (visibleReactions.length === 0 && !showAddButton) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center gap-1 flex-wrap relative', className)}
    >
      {/* Existing reactions */}
      {visibleReactions.map((reaction, index) => (
        <ReactionButton
          key={`${reaction.emoji}-${index}`}
          reaction={reaction}
          messageId={messageId}
          onToggle={handleToggleReaction}
        />
      ))}

      {/* Add reaction button */}
      {showAddButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="h-6 w-6 p-0 rounded-full bg-secondary/50 hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}

      {/* Quick reaction picker */}
      <QuickReactionPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddReaction}
        position="top"
      />
    </div>
  );
}

// Hook for managing reactions (can be moved to hooks folder later)
export function useMessageReactions(initialReactions: MessageReaction[] = []) {
  const [reactions, setReactions] =
    useState<MessageReaction[]>(initialReactions);

  const addReaction = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);

      if (existing) {
        // If reaction exists and user hasn't reacted, add their reaction
        if (!existing.hasCurrentUser) {
          return prev.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count + 1,
                  hasCurrentUser: true,
                  users: [...r.users, 'current-user'], // In real app, use actual user ID
                }
              : r,
          );
        }
      } else {
        // Create new reaction
        return [
          ...prev,
          {
            emoji,
            count: 1,
            users: ['current-user'], // In real app, use actual user ID
            hasCurrentUser: true,
          },
        ];
      }

      return prev;
    });

    // In real app, make API call here
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
  };

  const removeReaction = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      return prev
        .map((r) => {
          if (r.emoji === emoji && r.hasCurrentUser) {
            const newCount = r.count - 1;
            return {
              ...r,
              count: newCount,
              hasCurrentUser: false,
              users: r.users.filter((u) => u !== 'current-user'), // Remove current user
            };
          }
          return r;
        })
        .filter((r) => r.count > 0); // Remove reactions with 0 count
    });

    // In real app, make API call here
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
  };

  return {
    reactions,
    addReaction,
    removeReaction,
    setReactions,
  };
}

export default MessageReactions;
