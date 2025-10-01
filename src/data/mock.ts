import type { LegacyPost as Post } from "@/types";

export const mockPosts: any = [
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
    isBookmarked: false,
    images: [
      {
        id: "img1",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        likes: 120,
        comments: 15,
        caption: "A beautiful scenery!",
        isVideo: false,
        isCarousel: false,
      },
      {
        id: "img2",
        imageUrl:
          "https://buffer.com/resources/content/images/2024/11/free-stock-image-sites.png",
        likes: 95,
        comments: 8,
        caption: "React development setup",
        isVideo: false,
        isCarousel: true,
      },
      {
        id: "img3",
        imageUrl:
          "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
        likes: 87,
        comments: 12,
        caption: "Coding session",
        isVideo: true,
        duration: "1:23",
        viewCount: 2150,
      },
      {
        id: "img4",
        imageUrl:
          "https://images.unsplash.com/photo-1465378790032-7cbe2a851cfa?auto=format&fit=crop&w=800&q=80",
        likes: 203,
        comments: 28,
        caption: "Tech workspace",
        isVideo: false,
        isCarousel: false,
      },
    ],
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
    isBookmarked: true,
    images: [
      {
        id: "img5",
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
        likes: 67,
        comments: 12,
        caption: "Golden hour sunset",
        isVideo: true,
        duration: "0:45",
        viewCount: 1250,
      },
      {
        id: "img6",
        imageUrl:
          "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
        likes: 89,
        comments: 15,
        caption: "Mountain view",
        isVideo: false,
        isCarousel: true,
      },
    ],
  },
];

export const mockStories = [
  {
    id: "story1",
    userId: "user1",
    user: {
      id: "user1",
      name: "Kai Cenat",
      username: "kaicenat",
      avatar:
        "https://yt3.googleusercontent.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s160-c-k-c0x00ffffff-no-rj",
    },
    mediaUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    mediaType: "image" as const,
    duration: 24,
    createdAt: "2024-01-15T10:00:00Z",
    expiresAt: "2024-01-16T10:00:00Z",
    views: [],
    isViewed: false,
  },
  {
    id: "story2",
    userId: "user2",
    user: {
      id: "user2",
      name: "Kylian Mbappé",
      username: "k.mbappe",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kylian_Mbapp%C3%A9_2024.jpg/800px-Kylian_Mbapp%C3%A9_2024.jpg",
    },
    mediaUrl:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    mediaType: "image" as const,
    duration: 24,
    createdAt: "2024-01-15T08:00:00Z",
    expiresAt: "2024-01-16T08:00:00Z",
    views: [],
    isViewed: true,
  },
  {
    id: "story3",
    userId: "user3",
    user: {
      id: "user3",
      name: "Central Cee",
      username: "centralcee",
      avatar:
        "https://yt3.googleusercontent.com/IpKKgkaNhN7csz94_-6jP4rFaruPHWW1VXnBWWR_kbEJNQ2eFCeOzJePOkF8LdCLNcAFBKAJ=s160-c-k-c0x00ffffff-no-rj",
    },
    mediaUrl:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    mediaType: "image" as const,
    duration: 24,
    createdAt: "2024-01-15T09:00:00Z",
    expiresAt: "2024-01-16T09:00:00Z",
    views: [],
    isViewed: false,
  },
  {
    id: "story4",
    userId: "user4",
    user: {
      id: "user4",
      name: "21 Savage",
      username: "21savage",
      avatar:
        "https://yt3.googleusercontent.com/U7a_D-mwdJiE6d7p5zprCPQF2pLr2l7nClKP0j2X-QZLQMYLYBl-3C8XPQSP8TQwO0MlXLs=s160-c-k-c0x00ffffff-no-rj",
    },
    mediaUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    mediaType: "image" as const,
    duration: 24,
    createdAt: "2024-01-15T07:00:00Z",
    expiresAt: "2024-01-16T07:00:00Z",
    views: [],
    isViewed: true,
  },
];
