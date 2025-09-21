"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store, persistor } from "@/store";
import { AuthProvider } from "@/providers/AuthProvider";
import { ClientThemeProvider } from "@/providers/ClientThemeProvider";
import { queryClient } from "@/lib/react-query/queryClient";
import { Loading } from "@/components";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<Loading text="Loading..." />}
        persistor={persistor}
      >
        <QueryClientProvider client={queryClient}>
          <ClientThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ClientThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
