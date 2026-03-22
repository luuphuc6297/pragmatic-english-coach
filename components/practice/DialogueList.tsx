import React, { useState, useMemo } from 'react';
import { PracticeDialogue, CEFRLevel } from '../../types';
import { PREDEFINED_DIALOGUES } from '../../data/dialogues';
import { ArrowLeft, Users, ChevronRight, Search, Sparkles, Loader } from 'lucide-react';

interface DialogueListProps {
  onSelect: (context: string) => void;
  onBack: () => void;
  userLevel: CEFRLevel;
}

const DialogueList: React.FC<DialogueListProps> = ({ onSelect, onBack, userLevel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [customContext, setCustomContext] = useState('');

  const difficulties = useMemo(() => {
    const diffs = new Set(PREDEFINED_DIALOGUES.map(d => d.difficulty));
    return ['All', ...Array.from(diffs)];
  }, []);

  const filteredDialogues = useMemo(() => {
    return PREDEFINED_DIALOGUES.filter(dialogue => {
      const matchesSearch = 
        dialogue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dialogue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dialogue.topic.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === 'All' || dialogue.difficulty === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, difficultyFilter]);

  const handleGenerateCustom = () => {
    if (!customContext.trim()) return;
    onSelect(customContext);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Modes
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Users className="text-blue-500" size={32} /> Story Scenarios
          </h2>
          <p className="text-slate-500 mt-2">
            Choose a scenario or describe your own to practice conversational skills in Story Mode.
          </p>
        </div>

        {/* Custom Context Generator */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={64} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Sparkles className="text-blue-500" size={20} />
            Create Custom Scenario
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Describe a specific situation you want to practice (e.g., "Ordering coffee at a busy cafe in London" or "Negotiating a salary with a new employer").
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Describe your scenario..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customContext.trim()) {
                  handleGenerateCustom();
                }
              }}
            />
            <button
              onClick={handleGenerateCustom}
              disabled={!customContext.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Start Custom Story
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDialogues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">No dialogues found matching your criteria.</p>
            </div>
          ) : (
            filteredDialogues.map((dialogue) => (
              <button
                key={dialogue.id}
                onClick={() => onSelect(dialogue.scenario)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left flex flex-col sm:flex-row sm:items-center gap-4 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{dialogue.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                      {dialogue.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{dialogue.description}</p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      You: {dialogue.roles.user}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      AI: {dialogue.roles.ai}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogueList;
