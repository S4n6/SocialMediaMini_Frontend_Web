"use client";

import RightSideBar from "@/components/layout/RightSideBar";
import PostSection, { Post } from "@/components/post/PostSection";
import { StoriesSection } from "@/components/story/StoriesSection";
import { SCREEN_SIZES } from "@/lib/constants/screen.constant";
import { Container, Text, VStack, Button, Box } from "@chakra-ui/react";
import { useState } from "react";

const mockPosts: Post[] = [
  {
    id: "post1",
    author: {
      id: "user1",
      name: "John Doe",
      username: "johndoe",
      avatar: "https://bit.ly/sage-adebayo",
    },
    content:
      "Just finished building an amazing React component! Love how clean the code turned out. 🚀",
    timestamp: "2h",
    likes: 24,
    comments: 5,
    isLiked: false,
    shares: 3,
    isBookmarked: false,
  },
  {
    id: "post2",
    author: {
      id: "user2",
      name: "Jane Smith",
      username: "janesmith",
      avatar: "https://bit.ly/sage-adebayo",
    },
    content:
      "Beautiful sunset today! Sometimes you just need to pause and appreciate the little moments in life. 🌅",
    timestamp: "4h",
    likes: 67,
    comments: 12,
    isLiked: true,
    shares: 7,
    isBookmarked: true,
  },
];

const mockStories = [
  {
    id: "story1",
    user: {
      id: "user1",
      name: "John Doe",
      username: "johndoe",
      avatar:
        "https://media.vov.vn/sites/default/files/styles/large/public/2025-03/neymar.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story2",
    user: {
      id: "user2",
      name: "Jane Smith",
      username: "janesmith",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story3",
    user: {
      id: "user3",
      name: "Alex Kim",
      username: "alexkim",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story4",
    user: {
      id: "user4",
      name: "Maria Lopez",
      username: "marialopez",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story5",
    user: {
      id: "user5",
      name: "Chris Evans",
      username: "chrisevans",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465378790032-7cbe2a851cfa?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story6",
    user: {
      id: "user6",
      name: "Emily Carter",
      username: "emilycarter",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story7",
    user: {
      id: "user7",
      name: "Michael Brown",
      username: "michaelbrown",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story8",
    user: {
      id: "user8",
      name: "Sophia Turner",
      username: "sophiaturner",
      avatar: "https://randomuser.me/api/portraits/women/50.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b7?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story9",
    user: {
      id: "user9",
      name: "David Lee",
      username: "davidlee",
      avatar: "https://randomuser.me/api/portraits/men/60.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story10",
    user: {
      id: "user10",
      name: "Olivia Green",
      username: "oliviagreen",
      avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story11",
    user: {
      id: "user11",
      name: "Lucas White",
      username: "lucaswhite",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b7?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story12",
    user: {
      id: "user12",
      name: "Ella Black",
      username: "ellablack",
      avatar: "https://randomuser.me/api/portraits/women/80.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story13",
    user: {
      id: "user13",
      name: "Henry Clark",
      username: "henryclark",
      avatar: "https://randomuser.me/api/portraits/men/81.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story14",
    user: {
      id: "user14",
      name: "Grace Hall",
      username: "gracehall",
      avatar: "https://randomuser.me/api/portraits/women/82.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465378790032-7cbe2a851cfa?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story15",
    user: {
      id: "user15",
      name: "Jack King",
      username: "jackking",
      avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
];

export default function Home() {
  const [posts, setPosts] = useState(mockPosts);
  return (
    <Box display="flex" w={"83%"}>
      <Box
        width={{ base: "100%", md: "75%" }}
        p={{ base: 2, md: 4, lg: 6 }}
        bg={{ base: "white", _dark: "gray.800" }}
        borderRadius="md"
        boxShadow="md"
        maxW={{ base: "100%", md: SCREEN_SIZES.md, lg: SCREEN_SIZES.lg }}
      >
        <StoriesSection stories={mockStories} />
        <PostSection
          posts={posts}
          isLoading={false}
          error={null}
          onLoadMore={() => console.log("Load more posts")}
          hasMore={true}
          title="Latest Posts"
          showLoadMore={true}
        />
      </Box>
      <Box
        width={{ base: "100%", md: "25%" }}
        bg={{ base: "white", _dark: "gray.800" }}
        borderRadius="md"
        boxShadow="md"
        display={{ base: "none", md: "block" }}
      >
        <RightSideBar />
      </Box>
    </Box>
  );
}
