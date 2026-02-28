import React from 'react';
import {
  MessageSquareQuote,
  BookOpen,
  Languages,
  BrainCircuit,
  ChevronRight,
  Clock,
  User,
  RotateCcw,
  Network,
} from 'lucide-react';
import {ChatMode, UserPreferences} from '../types';
import UserProfile from './UserProfile';

const MODE_CARDS = [
  {
    mode: 'roleplay' as ChatMode,
    icon: MessageSquareQuote,
    title: 'Scenario Coach',
    description:
      'Practice specific situations (e.g., "Ordering Coffee") with AI grading your grammar and naturalness.',
    borderHover: 'hover:border-brand-500',
    iconBg: 'bg-brand-500/20 text-brand-400',
    iconHover: 'group-hover:bg-brand-500',
    ctaColor: 'text-brand-400',
  },
  {
    mode: 'story' as ChatMode,
    icon: BookOpen,
    title: 'Story Mode',
    description:
      'Immerse yourself in a continuous roleplay conversation. The AI adapts to your replies dynamically.',
    borderHover: 'hover:border-purple-500',
    iconBg: 'bg-purple-500/20 text-purple-400',
    iconHover: 'group-hover:bg-purple-500',
    ctaColor: 'text-purple-400',
  },
  {
    mode: 'translator' as ChatMode,
    icon: Languages,
    title: 'Tone Translator',
    description:
      'Input any sentence and see it transformed into Formal, Friendly, Informal, and Native tones.',
    borderHover: 'hover:border-indigo-500',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    iconHover: 'group-hover:bg-indigo-500',
    ctaColor: 'text-indigo-400',
  },
  {
    mode: 'quiz' as ChatMode,
    icon: BrainCircuit,
    title: 'Vocab Quiz',
    description: "Test your memory on the vocabulary and grammar items you've saved.",
    borderHover: 'hover:border-amber-500',
    iconBg: 'bg-amber-500/20 text-amber-400',
    iconHover: 'group-hover:bg-amber-500',
    ctaColor: 'text-amber-400',
  },
  {
    mode: 'vocab_hub' as ChatMode,
    icon: Network,
    title: 'Vocab Hub',
    description: 'Master vocabulary through morphological breakdown, contextual embedding, and interactive mind maps.',
    borderHover: 'hover:border-emerald-500',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    iconHover: 'group-hover:bg-emerald-500',
    ctaColor: 'text-emerald-400',
  },
];

interface ModeSelectionProps {
  userPreferences: UserPreferences | null;
  onStartMode: (mode: ChatMode) => void;
  onShowHistory: () => void;
  onResetSettings: () => void;
  showProfile: boolean;
  onToggleProfile: (show: boolean) => void;
  onSaveProfile: (prefs: UserPreferences) => void;
  profileStats: {lessonsCompleted: number; averageScore: string; totalMessages: number};
}

const ModeSelection: React.FC<ModeSelectionProps> = ({
  userPreferences,
  onStartMode,
  onShowHistory,
  onResetSettings,
  showProfile,
  onToggleProfile,
  onSaveProfile,
  profileStats,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 p-6 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />

      <div className="max-w-5xl w-full z-10 text-center px-4">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Welcome back, {userPreferences?.name}</h1>
          <p className="text-slate-400 text-lg">Choose a mode to continue your journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {MODE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.mode}
                onClick={() => onStartMode(card.mode)}
                className={`group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 ${card.borderHover} rounded-2xl p-5 md:p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-56 md:h-64`}
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 md:mb-4 ${card.iconHover} group-hover:text-white transition-colors`}
                >
                  <Icon size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-xs md:text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                  {card.description}
                </p>
                <div
                  className={`flex items-center ${card.ctaColor} text-xs md:text-sm font-bold uppercase tracking-wider mt-auto`}
                >
                  Start <ChevronRight size={16} className="ml-1" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <button
            onClick={onShowHistory}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 transition-all"
          >
            <Clock size={16} /> History
          </button>
          <button
            onClick={() => onToggleProfile(true)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 transition-all"
          >
            <User size={16} /> Edit Profile
          </button>
          <button
            onClick={onResetSettings}
            className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-rose-500 transition-all"
          >
            <RotateCcw size={16} /> Reset All Data
          </button>
        </div>
      </div>

      {showProfile && userPreferences && (
        <UserProfile
          preferences={userPreferences}
          stats={profileStats}
          onClose={() => onToggleProfile(false)}
          onSave={onSaveProfile}
          onLogout={onResetSettings}
        />
      )}
    </div>
  );
};

export default ModeSelection;
