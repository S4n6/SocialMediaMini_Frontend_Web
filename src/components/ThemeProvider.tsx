"use client";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  actualTheme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Get system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Update actual theme based on mode
  useEffect(() => {
    let newTheme: "light" | "dark";

    if (mode === "system") {
      newTheme = getSystemTheme();
    } else {
      newTheme = mode;
    }

    setActualTheme(newTheme);

    // Update document class for Chakra UI
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);

    // Update data attribute for Chakra UI v3
    root.setAttribute("data-theme", newTheme);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const newTheme = getSystemTheme();
        setActualTheme(newTheme);

        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
        root.setAttribute("data-theme", newTheme);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode]);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
      setMode(savedMode);
    }
  }, []);

  // Save theme to localStorage
  const updateMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newMode = actualTheme === "light" ? "dark" : "light";
    updateMode(newMode);
  };

  const value: ThemeContextType = {
    mode,
    setMode: updateMode,
    actualTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
