'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Smile,
  Type,
  Music,
  MapPin,
  Settings,
  ChevronLeft,
  Send,
  Download,
} from 'lucide-react';
import { MediaCapture } from './MediaCapture';
import { StoryEditor } from './StoryEditor';
import { StoryPreview } from './StoryPreview';
import { useStoryErrorHandler } from '../hooks/useStoryErrorHandler';
import { CreateStoryRequest } from '../types/story';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated?: (story: any) => void;
  currentUser?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

type CreationStep = 'select' | 'capture' | 'edit' | 'preview' | 'publishing';

interface StoryData {
  mediaFile?: File;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  content?: string;
  filters?: any;
  stickers?: any[];
  textOverlays?: any[];
  music?: any;
  location?: any;
}

export const StoryCreationModal: React.FC<StoryCreationModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>('select');
  const [storyData, setStoryData] = useState<StoryData>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const errorHandler = useStoryErrorHandler();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
      setStoryData({});
      errorHandler.clearError();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBack = () => {
    switch (currentStep) {
      case 'capture':
        setCurrentStep('select');
        break;
      case 'edit':
        setCurrentStep('capture');
        break;
      case 'preview':
        setCurrentStep('edit');
        break;
      default:
        onClose();
    }
  };

  const handleMediaSelected = (file: File, type: 'image' | 'video') => {
    setStoryData((prev) => ({
      ...prev,
      mediaFile: file,
      mediaUrl: URL.createObjectURL(file),
      mediaType: type,
    }));
    setCurrentStep('edit');
  };

  const handleEditComplete = (editedData: Partial<StoryData>) => {
    setStoryData((prev) => ({ ...prev, ...editedData }));
    setCurrentStep('preview');
  };

  const handlePublish = async () => {
    if (!storyData.mediaFile) {
      errorHandler.handleError('No media selected', 'Story Creation');
      return;
    }

    try {
      setIsPublishing(true);
      setCurrentStep('publishing');

      const createRequest: CreateStoryRequest = {
        mediaFile: storyData.mediaFile,
        content: storyData.content,
      };

      // This would call your story service
      // const newStory = await StoryService.createStory(createRequest);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onStoryCreated?.(storyData);
      onClose();
    } catch (error) {
      errorHandler.handleError(error, 'Failed to publish story');
      setCurrentStep('preview');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - Instagram style */}
      <div
        className="relative w-full max-w-md h-full max-h-[90vh] mx-4 rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--color-background)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-card)',
          }}
        >
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-foreground)' }}
          >
            {currentStep === 'select' ? (
              <X className="w-6 h-6" />
            ) : (
              <ChevronLeft className="w-6 h-6" />
            )}
          </button>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--color-foreground)' }}
          >
            {currentStep === 'select' && 'Create Story'}
            {currentStep === 'capture' && 'Capture'}
            {currentStep === 'edit' && 'Edit Story'}
            {currentStep === 'preview' && 'Share Story'}
            {currentStep === 'publishing' && 'Publishing...'}
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentStep === 'select' && (
            <StorySelectionScreen
              onCameraClick={() => setCurrentStep('capture')}
              onGalleryClick={() => setCurrentStep('capture')}
            />
          )}

          {currentStep === 'capture' && (
            <MediaCapture
              onMediaSelected={handleMediaSelected}
              onError={(error) =>
                errorHandler.handleError(error, 'Media Capture')
              }
            />
          )}

          {currentStep === 'edit' && storyData.mediaUrl && (
            <StoryEditor
              mediaUrl={storyData.mediaUrl}
              mediaType={storyData.mediaType!}
              initialData={storyData}
              onComplete={handleEditComplete}
              onError={(error) =>
                errorHandler.handleError(error, 'Story Editor')
              }
            />
          )}

          {currentStep === 'preview' && (
            <StoryPreview
              storyData={storyData}
              currentUser={currentUser}
              onPublish={handlePublish}
              isPublishing={isPublishing}
              onError={(error) =>
                errorHandler.handleError(error, 'Story Preview')
              }
            />
          )}

          {currentStep === 'publishing' && (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div
                className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-4"
                style={{ borderColor: 'var(--color-primary)' }}
              />
              <p
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-foreground)' }}
              >
                Publishing your story...
              </p>
              <p
                className="text-sm opacity-60"
                style={{ color: 'var(--color-foreground)' }}
              >
                This may take a few moments
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {errorHandler.error && (
          <div
            className="p-4 border-t"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-card)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span
                className="text-sm"
                style={{ color: 'var(--color-foreground)' }}
              >
                {errorHandler.error}
              </span>
              <button
                onClick={errorHandler.clearError}
                className="ml-auto text-xs opacity-60 hover:opacity-100"
                style={{ color: 'var(--color-foreground)' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Story Selection Screen Component
const StorySelectionScreen: React.FC<{
  onCameraClick: () => void;
  onGalleryClick: () => void;
}> = ({ onCameraClick, onGalleryClick }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCameraClick}
          className="flex flex-col items-center p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-105 hover:shadow-lg"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-muted)',
          }}
        >
          <Camera
            className="w-12 h-12 mb-3"
            style={{ color: 'var(--color-primary)' }}
          />
          <span
            className="font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Camera
          </span>
          <span
            className="text-xs opacity-60 mt-1"
            style={{ color: 'var(--color-foreground)' }}
          >
            Take photo/video
          </span>
        </button>

        <button
          onClick={onGalleryClick}
          className="flex flex-col items-center p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-105 hover:shadow-lg"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-muted)',
          }}
        >
          <ImageIcon
            className="w-12 h-12 mb-3"
            style={{ color: 'var(--color-primary)' }}
          />
          <span
            className="font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Gallery
          </span>
          <span
            className="text-xs opacity-60 mt-1"
            style={{ color: 'var(--color-foreground)' }}
          >
            Choose from library
          </span>
        </button>
      </div>

      {/* Feature Categories - Instagram style */}
      <div className="space-y-4">
        <h3
          className="text-sm font-medium opacity-60 uppercase tracking-wide"
          style={{ color: 'var(--color-foreground)' }}
        >
          Add to your story
        </h3>

        <div className="space-y-3">
          <FeatureButton
            icon={<Type className="w-5 h-5" />}
            title="Text"
            description="Add text with various fonts and colors"
            gradient="from-blue-500 to-purple-600"
          />

          <FeatureButton
            icon={<Smile className="w-5 h-5" />}
            title="Stickers"
            description="Express yourself with fun stickers"
            gradient="from-yellow-500 to-orange-500"
          />

          <FeatureButton
            icon={<Music className="w-5 h-5" />}
            title="Music"
            description="Add a soundtrack to your story"
            gradient="from-green-500 to-teal-500"
          />

          <FeatureButton
            icon={<MapPin className="w-5 h-5" />}
            title="Location"
            description="Tag your location"
            gradient="from-red-500 to-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

// Feature Button Component
const FeatureButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => {
  return (
    <button className="flex items-center w-full p-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-md">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${gradient} text-white mr-3`}
      >
        {icon}
      </div>
      <div className="text-left">
        <div
          className="font-medium"
          style={{ color: 'var(--color-foreground)' }}
        >
          {title}
        </div>
        <div
          className="text-sm opacity-60"
          style={{ color: 'var(--color-foreground)' }}
        >
          {description}
        </div>
      </div>
    </button>
  );
};
