"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/lib/validations/schemas";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { RequestLoadingWrapper } from "@/components/loading";
import { useAuth } from "../hooks";
import { useEmailCheck, useUsernameCheck } from "../hooks/useAuthQueries";
import { useErrorHandler, useFormErrorHandler } from "@/hooks";
import { ResendVerificationModal } from "./ResendVerificationModal";
import type { RegisterFormData } from "../types";

export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);

  const {
    register: registerUser,
    loginWithGoogle,
    isRegistering,
    isLoggingInWithGoogle,
  } = useAuth();

  const { handleError } = useErrorHandler();
  const { handleValidationError, handleSubmitError } =
    useFormErrorHandler("SignupForm");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const watchedEmail = watch("email");
  const watchedUserName = watch("userName");
  const watchedPassword = watch("password");

  // Real-time validation hooks
  const { data: emailCheck, isLoading: isCheckingEmail } =
    useEmailCheck(watchedEmail);

  const { data: usernameCheck, isLoading: isCheckingUsername } =
    useUsernameCheck(watchedUserName);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Check for existing email/username before submitting
      if (emailCheck?.exists) {
        handleValidationError(new Error("Email already exists"), "email");
        return;
      }

      if (usernameCheck?.exists) {
        handleValidationError(new Error("Username already taken"), "userName");
        return;
      }

      await registerUser(data);
      setShowResendModal(true);
    } catch (error) {
      handleSubmitError(error);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // In a real app, this would integrate with Google OAuth
      console.log("Google signup clicked - integrate with Google OAuth");
      // await loginWithGoogle(googleCredential);
    } catch (error) {
      handleError(error, { action: "google_signup" });
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, text: "", color: "" },
      { score: 1, text: "Very Weak", color: "text-red-500" },
      { score: 2, text: "Weak", color: "text-orange-500" },
      { score: 3, text: "Fair", color: "text-yellow-500" },
      { score: 4, text: "Good", color: "text-blue-500" },
      { score: 5, text: "Strong", color: "text-green-500" },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(watchedPassword || "");

  // Create request state for loading wrapper
  const requestState = {
    isLoading: isRegistering || isSubmitting,
    error: null,
    isSuccess: false,
  };

  return (
    <ComponentErrorBoundary componentName="SignupForm">
      <div className="w-full max-w-7xl mx-auto h-screen flex flex-col lg:flex-row p-8">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex justify-center items-center flex-col p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">
                Join SocialMini and connect with friends
              </p>
            </div>

            <RequestLoadingWrapper
              state={requestState}
              loadingText="Creating your account..."
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    {...register("fullName")}
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className={`${
                      errors.fullName ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isRegistering}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="userName"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("userName")}
                      id="userName"
                      type="text"
                      placeholder="Choose a username"
                      className={`pr-10 ${
                        errors.userName || usernameCheck?.exists
                          ? "border-red-500 focus:ring-red-500"
                          : watchedUserName &&
                            usernameCheck &&
                            !usernameCheck.exists
                          ? "border-green-500 focus:ring-green-500"
                          : ""
                      }`}
                      disabled={isRegistering}
                      onChange={async (e) => {
                        register("userName").onChange(e);
                        if (e.target.value.length > 2) {
                          await trigger("userName");
                        }
                      }}
                    />
                    {isCheckingUsername ? (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    ) : watchedUserName && usernameCheck ? (
                      usernameCheck.exists ? (
                        <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )
                    ) : null}
                  </div>
                  {errors.userName && (
                    <p className="text-red-500 text-sm">
                      {errors.userName.message}
                    </p>
                  )}
                  {usernameCheck?.exists && (
                    <p className="text-red-500 text-sm">
                      Username is already taken
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pr-10 ${
                        errors.email || emailCheck?.exists
                          ? "border-red-500 focus:ring-red-500"
                          : watchedEmail && emailCheck && !emailCheck.exists
                          ? "border-green-500 focus:ring-green-500"
                          : ""
                      }`}
                      disabled={isRegistering}
                      onChange={async (e) => {
                        register("email").onChange(e);
                        if (e.target.value.includes("@")) {
                          await trigger("email");
                        }
                      }}
                    />
                    {isCheckingEmail ? (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    ) : watchedEmail && emailCheck ? (
                      emailCheck.exists ? (
                        <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )
                    ) : null}
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                  {emailCheck?.exists && (
                    <p className="text-red-500 text-sm">
                      Email already exists.{" "}
                      <Link
                        href="/login"
                        className="text-[#EA454C] hover:underline"
                      >
                        Sign in instead?
                      </Link>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className={`pr-10 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      disabled={isRegistering}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isRegistering}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {passwordStrength.score > 0 && (
                    <div className={`text-sm ${passwordStrength.color}`}>
                      Strength: {passwordStrength.text}
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("confirmPassword")}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`pr-10 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      disabled={isRegistering}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isRegistering}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    {...register("termsAccepted")}
                    disabled={isRegistering}
                  />
                  <Label htmlFor="termsAccepted" className="text-sm">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-[#EA454C] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#EA454C] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm">
                    {errors.termsAccepted.message}
                  </p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#EA454C] hover:bg-[#d63384] active:bg-[#b02a37]"
                  size="lg"
                  disabled={
                    isRegistering ||
                    isSubmitting ||
                    emailCheck?.exists ||
                    usernameCheck?.exists
                  }
                >
                  {isRegistering || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Google Signup */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleSignup}
                  disabled={isLoggingInWithGoogle || isRegistering}
                >
                  {isLoggingInWithGoogle ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FcGoogle size="20" className="mr-2" />
                      Sign up with Google
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#EA454C] font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </RequestLoadingWrapper>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="relative h-full">
            <Image
              src="/images/loginPage.png"
              alt="Social media illustration - join our community"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Resend Verification Modal */}
        <ResendVerificationModal
          open={showResendModal}
          onOpenChange={setShowResendModal}
          email={watchedEmail}
        />
      </div>
    </ComponentErrorBoundary>
  );
};
