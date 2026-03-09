import React from 'react';
import {
  PanelLeft,
  ArrowLeft,
  Clock,
  Activity,
  MessageSquareQuote,
  CheckCircle,
  Zap,
  User,
  BookOpen,
  Languages,
  MapPin,
  ArrowRightLeft,
  Sparkles,
  Users,
  Plus,
  Network,
} from 'lucide-react';
import {ChatMode, LessonContext, StoryScenario, PracticeDialogue, CEFRLevel} from '../../types';
import ProgressiveHint from '../shared/ProgressiveHint';
import {getTopicConfig, getDifficultyColor} from '../../utils/topicConfig';
import {styles} from '../../configs/themeConfig';

interface ContextPanelProps {
  chatMode: ChatMode;
  currentLesson: LessonContext | null;
  currentStory: StoryScenario | null;
  currentDialogue?: PracticeDialogue | null;
  safeIndex: number;
  isCurrentLessonCompleted: boolean;
  translationDirection: 'VN_to_EN' | 'EN_to_VN';
  onToggleDirection: () => void;
  hintLevel: number;
  onRequestHint: () => void;
  onResetHint: () => void;
  isGenerating: boolean;
  isInfiniteMode: boolean;
  userName: string | undefined;
  averageScore: string;
  onToggleSidebar: () => void;
  onBack: () => void;
  onShowProfile: () => void;
  onShowHistory: () => void;
  onNextLesson: (direction: 'same' | 'harder' | 'easier') => void;
  onStartNew: () => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  chatMode,
  currentLesson,
  currentStory,
  currentDialogue,
  safeIndex,
  isCurrentLessonCompleted,
  translationDirection,
  onToggleDirection,
  hintLevel,
  onRequestHint,
  onResetHint,
  isGenerating,
  isInfiniteMode,
  userName,
  averageScore,
  onToggleSidebar,
  onBack,
  onShowProfile,
  onShowHistory,
  onNextLesson,
  onStartNew,
}) => {
  return (
    <div className="hidden md:flex md:w-[40%] flex-col bg-slate-900 border-r border-slate-800">
      {/* Header with Stats & Back Button */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
            title="Toggle History Sidebar"
          >
            <PanelLeft size={18} />
          </button>
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
            title="Back to Mode Selection"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={onShowProfile}
            className="flex items-center gap-2 text-white font-bold tracking-tight hover:bg-slate-800 py-1 px-2 rounded-lg transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
              <img 
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName || 'User')}&backgroundColor=0ea5e9,10b981,6366f1,f43f5e,f59e0b,8b5cf6`} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="group-hover:text-brand-400 transition-colors">{userName}</span>
          </button>
          <button
            onClick={onShowHistory}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700 ml-2"
            title="View Conversation History"
          >
            <Clock size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            <Activity size={14} className="text-brand-400" />
            <span className="text-xs font-medium text-slate-300">
              Avg: <span className="text-white font-bold">{averageScore}</span>
            </span>
          </div>
          <button
            onClick={onStartNew}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-medium transition-colors shadow-sm text-xs disabled:opacity-50"
            title="New Conversation"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {/* Context Card */}
      <div className="px-6 pt-6">
        <div className={`${styles.card.dark} shadow-xl relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

          {chatMode === 'roleplay' && currentLesson ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTopicConfig(currentLesson.topic).bg} ${getTopicConfig(currentLesson.topic).border}`}
                >
                  {React.createElement(getTopicConfig(currentLesson.topic).icon, {
                    size: 16,
                    className: getTopicConfig(currentLesson.topic).color,
                  })}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${getTopicConfig(currentLesson.topic).color}`}
                  >
                    {currentLesson.topic}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg ${getDifficultyColor(currentLesson.difficulty)}`}
                >
                  <Zap size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">{currentLesson.difficulty}</span>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight line-clamp-2">
                  {currentLesson.title}
                </h2>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <MessageSquareQuote size={14} />
                  Scenario #{safeIndex + 1}
                </span>
                {isCurrentLessonCompleted && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={14} /> Completed
                  </span>
                )}
              </div>
            </div>
          ) : chatMode === 'story' && currentStory ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTopicConfig(currentStory.topic).bg} ${getTopicConfig(currentStory.topic).border}`}
                >
                  {React.createElement(getTopicConfig(currentStory.topic).icon, {
                    size: 16,
                    className: getTopicConfig(currentStory.topic).color,
                  })}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${getTopicConfig(currentStory.topic).color}`}
                  >
                    {currentStory.topic}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg ${getDifficultyColor(currentStory.difficulty)}`}
                >
                  <Zap size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">{currentStory.difficulty}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-purple-500/50 flex items-center justify-center shrink-0 relative">
                  <User className="text-slate-300" size={28} />
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800"
                    title="Online"
                  ></div>
                </div>
                <div>
                  <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Speaking With
                  </span>
                  <h2 className="text-2xl font-black text-white leading-none">
                    {currentStory.agentName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <BookOpen size={14} />
                  Interactive Story
                </span>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  Immersive Mode
                </span>
              </div>
            </div>
          ) : chatMode === 'dialogues' && currentDialogue ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-900/20`}
                >
                  <Users size={16} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Practice
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg ${getDifficultyColor(currentDialogue.difficulty as CEFRLevel)}`}
                >
                  <Zap size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">{currentDialogue.difficulty}</span>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight line-clamp-2">
                  {currentDialogue.title}
                </h2>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <MessageSquareQuote size={14} />
                  Dialogue Practice
                </span>
              </div>
            </div>
          ) : chatMode === 'vocab_hub' ? (
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Network size={24} />
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-900/30 border border-emerald-500/20">
                  <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">
                    Tool
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">Vocab Hub</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Explore vocabulary through mind maps and deep analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Languages size={24} />
                </div>
                <div className="px-3 py-1 rounded-lg bg-indigo-900/30 border border-indigo-500/20">
                  <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                    Tool
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">Tone Translator</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Explore nuance, formality, and cultural context.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Details */}
      <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-y-auto">
        {chatMode === 'vocab_hub' && (
          <div className="text-center mt-4 space-y-6">
            <div>
              <h2 className="text-emerald-400 font-bold text-xl mb-2">Topic Mind Map</h2>
              <p className="text-slate-400 text-sm leading-relaxed text-left">
                Start with a root topic and dynamically expand it. Click on any node to generate related vocabulary words. You can also add your own custom words to see how they connect to the existing map.
              </p>
            </div>
            <div>
              <h2 className="text-blue-400 font-bold text-xl mb-2">Morphological Analysis</h2>
              <p className="text-slate-400 text-sm leading-relaxed text-left">
                Enter any English word to get a deep dive into its meaning, pronunciation, word family, synonyms, antonyms, and common collocations.
              </p>
            </div>
          </div>
        )}

        {chatMode === 'translator' && (
          <div className="text-center mt-4">
            <h2 className="text-indigo-400 font-bold text-xl mb-2">Tone & Nuance Translator</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enter any sentence in English or Vietnamese. The AI will translate it and provide 4
              pragmatic variations: Formal, Friendly, Casual, and Neutral.
            </p>
          </div>
        )}

        {chatMode === 'story' && currentStory && (
          <>
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> The Situation
                </h2>
              </div>
              <p className="text-slate-200 text-lg font-light leading-relaxed">
                {currentStory.situation}
              </p>
            </div>

            <div>
              <ProgressiveHint
                hints={currentStory.hints}
                currentLevel={hintLevel}
                onRequestHint={onRequestHint}
                onResetHint={onResetHint}
              />
            </div>
          </>
        )}

        {chatMode === 'dialogues' && currentDialogue && (
          <>
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> The Scenario
                </h2>
              </div>
              <p className="text-slate-200 text-lg font-light leading-relaxed">
                {currentDialogue.scenario}
              </p>
            </div>

            <div className={`${styles.card.darkTranslucent} p-6 relative overflow-hidden flex flex-col gap-4`}>
              <div>
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Your Role</h3>
                <p className="text-slate-200">{currentDialogue.roles.user}</p>
              </div>
              <div>
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">AI Role</h3>
                <p className="text-slate-200">{currentDialogue.roles.ai}</p>
              </div>
            </div>
          </>
        )}

        {chatMode === 'roleplay' && currentLesson && (
          <>
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-brand-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> The Situation
                </h2>
              </div>
              <p className="text-slate-200 text-lg font-light leading-relaxed">
                {currentLesson.situation}
              </p>
            </div>

            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md py-2 border-b border-slate-800/50 -mx-4 px-4">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Translate to {translationDirection === 'VN_to_EN' ? 'English' : 'Vietnamese'}
                  </h2>
                  <button
                    onClick={onToggleDirection}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                    title="Swap Language"
                  >
                    <ArrowRightLeft size={14} />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                  <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    "
                    {translationDirection === 'VN_to_EN'
                      ? currentLesson.vietnamesePhrase
                      : currentLesson.englishPhrase}
                    "
                  </p>
                </div>
              </div>
            </div>

            <div>
              <ProgressiveHint
                hints={currentLesson.hints}
                currentLevel={hintLevel}
                onRequestHint={onRequestHint}
                onResetHint={onResetHint}
              />
            </div>
          </>
        )}

        {chatMode !== 'translator' && (
          <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-800 shrink-0">
            <span className="text-slate-500 text-xs">
              {chatMode === 'story' ? 'Conversational AI' : `Scenario ${safeIndex + 1}`}
            </span>
            <button
              onClick={() => onNextLesson('same')}
              disabled={isGenerating}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-all border border-slate-700 flex items-center gap-2"
            >
              {isInfiniteMode ? <Sparkles size={14} /> : null}
              Next {chatMode === 'story' ? 'Story' : 'Scenario'} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextPanel;
