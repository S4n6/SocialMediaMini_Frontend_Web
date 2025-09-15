"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (email: string) => Promise<void> | void;
};

export default function ForgotPasswordModal({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    mode: "onChange",
  });

  async function submit(data: { email: string }) {
    if (onSubmit) {
      try {
        await onSubmit(data.email);
        // start cooldown after successful send
        setCooldownRemaining(30);
      } catch (err) {
        // don't start cooldown on failure
        throw err;
      }
    }
    // close when done
    onOpenChange?.(false);
  }

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const cooldownRef = useRef<number | null>(null);

  useEffect(() => {
    if (cooldownRemaining <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }

    // start interval to decrement
    if (!cooldownRef.current) {
      cooldownRef.current = window.setInterval(() => {
        setCooldownRemaining((v) => Math.max(0, v - 1));
      }, 1000);
    }

    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [cooldownRemaining]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link">Forgot password?</Button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            Enter the email associated with your account and we will send a link
            to reset your password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          <div>
            <Label htmlFor="fp-email" className="mb-2">
              Email
            </Label>
            <Input
              id="fp-email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  // stricter but practical email pattern: local@domain.tld (tld >=2 chars)
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {String(formState.errors.email.message)}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              className="cursor-pointer"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`cursor-pointer ${
                !formState.isValid ? "opacity-60" : ""
              }`}
              disabled={
                formState.isSubmitting ||
                !formState.isValid ||
                cooldownRemaining > 0
              }
            >
              {cooldownRemaining > 0
                ? `Send again in ${cooldownRemaining}s`
                : "Send reset link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
