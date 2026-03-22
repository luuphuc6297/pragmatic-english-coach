import React, {useState} from 'react';
import { Avatar3D } from '../ui/Avatar3D';
import {UserPreferences, CEFRLevel} from '../../types';
import {ONBOARDING_LEVELS, ONBOARDING_TOPICS, PREDEFINED_AVATARS} from '../../configs/constants';
import {X, Save, User, Award, BookOpen, Activity, LogOut, AlertTriangle, Plus} from 'lucide-react';
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
  const [avatarUrl, setAvatarUrl] = useState(preferences.avatarUrl);
  const [level, setLevel] = useState<CEFRLevel>(preferences.level);
  const [topics, setTopics] = useState<string[]>(preferences.topics);
  const [customTopic, setCustomTopic] = useState('');
  const [customTopicsList, setCustomTopicsList] = useState<{id: string, label: string, icon: string, colorClass: string}[]>(
    preferences.customTopics || preferences.topics
      .filter(t => !ONBOARDING_TOPICS.some(ot => ot.label === t))
      .map((t, i) => ({
        id: `custom-init-${i}`,
        label: t,
        icon: '✨',
        colorClass: 'bg-tealAccent text-navy border-tealAccent shadow-tealAccent/25'
      }))
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleTopicToggle = (topicId: string) => {
    setTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId],
    );
  };

  const handleRemoveCustomTopic = (e: React.MouseEvent, topicId: string, topicLabel: string) => {
    e.stopPropagation();
    setCustomTopicsList(prev => prev.filter(t => t.id !== topicId));
    setTopics(prev => prev.filter(t => t !== topicLabel));
  };

  const handleAddCustomTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customTopic.trim();
    if (!trimmed) return;
    
    // Check if it already exists
    const allTopics = [...ONBOARDING_TOPICS, ...customTopicsList];
    const exists = allTopics.some(t => t.label.toLowerCase() === trimmed.toLowerCase());
    
    if (!exists) {
      const newTopic = {
        id: `custom-${Date.now()}`,
        label: trimmed,
        icon: '✨',
        colorClass: 'bg-tealAccent text-navy border-tealAccent shadow-tealAccent/25'
      };
      setCustomTopicsList([...customTopicsList, newTopic]);
      setTopics([...topics, trimmed]);
    } else if (!topics.includes(trimmed)) {
      // If it exists but not selected, select it
      const existing = allTopics.find(t => t.label.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        setTopics([...topics, existing.label]);
      }
    }
    setCustomTopic('');
  };

  const handleSave = () => {
    if (name.trim() && topics.length > 0) {
      onSave({
        name,
        level,
        topics,
        avatarUrl,
        customTopics: customTopicsList,
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
            <div className="w-24 h-24 rounded-full bg-navy-muted border-4 border-white/10 shadow-lg overflow-hidden mb-4 relative group">
              <Avatar3D 
                src={avatarUrl} 
                className="w-full h-full object-cover scale-110"
                fallback={<span className="text-navy font-bold text-3xl">{name?.charAt(0)?.toUpperCase() || 'U'}</span>}
              />
            </div>
            <h3 className="text-2xl font-bold text-white">{name || 'User'}</h3>
            <p className="text-slate-400 text-sm">{preferences.level} Learner</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`${styles.card.stat} bg-primary/10 border-primary/20`}>
              <Award className="text-primary mb-2" size={24} />
              <span className="text-2xl font-black text-primary">{stats.averageScore}</span>
              <span className="text-xs font-bold text-primary/80 uppercase tracking-wide">
                Avg Score
              </span>
            </div>
            <div className={`${styles.card.stat} bg-purple-500/10 border-purple-500/20`}>
              <BookOpen className="text-purple-400 mb-2" size={24} />
              <span className="text-2xl font-black text-purple-400">{stats.lessonsCompleted}</span>
              <span className="text-xs font-bold text-purple-400/80 uppercase tracking-wide">
                Lessons Done
              </span>
            </div>
            <div className={`${styles.card.stat} bg-emerald-500/10 border-emerald-500/20`}>
              <Activity className="text-emerald-400 mb-2" size={24} />
              <span className="text-2xl font-black text-emerald-400">{level}</span>
              <span className="text-xs font-bold text-emerald-400/80 uppercase tracking-wide">
                Current Level
              </span>
            </div>
          </div>

          <hr className="border-white/10 mb-8" />

          {/* Edit Form */}
          <div className="space-y-6">
            {/* Avatar Selection */}
            <div>
              <label className={`block ${styles.text.sectionLabel} mb-3`}>
                Choose Avatar
              </label>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {PREDEFINED_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAvatarUrl(url)}
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === url
                        ? 'border-brand-500 scale-110 shadow-lg shadow-brand-500/20'
                        : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Avatar3D src={url} className="w-full h-full object-cover scale-110" fallback={<span className="text-navy font-bold text-sm">A{idx+1}</span>} />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className={`block ${styles.text.sectionLabel} mb-2`}>
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.input.dark} font-bold text-white placeholder:font-normal`}
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
                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      level === lvl.id
                        ? `${lvl.colorClass} transform scale-[1.02]`
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{lvl.icon}</span>
                    <span className={level === lvl.id ? lvl.textClass : ''}>{lvl.title}</span>
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
                    const allTopics = [...ONBOARDING_TOPICS, ...customTopicsList];
                    if (topics.length === allTopics.length) {
                      setTopics([]);
                    } else {
                      setTopics(allTopics.map(t => t.label));
                    }
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {topics.length === [...ONBOARDING_TOPICS, ...customTopicsList].length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...ONBOARDING_TOPICS, ...customTopicsList].map((topic) => {
                  const isSelected = topics.includes(topic.label);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 group ${
                        isSelected
                          ? `${topic.colorClass} shadow-md scale-105`
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {topic.icon.startsWith('http') ? (
                        <img src={topic.icon} alt={topic.label} className="w-3.5 h-3.5 object-contain" />
                      ) : (
                        <span>{topic.icon}</span>
                      )}
                      {topic.label}
                      {topic.id.startsWith('custom-') && (
                        <span 
                          onClick={(e) => handleRemoveCustomTopic(e, topic.id, topic.label)}
                          className="ml-1 opacity-50 hover:opacity-100 hover:text-rose-400 transition-colors p-0.5 rounded-full hover:bg-rose-500/10"
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Custom Topic Input */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <form onSubmit={handleAddCustomTopic} className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Add custom topic (e.g. Pets)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!customTopic.trim()}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modal.footer}>
          {onLogout && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
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
