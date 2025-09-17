"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { ResendVerificationModal } from "@/components/ui/resend-verification-modal";
import { useVerifyEmail } from "@/hooks/useAuth";

// Password setup schema
const passwordSetupSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

type PasswordSetupData = yup.InferType<typeof passwordSetupSchema>;

export default function PasswordSetupPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordSetupData>({
    resolver: yupResolver(passwordSetupSchema),
  });

  const { mutate: verifyEmail, isPending } = useVerifyEmail();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [resendOpen, setResendOpen] = React.useState(false);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
    // Use hex colors to ensure inline style changes work consistently across browsers
    const hex = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#059669"];
    return { score, label: labels[score], colorHex: hex[score] };
  };

  const passwordValue = watch("password") || "";
  const strength = getPasswordStrength(passwordValue);

  React.useEffect(() => {
    if (!token) {
      router.push("/signup");
      return;
    }
  }, [token, router]);

  const onSubmit = async (data: PasswordSetupData) => {
    try {
      if (!token) {
        toast.error("Invalid or missing token. Please try again.");
        return;
      }
      verifyEmail(
        { token, password: data.password },
        {
          onSuccess: () => {
            toast.success("Email verified and password set successfully!");
            setTimeout(() => {
              router.push("/login");
            }, 1500);
          },
          onError: (error) => {
            console.error("Email verification error:", error);
            toast.error("An error occurred. Please try again.");
          },
        }
      );
    } catch (error) {
      console.error("Password setup error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md p-8 shadow-sm rounded-xl border">
        <div className="flex flex-col">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Set Your Password
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Complete your account setup by creating a secure password.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full mt-6 space-y-4"
          >
            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}

              <div className="mt-3">
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-3 rounded-full origin-left transform-gpu transition-transform transition-colors duration-200 ease-linear`}
                    style={{
                      transform: `scaleX(${strength.score / 4})`,
                      backgroundColor: strength.colorHex,
                      willChange: "transform, background-color",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {strength.label} — Tip: Use at least 8 characters, including
                  uppercase, numbers, or symbols.
                </p>
              </div>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  className="pr-10"
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-black py-3 rounded-md font-medium"
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending
                ? "Setting up..."
                : "Set Password & Continue"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need to resend verification email?{" "}
              <button
                onClick={() => setResendOpen(true)}
                className="text-primary hover:underline"
              >
                Resend email
              </button>
            </p>
          </div>
        </div>
      </Card>

      <ResendVerificationModal open={resendOpen} onOpenChange={setResendOpen} />
    </div>
  );
}
