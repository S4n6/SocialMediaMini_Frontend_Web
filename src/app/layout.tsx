import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import Providers from "@/providers/Providers";
import { Toaster } from "sonner";
import { PageErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialMini - Connect with Friends",
  description:
    "A simple social media platform to connect and share with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PageErrorBoundary>
          <Providers>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster richColors />
          </Providers>
        </PageErrorBoundary>
      </body>
    </html>
  );
}
