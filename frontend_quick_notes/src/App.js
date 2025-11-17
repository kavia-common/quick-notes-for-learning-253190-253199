import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './theme.css';
import { NotesProvider, useNotes } from './store/NotesContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import NoteView from './components/NoteView';

// Wrapper to handle keyboard shortcuts and compose layout
function MainShell() {
  const { state, actions } = useNotes();
  const editorSaveRef = useRef(null);
  const [theme, setTheme] = useState('light');

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keyboard shortcuts: Ctrl/Cmd+N, Ctrl/Cmd+S
  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        actions.createNote();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        // trigger save by dispatching update of current fields via custom event
        const evt = new CustomEvent('quicknotes:save');
        window.dispatchEvent(evt);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);

  const onSave = () => {
    const evt = new CustomEvent('quicknotes:save');
    window.dispatchEvent(evt);
  };

  return (
    <div className="app-shell">
      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{ position: 'fixed', top: 12, right: 12, zIndex: 20 }}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <Header onSave={onSave} />
      <main className="layout" role="main">
        <Sidebar />
        <section className="main-panel" aria-label="Editor panel">
          {state.error && (
            <div role="alert" style={{ color: 'var(--color-error)', padding: 12 }}>
              {state.error}
            </div>
          )}
          <NoteEditor
            onSaved={() => {}}
            ref={editorSaveRef}
          />
        </section>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root application component providing NotesProvider and composed UI */
  useEffect(() => {
    // Wire editor save listener: components that handle saving listen to this event
    const onSave = () => {
      const saveButton = document.querySelector('.editor-toolbar .btn');
      if (saveButton) saveButton.click();
    };
    window.addEventListener('quicknotes:save', onSave);
    return () => window.removeEventListener('quicknotes:save', onSave);
  }, []);

  return (
    <NotesProvider>
      <MainShell />
    </NotesProvider>
  );
}

export default App;
