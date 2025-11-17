import React, { useEffect, useRef } from 'react';
import { NotesProvider, useNotes } from './store/NotesContext';
import ThemedHeader from './components/ui/Header';
import ThemedSidebar from './components/ui/Sidebar';
import NoteEditor from './components/NoteEditor';
import LoginPage from './components/LoginPage';
import { ThemeProvider } from './theme/theme';

/**
 * Small non-intrusive banner to verify active theme.
 * Shown at bottom-left; can be removed after QA.
 */
function ThemeDebugBanner() {
  const el = document?.documentElement;
  const themeName = el?.getAttribute('data-theme') === 'quicknote' ? 'Quick Note Community' : 'Ocean Professional';
  return (
    <div
      aria-label="Theme debug banner"
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
        opacity: 0.88
      }}
    >
      {themeName}
    </div>
  );
}

// Wrapper to handle keyboard shortcuts and compose layout
function MainShell() {
  const { state, actions } = useNotes();
  const editorSaveRef = useRef(null);

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
