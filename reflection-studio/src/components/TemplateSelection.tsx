import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export const TemplateSelection: React.FC = () => {
  const templates = useLiveQuery(() => db.templates.toArray()) || [];
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Choose a Template</h1>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Select a structured template for your journal entry today.
      </p>

      <div className="grid gap-4 mt-6">
        {templates.map((template) => (
          <Link
            key={template.id}
            to={`/journal/${template.id}`}
            className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {template.description}
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </Link>
        ))}
      </div>
    </div>
  );
};
