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
    * If REACT_APP_API_BASE or REACT_APP_BACKEND_URL is set, uses remote API for CRUD, with local cache fallback.
    * Supports JSONPlaceholder mapping when base is 'https://jsonplaceholder.typicode.typicode.com'.
    * Mock mode: if feature flag notes_mock is true, forces local behavior regardless of API base.
    * Each note: { id, title, content, updatedAt, createdAt }
    */
   constructor() {
     const { apiBase, featureFlags, externalJsonPlaceholder, useNotesMock } = getEnvConfig();
     this.apiBase = apiBase || '';
     this.flags = featureFlags || {};
     this.isJsonPlaceholder = !!externalJsonPlaceholder;
     // mock mode disables remote client entirely
     const mockEnabled = useNotesMock === true;
     this.client = (!mockEnabled && this.apiBase) ? new ApiClient(this.apiBase) : null;
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
     const id = note.id != null ? String(note.id) : undefined;
     return { ...note, id, createdAt, updatedAt };
   }
 
   _fromJsonPlaceholder(p) {
     if (!p) return p;
     const now = new Date().toISOString();
     return {
       id: String(p.id),
       title: p.title || '',
       content: p.body || '',
       createdAt: now,
       updatedAt: now,
     };
   }
 
   _toJsonPlaceholderPayload(noteLike) {
     // Map local note fields to JSONPlaceholder shape
     return {
       title: noteLike.title || '',
       body: noteLike.content || '',
       userId: 1, // arbitrary for demo API
     };
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
         let remote = await this.client.listNotes();
         if (this.isJsonPlaceholder) {
           // Limit payload size and map fields
           remote = (remote || []).slice(0, 50).map((p) => this._fromJsonPlaceholder(p));
         } else {
           remote = (remote || []).map((n) => this._normalize(n));
         }
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
     return this._readAll().find((n) => String(n.id) === String(id)) || null;
   }
 
   // PUBLIC_INTERFACE
   async create({ title = '', content = '' }) {
     /** Create a new note. Remote-first with local fallback and cache update. */
     const t = (title || '').trim();
     const c = (content || '').trim();
     if (this.client) {
       try {
         let payload = { title: t, content: c };
         if (this.isJsonPlaceholder) {
           payload = this._toJsonPlaceholderPayload({ title: t, content: c });
         }
         const createdRaw = await this.client.createNote(payload);
         let created;
         if (this.isJsonPlaceholder) {
           created = this._fromJsonPlaceholder(createdRaw);
         } else {
           created = this._normalize(createdRaw);
         }
         const items = [created, ...this._readAll()];
         this._writeAll(items);
         return created;
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
         let payload = patch || {};
         if (this.isJsonPlaceholder) {
           // Translate patch to JSONPlaceholder fields
           payload = this._toJsonPlaceholderPayload({
             title: payload.title,
             content: payload.content,
           });
         }
         const updatedRaw = await this.client.updateNote(id, payload);
         let normalized;
         if (this.isJsonPlaceholder) {
           // JSONPlaceholder returns 'body', map to local shape and set timestamps
           const mapped = this._fromJsonPlaceholder(updatedRaw);
           // preserve id from input (in case service echoes a different type)
           mapped.id = String(id);
           normalized = mapped;
         } else {
           normalized = this._normalize(updatedRaw);
         }
         const items = this._readAll();
         const idx = items.findIndex((n) => String(n.id) === String(normalized.id));
         if (idx !== -1) {
           // ensure updatedAt bumped
           normalized.updatedAt = new Date().toISOString();
           items[idx] = { ...items[idx], ...normalized };
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
     const idx = items.findIndex((n) => String(n.id) === String(id));
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
         const next = this._readAll().filter((n) => String(n.id) !== String(id));
         this._writeAll(next);
         return true;
       } catch {
         // fall back to local
       }
     }
     const items = this._readAll();
     const next = items.filter((n) => String(n.id) !== String(id));
     this._writeAll(next);
     return next.length !== items.length;
   }
 }
 
 export const notesRepository = new NotesRepository();
