import type { Highlight, Post } from "@/features/profile";

export const mockHighlights: Highlight[] = [
  {
    id: "1",
    name: "BTS",
    imageUrl: "https://picsum.photos/80/80?random=10",
  },
  {
    id: "2",
    name: "Frisbee",
    imageUrl: "https://picsum.photos/80/80?random=11",
  },
  {
    id: "3",
    name: "Travel",
    imageUrl: "https://picsum.photos/80/80?random=12",
  },
  {
    id: "4",
    name: "Food",
    imageUrl: "https://picsum.photos/80/80?random=13",
  },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/400/400?random=1",
    isVideo: false,
    likes: 1234,
    comments: 89,
    caption: "Beautiful sunset at the beach",
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/400/400?random=2",
    isVideo: true,
    likes: 2156,
    comments: 178,
    caption: "Training session highlights",
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/400/400?random=3",
    isVideo: false,
    isCarousel: true,
    likes: 892,
    comments: 45,
    caption: "Team celebration after victory",
  },
  {
    id: "4",
    imageUrl: "https://picsum.photos/400/400?random=4",
    isVideo: false,
    likes: 1567,
    comments: 234,
    caption: "Weekend vibes",
  },
  {
    id: "5",
    imageUrl: "https://picsum.photos/400/400?random=5",
    isVideo: true,
    likes: 3421,
    comments: 567,
    caption: "Behind the scenes",
  },
  {
    id: "6",
    imageUrl: "https://picsum.photos/400/400?random=6",
    isVideo: false,
    likes: 987,
    comments: 123,
    caption: "Morning coffee",
  },
  {
    id: "7",
    imageUrl: "https://picsum.photos/400/400?random=7",
    isVideo: false,
    likes: 2341,
    comments: 156,
    caption: "City lights",
  },
  {
    id: "8",
    imageUrl: "https://picsum.photos/400/400?random=8",
    isVideo: true,
    likes: 1876,
    comments: 234,
    caption: "Dance practice",
  },
];

// Helper functions for data filtering
export const getVideosPosts = () => mockPosts.filter((post) => post.isVideo);
export const getPhotosPosts = () => mockPosts.filter((post) => !post.isVideo);
export const getTaggedPosts = () => []; // TODO: Implement when tagged posts are available

// Mock user stats
export const getMockUserStats = () => ({
  posts: mockPosts.length,
  followers: 1247,
  following: 892,
});
