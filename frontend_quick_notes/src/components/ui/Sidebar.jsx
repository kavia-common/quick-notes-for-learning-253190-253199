import React, { useMemo } from "react";
import { useNotes } from "../../store/NotesContext";
import Button from "./Button";
import { NoteCard } from "./Card";

// PUBLIC_INTERFACE
export default function ThemedSidebar() {
  /** Themed notes sidebar with search and list using NoteCard. */
  const { state, actions } = useNotes();
  const { query, activeId } = state;

  const items = useMemo(() => state.notes, [state.notes]);

  return (
    <aside className="sidebar" aria-label="Notes sidebar">
      <div className="sidebar-search">
        <label htmlFor="search" className="visually-hidden">Search notes</label>
        <input
          id="search"
          className="input"
          type="search"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => actions.setQuery(e.target.value)}
          aria-label="Search notes"
        />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <Button variant="primary" onClick={() => actions.createNote()} aria-label="Add new note">
            Add Note
          </Button>
        </div>
      </div>

      <div style={{ padding: 8, overflow: "auto" }} role="list" aria-live="polite">
        {items.map((n) => (
          <NoteCard
            key={n.id}
            title={n.title}
            content={n.content}
            timestamp={n.updatedAt}
            active={activeId === n.id}
            onClick={() => actions.setActive(n.id)}
            actions={(
              <Button
                aria-label={`Delete note ${n.title || "Untitled"}`}
                onClick={(e) => { e.stopPropagation(); actions.deleteNote(n.id); }}
              >
                Delete
              </Button>
            )}
          />
        ))}
        {items.length === 0 && (
          <div className="note-empty" role="note">
            No notes. Click “Add Note” or press Ctrl/Cmd+N to get started.
          </div>
        )}
      </div>
    </aside>
  );
}
