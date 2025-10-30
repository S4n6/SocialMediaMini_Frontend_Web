'use client';

import React from 'react';
import { cn } from '@/lib/utils';
// Simple time formatting utility
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: string | Date;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function OnlineStatus({
  isOnline,
  lastSeen,
  size = 'md',
  showText = false,
  className,
}: OnlineStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getLastSeenText = () => {
    if (isOnline) return 'Online';
    if (!lastSeen) return 'Offline';

    try {
      const date = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
      return `Last seen ${formatDistanceToNow(date)}`;
    } catch {
      return 'Offline';
    }
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-background',
            sizeClasses[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400',
          )}
        />
        {isOnline && (
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75',
              sizeClasses[size],
            )}
          />
        )}
      </div>

      {showText && (
        <span
          className={cn(
            'ml-2 text-xs',
            isOnline ? 'text-green-600' : 'text-muted-foreground',
          )}
        >
          {getLastSeenText()}
        </span>
      )}
    </div>
  );
}

// Hook to format last seen time
export function useLastSeenText(
  lastSeen?: string | Date,
  isOnline?: boolean,
): string {
  if (isOnline) return 'Online';
  if (!lastSeen) return 'Offline';

  try {
    const date = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
    return `Last seen ${formatDistanceToNow(date)}`;
  } catch {
    return 'Offline';
  }
}
