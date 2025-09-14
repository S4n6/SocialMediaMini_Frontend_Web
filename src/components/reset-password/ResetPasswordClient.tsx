"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type Form = {
  password: string;
  confirm: string;
};

export default function ResetPasswordClient() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search?.get("token");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Form>({ mode: "onChange" });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  React.useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  function passwordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
  }

  const score = passwordStrength(password || "");
  const percent = Math.round((score / 4) * 100);
  const strengthLabel =
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

  async function onSubmit() {
    // Integration point: call your reset API here with token and new password
    // Example: await authService.resetPassword({ token, password: data.password })

    // Simulate network
    await new Promise((r) => setTimeout(r, 800));
    const g = globalThis as unknown as { toast?: (msg: string) => void };
    if (typeof g.toast === "function") {
      g.toast("Password reset successful. You can now log in.");
    } else {
      console.log("Password reset successful. You can now log in.");
    }
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
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

          <div className="flex items-center justify-between">
            <div className="w-2/3">
              <div className="h-2 rounded bg-gray-200 overflow-hidden">
                <div
                  className={`h-full transition-all ${colorClass}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>Password strength</span>
                <span
                  className={`text-xs font-medium ${labelColorClass}`}
                  style={{ color: labelColor }}
                >
                  {strengthLabel}
                </span>
              </div>
            </div>
            <div>
              <Button type="submit" disabled={isSubmitting || !isValid}>
                Set password
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
