"use client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ChakraProvider } from "@chakra-ui/react";
import { store } from "@/store";
import { queryClient } from "@/lib/react-query/queryClient";
import theme from "@/theme";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "./ui/toaster";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={theme}>
          <ThemeProvider>
            {children}
            <Toaster />
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ThemeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </Provider>
  );
}
