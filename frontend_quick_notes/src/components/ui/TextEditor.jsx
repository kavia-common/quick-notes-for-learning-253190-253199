import React from "react";

// PUBLIC_INTERFACE
export default function TextEditor({ id = "content", value, onChange, placeholder = "Write your note here..." }) {
  /** Themed textarea editor. */
  return (
    <div className="editor-area">
      <label htmlFor={id} className="visually-hidden">Note content</label>
      <textarea
        id={id}
        className="textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
