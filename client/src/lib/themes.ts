export interface BikerTheme {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
}

export const bikerThemes: Record<string, BikerTheme> = {
  'road-rash': {
    name: 'road-rash',
    displayName: 'ROAD RASH',
    description: 'Deep red & black - For the blood and chrome',
    colors: {
      primary: '0 84% 60%',    // #dc2626 - Blood red
      accent: '0 100% 25%',    // Dark red
      background: '0 0% 0%',   // Pure black
      foreground: '210 11% 82%', // Chrome
      muted: '220 13% 10%',    // Dark metal
      border: '215 14% 42%',   // Gunmetal
    },
  },
  'chrome-heart': {
    name: 'chrome-heart',
    displayName: 'CHROME HEART',
    description: 'Silver & black - Cold steel and mercy',
    colors: {
      primary: '210 11% 82%',  // Chrome/silver
      accent: '220 13% 91%',   // Light chrome
      background: '0 0% 0%',   // Pure black
      foreground: '210 11% 82%', // Chrome
      muted: '220 13% 10%',    // Dark metal
      border: '215 14% 42%',   // Gunmetal
    },
  },
  'ash-gasoline': {
    name: 'ash-gasoline',
    displayName: 'ASH & GASOLINE',
    description: 'Charcoal & amber - Burnt rubber and high octane',
    colors: {
      primary: '43 96% 56%',   // Amber/gasoline
      accent: '39 100% 40%',   // Dark amber
      background: '0 0% 0%',   // Pure black
      foreground: '210 11% 82%', // Chrome
      muted: '220 13% 10%',    // Dark metal
      border: '215 14% 42%',   // Gunmetal
    },
  },
};

export function applyTheme(themeName: string): void {
  const theme = bikerThemes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  
  // Remove all theme classes
  Object.keys(bikerThemes).forEach(name => {
    root.classList.remove(`theme-${name}`);
  });
  
  // Add the new theme class
  root.classList.add(`theme-${themeName}`);
  
  // Update CSS custom properties
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(`--${property}`, value);
  });
}

export function getThemeNames(): string[] {
  return Object.keys(bikerThemes);
}

export function getTheme(name: string): BikerTheme | undefined {
  return bikerThemes[name];
}
