import React from 'react';
import { Avatar3D } from '../ui/Avatar3D';
import {
  ChevronRight,
  Clock,
  User,
  RotateCcw,
  Bell,
  Settings,
  History,
  UserPen,
  Trash2,
  LogOut
} from 'lucide-react';
import {ChatMode, UserPreferences} from '../../types';
import { MODE_CARDS, styles } from '../../configs/themeConfig';
import UserProfile from '../modals/UserProfile';


interface ModeSelectionProps {
  userPreferences: UserPreferences | null;
  onStartMode: (mode: ChatMode) => void;
  onShowHistory: () => void;
  onResetSettings: () => void;
  showProfile: boolean;
  onToggleProfile: (show: boolean) => void;
  onSaveProfile: (prefs: UserPreferences) => void;
  profileStats: {lessonsCompleted: number; averageScore: string; totalMessages: number};
  onSignOut: () => void;
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
  onSignOut,
}) => {
  return (
    <div className={`${styles.layout.pageDark} w-full !p-0 !justify-start h-screen overflow-hidden`}>
      <div className={styles.layout.gradientBg} />

      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 z-50 shrink-0 relative bg-navy/80 backdrop-blur-md border-b border-glassBorder">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-fredoka font-bold text-white flex items-center tracking-wide">
            AURA C
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Americas.png" alt="O" className="w-6 h-6 mx-[1px] inline-block -mt-0.5 drop-shadow-md animate-spin-y" />
            ACH
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
            <Bell size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
            <Settings size={18} />
          </button>
          <button onClick={() => onToggleProfile(true)} className="w-8 h-8 rounded-full bg-navy-muted border border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
            <Avatar3D 
              src={userPreferences?.avatarUrl} 
              className="w-full h-full object-cover scale-110"
              fallback={<span className="text-navy font-bold text-xs">{userPreferences?.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
            />
          </button>
        </div>
      </header>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar z-10">
        <div className="max-w-5xl w-full text-center px-6 pt-10 pb-16 mx-auto flex flex-col min-h-full justify-center">
          <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-navy-muted border-4 border-white/10 overflow-hidden flex items-center justify-center shadow-lg mb-4">
            <Avatar3D 
              src={userPreferences?.avatarUrl} 
              className="w-full h-full object-cover scale-110"
              fallback={<span className="text-navy font-bold text-3xl">{userPreferences?.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome back, {userPreferences?.name}</h1>
          <p className="text-slate-400 text-base md:text-lg">Choose a mode to continue your journey.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {MODE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.mode}
                onClick={() => onStartMode(card.mode)}
                className={`group relative ${styles.card.darkInteractive} ${card.borderHover} p-4 md:p-6 text-left flex flex-row items-center justify-start gap-4 h-full`}
              >
                <div
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl ${card.iconBg} flex items-center justify-center ${card.iconHover} group-hover:text-white transition-all transform group-hover:scale-110 shadow-lg`}
                >
                  {typeof Icon === 'string' ? (
                    Icon.startsWith('http') ? (
                      <img src={Icon} alt={card.title} className="w-10 h-10 md:w-14 md:h-14 drop-shadow-md object-contain group-hover:-translate-y-1 transition-transform duration-300" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-4xl md:text-5xl drop-shadow-md">{Icon}</span>
                    )
                  ) : (
                    <Icon size={32} className="md:w-10 md:h-10 drop-shadow-md" />
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base md:text-lg font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-400">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 w-full max-w-4xl mx-auto flex flex-col items-start gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account & Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <button
              onClick={onShowHistory}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-twelve bg-glassBg border border-glassBorder text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <History size={16} /> History
            </button>
            <button
              onClick={() => onToggleProfile(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-twelve bg-glassBg border border-glassBorder text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <UserPen size={16} /> Edit Profile
            </button>
            <button
              onClick={onResetSettings}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-twelve bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
            >
              <Trash2 size={16} /> Reset All Data
            </button>
            <button
              onClick={onSignOut}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-twelve bg-glassBg border border-glassBorder text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
        </div>
      </div>

      {showProfile && userPreferences && (
        <UserProfile
          preferences={userPreferences}
          stats={profileStats}
          onClose={() => onToggleProfile(false)}
          onSave={onSaveProfile}
          onLogout={onSignOut}
        />
      )}
    </div>
  );
};

export default ModeSelection;
