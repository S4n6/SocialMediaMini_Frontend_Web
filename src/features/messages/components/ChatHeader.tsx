'use client';

import React from 'react';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User } from '../types';
import { OnlineStatus, useLastSeenText } from './OnlineStatus';

interface ChatHeaderProps {
  participant?: User;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  participantCount?: number;
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onInfo?: () => void;
  className?: string;
}

export default function ChatHeader({
  participant,
  isGroup = false,
  groupName,
  groupAvatar,
  participantCount,
  onBack,
  onCall,
  onVideoCall,
  onInfo,
  className = '',
}: ChatHeaderProps) {
  // Get display info
  const displayName = isGroup
    ? groupName || 'Group Chat'
    : participant?.fullName || 'Unknown User';

  const displayAvatar = isGroup ? groupAvatar : participant?.avatar;

  // Use the hook for last seen text
  const lastSeenText = useLastSeenText(
    participant?.lastSeen,
    participant?.isOnline,
  );

  const getSubtitle = () => {
    if (isGroup) {
      return participantCount ? `${participantCount} members` : 'Group';
    }

    if (!participant) return '';

    return lastSeenText;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const subtitle = getSubtitle();

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Back Button (Mobile) */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="md:hidden h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          {/* Online status for 1-on-1 conversations */}
          {!isGroup && participant && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <OnlineStatus
                isOnline={participant.isOnline || false}
                lastSeen={participant.lastSeen}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          {subtitle && (
            <p
              className={cn(
                'text-xs truncate',
                !isGroup && participant?.isOnline
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center space-x-1">
        {/* Call Button */}
        {onCall && !isGroup && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCall}
            className="h-8 w-8 p-0"
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}

        {/* Video Call Button */}
        {onVideoCall && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            className="h-8 w-8 p-0"
          >
            <Video className="h-4 w-4" />
          </Button>
        )}

        {/* Info Button */}
        {onInfo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onInfo}
            className="h-8 w-8 p-0"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
