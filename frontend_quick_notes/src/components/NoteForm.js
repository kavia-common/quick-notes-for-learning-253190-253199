import React, { useEffect, useState, useCallback } from 'react';
import { useNotes } from '../store/NotesContext';

// PUBLIC_INTERFACE
export default function NoteForm() {
  /** Minimal form to edit currently active note with validation. */
  const { state, actions } = useNotes();
  const active = state.notes.find(n => n.id === state.activeId) || null;

  const [title, setTitle] = useState(active?.title || '');
  const [content, setContent] = useState(active?.content || '');
  const [err, setErr] = useState('');

  useEffect(() => {
    setTitle(active?.title || '');
    setContent(active?.content || '');
    setErr('');
  }, [active?.id]);

  const validate = useCallback(() => {
    if (!active) return false;
    const t = (title || '').trim();
    if (t.length > 200) {
      setErr('Title must be 200 characters or less.');
      return false;
    }
    setErr('');
    return true;
  }, [title, active]);

  const save = useCallback(() => {
    if (!active) return;
    if (!validate()) return;
    actions.updateNote(active.id, {
      title: (title || '').trim() || 'Untitled',
      content: content || ''
    });
  }, [active, title, content, actions, validate]);

  if (!active) {
    return (
      <div className="note-empty" aria-live="polite">
        Select a note in the list or create a new one.
      </div>
    );
  }

  return (
    <div className="main-panel" role="region" aria-label="Note editor">
      <div className="editor-toolbar">
        <label htmlFor="nf-title" className="visually-hidden">Note title</label>
        <input
          id="nf-title"
          className="editor-title-input"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!err}
          aria-describedby={err ? 'nf-title-error' : undefined}
        />
        <button type="button" className="btn" onClick={save} aria-label="Save note">
          Save
        </button>
      </div>
      {err && (
        <div role="alert" id="nf-title-error" style={{ color: 'var(--color-error)', padding: '8px 12px' }}>
          {err}
        </div>
      )}
      <div className="editor-area">
        <label htmlFor="nf-content" className="visually-hidden">Note content</label>
        <textarea
          id="nf-content"
          className="textarea"
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}
