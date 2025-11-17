import React from 'react';
import { useNotes } from '../store/NotesContext';

// PUBLIC_INTERFACE
export default function NotesList() {
  /** Minimal notes list allowing select, create, and delete. */
  const { state, actions } = useNotes();
  const { notes, activeId } = state;

  return (
    <div role="region" aria-label="Notes list" className="sidebar">
      <div className="sidebar-search">
        <label htmlFor="notes-search" className="visually-hidden">Search notes</label>
        <input
          id="notes-search"
          type="search"
          className="input"
          placeholder="Search notes…"
          value={state.query}
          onChange={(e) => actions.setQuery(e.target.value)}
          aria-label="Search notes"
        />
        <button
          className="btn btn-primary"
          type="button"
          style={{ marginTop: 8 }}
          onClick={() => actions.createNote()}
          aria-label="Create new note"
        >
          + New
        </button>
      </div>
      <ul className="note-list" role="list" aria-live="polite">
        {notes.map(n => (
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
            <div>
              <button
                className="btn"
                type="button"
                aria-label={`Delete note ${n.title || 'Untitled'}`}
                onClick={(e) => { e.stopPropagation(); actions.deleteNote(n.id); }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {notes.length === 0 && (
          <div className="note-empty" role="note">
            No notes. Click “+ New” to create one.
          </div>
        )}
      </ul>
    </div>
  );
}
