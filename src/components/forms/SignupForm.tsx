"use client";

import React from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  RadioGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";

export function SignupForm() {
  const [gender, setGender] = React.useState("male");
  const [birthdate, setBirthdate] = React.useState("");

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      width={1080}
      height={700}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      {/* Left side */}
      <Box width="50%">
        <Image
          src="/images/loginPage.png"
          alt="Social media illustration - people connecting and sharing"
          style={{
            objectFit: "cover",
            transform: "scaleX(-1)",
          }}
          width={540}
          height={700}
          priority
        />
      </Box>

      {/* Right side */}
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
        >
          <Text fontSize="2xl" mb={2} fontWeight={"bold"}>
            SIGN UP TO SOCIAL MEDIA
          </Text>
          <Text fontSize="sm" mb={4}>
            Create your account to connect with friends and share your moments
          </Text>
        </Box>

        <Box width="60%" mt={4}>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontWeight="medium" mb={2}>
                Full Name
              </Text>
              <Input
                type="text"
                placeholder="Enter your full name"
                p={4}
                width={"100%"}
                borderRadius={"lg"}
                boxShadow={"sm"}
              />
            </Box>

            <Box>
              <Text fontWeight="medium" mb={2}>
                Email
              </Text>
              <Input
                type="email"
                placeholder="Enter your email"
                p={4}
                width={"100%"}
                borderRadius={"lg"}
                boxShadow={"sm"}
              />
            </Box>

            <CustomDatePicker
              label="Birthdate"
              value={birthdate}
              onChange={setBirthdate}
              isRequired
            />

            <Box>
              <Text fontWeight="medium" mb={2}>
                Password
              </Text>
              <Input
                type="password"
                placeholder="Enter your password"
                p={4}
                width={"100%"}
                borderRadius={"lg"}
                boxShadow={"sm"}
              />
            </Box>

            <Box>
              <Text fontWeight="medium" mb={2}>
                Confirm Password
              </Text>
              <Input
                type="password"
                placeholder="Enter your confirm password"
                p={4}
                width={"100%"}
                borderRadius={"lg"}
                boxShadow={"sm"}
              />
            </Box>

            <Box display={"flex"} alignItems="center" textAlign={"center"}>
              <Text fontWeight="medium" mr={2}>
                Gender:{" "}
              </Text>

              <RadioGroup.Root
                value={gender}
                onValueChange={(e) => setGender(e.value ?? "male")}
              >
                <HStack gap={4}>
                  <RadioGroup.Item key="gender1" value="male">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>Male</RadioGroup.ItemText>
                  </RadioGroup.Item>

                  <RadioGroup.Item key="gender2" value="female">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>Female</RadioGroup.ItemText>
                  </RadioGroup.Item>
                </HStack>
              </RadioGroup.Root>
            </Box>

            <Box>
              <Button w={"full"} bg="#EA454C" rounded={"xl"} size={"lg"}>
                <Text color="white" fontSize={"sm"}>
                  Sign Up
                </Text>
              </Button>
            </Box>

            <Text textAlign="center" fontSize={"sm"}>
              Already have an account?{" "}
              <Link href="/login">
                <Text
                  as="span"
                  color="#EA454C"
                  fontWeight="semibold"
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign In
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
