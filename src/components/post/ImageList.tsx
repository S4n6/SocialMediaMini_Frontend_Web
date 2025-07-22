"use client";

import {
  Box,
  Grid,
  Image,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaHeart, FaComment, FaPlay } from "react-icons/fa";

/**
 * Interface for individual image/post items
 */
export interface ImageItem {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isVideo?: boolean;
  caption?: string;
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
}

/**
 * Props for ImageList component
 */
interface ImageListProps {
  /** Array of images/posts to display */
  images: ImageItem[];
  /** Number of columns in the grid */
  columns?: number;
  /** Gap between grid items */
  gap?: number;
  /** Whether to show hover overlay with stats */
  showOverlay?: boolean;
  /** Handler for image click */
  onImageClick?: (image: ImageItem) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom title for the image list */
  title?: string;
}

/**
 * Instagram-style image grid component
 * Displays images in a responsive grid with hover effects and stats
 */
export default function ImageList({
  images = [],
  columns = 3,
  gap = 1,
  showOverlay = true,
  onImageClick,
  isLoading = false,
  title = "Posts",
}: ImageListProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  /**
   * Handle image click interaction
   */
  const handleImageClick = (image: ImageItem) => {
    onImageClick?.(image);
  };

  if (isLoading) {
    return (
      <Box w="full">
        {title && (
          <Text
            fontSize="lg"
            fontWeight="semibold"
            mb={4}
            color={{ base: "gray.800", _dark: "white" }}
          >
            {title}
          </Text>
        )}
        <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={gap} w="full">
          {Array.from({ length: 9 }).map((_, index) => (
            <Box
              key={index}
              aspectRatio="1"
              bg={{ base: "gray.200", _dark: "gray.700" }}
              borderRadius="md"
              opacity={0.6}
            />
          ))}
        </Grid>
      </Box>
    );
  }

  if (images.length === 0) {
    return (
      <VStack
        gap={4}
        py={12}
        textAlign="center"
        color={{ base: "gray.600", _dark: "gray.400" }}
      >
        <Text fontSize="lg" fontWeight="semibold">
          No posts yet
        </Text>
        <Text fontSize="sm">Share your first photo to get started!</Text>
      </VStack>
    );
  }

  return (
    <Box w="full">
      {/* Section Title */}
      {title && (
        <HStack justify="space-between" align="center" mb={4}>
          <Text
            fontSize="lg"
            fontWeight="semibold"
            color={{ base: "gray.800", _dark: "white" }}
          >
            {title}
          </Text>
          <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.400" }}>
            {images.length} posts
          </Text>
        </HStack>
      )}

      {/* Image Grid */}
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          sm: `repeat(${Math.min(columns, 3)}, 1fr)`,
          md: `repeat(${columns}, 1fr)`,
        }}
        gap={gap}
        w="full"
      >
        {images.map((image) => (
          <Box
            key={image.id}
            position="relative"
            aspectRatio="1"
            cursor="pointer"
            onClick={() => handleImageClick(image)}
            onMouseEnter={() => setHoveredItem(image.id)}
            onMouseLeave={() => setHoveredItem(null)}
            borderRadius="md"
            overflow="hidden"
            bg={{ base: "gray.100", _dark: "gray.800" }}
            transition="all 0.2s ease"
            css={{
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            {/* Main Image */}
            <Image
              src={image.imageUrl}
              alt={image.caption || `Post by ${image.author?.name || "User"}`}
              w="full"
              h="full"
              objectFit="cover"
            />

            {/* Image Loading Fallback */}
            <Box
              position="absolute"
              top="0"
              left="0"
              w="full"
              h="full"
              bg={{ base: "gray.200", _dark: "gray.700" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex="-1"
            >
              <Text fontSize="sm" color="gray.500">
                Loading...
              </Text>
            </Box>

            {/* Video Indicator */}
            {image.isVideo && (
              <Box
                position="absolute"
                top={2}
                right={2}
                p={1}
                borderRadius="sm"
                bg="blackAlpha.700"
              >
                <FaPlay size="12" color="white" />
              </Box>
            )}

            {/* Multiple Images Indicator */}
            {/* You can add logic here if the post has multiple images */}

            {/* Hover Overlay */}
            {showOverlay && hoveredItem === image.id && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.2s ease"
              >
                <HStack gap={6} color="white">
                  {/* Likes */}
                  <HStack gap={1}>
                    <FaHeart size="18" />
                    <Text fontWeight="bold" fontSize="sm">
                      {image.likes.toLocaleString()}
                    </Text>
                  </HStack>

                  {/* Comments */}
                  <HStack gap={1}>
                    <FaComment size="18" />
                    <Text fontWeight="bold" fontSize="sm">
                      {image.comments.toLocaleString()}
                    </Text>
                  </HStack>
                </HStack>
              </Box>
            )}
          </Box>
        ))}
      </Grid>

      {/* Load More Button */}
      <Box textAlign="center" mt={8}>
        <Button
          variant="outline"
          size="lg"
          onClick={() => console.log("Load more images")}
          _hover={{
            bg: { base: "gray.50", _dark: "gray.700" },
          }}
        >
          Load More
        </Button>
      </Box>
    </Box>
  );
}

/**
 * Export types for external use
 */
export type { ImageListProps };
