"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-white/90 via-slate-50 to-slate-100 p-6">
      <div className="relative max-w-4xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 md:p-12 items-center">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
              Oops.
            </h1>
            <h2 className="text-2xl font-semibold text-slate-700 mt-1">
              We can&apos;t find that page
            </h2>
            <p className="mt-4 text-slate-600">
              The page you&apos;re looking for doesn&apos;t exist, has been
              moved, or is temporarily unavailable. Try going back home or
              contacting support if you think this is an error.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <Button onClick={() => router.push("/")}>Take me home</Button>
              <Button variant="outline" onClick={() => router.push("/more")}>
                Contact Support
              </Button>
            </div>
          </div>

          <div className="order-1 md:order-2 flex items-center justify-center">
            <svg
              width="300"
              height="240"
              viewBox="0 0 300 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect
                x="10"
                y="20"
                width="220"
                height="140"
                rx="12"
                fill="#F8FAFC"
                stroke="#E6EEF6"
              />
              <path
                d="M40 60h160"
                stroke="#CFE8FF"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle
                cx="160"
                cy="100"
                r="26"
                fill="#E7F5FF"
                stroke="#BEE6FF"
              />
              <path
                d="M140 90c8 6 20 8 28 6"
                stroke="#7FBFFF"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <g transform="translate(60,140)">
                <path
                  d="M0 0c22 24 60 28 92 6"
                  stroke="#FDE68A"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
              <g transform="translate(240,10)">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="#FCE7F3"
                  stroke="#F8C8E6"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
