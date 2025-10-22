'use client';

import React, { useEffect, useState } from 'react';
import { FaHeart, FaComment, FaShare, FaBookmark } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import type { LegacyPost as Post } from '@/types';
import ImageList from '@/components/ui/image-list-custom';

interface PostProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

export const PostCard: React.FC<PostProps> = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likes, setLikes] = useState<number>(post.likes);
  const [commentText, setCommentText] = useState('');

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
    console.log('Comment button clicked');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share post:', post.id);
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex justify-between items-center p-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>
                {post.author.fullName.toString().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {post.author.fullName}
              </span>
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
        {post.images && post.images.length > 0 && (
          <ImageList
            images={post.images.map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl || img.url || '',
              likes: typeof img.likes === 'number' ? img.likes : 0,
              comments: typeof img.comments === 'number' ? img.comments : 0,
              isVideo: !!img.isVideo,
              duration: img.duration,
              caption: img.caption,
              author: img.author,
              isCarousel: !!img.isCarousel,
              viewCount:
                typeof img.viewCount === 'number' ? img.viewCount : undefined,
            }))}
          />
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <FaHeart className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <FaComment className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <FaShare className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`flex items-center gap-2 ${
              isBookmarked ? 'text-blue-500' : 'text-muted-foreground'
            }`}
          >
            <FaBookmark className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[40px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-16 rounded-lg"
            />
            {commentText.trim() && (
              <Button
                onClick={() => {
                  // Handle post comment
                  console.log('Posting comment:', commentText);
                  setCommentText('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-sm bg-blue-500 hover:bg-blue-600 text-white"
              >
                Post
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
