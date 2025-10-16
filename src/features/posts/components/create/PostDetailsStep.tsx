'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MediaFile,
  PostFormData,
  PostPrivacy,
} from '../../types/create-post.types';
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
} from 'lucide-react';

interface PostDetailsStepProps {
  mediaFiles: MediaFile[];
  postData: PostFormData;
  onPostDataChange: (data: PostFormData) => void;
}

export default function PostDetailsStep({
  mediaFiles,
  postData,
  onPostDataChange,
}: PostDetailsStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Use current authenticated user from context
  const { user } = useAuthContext();

  // Provide a small fallback for server rendering / unauthenticated state
  const displayUser = user ?? {
    id: '0',
    userName: 'guest',
    fullName: 'Guest',
    avatar: undefined,
  };

  const updatePostData = (updates: Partial<PostFormData>) => {
    onPostDataChange({ ...postData, ...updates });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      updatePostData({
        tags: [...postData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
                <AvatarImage
                  src={displayUser.avatar}
                  alt={displayUser.fullName}
                  className="object-cover"
                />
                <AvatarFallback>
                  {displayUser.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-base text-theme">
                  {displayUser.userName}
                </p>
                <p className="text-theme/70 text-sm">{displayUser.fullName}</p>
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

            {/* Privacy */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2 text-theme">
                <Eye className="w-5 h-5" />
                Who can see this?
              </Label>
              <Select
                value={postData.privacy}
                onValueChange={(value: PostPrivacy) =>
                  updatePostData({ privacy: value })
                }
              >
                <SelectTrigger className="border-theme rounded-lg p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary bg-input text-base">
                  <SelectValue placeholder="Select privacy setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="followers">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Followers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2 text-theme">
                <MapPin className="w-5 h-5" />
                Add location
              </Label>
              <Input
                placeholder="Search locations..."
                value={postData.location || ''}
                onChange={(e) => updatePostData({ location: e.target.value })}
                className="border-theme rounded-lg p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary bg-input text-base text-theme placeholder:text-theme/60"
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
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                    >
                      <span className="select-none">#{tag}</span>
                      <button
                        aria-label={`Remove ${tag}`}
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-white hover:text-red-200 text-sm font-semibold"
                      >
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
                value={postData.accessibility || ''}
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
