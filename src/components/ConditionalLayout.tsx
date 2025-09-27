"use client";

import { usePathname } from "next/navigation";
import LeftSideBar from "./layout/LeftSideBar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * ConditionalLayout component that applies different layouts based on the current route
 * Auth pages get a centered full-screen layout, while regular pages include header/footer
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  const publicPages = [
    "/login",
    "/signup",
    "/register",
    "/verify-email",
    "/reset-password",
    "/forgot-password",
    "/not-found",
    "/404",
    "/500",
  ];
  const isPublicPage = publicPages.some((route) => pathname.includes(route));
  if (isPublicPage) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex w-full ${
        isPublicPage ? "items-center justify-center" : ""
      }`}
    >
      <div className={`${isPublicPage ? "none" : "block"} w-[280px]`}>
        <LeftSideBar />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
