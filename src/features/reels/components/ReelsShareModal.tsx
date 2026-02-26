'use client';

import React, { useState } from 'react';

/**
 * Share modal component - Instagram 2025 style
 * Multiple sharing options with platform-specific handling
 */

interface ReelsShareModalProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  onShare?: (videoId: string, platform: string) => Promise<void>;
  className?: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export const ReelsShareModal: React.FC<ReelsShareModalProps> = ({
  videoId,
  isVisible,
  onClose,
  onShare,
  className = '',
}) => {
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  // Share handlers
  const handleShare = async (platform: string, shareAction: () => void) => {
    try {
      setIsSharing(platform);
      await shareAction();
      await onShare?.(videoId, platform);

      if (platform === 'link') {
        setShowCopiedFeedback(true);
        setTimeout(() => setShowCopiedFeedback(false), 2000);
      } else {
        onClose();
      }
    } catch (error) {
      console.error(`Failed to share via ${platform}:`, error);
    } finally {
      setIsSharing(null);
    }
  };

  // Share options
  const shareOptions: ShareOption[] = [
    {
      id: 'link',
      name: 'Copy Link',
      color: 'bg-gray-600',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
        </svg>
      ),
      action: async () => {
        const videoUrl = `${window.location.origin}/reels/${videoId}`;
        await navigator.clipboard.writeText(videoUrl);
      },
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      color: 'bg-green-500',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
      ),
      action: () => {
        const text = encodeURIComponent('Check out this amazing reel!');
        const url = encodeURIComponent(
          `${window.location.origin}/reels/${videoId}`,
        );
        window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
      },
    },
    {
      id: 'twitter',
      name: 'Twitter',
      color: 'bg-blue-400',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      action: () => {
        const text = encodeURIComponent('Check out this amazing reel!');
        const url = encodeURIComponent(
          `${window.location.origin}/reels/${videoId}`,
        );
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
          '_blank',
        );
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: 'bg-blue-600',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => {
        const url = encodeURIComponent(
          `${window.location.origin}/reels/${videoId}`,
        );
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          '_blank',
        );
      },
    },
    {
      id: 'instagram',
      name: 'Instagram',
      color: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      action: async () => {
        if (navigator.share) {
          await navigator.share({
            title: 'Check out this Reel!',
            url: `${window.location.origin}/reels/${videoId}`,
          });
        } else {
          // Fallback - copy link
          const videoUrl = `${window.location.origin}/reels/${videoId}`;
          await navigator.clipboard.writeText(videoUrl);
        }
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      color: 'bg-blue-500',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      action: () => {
        const text = encodeURIComponent('Check out this amazing reel!');
        const url = encodeURIComponent(
          `${window.location.origin}/reels/${videoId}`,
        );
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
      },
    },
  ];

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Share Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">Share</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Share Options */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleShare(option.id, option.action)}
                disabled={isSharing === option.id}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                >
                  {isSharing === option.id ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    option.icon
                  )}
                </div>
                <span className="text-white text-xs text-center leading-tight">
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          {/* Copy Link Feedback */}
          {showCopiedFeedback && (
            <div className="mt-4 p-3 bg-green-600 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-white">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span className="text-sm font-medium">
                  Link copied to clipboard!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-center gap-6">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
              </svg>
              <span className="text-sm">More options</span>
            </button>

            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <span className="text-sm">Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
