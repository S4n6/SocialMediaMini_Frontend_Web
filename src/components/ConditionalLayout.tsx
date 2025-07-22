"use client";

import { usePathname } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { Footer, Header } from "@/components";
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

  const authPages = ["/login", "/signup", "/register"];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={"bg.canvas"}
        transition="all 0.3s ease-in-out"
        width={"100%"}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      bg={"bg.canvas"}
      minH="100vh"
      transition="all 0.3s ease-in-out"
      display={"flex"}
      w={"100%"}
    >
      <LeftSideBar />
      {children}
    </Box>
  );
}
