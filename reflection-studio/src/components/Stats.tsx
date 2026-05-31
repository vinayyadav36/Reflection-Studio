import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useMemo } from 'react';
import { Flame, PenTool, Activity, Hash } from 'lucide-react';
import { calculateStreak } from '../utils/stats';

export function Stats() {
  const entries = useLiveQuery(
    () => db.journalEntries.where('status').equals('complete').toArray()
  ) || [];

  const templates = useLiveQuery(() => db.templates.toArray()) || [];

  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);

    const { currentStreak, longestStreak } = calculateStreak(entries as any);

    // Most used template
    const templateCounts: Record<number, number> = {};
    entries.forEach(e => {
      templateCounts[e.templateId] = (templateCounts[e.templateId] || 0) + 1;
    });
    let topTemplateId = -1;
    let topTemplateCount = 0;
    for (const [id, count] of Object.entries(templateCounts)) {
      if (count > topTemplateCount) {
        topTemplateCount = count;
        topTemplateId = Number(id);
      }
    }

    // Most common mood
    const moodCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }
    });
    let topMood = '';
    let topMoodCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > topMoodCount) {
        topMoodCount = count;
        topMood = mood;
      }
    }

    // Most used tags
    const tagCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Days of week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    entries.forEach(e => {
      dayCounts[new Date(e.date).getDay()]++;
    });
    const maxDayCount = Math.max(...dayCounts, 1);

    // Last 6 months
    const monthCounts: { label: string, count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString(undefined, { month: 'short' });

      const count = entries.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).length;

      monthCounts.push({ label, count });
    }
    const maxMonthCount = Math.max(...monthCounts.map(m => m.count), 1);

    return {
      totalEntries,
      totalWords,
      currentStreak,
      longestStreak,
      topTemplateId,
      topMood,
      topTags,
      dayCounts,
      maxDayCount,
      daysOfWeek,
      monthCounts,
      maxMonthCount
    };
  }, [entries]);

  if (!stats) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-semibold mb-2">Not enough data</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Complete some journal entries to see your statistics.
        </p>
      </div>
    );
  }

  const topTemplate = templates.find(t => t.id === stats.topTemplateId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Insights</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Reflect on your journaling journey.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <PenTool className="w-4 h-4" />
            <span className="text-sm font-medium">Total Entries</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalEntries}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Total Words</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalWords.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.currentStreak} <span className="text-sm font-normal text-slate-500">days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Longest Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.longestStreak} <span className="text-sm font-normal text-slate-500">days</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Used / Top Mood */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center text-center">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Favorites</h3>

            <div className="flex justify-around items-center">
              <div>
                <div className="text-sm text-slate-500 mb-1">Top Template</div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{topTemplate?.icon || '📄'}</span>
                  <span className="font-semibold">{topTemplate?.name || 'None'}</span>
                </div>
              </div>

              <div className="w-px h-16 bg-slate-200 dark:bg-slate-700"></div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Top Mood</div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{stats.topMood || '❓'}</span>
                  <span className="font-semibold">{stats.topMood ? 'Most frequent' : 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Hash className="w-4 h-4" /> Top Tags
          </h3>
          {stats.topTags.length > 0 ? (
            <div className="space-y-3">
              {stats.topTags.map(([tag, count], i) => (
                <div key={tag} className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm w-4">{i + 1}.</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-full h-8 overflow-hidden relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-violet-200 dark:bg-violet-900/50"
                      style={{ width: `${(count / stats.topTags[0][1]) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3 text-sm font-medium">
                      {tag}
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No tags used yet.</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Entries by Day of Week */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">Entries by Day</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {stats.dayCounts.map((count, i) => {
              const heightPct = Math.max((count / stats.maxDayCount) * 100, 4); // min 4% height for visibility
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-violet-500 hover:bg-violet-600 transition-colors rounded-t-sm"
                    style={{ height: `${heightPct}%` }}
                    title={`${count} entries`}
                  />
                  <span className="text-xs text-slate-500">{stats.daysOfWeek[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">Last 6 Months</h3>
          <div className="space-y-3">
            {stats.monthCounts.map((month, i) => {
              const widthPct = Math.max((month.count / stats.maxMonthCount) * 100, 2);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-8">{month.label}</span>
                  <div className="flex-1 flex items-center">
                    <div
                      className="h-6 bg-emerald-500 rounded-r-sm transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                    <span className="text-xs font-medium ml-2">{month.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
