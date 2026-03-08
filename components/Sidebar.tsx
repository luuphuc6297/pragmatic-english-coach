import React, { useState } from 'react';
import {Clock, PanelLeftClose, RefreshCw, Check} from 'lucide-react';
import {ConversationHistory} from '../types';

const MODE_BADGE_CLASSES: Record<string, string> = {
  roleplay: 'bg-emerald-500/20 text-emerald-400',
  story: 'bg-purple-500/20 text-purple-400',
};

const DEFAULT_BADGE_CLASS = 'bg-blue-500/20 text-blue-400';

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
      className={`flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 overflow-hidden absolute md:relative z-50 h-full ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <h2 className="text-white font-bold flex items-center gap-2 whitespace-nowrap">
          <Clock size={18} className="text-brand-400" /> History
        </h2>
        <div className="flex items-center gap-1">
          {onSyncHistory && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Sync History to Cloud"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
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
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
      </div>
      
      {onStartNew && (
        <div className="p-3 border-b border-slate-800 shrink-0 flex flex-col gap-2">
          <button
            onClick={onStartNew}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="text-lg leading-none">+</span> New Conversation
          </button>
          {onShowAllHistory && (
            <button
              onClick={onShowAllHistory}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
              className={`w-full text-left p-3 rounded-xl transition-colors flex flex-col ${activeConversationId === item.id ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50 border border-transparent'}`}
            >
              <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${MODE_BADGE_CLASSES[item.mode] ?? DEFAULT_BADGE_CLASS}`}
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
