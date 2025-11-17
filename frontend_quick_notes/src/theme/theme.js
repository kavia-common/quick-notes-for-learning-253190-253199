import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "app_theme";

/**
 * Theme registry: JS counterparts for convenience in components.
 * Visuals should still use CSS variables; these are for logic or inline styles.
 */
const THEMES = {
  ocean: {
    key: "ocean",
    name: "Ocean Professional",
    colors: {
      primary: "#1E3A8A",
      secondary: "#F59E0B",
      success: "#059669",
      error: "#DC2626",
      background: "#F3F4F6",
      surface: "#FFFFFF",
      text: "#111827",
      muted: "#6B7280",
    },
    spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
    radius: { sm: 8, md: 12, lg: 16 },
    shadow: {
      sm: "0 1px 2px rgba(0,0,0,0.06)",
      md: "0 4px 10px rgba(0,0,0,0.10)",
    },
  },
  quicknote: {
    key: "quicknote",
    name: "Quick Note Community",
    colors: {
      primary: "#000000",
      secondary: "#d7d1d6",
      success: "#1b7f5f",
      error: "#c33a2b",
      background: "#d7d1d6",
      surface: "#FFFFFF",
      text: "#111111",
      muted: "rgba(0,0,0,0.6)",
    },
    spacing: { 1: 4, 2: 8, 3: 18, 4: 20, 5: 22, 6: 36, 8: 32 },
    radius: { sm: 6, md: 10, lg: 14 },
    shadow: {
      sm: "0 1px 2px rgba(0,0,0,0.06)",
      md: "0 6px 18px rgba(0,0,0,0.10)",
    },
  },
};

const defaultThemeKey = "ocean";

const ThemeContext = createContext({
  theme: THEMES[defaultThemeKey],
  themeKey: defaultThemeKey,
  // setter populated by provider
  setTheme: (_key) => {},
});

// PUBLIC_INTERFACE
export function ThemeProvider({ children, value }) {
  /** Provides theme state (get/set) with persistence and sync to [data-theme] attribute. */
  const [themeKey, setThemeKey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && (saved === "ocean" || saved === "quicknote") ? saved : defaultThemeKey;
    } catch {
      return defaultThemeKey;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, themeKey);
    } catch {
      // ignore storage write errors
    }
    // Apply to <html> so CSS layers pick it up
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  const ctxValue = useMemo(() => {
    const base = THEMES[themeKey] || THEMES[defaultThemeKey];
    const merged = { ...base, ...(value || {}) };
    return {
      theme: merged,
      themeKey,
      setTheme: (key) => setThemeKey(key === "quicknote" ? "quicknote" : "ocean"),
    };
  }, [themeKey, value]);

  return <ThemeContext.Provider value={ctxValue}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Access theme object and API: { theme, themeKey, setTheme } */
  return useContext(ThemeContext);
}

export default THEMES[defaultThemeKey];
