/**
 * DEPRECATED: Legacy Sidebar. Use components/ui/Sidebar.jsx instead.
 * Left in repo for reference; not used by the application.
 */
import React, { useMemo } from 'react';
import { useNotes } from '../store/NotesContext';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar listing notes and search bar (deprecated variant). */
  const { state, actions } = useNotes();
  const { query, activeId } = state;

  const items = useMemo(() => state.notes, [state.notes]);

  return (
    <aside className="sidebar" aria-label="Notes sidebar (deprecated)">
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
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-primary" onClick={() => actions.createNote()}>
            Add Note
          </button>
        </div>
      </div>
      <ul className="note-list" role="list" aria-live="polite">
        {items.map(n => (
          <li
            key={n.id}
            className={`note-list-item ${activeId === n.id ? 'active' : ''}`}
            onClick={() => actions.setActive(n.id)}
            onKeyDown={(e) => { if (e.key === 'Enter') actions.setActive(n.id); }}
            role="button"
            tabIndex={0}
            aria-pressed={activeId === n.id}
            aria-label={`Open note ${n.title || 'Untitled'}`}
          >
            <div>
              <p className="note-list-title">{n.title || 'Untitled'}</p>
              <div className="note-list-meta">{new Date(n.updatedAt).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
