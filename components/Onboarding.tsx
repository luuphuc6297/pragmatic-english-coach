import React, {useState} from 'react';
import {CEFRLevel, UserPreferences} from '../types';
import {ONBOARDING_LEVELS, ONBOARDING_TOPICS} from '../constants';
import {ArrowRight, Check} from 'lucide-react';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({onComplete}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<CEFRLevel | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  const handleTopicToggle = (topicId: string) => {
    setTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId],
    );
  };

  const handleNext = () => {
    if (step === 1 && level && name.trim()) {
      setStep(2);
    } else if (step === 2 && topics.length > 0) {
      onComplete({name, level: level!, topics});
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />

      <div className="max-w-3xl w-full z-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
            Pragmatic Coach <span className="text-brand-500">.AI</span>
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
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
              />
            </div>

            <h2 className="text-xl font-bold mb-6 text-center">Select your Proficiency Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ONBOARDING_LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id)}
                  className={`
                                cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative group
                                ${
                                  level === lvl.id
                                    ? 'bg-brand-500/10 border-brand-500 shadow-[0_0_20px_rgba(14,165,233,0.3)] transform scale-[1.02]'
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                                }
                            `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-2xl font-black ${level === lvl.id ? 'text-brand-400' : 'text-slate-500'}`}
                    >
                      {lvl.id}
                    </span>
                    {level === lvl.id && <Check className="text-brand-500" size={24} />}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{lvl.title}</h3>
                  <p className="text-sm text-slate-300 mb-3">{lvl.desc}</p>
                  <div className="text-xs text-slate-500 font-mono border-t border-slate-700/50 pt-3 mt-3">
                    {lvl.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right fade-in duration-500">
            <div className="flex justify-between items-center mb-6 px-4">
              <h2 className="text-xl font-bold text-center flex-1">Choose Topics of Interest</h2>
              <button 
                onClick={() => {
                  if (topics.length === ONBOARDING_TOPICS.length) {
                    setTopics([]);
                  } else {
                    setTopics(ONBOARDING_TOPICS.map(t => t.label));
                  }
                }}
                className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors absolute right-4"
              >
                {topics.length === ONBOARDING_TOPICS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {ONBOARDING_TOPICS.map((topic) => {
                const isSelected = topics.includes(topic.label);
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.label)}
                    className={`
                                    px-6 py-3 rounded-full border flex items-center gap-2 transition-all duration-200
                                    ${
                                      isSelected
                                        ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25 scale-105'
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                    }
                                `}
                  >
                    <span className="text-lg">{topic.icon}</span>
                    <span className="font-medium text-sm">{topic.label}</span>
                  </button>
                );
              })}
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
                    group relative px-8 py-3 rounded-full font-bold transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${step === 2 && topics.length > 0 ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-brand-500 hover:bg-brand-400 text-white'}
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
            className={`w-2 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-brand-500' : 'bg-slate-700'}`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-brand-500' : 'bg-slate-700'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
