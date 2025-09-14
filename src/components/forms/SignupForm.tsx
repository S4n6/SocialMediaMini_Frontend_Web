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
      const registerData = {
        fullname: data.fullName,
        username: data.fullName.toLowerCase().replace(/\s+/g, ""),
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
    <div className="w-[1080px] h-[650px] flex justify-center items-center">
      <div className="flex-1">
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
      <Card className="flex-1 border-0 shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold">
            Create an account
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Join now — it only takes a minute.
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="mb-3">
            <Button
              variant="outline"
              className="w-full h-9 flex items-center justify-center gap-2 text-sm"
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLogin.isPending}
            >
              <FcGoogle className="h-4 w-4" />
              Sign up with Google
            </Button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 mt-4">
            <div className="w-full">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <Label htmlFor="fullName" className="text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="birthdate" className="text-sm">
                  Birthdate
                </Label>
                <Input id="birthdate" type="date" {...register("birthdate")} />
                {errors.birthdate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.birthdate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm">
                  Gender
                </Label>
                <Select
                  onValueChange={(value: string) =>
                    setValue("gender", value as "male" | "female")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-white dark:bg-gray-800">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm">
                  Confirm
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {registerMutation.isError && (
              <div className="text-sm text-red-500 text-center">
                Something went wrong. Please try again.
              </div>
            )}

            <Button
              type="submit"
              className={`w-full h-10 my-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow rounded-md ${
                isSubmitting || registerMutation.isPending
                  ? "opacity-80 cursor-not-allowed shadow-none"
                  : "cursor-pointer"
              }`}
              disabled={isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending
                ? "Signing up..."
                : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground mt-3">
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

          <div className="text-center mt-3">
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
