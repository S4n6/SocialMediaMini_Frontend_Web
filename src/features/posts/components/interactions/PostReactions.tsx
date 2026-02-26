'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, ThumbsUp, Laugh, Angry, Frown, Zap } from 'lucide-react';

// Reaction types mapping
export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  LAUGH: 'laugh',
  ANGRY: 'angry',
  SAD: 'sad',
  WOW: 'wow',
} as const;

export type ReactionType = (typeof REACTION_TYPES)[keyof typeof REACTION_TYPES];

// Reaction configuration with icons and colors
export const REACTIONS_CONFIG = {
  [REACTION_TYPES.LIKE]: {
    icon: ThumbsUp,
    label: 'Like',
    color: 'text-blue-500',
    hoverColor: 'hover:text-blue-600',
    bgColor: 'bg-blue-50',
    emoji: '👍',
  },
  [REACTION_TYPES.LOVE]: {
    icon: Heart,
    label: 'Love',
    color: 'text-red-500',
    hoverColor: 'hover:text-red-600',
    bgColor: 'bg-red-50',
    emoji: '❤️',
  },
  [REACTION_TYPES.LAUGH]: {
    icon: Laugh,
    label: 'Haha',
    color: 'text-yellow-500',
    hoverColor: 'hover:text-yellow-600',
    bgColor: 'bg-yellow-50',
    emoji: '😂',
  },
  [REACTION_TYPES.ANGRY]: {
    icon: Angry,
    label: 'Angry',
    color: 'text-orange-500',
    hoverColor: 'hover:text-orange-600',
    bgColor: 'bg-orange-50',
    emoji: '😠',
  },
  [REACTION_TYPES.SAD]: {
    icon: Frown,
    label: 'Sad',
    color: 'text-gray-500',
    hoverColor: 'hover:text-gray-600',
    bgColor: 'bg-gray-50',
    emoji: '😢',
  },
  [REACTION_TYPES.WOW]: {
    icon: Zap,
    label: 'Wow',
    color: 'text-purple-500',
    hoverColor: 'hover:text-purple-600',
    bgColor: 'bg-purple-50',
    emoji: '😮',
  },
};

interface ReactionSummary {
  type: ReactionType;
  count: number;
}

interface PostReactionsProps {
  postId: string;
  reactions?: ReactionSummary[];
  userReaction?: ReactionType | null;
  totalCount?: number;
  onReact?: (reactionType: ReactionType) => void;
  onRemoveReaction?: () => void;
  className?: string;
  showPicker?: boolean;
}

export const PostReactions: React.FC<PostReactionsProps> = ({
  postId,
  reactions = [],
  userReaction = null,
  totalCount = 0,
  onReact,
  onRemoveReaction,
  className,
  showPicker = true,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Handle quick like (default reaction)
  const handleQuickReaction = () => {
    if (userReaction) {
      onRemoveReaction?.();
    } else {
      onReact?.(REACTION_TYPES.LIKE);
    }
  };

  // Handle specific reaction selection
  const handleReactionSelect = (reactionType: ReactionType) => {
    if (userReaction === reactionType) {
      onRemoveReaction?.();
    } else {
      onReact?.(reactionType);
    }
    setShowReactionPicker(false);
  };

  // Get the primary reaction button display
  const getPrimaryReaction = () => {
    if (userReaction) {
      const config = REACTIONS_CONFIG[userReaction];
      return {
        icon: config.icon,
        color: config.color,
        label: config.label,
        isActive: true,
      };
    }

    return {
      icon: ThumbsUp,
      color: 'text-muted-foreground',
      label: 'Like',
      isActive: false,
    };
  };

  const primaryReaction = getPrimaryReaction();
  const PrimaryIcon = primaryReaction.icon;

  // Get top reactions to display
  const topReactions = reactions.sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Reactions Summary */}
      {totalCount > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {/* Top reaction emojis */}
          <div className="flex items-center -space-x-1">
            {topReactions.map((reaction) => (
              <span
                key={reaction.type}
                className="inline-flex items-center justify-center w-6 h-6 text-xs bg-white border border-gray-200 rounded-full"
                title={`${reaction.count} ${REACTIONS_CONFIG[reaction.type].label}`}
              >
                {REACTIONS_CONFIG[reaction.type].emoji}
              </span>
            ))}
          </div>

          {/* Total count */}
          <span className="ml-1">{totalCount}</span>
        </div>
      )}

      {/* Main Reaction Button */}
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={handleQuickReaction}
          onMouseEnter={() => {
            if (showPicker) {
              setIsHovering(true);
              const timer = setTimeout(() => {
                if (isHovering) {
                  setShowReactionPicker(true);
                }
              }, 500); // Show picker after 500ms hover
              return () => clearTimeout(timer);
            }
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            // Don't immediately hide picker to allow interaction
          }}
          className={cn(
            'flex items-center gap-2 transition-colors',
            primaryReaction.color,
            primaryReaction.isActive && 'font-medium',
            !primaryReaction.isActive && 'hover:text-blue-500',
          )}
        >
          <PrimaryIcon className="w-4 h-4" />
          <span className="text-sm">{primaryReaction.label}</span>
        </Button>

        {/* Reaction Picker Overlay */}
        {showReactionPicker && showPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1 z-10"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setShowReactionPicker(false);
            }}
          >
            {Object.entries(REACTIONS_CONFIG).map(([type, config]) => {
              const Icon = config.icon;
              const isSelected = userReaction === type;

              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReactionSelect(type as ReactionType)}
                  className={cn(
                    'w-10 h-10 p-0 transition-all duration-200 hover:scale-110',
                    config.hoverColor,
                    isSelected && [config.color, config.bgColor, 'scale-110'],
                  )}
                  title={config.label}
                >
                  <span className="text-lg">{config.emoji}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Export for use in other components
export default PostReactions;
