import { Avatar, Box, Button } from "@chakra-ui/react";
import React from "react";

export default function FriendSuggestionCard({
  name = "Segun Adebayo",
  username = "segun.adebayo",
  avatarUrl = "https://bit.ly/sage-adebayo",
}) {
  return (
    <Box gap={4} display="flex" alignItems={"center"} justifyContent={"center"}>
      <Avatar.Root size={"xs"}>
        <Avatar.Fallback name="Segun Adebayo" />
        <Avatar.Image src="https://bit.ly/sage-adebayo" />
      </Avatar.Root>
      <Box fontSize="sm" fontWeight="bold">
        Segun Adebayo
        <Box as="span" color="gray.500" fontWeight="normal">
          {" "}
          @segun.adebayo
        </Box>
      </Box>
      <Button variant={"outline"} size="sm" ml="auto">
        Follow
      </Button>
    </Box>
  );
}
