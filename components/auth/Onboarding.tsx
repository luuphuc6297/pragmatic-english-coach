import React, {useState} from 'react';
import {CEFRLevel, UserPreferences} from '../types';
import {ONBOARDING_LEVELS, ONBOARDING_TOPICS, PREDEFINED_AVATARS} from '../../configs/constants';
import { Avatar3D } from '../ui/Avatar3D';
import {ArrowRight, Check, Plus, X} from 'lucide-react';
import { getTopicConfig } from '../../utils/topicConfig';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({onComplete}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PREDEFINED_AVATARS[0]);
  const [level, setLevel] = useState<CEFRLevel | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [customTopicsList, setCustomTopicsList] = useState<{id: string, label: string, icon: string, colorClass: string}[]>([]);

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

  const handleNext = () => {
    if (step === 1 && level && name.trim()) {
      setStep(2);
    } else if (step === 2 && topics.length > 0) {
      onComplete({name, level: level!, topics, avatarUrl, customTopics: customTopicsList});
    }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-navy text-white relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(78,217,204,0.15),transparent)] pointer-events-none" />

      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 z-50 shrink-0 relative">
        <div className="flex items-center gap-3">
        </div>
      </header>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar z-10">
        <div className="min-h-full flex flex-col items-center justify-center p-6">
          <div className="max-w-3xl w-full">
            <div className="mb-10 text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold mb-3 tracking-wide flex items-center justify-center">
              AURA C
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Americas.png" alt="O" className="w-10 h-10 md:w-14 md:h-14 mx-1 inline-block -mt-1 md:-mt-2 drop-shadow-xl animate-[spin_10s_linear_infinite]" />
              ACH <span className="text-tealAccent ml-2 font-sans">.AI</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Let's personalize your learning experience.
            </p>
          </div>

        {step === 1 && (
          <div className="animate-in slide-in-from-right fade-in duration-500">
            {/* Name Input */}
            <div className="mb-8 max-w-md mx-auto">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-navy border border-glassBorder rounded-twelve text-center text-white placeholder-slate-500 focus:border-tealAccent focus:ring-1 focus:ring-tealAccent outline-none transition-all mb-6"
              />
              
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                Choose your Avatar
              </label>
              <div className="flex flex-wrap gap-3 justify-center">
                {PREDEFINED_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAvatarUrl(url)}
                    className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === url
                        ? 'border-tealAccent scale-110 shadow-lg shadow-tealAccent/20'
                        : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Avatar3D src={url} className="w-full h-full object-cover scale-110" fallback={<span className="text-navy font-bold text-sm">A{idx+1}</span>} />
                  </button>
                ))}
              </div>
            </div>

            <h2 className="text-xl font-bold mb-6 text-center">Select your Proficiency Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ONBOARDING_LEVELS.map((lvl) => {
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    className={`
                                  glass-card cursor-pointer rounded-twelve p-6 border transition-all duration-300 relative group
                                  ${
                                    level === lvl.id
                                      ? `${lvl.colorClass} transform scale-[1.02]`
                                      : 'hover:border-glassBorder hover:bg-white/5'
                                  }
                              `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-2xl font-black flex items-center gap-2 ${level === lvl.id ? lvl.textClass : 'text-slate-500'}`}
                      >
                        <span>{lvl.icon}</span>
                        {lvl.id}
                      </span>
                      {level === lvl.id && <Check className={lvl.textClass} size={24} />}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{lvl.title}</h3>
                    <p className="text-sm text-slate-300 mb-3">{lvl.desc}</p>
                    <div className="text-xs text-slate-500 font-mono border-t border-glassBorder pt-3 mt-3">
                      {lvl.details}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right fade-in duration-500">
            <div className="flex justify-between items-center mb-6 w-full">
              <h2 className="text-xl font-bold text-left">Choose Topics of Interest</h2>
              <button 
                onClick={() => {
                  const allTopics = [...ONBOARDING_TOPICS, ...customTopicsList];
                  if (topics.length === allTopics.length) {
                    setTopics([]);
                  } else {
                    setTopics(allTopics.map(t => t.label));
                  }
                }}
                className="text-sm font-medium text-tealAccent hover:text-tealAccent/80 transition-colors shrink-0 ml-4"
              >
                {topics.length === [...ONBOARDING_TOPICS, ...customTopicsList].length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap justify-start gap-3">
              {[...ONBOARDING_TOPICS, ...customTopicsList].map((topic) => {
                const isSelected = topics.includes(topic.label);
                
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.label)}
                    className={`
                                    px-6 py-3 rounded-twelve border flex items-center gap-2 transition-all duration-200 group
                                    ${
                                      isSelected
                                        ? `${topic.colorClass} scale-105 shadow-lg`
                                        : 'bg-glassBg text-slate-300 border-glassBorder hover:bg-white/10 hover:border-white/20'
                                    }
                                `}
                  >
                    <span className="text-lg flex items-center justify-center">
                      {topic.icon.startsWith('http') ? (
                        <img src={topic.icon} alt={topic.label} className="w-5 h-5 object-contain" />
                      ) : (
                        topic.icon
                      )}
                    </span>
                    <span className="font-medium text-sm">{topic.label}</span>
                    {topic.id.startsWith('custom-') && (
                      <span 
                        onClick={(e) => handleRemoveCustomTopic(e, topic.id, topic.label)}
                        className="ml-1 opacity-50 hover:opacity-100 hover:text-rose-400 transition-colors p-1 rounded-full hover:bg-rose-500/10"
                      >
                        <X size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Custom Topic Input */}
            <div className="mt-6 pt-6 border-t border-glassBorder">
              <form onSubmit={handleAddCustomTopic} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Add your own topic (e.g. Pets, Family)..."
                  className="flex-1 bg-glassBg border border-glassBorder rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-tealAccent focus:ring-1 focus:ring-tealAccent transition-all"
                />
                <button
                  type="submit"
                  disabled={!customTopic.trim()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && (!level || !name.trim())) || (step === 2 && topics.length === 0)
            }
            className={`
                    group relative px-8 py-3 rounded-twelve font-bold transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${step === 2 && topics.length > 0 ? 'bg-tealAccent hover:bg-tealAccent/90 text-navy glow-teal' : 'bg-tealAccent hover:bg-tealAccent/90 text-navy glow-teal'}
                `}
          >
            <div className="flex items-center gap-2">
              <span>{step === 1 ? 'Next Step' : 'Start Learning'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-tealAccent' : 'bg-glassBorder'}`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-tealAccent' : 'bg-glassBorder'}`}
          />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
