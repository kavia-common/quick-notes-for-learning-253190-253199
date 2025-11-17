import React, { useEffect, useState, useCallback } from 'react';
import { useNotes } from '../store/NotesContext';
import Button from './ui/Button';
import TextEditor from './ui/TextEditor';

// PUBLIC_INTERFACE
export default function NoteEditor({ onSaved }) {
  /** Editor for the selected note. Performs inline validation and updates. */
  const { state, actions } = useNotes();
  const active = state.notes.find(n => n.id === state.activeId) || null;

  const [title, setTitle] = useState(active?.title || '');
  const [content, setContent] = useState(active?.content || '');
  const [err, setErr] = useState('');

  useEffect(() => {
    setTitle(active?.title || '');
    setContent(active?.content || '');
    setErr('');
  }, [active?.id]); // switch when selection changes

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
      content: content || '',
    });
    onSaved?.();
  }, [active, title, content, actions, onSaved, validate]);

  if (!active) {
    return (
      <div className="note-empty" aria-live="polite">
        Select a note on the left or create a new one.
      </div>
    );
  }

  return (
    <>
      <div className="editor-toolbar">
        <label htmlFor="title" className="visually-hidden">Note title</label>
        <input
          id="title"
          className="editor-title-input"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!err}
          aria-describedby={err ? 'title-error' : undefined}
        />
        <Button onClick={save} aria-label="Save note">
          Save
        </Button>
      </div>
      {err && (
        <div role="alert" id="title-error" style={{ color: 'var(--ocean-error)', padding: '8px 12px' }}>
          {err}
        </div>
      )}
      <div className="split" role="region" aria-label="Editor and preview">
        <TextEditor
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here... Markdown/plain text"
        />
        <div className="viewer-area">
          <div className="viewer" aria-label="Rendered note preview">
            <h2 style={{ marginTop: 0 }}>{title || 'Untitled'}</h2>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{content || 'No content yet.'}</pre>
          </div>
        </div>
      </div>
      <div className="footer-hint" aria-hidden="true">
        Shortcuts: Ctrl/Cmd+N (new), Ctrl/Cmd+S (save)
      </div>
    </>
  );
}
