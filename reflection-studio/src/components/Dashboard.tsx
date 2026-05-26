import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Tag, BookOpen } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterMood, setFilterMood] = useState<string>('');

  const entries = useLiveQuery(async () => {
    let collection = db.journalEntries.orderBy('date').reverse();
    const array = await collection.toArray();

    return array.filter(entry => {
      let matchesTag = true;
      let matchesMood = true;
      if (filterTag) {
        matchesTag = entry.tags.includes(filterTag);
      }
      if (filterMood) {
        matchesMood = entry.mood === filterMood;
      }
      return matchesTag && matchesMood;
    });
  }, [filterTag, filterMood]) || [];

  const templates = useLiveQuery(() => db.templates.toArray()) || [];

  const getTemplateName = (templateId: number) => {
    return templates.find(t => t.id === templateId)?.name || 'Unknown Template';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Your Journal</h1>
        <Link
          to="/templates"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          New Entry
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center border border-gray-100 dark:border-gray-700">
        <div className="font-medium text-gray-500 dark:text-gray-400">Filters:</div>
        <input
          type="text"
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Filter by mood..."
          value={filterMood}
          onChange={(e) => setFilterMood(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {(filterTag || filterMood) && (
          <button
            onClick={() => { setFilterTag(''); setFilterMood(''); }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No entries yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start your journaling journey today.</p>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-lg transition-colors"
          >
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getTemplateName(entry.templateId)}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {Object.values(entry.responses)[0] || 'No content...'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {entry.mood && (
                  <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                    Mood: {entry.mood}
                  </span>
                )}
                {entry.tags.map(tag => (
                  <span key={tag} className="flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
