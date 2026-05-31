import { db } from './db';

export async function seedDatabase() {
  const isSeeded = await db.appState.get('seeded');
  if (isSeeded?.value) {
    return; // Already seeded
  }

  const templatesData = [
    {
      name: "Daily Reflection",
      description: "A general reflection on how your day went.",
      category: "Daily",
      color: "#3b82f6", // blue
      icon: "☀️",
      prompts: [
        { text: "What went well today?", hint: "Focus on the positives, big or small." },
        { text: "What could have gone better?", hint: "Reflect on challenges and areas for improvement." },
        { text: "What did you learn today?", hint: "Any new insights or lessons?" },
        { text: "What is your main focus for tomorrow?", hint: "Set a single priority." },
        { text: "How are you feeling overall?", hint: "A quick emotional check-in." }
      ]
    },
    {
      name: "Gratitude Journal",
      description: "Cultivate thankfulness and appreciation.",
      category: "Daily",
      color: "#10b981", // green
      icon: "🙏",
      prompts: [
        { text: "Name three things you are grateful for today.", hint: "List 3 specific things." },
        { text: "Why are you grateful for each of these?", hint: "Reflect on their impact." },
        { text: "Is there a person you are especially grateful for today? Why?", hint: "Think of someone who helped you." },
        { text: "What is a simple pleasure you enjoyed today?", hint: "Coffee, a nice walk, a good song?" },
        { text: "How can you show your gratitude to others tomorrow?", hint: "Small acts of kindness." }
      ]
    },
    {
      name: "Weekly Wins",
      description: "Focus on your successes and accomplishments.",
      category: "Weekly",
      color: "#f59e0b", // yellow
      icon: "🏆",
      prompts: [
        { text: "What is the biggest win you had this week?", hint: "Reflect on your achievements." },
        { text: "How did you achieve this win?", hint: "What actions did you take?" },
        { text: "Who or what helped you?", hint: "Acknowledge support from others." },
        { text: "What challenges did you overcome?", hint: "Think about the obstacles." },
        { text: "How does this win make you feel?", hint: "Celebrate your success." }
      ]
    },
    {
      name: "Morning Intention",
      description: "Set daily goals and mindset.",
      category: "Morning",
      color: "#8b5cf6", // purple
      icon: "🌅",
      prompts: [
        { text: "What is my top priority for today?", hint: "The one thing you must do." },
        { text: "How do I want to feel today?", hint: "Set your emotional tone." },
        { text: "What might get in my way today?", hint: "Anticipate challenges." },
        { text: "How will I handle those challenges?", hint: "Plan your response." },
        { text: "What am I looking forward to today?", hint: "Find joy in the day ahead." }
      ]
    },
    {
      name: "Evening Wind-Down",
      description: "Process the day and release stress.",
      category: "Evening",
      color: "#6366f1", // indigo
      icon: "🌙",
      prompts: [
        { text: "What was the best part of today?", hint: "Recall a positive moment." },
        { text: "What am I still holding onto from today?", hint: "Identify lingering stress." },
        { text: "What can I do to let that go?", hint: "Find a way to release it." },
        { text: "What did I do for myself today?", hint: "Reflect on self-care." },
        { text: "What am I grateful for right now?", hint: "End the day with thanks." }
      ]
    },
    {
      name: "Emotional Check-In",
      description: "Identify emotions, triggers, and needs.",
      category: "Emotional",
      color: "#ec4899", // pink
      icon: "❤️",
      prompts: [
        { text: "What am I feeling right now?", hint: "Name the emotion." },
        { text: "Where do I feel this in my body?", hint: "Locate the physical sensation." },
        { text: "What triggered this feeling?", hint: "Identify the root cause." },
        { text: "What do I need right now?", hint: "Comfort, space, connection?" },
        { text: "How can I meet that need?", hint: "Actionable steps to take." },
        { text: "What is a gentle reminder I can give myself?", hint: "Offer self-compassion." }
      ]
    }
  ];

  for (const templateData of templatesData) {
    // Add template first to get its ID
    const templateId = await db.templates.add({
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      color: templateData.color,
      icon: templateData.icon,
      promptSetId: 0 // placeholder
    }) as number;

    // Add prompt set
    const promptSetId = await db.promptSets.add({
      templateId,
      prompts: templateData.prompts.map((p, i) => ({
        id: `prompt-${templateId}-${i}`,
        order: i,
        text: p.text,
        hint: p.hint
      }))
    }) as number;

    // Update template with the real promptSetId
    await db.templates.update(templateId, { promptSetId });
  }

  // Predefined Tags & Moods
  const initialTagsMoods = [
    { type: 'tag' as const, name: 'Grateful', color: '#10b981', emoji: '🙏' },
    { type: 'tag' as const, name: 'Anxious', color: '#f59e0b', emoji: '😰' },
    { type: 'tag' as const, name: 'Motivated', color: '#3b82f6', emoji: '🔥' },
    { type: 'tag' as const, name: 'Tired', color: '#6b7280', emoji: '🥱' },
    { type: 'tag' as const, name: 'Happy', color: '#eab308', emoji: '😊' },
    { type: 'tag' as const, name: 'Sad', color: '#3b82f6', emoji: '😢' },
    { type: 'tag' as const, name: 'Focused', color: '#8b5cf6', emoji: '🎯' },
    { type: 'tag' as const, name: 'Overwhelmed', color: '#ef4444', emoji: '🤯' },
    { type: 'tag' as const, name: 'Peaceful', color: '#14b8a6', emoji: '🕊️' },
    { type: 'tag' as const, name: 'Confused', color: '#a855f7', emoji: '😕' }
  ];
  await db.tagsMoods.bulkAdd(initialTagsMoods);

  await db.appState.put({ id: 'seeded', value: true });
}
