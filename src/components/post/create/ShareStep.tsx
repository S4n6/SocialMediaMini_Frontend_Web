"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaFile, PostData } from "./CreatePostDialog";
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
} from "lucide-react";

interface ShareStepProps {
  mediaFiles: MediaFile[];
  postData: PostData;
}

export default function ShareStep({ mediaFiles, postData }: ShareStepProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Mock user data - replace with actual user data
  const user = {
    id: "1",
    username: "user123",
    fullName: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facepad&facepad=2&w=256&h=256&q=80",
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsShared(true);
    } catch (error) {
      console.error("Failed to share post:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (isShared) {
    return (
      <div className="h-full flex items-center justify-center bg-theme">
        <Card className="text-center space-y-8 max-w-lg mx-auto p-8 shadow-none border-0 bg-card/80 backdrop-blur-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-theme">
              Post Shared Successfully! 🎉
            </h3>
            <p className="text-lg text-theme/70 leading-relaxed">
              Your post is now live and visible to your followers. Great content
              deserves to be shared!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 py-3 text-base border-2 border-theme hover:bg-muted transition-all duration-200"
            >
              View Post
            </Button>
            <Button className="flex-1 py-3 text-base bg-accent-gradient hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl">
              Create Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-accent-gradient text-white font-bold">
                  {user.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-theme text-lg">
                  {user.fullName}
                </p>
                <p className="text-theme/60">@{user.username}</p>
              </div>
            </div>

            {/* Media Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  {mediaFiles[0]?.type === "image" ? (
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
                  {mediaFiles[0]?.type === "image" ? "Images" : "Videos"} ready
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
                    <p className="font-medium text-gray-900 dark:text-white">
                      Location
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
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
            disabled={isSharing}
            className="w-full py-4 text-lg font-bold bg-accent-gradient hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {isSharing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sharing Your Amazing Post...</span>
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
