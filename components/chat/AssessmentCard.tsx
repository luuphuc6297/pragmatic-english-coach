import React from 'react';
import {
  AlertCircle,
  Video,
  Loader,
  BookOpen,
  PenTool,
  Volume2,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Play,
  BarChart2,
  BookmarkPlus,
  BrainCircuit,
} from 'lucide-react';
import {ChatMessage, ChatMode, SavedItem, ToneKey} from '../../types';
import { getScoreColorClass, getScoreBadgeClass, getScoreBadgeLabel, TONE_VARIATIONS } from '../../configs/themeConfig';
import RadarScore from '../shared/RadarScore';

interface AssessmentCardProps {
  msg: ChatMessage;
  chatMode: ChatMode;
  isLastMessage: boolean;
  isCollapsed: boolean;
  onToggleDetails: () => void;
  onSaveItem: (item: SavedItem) => void;
  onNextLesson: (direction: 'same' | 'harder' | 'easier') => void;
  onContinueStory?: (nextReply: string, nextReplyVietnamese?: string) => void;
  onGenerateVideo: (msg: ChatMessage) => void;
  onPlayAudio: (msgId: string, text: string, toneKey: string) => void;
  videoLoadingId: string | null;
  audioLoadingId: string | null;
  onReturnToModes?: () => void;
}


const AssessmentCard: React.FC<AssessmentCardProps> = ({
  msg,
  chatMode,
  isLastMessage,
  isCollapsed,
  onToggleDetails,
  onSaveItem,
  onNextLesson,
  onContinueStory,
  onGenerateVideo,
  onPlayAudio,
  videoLoadingId,
  audioLoadingId,
  onReturnToModes,
}) => {
  const [isVideoCollapsed, setIsVideoCollapsed] = React.useState(false);
  const assessment = msg.assessment!;

  const scoreColorClass = getScoreColorClass(assessment.score);
  const badgeColorClass = getScoreBadgeClass(assessment.score);
  const badgeLabel = getScoreBadgeLabel(assessment.score);

  return (
    <div className="bg-navy-muted/50 rounded-2xl border border-white/10 shadow-sm overflow-hidden w-full animate-in slide-in-from-left-2 fade-in">
      {/* 1. HEADER & SUMMARY */}
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-sm border-2 ${scoreColorClass}`}
            >
              {assessment.score}
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">Assessment</h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${badgeColorClass}`}
                >
                  {badgeLabel}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-bold border border-white/10 uppercase">
                  {assessment.userTone || 'Neutral'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-4">
          <p className="text-[15px] text-slate-100 leading-relaxed font-medium">
            {assessment.feedback}
          </p>
        </div>

        {/* Correction */}
        {(assessment.correction || assessment.betterAlternative) && (
          <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 flex gap-3 relative group/correction mt-4">
            <div className="mt-0.5 shrink-0">
              <AlertCircle size={18} className="text-orange-400" />
            </div>
            <div className="pr-8">
              <span className="text-[10px] font-bold text-orange-400 uppercase block mb-0.5 tracking-wider">
                Better Way to Say It
              </span>
              <p className="text-white font-medium text-sm message-text-container">
                {assessment.correction || assessment.betterAlternative}
              </p>
            </div>
            <button
              onClick={() =>
                onSaveItem({
                  id: Date.now().toString(),
                  original: msg.content,
                  correction: assessment.correction || assessment.betterAlternative || '',
                  type: 'grammar',
                  context: assessment.correction || assessment.betterAlternative || '',
                  timestamp: Date.now(),
                  masteryScore: 0,
                })
              }
              className="absolute top-3 right-3 opacity-100 md:opacity-0 group-hover/correction:opacity-100 transition-opacity p-1.5 bg-navy-muted/80 rounded-full text-orange-400 hover:text-orange-300 shadow-sm border border-orange-500/20"
              title="Save to Dictionary"
            >
              <BookmarkPlus size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 2. ACCORDION TRIGGER */}
      <button
        onClick={onToggleDetails}
        className="w-full px-5 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-100">
          <BarChart2 size={14} />
          <span>Detailed Metrics</span>
        </div>
        {!isCollapsed ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {/* 3. EXPANDED DETAILS */}
      {!isCollapsed && (
        <div className="p-4 md:p-5 border-t border-white/5 bg-navy-muted/30 animate-in slide-in-from-top-2 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Radar Chart */}
            <div className="h-48 w-full bg-navy-muted rounded-xl border border-white/10 p-2 shadow-sm">
              <RadarScore assessment={assessment} />
            </div>

            {/* Grammar & Vocab Cards */}
            <div className="space-y-3">
              <div className="bg-navy-muted p-3 rounded-xl border border-blue-500/20 shadow-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-500/10">
                  <PenTool size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase">Grammar</span>
                </div>
                <p className="text-xs md:text-sm text-slate-100 leading-relaxed">
                  {assessment.grammarAnalysis}
                </p>
              </div>

              <div className="bg-navy-muted p-3 rounded-xl border border-purple-500/20 shadow-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-500/10">
                  <BookOpen size={14} className="text-purple-400" />
                  <span className="text-xs font-bold text-purple-400 uppercase">Vocabulary</span>
                </div>
                <p className="text-xs md:text-sm text-slate-100 leading-relaxed">
                  {assessment.vocabularyAnalysis}
                </p>
              </div>
            </div>
          </div>

          {/* Tone Variations */}
          {assessment.alternativeTones && (
            <div className="bg-navy-muted rounded-xl border border-white/10 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-slate-400" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Tone Variations
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TONE_VARIATIONS.map((tone) => (
                  <div
                    key={tone.key}
                    className={`p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all group ${tone.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] font-bold ${tone.color} uppercase`}
                      >
                        <tone.icon size={12} /> {tone.label}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onSaveItem({
                              id: Date.now().toString(),
                              original: assessment.alternativeTones[tone.key as ToneKey],
                              correction: assessment.alternativeTones[tone.key as ToneKey],
                              type: 'vocabulary',
                              context: assessment.alternativeTones[tone.key as ToneKey],
                              timestamp: Date.now(),
                              masteryScore: 0,
                            })
                          }
                          className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white/5 rounded-full text-slate-400 hover:text-primary shadow-sm border border-white/10"
                          title="Save to Dictionary"
                        >
                          <BookmarkPlus size={14} />
                        </button>
                        <button
                          onClick={() =>
                            onPlayAudio(
                              msg.id,
                              assessment.alternativeTones[tone.key as ToneKey],
                              tone.key,
                            )
                          }
                          disabled={audioLoadingId === `${msg.id}-${tone.key}`}
                          className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white/5 rounded-full text-slate-400 hover:text-primary disabled:opacity-50 shadow-sm border border-white/10"
                          title="Listen"
                        >
                          {audioLoadingId === `${msg.id}-${tone.key}` ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-100 message-text-container">
                      "{assessment.alternativeTones[tone.key as ToneKey]}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIONS */}
      {chatMode !== 'translator' && (
        <div className="p-4 md:p-5 border-t border-white/5 bg-navy-muted/50 flex flex-col gap-4">
          {/* Video Button */}
          <div>
            {msg.generatedVideoUrl ? (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black shadow-md relative">
                <button 
                  onClick={() => setIsVideoCollapsed(!isVideoCollapsed)}
                  className="w-full bg-navy-muted hover:bg-white/10 text-slate-100 text-[10px] py-2 px-3 font-bold uppercase flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Video size={12} /> Generated Context Video
                  </div>
                  {isVideoCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!isVideoCollapsed && (
                  <video
                    src={msg.generatedVideoUrl}
                    controls
                    className="w-full aspect-video object-cover"
                    autoPlay
                    loop
                    crossOrigin="anonymous"
                  >
                    <track
                      kind="subtitles"
                      srcLang="en"
                      label="English"
                      default
                      src={`data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n1\n00:00:00.000 --> 00:00:10.000\n${msg.assessment?.betterAlternative || msg.assessment?.correction || msg.assessment?.alternativeTones?.conversational || msg.assessment?.alternativeTones?.formal || msg.content}`)}`}
                    />
                  </video>
                )}
              </div>
            ) : (
              <button
                onClick={() => onGenerateVideo(msg)}
                disabled={videoLoadingId === msg.id}
                className="w-full py-3 bg-white/5 hover:bg-white/10 hover:text-primary text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-white/10"
              >
                {videoLoadingId === msg.id ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Directing Scene... (~1m)
                  </>
                ) : (
                  <>
                    <Video size={16} />
                    Visualize Native Context
                  </>
                )}
              </button>
            )}
          </div>

          {/* Roleplay Next Options */}
          {chatMode === 'roleplay' && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onNextLesson('easier')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group"
              >
                <TrendingDown
                  size={20}
                  className="text-emerald-400 mb-1 group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-400 uppercase tracking-tight">
                  Easier
                </span>
              </button>
              <button
                onClick={() => onNextLesson('same')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group shadow-sm"
              >
                <RefreshCcw
                  size={20}
                  className="text-primary mb-1 group-hover:rotate-180 transition-transform duration-500"
                />
                <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  New One
                </span>
              </button>
              <button
                onClick={() => onNextLesson('harder')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all group"
              >
                <TrendingUp
                  size={20}
                  className="text-rose-400 mb-1 group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-rose-400 uppercase tracking-tight">
                  Harder
                </span>
              </button>
            </div>
          )}

          {/* Story Continue Options */}
          {chatMode === 'story' && isLastMessage && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  onContinueStory &&
                  msg.assessment?.nextAgentReply &&
                  onContinueStory(
                    msg.assessment.nextAgentReply,
                    msg.assessment.nextAgentReplyVietnamese,
                  )
                }
                className="w-full py-4 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transform transition-all active:scale-[0.98]"
              >
                <Play size={18} fill="currentColor" /> Continue Conversation
              </button>
              <button
                onClick={() => onNextLesson('same')}
                className="w-full py-3 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-colors"
              >
                End & Start New Story
              </button>
            </div>
          )}

          {/* Dialogues End Option */}
          {chatMode === 'dialogues' && isLastMessage && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNextLesson('same')}
                className="w-full py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform transition-all active:scale-[0.98]"
              >
                <RefreshCcw size={18} /> Try Another Dialogue
              </button>
              <button
                onClick={() => {
                  // Scroll to top to review performance
                  const chatContainer = document.querySelector('.scrollbar-hide');
                  if (chatContainer) {
                    chatContainer.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-3 bg-white/5 text-slate-100 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart2 size={16} /> Review Performance
              </button>
              {onReturnToModes && (
                <button
                  onClick={onReturnToModes}
                  className="w-full py-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-colors"
                >
                  Return to Mode Selection
                </button>
              )}
            </div>
          )}

          {/* Quiz Next Option */}
          {chatMode === 'quiz' && isLastMessage && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNextLesson('same')}
                className="w-full py-4 bg-amber-500 text-white hover:bg-amber-600 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transform transition-all active:scale-[0.98]"
              >
                <BrainCircuit size={18} fill="currentColor" /> Next Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentCard;
