import React from "react";
import Button from "./Button";
import { useNotes } from "../../store/NotesContext";

// PUBLIC_INTERFACE
export default function ThemedHeader({ onSave }) {
  /** Themed Header that mirrors original Header.js functionality. */
  const { state, actions } = useNotes();
  const active = state.notes.find((n) => n.id === state.activeId) || null;

  return (
    <header className="header" role="banner">
      <h1 className="header-title" aria-label="Application title">Quick Notes</h1>
      <div style={{ marginLeft: "auto", marginRight: 8, fontSize: 12, opacity: 0.9 }}>
        {state.authUser ? `Signed in as ${state.authUser.name || state.authUser.email || state.authUser.id}` : ""}
      </div>
      <div className="header-actions" role="toolbar" aria-label="Note actions">
        <Button
          variant="primary"
          onClick={() => actions.createNote()}
          aria-label="Create a new note (Ctrl or Command and N)"
        >
          + New
        </Button>
        <Button
          onClick={() => active && onSave?.()}
          disabled={!active}
          aria-disabled={!active}
          aria-label="Save current note (Ctrl or Command and S)"
        >
          Save
        </Button>
        <Button
          onClick={() => active && actions.deleteNote(active.id)}
          disabled={!active}
          aria-disabled={!active}
          aria-label="Delete current note"
        >
          Delete
        </Button>
        {state.authUser && (
          <Button
            onClick={() => actions.logout()}
            aria-label="Sign out"
            title="Sign out"
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
