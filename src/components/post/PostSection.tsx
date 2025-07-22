"use client";

import React, { useState, useCallback } from "react";
import { Box, VStack, Text, Button, Spinner, Alert } from "@chakra-ui/react";
import { PostCard } from "@/components/post/PostCard";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

/**
 * PostSection component props interface
 */
interface PostSectionProps {
  posts?: Post[];
  isLoading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  title?: string;
  showLoadMore?: boolean;
}

export default function PostSection({
  posts = [],
  isLoading = false,
  error = null,
  onLoadMore,
  hasMore = true,
  title = "Posts",
  showLoadMore = true,
}: PostSectionProps) {
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);

  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleLike = useCallback((postId: string) => {
    setLocalPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  }, []);

  const handleComment = useCallback((postId: string) => {
    console.log("Comment on post:", postId);
    // TODO: Open comment modal or navigate to post detail
  }, []);

  const handleShare = useCallback((postId: string) => {
    console.log("Share post:", postId);
    // TODO: Implement share functionality
    setLocalPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
  }, []);

  const handleBookmark = useCallback((postId: string) => {
    setLocalPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  }, []);

  const handleDelete = useCallback((postId: string) => {
    setLocalPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postId)
    );
  }, []);

  if (error) {
    return (
      <Box w="full" maxW="600px" mx="auto" p={4}>
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>Error loading posts</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      mx="auto"
      p={{ base: 2, md: 4 }}
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      gap={4}
      mt={6}
    >
      <VStack gap={6} align="stretch" w={{ base: "100%", md: "75%" }}>
        {isLoading && localPosts.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={12}
          >
            <VStack gap={4}>
              <Spinner size="lg" color="blue.500" />
              <Text
                color={{ base: "gray.600", _dark: "gray.400" }}
                fontSize="sm"
              >
                Loading posts...
              </Text>
            </VStack>
          </Box>
        ) : localPosts.length === 0 ? (
          /* Empty state */
          <Box
            textAlign="center"
            py={12}
            px={6}
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
          >
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={{ base: "gray.800", _dark: "white" }}
              mb={2}
            >
              No posts yet
            </Text>
            <Text color={{ base: "gray.600", _dark: "gray.400" }} fontSize="sm">
              Be the first to share something amazing!
            </Text>
          </Box>
        ) : (
          /* Post Cards */
          localPosts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              author={post.author}
              content={post.content}
              imageUrl={post.imageUrl}
              timestamp={post.timestamp}
              likes={post.likes}
              comments={post.comments}
              shares={post.shares}
              isLiked={post.isLiked}
              isBookmarked={post.isBookmarked}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onBookmark={handleBookmark}
              onDelete={handleDelete}
            />
          ))
        )}

        {/* End of feed message */}
        {!hasMore && localPosts.length > 0 && (
          <Box textAlign="center" py={6}>
            <Text color={{ base: "gray.500", _dark: "gray.400" }} fontSize="sm">
              You've reached the end of the feed
            </Text>
          </Box>
        )}

        {/* Loading indicator for infinite scroll */}
        {isLoading && localPosts.length > 0 && (
          <Box display="flex" justifyContent="center" py={4}>
            <Spinner size="md" color="blue.500" />
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export type { Post, PostSectionProps };
