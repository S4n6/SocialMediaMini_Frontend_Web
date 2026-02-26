'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Download,
  Eye,
  Clock,
  Users,
  Globe,
  Lock,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';

interface StoryPreviewProps {
  storyData: {
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    content?: string;
    filter?: any;
    textOverlays?: any[];
  };
  currentUser?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  onPublish: () => void;
  isPublishing: boolean;
  onError: (error: string) => void;
}

type PrivacyOption = 'public' | 'followers' | 'close-friends' | 'private';

interface PrivacySetting {
  id: PrivacyOption;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PRIVACY_OPTIONS: PrivacySetting[] = [
  {
    id: 'public',
    label: 'Everyone',
    description: 'Anyone can see your story',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-blue-500',
  },
  {
    id: 'followers',
    label: 'Followers',
    description: 'Only your followers can see',
    icon: <Users className="w-5 h-5" />,
    color: 'text-green-500',
  },
  {
    id: 'close-friends',
    label: 'Close Friends',
    description: 'Only close friends can see',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-pink-500',
  },
  {
    id: 'private',
    label: 'Only Me',
    description: 'Only you can see this story',
    icon: <Lock className="w-5 h-5" />,
    color: 'text-gray-500',
  },
];

export const StoryPreview: React.FC<StoryPreviewProps> = ({
  storyData,
  currentUser,
  onPublish,
  isPublishing,
  onError,
}) => {
  const [privacy, setPrivacy] = useState<PrivacyOption>('followers');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [allowReplies, setAllowReplies] = useState(true);
  const [allowSharing, setAllowSharing] = useState(true);
  const [caption, setCaption] = useState(storyData.content || '');
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const privacyMenuRef = useRef<HTMLDivElement>(null);

  // Close privacy menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        privacyMenuRef.current &&
        !privacyMenuRef.current.contains(event.target as Node)
      ) {
        setShowPrivacyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPrivacy = PRIVACY_OPTIONS.find(
    (option) => option.id === privacy,
  )!;

  const handleDownload = async () => {
    if (!storyData.mediaUrl) return;

    try {
      const response = await fetch(storyData.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `story-${Date.now()}.${storyData.mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      onError('Failed to download story');
    }
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Story Preview */}
      <div className="relative flex-1 bg-black">
        {/* User Header - Instagram style */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
              <img
                src={currentUser?.avatar || '/default-avatar.png'}
                alt={currentUser?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-white font-medium text-sm">
                {currentUser?.username || 'username'}
              </div>
              <div className="text-white/70 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Now
              </div>
            </div>
          </div>

          <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-2 left-4 right-4 z-10">
          <div className="h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Media Content */}
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={
            storyData.mediaType === 'video' ? handleVideoToggle : undefined
          }
        >
          {storyData.mediaType === 'image' ? (
            <img
              src={storyData.mediaUrl}
              alt="Story preview"
              className="w-full h-full object-cover"
              style={{ filter: storyData.filter?.cssFilter || 'none' }}
            />
          ) : (
            <video
              ref={videoRef}
              src={storyData.mediaUrl}
              className="w-full h-full object-cover"
              style={{ filter: storyData.filter?.cssFilter || 'none' }}
              autoPlay
              muted
              loop
              controls={false}
            />
          )}
        </div>

        {/* Text Overlays */}
        {storyData.textOverlays?.map((textOverlay) => (
          <div
            key={textOverlay.id}
            className="absolute select-none pointer-events-none"
            style={{
              left: `${textOverlay.x}%`,
              top: `${textOverlay.y}%`,
              transform: `translate(-50%, -50%) rotate(${textOverlay.rotation}deg)`,
              fontSize: `${textOverlay.fontSize}px`,
              color: textOverlay.color,
              backgroundColor: textOverlay.backgroundColor,
              fontFamily: textOverlay.fontFamily,
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              padding: textOverlay.backgroundColor ? '4px 8px' : '0',
              borderRadius: textOverlay.backgroundColor ? '4px' : '0',
            }}
          >
            {textOverlay.text}
          </div>
        ))}

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between">
            {/* Interaction Buttons */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <Heart className="w-6 h-6 text-white" />
              </button>
              <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
              <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <Share className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* View Indicator */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Options */}
      <div
        className="p-4 space-y-4 border-t"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-card)',
        }}
      >
        {/* Caption Input */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-foreground)' }}
          >
            Add a caption (optional)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={2}
            className="w-full p-3 border rounded-lg resize-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-input)',
              color: 'var(--color-foreground)',
            }}
            maxLength={200}
          />
          <div
            className="text-xs mt-1 opacity-60"
            style={{ color: 'var(--color-foreground)' }}
          >
            {caption.length}/200
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="relative" ref={privacyMenuRef}>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-foreground)' }}
          >
            Who can see this?
          </label>
          <button
            onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            className="w-full flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-gray-50"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-input)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className={selectedPrivacy.color}>
                {selectedPrivacy.icon}
              </span>
              <div className="text-left">
                <div
                  className="font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {selectedPrivacy.label}
                </div>
                <div
                  className="text-sm opacity-60"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {selectedPrivacy.description}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${showPrivacyMenu ? 'rotate-180' : ''}`}
              style={{ color: 'var(--color-foreground)' }}
            />
          </button>

          {/* Privacy Menu */}
          {showPrivacyMenu && (
            <div
              className="absolute top-full left-0 right-0 mt-1 py-2 border rounded-lg shadow-lg z-20"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)',
              }}
            >
              {PRIVACY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setPrivacy(option.id);
                    setShowPrivacyMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    privacy === option.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className={option.color}>{option.icon}</span>
                  <div className="text-left">
                    <div
                      className="font-medium"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      {option.label}
                    </div>
                    <div
                      className="text-sm opacity-60"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-foreground)' }}
            >
              Allow replies
            </span>
            <input
              type="checkbox"
              checked={allowReplies}
              onChange={(e) => setAllowReplies(e.target.checked)}
              className="rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-foreground)' }}
            >
              Allow sharing
            </span>
            <input
              type="checkbox"
              checked={allowSharing}
              onChange={(e) => setAllowSharing(e.target.checked)}
              className="rounded"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Download className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Share to Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
