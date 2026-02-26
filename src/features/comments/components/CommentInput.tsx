'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommentInputProps } from '../types';

export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder = 'Bình luận...',
  onSubmit,
  onCancel,
  autoFocus = false,
  size = 'md',
  className = '',
  disabled = false,
  maxLength = 500,
}) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() && !disabled) {
      onSubmit?.(content.trim());
      setContent('');
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    onCancel?.();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (maxLength && newContent.length <= maxLength) {
      setContent(newContent);
    } else if (!maxLength) {
      setContent(newContent);
    }
  };

  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-3 px-4',
  };

  const buttonSizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };

  const remainingChars = maxLength ? maxLength - content.length : null;
  const isNearLimit = remainingChars !== null && remainingChars < 50;

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'flex items-start gap-3 p-3 border border-gray-200 rounded-lg transition-colors',
          isFocused && 'border-blue-300 bg-blue-50/30',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Comment input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !content.trim() && setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none border-none outline-none bg-transparent placeholder-gray-500',
              sizeClasses[size],
              'min-h-[20px] max-h-32 overflow-y-auto',
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />

          {/* Character counter */}
          {maxLength && (isFocused || content.length > 0) && (
            <div
              className={cn(
                'text-xs mt-1 text-right',
                isNearLimit ? 'text-orange-500' : 'text-gray-400',
              )}
            >
              {content.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="p-1 h-auto text-gray-400 hover:text-gray-600"
          >
            <Smile className="w-4 h-4" />
          </Button>

          {/* Submit button */}
          {(content.trim() || isFocused) && (
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || disabled}
              size="sm"
              className={cn(
                'font-semibold transition-all',
                buttonSizeClasses[size],
                content.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              {size === 'sm' ? <Send className="w-3 h-3" /> : 'Đăng'}
            </Button>
          )}
        </div>
      </div>

      {/* Cancel button for replies */}
      {(isFocused || content.trim()) && onCancel && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Hủy
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentInput;
