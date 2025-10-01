"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";

const emailSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

type EmailFormData = yup.InferType<typeof emailSchema>;

interface ResendVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResendVerificationModal({
  open,
  onOpenChange,
}: ResendVerificationModalProps) {
  type Status = "idle" | "sending" | "success" | "error";
  const [status, setStatus] = React.useState<Status>("idle");
  const [countdown, setCountdown] = React.useState(0);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
  });

  const { resendVerification, isResendingVerification } = useAuth();

  // Reset success state when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setStatus("idle");
      setCountdown(0);
      setServerError(null);
      reset();
    }
  }, [open, reset]);

  // Countdown timer for retry cooldown
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const onSubmit = async (data: EmailFormData) => {
    try {
      setStatus("sending");
      setServerError(null);
      await resendVerification(data.email);
      setStatus("success");
      setCountdown(30);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      console.error("Resend verification error:", err);
      const payload = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        status?: number;
      };
      const message =
        payload?.response?.data?.message ??
        payload?.message ??
        "An error occurred while resending verification email.";
      const statusCode = payload?.status ?? payload?.response?.status ?? null;
      if (statusCode === 404 && message.includes("not found")) {
        setServerError("Email address not found. Please check and try again.");
      }

      if (statusCode === 400 && message.includes("already verified")) {
        setServerError("This email is already verified. Please log in.");
      }
      setStatus("error");
      toast.error(message);
    }
  };

  const handleTryAgain = () => {
    setStatus("idle");
    setCountdown(0);
    setServerError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Resend Verification Email
          </DialogTitle>
        </DialogHeader>

        {status === "idle" || status === "sending" ? (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we&apos;ll send you a new
                verification link to complete your account setup.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || countdown > 0 || status === "sending"
                  }
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting || status === "sending" ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </div>
                  ) : countdown > 0 ? (
                    `Wait ${countdown}s`
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Email
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {status === "success" && (
          <div className="space-y-6 pt-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email Sent Successfully!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;ve sent a verification link to your email. Please check
                your inbox and follow the instructions to set up your password.
              </p>
              <p className="text-xs text-muted-foreground">
                Don&apos;t see the email? Check your spam folder or try again in{" "}
                {countdown > 0 ? `${countdown} seconds` : "a moment"}.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={handleTryAgain}
                disabled={countdown > 0}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {countdown > 0 ? `Try Again (${countdown}s)` : "Send Another"}
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 pt-4 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 9v4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Send
              </h3>
              <p className="text-sm text-red-600 mb-4">
                {serverError ?? "Unable to send verification email."}
              </p>
              <p className="text-xs text-muted-foreground">
                Please check the email address and try again.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => setStatus("idle")}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
