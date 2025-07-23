"use client";

import ImageList, { ImageItem } from "@/components/post/ImageList";
import StoryCard from "@/components/story/StoryCard";
import {
  Avatar,
  Box,
  Button,
  createListCollection,
  Portal,
  Select,
  Separator,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { IoPersonAddOutline } from "react-icons/io5";
import { MdOutlineMoreHoriz } from "react-icons/md";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

const actions = createListCollection({
  items: [
    { label: "Following", value: "following" },
    { label: "Cancel Follow", value: "cancel_follow" },
  ],
});

const stories = [
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
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
];

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

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params;
  console.log("User ID:", id);
  return (
    <Box
      minH="100vh"
      bg={"bg.canvas"}
      transition="all 0.3s ease-in-out"
      width={"100%"}
    >
      <Box display="flex" width="100%" padding={4}>
        <Box ml={"10%"} display={"flex"} justifyContent={"center"}>
          <Avatar.Root width={"150px"} height="150px" borderRadius="full">
            <Avatar.Fallback name="Segun Adebayo" />
            <Avatar.Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg/500px-20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg" />
          </Avatar.Root>
        </Box>
        <Box width="50%" ml={8}>
          <Box display={"flex"} alignItems="center" gap={3}>
            <Text fontSize="lg" mr={8}>
              Neymar Jr.
            </Text>
            <Select.Root
              collection={actions}
              size="md"
              maxW={"150px"}
              defaultValue={["following"]}
              variant={"subtle"}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {actions.items.map((framework) => (
                      <Select.Item item={framework} key={framework.value}>
                        {framework.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            <Button
              variant={"solid"}
              size={"md"}
              marginLeft={4}
              borderRadius={"lg"}
              bg={"#EFEFEF"}
              color={"#000"}
            >
              Message
            </Button>

            <Button
              variant={"solid"}
              size={"md"}
              borderRadius={"lg"}
              bg={"#EFEFEF"}
              color={"#000"}
            >
              <IoPersonAddOutline size={20} />
            </Button>
            <Button variant={"outline"} size={"md"} borderRadius={"lg"}>
              <MdOutlineMoreHoriz size={20} />
            </Button>
          </Box>
          <Box display={"flex"} alignItems="center" mt={4} gap={6}>
            <Text fontSize="md">
              <span style={{ fontWeight: "bold" }}>1,234</span> posts
            </Text>
            <Text fontSize="md">
              <span style={{ fontWeight: "bold" }}>567K</span> followers
            </Text>
            <Text fontSize="md">
              <span style={{ fontWeight: "bold" }}>890</span> following
            </Text>
          </Box>

          <Box>
            <Text fontSize="md" mt={4}>
              Neymar Jr. is a Brazilian professional footballer who plays as a
              forward for Saudi Pro League club Al-Hilal and the Brazil national
              team.
            </Text>
          </Box>
        </Box>
      </Box>

      <Box display="flex" ml={"10%"} mt={8} gap={4} flexWrap="wrap">
        {stories.map((story) => (
          <StoryCard
            user={story.user}
            key={story.id}
            storyImage={story.storyImage}
            isViewed={story.isViewed}
          />
        ))}
      </Box>

      <Separator orientation="horizontal" mx={"5%"} mt={8} />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Tabs.Root
          defaultValue="members"
          fitted
          width="80%"
          display="flex"
          flexDirection="column"
          justifyContent={"center"}
          alignItems={"center"}
          mb={8}
        >
          <Tabs.List fontSize={"md"}>
            <Tabs.Trigger value="members">POSTS</Tabs.Trigger>
            <Tabs.Trigger value="projects">REELS</Tabs.Trigger>
            <Tabs.Trigger value="tasks">TAGGED</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="members">
            <ImageList
              images={sampleImages}
              title="Recent Posts"
              onImageClick={(image) => console.log("Image clicked:", image)}
            />
          </Tabs.Content>
          <Tabs.Content value="projects">Manage your projects</Tabs.Content>
          <Tabs.Content value="tasks">
            Manage your tasks for freelancers
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Box>
  );
}
