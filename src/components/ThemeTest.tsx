"use client";

import { Box, Text } from "@chakra-ui/react";
import { useTheme } from "./ThemeProvider";

export function ThemeTest() {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      m={4}
    >
      <Text mb={2}>Current theme: {actualTheme}</Text>
      <button
        onClick={toggleTheme}
        style={{
          padding: "8px 16px",
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Toggle Theme
      </button>

      <Box mt={4} p={4} bg="bg.canvas" borderRadius="md">
        <Text color="text.primary">This should use bg.canvas</Text>
      </Box>

      <Box mt={2} p={4} bg="bg.surface" borderRadius="md">
        <Text color="text.primary">This should use bg.surface</Text>
      </Box>

      <Box mt={2} p={4} bg="bg.elevated" borderRadius="md">
        <Text color="text.primary">This should use bg.elevated</Text>
      </Box>
    </Box>
  );
}
