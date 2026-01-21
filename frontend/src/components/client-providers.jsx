"use client";

import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "@/app/(redux)/store";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ClientProviders({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>
        {children}
        <Toaster richColors position="top-center" />
      </Provider>
    </NextThemesProvider>
  );
}
