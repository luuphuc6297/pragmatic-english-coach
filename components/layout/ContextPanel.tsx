import React from 'react';
import { Avatar3D } from '../ui/Avatar3D';
import {
  PanelLeft,
  ArrowLeft,
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
  Lightbulb,
} from 'lucide-react';
import {ChatMode, LessonContext, StoryScenario, PracticeDialogue, CEFRLevel, GrammarComponent} from '../../types';
import ProgressiveHint from '../shared/ProgressiveHint';
import {getDifficultyColor} from '../../utils/topicConfig';
import {styles} from '../../configs/themeConfig';
import {ONBOARDING_TOPICS} from '../../configs/constants';

interface ContextPanelProps {
  chatMode: ChatMode;
  currentLesson: LessonContext | null;
  currentStory: StoryScenario | null;
  currentDialogue?: PracticeDialogue | null;
  latestGrammarAnalysis?: {
    sentence: string;
    components: GrammarComponent[];
    generalExplanation: string;
  } | null;
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
  userAvatar?: string;
  averageScore: string;
  customTopics?: {id: string, label: string, icon: string, colorClass: string}[];
  onToggleSidebar: () => void;
  onBack: () => void;
  onShowProfile: () => void;
  onShowHistory: () => void;
  onNextLesson: (direction: 'same' | 'harder' | 'easier') => void;
  onStartNew: () => void;
}

const TOPIC_TRANSLATIONS: Record<string, string> = {
  'Travel & Survival': 'Du lịch & Sinh tồn',
  'Business & Work': 'Công việc & Kinh doanh',
  'Food & Dining': 'Ẩm thực & Ăn uống',
  'Social & Love': 'Xã hội & Tình cảm',
  'Tech & Digital': 'Công nghệ & Kỹ thuật số',
  'Medical & Health': 'Y tế & Sức khỏe',
  'Shopping & Retail': 'Mua sắm & Bán lẻ',
  'Music & Entertainment': 'Âm nhạc & Giải trí',
  'Environment & Nature': 'Môi trường & Thiên nhiên',
  'Finance & Banking': 'Tài chính & Ngân hàng',
  'Legal & Admin': 'Pháp lý & Hành chính',
  'Education & Learning': 'Giáo dục & Học tập',
  'Sports & Fitness': 'Thể thao & Thể hình',
  'General': 'Chung',
};

const ContextPanel: React.FC<ContextPanelProps> = ({
  chatMode,
  currentLesson,
  currentStory,
  currentDialogue,
  latestGrammarAnalysis,
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
  userAvatar,
  averageScore,
  customTopics,
  onToggleSidebar,
  onBack,
  onShowProfile,
  onShowHistory,
  onNextLesson,
  onStartNew,
}) => {
  const isEnToVn = translationDirection === 'EN_to_VN';

  const getTranslatedTopic = (topic: string) => {
    if (!isEnToVn) return topic;
    return TOPIC_TRANSLATIONS[topic] || topic;
  };

  const getTopicStyle = (topicLabel: string) => {
    const topic = ONBOARDING_TOPICS.find(t => t.label === topicLabel);
    if (topic) {
      return {
        icon: topic.icon,
        colorClass: topic.colorClass,
      };
    }
    const customTopic = customTopics?.find(t => t.label === topicLabel);
    if (customTopic) {
      return {
        icon: customTopic.icon,
        colorClass: customTopic.colorClass,
      };
    }
    return {
      icon: '✨',
      colorClass: 'bg-white/5 text-slate-400 border-white/10',
    };
  };

  return (
    <div className="hidden md:flex md:w-[40%] flex-col bg-navy border-r border-glassBorder">
      {/* Header with Stats & Back Button */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/10"
            title="Toggle History Sidebar"
          >
            <PanelLeft size={18} />
          </button>
          <button
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/10"
            title="Back to Mode Selection"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={onShowProfile}
            className="flex items-center gap-2 text-white font-bold tracking-tight hover:bg-white/5 py-1 px-2 rounded-lg transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-navy-muted border border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
              <Avatar3D 
                src={userAvatar} 
                className="w-full h-full object-cover scale-110"
                fallback={<span className="text-navy font-bold text-xs">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>}
              />
            </div>
            <span className="group-hover:text-brand-400 transition-colors">{userName}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {chatMode === 'roleplay' && currentLesson && (
            <button
              onClick={onToggleDirection}
              className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors border border-white/10 shadow-sm"
              title={isEnToVn ? 'Chuyển sang Dịch sang Tiếng Anh' : 'Switch to Translate to Vietnamese'}
            >
              <ArrowRightLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Context Card */}
      <div className="px-6 pt-6">
        <div className="relative overflow-hidden group">
          {chatMode === 'roleplay' && currentLesson ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-md ${getTopicStyle(currentLesson.topic).colorClass}`}
                >
                  {getTopicStyle(currentLesson.topic).icon.startsWith('http') ? (
                    <img src={getTopicStyle(currentLesson.topic).icon} alt={currentLesson.topic} className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <span>{getTopicStyle(currentLesson.topic).icon}</span>
                  )}
                  <span className="uppercase tracking-wider">
                    {getTranslatedTopic(currentLesson.topic)}
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
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight mb-3">
                  {currentLesson.title}
                </h2>
                <blockquote className="border-l-4 border-brand-500 pl-4 py-1">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    <span className="font-bold text-slate-400 not-italic mr-2">{isEnToVn ? 'Tình huống:' : 'Situation:'}</span>
                    {currentLesson.situation}
                  </p>
                </blockquote>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <MessageSquareQuote size={14} />
                  {isEnToVn ? 'Kịch bản' : 'Scenario'} #{safeIndex + 1}
                </span>
                {isCurrentLessonCompleted && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={14} /> {isEnToVn ? 'Hoàn thành' : 'Completed'}
                  </span>
                )}
              </div>
            </div>
          ) : chatMode === 'story' && currentStory ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-md ${getTopicStyle(currentStory.topic).colorClass}`}
                >
                  {getTopicStyle(currentStory.topic).icon.startsWith('http') ? (
                    <img src={getTopicStyle(currentStory.topic).icon} alt={currentStory.topic} className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <span>{getTopicStyle(currentStory.topic).icon}</span>
                  )}
                  <span className="uppercase tracking-wider">
                    {getTranslatedTopic(currentStory.topic)}
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
                <div className="w-14 h-14 rounded-full bg-navy-muted border-2 border-purple-500/50 flex items-center justify-center shrink-0 relative">
                  <User className="text-slate-300" size={28} />
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-navy"
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

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10`}
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

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
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
                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                  <Languages size={24} />
                </div>
                <div className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <span className="text-violet-300 text-[10px] font-bold uppercase tracking-widest">
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
          <div className="mt-4 flex flex-col gap-6">
            {!latestGrammarAnalysis ? (
              <div className="text-center">
                <h2 className="text-indigo-400 font-bold text-xl mb-2">Tone & Nuance Translator</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter any sentence in English or Vietnamese. The AI will translate it and provide 4
                  pragmatic variations: Formal, Friendly, Casual, and Neutral.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-indigo-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles size={18} />
                  Grammar Analysis
                </h2>
                
                <div className="bg-glassBg/50 border border-glassBorder rounded-xl p-4 mb-4">
                  <p className="text-white font-medium mb-2">"{latestGrammarAnalysis.sentence}"</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {latestGrammarAnalysis.generalExplanation}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sentence Components</h3>
                  {latestGrammarAnalysis.components.map((comp, idx) => {
                    const typeColors: Record<string, string> = {
                      subject: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                      verb: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                      object: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                      adjective: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                      adverb: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
                      preposition: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
                      conjunction: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
                      other: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
                    };
                    
                    const colorClass = typeColors[comp.type] || typeColors.other;
                    
                    return (
                      <div key={idx} className="bg-glassBg border border-glassBorder rounded-lg p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{comp.text}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorClass}`}>
                            {comp.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {comp.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
            <div className="sticky top-0 z-10 bg-navy/95 backdrop-blur-md py-4 border-b border-white/5 -mx-8 px-8 mb-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Languages size={14} className="text-brand-400" />
                    {isEnToVn ? 'Dịch sang Tiếng Việt' : 'Translate to English'}
                  </h2>
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <p className="text-2xl md:text-3xl font-black text-white leading-tight">
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
                translationDirection={translationDirection}
              />
            </div>

            <div className="mt-6 bg-white/5 p-5 rounded-xl border border-white/10">
              <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-400" />
                {isEnToVn ? 'Mẹo thành công' : 'Tips for Success'}
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                  <span>{isEnToVn ? 'Cố gắng sử dụng ngôn ngữ tự nhiên, giao tiếp thay vì dịch từng từ một.' : 'Try to use natural, conversational language rather than translating word-for-word.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                  <span>{isEnToVn ? 'Chú ý đến mức độ trang trọng của tình huống.' : 'Pay attention to the formality of the situation.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                  <span>{isEnToVn ? 'Sử dụng ' : 'Use the '}<strong>{isEnToVn ? 'Gia sư thông minh' : 'Smart Tutor'}</strong>{isEnToVn ? ' nếu bạn gặp khó khăn!' : ' if you get stuck!'}</span>
                </li>
              </ul>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ContextPanel;
