import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ArrowLeft, Save } from 'lucide-react';

export const JournalingInterface: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [responses, setResponses] = useState<Record<number, string>>({});
  const [mood, setMood] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const template = useLiveQuery(() =>
    db.templates.get(Number(templateId))
  , [templateId]);

  const promptSet = useLiveQuery(() =>
    template ? db.promptSets.get(template.promptSetId) : undefined
  , [template]);

  const availableTagsMoods = useLiveQuery(() => db.tagsMoods.toArray()) || [];
  const suggestedMoods = availableTagsMoods.filter(t => t.type === 'mood').map(t => t.value);
  const suggestedTags = availableTagsMoods.filter(t => t.type === 'tag').map(t => t.value);

  // Initialize responses once prompts load
  useEffect(() => {
    if (promptSet && Object.keys(responses).length === 0) {
      const initialResponses: Record<number, string> = {};
      promptSet.prompts.forEach((_, index) => {
        initialResponses[index] = '';
      });
      setResponses(initialResponses);
    }
  }, [promptSet]); // Intentionally omitting responses to avoid loop

  const handleResponseChange = (index: number, value: string) => {
    setResponses(prev => ({ ...prev, [index]: value }));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !selectedTags.includes(newTagInput.trim())) {
      setSelectedTags([...selectedTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (!templateId) return;

    await db.journalEntries.add({
      templateId: Number(templateId),
      date: new Date().toISOString(),
      responses,
      tags: selectedTags,
      mood: mood,
    });

    navigate('/');
  };

  if (!template || !promptSet) {
    return <div className="text-center py-10">Loading template...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/templates')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        {promptSet.prompts.map((prompt, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="block text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              {prompt}
            </label>
            <textarea
              value={responses[index] || ''}
              onChange={(e) => handleResponseChange(index, e.target.value)}
              className="w-full min-h-[120px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
              placeholder="Write your thoughts..."
            />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">How are you feeling? (Mood)</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedMoods.map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mood === m
                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-500 dark:bg-amber-900/50 dark:text-amber-200'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-200'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add a custom tag..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-sm"
        >
          <Save className="w-5 h-5" />
          Save Entry
        </button>
      </div>
    </div>
  );
};
