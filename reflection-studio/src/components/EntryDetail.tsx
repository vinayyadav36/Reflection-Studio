import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Edit2, Trash2, Download } from 'lucide-react';
import { db } from '../db';

export function EntryDetail() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const id = Number(entryId);

  const entry = useLiveQuery(() => db.journalEntries.get(id), [id]);
  const template = useLiveQuery(
    () => entry ? db.templates.get(entry.templateId) : undefined,
    [entry]
  );

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      await db.journalEntries.delete(id);
      navigate('/');
    }
  };

  const handleExport = () => {
    if (!entry || !template) return;

    let content = `${entry.title || template.name}\n`;
    content += `Date: ${new Date(entry.date).toLocaleString()}\n`;
    if (entry.mood) content += `Mood: ${entry.mood}\n`;
    if (entry.tags && entry.tags.length > 0) content += `Tags: ${entry.tags.join(', ')}\n`;
    content += `\n`;

    entry.responses.forEach(r => {
      content += `Q: ${r.promptText}\n`;
      content += `A: ${r.response}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-${new Date(entry.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (entry === undefined || template === undefined) {
    return <div className="p-8 text-center">Loading entry...</div>;
  }

  if (entry === null) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Entry not found</h2>
        <Link to="/" className="text-violet-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const dateObj = new Date(entry.date);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Export to TXT"
          >
            <Download className="w-5 h-5" />
          </button>
          <Link
            to={`/journal/${entry.templateId}/${entry.id}`}
            className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
            title="Edit Entry"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete Entry"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <article className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">

        {/* Header Section */}
        <header className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium mb-2">
                <span className="text-xl">{template.icon}</span>
                {template.name}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {entry.title || `Reflection for ${formattedDate}`}
              </h1>
            </div>
            {entry.mood && (
              <div className="text-4xl" title="Mood">
                {entry.mood}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <div>{formattedDate} at {formattedTime}</div>
            <div>{entry.wordCount} words</div>
          </div>

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {entry.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Responses Section */}
        <div className="space-y-8">
          {entry.responses.map((r, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {r.promptText}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                {r.response || <span className="italic opacity-50">No response provided.</span>}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
