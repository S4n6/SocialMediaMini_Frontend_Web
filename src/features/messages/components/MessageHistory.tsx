'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUp,
  ArrowDown,
  Filter,
  Calendar,
  User,
  FileText,
  Image,
  Video,
  Music,
  File,
  MoreVertical,
  Clock,
  Edit,
  Reply,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MessageHistory,
  HistoryMessage,
  PaginationOptions,
  MessageFilter,
} from '../types/search';

interface MessageHistoryViewProps {
  conversationId: string;
  conversationName: string;
  currentUserId: string;
  onSelectMessage?: (messageId: string) => void;
  onJumpToMessage?: (messageId: string) => void;
  className?: string;
}

export function MessageHistoryView({
  conversationId,
  conversationName,
  currentUserId,
  onSelectMessage,
  onJumpToMessage,
  className = '',
}: MessageHistoryViewProps) {
  const [history, setHistory] = useState<MessageHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<'date' | 'sender'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<MessageFilter[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState<string>('all');
  const [selectedSender, setSelectedSender] = useState<string>('all');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock history data
  const mockHistory: MessageHistory = {
    conversationId,
    totalCount: 1247,
    hasMore: true,
    messages: [
      {
        id: 'msg1',
        content:
          'Hey everyone! Just wanted to share the latest project updates.',
        messageType: 'text',
        senderId: 'user1',
        senderName: 'John Doe',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        reactions: [
          { emoji: '👍', users: ['user2', 'user3'], count: 2 },
          { emoji: '🎉', users: ['user4'], count: 1 },
        ],
      },
      {
        id: 'msg2',
        content: 'Thanks for the update! The design looks great.',
        messageType: 'text',
        senderId: 'user2',
        senderName: 'Jane Smith',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replyTo: {
          id: 'msg1',
          content: 'Hey everyone! Just wanted to share...',
          senderName: 'John Doe',
        },
      },
      {
        id: 'msg3',
        content: 'Here are the latest mockups for review',
        messageType: 'image',
        senderId: 'user3',
        senderName: 'Alice Designer',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        attachments: [
          {
            id: 'att1',
            name: 'mockup-v2.png',
            type: 'image/png',
            size: 2048000,
            url: '#',
            thumbnail: '#',
          },
        ],
      },
      {
        id: 'msg4',
        content: "Meeting notes from today's standup",
        messageType: 'file',
        senderId: 'user4',
        senderName: 'Bob Manager',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isEdited: true,
        editedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
        attachments: [
          {
            id: 'att2',
            name: 'meeting-notes.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 45600,
            url: '#',
          },
        ],
      },
    ],
  };

  const loadHistory = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Apply filters and sorting to mock data
        let filteredMessages = [...mockHistory.messages];

        // Filter by message type
        if (selectedMessageType !== 'all') {
          filteredMessages = filteredMessages.filter(
            (msg) => msg.messageType === selectedMessageType,
          );
        }

        // Filter by sender
        if (selectedSender !== 'all') {
          filteredMessages = filteredMessages.filter(
            (msg) => msg.senderId === selectedSender,
          );
        }

        // Filter by query
        if (filterQuery) {
          filteredMessages = filteredMessages.filter(
            (msg) =>
              msg.content.toLowerCase().includes(filterQuery.toLowerCase()) ||
              msg.senderName.toLowerCase().includes(filterQuery.toLowerCase()),
          );
        }

        // Sort messages
        filteredMessages.sort((a, b) => {
          if (sortBy === 'date') {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          } else {
            return sortOrder === 'asc'
              ? a.senderName.localeCompare(b.senderName)
              : b.senderName.localeCompare(a.senderName);
          }
        });

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const paginatedMessages = filteredMessages.slice(
          startIndex,
          startIndex + pageSize,
        );

        setHistory({
          ...mockHistory,
          messages: paginatedMessages,
          totalCount: filteredMessages.length,
          hasMore: startIndex + pageSize < filteredMessages.length,
        });

        setCurrentPage(page);
      } catch (error) {
        toast.error('Failed to load message history');
      } finally {
        setIsLoading(false);
      }
    },
    [
      conversationId,
      pageSize,
      sortBy,
      sortOrder,
      selectedMessageType,
      selectedSender,
      filterQuery,
    ],
  );

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const handleRefresh = () => {
    loadHistory(currentPage);
  };

  const handleNextPage = () => {
    if (history?.hasMore) {
      loadHistory(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadHistory(currentPage - 1);
    }
  };

  const handleMessageAction = (messageId: string, action: string) => {
    switch (action) {
      case 'select':
        onSelectMessage?.(messageId);
        break;
      case 'jump':
        onJumpToMessage?.(messageId);
        toast.success('Jumped to message in conversation');
        break;
      case 'reply':
        toast.info('Reply functionality would open here');
        break;
      default:
        break;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get unique senders for filter
  const uniqueSenders = Array.from(
    new Set(
      mockHistory.messages.map((msg) => ({
        id: msg.senderId,
        name: msg.senderName,
      })),
    ),
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Message History</h2>
            <p className="text-sm text-muted-foreground">{conversationName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters and Controls */}
        <div className="space-y-3">
          {/* Search */}
          <Input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter messages..."
          />

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedMessageType}
              onValueChange={setSelectedMessageType}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="file">Files</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSender} onValueChange={setSelectedSender}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All senders</SelectItem>
                {uniqueSenders.map((sender) => (
                  <SelectItem key={sender.id} value={sender.id}>
                    {sender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="sender">Sender</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading message history...</span>
          </div>
        ) : history && history.messages.length > 0 ? (
          <div className="space-y-3">
            {history.messages.map((message) => (
              <Card
                key={message.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMessageAction(message.id, 'select')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>
                        {message.senderName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-sm">
                          {message.senderName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {getMessageTypeIcon(message.messageType)}
                          <span className="ml-1">{message.messageType}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.isEdited && (
                          <Badge variant="secondary" className="text-xs">
                            <Edit className="h-3 w-3 mr-1" />
                            Edited
                          </Badge>
                        )}
                      </div>

                      {/* Reply Context */}
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-muted rounded text-xs">
                          <p className="font-medium">
                            {message.replyTo.senderName}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {message.replyTo.content}
                          </p>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="text-sm mb-2">{message.content}</p>

                      {/* Attachments */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center space-x-2 p-2 bg-muted rounded"
                              >
                                {getMessageTypeIcon(
                                  attachment.type.split('/')[0],
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex space-x-1 mb-2">
                          {message.reactions.map((reaction, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {reaction.emoji} {reaction.count}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Message Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleMessageAction(message.id, 'jump')
                          }
                        >
                          Jump to Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleMessageAction(message.id, 'reply')
                          }
                        >
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {history && (
        <div className="p-4 border-t bg-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, history.totalCount)} of{' '}
              {history.totalCount} messages
            </p>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="flex items-center px-3 text-sm">
                Page {currentPage}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!history.hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
