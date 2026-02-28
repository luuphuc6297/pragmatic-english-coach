import React from 'react';
import {Clock, PanelLeftClose} from 'lucide-react';
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
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  history,
  activeConversationId,
  onSelectConversation,
}) => {
  return (
    <div
      className={`flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 overflow-hidden absolute md:relative z-50 h-full ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <h2 className="text-white font-bold flex items-center gap-2 whitespace-nowrap">
          <Clock size={18} className="text-brand-400" /> History
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>
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
