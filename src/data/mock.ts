import { Post } from "@/components/post/PostSection";

export const mockPosts: Post[] = [
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
    user: {
      id: "user1",
      name: "Kai Cenat",
      username: "kaicenat",
      avatar:
        "https://yt3.googleusercontent.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story2",
    user: {
      id: "user2",
      name: "Kylian Mbappé",
      username: "k.mbappe",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kylian_Mbapp%C3%A9_2024.jpg/800px-Kylian_Mbapp%C3%A9_2024.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story3",
    user: {
      id: "user3",
      name: "Central Cee",
      username: "centralcee",
      avatar:
        "https://yt3.googleusercontent.com/IpKKgkaNhN7csz94_-6jP4rFaruPHWW1VXnBWWR_kbEJNQ2eFCeOzJePOkF8LdCLNcAFBKAJ=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story4",
    user: {
      id: "user4",
      name: "21 Savage",
      username: "21savage",
      avatar:
        "https://yt3.googleusercontent.com/U7a_D-mwdJiE6d7p5zprCPQF2pLr2l7nClKP0j2X-QZLQMYLYBl-3C8XPQSP8TQwO0MlXLs=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story5",
    user: {
      id: "user5",
      name: "Jude Bellingham",
      username: "judebellingham",
      avatar:
        "https://cdn.vox-cdn.com/thumbor/b7b5m5xj8Q5KjXL2F6WFEJt8_4M=/0x0:3000x2000/1200x800/filters:focal(1260x760:1740x1240)/cdn.vox-cdn.com/uploads/chorus_image/image/72442663/1527006186.0.jpg",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465378790032-7cbe2a851cfa?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story6",
    user: {
      id: "user6",
      name: "Travis Scott",
      username: "travisscott",
      avatar:
        "https://yt3.googleusercontent.com/D37YhepxfGzYdXUEK3PvSEyCFp8JOUvb8xwlXvMC4_K4e6q_aHN8-M4N5a4bNgH6KQ_U1c=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story7",
    user: {
      id: "user7",
      name: "Kendrick Lamar",
      username: "kendricklamar",
      avatar:
        "https://yt3.googleusercontent.com/9q8VNGeDJiZzD5z5zBfGkp5eBq4ZKQQKGQgEoT_h4CZy3r8K5cTKC1L9KGr2CyG7G0z9h=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story8",
    user: {
      id: "user8",
      name: "Drake",
      username: "champagnepapi",
      avatar:
        "https://yt3.googleusercontent.com/OlAOKdJTiCJ8VzG5_Q9C6G6e6K1c1_qYfQ2K7_0M9cQzK_4K2y8CQ0z6Xz9Y5QzK=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b7?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story9",
    user: {
      id: "user9",
      name: "Lil Baby",
      username: "lilbaby",
      avatar:
        "https://yt3.googleusercontent.com/2QczD_M9ZfE9vP_sZ5a0GmKHq0K9s5K7_N6cY3C5V7_2Q4KZKgqQV7_N0M3c5=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story10",
    user: {
      id: "user10",
      name: "The Weeknd",
      username: "theweeknd",
      avatar:
        "https://yt3.googleusercontent.com/5v7g7Y8Qqj4K9XvKgBQHNpV_0tXGqd9V5qfSEp3K1z6qJ4f1K5x2Q3c8Y6M0A7=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    isViewed: false,
  },
  {
    id: "story11",
    user: {
      id: "user11",
      name: "Future",
      username: "future",
      avatar:
        "https://yt3.googleusercontent.com/ytc/AL5GRJV7Y8KcLpVdtL2kO1mNgG8KqF2YhW6QXcT7YV8=s160-c-k-c0x00ffffff-no-rj",
    },
    storyImage:
      "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b7?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
  {
    id: "story12",
    user: {
      id: "user12",
      name: "Playboi Carti",
      username: "playboicarti",
      avatar:
        "https://yt3.googleusercontent.com/6fvEH5K8Q9vL2h5K3c8Y0cX9VzH6QxF2qG7K4cY6v2Q=s160-c-k-c0x00ffffff-no-rj",
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
