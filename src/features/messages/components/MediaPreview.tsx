'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Download, ZoomIn, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MediaPreviewProps {
  src: string;
  alt?: string;
  type: 'image' | 'video';
  className?: string;
  showControls?: boolean;
  onClick?: () => void;
}

interface MediaViewerProps {
  src: string;
  alt?: string;
  type: 'image' | 'video';
  isOpen: boolean;
  onClose: () => void;
}

// Full screen media viewer
function MediaViewer({ src, alt, type, isOpen, onClose }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePlayPause = (videoRef: HTMLVideoElement) => {
    if (isPlaying) {
      videoRef.pause();
    } else {
      videoRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Media content */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {type === 'image' ? (
              <div className="relative max-w-full max-h-full">
                <Image
                  src={src}
                  alt={alt || 'Image'}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            ) : (
              <div className="relative max-w-full max-h-full">
                <video
                  ref={(ref) => {
                    if (ref) {
                      ref.onplay = () => setIsPlaying(true);
                      ref.onpause = () => setIsPlaying(false);
                    }
                  }}
                  src={src}
                  controls
                  className="max-w-full max-h-full"
                  onClick={(e) => togglePlayPause(e.currentTarget)}
                />

                {/* Custom play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={cn(
                      'bg-black/50 rounded-full p-4 transition-opacity',
                      isPlaying ? 'opacity-0' : 'opacity-100',
                    )}
                  >
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Media preview in message
export function MediaPreview({
  src,
  alt,
  type,
  className = '',
  showControls = true,
  onClick,
}: MediaPreviewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsViewerOpen(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-secondary/50 rounded-lg p-4 text-center text-muted-foreground max-w-xs',
          className,
        )}
      >
        <div className="text-2xl mb-2">❌</div>
        <p className="text-sm">Failed to load {type}</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('relative group cursor-pointer', className)}>
        {type === 'image' ? (
          <div className="relative rounded-lg overflow-hidden max-w-xs">
            {isLoading && (
              <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            <Image
              src={src}
              alt={alt || 'Shared image'}
              width={300}
              height={200}
              className="w-full h-auto object-cover"
              style={{ aspectRatio: '3/2' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleClick}
            />

            {/* Hover overlay */}
            {showControls && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-black/50 rounded-full p-2">
                  <ZoomIn className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden max-w-xs">
            {isLoading && (
              <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            <video
              src={src}
              className="w-full h-auto object-cover"
              style={{ aspectRatio: '3/2' }}
              onLoadedData={handleImageLoad}
              onError={handleImageError}
              onClick={handleClick}
              muted
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 transition-colors">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>

            {/* Hover overlay */}
            {showControls && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            )}
          </div>
        )}
      </div>

      {/* Full screen viewer */}
      <MediaViewer
        src={src}
        alt={alt}
        type={type}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}

export default MediaPreview;
