"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../hooks";
import { useErrorHandler } from "@/hooks";
import { ComponentErrorBoundary } from "@/components/error-boundary";

interface ResendVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
}

export const ResendVerificationModal: React.FC<
  ResendVerificationModalProps
> = ({ open, onOpenChange, email }) => {
  const [isResent, setIsResent] = useState(false);
  const { resendVerification, isResendingVerification } = useAuth();
  const { handleError } = useErrorHandler();

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      await resendVerification(email);
      setIsResent(true);
    } catch (error) {
      handleError(error, { action: "resend_verification" });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsResent(false);
  };

  return (
    <ComponentErrorBoundary componentName="ResendVerificationModal">
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isResent ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Email Sent Successfully
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 text-[#EA454C]" />
                  Verify Your Email
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isResent ? (
                <>
                  We&apos;ve sent a new verification email to{" "}
                  <strong>{email}</strong>. Please check your inbox and follow
                  the instructions to verify your account.
                </>
              ) : (
                <>
                  We&apos;ve sent a verification email to{" "}
                  <strong>{email}</strong>. Please check your inbox and click
                  the verification link to activate your account.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isResent && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive the email? Check your spam folder or:
                </p>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isResendingVerification ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              {isResent && (
                <Button
                  onClick={() => window.open("mailto:", "_blank")}
                  className="flex-1 bg-[#EA454C] hover:bg-[#d63384]"
                >
                  Open Email App
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ComponentErrorBoundary>
  );
};
