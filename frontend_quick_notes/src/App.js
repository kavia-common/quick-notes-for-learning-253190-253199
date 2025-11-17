import React, { useEffect, useRef, useState } from 'react';
import './theme/index.css';
import './theme.css';
import { NotesProvider, useNotes } from './store/NotesContext';
import ThemedHeader from './components/ui/Header';
import ThemedSidebar from './components/ui/Sidebar';
import NoteEditor from './components/NoteEditor';
import LoginPage from './components/LoginPage';
import { ThemeProvider } from './theme/theme';

// Wrapper to handle keyboard shortcuts and compose layout
function MainShell() {
  const { state, actions } = useNotes();
  const editorSaveRef = useRef(null);
  const [themeMode, setThemeMode] = useState('light');

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

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

  // Guarded view: show login if no user
  if (!state.authUser) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      <button
        className="btn"
        onClick={() => setThemeMode((t) => (t === 'light' ? 'dark' : 'light'))}
        aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        style={{ position: 'fixed', top: 12, right: 12, zIndex: 20 }}
      >
        {themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <ThemedHeader onSave={onSave} />
      <main className="layout" role="main">
        <ThemedSidebar />
        <section className="main-panel" aria-label="Editor panel">
          {state.error && (
            <div role="alert" style={{ color: 'var(--ocean-error)', padding: 12 }}>
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
  /** Root application component providing NotesProvider and composed UI with login guard */
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
    <ThemeProvider>
      <NotesProvider>
        <MainShell />
      </NotesProvider>
    </ThemeProvider>
  );
}

export default App;
