import React, { createContext, useContext, useMemo } from "react";

/**
 * Ocean Professional theme JS object to complement CSS variables.
 * Consumers should prefer CSS variables for styling; this object enables JS access for sizing, colors, etc.
 */
const theme = {
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
};

const ThemeContext = createContext(theme);

// PUBLIC_INTERFACE
export function ThemeProvider({ children, value }) {
  /** Provides the Ocean Professional theme object for JS usage (colors, spacing, radius, shadow). */
  const merged = useMemo(() => ({ ...theme, ...(value || {}) }), [value]);
  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Access the theme object for JS computations. Prefer CSS variables for visual styles. */
  return useContext(ThemeContext);
}

export default theme;
