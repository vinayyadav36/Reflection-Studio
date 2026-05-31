import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { db } from '../db';

export function JournalingInterface() {
  const { templateId, entryId } = useParams();
  const navigate = useNavigate();
  const tId = Number(templateId);

  const template = useLiveQuery(() => db.templates.get(tId), [tId]);
  const promptSet = useLiveQuery(
    () => template ? db.promptSets.get(template.promptSetId) : undefined,
    [template]
  );
  const availableTagsMoods = useLiveQuery(() => db.tagsMoods.toArray()) || [];

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Summary Screen State
  const [title, setTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prompts = promptSet?.prompts || [];
  const currentPrompt = prompts[currentPromptIndex];

  useEffect(() => {
    async function loadData() {
      if (entryId) {
        const entry = await db.journalEntries.get(Number(entryId));
        if (entry) {
          const loadedResponses: Record<string, string> = {};
          entry.responses.forEach(r => {
            loadedResponses[r.promptId] = r.response;
          });
          setResponses(loadedResponses);
          setDraftId(entry.id!);
          setTitle(entry.title || '');
          setSelectedMood(entry.mood || '');
          setSelectedTags(entry.tags || []);
        }
      } else if (template) {
        const drafts = await db.journalEntries
          .where('status').equals('draft')
          .filter(e => e.templateId === template.id)
          .toArray();

        if (drafts.length > 0) {
          const draft = drafts[0];
          if (window.confirm(`You have an unsaved draft for "${template.name}". Would you like to restore it?`)) {
            const loadedResponses: Record<string, string> = {};
            draft.responses.forEach(r => {
              loadedResponses[r.promptId] = r.response;
            });
            setResponses(loadedResponses);
            setDraftId(draft.id!);
            setTitle(draft.title || '');
            setSelectedMood(draft.mood || '');
            setSelectedTags(draft.tags || []);
          } else {
            await db.journalEntries.delete(draft.id!);
          }
        }
      }
    }
    loadData();
  }, [template, entryId]);

  const saveDraft = async (currentResponses: Record<string, string>, overrideStatus?: 'draft' | 'complete') => {
    if (!template || !promptSet) return;
    setSaveStatus('saving');

    const responseArray = promptSet.prompts.map(p => ({
      promptId: p.id,
      promptText: p.text,
      response: currentResponses[p.id] || ''
    }));

    const wordCount = Object.values(currentResponses).reduce((acc, text) => {
      return acc + (text.trim() ? text.trim().split(/\s+/).length : 0);
    }, 0);

    const now = new Date().toISOString();

    if (draftId) {
      await db.journalEntries.update(draftId, {
        title,
        responses: responseArray,
        mood: selectedMood,
        tags: selectedTags,
        wordCount,
        status: overrideStatus || 'draft',
        updatedAt: now
      });
    } else {
      const newId = await db.journalEntries.add({
        templateId: template.id!,
        date: now,
        title,
        responses: responseArray,
        tags: selectedTags,
        mood: selectedMood,
        wordCount,
        status: overrideStatus || 'draft',
        createdAt: now,
        updatedAt: now
      });
      setDraftId(newId as number);
    }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleResponseChange = (text: string) => {
    if (!currentPrompt) return;

    const newResponses = {
      ...responses,
      [currentPrompt.id]: text
    };
    setResponses(newResponses);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(newResponses);
    }, 800);
  };

  const handleSaveFinal = async () => {
    await saveDraft(responses, 'complete');
    setIsCompleted(true);
  };

  const handleDiscard = async () => {
    if (window.confirm('Are you sure you want to discard this draft? All progress will be lost.')) {
      if (draftId && !entryId) {
        await db.journalEntries.delete(draftId);
      }
      navigate('/templates');
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const currentText = currentPrompt ? (responses[currentPrompt.id] || '') : '';
  const currentWordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  const totalWordCount = Object.values(responses).reduce((acc, text) => {
    return acc + (text.trim() ? text.trim().split(/\s+/).length : 0);
  }, 0);

  if (!template || !promptSet) {
    return <div className="p-8 text-center">Loading template...</div>;
  }

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entry Saved!</h2>
        <p className="text-slate-600 dark:text-slate-400 italic">
          "Taking time to reflect is taking time to grow."
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => navigate(`/entry/${draftId}`)}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
          >
            View Entry
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
          >
            Journal Again
          </button>
        </div>
      </div>
    );
  }

  // Summary Screen
  if (currentPromptIndex >= prompts.length) {
    const moods = availableTagsMoods.filter(t => t.type === 'mood');
    const tags = availableTagsMoods.filter(t => t.type === 'tag');

    return (
      <div className="max-w-3xl mx-auto space-y-8 py-4 md:py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Save</h2>
          <button
            onClick={() => setCurrentPromptIndex(prompts.length - 1)}
            className="text-violet-600 hover:text-violet-700 font-medium text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to editing
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">

          {/* Optional Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Entry Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`My ${template.name} Reflection`}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Mood Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`px-4 py-2 rounded-xl text-2xl transition-all ${
                    selectedMood === mood.emoji
                      ? 'bg-violet-100 dark:bg-violet-900/40 ring-2 ring-violet-500 scale-110'
                      : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 grayscale hover:grayscale-0'
                  }`}
                  title={mood.name}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-violet-300'
                    }`}
                  >
                    {tag.emoji} {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Responses */}
          <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Your Responses</h3>
            {prompts.map((p, idx) => {
              const text = responses[p.id];
              if (!text?.trim()) return null;

              return (
                <div key={p.id} className="space-y-2 relative group">
                  <div className="flex justify-between items-start gap-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{p.text}</p>
                    <button
                      onClick={() => setCurrentPromptIndex(idx)}
                      className="text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{text}</p>
                </div>
              );
            })}
          </div>

        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSaveFinal}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md"
          >
            Save Entry
          </button>
        </div>
      </div>
    );
  }

  // Main Prompt Screen
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 md:py-8">
      {entryId && (
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-3 rounded-lg text-sm text-center">
          Editing existing entry
        </div>
      )}

      {/* Header & Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Prompt {currentPromptIndex + 1} of {prompts.length}</span>
            <span className="text-lg font-bold text-violet-600 dark:text-violet-400">{template.name}</span>
          </div>
          <div className="text-sm text-slate-400 flex items-center gap-1 h-6">
            {saveStatus === 'saving' && <span className="animate-pulse">Saving...</span>}
            {saveStatus === 'saved' && <><Save className="w-3 h-3" /> Saved</>}
          </div>
        </div>
        <div className="flex gap-1 h-2">
          {prompts.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-colors ${
                idx <= currentPromptIndex ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Prompt Area */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 relative">
        <button
          onClick={handleDiscard}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"
          title="Discard draft"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="pr-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {currentPrompt?.text}
          </h2>
          {currentPrompt?.hint && (
            <p className="text-slate-500 dark:text-slate-400 italic mt-2">
              {currentPrompt.hint}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            autoFocus
            value={currentText}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder={currentPrompt?.hint || "Write your thoughts here..."}
            className="w-full min-h-[200px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y text-lg text-slate-900 dark:text-slate-100"
          />
          <div className="flex justify-between text-sm text-slate-400">
            <span>{currentWordCount} words</span>
            <span>{totalWordCount} total words</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentPromptIndex(prev => prev - 1)}
          disabled={currentPromptIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPromptIndex === 0
              ? 'text-slate-400 cursor-not-allowed opacity-50'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <button
          onClick={() => setCurrentPromptIndex(prev => prev + 1)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          {currentPromptIndex === prompts.length - 1 ? 'Review Entry' : 'Next Prompt'}
          {currentPromptIndex !== prompts.length - 1 && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
