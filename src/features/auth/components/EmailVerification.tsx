"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { RequestLoadingWrapper } from "@/components/loading";
import { useAuth } from "../hooks/use-auth";
import { useErrorHandler } from "@/hooks";

type VerificationStatus = "pending" | "success" | "error" | "expired";

export const EmailVerification: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [countdown, setCountdown] = useState(5);

  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const { verifyEmail, isVerifyingEmail, isResendingVerification } = useAuth();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await verifyEmail(token);
        setStatus("success");

        // Start countdown for redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push("/login");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage?.includes("expired")) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
        handleError(error, { action: "verify_email" });
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail, router, handleError]);

  const handleResendVerification = async () => {
    try {
      // In a real app, you'd need to get the email from the token or user input
      // For now, we'll redirect to a page where they can enter their email
      router.push("/login?resend=true");
    } catch (error) {
      handleError(error, { action: "resend_verification" });
    }
  };

  if (status === "pending") {
    return (
      <ComponentErrorBoundary componentName="EmailVerificationPending">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Verifying Your Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ComponentErrorBoundary>
    );
  }

  if (status === "success") {
    return (
      <ComponentErrorBoundary componentName="EmailVerificationSuccess">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Email Verified Successfully!</CardTitle>
              <CardDescription>
                Your email has been verified. You can now sign in to your
                account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Redirecting to login page in {countdown} seconds...
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-[#EA454C] hover:bg-[#d63384]"
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </ComponentErrorBoundary>
    );
  }

  if (status === "expired") {
    return (
      <ComponentErrorBoundary componentName="EmailVerificationExpired">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Verification Link Expired</CardTitle>
              <CardDescription>
                This verification link has expired. Please request a new
                verification email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RequestLoadingWrapper
                state={{
                  isLoading: isResendingVerification,
                  error: null,
                  isSuccess: false,
                }}
                loadingText="Sending new verification email..."
              >
                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    className="w-full bg-[#EA454C] hover:bg-[#d63384]"
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send New Verification Email
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="w-full"
                    disabled={isResendingVerification}
                  >
                    Back to Login
                  </Button>
                </div>
              </RequestLoadingWrapper>
            </CardContent>
          </Card>
        </div>
      </ComponentErrorBoundary>
    );
  }

  // Error state
  return (
    <ComponentErrorBoundary componentName="EmailVerificationError">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription>
              We couldn&apos;t verify your email address. The link may be
              invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RequestLoadingWrapper
              state={{
                isLoading: isResendingVerification,
                error: null,
                isSuccess: false,
              }}
              loadingText="Sending new verification email..."
            >
              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  className="w-full bg-[#EA454C] hover:bg-[#d63384]"
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send New Verification Email
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full"
                  disabled={isResendingVerification}
                >
                  Back to Login
                </Button>
              </div>
            </RequestLoadingWrapper>
          </CardContent>
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
};
