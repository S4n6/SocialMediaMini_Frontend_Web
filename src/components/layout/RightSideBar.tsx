import { Box } from "@chakra-ui/react";
import React from "react";
import FriendSuggestionSection from "../friendSuggestion/friendSuggestionSection";
import { Footer } from "./Footer";

export default function RightSideBar() {
  return (
    <Box
      width={"100%"}
      p={{ base: 2, md: 4, lg: 6 }}
      bg={{ base: "white", _dark: "gray.800" }}
    >
      <Box display={"flex"} flexDirection="column" gap={6}>
        <FriendSuggestionSection />
        <Footer />
      </Box>
    </Box>
  );
}
