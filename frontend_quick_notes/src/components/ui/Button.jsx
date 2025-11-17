import React from "react";
import { useTheme } from "../../theme/theme";

// PUBLIC_INTERFACE
export default function Button({
  variant = "default",
  children,
  className = "",
  ...props
}) {
  /** Themed button component. Variants: default, primary, danger, ghost, icon. */
  const theme = useTheme();
  const base = "btn";
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
      ? "btn-danger"
      : variant === "ghost"
      ? "btn-ghost"
      : variant === "icon"
      ? "btn-icon"
      : "";

  return (
    <button
      className={[base, variantClass, className].filter(Boolean).join(" ")}
      {...props}
      style={{
        ...(variant === "danger" && {
          background: theme.colors.error,
          color: "#fff",
          borderColor: "rgba(0,0,0,0.05)",
        }),
        ...(variant === "ghost" && {
          background: "transparent",
          borderColor: "transparent",
          color: theme.colors.text,
        }),
        ...(variant === "icon" && {
          padding: 8,
          width: 36,
          height: 36,
          display: "inline-grid",
          placeItems: "center",
        }),
      }}
    >
      {children}
    </button>
  );
}
