"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MediaFile, PostData } from "./CreatePostDialog";
import {
  Image,
  Video,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils/cn-tailwind";
import { Textarea } from "@/components/ui/textarea";

interface MediaUploadStepProps {
  mediaFiles: MediaFile[];
  onMediaFilesChange: (files: MediaFile[]) => void;
  postData: PostData;
  onPostDataChange: (data: PostData) => void;
}

export default function MediaUploadStep({
  mediaFiles,
  onMediaFilesChange,
  postData,
  onPostDataChange,
}: MediaUploadStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const acceptedFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    const newFiles: MediaFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    onMediaFilesChange([...mediaFiles, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeFile = (id: string) => {
    const newFiles = mediaFiles.filter((file) => file.id !== id);
    onMediaFilesChange(newFiles);
    if (currentIndex >= newFiles.length) {
      setCurrentIndex(Math.max(0, newFiles.length - 1));
    }
  };

  const selectFromComputer = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileSelect(files);
    };
    input.click();
  };

  if (mediaFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Media Upload Option */}
          <Card className="p-12 border-2 border-dashed border-theme bg-card shadow-lg">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={selectFromComputer}
              className="text-center cursor-pointer space-y-6"
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
              />

              {/* Upload Icon */}
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <Upload className="w-12 h-12 text-primary" />
              </div>

              {/* Title and Description */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-theme">
                  {isDragActive
                    ? "Drop your files here"
                    : "Add photos or videos"}
                </h3>
                <p className="text-theme/70 text-lg">
                  {isDragActive
                    ? "Release to upload your amazing content"
                    : "Drag and drop your photos and videos here, or click to browse"}
                </p>
              </div>

              {/* File Types */}
              <div className="flex items-center justify-center gap-4 text-sm text-theme/60">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  <span>Photos</span>
                </div>
                <div className="w-1 h-1 bg-theme/40 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </div>
              </div>

              {/* Upload Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  selectFromComputer();
                }}
                className="bg-accent-gradient hover:opacity-90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Choose Files
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentFile = mediaFiles[currentIndex];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Main Preview Slideshow - Made larger and more prominent */}
      <div className="flex-1 flex items-center justify-center relative rounded-2xl overflow-hidden shadow-xl min-h-[400px] max-h-[600px]">
        {currentFile.type === "image" ? (
          <img
            src={currentFile.preview}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={currentFile.preview}
            controls
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Navigation arrows - Made larger and more visible */}
        {mediaFiles.length > 1 && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm border-0 shadow-lg hover:bg-card/95 w-12 h-12 rounded-full"
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                <ChevronLeft className="w-6 h-6 text-theme" />
              </Button>
            )}

            {currentIndex < mediaFiles.length - 1 && (
              <Button
                variant="outline"
                size="lg"
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm border-0 shadow-lg hover:bg-card/95 w-12 h-12 rounded-full"
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                <ChevronRight className="w-6 h-6 text-theme" />
              </Button>
            )}
          </>
        )}

        {/* File indicators - Made larger and more visible */}
        {mediaFiles.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
            {mediaFiles.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-110",
                  index === currentIndex
                    ? "bg-white shadow-lg"
                    : "bg-white/50 hover:bg-white/70"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}

        {/* File counter in top right */}
        {mediaFiles.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {mediaFiles.length}
          </div>
        )}
      </div>

      {/* Control Panel - Compact panel below the large slideshow */}
      <div className="bg-card rounded-2xl border-theme shadow-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-theme">
              Media Files ({mediaFiles.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={selectFromComputer}
              className="text-primary border-primary hover:bg-muted font-medium px-4 py-2"
            >
              Add more
            </Button>
          </div>

          {/* Horizontal Thumbnail Strip */}
          <div className="space-y-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {mediaFiles.map((file, index) => (
                <Card
                  key={file.id}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 cursor-pointer overflow-hidden border-2 transition-all rounded-lg",
                    index === currentIndex
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-gray-300 hover:border-blue-400"
                  )}
                  onClick={() => setCurrentIndex(index)}
                >
                  {file.type === "image" ? (
                    <>
                      <img
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Image className="absolute top-1 right-1 w-3 h-3 text-white bg-black/50 rounded p-0.5" />
                    </>
                  ) : (
                    <>
                      <video
                        src={file.preview}
                        className="w-full h-full object-cover"
                      />
                      <Video className="absolute top-1 right-1 w-3 h-3 text-white bg-black/50 rounded p-0.5" />
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-1 left-1 w-5 h-5 p-0 bg-black/50 border-0 hover:bg-red-500 text-white rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Card>
              ))}
            </div>

            {/* Upload area for adding more */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={selectFromComputer}
              className={cn(
                "border-2 border-dashed rounded-xl p-2 text-center cursor-pointer transition-all duration-200",
                isDragActive
                  ? "border-primary bg-muted"
                  : "border-theme hover:border-primary hover:bg-muted"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
              />
              <Upload className="w-4 h-4 mx-auto my-3 text-theme/60" />
              <p className="text-base font-medium text-theme">
                {isDragActive ? "Drop here" : "Drag or click to add more"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
