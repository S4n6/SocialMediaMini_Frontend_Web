"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";
import { useLogin } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import React from "react";
import { Box, Button, Checkbox, Input, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      width={1080}
      height={650}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      {/* Left side */}
      <Box
        bg={{ base: "white", _dark: "gray.800" }}
        width="50%"
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection="column"
      >
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          justifyContent="center"
          alignItems="center"
          marginTop={16}
        >
          <Text fontSize="2xl" mb={4} fontWeight={"bold"}>
            SOCIAL MEDIA ST
          </Text>
          <Text fontSize="sm" mb={4}>
            Welcome Back! Please login to your account to continue.
          </Text>
        </Box>

        <Box width="60%" mt={4}>
          <Box mb={2}>
            <Text fontWeight="medium" mb={3}>
              Email
            </Text>
            <Input
              type="email"
              placeholder="Enter your email"
              mb={4}
              p={4}
              width={"100%"}
              borderRadius={"lg"}
              boxShadow={"sm"}
            />
          </Box>

          <Box>
            <Text fontWeight="medium" mb={3}>
              Password
            </Text>
            <Input
              type="password"
              placeholder="Enter your password"
              mb={4}
              p={4}
              width={"100%"}
              borderRadius={"lg"}
              boxShadow={"sm"}
            />
          </Box>

          <Box
            display={"flex"}
            justifyContent="space-between"
            alignItems="center"
            mt={3}
            textAlign={"center"}
          >
            <Checkbox.Root
              defaultChecked
              variant={"outline"}
              colorPalette={"white"}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Remember me</Checkbox.Label>
            </Checkbox.Root>

            <Link href="/forgot-password">
              <Text fontSize={"sm"}>Forgot password?</Text>
            </Link>
          </Box>

          <Box mt={4}>
            <Button w={"full"} bg="#EA454C" rounded={"xl"} size={"lg"}>
              <Text color="white" fontSize={"sm"}>
                Sign In
              </Text>
            </Button>

            <Button
              variant="outline"
              size="lg"
              w="full"
              rounded={"xl"}
              mt={2}
              boxShadow={"sm"}
            >
              <FcGoogle size="20" />
              <Text color="black" fontSize={"sm"}>
                Continue with Google
              </Text>
            </Button>
          </Box>

          <Text mt={4} textAlign="center" fontSize={"sm"}>
            Don't have an account?{" "}
            <Link href="/signup">
              <Text
                as="span"
                color="#EA454C"
                fontWeight="semibold"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                Sign up to free!
              </Text>
            </Link>
          </Text>
        </Box>
      </Box>

      {/* Right side */}
      <Box width="50%">
        <Image
          src="/images/loginPage.png"
          alt="Social media illustration - people connecting and sharing"
          style={{
            objectFit: "cover",
          }}
          width={540}
          height={650}
          priority
        />
      </Box>
    </Box>
  );
}
