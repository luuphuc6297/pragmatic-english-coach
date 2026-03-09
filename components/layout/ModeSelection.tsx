import React from 'react';
import {
  ChevronRight,
  Clock,
  User,
  RotateCcw,
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
    <div className={`${styles.layout.pageDark} h-screen`}>
      <div className={styles.layout.gradientBg} />

      <div className="max-w-5xl w-full z-10 text-center px-4">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden mb-4 shadow-xl flex items-center justify-center">
            <img 
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userPreferences?.name || 'User')}&backgroundColor=0ea5e9,10b981,6366f1,f43f5e,f59e0b,8b5cf6`} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
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
                className={`group relative ${styles.card.darkInteractive} ${card.borderHover} p-5 md:p-6 text-left flex flex-col h-56 md:h-64`}
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
            className={`${styles.button.pill} text-slate-400 hover:text-white`}
          >
            <Clock size={16} /> History
          </button>
          <button
            onClick={() => onToggleProfile(true)}
            className={`${styles.button.pill} text-slate-400 hover:text-white`}
          >
            <User size={16} /> Edit Profile
          </button>
          <button
            onClick={onResetSettings}
            className={`${styles.button.pill} text-rose-400 hover:text-rose-300 hover:border-rose-500`}
          >
            <RotateCcw size={16} /> Reset All Data
          </button>
          <button
            onClick={onSignOut}
            className={`${styles.button.pill} text-slate-400 hover:text-white`}
          >
            Sign Out
          </button>
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
