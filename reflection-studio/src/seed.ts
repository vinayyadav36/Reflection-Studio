import { db } from './db';

export async function seedDatabase() {
  const templatesCount = await db.templates.count();
  if (templatesCount > 0) {
    return; // Already seeded
  }

  // Seed Prompt Sets
  const dailyReflectionPromptsId = await db.promptSets.add({
    prompts: [
      "What went well today?",
      "What could have gone better?",
      "What did you learn today?",
      "What is your main focus for tomorrow?"
    ]
  });

  const winsPromptsId = await db.promptSets.add({
    prompts: [
      "What is a win you had today, no matter how small?",
      "How did you achieve this win?",
      "Who or what helped you?",
      "How does this win make you feel?"
    ]
  });

  const gratitudePromptsId = await db.promptSets.add({
    prompts: [
      "Name three things you are grateful for today.",
      "Why are you grateful for each of these?",
      "Is there a person you are especially grateful for today? Why?",
      "What is a simple pleasure you enjoyed today?"
    ]
  });

  // Seed Templates
  await db.templates.bulkAdd([
    {
      name: "Daily Reflection",
      description: "A general reflection on how your day went.",
      promptSetId: dailyReflectionPromptsId
    },
    {
      name: "Wins",
      description: "Focus on your successes and accomplishments.",
      promptSetId: winsPromptsId
    },
    {
      name: "Gratitude",
      description: "Cultivate thankfulness and appreciation.",
      promptSetId: gratitudePromptsId
    }
  ]);

  // Seed Initial Moods and Tags (optional, just for suggestions)
  const initialTagsMoods = [
    { type: 'mood' as const, value: 'Happy' },
    { type: 'mood' as const, value: 'Calm' },
    { type: 'mood' as const, value: 'Productive' },
    { type: 'mood' as const, value: 'Tired' },
    { type: 'mood' as const, value: 'Stressed' },
    { type: 'tag' as const, value: 'Work' },
    { type: 'tag' as const, value: 'Personal' },
    { type: 'tag' as const, value: 'Health' },
    { type: 'tag' as const, value: 'Relationships' },
  ];
  await db.tagsMoods.bulkAdd(initialTagsMoods);
}
