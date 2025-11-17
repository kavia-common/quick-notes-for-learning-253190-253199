 import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
 import { notesRepository } from '../services/notesRepository';
 import { realtimeService } from '../services/realtimeService';
 import { getEnvConfig } from '../config';
 import { subscribeNotesChanges, mapRowToNote } from '../services/realtimeSupabase';

 const NotesStateContext = createContext(undefined);

 const initialState = {
   notes: [],
   activeId: null,
   query: '',
   error: null,
   authUser: null, // { id, email?, name? }
 };

 function reducer(state, action) {
   switch (action.type) {
     case 'INIT':
       return { ...state, notes: action.payload, error: null };
     case 'SET_QUERY':
       return { ...state, query: action.payload };
     case 'SET_ACTIVE':
       return { ...state, activeId: action.payload };
     case 'ADD_NOTE':
       return { ...state, notes: [action.payload, ...state.notes], activeId: action.payload.id, error: null };
     case 'UPDATE_NOTE':
       return {
         ...state,
         notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
         error: null
       };
     case 'DELETE_NOTE':
       return {
         ...state,
         notes: state.notes.filter(n => n.id !== action.payload),
         activeId: state.activeId === action.payload ? null : state.activeId,
         error: null
       };
     case 'ERROR':
       return { ...state, error: action.payload || 'Unexpected error' };
     case 'LOGIN':
       return { ...state, authUser: action.payload, error: null };
     case 'LOGOUT':
       return { ...state, authUser: null, error: null };
     default:
       return state;
   }
 }

 // PUBLIC_INTERFACE
 export function NotesProvider({ children }) {
   /** Provides notes state and actions with auth and realtime sync (BroadcastChannel + optional Supabase Realtime) */
   const [state, dispatch] = useReducer(reducer, initialState);

   // init notes and auth from storage or remote via repository
   useEffect(() => {
     (async () => {
       try {
         const items = await notesRepository.list('');
         dispatch({ type: 'INIT', payload: items });
       } catch (e) {
         dispatch({ type: 'ERROR', payload: 'Failed to initialize notes' });
       }
     })();
     try {
       const raw = localStorage.getItem('quick_notes_auth_user');
       if (raw) {
         const user = JSON.parse(raw);
         if (user && user.id) {
           dispatch({ type: 'LOGIN', payload: user });
         }
       }
     } catch {
       // ignore
     }
   }, []);

   // subscribe to realtime events from other tabs (local multi-tab)
   useEffect(() => {
     const unsub = realtimeService.subscribe((msg) => {
       if (!msg || !msg.type) return;
       switch (msg.type) {
         case 'note_created':
           dispatch({ type: 'ADD_NOTE', payload: msg.payload.note });
           break;
         case 'note_updated':
           dispatch({ type: 'UPDATE_NOTE', payload: msg.payload.note });
           break;
         case 'note_deleted':
           dispatch({ type: 'DELETE_NOTE', payload: msg.payload.id });
           break;
         case 'auth_changed':
           dispatch({ type: msg.payload?.user ? 'LOGIN' : 'LOGOUT', payload: msg.payload?.user || null });
           break;
         default:
           break;
       }
     });
     return () => unsub();
   }, []);

   // Subscribe to Supabase realtime when:
   // - feature flag featureFlags.useSupabaseDirect === true
   // - REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are configured (client available)
   // - user is authenticated (app ready)
   useEffect(() => {
     const { featureFlags } = getEnvConfig();
     const useSupabaseDirect = !!(featureFlags && featureFlags.useSupabaseDirect === true);

     if (!useSupabaseDirect) return undefined;
     if (!state.authUser) return undefined;

     const unsubscribe = subscribeNotesChanges({
       onInsert: (row) => {
         const note = mapRowToNote(row);
         if (!note) return;
         // Only add if not already present; if present, update
         dispatch({
           type: 'ADD_NOTE',
           payload: note,
         });
       },
       onUpdate: (row /* new */, old) => {
         const note = mapRowToNote(row);
         if (!note) return;
         dispatch({ type: 'UPDATE_NOTE', payload: note });
       },
       onDelete: (row /* old */) => {
         const id = row?.id != null ? String(row.id) : null;
         if (!id) return;
         dispatch({ type: 'DELETE_NOTE', payload: id });
       },
     });

     return () => {
       try {
         unsubscribe && unsubscribe();
       } catch {
         // ignore
       }
     };
   }, [state.authUser]);

   const actions = useMemo(() => ({
     async setQuery(query) {
       dispatch({ type: 'SET_QUERY', payload: query });
       try {
         const items = await notesRepository.list(query);
         dispatch({ type: 'INIT', payload: items });
       } catch (e) {
         dispatch({ type: 'ERROR', payload: 'Failed to list notes' });
       }
     },
     setActive(id) {
       dispatch({ type: 'SET_ACTIVE', payload: id });
     },
     async createNote() {
       try {
         const note = await notesRepository.create({ title: '', content: '' });
         dispatch({ type: 'ADD_NOTE', payload: note });
         realtimeService.publish('note_created', { note });
       } catch (e) {
         dispatch({ type: 'ERROR', payload: e.message || 'Could not create note' });
       }
     },
     async updateNote(id, patch) {
       try {
         const updated = await notesRepository.update(id, patch);
         dispatch({ type: 'UPDATE_NOTE', payload: updated });
         realtimeService.publish('note_updated', { note: updated });
       } catch (e) {
         dispatch({ type: 'ERROR', payload: e.message || 'Could not update note' });
       }
     },
     async deleteNote(id) {
       try {
         await notesRepository.remove(id);
         dispatch({ type: 'DELETE_NOTE', payload: id });
         realtimeService.publish('note_deleted', { id });
       } catch (e) {
         dispatch({ type: 'ERROR', payload: e.message || 'Could not delete note' });
       }
     },
     // PUBLIC_INTERFACE
     login(user) {
       /** Set authenticated user (mock). Persists to localStorage and broadcasts. */
       try {
         localStorage.setItem('quick_notes_auth_user', JSON.stringify(user));
       } catch {
         // ignore
       }
       dispatch({ type: 'LOGIN', payload: user });
       realtimeService.publish('auth_changed', { user });
     },
     // PUBLIC_INTERFACE
     logout() {
       /** Clear authenticated user. */
       try {
         localStorage.removeItem('quick_notes_auth_user');
       } catch {
         // ignore
       }
       dispatch({ type: 'LOGOUT' });
       realtimeService.publish('auth_changed', { user: null });
     }
   }), []);

   const value = useMemo(() => ({ state, actions }), [state, actions]);
   return (
     <NotesStateContext.Provider value={value}>
       {children}
     </NotesStateContext.Provider>
   );
 }

 // PUBLIC_INTERFACE
 export function useNotes() {
   /** Accessor for notes state and actions */
   const ctx = useContext(NotesStateContext);
   if (!ctx) throw new Error('useNotes must be used within NotesProvider');
   return ctx;
 }
