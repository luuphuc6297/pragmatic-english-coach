import React from 'react';
import { MessageSquare, BookOpen, Languages, BrainCircuit, PanelLeft } from 'lucide-react';
import { ChatMode } from '../../types';

interface ModeSwitcherProps {
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  onToggleSidebar?: () => void;
}

const MODE_BUTTONS = [
  {
    mode: 'roleplay' as ChatMode,
    icon: MessageSquare,
    label: 'Roleplay',
    activeColor: 'text-brand-600',
  },
  {
    mode: 'story' as ChatMode,
    icon: BookOpen,
    label: 'Story Mode',
    activeColor: 'text-purple-600',
  },
  {
    mode: 'translator' as ChatMode,
    icon: Languages,
    label: 'Translator',
    activeColor: 'text-indigo-600',
  },
  {
    mode: 'quiz' as ChatMode,
    icon: BrainCircuit,
    label: 'Quiz',
    activeColor: 'text-amber-600',
  },
] as const;

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ chatMode, setChatMode, onToggleSidebar }) => {
  return (
    <div className="flex-none px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex justify-start md:justify-center items-center shadow-sm z-10 overflow-x-auto no-scrollbar touch-pan-x">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors shrink-0 mr-2"
        >
          <PanelLeft size={18} />
        </button>
      )}
      
      <div className="flex items-center p-1 bg-slate-100/80 rounded-full border border-slate-200/60 shrink-0">
        {MODE_BUTTONS.map(({ mode, icon: Icon, label, activeColor }) => {
          const isActive = chatMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? `bg-white shadow-sm ring-1 ring-slate-200/50 ${activeColor}` 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Icon size={14} className={isActive ? activeColor : 'text-slate-400'} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSwitcher;
