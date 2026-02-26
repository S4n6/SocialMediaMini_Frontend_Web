'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Message Loading Skeletons
export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-3 p-4 mb-4',
        isOwn ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {!isOwn && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
      <div
        className={cn(
          'flex flex-col space-y-2 max-w-[70%]',
          isOwn ? 'items-end' : 'items-start',
        )}
      >
        {!isOwn && <Skeleton className="h-4 w-20" />}
        <div
          className={cn(
            'rounded-lg p-3 space-y-2 min-w-[120px]',
            isOwn ? 'bg-primary/5' : 'bg-muted/50',
          )}
        >
          <Skeleton className="h-4 w-full" />
          {Math.random() > 0.5 && <Skeleton className="h-4 w-3/4" />}
          {Math.random() > 0.7 && <Skeleton className="h-4 w-1/2" />}
        </div>
        <Skeleton className="h-3 w-16 opacity-60" />
      </div>
    </div>
  );
}

// Search Result Skeleton
export function SearchResultSkeleton() {
  return (
    <div className="p-4 border-b border-border/40 hover:bg-muted/30 transition-colors">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 opacity-60" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex items-center space-x-4 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversation List Skeleton
export function ConversationSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-4 hover:bg-muted/30 transition-colors">
      <div className="relative">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-40" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Group Members Skeleton
export function GroupMemberSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

// File Upload Skeleton
export function FileUploadSkeleton() {
  return (
    <div className="border-2 border-dashed border-border/40 rounded-lg p-8 bg-muted/20">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

// History Statistics Skeleton
export function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border border-border/40 rounded-lg p-4 bg-card"
        >
          <div className="text-center space-y-3">
            <Skeleton className="w-8 h-8 rounded-full mx-auto" />
            <Skeleton className="h-6 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Chat List Loading
export function ChatListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </div>
  );
}

// Messages Loading
export function MessagesListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} isOwn={Math.random() > 0.6} />
      ))}
    </div>
  );
}

// Search Results Loading
export function SearchResultsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/40">
      {Array.from({ length: count }).map((_, index) => (
        <SearchResultSkeleton key={index} />
      ))}
    </div>
  );
}

// Group Members Loading
export function GroupMembersListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <GroupMemberSkeleton key={index} />
      ))}
    </div>
  );
}

// Typing Indicator Skeleton
export function TypingIndicatorSkeleton() {
  return (
    <div className="flex items-center space-x-2 p-3 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <Skeleton
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <Skeleton
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <Skeleton
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
