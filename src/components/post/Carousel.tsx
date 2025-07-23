"use client";

import {
  Box,
  VStack,
  Text,
  HStack,
  Button,
  Image,
  Flex,
  Circle,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaComment,
} from "react-icons/fa";

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

// Sample wildlife and nature images
const wildlifeImages: ImageItem[] = [
  {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=500&h=500&fit=crop",
    caption: "Majestic Peregrine Falcon in flight 🦅",
    author: {
      name: "Wildlife Photographer",
      username: "wildlifepro",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    },
    likes: 1284,
    comments: 47,
    isVideo: false,
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop",
    caption: "Forest path at golden hour 🌲",
    author: {
      name: "Nature Explorer",
      username: "natureexp",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    },
    likes: 892,
    comments: 23,
    isVideo: false,
  },
  {
    id: "3",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop",
    caption: "Mountain peak adventure ⛰️",
    author: {
      name: "Adventure Seeker",
      username: "adventurer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    },
    likes: 1567,
    comments: 89,
    isVideo: false,
  },
  {
    id: "4",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop",
    caption: "Cat eyes in the wild 🐱",
    author: {
      name: "Animal Lover",
      username: "animallover",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b605?w=50&h=50&fit=crop&crop=face",
    },
    likes: 2341,
    comments: 156,
    isVideo: false,
  },
  {
    id: "5",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop",
    caption: "Ocean waves at sunset 🌊",
    author: {
      name: "Ocean Photographer",
      username: "oceanpro",
      avatar:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?w=50&h=50&fit=crop&crop=face",
    },
    likes: 943,
    comments: 34,
    isVideo: false,
  },
  {
    id: "6",
    imageUrl:
      "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=500&h=500&fit=crop",
    caption: "Flying bird in action 🕊️",
    author: {
      name: "Bird Watcher",
      username: "birdwatcher",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
    },
    likes: 1876,
    comments: 72,
    isVideo: true,
  },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? wildlifeImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === wildlifeImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const currentImage = wildlifeImages[currentIndex];

  return (
    <Box w="full" mx="auto" p={4}>
      <VStack gap={4} align="stretch">
        {/* Image Carousel Container */}
        <Box
          position="relative"
          w="full"
          aspectRatio="1"
          borderRadius="lg"
          overflow="hidden"
          bg={{ base: "gray.100", _dark: "gray.800" }}
          boxShadow="lg"
        >
          {/* Main Image */}
          <Image
            src={currentImage.imageUrl}
            alt={currentImage.caption}
            w="full"
            h="full"
            objectFit="cover"
            loading="lazy"
          />

          {/* Navigation Arrows */}
          {wildlifeImages.length > 1 && (
            <>
              <Button
                position="absolute"
                left={2}
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                bg="blackAlpha.600"
                color="white"
                borderRadius="full"
                _hover={{ bg: "blackAlpha.800" }}
                onClick={handlePrevious}
                minW="8"
                h="8"
              >
                <FaChevronLeft />
              </Button>

              <Button
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                bg="blackAlpha.600"
                color="white"
                borderRadius="full"
                _hover={{ bg: "blackAlpha.800" }}
                onClick={handleNext}
                minW="8"
                h="8"
              >
                <FaChevronRight />
              </Button>
            </>
          )}
        </Box>

        {/* Dot Indicators */}
        {wildlifeImages.length > 1 && (
          <Flex justify="center" gap={2}>
            {wildlifeImages.map((_, index) => (
              <Circle
                key={index}
                size="8px"
                bg={
                  index === currentIndex
                    ? { base: "blue.500", _dark: "blue.400" }
                    : { base: "gray.300", _dark: "gray.600" }
                }
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  bg:
                    index === currentIndex
                      ? { base: "blue.600", _dark: "blue.300" }
                      : { base: "gray.400", _dark: "gray.500" },
                }}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </Flex>
        )}
      </VStack>
    </Box>
  );
}
