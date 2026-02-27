'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import MediaUploadStep from './MediaUploadStep';
import PostDetailsStep from './PostDetailsStep';
import ShareStep from './ShareStep';
import {
  PostCreationStep,
  MediaFile,
  PostFormData,
  CreatePostPayload,
} from '../../types/create-post.types';
import {
  transformPostFormToPayload,
  validatePostForm,
} from '../../utils/post-form.utils';
import { usePostsMutation } from '../../hooks/usePosts';
import { UploadProgressDisplay } from '../UploadProgressDisplay';
import { toast } from 'sonner';

export interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePostDialog({
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const [currentStep, setCurrentStep] = useState<PostCreationStep>('upload');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [postData, setPostData] = useState<PostFormData>({
    caption: '',
    location: '',
    tags: [],
    privacy: 'public',
    accessibility: '',
    advancedSettings: {
      hideViewsAndLikes: false,
      turnOffComments: false,
    },
  });

  // Enhanced hook with progress tracking
  const { createPost, progress, isUploading, resetProgress } =
    usePostsMutation();

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep('upload');
    setMediaFiles([]);
    setPostData({
      caption: '',
      location: '',
      tags: [],
      privacy: 'public',
      accessibility: '',
      advancedSettings: {
        hideViewsAndLikes: false,
        turnOffComments: false,
      },
    });

    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep === 'upload') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      setCurrentStep('share');
    }
  };

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('upload');
    } else if (currentStep === 'share') {
      setCurrentStep('details');
    }
  };

  const handleShare = async () => {
    try {
      // Validate form data
      const validation = validatePostForm(postData, mediaFiles);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        // TODO: Show validation errors to user with toast/alert
        return;
      }

      // Transform to API payload (now async – uploads files first)
      const payload = await transformPostFormToPayload(postData, mediaFiles);

      // Files have already been uploaded inside transformPostFormToPayload,
      // so we no longer need to pass raw files separately.
      createPost.mutate(
        {
          payload,
        },
        {
          onSuccess: () => {
            // Reset UI and close dialog after successful creation
            setCurrentStep('upload');
            setMediaFiles([]);
            setPostData({
              caption: '',
              location: '',
              tags: [],
              privacy: 'public',
              accessibility: '',
              advancedSettings: {
                hideViewsAndLikes: false,
                turnOffComments: false,
              },
            });

            // Reset upload progress UI
            resetProgress();

            // Close dialog
            onOpenChange(false);

            // Show success toast
            toast.success('Post created successfully');
          },
        },
      );

      // Success callback will handle closing and cleanup
    } catch (error) {
      console.error('Failed to create post:', error);
      // Error handling is done in the mutation onError callback
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Create new post';
      case 'details':
        return 'New post';
      case 'share':
        return 'Share post';
      default:
        return 'Create new post';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return true;
      case 'details':
        // For details step, require either media files or caption
        return mediaFiles.length > 0 || postData.caption.trim().length > 0;
      case 'share':
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[60vw] h-[90vh] bg-theme border-theme overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-4 border-b border-theme space-y-0 bg-card shadow-sm relative p-4">
          <div className="flex items-center gap-3 flex-1">
            {currentStep !== 'upload' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 h-auto hover:bg-muted rounded-full transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-theme" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold text-theme">
              {getStepTitle()}
            </DialogTitle>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-auto hover:bg-muted rounded-full transition-colors duration-200 z-10"
          >
            <X className="w-5 h-5 text-theme" />
          </Button>

          <div className="flex items-center gap-3 mr-12">
            {currentStep !== 'share' && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary hover:bg-[var(--color-primary)]/90 text-white px-6 py-2 rounded-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
              >
                Next
              </Button>
            )}

            {currentStep === 'share' && (
              <Button
                onClick={handleShare}
                className="bg-accent-gradient hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold text-base transition-all duration-200 hover:shadow-lg"
              >
                Share
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-3 md:p-5 bg-theme overflow-y-auto">
          {currentStep === 'upload' && (
            <MediaUploadStep
              mediaFiles={mediaFiles}
              onMediaFilesChange={setMediaFiles}
              postData={postData}
              onPostDataChange={setPostData}
            />
          )}

          {currentStep === 'details' && (
            <PostDetailsStep
              mediaFiles={mediaFiles}
              postData={postData}
              onPostDataChange={setPostData}
            />
          )}

          {currentStep === 'share' && (
            <ShareStep
              mediaFiles={mediaFiles}
              postData={postData}
              onShare={handleShare}
              isLoading={createPost.isPending || isUploading}
            />
          )}
        </div>

        {/* Upload Progress Display - positioned at bottom */}
        {isUploading && progress && progress.files.length > 0 && (
          <div className="border-t bg-theme p-4">
            <UploadProgressDisplay
              currentStep="uploading"
              progress={progress}
              error={createPost.error?.message}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
