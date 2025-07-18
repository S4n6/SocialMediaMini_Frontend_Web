"use client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ChakraProvider } from "@chakra-ui/react";
import { store } from "@/store";
import { queryClient } from "@/lib/react-query/queryClient";
import theme from "@/theme";
import { Toaster } from "./ui/toaster";
import { ColorModeProvider } from "./ui/color-mode";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={theme}>
          <ColorModeProvider>
            {children}
            <Toaster />
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ColorModeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </Provider>
  );
}
