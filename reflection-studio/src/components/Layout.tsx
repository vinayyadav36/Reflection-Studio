import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { InstallPrompt } from './pwa/InstallPrompt';
import { UpdateBanner } from './pwa/UpdateBanner';
import { calculateStreak } from '../utils/stats';

export function Layout() {
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const totalEntries = useLiveQuery(
    () => db.journalEntries.where('status').equals('complete').count()
  ) || 0;

  const entries = useLiveQuery(
    () => db.journalEntries.where('status').equals('complete').sortBy('date')
  ) || [];

  const { currentStreak } = calculateStreak(entries as any);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/templates', icon: BookOpen, label: 'Templates' },
    { path: '/stats', icon: BarChart2, label: 'Stats' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col pb-16 md:pb-0">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-violet-600 dark:text-violet-400">
            Reflection Studio
          </Link>

          <div className="flex items-center gap-4">
            {/* Offline Indicator */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
            </div>

            {/* Streak Flame */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full text-sm font-medium">
                🔥 {currentStreak}
              </div>
            )}

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors relative ${
                    location.pathname === item.path
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.path === '/' && totalEntries > 0 && (
                    <span className="absolute -top-2 -right-3 bg-violet-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                      {totalEntries}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm py-1.5 px-4 text-center">
            You are offline. All data is stored locally and fully available.
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                location.pathname === item.path
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.path === '/' && totalEntries > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-violet-600 text-white text-[9px] font-bold px-1 rounded-full">
                    {totalEntries}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <InstallPrompt />
      <UpdateBanner />
    </div>
  );
}
