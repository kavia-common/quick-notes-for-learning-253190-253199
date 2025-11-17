import { getEnvConfig } from '../config';

// Simple id generator
const genId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const STORAGE_KEY = 'quick_notes__v1';

// PUBLIC_INTERFACE
export class NotesRepository {
  /** Repository for notes with localStorage as primary store.
   * Optionally proxies to API if REACT_APP_API_BASE present and feature flag enabled.
   * Each note: { id, title, content, updatedAt, createdAt }
   */
  constructor() {
    const { apiBase, featureFlags } = getEnvConfig();
    this.apiBase = apiBase;
    this.flags = featureFlags || {};
  }

  _readAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  _writeAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // PUBLIC_INTERFACE
  list(query = '') {
    /** Returns notes optionally filtered by query in title/content */
    const q = (query || '').toLowerCase();
    const items = this._readAll().sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    if (!q) return items;
    return items.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
    );
  }

  // PUBLIC_INTERFACE
  getById(id) {
    /** Get a single note by id or null */
    if (!id) return null;
    return this._readAll().find((n) => n.id === id) || null;
  }

  // PUBLIC_INTERFACE
  create({ title = '', content = '' }) {
    /** Create a new note with validation */
    const t = (title || '').trim();
    const c = (content || '').trim();
    const now = new Date().toISOString();
    const note = {
      id: genId(),
      title: t || 'Untitled',
      content: c,
      createdAt: now,
      updatedAt: now,
    };
    const items = this._readAll();
    items.unshift(note);
    this._writeAll(items);
    return note;
  }

  // PUBLIC_INTERFACE
  update(id, patch) {
    /** Update an existing note fields; returns updated note or throws */
    const items = this._readAll();
    const idx = items.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    const now = new Date().toISOString();
    const updated = { ...items[idx], ...patch, updatedAt: now };
    items[idx] = updated;
    this._writeAll(items);
    return updated;
  }

  // PUBLIC_INTERFACE
  remove(id) {
    /** Delete note by id; returns boolean */
    const items = this._readAll();
    const next = items.filter((n) => n.id !== id);
    this._writeAll(next);
    return next.length !== items.length;
  }
}

export const notesRepository = new NotesRepository();
