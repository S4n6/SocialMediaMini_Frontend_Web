import { Box } from "@chakra-ui/react";
import React from "react";

import FriendSuggestionCard from "./friendSuggestionCard";

export default function FriendSuggestionSection() {
  return (
    <Box>
      <Box fontSize="lg" fontWeight="bold" mb={4}>
        Friend Suggestions
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap={8}
        maxHeight="400px"
        overflowY="auto"
      >
        <FriendSuggestionCard />
        <FriendSuggestionCard />
        <FriendSuggestionCard />
      </Box>
    </Box>
  );
}
