import React from "react";
import ResetPasswordClient from "@/components/reset-password/ResetPasswordClient";

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <ResetPasswordClient />
    </React.Suspense>
  );
}
