import { Box } from "@chakra-ui/react";
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
  onStoryClick,
  onAddStoryClick,
}: StoriesContainerProps) {
  return (
    <Box
      width={"100%"}
      display="flex"
      gap={4}
      overflowX="auto"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      px={4}
      py={2}
      justifyContent="flex-start"
      alignItems="center"
      flexWrap={"nowrap"}
      minWidth={0}
    >
      {/* Add Story Card (if current user exists) */}
      {currentUser && (
        <Box flexShrink={0}>
          <StoryCard
            user={currentUser}
            isAddStory={true}
            onClick={onAddStoryClick}
          />
        </Box>
      )}

      {/* Story Cards */}
      {stories.map((story) => (
        <Box key={story.id} flexShrink={0}>
          <StoryCard
            user={story.user}
            storyImage={story.storyImage}
            isViewed={story.isViewed}
            onClick={() => onStoryClick?.(story.id)}
          />
        </Box>
      ))}
    </Box>
  );
}
