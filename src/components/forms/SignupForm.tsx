"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema, type SignupFormData } from "@/lib/validations/schemas";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { useRegister, useGoogleLogin } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
  });

  const registerMutation = useRegister();
  const googleLogin = useGoogleLogin();

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Transform data to match registerSchema format
      const registerData = {
        fullname: data.fullName,
        username: data.fullName.toLowerCase().replace(/\s+/g, ""), // Generate username from fullName
        email: data.email,
        password: data.password,
        birthDate: data.birthdate,
        gender: data.gender,
      };
      await registerMutation.mutateAsync(registerData);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleGoogleSignup = () => {
    googleLogin.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="SocialMediaMini Logo"
              width={40}
              height={40}
              className="dark:invert"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            Sign up to see photos and videos from your friends.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLogin.isPending}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Log in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input id="birthdate" type="date" {...register("birthdate")} />
              {errors.birthdate && (
                <p className="text-sm text-red-500">
                  {errors.birthdate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={(value: string) =>
                  setValue("gender", value as "male" | "female")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            {registerMutation.isError && (
              <div className="text-sm text-red-500 text-center">
                Something went wrong. Please try again.
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending
                ? "Signing up..."
                : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
