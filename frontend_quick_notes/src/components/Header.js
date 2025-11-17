import React from 'react';
import { useNotes } from '../store/NotesContext';

// PUBLIC_INTERFACE
export default function Header({ onSave }) {
  /** Application top bar with actions */
  const { state, actions } = useNotes();
  const active = state.notes.find(n => n.id === state.activeId) || null;

  return (
    <header className="header" role="banner">
      <h1 className="header-title" aria-label="Application title">Quick Notes</h1>
      <div style={{ marginLeft: 'auto', marginRight: 8, fontSize: 12, opacity: 0.9 }}>
        {state.authUser ? `Signed in as ${state.authUser.name || state.authUser.email || state.authUser.id}` : ''}
      </div>
      <div className="header-actions" role="toolbar" aria-label="Note actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => actions.createNote()}
          aria-label="Create a new note (Ctrl or Command and N)"
        >
          + New
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => active && onSave?.()}
          disabled={!active}
          aria-disabled={!active}
          aria-label="Save current note (Ctrl or Command and S)"
        >
          Save
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => active && actions.deleteNote(active.id)}
          disabled={!active}
          aria-disabled={!active}
          aria-label="Delete current note"
        >
          Delete
        </button>
        {state.authUser && (
          <button
            type="button"
            className="btn"
            onClick={() => actions.logout()}
            aria-label="Sign out"
            title="Sign out"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
