"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={false}
      storageKey="theme"
      value={{
        light: "light",
        dark: "dark",
        system: "system",
      }}
    >
      {children}
    </ThemeProvider>
  );
} 