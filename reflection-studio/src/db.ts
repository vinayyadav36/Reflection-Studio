import Dexie, { type Table } from 'dexie';

export interface User {
  id?: number;
  name: string;
}

export interface PromptSet {
  id?: number;
  prompts: string[];
}

export interface Template {
  id?: number;
  name: string;
  description: string;
  promptSetId: number;
}

export interface JournalEntry {
  id?: number;
  templateId: number;
  date: string;
  responses: Record<number, string>; // prompt index to response
  tags: string[];
  mood: string;
}

export interface TagMood {
  id?: number;
  type: 'tag' | 'mood';
  value: string;
}

export class ReflectionDatabase extends Dexie {
  users!: Table<User>;
  templates!: Table<Template>;
  promptSets!: Table<PromptSet>;
  journalEntries!: Table<JournalEntry>;
  tagsMoods!: Table<TagMood>;

  constructor() {
    super('ReflectionDatabase');
    this.version(1).stores({
      users: '++id, name',
      templates: '++id, name, promptSetId',
      promptSets: '++id',
      journalEntries: '++id, templateId, date, mood, *tags',
      tagsMoods: '++id, type, value'
    });
  }
}

export const db = new ReflectionDatabase();
