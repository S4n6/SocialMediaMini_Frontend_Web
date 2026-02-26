'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Upload, Camera, Smile, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (files: File[], caption?: string) => void;
  maxFiles?: number;
}

interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'video';
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onSend,
  maxFiles = 10,
}: ImageUploadDialogProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Clean up URLs when component unmounts or files change
  const cleanupUrls = useCallback(() => {
    files.forEach((file) => URL.revokeObjectURL(file.url));
  }, [files]);

  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FilePreview[] = [];
    const remainingSlots = maxFiles - files.length;
    const filesToProcess = Math.min(selectedFiles.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = selectedFiles[i];

      // Check if it's an image or video
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';

        newFiles.push({ file, url, type });
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.url);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle send
  const handleSend = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Extract the actual File objects
      const fileObjects = files.map((f) => f.file);
      await onSend(fileObjects, caption.trim() || undefined);

      // Clean up and close
      cleanupUrls();
      setFiles([]);
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isUploading) {
      cleanupUrls();
      setFiles([]);
      setCaption('');
      onClose();
    }
  };

  // Add emoji to caption
  const addEmoji = () => {
    const emojis = ['😊', '👍', '❤️', '😂', '🔥', '👏', '🎉', '📸', '✨'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setCaption((prev) => prev + randomEmoji);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Share photos and videos</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Upload area */}
          {files.length === 0 ? (
            <div className="flex-1 p-6">
              <div
                ref={dropRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50',
                )}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Drag photos and videos here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to select from your computer
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Select files
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    You can select up to {maxFiles} files
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          ) : (
            <>
              {/* File previews */}
              <div className="flex-1 p-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                        {file.type === 'image' ? (
                          <Image
                            src={file.url}
                            alt={`Preview ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={file.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                      </div>

                      {/* Remove button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      {/* File type indicator */}
                      {file.type === 'video' && (
                        <div className="absolute bottom-2 left-2 bg-black/50 rounded px-1.5 py-0.5">
                          <span className="text-white text-xs">VIDEO</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add more button */}
                  {files.length < maxFiles && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Add more
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Caption input */}
              <div className="p-4 border-t">
                <div className="relative">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="min-h-[60px] resize-none pr-10"
                    maxLength={500}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addEmoji}
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {caption.length}/500
                  </span>

                  <Button
                    onClick={handleSend}
                    disabled={isUploading || files.length === 0}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isUploading ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden file input for add more */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ImageUploadDialog;
