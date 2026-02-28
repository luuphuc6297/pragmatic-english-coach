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
    activeClasses:
      'bg-brand-50 text-brand-600 border border-brand-200 ring-2 ring-brand-100 ring-offset-1',
  },
  {
    mode: 'story' as ChatMode,
    icon: BookOpen,
    label: 'Story Mode',
    activeClasses:
      'bg-purple-50 text-purple-600 border border-purple-200 ring-2 ring-purple-100 ring-offset-1',
  },
  {
    mode: 'translator' as ChatMode,
    icon: Languages,
    label: 'Translator',
    activeClasses:
      'bg-indigo-50 text-indigo-600 border border-indigo-200 ring-2 ring-indigo-100 ring-offset-1',
  },
  {
    mode: 'quiz' as ChatMode,
    icon: BrainCircuit,
    label: 'Quiz',
    activeClasses:
      'bg-amber-50 text-amber-600 border border-amber-200 ring-2 ring-amber-100 ring-offset-1',
  },
] as const;

const INACTIVE_CLASSES =
  'text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-300';

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ chatMode, setChatMode, onToggleSidebar }) => {
  return (
    <div className="flex-none px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex justify-start md:justify-center gap-2 shadow-sm z-10 overflow-x-auto no-scrollbar touch-pan-x items-center">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors shrink-0"
        >
          <PanelLeft size={18} />
        </button>
      )}
      {MODE_BUTTONS.map(({ mode, icon: Icon, label, activeClasses }) => (
        <button
          key={mode}
          onClick={() => setChatMode(mode)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${chatMode === mode ? activeClasses : INACTIVE_CLASSES
            }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ModeSwitcher;
