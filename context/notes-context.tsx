import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type Priority = 'important' | 'not-so-important' | 'for-fun';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; backgroundRgba: string; borderRgba: string }> = {
  'important':        { label: 'Important',        color: '#EF4444', backgroundRgba: 'rgba(239,68,68,0.10)',  borderRgba: 'rgba(239,68,68,0.25)' },
  'not-so-important': { label: 'Not So Important', color: '#F59E0B', backgroundRgba: 'rgba(245,158,11,0.10)', borderRgba: 'rgba(245,158,11,0.25)' },
  'for-fun':          { label: 'For Fun',          color: '#10B981', backgroundRgba: 'rgba(16,185,129,0.10)', borderRgba: 'rgba(16,185,129,0.25)' },
};

export interface Note {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

interface NotesContextValue {
  notes: Note[];
  addNote: (title: string, content: string, priority: Priority) => Promise<Note>;
  updateNote: (id: string, title: string, content: string, priority: Priority) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextValue | null>(null);

const STORAGE_KEY = 'notes_data';

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const loaded: Note[] = JSON.parse(raw).map((n: Note) => ({
            ...n,
            priority: n.priority ?? 'for-fun',
          }));
          setNotes(loaded);
        }
      })
      .catch((err) => console.error('[NotesContext] Failed to load notes:', err));
  }, []);

  const persist = useCallback((updated: Note[]) => {
    setNotes(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
      console.error('[NotesContext] Failed to persist notes:', err),
    );
  }, []);

  const addNote = useCallback(
    async (title: string, content: string, priority: Priority): Promise<Note> => {
      const now = new Date().toISOString();
      const note: Note = {
        id: uuidv4(),
        title,
        content,
        priority,
        createdAt: now,
        updatedAt: now,
      };
      persist([note, ...notes]);
      return note;
    },
    [notes, persist],
  );

  const updateNote = useCallback(
    async (id: string, title: string, content: string, priority: Priority) => {
      persist(
        notes.map((n) =>
          n.id === id ? { ...n, title, content, priority, updatedAt: new Date().toISOString() } : n,
        ),
      );
    },
    [notes, persist],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist],
  );

  const getNoteById = useCallback((id: string) => notes.find((n) => n.id === id), [notes]);

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, getNoteById }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
