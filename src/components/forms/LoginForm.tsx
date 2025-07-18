"use client";

import React from "react";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";
import { Box, Button, Checkbox, Input, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { useLogin } from "@/hooks";
import { toaster } from "@/components/ui/toaster";

export function LoginForm() {
  const [isResendEmail, setIsResendEmail] = React.useState(false);
  const [isDisabledResendEmail, setIsDisabledResendEmail] =
    React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const {
    mutate: loginUser,
    isError,
    isPending,
    error: loginError,
  } = useLogin();

  const handleResendEmail = () => {
    toaster.create({
      title: "Verification Email Resent",
      description: "Please check your inbox for the verification email.",
      type: "success",
    });
    setIsResendEmail(true);
    setIsDisabledResendEmail(true);
    setTimeout(() => {
      setIsDisabledResendEmail(false);
    }, 5000);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data, {
        onSuccess: (response) => {
          if (response.data.requiresEmailVerification) {
            toaster.create({
              title: "Email Verification Required",
              description: "Please verify your email to complete the login.",
              type: "info",
            });

            setIsResendEmail(true);
            return;
          }

          if (response.data.user && response.data.accessToken) {
            toaster.create({
              title: "Login Successful",
              description: "Welcome back! You have successfully logged in.",
              type: "success",
            });
          } else {
            toaster.create({
              title: "Login Failed",
              description: "Invalid response from server. Please try again.",
              type: "error",
            });
          }
        },
      });
      if (isError) {
        toaster.create({
          title: "Login Failed",
          description:
            typeof loginError === "object" &&
            loginError !== null &&
            "message" in loginError
              ? (loginError as { message?: string }).message ||
                "An error occurred during login."
              : "An error occurred during login.",
          type: "error",
        });
      }
    } catch (error) {
      toaster.create({
        title: "Login Failed",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message ||
              "An error occurred during login."
            : "An error occurred during login.",
      });
    }
  };

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
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Box mb={2}>
              <Text fontWeight="medium" mb={3}>
                Email
              </Text>
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                mb={1}
                p={4}
                width={"100%"}
                borderRadius={"lg"}
                boxShadow={"sm"}
                borderColor={errors.email ? "red.500" : "gray.300"}
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm" mt={1} mb={2}>
                  {errors.email.message}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontWeight="medium" mb={3}>
                Password
              </Text>
              <Input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                mb={1}
                p={4}
                width={"100%"}
                borderRadius={"lg"}
                boxShadow={"sm"}
                borderColor={errors.password ? "red.500" : "gray.300"}
              />
              {errors.password && (
                <Text color="red.500" fontSize="sm" mt={1} mb={2}>
                  {errors.password.message}
                </Text>
              )}
            </Box>

            {isResendEmail && (
              <Text
                color={isDisabledResendEmail ? "gray.400" : "blue.500"}
                fontSize="sm"
                mt={2}
                mb={2}
                onClick={isDisabledResendEmail ? undefined : handleResendEmail}
                cursor={isDisabledResendEmail ? "not-allowed" : "pointer"}
                _hover={
                  isDisabledResendEmail ? {} : { textDecoration: "underline" }
                }
                aria-disabled={isDisabledResendEmail}
              >
                Resend verification email?
              </Text>
            )}

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
              <Button
                type="submit"
                w={"full"}
                bg="#EA454C"
                rounded={"xl"}
                size={"lg"}
                boxShadow={"sm"}
                loading={isPending || isSubmitting}
                loadingText="Signing in..."
                _hover={{ bg: "#d63384" }}
                _active={{ bg: "#b02a37" }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
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
              Don&apos;t have an account?{" "}
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
