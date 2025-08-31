"use client";

import React, { useState } from "react";
import { FaHeart, FaComment, FaShare, FaBookmark } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
    };
    content: string;
    timestamp: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    shares?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  onUpdate?: (post: Post) => void;
}

export const PostCard: React.FC<PostProps> = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));

    if (onUpdate) {
      onUpdate({
        ...post,
        isLiked: newIsLiked,
        likes: newIsLiked ? post.likes + 1 : post.likes - 1,
      });
    }
  };

  const handleBookmark = () => {
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    if (onUpdate) {
      onUpdate({
        ...post,
        isBookmarked: newIsBookmarked,
      });
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Share post:", post.id);
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-background border border-border shadow-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex justify-between items-center p-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{post.author.name}</span>
              <span className="text-muted-foreground text-xs">
                @{post.author.username} • {post.timestamp}
              </span>
            </div>
          </div>
          {/* Options menu could go here */}
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-foreground text-base leading-6">{post.content}</p>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="w-full">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-2 text-xs text-muted-foreground">
          <span>{likes} likes</span>
          {post.comments > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>{post.comments} comments</span>
            </>
          )}
          {post.shares && post.shares > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>{post.shares} shares</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center px-4 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 ${
              isLiked ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <FaHeart className="w-4 h-4" />
            <span>Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <FaComment className="w-4 h-4" />
            <span>Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <FaShare className="w-4 h-4" />
            <span>Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`flex items-center gap-2 ${
              isBookmarked ? "text-blue-500" : "text-muted-foreground"
            }`}
          >
            <FaBookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="mt-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full min-h-[80px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // Handle comment submission
                    setCommentText("");
                  }}
                  disabled={!commentText.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
