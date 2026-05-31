import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import 'fake-indexeddb/auto';
import { calculateStreak } from '../utils/stats';

describe('Stats Calculation Helpers', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  const addEntry = async (daysAgo: number, wordCount: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);

    await db.journalEntries.add({
      templateId: 1,
      date: d.toISOString(),
      responses: [],
      tags: [],
      mood: '',
      wordCount,
      status: 'complete',
      createdAt: d.toISOString(),
      updatedAt: d.toISOString()
    });
  };

  it('calculates total word count correctly', async () => {
    await addEntry(0, 10);
    await addEntry(1, 20);
    await addEntry(2, 5);

    const entries = await db.journalEntries.toArray();
    const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
    expect(totalWords).toBe(35);
  });

  it('calculates current streak correctly for consecutive days', async () => {
    // Today, yesterday, day before
    await addEntry(0, 10);
    await addEntry(1, 10);
    await addEntry(2, 10);

    const entries = await db.journalEntries.toArray();

    const { currentStreak } = calculateStreak(entries as any);
    expect(currentStreak).toBe(3);
  });

  it('resets streak if a day is skipped', async () => {
    // Today, 2 days ago (missed yesterday)
    await addEntry(0, 10);
    await addEntry(2, 10);
    await addEntry(3, 10);

    const entries = await db.journalEntries.toArray();

    const { currentStreak } = calculateStreak(entries as any);
    expect(currentStreak).toBe(1);
  });
});
