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

  const authPages = [
    "/login",
    "/signup",
    "/register",
    "/verify-email",
    "/reset-password",
  ];
  const isAuthPage = authPages.some((route) => pathname.includes(route));
  if (isAuthPage) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 flex w-full ${
        isAuthPage ? "items-center justify-center" : ""
      }`}
    >
      <div
        className={`${isAuthPage ? "none" : "block"} bg-background w-[280px]`}
      >
        <LeftSideBar />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
