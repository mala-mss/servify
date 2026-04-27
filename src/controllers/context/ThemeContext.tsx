import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "dark" | "light";

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  navBg: string;
  glow: string;
  grid: string;
}

const PALETTES: Record<ThemeMode, Palette> = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.03)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.45)",
    border: "rgba(255,255,255,0.07)",
    navBg: "rgba(14,14,14,0.85)",
    glow: "rgba(47,176,188,0.04)",
    grid: "rgba(255,255,255,0.02)"
  },
  light: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    navBg: "rgba(248,251,251,0.85)",
    glow: "rgba(47,176,188,0.06)",
    grid: "#E0E7E7"
  }
};

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
  palette: Palette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("family_care_theme");
    return (saved as ThemeMode) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("family_care_theme", mode);
    document.documentElement.style.backgroundColor = PALETTES[mode].bg;
    document.documentElement.style.color = PALETTES[mode].text;
  }, [mode]);

  const toggle = () => setMode(m => (m === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ mode, toggle, palette: PALETTES[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}












