"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { useLogin, useGoogleLogin } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// ...existing code...

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

  const { mutate: loginWithGoogle, isPending: isGoogleLoginPending } =
    useGoogleLogin();

  const handleResendEmail = () => {
    console.log(
      "Verification Email Resent - Please check your inbox for the verification email."
    );
    setIsResendEmail(true);
    setIsDisabledResendEmail(true);
    setTimeout(() => {
      setIsDisabledResendEmail(false);
    }, 5000);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("Submitting login form with data:", data);
      await loginUser(data, {
        onSuccess: (response) => {
          if (response.data.requiresEmailVerification) {
            console.log(
              "Email Verification Required - Please verify your email to complete the login."
            );

            setIsResendEmail(true);
            return;
          }

          if (response.data.user && response.data.accessToken) {
            console.log("Login Successful - Welcome back!");
          } else {
            console.log(
              "Login Failed - Invalid response from server. Please try again."
            );
          }
        },
      });
      if (isError) {
        console.log(
          "Login Failed - Please check your credentials and try again:",
          typeof loginError === "object" &&
            loginError !== null &&
            "message" in loginError
            ? (loginError as { message?: string }).message ||
                "An error occurred during login."
            : "An error occurred during login."
        );
      }
    } catch (error) {
      console.log(
        "Login Failed - An error occurred during login:",
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
              "An error occurred during login."
          : "An error occurred during login."
      );
    }
  };

  return (
    <div className="w-[1080px] h-[650px] flex justify-center items-center">
      {/* Left side */}
      <div className="w-1/2 flex justify-center items-center flex-col">
        <div className="flex flex-col w-full justify-center items-center mt-16">
          <h1 className="text-2xl mb-4 font-bold">SOCIAL MEDIA ST</h1>
          <p className="text-sm mb-4 text-muted-foreground">
            Welcome Back! Please login to your account to continue.
          </p>
        </div>

        <div className="w-3/5 mt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <Label htmlFor="email" className="font-medium mb-3 block">
                Email
              </Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full p-4 rounded-lg shadow-sm ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 mb-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="font-medium mb-3 block">
                Password
              </Label>
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Enter your password"
                className={`w-full p-4 rounded-lg shadow-sm ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 mb-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {isResendEmail && (
              <p
                className={`text-sm mt-2 mb-2 cursor-pointer hover:underline ${
                  isDisabledResendEmail
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500"
                }`}
                onClick={isDisabledResendEmail ? undefined : handleResendEmail}
              >
                Resend verification email?
              </p>
            )}

            <div className="flex justify-between items-center mt-3 text-center">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>

              <Link href="/forgot-password">
                <span className="text-sm text-primary hover:underline">
                  Forgot password?
                </span>
              </Link>
            </div>

            <div className="mt-4">
              <Button
                type="submit"
                className="w-full bg-[#EA454C] hover:bg-[#d63384] active:bg-[#b02a37] rounded-xl text-white text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                size="lg"
                disabled={isPending || isSubmitting}
              >
                {isPending || isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl mt-2 shadow-sm"
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={isGoogleLoginPending}
              >
                <FcGoogle size="20" className="mr-2" />
                <span className="text-foreground text-sm">
                  Continue with Google
                </span>
              </Button>
            </div>

            <p className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                <span className="text-[#EA454C] font-semibold cursor-pointer hover:underline">
                  Sign up to free!
                </span>
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2">
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
      </div>
    </div>
  );
}
