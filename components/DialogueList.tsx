import React from 'react';
import { PracticeDialogue } from '../types';
import { PREDEFINED_DIALOGUES } from '../data/dialogues';
import { ArrowLeft, Users, ChevronRight } from 'lucide-react';

interface DialogueListProps {
  onSelect: (dialogue: PracticeDialogue) => void;
  onBack: () => void;
}

const DialogueList: React.FC<DialogueListProps> = ({ onSelect, onBack }) => {
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
            <Users className="text-blue-500" size={32} /> Practice Dialogues
          </h2>
          <p className="text-slate-500 mt-2">
            Choose a scenario to practice your conversational skills. You will roleplay with the AI.
          </p>
        </div>

        <div className="grid gap-4">
          {PREDEFINED_DIALOGUES.map((dialogue) => (
            <button
              key={dialogue.id}
              onClick={() => onSelect(dialogue)}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default DialogueList;
