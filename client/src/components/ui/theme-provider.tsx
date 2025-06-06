import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTheme } from "@/hooks/use-theme";

type Theme = "road-rash" | "chrome-heart" | "ash-gasoline";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("road-rash");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("theme-road-rash", "theme-chrome-heart", "theme-ash-gasoline");
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("biker-theme") as Theme;
    const savedSound = localStorage.getItem("biker-sound");
    
    if (savedTheme && ["road-rash", "chrome-heart", "ash-gasoline"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("biker-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("biker-sound", soundEnabled.toString());
  }, [soundEnabled]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, soundEnabled, setSoundEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
