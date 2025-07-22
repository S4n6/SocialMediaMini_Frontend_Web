"use client";

import React from "react";
import {
  Box,
  Text,
  Avatar,
  HStack,
  VStack,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { FaHeart, FaComment, FaShare, FaBookmark } from "react-icons/fa";
import Carousel from "./Carousel";

interface PostProps {
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
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostProps> = ({
  id,
  author,
  content,
  timestamp,
  likes,
  comments,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
}) => {
  return (
    <Box
      w="full"
      bg={{ base: "white", _dark: "gray.800" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      overflow="hidden"
      _hover={{
        borderColor: { base: "gray.300", _dark: "gray.600" },
      }}
      transition="all 0.2s"
    >
      {/* Post Header */}
      <HStack justify="space-between" p={4} pb={2}>
        <HStack gap={3}>
          <Avatar.Root size="md">
            <Avatar.Fallback name={author.name} />
            {author.avatar && <Avatar.Image src={author.avatar} />}
          </Avatar.Root>
          <VStack gap={0} align="start">
            <Text fontWeight="semibold" fontSize="sm">
              {author.name}
            </Text>
            <Text color="gray.500" fontSize="xs">
              @{author.username} • {timestamp}
            </Text>
          </VStack>
        </HStack>
        <Button variant="ghost" size="sm" color="gray.500">
          ⋯
        </Button>
      </HStack>

      {/* Post Content */}
      <Box px={4} pb={3}>
        <Text fontSize="md" lineHeight="1.5">
          {content}
        </Text>
        <Carousel />
      </Box>

      {/* Post Actions */}
      <HStack
        justify="space-between"
        px={4}
        py={3}
        borderTopWidth="1px"
        borderColor={{ base: "gray.100", _dark: "gray.700" }}
      >
        <HStack gap={4}>
          <Button
            variant="ghost"
            size="sm"
            color={isLiked ? "red.500" : "gray.500"}
            onClick={() => onLike?.(id)}
            _hover={{
              color: "red.500",
              bg: "red.50",
              _dark: { bg: "red.900" },
            }}
          >
            <FaHeart />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            color="gray.500"
            onClick={() => onComment?.(id)}
            _hover={{
              color: "blue.500",
              bg: "blue.50",
              _dark: { bg: "blue.900" },
            }}
          >
            <FaComment />
            {comments}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            color="gray.500"
            onClick={() => onShare?.(id)}
            _hover={{
              color: "green.500",
              bg: "green.50",
              _dark: { bg: "green.900" },
            }}
          >
            <FaShare />
            Share
          </Button>
        </HStack>
        <Button
          variant="ghost"
          size="sm"
          color={isBookmarked ? "yellow.500" : "gray.500"}
          onClick={() => onBookmark?.(id)}
          _hover={{
            color: "yellow.500",
            bg: "yellow.50",
            _dark: { bg: "yellow.900" },
          }}
        >
          <FaBookmark />
        </Button>
      </HStack>

      {/* Comment Input */}
      <Box
        px={4}
        py={2}
        borderTopWidth="1px"
        borderColor={{ base: "gray.100", _dark: "gray.700" }}
      >
        <Textarea placeholder="Comment..." />
      </Box>
    </Box>
  );
};

export default PostCard;
