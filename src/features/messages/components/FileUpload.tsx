'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Paperclip,
  Image,
  FileText,
  Video,
  Music,
  File,
  X,
  Download,
  Eye,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  uploadProgress?: number;
  duration?: number; // For audio/video files
  uploaded?: boolean;
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  onFileRemove: (fileId: string) => void;
  onFileUpload?: (file: FileAttachment) => Promise<string>; // Returns uploaded URL
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  onFileUpload,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  acceptedTypes = [
    'image/*',
    'video/*',
    'audio/*',
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
  ],
  className = '',
}: FileUploadProps) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document'))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isValidFileType = (file: File) => {
    return acceptedTypes.some((type) => {
      if (type === '*') return true;
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });
  };

  const createFileAttachment = (file: File): FileAttachment => {
    const attachment: FileAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
      uploaded: false,
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === attachment.id
              ? { ...att, preview: e.target?.result as string }
              : att,
          ),
        );
      };
      reader.readAsDataURL(file);
    }

    return attachment;
  };

  const handleFileSelection = useCallback(
    (files: File[]) => {
      const validFiles: FileAttachment[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        // Check file count
        if (attachments.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Check file size
        if (file.size > maxFileSize) {
          errors.push(
            `${file.name} is too large (max ${formatFileSize(maxFileSize)})`,
          );
          return;
        }

        // Check file type
        if (!isValidFileType(file)) {
          errors.push(`${file.name} type not supported`);
          return;
        }

        validFiles.push(createFileAttachment(file));
      });

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      if (validFiles.length > 0) {
        const newAttachments = [...attachments, ...validFiles];
        setAttachments(newAttachments);
        onFilesSelected(newAttachments);

        // Auto-upload if handler provided
        if (onFileUpload) {
          validFiles.forEach(uploadFile);
        }
      }
    },
    [attachments, maxFiles, maxFileSize, onFilesSelected, onFileUpload],
  );

  const uploadFile = async (attachment: FileAttachment) => {
    if (!onFileUpload) return;

    try {
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachment.id ? { ...att, uploadProgress: 0 } : att,
        ),
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === attachment.id &&
            att.uploadProgress !== undefined &&
            att.uploadProgress < 90
              ? { ...att, uploadProgress: att.uploadProgress + 10 }
              : att,
          ),
        );
      }, 200);

      const url = await onFileUpload(attachment);

      clearInterval(progressInterval);

      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachment.id
            ? { ...att, url, uploadProgress: 100, uploaded: true }
            : att,
        ),
      );

      toast.success(`${attachment.name} uploaded successfully`);
    } catch (error) {
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachment.id
            ? { ...att, error: 'Upload failed', uploadProgress: undefined }
            : att,
        ),
      );
      toast.error(`Failed to upload ${attachment.name}`);
    }
  };

  const removeFile = (fileId: string) => {
    const newAttachments = attachments.filter((att) => att.id !== fileId);
    setAttachments(newAttachments);
    onFileRemove(fileId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {formatFileSize(maxFileSize)} per file, {maxFiles} files max
            </p>
          </div>
        </div>
      </div>

      {/* Attachment Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="mt-2"
      >
        <Paperclip className="h-4 w-4 mr-2" />
        Add Files
      </Button>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {attachments.map((attachment) => (
            <FileAttachmentItem
              key={attachment.id}
              attachment={attachment}
              onRemove={() => removeFile(attachment.id)}
              onRetry={onFileUpload ? () => uploadFile(attachment) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual file attachment component
function FileAttachmentItem({
  attachment,
  onRemove,
  onRetry,
}: {
  attachment: FileAttachment;
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document'))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-center gap-3">
          {/* Preview or Icon */}
          <div className="flex-shrink-0">
            {attachment.preview ? (
              <img
                src={attachment.preview}
                alt={attachment.name}
                className="h-12 w-12 object-cover rounded"
              />
            ) : (
              <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                {getFileIcon(attachment.type)}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.size)}
            </p>

            {/* Upload Progress */}
            {attachment.uploadProgress !== undefined &&
              !attachment.uploaded && (
                <div className="mt-2">
                  <Progress value={attachment.uploadProgress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {attachment.uploadProgress}% uploaded
                  </p>
                </div>
              )}

            {/* Upload Status */}
            {attachment.uploaded && (
              <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
            )}

            {attachment.error && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {attachment.error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {attachment.url && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(attachment.url, '_blank')}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}

            {attachment.error && onRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-8 w-8 p-0"
              >
                <Upload className="h-3 w-3" />
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
