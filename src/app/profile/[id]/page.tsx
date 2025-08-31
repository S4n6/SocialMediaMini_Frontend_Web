"use client";

import React, { useState, useEffect } from "react";
import ImageList, { ImageItem } from "@/components/post/ImageList";
import StoryCard from "@/components/story/StoryCard";
import { IoPersonAddOutline } from "react-icons/io5";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const stories = [
  {
    id: "story1",
    user: {
      id: "user1",
      name: "John Doe",
      username: "johndoe",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
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
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    isViewed: true,
  },
];

const sampleImages: ImageItem[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/300/300?random=1",
    likes: 1234,
    comments: 89,
    isVideo: false,
    caption: "Beautiful sunset at the beach",
    author: {
      name: "Neymar Jr",
      username: "neymarjr",
      avatar: "https://picsum.photos/50/50?random=1",
    },
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/300/300?random=2",
    likes: 892,
    comments: 45,
    isVideo: true,
    caption: "Training session highlights",
    author: {
      name: "Neymar Jr",
      username: "neymarjr",
      avatar: "https://picsum.photos/50/50?random=2",
    },
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/300/300?random=3",
    likes: 2156,
    comments: 178,
    isVideo: false,
    caption: "Team celebration after victory",
    author: {
      name: "Neymar Jr",
      username: "neymarjr",
      avatar: "https://picsum.photos/50/50?random=3",
    },
  },
];

export default function ProfilePage({ params }: ProfilePageProps) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      console.log("User ID:", resolvedParams.id);
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-background transition-all duration-300 w-full">
      {/* Profile Header */}
      <div className="flex w-full p-4">
        <div className="ml-[10%] flex justify-center">
          <Avatar className="w-[150px] h-[150px]">
            <AvatarImage
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg/500px-20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg"
              alt="Neymar Jr"
            />
            <AvatarFallback>NJ</AvatarFallback>
          </Avatar>
        </div>
        <div className="w-1/2 ml-8">
          <div className="flex items-center gap-3">
            <h1 className="text-lg mr-8">neymarjr {id && `(${id})`}</h1>
            <Button variant="default" size="sm">
              Following
            </Button>
            <Button variant="ghost" size="sm">
              <IoPersonAddOutline className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <MdOutlineMoreHoriz className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <span className="text-sm">
              <strong>1,234</strong> posts
            </span>
            <span className="text-sm">
              <strong>56.7M</strong> followers
            </span>
            <span className="text-sm">
              <strong>789</strong> following
            </span>
          </div>
          <div className="mt-4">
            <h2 className="font-semibold">Neymar Jr</h2>
            <p className="text-sm text-muted-foreground">
              ⚽ Professional Football Player
              <br />
              🇧🇷 Brazil National Team
              <br />
              🏆 PSG & Santos
              <br />
              📧 Management: info@neymarjr.com
            </p>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="px-4 mt-8">
        <div className="ml-[10%] mr-[10%]">
          <h3 className="text-lg font-semibold mb-4">Stories</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <StoryCard {...story} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="px-4 mt-8">
        <div className="ml-[10%] mr-[10%]">
          <div className="border-t border-border pt-8">
            <div className="flex justify-center gap-8 mb-6">
              <button className="flex items-center gap-2 text-xs font-semibold text-foreground border-t-2 border-foreground pt-4">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h4v4H4V4zm0 6h4v4H4v-4zm0 6h4v4H4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4z" />
                </svg>
                POSTS
              </button>
            </div>
            <ImageList
              images={sampleImages}
              columns={3}
              gap={2}
              showOverlay={true}
              onImageClick={(image) => console.log("Clicked image:", image)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
