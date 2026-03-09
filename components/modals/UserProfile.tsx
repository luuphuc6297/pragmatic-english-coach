import React, {useState} from 'react';
import {UserPreferences, CEFRLevel} from '../../types';
import {ONBOARDING_LEVELS, ONBOARDING_TOPICS} from '../../configs/constants';
import {X, Save, User, Award, BookOpen, Activity, LogOut, AlertTriangle} from 'lucide-react';
import {styles} from '../../configs/themeConfig';

interface UserProfileProps {
  preferences: UserPreferences;
  stats: {
    lessonsCompleted: number;
    averageScore: string;
    totalMessages: number;
  };
  onClose: () => void;
  onSave: (newPrefs: UserPreferences) => void;
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  preferences,
  stats,
  onClose,
  onSave,
  onLogout,
}) => {
  const [name, setName] = useState(preferences.name);
  const [level, setLevel] = useState<CEFRLevel>(preferences.level);
  const [topics, setTopics] = useState<string[]>(preferences.topics);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleTopicToggle = (topicId: string) => {
    setTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId],
    );
  };

  const handleSave = () => {
    if (name.trim() && topics.length > 0) {
      onSave({
        name,
        level,
        topics,
      });
      onClose();
    }
  };

  if (showLogoutConfirm) {
    return (
      <div className={styles.modal.overlay}>
        <div className={`${styles.modal.container} max-w-sm rounded-3xl p-6 text-center`}>
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sign Out?</h2>
          <p className="text-slate-500 mb-8">
            Are you sure you want to sign out? Your progress is saved to your account.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-5 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onLogout}
              className={`${styles.button.danger} flex-1`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modal.overlay}>
      <div className={styles.modal.containerLg}>
        {/* Header */}
        <div className={styles.modal.header}>
          <h2 className={styles.modal.headerTitle}>
            <User className="text-brand-500" size={24} />
            Learner Profile
          </h2>
          <button
            onClick={onClose}
            className={styles.button.ghost}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className={styles.modal.content}>
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-4">
              <img 
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=0ea5e9,10b981,6366f1,f43f5e,f59e0b,8b5cf6`} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{name || 'User'}</h3>
            <p className="text-slate-500 text-sm">{preferences.level} Learner</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`${styles.card.stat} bg-brand-50 border-brand-100`}>
              <Award className="text-brand-500 mb-2" size={24} />
              <span className="text-2xl font-black text-brand-700">{stats.averageScore}</span>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wide">
                Avg Score
              </span>
            </div>
            <div className={`${styles.card.stat} bg-purple-50 border-purple-100`}>
              <BookOpen className="text-purple-500 mb-2" size={24} />
              <span className="text-2xl font-black text-purple-700">{stats.lessonsCompleted}</span>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                Lessons Done
              </span>
            </div>
            <div className={`${styles.card.stat} bg-emerald-50 border-emerald-100`}>
              <Activity className="text-emerald-500 mb-2" size={24} />
              <span className="text-2xl font-black text-emerald-700">{level}</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Current Level
              </span>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* Edit Form */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className={`block ${styles.text.sectionLabel} mb-2`}>
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.input.light} font-bold text-slate-900 placeholder:font-normal`}
                placeholder="Enter your name"
              />
            </div>

            {/* Level */}
            <div>
              <label className={`block ${styles.text.sectionLabel} mb-3`}>
                Proficiency Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ONBOARDING_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      level === lvl.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md transform scale-[1.02]'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lvl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className={`block ${styles.text.sectionLabel}`}>
                  Interests
                </label>
                <button 
                  onClick={() => {
                    if (topics.length === ONBOARDING_TOPICS.length) {
                      setTopics([]);
                    } else {
                      setTopics(ONBOARDING_TOPICS.map(t => t.label));
                    }
                  }}
                  className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
                >
                  {topics.length === ONBOARDING_TOPICS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_TOPICS.map((topic) => {
                  const isSelected = topics.includes(topic.label);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modal.footer}>
          {onLogout && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className={styles.button.secondary}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`${styles.button.primary} flex items-center gap-2`}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
