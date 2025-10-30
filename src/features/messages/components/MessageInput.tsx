'use client';

import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Image, Mic, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ImageUploadDialog } from './ImageUploadDialog';
import { ReplyPreview, ReplyContext } from './MessageReply';
import { useSendMessage, useUploadAttachment } from '../hooks/useMessagingApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';

interface MessageInputProps {
  conversationId: string;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  replyTo?: ReplyContext | null;
  onCancelReply?: () => void;
  useApi?: boolean;
  useWebSocket?: boolean;
}

export default function MessageInput({
  conversationId,
  onTyping,
  disabled = false,
  placeholder = 'Message...',
  className = '',
  replyTo,
  onCancelReply,
  useApi = false,
  useWebSocket: useWebSocketProp = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API hooks
  const sendMessage = useSendMessage();
  const uploadAttachment = useUploadAttachment();

  // WebSocket hook
  const { isConnected, sendTyping: sendTypingWS } = useWebSocket({
    autoConnect: useWebSocketProp,
  });

  // Mock send function for non-API mode
  const mockSendMessage = (
    content: string,
    type?: 'text' | 'image' | 'video' | 'audio' | 'file',
    replyToId?: string,
    mediaFiles?: File[],
  ) => {
    console.log('Mock send message:', { content, type, replyToId, mediaFiles });
    toast.success('Message sent (mock mode)');
  };

  // Send message function
  const handleSendMessage = async (
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text',
    replyToId?: string,
    mediaFiles?: File[],
  ) => {
    if (!useApi) {
      mockSendMessage(content, type, replyToId, mediaFiles);
      return;
    }

    try {
      let attachmentUrl: string | undefined;

      // Upload attachment if needed
      if (mediaFiles && mediaFiles.length > 0) {
        const uploadResult = await uploadAttachment.mutateAsync(mediaFiles[0]);
        attachmentUrl = uploadResult.url;
      }

      // Send message
      await sendMessage.mutateAsync({
        conversationId,
        content,
        type,
        attachmentUrl,
        replyToMessageId: replyToId,
      });
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  // Handle message change
  const handleMessageChange = (value: string) => {
    setMessage(value);

    // Handle typing indicator
    const shouldShowTyping = value.trim().length > 0;

    if (useWebSocketProp && isConnected) {
      // Use WebSocket for typing indicator
      if (!isTyping && shouldShowTyping) {
        setIsTyping(true);
        sendTypingWS(conversationId, true);
        onTyping?.(true);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          sendTypingWS(conversationId, false);
          onTyping?.(false);
        }
      }, 1000);
    } else if (onTyping) {
      // Fallback to callback-based typing indicator
      if (!isTyping && shouldShowTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }, 1000);
    }
  };

  // Handle send message click
  const handleSendClick = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;
    if (disabled) return;

    // Determine message type and content
    let messageType: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text';
    let content = trimmedMessage;

    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      } else {
        messageType = 'file';
      }
    }

    await handleSendMessage(
      content,
      messageType,
      replyTo?.message.id,
      selectedFiles.length > 0 ? selectedFiles : undefined,
    );

    // Clear state
    setMessage('');
    setSelectedFiles([]);
    onCancelReply?.();

    // Stop typing indicator
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // Handle quick file upload (single file)
  const handleQuickFileUpload = (type: 'file' | 'image') => {
    const inputRef = type === 'image' ? imageInputRef : fileInputRef;
    inputRef.current?.click();
  };

  // Handle quick file change
  const handleQuickFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image or video
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setSelectedFiles([file]);
    } else {
      // For other files, send immediately
      await handleSendMessage(`📎 ${file.name}`, 'file', replyTo?.message.id, [
        file,
      ]);
    }

    // Reset input
    e.target.value = '';
  };

  // Handle media upload from dialog
  const handleMediaUpload = async (files: File[], caption?: string) => {
    const content = caption || '';
    const messageType = files[0].type.startsWith('image/') ? 'image' : 'video';

    await handleSendMessage(content, messageType, replyTo?.message.id, files);
  };

  // Add emoji to message
  const addEmoji = () => {
    const emojis = ['😊', '👍', '❤️', '😂', '🔥', '👏', '🎉'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage((prev) => prev + randomEmoji);
  };

  // Handle voice recording (placeholder)
  const handleVoiceRecord = async () => {
    // In a real app, you would implement voice recording
    await handleSendMessage('🎙️ Voice message', 'audio', replyTo?.message.id);
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend =
    (message.trim().length > 0 || selectedFiles.length > 0) && !disabled;

  return (
    <div className={cn('bg-background', className)}>
      {/* Reply preview */}
      {replyTo && onCancelReply && (
        <ReplyPreview
          replyTo={replyTo}
          onCancel={onCancelReply}
          className="mx-4 mt-2"
        />
      )}

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              📎 {selectedFiles[0].name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSelectedFile(0)}
              className="h-4 w-4 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="p-4 border-t">
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          className="hidden"
          onChange={handleQuickFileChange}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleQuickFileChange}
        />

        {/* Input container */}
        <div className="flex items-end space-x-3">
          {/* Attachment buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title="Send photos or videos"
            >
              <Image className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickFileUpload('file')}
              disabled={disabled}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[120px] resize-none border-none bg-secondary/50 focus-visible:ring-1 pr-12"
              rows={1}
            />

            {/* Emoji button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={addEmoji}
              disabled={disabled}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Send/Voice button */}
          {canSend ? (
            <Button
              onClick={handleSendClick}
              disabled={
                disabled || sendMessage.isPending || uploadAttachment.isPending
              }
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              title="Send message"
            >
              {sendMessage.isPending || uploadAttachment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceRecord}
              disabled={disabled}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title="Record voice message"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Typing indicator placeholder */}
        {isTyping && (
          <div className="mt-2 text-xs text-muted-foreground">Typing...</div>
        )}
      </div>

      {/* Image upload dialog */}
      <ImageUploadDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onSend={handleMediaUpload}
        maxFiles={10}
      />
    </div>
  );
}
