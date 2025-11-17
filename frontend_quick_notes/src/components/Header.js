/**
 * DEPRECATED: Legacy Header. Use components/ui/Header.jsx instead.
 * Left in repo for reference; not used by the application.
 */
import React from 'react';
import { useNotes } from '../store/NotesContext';

// PUBLIC_INTERFACE
export default function Header({ onSave }) {
  /** Application top bar with actions (deprecated variant). */
  const { state, actions } = useNotes();
  const active = state.notes.find(n => n.id === state.activeId) || null;

  return (
    <header className="header" role="banner" aria-label="Deprecated header">
      <h1 className="header-title" aria-label="Application title">Quick Notes</h1>
      <div style={{ marginLeft: 'auto', marginRight: 8, fontSize: 12, opacity: 0.9 }}>
        {state.authUser ? `Signed in as ${state.authUser.name || state.authUser.email || state.authUser.id}` : ''}
      </div>
      <div className="header-actions" role="toolbar" aria-label="Note actions">
        <button type="button" className="btn btn-primary" onClick={() => actions.createNote()}>+ New</button>
        <button type="button" className="btn" onClick={() => active && onSave?.()} disabled={!active}>Save</button>
        <button type="button" className="btn" onClick={() => active && actions.deleteNote(active.id)} disabled={!active}>Delete</button>
        {state.authUser && (
          <button type="button" className="btn" onClick={() => actions.logout()} title="Sign out">Logout</button>
        )}
      </div>
    </header>
  );
}
