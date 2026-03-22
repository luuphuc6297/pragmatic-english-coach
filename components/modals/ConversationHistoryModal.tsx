import React, { useState } from 'react';
import { ConversationHistory, ChatMode } from '../../types';
import { X, Clock, MessageSquare, Trash2, Plus, ListFilter } from 'lucide-react';
import { styles, MODE_CARDS } from '../../configs/themeConfig';

const getModeBadgeClass = (mode: string) => {
  const card = MODE_CARDS.find(c => c.mode === mode);
  return card ? card.iconBg : 'bg-slate-100 text-slate-700';
};

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
    <div className={styles.modal.overlay}>
      <div className={styles.modal.containerLg}>

        {/* Header */}
        <div className={styles.modal.header}>
          <div className="flex items-center gap-4">
            <h2 className={styles.modal.headerTitle}>
              <Clock className="text-primary" size={24} />
              {activeFilter ? `${getModeTitle(activeFilter)} History` : 'All Conversation History'}
            </h2>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(undefined)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full text-xs font-medium transition-colors border border-white/10"
              >
                <ListFilter size={14} />
                View All Modes
              </button>
            )}
          </div>
          <button onClick={onClose} className={styles.button.ghost}>
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className={`${styles.modal.content} flex flex-col`}>
          {activeFilter && onStartNew && (
            <button
              onClick={() => onStartNew(activeFilter)}
              className="w-full mb-6 py-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-colors"
            >
              <Plus size={20} />
              Start New {getModeTitle(activeFilter)}
            </button>
          )}

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <MessageSquare className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-lg font-bold text-white mb-2">No History Yet</h3>
              <p className="text-slate-400">Your past conversations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.card.darkInteractive} p-4 md:p-5 flex items-start justify-between group cursor-pointer`}
                  onClick={() => onSelect(item)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${styles.badge.status} ${getModeBadgeClass(item.mode)}`}>
                        {item.mode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">
                      {item.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
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
