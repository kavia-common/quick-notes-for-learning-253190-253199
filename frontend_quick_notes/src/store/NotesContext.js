import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import { notesRepository } from '../services/notesRepository';

const NotesStateContext = createContext(undefined);
const NotesDispatchContext = createContext(undefined);

const initialState = {
  notes: [],
  activeId: null,
  query: '',
  error: null,
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
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function NotesProvider({ children }) {
  /** Provides notes state and actions */
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const items = notesRepository.list('');
      dispatch({ type: 'INIT', payload: items });
    } catch (e) {
      dispatch({ type: 'ERROR', payload: 'Failed to initialize notes' });
    }
  }, []);

  const actions = useMemo(() => ({
    setQuery(query) {
      dispatch({ type: 'SET_QUERY', payload: query });
      const items = notesRepository.list(query);
      dispatch({ type: 'INIT', payload: items });
    },
    setActive(id) {
      dispatch({ type: 'SET_ACTIVE', payload: id });
    },
    createNote() {
      try {
        const note = notesRepository.create({ title: '', content: '' });
        dispatch({ type: 'ADD_NOTE', payload: note });
      } catch (e) {
        dispatch({ type: 'ERROR', payload: 'Could not create note' });
      }
    },
    updateNote(id, patch) {
      try {
        const updated = notesRepository.update(id, patch);
        dispatch({ type: 'UPDATE_NOTE', payload: updated });
      } catch (e) {
        dispatch({ type: 'ERROR', payload: e.message || 'Could not update note' });
      }
    },
    deleteNote(id) {
      try {
        notesRepository.remove(id);
        dispatch({ type: 'DELETE_NOTE', payload: id });
      } catch (e) {
        dispatch({ type: 'ERROR', payload: 'Could not delete note' });
      }
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
