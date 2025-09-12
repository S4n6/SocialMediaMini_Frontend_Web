"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ClientThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof ThemeProvider>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
