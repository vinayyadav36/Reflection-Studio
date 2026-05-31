import type { JournalEntry } from '../db';

export function calculateStreak(entries: JournalEntry[]): { currentStreak: number, longestStreak: number } {
  let currentStreak = 0;
  let longestStreak = 0;

  if (!entries || entries.length === 0) {
    return { currentStreak, longestStreak };
  }

  const sortedDates = [...entries].map(e => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }).sort((a, b) => b - a);

  const uniqueDates = Array.from(new Set(sortedDates));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (uniqueDates.length > 0) {
    // Current streak logic
    const mostRecent = uniqueDates[0];
    const diffDays = Math.floor((today.getTime() - mostRecent) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      currentStreak = 1;
      let checkDate = mostRecent;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i];
        const daysBetween = Math.floor((checkDate - prevDate) / (1000 * 60 * 60 * 24));
        if (daysBetween === 1) {
          currentStreak++;
          checkDate = prevDate;
        } else {
          break;
        }
      }
    }

    // Longest streak logic
    let tempStreak = 1;
    longestStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = uniqueDates[i];
      const next = uniqueDates[i + 1];
      const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }

  return { currentStreak, longestStreak };
}
