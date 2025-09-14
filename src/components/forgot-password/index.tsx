import React from "react";
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
      await onSubmit(data.email);
    }
    // close when done
    onOpenChange?.(false);
  }

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
              disabled={formState.isSubmitting || !formState.isValid}
            >
              Send reset link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
