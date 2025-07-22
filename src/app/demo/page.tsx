"use client";

import { Box, Container, VStack, Text } from "@chakra-ui/react";
import ImageList, { ImageItem } from "@/components/post/ImageList";

// Sample data for demonstration
const sampleImages: ImageItem[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/400/400?random=1",
    caption: "Beautiful sunset over the mountains",
    author: {
      name: "John Doe",
      username: "johndoe",
      avatar: "https://picsum.photos/50/50?random=10",
    },
    likes: 234,
    comments: 18,
    isVideo: false,
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/400/400?random=2",
    caption: "Coffee time ☕",
    author: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: "https://picsum.photos/50/50?random=11",
    },
    likes: 156,
    comments: 23,
    isVideo: false,
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/400/400?random=3",
    caption: "Weekend vibes 🌊",
    author: {
      name: "Mike Johnson",
      username: "mikej",
      avatar: "https://picsum.photos/50/50?random=12",
    },
    likes: 89,
    comments: 7,
    isVideo: true,
  },
  {
    id: "4",
    imageUrl: "https://picsum.photos/400/400?random=4",
    caption: "City lights",
    author: {
      name: "Sarah Wilson",
      username: "sarahw",
      avatar: "https://picsum.photos/50/50?random=13",
    },
    likes: 312,
    comments: 45,
    isVideo: false,
  },
  {
    id: "5",
    imageUrl: "https://picsum.photos/400/400?random=5",
    caption: "Nature walk",
    author: {
      name: "David Brown",
      username: "davidb",
      avatar: "https://picsum.photos/50/50?random=14",
    },
    likes: 178,
    comments: 12,
    isVideo: false,
  },
  {
    id: "6",
    imageUrl: "https://picsum.photos/400/400?random=6",
    caption: "Food photography",
    author: {
      name: "Emily Davis",
      username: "emilyd",
      avatar: "https://picsum.photos/50/50?random=15",
    },
    likes: 267,
    comments: 34,
    isVideo: false,
  },
];

export default function DemoPage() {
  const handleImageClick = (image: ImageItem) => {
    console.log("Image clicked:", image);
    // You can implement modal opening, navigation, etc.
  };

  return (
    <Container maxW="6xl" py={8}>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            ImageList Component Demo
          </Text>
          <Text color="gray.600" fontSize="lg">
            Instagram-like image grid display
          </Text>
        </Box>

        {/* Default 3-column grid */}
        <Box>
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            Default Layout (3 columns)
          </Text>
          <ImageList
            images={sampleImages}
            title="Recent Posts"
            onImageClick={handleImageClick}
          />
        </Box>

        {/* 4-column grid with smaller gap */}
        <Box>
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            4 Columns with Small Gap
          </Text>
          <ImageList
            images={sampleImages}
            title="Photo Gallery"
            columns={4}
            gap={2}
            onImageClick={handleImageClick}
          />
        </Box>

        {/* 2-column grid for mobile-first */}
        <Box>
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            2 Columns (Mobile Friendly)
          </Text>
          <ImageList
            images={sampleImages.slice(0, 4)}
            title="Latest Updates"
            columns={2}
            gap={4}
            onImageClick={handleImageClick}
          />
        </Box>

        {/* Loading state */}
        <Box>
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            Loading State
          </Text>
          <ImageList images={[]} title="Loading Posts" isLoading={true} />
        </Box>

        {/* Empty state */}
        <Box>
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            Empty State
          </Text>
          <ImageList
            images={[]}
            title="No Posts Yet"
            onImageClick={handleImageClick}
          />
        </Box>
      </VStack>
    </Container>
  );
}
