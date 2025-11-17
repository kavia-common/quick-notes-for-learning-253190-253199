import React, { useState } from 'react';
import { useNotes } from '../store/NotesContext';

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Simple mocked login screen asking for email or username. */
  const { actions } = useNotes();
  const [value, setValue] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e?.preventDefault?.();
    const v = (value || '').trim();
    if (v.length < 3) {
      setErr('Please enter at least 3 characters.');
      return;
    }
    // Basic heuristic to store email-like strings; this is a mock auth.
    actions.login({ id: v.toLowerCase(), email: v.includes('@') ? v : undefined, name: v });
  };

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form
        onSubmit={submit}
        aria-label="Login form"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          padding: 24,
          width: 'min(94vw, 420px)'
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Quick Notes</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: 0, marginBottom: 16 }}>
          Sign in with your email or username to continue.
        </p>
        <label htmlFor="login-id" className="visually-hidden">Email or Username</label>
        <input
          id="login-id"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Email or username"
          aria-invalid={!!err}
          aria-describedby={err ? 'login-error' : undefined}
          className="input"
        />
        {err && (
          <div role="alert" id="login-error" style={{ color: 'var(--color-error)', marginTop: 8 }}>
            {err}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          aria-label="Sign in"
          style={{ marginTop: 12 }}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
