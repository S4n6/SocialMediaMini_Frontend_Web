"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVerifyEmail } from "@/hooks/useAuth";

type VerifyStatus = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token;
  const router = useRouter();
  const { mutateAsync: verifyEmail } = useVerifyEmail();

  const [status, setStatus] = React.useState<VerifyStatus>("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      router.push("/signup");
      return;
    }
    runVerification();
  }, [token]);

  async function runVerification() {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await verifyEmail(token as string);
      console.log("Email verification response:", response);

      if (response.success) {
        setStatus("success");
        setMessage("Your email has been successfully verified.");
      } else {
        setStatus("error");
        setMessage("Verification failed. The token may be invalid or expired.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setStatus("error");
      setMessage("Verification failed. The token may be invalid or expired.");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <Card className="w-full max-w-lg p-10 shadow-lg rounded-lg bg-white">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Verify Your Email
          </h1>
          <p className="text-base text-gray-600 mb-8">
            This page will verify your email and display the result.
          </p>

          <div className="mt-6 flex flex-col items-center">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-10 w-10 text-blue-500 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <div className="text-lg text-gray-700">
                  Verifying your email...
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="text-5xl text-green-500 mb-4">✅</div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Email Verified
                </h2>
                <p className="text-base text-gray-600 mt-3 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                  <Button
                    className="px-6 py-2 text-white bg-green-500 hover:bg-green-600"
                    onClick={() => router.push("/login")}
                  >
                    Go to Login
                  </Button>
                  <Button
                    className="px-6 py-2 text-gray-800 bg-gray-200 hover:bg-gray-300"
                    onClick={() => router.push("/")}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="text-5xl text-red-500 mb-4">❌</div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Verification Failed
                </h2>
                <p className="text-base text-gray-600 mt-3 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                  <Button
                    className="px-6 py-2 text-white bg-red-500 hover:bg-red-600"
                    onClick={runVerification}
                  >
                    Retry
                  </Button>
                  <Button
                    className="px-6 py-2 text-gray-800 bg-gray-200 hover:bg-gray-300"
                    onClick={() => router.push("/signup")}
                  >
                    Resend Verification
                  </Button>
                </div>
              </div>
            )}

            {status === "idle" && (
              <div className="text-lg text-gray-700">
                Ready to verify. The verification will start automatically.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
