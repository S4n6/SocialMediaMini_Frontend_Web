import React from "react";
import { ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
