import React from 'react';
import { MessageSquare, BookOpen, Languages, BrainCircuit, PanelLeft } from 'lucide-react';
import { ChatMode } from '../../types';
import {styles} from '../../configs/themeConfig';

interface ModeSwitcherProps {
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  onToggleSidebar?: () => void;
}

const MODE_BUTTONS = [
  {
    mode: 'roleplay' as ChatMode,
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Trophy.png',
    label: 'Roleplay',
    activeColor: 'text-brand-400',
  },
  {
    mode: 'story' as ChatMode,
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/National%20Park.png',
    label: 'Story Mode',
    activeColor: 'text-purple-400',
  },
  {
    mode: 'translator' as ChatMode,
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png',
    label: 'Translator',
    activeColor: 'text-indigo-400',
  },
  {
    mode: 'quiz' as ChatMode,
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/High%20Voltage.png',
    label: 'Quiz',
    activeColor: 'text-amber-400',
  },
] as const;

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ chatMode, setChatMode, onToggleSidebar }) => {
  return (
    <div className="flex-none px-4 py-3 bg-navy-muted/95 backdrop-blur-sm border-b border-white/5 flex justify-start md:justify-center items-center shadow-sm z-10 overflow-x-auto no-scrollbar touch-pan-x">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:bg-white/5 rounded-full transition-colors shrink-0 mr-2"
        >
          <PanelLeft size={18} />
        </button>
      )}
      
      <div className="flex items-center p-1 bg-navy rounded-full border border-white/10 shrink-0">
        {MODE_BUTTONS.map(({ mode, icon: Icon, label, activeColor }) => {
          const isActive = chatMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? `${styles.button.pillActive} ${activeColor}`
                  : styles.button.pillInactive
              }`}
            >
              {typeof Icon === 'string' ? (
                Icon.startsWith('http') ? (
                  <img src={Icon} alt={label} className="w-4 h-4 object-contain group-hover:-translate-y-0.5 transition-transform duration-300" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-sm">{Icon}</span>
                )
              ) : (
                <Icon size={14} className={isActive ? activeColor : 'text-slate-400'} />
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSwitcher;
