'use client';

import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Image, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: 'text' | 'image' | 'video' | 'audio' | 'file',
  ) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Message...',
  className = '',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle message change
  const handleMessageChange = (value: string) => {
    setMessage(value);

    // Handle typing indicator
    if (onTyping) {
      if (!isTyping && value.trim()) {
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

  // Handle send message
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage, 'text');
    setMessage('');

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
      handleSendMessage();
    }
  };

  // Handle file upload
  const handleFileUpload = (type: 'file' | 'image') => {
    const inputRef = type === 'image' ? imageInputRef : fileInputRef;
    inputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'file' | 'image',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file and get a URL
    // For now, we'll just send a placeholder message
    const fileType = type === 'image' ? 'image' : 'file';
    onSendMessage(`📎 ${file.name}`, fileType);

    // Reset input
    e.target.value = '';
  };

  // Handle emoji click (placeholder)
  const handleEmojiClick = () => {
    // In a real app, you would open an emoji picker
    // For now, just add a simple emoji
    const emojis = ['😊', '👍', '❤️', '😂', '🔥', '👏', '🎉'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage((prev) => prev + randomEmoji);
  };

  // Handle voice recording (placeholder)
  const handleVoiceRecord = () => {
    // In a real app, you would implement voice recording
    onSendMessage('🎙️ Voice message', 'audio');
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={cn('p-4 border-t bg-background', className)}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'file')}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />

      {/* Input container */}
      <div className="flex items-end space-x-3">
        {/* Attachment buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFileUpload('image')}
            disabled={disabled}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          >
            <Image className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFileUpload('file')}
            disabled={disabled}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
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
            onClick={handleEmojiClick}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-primary"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send/Voice button */}
        {canSend ? (
          <Button
            onClick={handleSendMessage}
            disabled={disabled}
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceRecord}
            disabled={disabled}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
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
  );
}
