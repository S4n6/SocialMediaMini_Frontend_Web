"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@chakra-ui/react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ColorModeButton } from "../ui/color-mode";

export function ChakraHeader() {
  const { user, isAuthenticated, isLoading } = {
    user: { name: "John Doe", email: "sa@gail.com" },
    isAuthenticated: true,
    isLoading: false,
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" shadow="sm">
      <Flex
        maxW="4xl"
        mx="auto"
        px={4}
        py={3}
        align="center"
        justify="space-between"
      >
        <Link href="/" passHref>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="brand.500"
            cursor="pointer"
            _hover={{ color: "brand.600" }}
          >
            SocialMini
          </Text>
        </Link>

        {isAuthenticated && (
          <HStack gap={6} display={{ base: "none", md: "flex" }}>
            <Link href="/feed" passHref>
              <ChakraLink
                color="gray.600"
                _hover={{ color: "gray.900" }}
                textDecoration="none"
              >
                Feed
              </ChakraLink>
            </Link>
            <Link href="/profile" passHref>
              <ChakraLink
                color="gray.600"
                _hover={{ color: "gray.900" }}
                textDecoration="none"
              >
                Profile
              </ChakraLink>
            </Link>
          </HStack>
        )}

        <HStack gap={4}>
          <ColorModeButton />
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <MenuRoot>
                  <MenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HStack>
                        <Box
                          w="8"
                          h="8"
                          borderRadius="full"
                          bg="brand.500"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                        </Box>
                        <Text
                          fontSize="sm"
                          display={{ base: "none", md: "block" }}
                        >
                          {user?.name || user?.email}
                        </Text>
                      </HStack>
                    </Button>
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem value="signout" onClick={handleSignOut}>
                      Sign Out
                    </MenuItem>
                  </MenuContent>
                </MenuRoot>
              ) : (
                <>
                  <Link href="/login" passHref>
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" passHref>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
