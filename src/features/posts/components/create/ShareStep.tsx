'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Users,
  Eye,
  MessageCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  Upload,
} from 'lucide-react';
import { MediaFile, PostFormData } from '../../types/create-post.types';

interface ShareStepProps {
  mediaFiles: MediaFile[];
  postData: PostFormData;
  onShare: () => void;
  isLoading?: boolean;
}

export default function ShareStep({
  mediaFiles,
  postData,
  onShare,
  isLoading = false,
}: ShareStepProps) {
  const { user } = useAuthContext();

  const handleShare = () => {
    onShare();
  };

  return (
    <div className="h-full flex items-center justify-center bg-theme">
      <div className="w-full max-w-2xl mx-auto">
        {/* Main Share Card */}
        <Card className="p-8 border-0 bg-card/90 backdrop-blur-sm shadow-none">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-theme mb-2">
              Ready to Share!
            </h2>
            <p className="text-lg text-theme/70">
              Your post looks amazing and is ready to go live
            </p>
          </div>

          {/* Post Summary */}
          <div className="space-y-6 mb-8">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                <AvatarImage
                  src={user?.avatar}
                  style={{
                    objectFit: 'cover',
                  }}
                />
                <AvatarFallback className="bg-accent-gradient text-white font-bold">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-theme text-lg">
                  {user?.fullName}
                </p>
                <p className="text-theme/60">@{user?.username}</p>
              </div>
            </div>

            {/* Media Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  {mediaFiles[0]?.type === 'image' ? (
                    <ImageIcon className="w-6 h-6 text-primary" />
                  ) : (
                    <Video className="w-6 h-6 text-primary" />
                  )}
                  <span className="font-semibold text-theme">Media Files</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {mediaFiles.length}
                </p>
                <p className="text-sm text-theme/60">
                  {mediaFiles[0]?.type === 'image' ? 'Images' : 'Videos'} ready
                  to share
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-theme">Caption</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {postData.caption ? postData.caption.length : 0}
                </p>
                <p className="text-sm text-theme/60">Characters written</p>
              </div>
            </div>

            {/* Post Details */}
            <div className="space-y-4">
              {postData.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-theme dark:text-white">
                      Location
                    </p>
                    <p className="text-theme dark:text-gray-400">
                      {postData.location}
                    </p>
                  </div>
                </div>
              )}

              {postData.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-blue-500">#</span> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {postData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-sm"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {postData.accessibility && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Users className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Accessibility
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {postData.accessibility}
                    </p>
                  </div>
                </div>
              )}

              {(postData.advancedSettings?.hideViewsAndLikes ||
                postData.advancedSettings?.turnOffComments) && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Privacy Settings
                  </p>
                  <div className="space-y-1">
                    {postData.advancedSettings.hideViewsAndLikes && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span>Views and likes are hidden</span>
                      </div>
                    )}
                    {postData.advancedSettings.turnOffComments && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                        <span>Comments are disabled</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            disabled={isLoading}
            className="w-full py-4 text-lg font-bold bg-accent-gradient hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Your Amazing Post...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5" />
                <span>Share Post Now</span>
              </div>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
