import React from "react";

// PUBLIC_INTERFACE
export function Card({ className = "", children, ...props }) {
  /** Generic elevated card surface. */
  return (
    <div className={["card", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function NoteCard({ title, content, timestamp, actions, onClick, active }) {
  /** Sticky Note-like card using Figma-derived tokens and subtle borders. */
  return (
    <div
      className={["note-list-item", active ? "active" : ""].filter(Boolean).join(" ")}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter") onClick?.(); }}
    >
      <div>
        <p className="note-list-title">{title || "Untitled"}</p>
        <div className="note-list-meta">
          {timestamp ? new Date(timestamp).toLocaleString() : ""}
        </div>
        <div className="note-list-meta" style={{ marginTop: 6 }}>
          {(content || "").slice(0, 120) || "No content yet."}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
        {actions}
      </div>
    </div>
  );
}
