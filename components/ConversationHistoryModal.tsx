import React, { useState } from 'react';
import { ConversationHistory, ChatMode } from '../types';
import { X, Clock, MessageSquare, Trash2, Plus, ListFilter } from 'lucide-react';

interface ConversationHistoryModalProps {
  history: ConversationHistory[];
  onClose: () => void;
  onSelect: (historyItem: ConversationHistory) => void;
  onDelete: (id: string) => void;
  modeFilter?: ChatMode;
  onStartNew?: (mode: ChatMode) => void;
}

const ConversationHistoryModal: React.FC<ConversationHistoryModalProps> = ({ history, onClose, onSelect, onDelete, modeFilter: initialModeFilter, onStartNew }) => {
  const [activeFilter, setActiveFilter] = useState<ChatMode | undefined>(initialModeFilter);
  
  const filteredHistory = activeFilter ? history.filter(h => h.mode === activeFilter) : history;

  const getModeTitle = (mode?: ChatMode) => {
    switch (mode) {
      case 'roleplay': return 'Scenario Coach';
      case 'story': return 'Story Mode';
      case 'translator': return 'Tone Translator';
      case 'quiz': return 'Vocab Quiz';
      case 'vocab_hub': return 'Vocab Hub';
      case 'dialogues': return 'Dialogues';
      case 'live': return 'Live Conversation';
      default: return 'Conversation';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-brand-500" size={24} />
              {activeFilter ? `${getModeTitle(activeFilter)} History` : 'All Conversation History'}
            </h2>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(undefined)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-medium transition-colors"
              >
                <ListFilter size={14} />
                View All Modes
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col">
          {activeFilter && onStartNew && (
            <button
              onClick={() => onStartNew(activeFilter)}
              className="w-full mb-6 py-4 border-2 border-dashed border-brand-300 rounded-2xl text-brand-600 font-bold flex items-center justify-center gap-2 hover:bg-brand-50 hover:border-brand-400 transition-colors"
            >
              <Plus size={20} />
              Start New {getModeTitle(activeFilter)}
            </button>
          )}

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No History Yet</h3>
              <p className="text-slate-500">Your past conversations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-md transition-all group flex items-start justify-between cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.mode === 'roleplay' ? 'bg-emerald-100 text-emerald-700' :
                        item.mode === 'story' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {item.mode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {item.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Conversation"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistoryModal;
