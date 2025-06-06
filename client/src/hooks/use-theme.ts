import { useState, useEffect } from "react";

type Theme = "road-rash" | "chrome-heart" | "ash-gasoline";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("road-rash");

  useEffect(() => {
    const savedTheme = localStorage.getItem("biker-theme") as Theme;
    if (savedTheme && ["road-rash", "chrome-heart", "ash-gasoline"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("biker-theme", newTheme);
    
    // Apply theme class to document
    const root = document.documentElement;
    root.classList.remove("theme-road-rash", "theme-chrome-heart", "theme-ash-gasoline");
    root.classList.add(`theme-${newTheme}`);
  };

  return {
    theme,
    setTheme: changeTheme,
    themes: [
      { value: "road-rash", label: "ROAD RASH", description: "Deep red & black" },
      { value: "chrome-heart", label: "CHROME HEART", description: "Silver & black" },
      { value: "ash-gasoline", label: "ASH & GASOLINE", description: "Charcoal & amber" },
    ] as const,
  };
}
