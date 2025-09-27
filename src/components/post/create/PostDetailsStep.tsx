"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MediaFile, PostData } from "./CreatePostDialog";
import {
  MapPin,
  Hash,
  Users,
  Settings,
  Eye,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils/cn-tailwind";

interface PostDetailsStepProps {
  mediaFiles: MediaFile[];
  postData: PostData;
  onPostDataChange: (data: PostData) => void;
}

export default function PostDetailsStep({
  mediaFiles,
  postData,
  onPostDataChange,
}: PostDetailsStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Mock user data - replace with actual user data
  const user = {
    id: "1",
    username: "user123",
    fullName: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facepad&facepad=2&w=256&h=256&q=80",
  };

  const updatePostData = (updates: Partial<PostData>) => {
    onPostDataChange({ ...postData, ...updates });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      updatePostData({
        tags: [...postData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    updatePostData({
      tags: postData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="h-full flex flex-col gap-4 mb-4">
      {/* Form section - Compact form below the large slideshow */}
      <div className="bg-card rounded-2xl border-theme">
        <div className="p-6 h-full overflow-y-auto">
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-base text-theme">
                  {user.username}
                </p>
                <p className="text-theme/70 text-sm">{user.fullName}</p>
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2 text-theme">
                <Smile className="w-5 h-5" />
                Write a caption
              </Label>
              <Textarea
                placeholder="Write a caption..."
                value={postData.caption}
                onChange={(e) => updatePostData({ caption: e.target.value })}
                className="min-h-[100px] resize-none border-theme rounded-lg p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary bg-input text-base"
                maxLength={2200}
              />
              <div className="text-sm text-theme/60 text-right">
                {postData.caption.length}/2,200
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2 text-theme">
                <MapPin className="w-5 h-5" />
                Add location
              </Label>
              <Input
                placeholder="Search locations..."
                value={postData.location || ""}
                onChange={(e) => updatePostData({ location: e.target.value })}
                className="border-theme rounded-lg p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary bg-input text-base"
              />
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2 text-theme">
                <Hash className="w-5 h-5" />
                Add tags
              </Label>

              {/* Tag Input */}
              <div className="flex gap-3">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border-theme rounded-lg p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary bg-input text-base"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  size="sm"
                  disabled={!tagInput.trim()}
                  className="bg-primary hover:bg-[var(--color-primary)]/90 text-white px-6 py-2 text-base font-medium"
                >
                  Add
                </Button>
              </div>

              {/* Tags Display */}
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {postData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag}
                      <button className="ml-1 hover:text-red-500 text-lg font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Accessibility */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2 text-theme">
                <Users className="w-5 h-5" />
                Accessibility
              </Label>
              <Textarea
                placeholder="Write alt text..."
                value={postData.accessibility || ""}
                onChange={(e) =>
                  updatePostData({ accessibility: e.target.value })
                }
                className="min-h-[80px] resize-none border-theme rounded-lg p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary bg-input text-base"
                maxLength={125}
              />
              <p className="text-sm text-theme/60">
                Alt text describes your photos for people with visual
                impairments.
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full justify-between p-4 h-auto text-base font-semibold hover:bg-muted rounded-lg text-theme"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced settings
                </span>
                {showAdvancedSettings ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>

              {showAdvancedSettings && (
                <Card className="p-6 space-y-6 border-theme rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-theme/60" />
                      <Label className="text-base font-medium text-theme">
                        Hide like and view counts
                      </Label>
                    </div>
                    <Checkbox
                      checked={
                        postData.advancedSettings?.hideViewsAndLikes || false
                      }
                      onCheckedChange={(checked: boolean) =>
                        updatePostData({
                          advancedSettings: {
                            ...postData.advancedSettings,
                            hideViewsAndLikes: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-theme/60" />
                      <Label className="text-base font-medium text-theme">
                        Turn off commenting
                      </Label>
                    </div>
                    <Checkbox
                      checked={
                        postData.advancedSettings?.turnOffComments || false
                      }
                      onCheckedChange={(checked: boolean) =>
                        updatePostData({
                          advancedSettings: {
                            ...postData.advancedSettings,
                            turnOffComments: checked,
                          },
                        })
                      }
                    />
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
