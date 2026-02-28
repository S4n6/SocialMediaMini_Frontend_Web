'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import MediaUploadStep from './MediaUploadStep';
import PostDetailsStep from './PostDetailsStep';
import ShareStep from './ShareStep';
import {
  PostCreationStep,
  MediaFile,
  PostFormData,
} from '../../types/create-post.types';
import {
  transformPostFormToPayload,
  validatePostForm,
} from '../../utils/post-form.utils';
import { usePostsMutation } from '../../hooks/usePosts';
import { useDirectUpload } from '../../hooks/useDirectUpload';
import {
  UploadProgressDisplay,
  uploadStateToDisplayStep,
} from '../UploadProgressDisplay';
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

  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  // ── Mutations: only responsible for POST /posts ──────────────────────────
  const { createPost } = usePostsMutation();

  // ── Upload FSM: presigned URL → S3 XHR → SSE confirmation ───────────────
  const {
    uploadState,
    files: uploadFiles,
    overallProgress,
    error: uploadError,
    isUploading,
    upload,
    abort,
    reset: resetUpload,
  } = useDirectUpload({
    onError: (msg) => toast.error(msg),
  });

  const resetForm = useCallback(() => {
    setCurrentStep('upload');
    setMediaFiles([]);
    setPostData({
      caption: '',
      location: '',
      tags: [],
      privacy: 'public',
      accessibility: '',
      advancedSettings: { hideViewsAndLikes: false, turnOffComments: false },
    });
    resetUpload();
  }, [resetUpload]);

  // Block close during upload — show confirmation instead.
  const handleClose = useCallback(() => {
    if (isUploading) {
      setShowAbortConfirm(true);
      return;
    }
    resetForm();
    onOpenChange(false);
  }, [isUploading, resetForm, onOpenChange]);

  const handleAbortConfirmed = useCallback(() => {
    abort();
    setShowAbortConfirm(false);
    resetForm();
    onOpenChange(false);
  }, [abort, resetForm, onOpenChange]);

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

  // ── Double-submit guard: disabled while uploading or mutating ────────────
  const isBusy = isUploading || createPost.isPending;

  const handleShare = useCallback(async () => {
    // Guard: prevent double-submit
    if (isBusy) return;

    // 1. Validate
    const validation = validatePostForm(postData, mediaFiles);
    if (!validation.isValid) {
      toast.error(validation.errors.join(' · '));
      return;
    }

    try {
      // 2. Upload files to S3 and wait for SSE backend confirmation
      const rawFiles = mediaFiles.map((mf) => mf.file);
      const uploadedUrls = await upload(rawFiles);

      // 3. Build the API payload with the confirmed CDN URLs from backend
      const payload = await transformPostFormToPayload(
        postData,
        mediaFiles,
        // Inject the already-uploaded URLs so no second upload happens
        async () => uploadedUrls,
      );

      // 4. Create the post record in the backend DB
      createPost.mutate(
        { payload },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        },
      );
    } catch (error) {
      // upload() rejects on abort or hard failure — error toast already shown
      // by the onError callback in useDirectUpload.
      console.error('[handleShare] upload failed:', error);
    }
  }, [
    isBusy,
    postData,
    mediaFiles,
    upload,
    createPost,
    resetForm,
    onOpenChange,
  ]);

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
    <>
      {/* Abort confirmation – shown only when user tries to close during upload */}
      <AlertDialog open={showAbortConfirm} onOpenChange={setShowAbortConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel upload?</AlertDialogTitle>
            <AlertDialogDescription>
              Your files are still uploading. Closing now will cancel the upload
              and your post will not be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep uploading</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbortConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={handleClose}>
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
                  disabled={isBusy}
                  className="p-2 h-auto hover:bg-muted rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  disabled={!canProceed() || isBusy}
                  className="bg-primary hover:bg-[var(--color-primary)]/90 text-white px-6 py-2 rounded-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
                >
                  Next
                </Button>
              )}

              {currentStep === 'share' && (
                <Button
                  onClick={handleShare}
                  disabled={isBusy}
                  className="bg-accent-gradient hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold text-base transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isBusy ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploadState === 'waiting_for_sse'
                        ? 'Processing...'
                        : 'Uploading...'}
                    </span>
                  ) : (
                    'Share'
                  )}
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
                isLoading={isBusy}
              />
            )}
          </div>

          {/* Upload Progress — visible for all non-idle states */}
          {uploadState !== 'idle' && (
            <div className="border-t bg-theme p-4">
              <UploadProgressDisplay
                currentStep={uploadStateToDisplayStep(uploadState)}
                progress={{
                  overall: overallProgress,
                  files: uploadFiles.map((f) => ({
                    name: f.name,
                    progress: f.progress,
                    status: f.status,
                  })),
                }}
                error={uploadError ?? createPost.error?.message}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
