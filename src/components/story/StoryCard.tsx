"use client";

import React from "react";
import { Box, Text, Avatar, VStack } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

/**
 * Story card component for displaying user stories
 * Implements Instagram/Facebook-style story cards with gradient borders
 */
interface StoryCardProps {
  /** User information for the story */
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  /** Story image/thumbnail */
  storyImage?: string;
  /** Whether this is the "Add Story" card for current user */
  isAddStory?: boolean;
  /** Whether the story has been viewed */
  isViewed?: boolean;
  /** Click handler for story interaction */
  onClick?: () => void;
}

/**
 * StoryCard component for social media stories display
 * Features gradient borders, hover effects, and responsive design
 */
export default function StoryCard({
  user,
  storyImage,
  isAddStory = false,
  isViewed = false,
  onClick,
}: StoryCardProps) {
  console.log("StoryCard rendered for user:", storyImage);
  return (
    <VStack
      gap={2}
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{ transform: "scale(1.02)" }}
      flexShrink={0}
    >
      {/* Story Circle Container */}
      <Box
        position="relative"
        w="70px"
        h="70px"
        borderRadius="full"
        p="3px"
        bg={
          isAddStory
            ? "gray.200"
            : isViewed
            ? "gray.300"
            : "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
        }
        _dark={{
          bg: isAddStory
            ? "gray.600"
            : isViewed
            ? "gray.500"
            : "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
        }}
        _hover={{
          bg: isAddStory
            ? "gray.300"
            : "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
        }}
      >
        {/* Inner Story Container */}
        <Box
          w="full"
          h="full"
          borderRadius="full"
          bg={{ base: "white", _dark: "gray.800" }}
          p="2px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {/* Story Content */}
          {isAddStory ? (
            /* Add Story Card */
            <Box
              w="full"
              h="full"
              borderRadius="full"
              bg={{ base: "gray.50", _dark: "gray.700" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Avatar.Root size="md">
                <Avatar.Fallback name={user.name} />
                {user.avatar && <Avatar.Image src={user.avatar} />}
              </Avatar.Root>

              {/* Plus Icon for Add Story */}
              <Box
                position="absolute"
                bottom="0"
                right="0"
                w="20px"
                h="20px"
                borderRadius="full"
                bg="blue.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid white"
                _dark={{ borderColor: "gray.800" }}
              >
                <FaPlus size="10" color="white" />
              </Box>
            </Box>
          ) : (
            /* Regular Story Card */
            <Box
              w="full"
              h="full"
              borderRadius="full"
              bgImage={`url(${storyImage})`}
              bgSize="cover"
              backgroundPosition="center"
              bgRepeat="no-repeat"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {!storyImage && (
                <Avatar.Root size="md">
                  <Avatar.Fallback name={user.name} />
                  {user.avatar && <Avatar.Image src={user.avatar} />}
                </Avatar.Root>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* User Name */}
      <Text
        fontSize="xs"
        fontWeight="medium"
        color={{ base: "gray.700", _dark: "gray.300" }}
        textAlign="center"
        maxW="70px"
        truncate
        lineHeight="1.2"
      >
        {isAddStory ? "Your Story" : user.name}
      </Text>
    </VStack>
  );
}
