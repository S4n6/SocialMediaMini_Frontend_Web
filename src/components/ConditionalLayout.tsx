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
  // Always render the same DOM structure to avoid hydration mismatches.
  // Visually hide or center elements via classes instead of removing them from the tree.
  return (
    <div
      className={`min-h-screen transition-all duration-300 flex w-full ${
        isAuthPage ? "items-center justify-center" : ""
      }`}
    >
      <div className={`${isAuthPage ? "hidden" : "block"}`}>
        <LeftSideBar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
