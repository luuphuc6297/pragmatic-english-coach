import React, { useState } from 'react';
import {Clock, PanelLeftClose, RefreshCw, Check} from 'lucide-react';
import {ConversationHistory} from '../../types';
import {styles, MODE_CARDS} from '../../configs/themeConfig';

const getModeBadgeClass = (mode: string) => {
  const card = MODE_CARDS.find(c => c.mode === mode);
  return card ? card.iconBg : 'bg-slate-500/20 text-slate-400';
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ConversationHistory[];
  activeConversationId: string | null;
  onSelectConversation: (item: ConversationHistory) => void;
  onSyncHistory?: () => Promise<void>;
  onStartNew?: () => void;
  onShowAllHistory?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  history,
  activeConversationId,
  onSelectConversation,
  onSyncHistory,
  onStartNew,
  onShowAllHistory,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSync = async () => {
    if (!onSyncHistory) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    await onSyncHistory();
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2000);
  };

  return (
    <div
      className={`${styles.sidebar.container} ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}
    >
      <div className={styles.sidebar.header}>
        <h2 className="text-white font-bold flex items-center gap-2 whitespace-nowrap">
          <Clock size={18} className="text-brand-400" /> History
        </h2>
        <div className="flex items-center gap-1">
          {onSyncHistory && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Sync History to Cloud"
              className={`${styles.button.ghostDark} disabled:opacity-50`}
            >
              {syncSuccess ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <RefreshCw size={16} className={isSyncing ? 'animate-spin text-brand-400' : ''} />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className={styles.button.ghostDark}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
      </div>
      
      {onStartNew && (
        <div className="p-3 border-b border-white/5 shrink-0 flex flex-col gap-2">
          <button
            onClick={onStartNew}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-navy rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="text-lg leading-none">+</span> New Conversation
          </button>
          {onShowAllHistory && (
            <button
              onClick={onShowAllHistory}
              className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/10"
            >
              View All History
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm whitespace-nowrap">
            No history yet
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectConversation(item)}
              className={`${styles.sidebar.historyItem} ${activeConversationId === item.id ? styles.sidebar.historyItemActive : styles.sidebar.historyItemInactive}`}
            >
              <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getModeBadgeClass(item.mode)}`}
                >
                  {item.mode}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-200 line-clamp-1 w-full">
                {item.title}
              </h3>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
