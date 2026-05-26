import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-6 h-6" />
          <span>Reflection Studio</span>
        </Link>
      </header>
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-800 text-center p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        &copy; {new Date().getFullYear()} Reflection Studio. Built for your mental wellness.
      </footer>
    </div>
  );
};
