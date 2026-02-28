import React, { useState } from 'react';
import { UserPreferences, CEFRLevel } from '../types';
import { ONBOARDING_LEVELS, ONBOARDING_TOPICS } from '../constants';
import { X, Save, User, Award, BookOpen, Activity, LogOut } from 'lucide-react';

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

const UserProfile: React.FC<UserProfileProps> = ({ preferences, stats, onClose, onSave, onLogout }) => {
  const [name, setName] = useState(preferences.name);
  const [level, setLevel] = useState<CEFRLevel>(preferences.level);
  const [topics, setTopics] = useState<string[]>(preferences.topics);

  const handleTopicToggle = (topicId: string) => {
    setTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSave = () => {
    if (name.trim() && topics.length > 0) {
      onSave({
        name,
        level,
        topics
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-brand-500" size={24} />
            Learner Profile
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 flex flex-col items-center">
              <Award className="text-brand-500 mb-2" size={24} />
              <span className="text-2xl font-black text-brand-700">{stats.averageScore}</span>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wide">Avg Score</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col items-center">
              <BookOpen className="text-purple-500 mb-2" size={24} />
              <span className="text-2xl font-black text-purple-700">{stats.lessonsCompleted}</span>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">Lessons Done</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center">
              <Activity className="text-emerald-500 mb-2" size={24} />
              <span className="text-2xl font-black text-emerald-700">{level}</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Current Level</span>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* Edit Form */}
          <div className="space-y-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none font-bold text-slate-900 transition-all placeholder:font-normal"
                placeholder="Enter your name"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Proficiency Level</label>
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
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Interests</label>
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
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
          {onLogout && (
            <button 
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all active:scale-95"
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