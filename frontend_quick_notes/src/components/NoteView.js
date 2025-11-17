import React from 'react';

// PUBLIC_INTERFACE
export default function NoteView({ note }) {
  /** Read-only note view */
  if (!note) return null;
  return (
    <article className="viewer" aria-label="Note viewer">
      <h2 style={{ marginTop: 0 }}>{note.title || 'Untitled'}</h2>
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{note.content || ''}</pre>
    </article>
  );
}
