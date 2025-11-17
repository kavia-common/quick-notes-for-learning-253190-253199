import { getSupabaseClient } from './supabaseClient';

/**
 * Notes service using Supabase PostgREST.
 * Exposes CRUD methods that map server snake_case to camelCase.
 */

function normalize(note) {
  if (!note) return note;
  const createdAt = note.createdAt || note.created_at;
  const updatedAt = note.updatedAt || note.updated_at;
  return {
    id: String(note.id),
    title: note.title || '',
    content: note.content || '',
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

// PUBLIC_INTERFACE
export async function listNotesSupabase() {
  /** List notes from Supabase (public.notes). Returns [] if client not available. */
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message || 'Failed to fetch notes');
  return (data || []).map(normalize);
}

// PUBLIC_INTERFACE
export async function createNoteSupabase({ title = '', content = '' }) {
  /** Create a note and return normalized note. */
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select('id, title, content, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message || 'Failed to create note');
  return normalize(data);
}

// PUBLIC_INTERFACE
export async function updateNoteSupabase(id, patch) {
  /** Update a note by id and return normalized result. */
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('notes')
    .update({ ...(patch || {}) })
    .eq('id', id)
    .select('id, title, content, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message || 'Failed to update note');
  return normalize(data);
}

// PUBLIC_INTERFACE
export async function deleteNoteSupabase(id) {
  /** Delete a note by id. Returns true on success. */
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete note');
  return true;
}
