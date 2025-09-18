"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useResetPassword } from "@/hooks/useAuth";
import { toast } from "sonner";

type Form = {
  password: string;
  confirm: string;
};

export default function ResetPasswordClient() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search?.get("token");

  const [passwordStrength, setPasswordStrength] = React.useState({
    score: 0,
    percent: 0,
    label: "Weak",
    colorClass: "bg-gray-300",
    labelColorClass: "text-gray-500",
    labelColor: "#6b7280",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<Form>({ mode: "onChange" });

  const { mutate: resetPassword, isPending } = useResetPassword();

  React.useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Password strength calculation function
  const calculatePasswordStrength = React.useCallback((pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const percent = Math.round((score / 4) * 100);
    const label =
      score <= 1
        ? "Weak"
        : score === 2
        ? "Okay"
        : score === 3
        ? "Good"
        : "Strong";
    const colorClass =
      score === 0
        ? "bg-gray-300"
        : score === 1
        ? "bg-red-400"
        : score === 2
        ? "bg-orange-400"
        : score === 3
        ? "bg-yellow-400"
        : "bg-green-500";
    const labelColorClass =
      score === 0
        ? "text-gray-500"
        : score === 1
        ? "text-red-500"
        : score === 2
        ? "text-orange-500"
        : score === 3
        ? "text-yellow-600"
        : "text-green-600";
    const labelColor =
      score === 0
        ? "#6b7280"
        : score === 1
        ? "#ef4444"
        : score === 2
        ? "#f97316"
        : score === 3
        ? "#d97706"
        : "#16a34a";

    return { score, percent, label, colorClass, labelColorClass, labelColor };
  }, []);

  // Read password and confirm from useForm
  const password = watch("password", "");
  const confirmPassword = watch("confirm", "");

  // Update password strength when password changes
  React.useEffect(() => {
    const newStrength = calculatePasswordStrength(password || "");
    setPasswordStrength(newStrength);
  }, [password, calculatePasswordStrength]);

  async function onSubmit() {
    if (!token) return;
    if (password !== confirmPassword) return;
    resetPassword(
      { token, newPassword: password, confirmPassword },
      {
        onSuccess: () => {
          toast.success("Password has been reset successfully!");
          router.push("/login");
        },
        onError: (error) => {
          console.error("Reset password error:", error);
          toast.error("Failed to reset password.");
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-semibold">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create a strong password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              {...register("confirm", {
                validate: (v) => v === password || "Passwords do not match",
              })}
            />
            {errors.confirm && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirm.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <div
                className="h-2 rounded-lg bg-gray-200 overflow-hidden min-w-0"
                aria-hidden
              >
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={passwordStrength.percent}
                  aria-label={`Password strength ${passwordStrength.percent} percent`}
                  className={`h-full origin-left transition-transform ${passwordStrength.colorClass}`}
                  style={{
                    width: "100%",
                    transform: `scaleX(${
                      passwordStrength.percent / 100
                    }) translateZ(0)`,
                    transformOrigin: "left",
                    WebkitTransform: `scaleX(${
                      passwordStrength.percent / 100
                    }) translateZ(0)`,
                    backgroundColor: passwordStrength.labelColor,
                    minWidth: "2px",
                    minHeight: "8px",
                    borderRadius: "9999px",
                    display: "block",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                    letterSpacing: "0.01em",
                  }}
                />
              </div>
              <div
                className="text-xs text-muted-foreground mt-1 flex items-center justify-between"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                <span>Password strength: </span>
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <span
                    className={`text-xs font-medium ${passwordStrength.labelColorClass} inline-block`}
                    style={{
                      color: passwordStrength.labelColor,
                      fontFamily: "inherit",
                      letterSpacing: "inherit",
                    }}
                  >
                    {" "}
                    {passwordStrength.label}
                  </span>
                  <span
                    className="text-xs text-muted-foreground inline-block"
                    style={{
                      marginLeft: "8px",
                      fontFamily: "inherit",
                      letterSpacing: "inherit",
                    }}
                  >
                    {passwordStrength.percent}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <Button
                type="submit"
                disabled={isSubmitting || isPending || !isValid}
                className="cursor-pointer"
              >
                {(isSubmitting || isPending) && (
                  <svg
                    className="animate-spin size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {isSubmitting || isPending
                  ? "Setting password..."
                  : "Set password"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
