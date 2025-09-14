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
  const isAuthPage = authPages.some((route) => pathname.startsWith(route));

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-300 w-full">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-300 flex w-full">
      <LeftSideBar />
      {children}
    </div>
  );
}
