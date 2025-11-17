import React from "react";
import Button from "./Button";

// PUBLIC_INTERFACE
export default function IconButton({ label, children, ...props }) {
  /** Icon-only button with focus a11y and tooltip label via title. */
  return (
    <Button
      variant="icon"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </Button>
  );
}
