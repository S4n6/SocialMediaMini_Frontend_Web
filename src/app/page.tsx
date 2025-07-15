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
        <Text fontSize="lg" textAlign="center" color="gray.600">
          You&#39;re successfully logged in! Explore your social media
          experience.
        </Text>

        <VStack gap={4}>
          <Link href="/feed">
            <Button size="lg" colorScheme="blue">
              Go to Feed
            </Button>
          </Link>
          <Link href="/profile">
            <Button size="lg" variant="outline">
              View Profile
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Container>
  );
}
