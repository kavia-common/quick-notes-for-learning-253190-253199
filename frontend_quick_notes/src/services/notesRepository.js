 import { getEnvConfig } from '../config';
 import { ApiClient } from './apiClient';
 
 // Simple id generator
 const genId = () =>
   (typeof crypto !== 'undefined' && crypto.randomUUID)
     ? crypto.randomUUID()
     : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
 
 const STORAGE_KEY = 'quick_notes__v1';
 
 // PUBLIC_INTERFACE
 export class NotesRepository {
   /** Repository for notes with localStorage persistence and optional remote API.
    * If REACT_APP_API_BASE is set, uses remote API for CRUD, with local cache fallback.
    * Each note: { id, title, content, updatedAt, createdAt }
    */
   constructor() {
     const { apiBase, featureFlags } = getEnvConfig();
     this.apiBase = apiBase || '';
     this.flags = featureFlags || {};
     this.client = this.apiBase ? new ApiClient(this.apiBase) : null;
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
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
     } catch {
       // ignore storage write failures
     }
   }
 
   _normalize(note) {
     if (!note) return note;
     const createdAt = note.createdAt || note.created_at;
     const updatedAt = note.updatedAt || note.updated_at;
     return { ...note, createdAt, updatedAt };
   }
 
   _indexAndCache(list) {
     const items = (list || []).map((n) => this._normalize(n));
     // sort by updatedAt desc consistently
     items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
     this._writeAll(items);
     return items;
   }
 
   // PUBLIC_INTERFACE
   async list(query = '') {
     /** Returns notes optionally filtered by query in title/content, remote-first if configured. */
     const q = (query || '').toLowerCase();
     if (this.client) {
       try {
         const remote = await this.client.listNotes();
         const cached = this._indexAndCache(remote);
         if (!q) return cached;
         return cached.filter(
           (n) =>
             (n.title || '').toLowerCase().includes(q) ||
             (n.content || '').toLowerCase().includes(q)
         );
       } catch {
         // fall back to cache
       }
     }
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
   async getById(id) {
     /** Get a single note by id or null (uses cache/local only) */
     if (!id) return null;
     return this._readAll().find((n) => n.id === id) || null;
   }
 
   // PUBLIC_INTERFACE
   async create({ title = '', content = '' }) {
     /** Create a new note. Remote-first with local fallback and cache update. */
     const t = (title || '').trim();
     const c = (content || '').trim();
     if (this.client) {
       try {
         const created = await this.client.createNote({ title: t, content: c });
         const items = [this._normalize(created), ...this._readAll()];
         this._writeAll(items);
         return this._normalize(created);
       } catch {
         // fall back to local
       }
     }
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
   async update(id, patch) {
     /** Update an existing note; remote-first, sync cache, fallback local. */
     if (this.client) {
       try {
         const updatedRemote = await this.client.updateNote(id, patch);
         const normalized = this._normalize(updatedRemote);
         const items = this._readAll();
         const idx = items.findIndex((n) => n.id === normalized.id);
         if (idx !== -1) {
           items[idx] = normalized;
         } else {
           items.unshift(normalized);
         }
         // keep cache sorted by updatedAt
         items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
         this._writeAll(items);
         return normalized;
       } catch {
         // fall back to local
       }
     }
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
   async remove(id) {
     /** Delete note by id; remote-first, update cache, fallback local. Returns boolean */
     if (this.client) {
       try {
         await this.client.deleteNote(id);
         const next = this._readAll().filter((n) => n.id !== id);
         this._writeAll(next);
         return true;
       } catch {
         // fall back to local
       }
     }
     const items = this._readAll();
     const next = items.filter((n) => n.id !== id);
     this._writeAll(next);
     return next.length !== items.length;
   }
 }
 
 export const notesRepository = new NotesRepository();
