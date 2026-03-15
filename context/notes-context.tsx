import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesContextValue {
  notes: Note[];
  addNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextValue | null>(null);

const STORAGE_KEY = 'notes_data';

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setNotes(JSON.parse(raw));
    });
  }, []);

  const persist = useCallback((updated: Note[]) => {
    setNotes(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addNote = useCallback(
    async (title: string, content: string): Promise<Note> => {
      const now = new Date().toISOString();
      const note: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: now,
        updatedAt: now,
      };
      persist([note, ...notes]);
      return note;
    },
    [notes, persist],
  );

  const updateNote = useCallback(
    async (id: string, title: string, content: string) => {
      persist(
        notes.map((n) =>
          n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n,
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
