'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog-simple';
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Forward,
  Copy,
  Reply,
  Flag,
  Download,
  Share,
} from 'lucide-react';
import { ApiMessage } from '../types/api.types';
import { toast } from 'sonner';

export interface MessageActionsProps {
  message: ApiMessage;
  isOwner: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canForward?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (message: ApiMessage) => void;
  onReply?: (message: ApiMessage) => void;
  onCopy?: (content: string) => void;
  onReport?: (messageId: string) => void;
  className?: string;
}

export function MessageActions({
  message,
  isOwner,
  canEdit = true,
  canDelete = true,
  canForward = true,
  onEdit,
  onDelete,
  onForward,
  onReply,
  onCopy,
  onReport,
  className = '',
}: MessageActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(message.content);
      return;
    }

    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
      toast.success('Message updated');
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
      toast.success('Message deleted');
    }
    setShowDeleteDialog(false);
  };

  const handleForward = () => {
    if (onForward) {
      onForward(message);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(message.id);
      toast.success('Message reported');
    }
  };

  const canShowEditDelete = isOwner && (canEdit || canDelete);
  const messageAge = new Date().getTime() - new Date(message.sentAt).getTime();
  const isRecentMessage = messageAge < 24 * 60 * 60 * 1000; // 24 hours

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Reply */}
          <DropdownMenuItem onClick={handleReply} className="cursor-pointer">
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </DropdownMenuItem>

          {/* Forward */}
          {canForward && (
            <DropdownMenuItem
              onClick={handleForward}
              className="cursor-pointer"
            >
              <Forward className="mr-2 h-4 w-4" />
              Forward
            </DropdownMenuItem>
          )}

          {/* Copy */}
          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </DropdownMenuItem>

          {/* Download (for media messages) */}
          {message.attachmentUrl && (
            <DropdownMenuItem
              onClick={() => window.open(message.attachmentUrl, '_blank')}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
          )}

          {canShowEditDelete && (
            <>
              <DropdownMenuSeparator />

              {/* Edit - only for recent text messages */}
              {canEdit && message.type === 'text' && isRecentMessage && (
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}

              {/* Delete */}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </>
          )}

          {/* Report (for messages from others) */}
          {!isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleReport}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog - Simple inline editing could be added here */}
    </>
  );
}

// Hook for message actions
export function useMessageActions() {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<ApiMessage | null>(
    null,
  );

  const startEditing = (messageId: string) => {
    setEditingMessageId(messageId);
  };

  const stopEditing = () => {
    setEditingMessageId(null);
  };

  const startForwarding = (message: ApiMessage) => {
    setForwardingMessage(message);
  };

  const stopForwarding = () => {
    setForwardingMessage(null);
  };

  return {
    editingMessageId,
    forwardingMessage,
    startEditing,
    stopEditing,
    startForwarding,
    stopForwarding,
    isEditing: (messageId: string) => editingMessageId === messageId,
  };
}

// Message Forward Dialog Component
export function MessageForwardDialog({
  message,
  conversations,
  onForward,
  onClose,
}: {
  message: ApiMessage | null;
  conversations: Array<{ id: string; title: string; participants?: any[] }>;
  onForward: (conversationIds: string[]) => void;
  onClose: () => void;
}) {
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );

  if (!message) return null;

  const handleForward = () => {
    if (selectedConversations.length > 0) {
      onForward(selectedConversations);
      onClose();
      toast.success(
        `Message forwarded to ${selectedConversations.length} conversation(s)`,
      );
    }
  };

  const toggleConversation = (conversationId: string) => {
    setSelectedConversations((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId],
    );
  };

  return (
    <AlertDialog open={!!message} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Forward Message</AlertDialogTitle>
          <AlertDialogDescription>
            Select conversations to forward this message to:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-60 overflow-y-auto space-y-2 py-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedConversations.includes(conversation.id)
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted'
              }`}
              onClick={() => toggleConversation(conversation.id)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedConversations.includes(conversation.id)}
                  onChange={() => toggleConversation(conversation.id)}
                  className="rounded"
                />
                <span className="font-medium">{conversation.title}</span>
              </div>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleForward}
            disabled={selectedConversations.length === 0}
          >
            Forward ({selectedConversations.length})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
