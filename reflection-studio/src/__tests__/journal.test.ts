import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import 'fake-indexeddb/auto';

describe('Journal Operations', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('should save a new entry with status draft', async () => {
    const id = await db.journalEntries.add({
      templateId: 1,
      date: new Date().toISOString(),
      responses: [
        { promptId: 'p1', promptText: 'Q1', response: 'Test answer' }
      ],
      tags: [],
      mood: '',
      wordCount: 2,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const entry = await db.journalEntries.get(id as number);
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('draft');
    expect(entry?.wordCount).toBe(2);
  });

  it('should allow completing a draft', async () => {
    const id = await db.journalEntries.add({
      templateId: 1,
      date: new Date().toISOString(),
      responses: [],
      tags: [],
      mood: '',
      wordCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }) as number;

    await db.journalEntries.update(id, { status: 'complete', mood: '😊', tags: ['Happy'] });

    const updated = await db.journalEntries.get(id);
    expect(updated?.status).toBe('complete');
    expect(updated?.mood).toBe('😊');
    expect(updated?.tags).toContain('Happy');
  });

  it('should delete an entry from Dexie', async () => {
    const id = await db.journalEntries.add({
      templateId: 1,
      date: new Date().toISOString(),
      responses: [],
      tags: [],
      mood: '',
      wordCount: 0,
      status: 'complete',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }) as number;

    await db.journalEntries.delete(id);
    const entry = await db.journalEntries.get(id);
    expect(entry).toBeUndefined();
  });
});
