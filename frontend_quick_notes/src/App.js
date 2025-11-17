import React, { useEffect, useRef, useState } from 'react';
import { NotesProvider, useNotes } from './store/NotesContext';
import ThemedHeader from './components/ui/Header';
import ThemedSidebar from './components/ui/Sidebar';
import NoteEditor from './components/NoteEditor';
import LoginPage from './components/LoginPage';
import { ThemeProvider } from './theme/theme';

/**
 * Small non-intrusive banner to verify Ocean Professional theme is active.
 * Shown at bottom-left; can be removed after QA.
 */
function ThemeDebugBanner() {
  return (
    <div
      aria-label="Theme debug banner"
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: 50,
        background: 'rgba(30,58,138,0.95)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
        opacity: 0.88
      }}
    >
      Ocean Professional
    </div>
  );
}

// Wrapper to handle keyboard shortcuts and compose layout
function MainShell() {
  const { state, actions } = useNotes();
  const editorSaveRef = useRef(null);
  const [themeMode, setThemeMode] = useState('light');

  // Apply theme attribute (kept for potential future dark mode tokens)
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
        title="Toggle theme"
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
          <NoteEditor onSaved={() => {}} ref={editorSaveRef} />
          <div className="footer-hint" aria-hidden="true">
            Shortcuts: Ctrl/Cmd+N (new), Ctrl/Cmd+S (save)
          </div>
        </section>
      </main>
      <ThemeDebugBanner />
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
