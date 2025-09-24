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
import ForgotPasswordModal from "../forgot-password";
import { useForgotPassword } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isResendEmail, setIsResendEmail] = React.useState(false);
  const [isDisabledResendEmail, setIsDisabledResendEmail] =
    React.useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const { mutate: loginUser, isPending: isLoginPending } = useLogin();

  const { mutate: loginWithGoogle, isPending: isGoogleLoginPending } =
    useGoogleLogin();

  const { mutate: forgotPassword } = useForgotPassword();

  const handleForgotPassword = async (email: string) => {
    console.log("Forgot password requested for email:", email);
    forgotPassword(email, {
      onSuccess: () => {
        toast.success(
          "Password reset email sent! Please check your inbox for further instructions."
        );
        setIsForgotPasswordOpen(false);
      },
      onError: (error) => {
        console.error("Forgot password error:", error);
        toast.error(
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message +
                " when requesting password reset."
            : "An error occurred while requesting password reset."
        );
      },
    });
  };

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

  const onSubmit = (data: LoginFormData) => {
    loginUser(data, {
      onSuccess: (data) => {
        if (
          "requiresEmailVerification" in data.data &&
          data.data.requiresEmailVerification
        ) {
          toast.error(
            "Email verification required. Please check your inbox for the verification email."
          );
          return;
        }

        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      },
      onError: (error) => {
        // Try to detect HTTP status from common error shapes (Axios, fetch wrappers, etc.)
        let status: number | undefined;
        if (error && typeof error === "object" && error !== null) {
          const errObj = error as {
            response?: { status?: number };
            status?: number;
            statusCode?: number;
          };
          status =
            errObj.response?.status ?? errObj.status ?? errObj.statusCode;
        }

        if (status === 401) {
          // 401 -> incorrect credentials
          toast.error("Incorrect login credentials.");
          return;
        }

        if (typeof error === "object" && error !== null && "message" in error) {
          const msg = (error as { message?: string }).message;
          toast.error((msg ?? "") + " when logging in.");
          return;
        }

        toast.error("An error occurred while logging in.");
      },
    });
  };

  return (
    <div className="w-[1080px] h-[650px] flex">
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

              <ForgotPasswordModal
                open={isForgotPasswordOpen}
                onOpenChange={setIsForgotPasswordOpen}
                onSubmit={handleForgotPassword}
              />
            </div>

            <div className="mt-4">
              <Button
                type="submit"
                className="w-full bg-[#EA454C] hover:bg-[#d63384] active:bg-[#b02a37] rounded-xl text-white text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                size="lg"
                disabled={isLoginPending || isSubmitting}
              >
                {isLoginPending || isSubmitting ? "Signing in..." : "Sign In"}
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
