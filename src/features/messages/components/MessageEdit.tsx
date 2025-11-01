'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit3 } from 'lucide-react';
import { ApiMessage } from '../types/api.types';

interface MessageEditProps {
  message: ApiMessage;
  isEditing: boolean;
  onSave: (messageId: string, newContent: string) => void;
  onCancel: () => void;
  className?: string;
}

export function MessageEdit({
  message,
  isEditing,
  onSave,
  onCancel,
  className = '',
}: MessageEditProps) {
  const [editContent, setEditContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus and resize textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);

      // Auto-resize
      autoResize();
    }
  }, [isEditing]);

  // Reset content when message changes
  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSave = async () => {
    const trimmedContent = editContent.trim();

    if (!trimmedContent) {
      onCancel();
      return;
    }

    if (trimmedContent === message.content) {
      onCancel();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(message.id, trimmedContent);
    } catch (error) {
      console.error('Failed to save message:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(message.content);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => {
            setEditContent(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] pr-16 resize-none"
          placeholder="Edit your message..."
          disabled={isSaving}
        />

        {/* Character counter for long messages */}
        {editContent.length > 500 && (
          <div className="absolute bottom-2 right-14 text-xs text-muted-foreground">
            {editContent.length}/2000
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Press Enter to save, Esc to cancel
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-7 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={
              isSaving ||
              !editContent.trim() ||
              editContent.trim() === message.content
            }
            className="h-7 px-2"
          >
            {isSaving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Inline Edit Button Component
export function MessageEditButton({
  isEditing,
  onEdit,
  className = '',
}: {
  isEditing: boolean;
  onEdit: () => void;
  className?: string;
}) {
  if (isEditing) return null;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onEdit}
      className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      title="Edit message"
    >
      <Edit3 className="h-3 w-3" />
    </Button>
  );
}

// Hook for managing message editing state
export function useMessageEdit() {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  const startEditing = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const stopEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const isEditing = (messageId: string) => editingMessageId === messageId;

  return {
    editingMessageId,
    editingContent,
    startEditing,
    stopEditing,
    isEditing,
  };
}

// Message with integrated edit functionality
export function EditableMessageContent({
  message,
  currentUserId,
  onSave,
  className = '',
}: {
  message: ApiMessage;
  currentUserId: string;
  onSave: (messageId: string, newContent: string) => void;
  className?: string;
}) {
  const { editingMessageId, startEditing, stopEditing, isEditing } =
    useMessageEdit();
  const canEdit = message.senderId === currentUserId && message.type === 'text';
  const messageAge = new Date().getTime() - new Date(message.sentAt).getTime();
  const isRecentMessage = messageAge < 24 * 60 * 60 * 1000; // 24 hours

  const handleSave = async (messageId: string, newContent: string) => {
    await onSave(messageId, newContent);
    stopEditing();
  };

  if (isEditing(message.id)) {
    return (
      <MessageEdit
        message={message}
        isEditing={true}
        onSave={handleSave}
        onCancel={stopEditing}
        className={className}
      />
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="pr-8">
        {message.content}
        {message.editedAt && (
          <span className="text-xs text-muted-foreground ml-2">(edited)</span>
        )}
      </div>

      {canEdit && isRecentMessage && (
        <MessageEditButton
          isEditing={false}
          onEdit={() => startEditing(message.id, message.content)}
          className="absolute top-0 right-0"
        />
      )}
    </div>
  );
}
