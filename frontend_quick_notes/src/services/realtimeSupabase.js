import { getSupabaseClient } from './supabaseClient';

/**
 * Realtime subscription helper for Supabase Postgres Changes on public.notes.
 * Consumers pass callbacks for INSERT/UPDATE/DELETE; returns an unsubscribe function.
 * Uses supabase.channel with postgres_changes.
 */

// PUBLIC_INTERFACE
export function subscribeNotesChanges({ onInsert, onUpdate, onDelete } = {}) {
  /** Subscribes to INSERT, UPDATE, DELETE on public.notes and forwards payload rows.
   * Returns an unsubscribe function. No-ops when client is not available.
   */
  const supabase = getSupabaseClient();
  if (!supabase) {
    return () => {};
  }

  const channel = supabase.channel('public:notes:changes');

  channel
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notes' },
      (payload) => {
        try {
          onInsert && onInsert(payload.new);
        } catch {
          // swallow subscriber errors
        }
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'notes' },
      (payload) => {
        try {
          onUpdate && onUpdate(payload.new, payload.old);
        } catch {
          // swallow subscriber errors
        }
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'notes' },
      (payload) => {
        try {
          onDelete && onDelete(payload.old);
        } catch {
          // swallow subscriber errors
        }
      },
    )
    .subscribe((status) => {
      // Avoid logging secrets; do not log env or keys.
      // Optional: could set internal state if needed
      return status;
    });

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {
      // ignore cleanup errors
    }
  };
}

/**
 * Utilities to map DB row fields to app state shape:
 * DB: { id, title, content, created_at, updated_at }
 * App: { id, title, content, createdAt, updatedAt }
 */
export function mapRowToNote(row) {
  if (!row) return null;
  const createdAt = row.createdAt || row.created_at || row.created_at?.toString?.() || row.created_at;
  const updatedAt = row.updatedAt || row.updated_at || row.updated_at?.toString?.() || row.updated_at;
  return {
    id: String(row.id),
    title: row.title || '',
    content: row.content || '',
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString(),
  };
}
