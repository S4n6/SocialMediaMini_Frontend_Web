import StoryCard from "@/components/story/StoryCard";

interface StoriesContainerProps {
  stories: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
    };
    storyImage?: string;
    isViewed?: boolean;
  }>;
  currentUser?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  onStoryClick?: (storyId: string) => void;
  onAddStoryClick?: () => void;
}

export function StoriesSection({
  stories,
  currentUser,
}: StoriesContainerProps) {
  return (
    <div
      className="w-full flex gap-4 overflow-x-auto px-4 py-2 justify-start items-center flex-nowrap min-w-0"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Add Story Card (if current user exists) */}
      {currentUser && (
        <div className="flex-shrink-0">
          <StoryCard
            id={`add-story-${currentUser.id}`}
            user={currentUser}
            storyImage={currentUser.avatar || "/default-avatar.png"}
            isViewed={false}
          />
        </div>
      )}

      {/* Story Cards */}
      {stories.map((story) => (
        <div key={story.id} className="flex-shrink-0">
          <StoryCard
            id={story.id}
            user={story.user}
            storyImage={story.storyImage || "/default-story.png"}
            isViewed={story.isViewed || false}
          />
        </div>
      ))}
    </div>
  );
}
