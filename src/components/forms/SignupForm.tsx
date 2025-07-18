"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  signupSchema,
  type SignupFormData,
  type RegisterFormData,
} from "@/lib/validations/schemas";
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
import { useRegister } from "@/hooks/useAuth";
import { toaster } from "@/components/ui/toaster";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      gender: "male",
    },
  });

  const { mutate: registerUser, isPending } = useRegister();

  const birthdate = watch("birthdate");
  const gender = watch("gender");

  const onSubmit = (data: SignupFormData) => {
    const registerData: RegisterFormData = {
      fullname: data.fullName,
      username: data.email.split("@")[0],
      email: data.email,
      password: data.password,
      birthDate: data.birthdate,
      gender: data.gender,
    };

    registerUser(registerData, {
      onSuccess: (response) => {
        toaster.create({
          title: "Registration Successful",
          description: "Welcome to Social Media ST! You can now log in.",
          type: "success",
        });
      },
      onError: (error) => {
        console.error("Registration failed:", error);
        // Extract error message from the error object
        let errorMessage = "An error occurred during registration.";
        if (error && typeof error === "object") {
          if ("message" in error && typeof error.message === "string") {
            errorMessage = error.message;
          } else if (
            "response" in error &&
            error.response &&
            typeof error.response === "object"
          ) {
            const response = error.response as { data?: { message?: string } };
            if (response.data?.message) {
              errorMessage = response.data.message;
            }
          }
        }
        toaster.create({
          title: "Registration Failed",
          description: errorMessage,
          type: "error",
        });
      },
    });
  };

  const handleBirthdateChange = (value: string) => {
    setValue("birthdate", value, { shouldValidate: true });
  };

  const handleGenderChange = (value: string) => {
    setValue("gender", value as "male" | "female", { shouldValidate: true });
  };

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      width={1080}
      height={700}
      display="flex"
      justifyContent="center"
      alignItems="center"
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
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="2xl" mb={2} fontWeight="bold">
            SIGN UP TO SOCIAL MEDIA
          </Text>
          <Text fontSize="sm" mb={4}>
            Create your account to connect with friends and share your moments
          </Text>
        </Box>

        <Box width="60%" mt={4}>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4} align="stretch">
              {/* Full Name Field */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Full Name
                </Text>
                <Input
                  {...register("fullName")}
                  type="text"
                  placeholder="Enter your full name"
                  p={4}
                  width="100%"
                  borderRadius="lg"
                  boxShadow="sm"
                  borderColor={errors.fullName ? "red.500" : "gray.300"}
                />
                {errors.fullName && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.fullName.message}
                  </Text>
                )}
              </Box>

              {/* Email Field */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Email
                </Text>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  p={4}
                  width="100%"
                  borderRadius="lg"
                  boxShadow="sm"
                  borderColor={errors.email ? "red.500" : "gray.300"}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.email.message}
                  </Text>
                )}
              </Box>

              {/* Birthdate Field */}
              <Box>
                <CustomDatePicker
                  label="Birthdate"
                  value={birthdate || ""}
                  onChange={handleBirthdateChange}
                  isRequired
                  error={errors.birthdate?.message}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Password
                </Text>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Enter your password"
                  p={4}
                  width="100%"
                  borderRadius="lg"
                  boxShadow="sm"
                  borderColor={errors.password ? "red.500" : "gray.300"}
                />
                {errors.password && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.password.message}
                  </Text>
                )}
              </Box>

              {/* Confirm Password Field */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Confirm Password
                </Text>
                <Input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Enter your confirm password"
                  p={4}
                  width="100%"
                  borderRadius="lg"
                  boxShadow="sm"
                  borderColor={errors.confirmPassword ? "red.500" : "gray.300"}
                />
                {errors.confirmPassword && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </Box>

              {/* Gender Field */}
              <Box display="flex" alignItems="center" textAlign="center">
                <Text fontWeight="medium" mr={2}>
                  Gender:{" "}
                </Text>

                <RadioGroup.Root
                  value={gender}
                  onValueChange={(e) => handleGenderChange(e.value ?? "male")}
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
              {errors.gender && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.gender.message}
                </Text>
              )}

              {/* Submit Button */}
              <Box>
                <Button
                  type="submit"
                  w="full"
                  bg="#EA454C"
                  rounded="xl"
                  size="lg"
                  loading={isPending || isSubmitting}
                  loadingText="Creating account..."
                  _hover={{ bg: "#d63384" }}
                  _active={{ bg: "#b02a37" }}
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                >
                  <Text color="white" fontSize="sm">
                    Sign Up
                  </Text>
                </Button>
              </Box>

              <Text textAlign="center" fontSize="sm">
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
    </Box>
  );
}
