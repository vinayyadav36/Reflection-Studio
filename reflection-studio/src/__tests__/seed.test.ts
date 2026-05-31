import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { seedDatabase } from '../seed';
import 'fake-indexeddb/auto'; // Needs to mock IndexedDB if not done globally

describe('Database Seeding', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('should create 6 templates and corresponding prompt sets', async () => {
    await seedDatabase();

    const templates = await db.templates.toArray();
    expect(templates).toHaveLength(6);
    expect(templates.map(t => t.name)).toContain('Morning Intention');
    expect(templates.map(t => t.name)).toContain('Emotional Check-In');

    const promptSets = await db.promptSets.toArray();
    expect(promptSets).toHaveLength(6);

    const checkInTemplate = templates.find(t => t.name === 'Emotional Check-In');
    expect(checkInTemplate).toBeDefined();

    const checkInPrompts = promptSets.find(ps => ps.id === checkInTemplate?.promptSetId);
    expect(checkInPrompts?.prompts).toHaveLength(6);
  });

  it('should create 10 initial tags/moods', async () => {
    await seedDatabase();
    const tagsMoods = await db.tagsMoods.toArray();
    expect(tagsMoods).toHaveLength(10);
    expect(tagsMoods.map(t => t.name)).toContain('Grateful');
    expect(tagsMoods.map(t => t.name)).toContain('Overwhelmed');
  });

  it('should not seed duplicate data if already seeded', async () => {
    await seedDatabase();
    const initialCount = await db.templates.count();
    expect(initialCount).toBe(6);

    // Run again
    await seedDatabase();
    const newCount = await db.templates.count();
    expect(newCount).toBe(6); // Should not increase
  });
});
