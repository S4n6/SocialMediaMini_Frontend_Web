'use client';

import RightSideBar from '@/components/layout/RightSideBar';
import { PostSection } from '@/features/posts';
import {
  StoriesSection,
  useFeedStories,
  useCreateStory,
  useViewStory,
} from '@/features/story';
import FriendSuggestionSection from '@/features/feed/components/friend-suggestion/friendSuggestionSection';
import StoriesSkeleton from '@/features/story/components/StoriesSkeleton';
import { Suspense } from 'react';

export default function Home() {
  // --- Inline mock data for quick UI preview ---
  const mockPosts = [
    {
      id: 'post1',
      author: {
        id: 'user1',
        name: 'John Doe',
        username: 'johndoe',
        avatar: 'https://bit.ly/sage-adebayo',
      },
      content:
        'Just finished building an amazing React component! Love how clean the code turned out. 🚀',
      timestamp: '2h',
      likes: 24,
      comments: 5,
      isLiked: false,
      isBookmarked: false,
      images: [
        {
          id: 'img1',
          imageUrl:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          caption: 'A beautiful scenery!',
        },
        {
          id: 'img2',
          imageUrl:
            'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
          caption: 'City lights at night',
        },
      ],
    },
    {
      id: 'post2',
      author: {
        id: 'user2',
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: 'https://bit.ly/sage-adebayo',
      },
      content:
        'Beautiful sunset today! Pause and appreciate the little moments. 🌅',
      timestamp: '4h',
      likes: 67,
      comments: 12,
      isLiked: true,
      isBookmarked: true,
      images: [
        {
          id: 'img5',
          imageUrl:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
          caption: 'Golden hour sunset',
        },
      ],
    },
  ];

  const mockStories = [
    {
      id: 'story1',
      userId: 'user1',
      user: {
        id: 'user1',
        name: 'Kai Cenat',
        username: 'kaicenat',
        avatar:
          'https://yt3.googleusercontent.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s160-c-k-c0x00ffffff-no-rj',
      },
      mediaUrl:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      mediaType: 'image',
      duration: 24,
      createdAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-16T10:00:00Z',
      views: [],
      isViewed: false,
    },
    {
      id: 'story2',
      userId: 'user2',
      user: {
        id: 'user2',
        name: 'Kylian Mbappé',
        username: 'k.mbappe',
        avatar:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kylian_Mbapp%C3%A9_2024.jpg/800px-Kylian_Mbapp%C3%A9_2024.jpg',
      },
      mediaUrl:
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      mediaType: 'image',
      duration: 24,
      createdAt: '2024-01-15T08:00:00Z',
      expiresAt: '2024-01-16T08:00:00Z',
      views: [],
      isViewed: true,
    },
    {
      id: 'story3',
      userId: 'user3',
      user: {
        id: 'user3',
        name: 'Alice Johnson',
        username: 'alicej',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      },
      mediaUrl:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
      mediaType: 'image',
      duration: 24,
      createdAt: '2024-01-14T20:00:00Z',
      expiresAt: '2024-01-15T20:00:00Z',
      views: [],
      isViewed: false,
    },
    {
      id: 'story4',
      userId: 'user4',
      user: {
        id: 'user4',
        name: 'Bob Williams',
        username: 'bobw',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      },
      mediaUrl:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
      mediaType: 'image',
      duration: 24,
      createdAt: '2024-01-14T20:00:00Z',
      expiresAt: '2024-01-15T20:00:00Z',
      views: [],
      isViewed: false,
    },
    {
      id: 'story5',
      userId: 'user5',
      user: {
        id: 'user5',
        name: 'Charlie Brown',
        username: 'charlieb',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      mediaUrl:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
      mediaType: 'image',
      duration: 24,
      createdAt: '2024-01-14T20:00:00Z',
      expiresAt: '2024-01-15T20:00:00Z',
      views: [],
      isViewed: false,
    },
    {
      id: 'story6',
      userId: 'user6',
      user: {
        id: 'user6',
        name: 'David Smith',
        username: 'davids',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      },
      mediaUrl:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
      mediaType: 'image',
      duration: 24,
      createdAt: '2024-01-14T20:00:00Z',
      expiresAt: '2024-01-15T20:00:00Z',
      views: [],
      isViewed: false,
    },
  ];

  // TODO: replace with real `useFeed` hook later. For now use mock feed shape
  const feedData = { pages: [{ data: mockPosts }], pageParams: [1] } as any;
  const postsLoading = false;
  const postsError = null as any;
  const fetchNextPage = () => {};
  const hasNextPage = false;
  const isFetchingNextPage = false;

  const { data: storiesData, isLoading: storiesLoading } = useFeedStories();

  const createStory = useCreateStory();
  const viewStory = useViewStory();

  const currentUser = {
    id: 'current-user',
    fullName: 'You',
    userName: 'your_story',
    email: 'you@example.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  // Event handlers
  const handleStoryClick = (storyId: string) => {
    viewStory.mutate(storyId);
  };

  const handleAddStoryClick = () => {
    // Open story creation modal or navigate to create story page
    console.log('Add story clicked');
  };

  const handleLoadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Extract posts from infinite query
  const posts = feedData?.pages.flatMap((page: any) => page.data) || [];
  const stories = storiesData?.data || [];

  // Handle error messages
  const postsErrorMessage = postsError?.message || null;

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Main Content */}
      <div className="flex-1 lg:w-3/4 p-4 lg:p-6 max-w-full lg:max-w-4xl mx-auto">
        {/* Stories Section */}
        <Suspense fallback={<StoriesSkeleton />}>
          <StoriesSection
            stories={(stories.length > 0 ? stories : mockStories) as any}
            currentUser={currentUser}
            onStoryClick={handleStoryClick}
            onAddStoryClick={handleAddStoryClick}
          />
        </Suspense>

        {/* Posts Section */}
        <PostSection
          posts={(posts.length > 0 ? posts : mockPosts) as any}
          isLoading={postsLoading}
          error={postsErrorMessage}
          onLoadMore={handleLoadMorePosts}
          hasMore={hasNextPage}
        />
      </div>

      {/* Right Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block lg:w-1/4 p-4 border-l border-gray-200 dark:border-gray-700">
        <div className="sticky top-4 space-y-6">
          <FriendSuggestionSection />
          <RightSideBar />
        </div>
      </div>
    </div>
  );
}
