import { Container, Text, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Container maxW="container.xl" py={12}>
      <VStack gap={8}>
        <Text
          fontSize="3xl"
          fontWeight="bold"
          textAlign="center"
          color="brand.500"
        >
          Welcome to SocialMini!
        </Text>
        <Text fontSize="lg" textAlign="center">
          You&#39;re successfully logged in! Explore your social media
          experience.
        </Text>
      </VStack>
    </Container>
  );
}
