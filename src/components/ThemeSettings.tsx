"use client";
import { Box, VStack, Text, Button, HStack, Container } from "@chakra-ui/react";
import { useTheme } from "./ThemeProvider";

export function ThemeSettings() {
  const { mode, setMode, actualTheme } = useTheme();

  return (
    <Container maxW="md" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Theme Settings
          </Text>
          <Text color="text.secondary">Choose your preferred theme mode</Text>
        </Box>

        <Box
          bg="bg.canvas"
          p={6}
          rounded="lg"
          border="1px"
          borderColor="gray.200"
        >
          <VStack gap={4} align="stretch">
            <Text fontWeight="semibold">Theme Mode</Text>

            <HStack gap={2}>
              <Button
                variant={mode === "light" ? "solid" : "outline"}
                colorScheme={mode === "light" ? "blue" : "gray"}
                onClick={() => setMode("light")}
                size="sm"
              >
                Light
              </Button>
              <Button
                variant={mode === "dark" ? "solid" : "outline"}
                colorScheme={mode === "dark" ? "blue" : "gray"}
                onClick={() => setMode("dark")}
                size="sm"
              >
                Dark
              </Button>
              <Button
                variant={mode === "system" ? "solid" : "outline"}
                colorScheme={mode === "system" ? "blue" : "gray"}
                onClick={() => setMode("system")}
                size="sm"
              >
                System
              </Button>
            </HStack>

            <Box p={4} bg="bg.surface" rounded="md">
              <Text fontSize="sm" color="text.secondary">
                Current mode: <strong>{mode}</strong>
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Active theme: <strong>{actualTheme}</strong>
              </Text>
            </Box>
          </VStack>
        </Box>

        <Box
          bg="bg.canvas"
          p={6}
          rounded="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Text fontWeight="semibold" mb={4}>
            Preview
          </Text>
          <VStack gap={3} align="stretch">
            <Text color="text.primary">Primary text color</Text>
            <Text color="text.secondary">Secondary text color</Text>
            <Button colorScheme="brand" size="sm">
              Brand Button
            </Button>
            <Box
              bg="brand.500"
              color="white"
              p={3}
              rounded="md"
              textAlign="center"
            >
              Brand Background
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
