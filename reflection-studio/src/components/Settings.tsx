import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Moon, Sun, Download, Trash2, Monitor } from 'lucide-react';

export function Settings() {
  const users = useLiveQuery(() => db.users.toArray());
  const templates = useLiveQuery(() => db.templates.toArray()) || [];

  const [displayName, setDisplayName] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [defaultTemplate, setDefaultTemplate] = useState<number | ''>('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (users && users.length > 0) {
      const user = users[0];
      setDisplayName(user.displayName || '');
      setReminderTime(user.reminderTime || '');
      setDefaultTemplate(user.defaultTemplate || '');
      setTheme(user.theme || 'system');
    }
  }, [users]);

  const handleSave = async () => {
    setIsSaving(true);
    const userData = {
      displayName,
      reminderTime: reminderTime || null,
      defaultTemplate: defaultTemplate === '' ? null : Number(defaultTemplate),
      theme
    };

    if (users && users.length > 0) {
      await db.users.update(users[0].id!, userData);
    } else {
      await db.users.add(userData as any);
    }

    // Apply theme
    localStorage.setItem('theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => setIsSaving(false), 500);
  };

  const handleExportAll = async () => {
    const allEntries = await db.journalEntries.toArray();
    const dataStr = JSON.stringify(allEntries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-studio-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = async () => {
    const count = await db.journalEntries.count();
    if (count === 0) {
      alert("No entries to delete.");
      return;
    }

    if (window.confirm(`Are you absolutely sure you want to delete ALL ${count} journal entries? This action CANNOT be undone.`)) {
      if (window.confirm('Final confirmation: Delete everything?')) {
        await db.journalEntries.clear();
        alert('All entries have been deleted.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your preferences and data.</p>
      </div>

      <div className="space-y-6 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">

        {/* Profile Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
            Profile Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full max-w-md p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-xs text-slate-500 mt-1">Note: Notifications are disabled in this version.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Template
              </label>
              <select
                value={defaultTemplate}
                onChange={e => setDefaultTemplate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full max-w-md p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">None</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
            Appearance
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Theme
            </label>
            <div className="flex gap-3">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                    theme === t.id
                      ? 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-6 bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-2xl border border-red-100 dark:border-red-900/30">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 border-b border-red-200 dark:border-red-900/50 pb-2">
          Data Management
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Export Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Download all your journal entries as a JSON file.</p>
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-red-200 dark:border-red-900/50">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Delete All Data</h3>
              <p className="text-sm text-red-600 dark:text-red-400">Permanently remove all journal entries. This cannot be undone.</p>
            </div>
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
