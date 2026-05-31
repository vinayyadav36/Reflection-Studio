import Dexie, { type Table } from 'dexie';

export interface User {
  id?: number;
  displayName: string;
  defaultTemplate: number | null;
  reminderTime: string | null;
  theme: 'light' | 'dark' | 'system';
}

export interface PromptSet {
  id?: number;
  templateId: number;
  prompts: { id: string; order: number; text: string; hint: string; }[];
}

export interface Template {
  id?: number;
  name: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  promptSetId: number;
}

export interface JournalEntry {
  id?: number;
  templateId: number;
  date: string;
  title?: string;
  responses: { promptId: string; promptText: string; response: string; }[];
  tags: string[];
  mood: string;
  wordCount: number;
  status: 'draft' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export interface TagMood {
  id?: number;
  type: 'tag' | 'mood';
  name: string;
  color: string;
  emoji: string;
}

export interface AppState {
  id: string; // usually 'seeded'
  value: boolean;
}

export class ReflectionDatabase extends Dexie {
  users!: Table<User>;
  templates!: Table<Template>;
  promptSets!: Table<PromptSet>;
  journalEntries!: Table<JournalEntry>;
  tagsMoods!: Table<TagMood>;
  appState!: Table<AppState>;

  constructor() {
    super('ReflectionDatabase');
    this.version(2).stores({
      users: '++id',
      templates: '++id, category',
      promptSets: '++id, templateId',
      journalEntries: '++id, templateId, date, mood, status, *tags',
      tagsMoods: '++id, type, name',
      appState: 'id'
    });
  }
}

export const db = new ReflectionDatabase();
