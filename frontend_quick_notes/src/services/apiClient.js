 // PUBLIC_INTERFACE
 export class ApiClient {
   /** Minimal REST client for notes CRUD.
    * Supports:
    *  - Next.js API at `${baseUrl}/api/notes`
    *  - JSONPlaceholder at `https://jsonplaceholder.typicode.com/posts`
    * Methods return normalized note objects with createdAt/updatedAt fields when available.
    */
   constructor(baseUrl) {
     this.baseUrl = (baseUrl || '').replace(/\/*$/, '');
     this.isJsonPlaceholder = this.baseUrl === 'https://jsonplaceholder.typicode.com';
   }
 
   _url(path = '') {
     return `${this.baseUrl}${path}`;
   }
 
   async _request(path, options = {}) {
     const url = this._url(path);
     const headers = {
       'Content-Type': 'application/json',
       ...(options.headers || {}),
     };
     const res = await fetch(url, { ...options, headers });
     if (!res.ok) {
       let message = `Request failed with status ${res.status}`;
       try {
         const err = await res.json();
         if (err?.error?.message) message = err.error.message;
         else if (err?.message) message = err.message;
       } catch {
         // ignore parse errors
       }
       throw new Error(message);
     }
     if (res.status === 204) return null;
     try {
       return await res.json();
     } catch {
       return null;
     }
   }
 
   _normalize(note) {
     if (!note) return note;
     // map server snake_case timestamps to camelCase
     const createdAt = note.createdAt || note.created_at;
     const updatedAt = note.updatedAt || note.updated_at;
     // ensure id is a string for consistent comparisons in UI
     const id = note.id != null ? String(note.id) : undefined;
     return { ...note, id, createdAt, updatedAt };
   }
 
   // PUBLIC_INTERFACE
   async listNotes() {
     /** Fetch all notes from server. Returns array of normalized notes. */
     if (this.isJsonPlaceholder) {
       const data = await this._request('/posts', { method: 'GET' });
       return Array.isArray(data) ? data : [];
     }
     const data = await this._request('/api/notes', { method: 'GET' });
     const items = Array.isArray(data) ? data : (data?.items || []);
     return items.map((n) => this._normalize(n));
   }
 
   // PUBLIC_INTERFACE
   async createNote(payload) {
     /** Create a new note on server. Returns created note normalized. */
     if (this.isJsonPlaceholder) {
       // JSONPlaceholder echoes back the created resource (non-persistent)
       const data = await this._request('/posts', {
         method: 'POST',
         body: JSON.stringify(payload || {}),
       });
       return data;
     }
     const data = await this._request('/api/notes', {
       method: 'POST',
       body: JSON.stringify(payload || {}),
     });
     return this._normalize(data);
   }
 
   // PUBLIC_INTERFACE
   async updateNote(id, payload) {
     /** Update a note by id on server. Returns updated note normalized. */
     if (!id) throw new Error('Missing id');
     if (this.isJsonPlaceholder) {
       const data = await this._request(`/posts/${encodeURIComponent(id)}`, {
         method: 'PUT',
         body: JSON.stringify(payload || {}),
       });
       return data;
     }
     const data = await this._request(`/api/notes/${encodeURIComponent(id)}`, {
       method: 'PUT',
       body: JSON.stringify(payload || {}),
     });
     return this._normalize(data);
   }
 
   // PUBLIC_INTERFACE
   async deleteNote(id) {
     /** Delete a note by id on server. Returns true on success. */
     if (!id) throw new Error('Missing id');
     if (this.isJsonPlaceholder) {
       await this._request(`/posts/${encodeURIComponent(id)}`, {
         method: 'DELETE',
       });
       return true;
     }
     await this._request(`/api/notes/${encodeURIComponent(id)}`, {
       method: 'DELETE',
     });
     return true;
   }
 }
 
 export default ApiClient;
