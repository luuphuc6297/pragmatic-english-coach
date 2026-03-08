import React, {useRef, useEffect, useState, memo, useCallback} from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import {
  User,
  Bot,
  Volume2,
  Loader2,
  BookmarkPlus,
  CheckCircle,
  CheckCircle2,
  Languages,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowRightLeft,
} from 'lucide-react';
import {ChatMessage, ChatMode, SavedItem, Improvement, LessonContext} from '../../types';
import {generateScenarioVideo, generateNativeSpeech} from '../../services/geminiService';
import ModeSwitcher from './ModeSwitcher';
import TranslatorResult from './TranslatorResult';
import AssessmentCard from './AssessmentCard';
import LoadingBubble from './LoadingBubble';
import ChatInput from './ChatInput';

interface MessageItemProps {
  msg: ChatMessage;
  index: number;
  isLastMessage: boolean;
  messages: ChatMessage[];
  chatMode: ChatMode;
  savedItems: SavedItem[];
  audioLoadingId: string | null;
  videoLoadingId: string | null;
  expandedTranslations: Set<string>;
  collapsedAssessments: Set<string>;
  onSaveItem: (item: SavedItem) => void;
  onPlayAudio: (msgId: string, text: string, toneKey: string) => void;
  toggleTranslation: (id: string) => void;
  toggleAssessmentDetails: (id: string) => void;
  onNextLesson: (direction: 'same' | 'harder' | 'easier') => void;
  onContinueStory?: (nextReply: string, nextReplyVietnamese?: string) => void;
  handleGenerateVideo: (msg: ChatMessage) => void;
  onReturnToModes?: () => void;
  userName?: string;
}

const MessageItem = memo(({
  msg,
  index,
  isLastMessage,
  messages,
  chatMode,
  savedItems,
  audioLoadingId,
  videoLoadingId,
  expandedTranslations,
  collapsedAssessments,
  onSaveItem,
  onPlayAudio,
  toggleTranslation,
  toggleAssessmentDetails,
  onNextLesson,
  onContinueStory,
  handleGenerateVideo,
  onReturnToModes,
  userName
}: MessageItemProps) => {
  const renderUserMessage = (msg: ChatMessage, nextMsg?: ChatMessage) => {
    const assessment = nextMsg?.role === 'assistant' ? nextMsg.assessment : undefined;

    if (!assessment?.improvements || assessment.improvements.length === 0) {
      return msg.content;
    }

    const text = msg.content;
    const matches: {start: number; end: number; improvement: Improvement}[] = [];

    assessment.improvements.forEach((imp) => {
      const lowerText = text.toLowerCase();
      const lowerImp = imp.original.toLowerCase();
      const idx = lowerText.indexOf(lowerImp);

      if (idx !== -1) {
        matches.push({
          start: idx,
          end: idx + imp.original.length,
          improvement: imp,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const uniqueMatches: typeof matches = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        uniqueMatches.push(m);
        lastEnd = m.end;
      }
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    uniqueMatches.forEach((m, i) => {
      if (m.start > lastIndex) {
        elements.push(<span key={`text-${i}`}>{text.substring(lastIndex, m.start)}</span>);
      }

      const isSaved = savedItems.some(
        (s) => s.original === m.improvement.original && s.correction === m.improvement.correction,
      );

      elements.push(
        <span
          key={`highlight-${i}`}
          className={`cursor-pointer border-b-2 ${m.improvement.type === 'grammar' ? 'border-rose-400 bg-rose-50/50 text-rose-700' : 'border-purple-400 bg-purple-50/50 text-purple-700'} px-0.5 rounded transition-all hover:bg-opacity-100 relative group/tooltip inline-block mx-0.5`}
          onClick={(e) => {
            e.stopPropagation();
            onSaveItem({
              id: Date.now().toString() + i,
              original: m.improvement.original,
              correction: m.improvement.correction,
              type: m.improvement.type,
              context: text,
              timestamp: Date.now(),
              masteryScore: 0,
            });
          }}
        >
          {text.substring(m.start, m.end)}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-3 rounded-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
            <span className="block font-bold mb-1 text-emerald-400 flex items-center gap-1">
              {m.improvement.correction}
              {isSaved && <CheckCircle size={10} />}
            </span>
            {m.improvement.explanation}
            <span className="block mt-2 text-[10px] text-slate-400 uppercase font-bold border-t border-slate-700 pt-1">
              {isSaved ? 'Saved' : 'Click to Save'}
            </span>
          </span>
        </span>,
      );

      lastIndex = m.end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return <>{elements}</>;
  };

  if (msg.role === 'system') {
    return (
      <div className="flex w-full justify-center my-4">
        <div className="bg-slate-100 text-slate-500 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider border border-slate-200">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex w-full md:max-w-[90%] lg:max-w-[90%] xl:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 md:gap-3`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm mt-1 ring-2 ring-white overflow-hidden ${
            msg.role === 'user'
              ? 'bg-slate-800 text-white'
              : chatMode === 'translator'
                ? 'bg-indigo-600 text-white'
                : chatMode === 'story'
                  ? 'bg-purple-600 text-white'
                  : 'bg-emerald-600 text-white'
          }`}
        >
          {msg.role === 'user' ? (
            <img 
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName || 'User')}&backgroundColor=0ea5e9,10b981,6366f1,f43f5e,f59e0b,8b5cf6`} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Bot size={18} />
          )}
        </div>

        {/* Message Content Wrapper */}
        <div className="flex flex-col gap-2 min-w-0 max-w-full flex-1">
          {/* Text Bubble */}
          {msg.content && (
            <div
              className={`px-4 py-3 md:px-6 md:py-4 rounded-2xl text-[15px] md:text-base shadow-sm break-words leading-relaxed relative group message-text-container ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white rounded-tr-sm ml-auto'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
              }`}
            >
              {msg.role === 'user'
                ? renderUserMessage(msg, messages[index + 1])
                : msg.content}

              {/* Play audio button for user message */}
              {msg.role === 'user' && (
                <button
                  onClick={() => onPlayAudio(msg.id, msg.content, 'user_input')}
                  disabled={audioLoadingId === `${msg.id}-user_input`}
                  className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white text-slate-400 hover:text-brand-600 shadow-sm border border-slate-100 transition-opacity disabled:opacity-50"
                  title="Listen to your pronunciation"
                >
                  {audioLoadingId === `${msg.id}-user_input` ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Volume2 size={14} />
                  )}
                </button>
              )}

              {/* Actions for assistant message */}
              {msg.role === 'assistant' && (
                <div className="absolute -bottom-3 right-4 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      onSaveItem({
                        id: Date.now().toString(),
                        original: msg.content,
                        correction: msg.content,
                        type: 'vocabulary',
                        context: msg.content,
                        timestamp: Date.now(),
                        masteryScore: 0,
                      })
                    }
                    className="p-1.5 bg-white rounded-full text-slate-400 hover:text-brand-600 shadow-sm border border-slate-100"
                    title="Save to Dictionary"
                  >
                    <BookmarkPlus size={14} />
                  </button>
                  <button
                    onClick={() => onPlayAudio(msg.id, msg.content, 'assistant_msg')}
                    disabled={audioLoadingId === `${msg.id}-assistant_msg`}
                    className="p-1.5 bg-white rounded-full text-slate-400 hover:text-brand-600 disabled:opacity-50 shadow-sm border border-slate-100"
                    title="Listen"
                  >
                    {audioLoadingId === `${msg.id}-assistant_msg` ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Volume2 size={14} />
                    )}
                  </button>
                </div>
              )}

              {/* Collapsible Translation */}
              {msg.role === 'assistant' && msg.storyTranslation && (
                <div className="mt-3 border-t border-slate-100 pt-2">
                  <button
                    onClick={() => toggleTranslation(msg.id)}
                    className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 hover:text-purple-600 transition-colors"
                  >
                    {expandedTranslations.has(msg.id) ? (
                      <>
                        Hide Translation <ChevronUp size={12} />
                      </>
                    ) : (
                      <>
                        Show Translation <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                  {expandedTranslations.has(msg.id) && (
                    <p className="text-sm text-slate-600 mt-2 italic animate-in fade-in slide-in-from-top-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {msg.storyTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Translator Result */}
          {msg.role === 'assistant' && msg.translation && (
            <TranslatorResult
              msg={msg}
              onSaveItem={onSaveItem}
              onPlayAudio={onPlayAudio}
              audioLoadingId={audioLoadingId}
            />
          )}

          {/* Assessment Card */}
          {msg.role === 'assistant' && msg.assessment && (
            <AssessmentCard
              msg={msg}
              chatMode={chatMode}
              isLastMessage={isLastMessage}
              isCollapsed={collapsedAssessments.has(msg.id)}
              onToggleDetails={() => toggleAssessmentDetails(msg.id)}
              onSaveItem={onSaveItem}
              onNextLesson={onNextLesson}
              onContinueStory={onContinueStory}
              onGenerateVideo={handleGenerateVideo}
              onPlayAudio={onPlayAudio}
              videoLoadingId={videoLoadingId}
              audioLoadingId={audioLoadingId}
              onReturnToModes={onReturnToModes}
            />
          )}
        </div>
      </div>
    </div>
  );
});

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  onUpdateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  onNextLesson: (direction: 'same' | 'harder' | 'easier') => void;
  isLoading: boolean;
  currentSituation?: string;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  onContinueStory?: (nextReply: string, nextReplyVietnamese?: string) => void;
  savedItems: SavedItem[];
  onSaveItem: (item: SavedItem) => void;
  currentLesson?: LessonContext | null;
  translationDirection?: 'VN_to_EN' | 'EN_to_VN';
  onToggleDirection?: () => void;
  onToggleSidebar?: () => void;
  onReturnToModes?: () => void;
  userName?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputText,
  setInputText,
  onSend,
  onUpdateMessage,
  onNextLesson,
  isLoading,
  currentSituation = 'General context',
  chatMode,
  setChatMode,
  onContinueStory,
  savedItems,
  onSaveItem,
  currentLesson,
  translationDirection = 'VN_to_EN',
  onToggleDirection,
  onToggleSidebar,
  onReturnToModes,
  userName,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [videoLoadingId, setVideoLoadingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedTranslations, setExpandedTranslations] = useState<Set<string>>(new Set());
  const [collapsedAssessments, setCollapsedAssessments] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<{
    text: string;
    context: string;
    x: number;
    y: number;
  } | null>(null);
  const [saveToast, setSaveToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const handleSaveItem = (item: SavedItem) => {
    onSaveItem(item);
    setSaveToast({ show: true, message: 'Saved to Dictionary' });
    setTimeout(() => setSaveToast({ show: false, message: '' }), 2000);
  };

  const isStoryWaiting =
    chatMode === 'story' &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    !!messages[messages.length - 1].assessment;

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0 && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        let node = sel.anchorNode;
        let contextText = '';
        while (
          node && node.nodeType === Node.ELEMENT_NODE
            ? !(node as Element).classList.contains('message-text-container')
            : true
        ) {
          if (node.parentElement) {
            node = node.parentElement;
          } else {
            break;
          }
        }
        if (node && (node as Element).classList.contains('message-text-container')) {
          contextText = (node as Element).textContent || '';
        }

        setSelection({
          text: sel.toString().trim(),
          context: contextText || sel.toString().trim(),
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      } else {
        setSelection(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: messages.length - 1,
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages.length, videoLoadingId, chatMode, isLoading, collapsedAssessments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleTranslation = (id: string) => {
    setExpandedTranslations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleAssessmentDetails = (id: string) => {
    setCollapsedAssessments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(inputText + (inputText ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const handleGenerateVideo = async (msg: ChatMessage) => {
    if (!msg.assessment) return;
    const phraseToAct =
      msg.assessment.betterAlternative || 
      msg.assessment.correction || 
      msg.assessment.alternativeTones?.conversational || 
      msg.assessment.alternativeTones?.formal || 
      msg.content;
    const situation = currentSituation;

    setVideoLoadingId(msg.id);
    try {
      const videoUrl = await generateScenarioVideo(situation, phraseToAct);
      onUpdateMessage(msg.id, {generatedVideoUrl: videoUrl});
    } catch (error) {
      alert('Failed to generate video. Please try again.');
    } finally {
      setVideoLoadingId(null);
    }
  };

  const handlePlayAudio = async (msgId: string, text: string, toneKey: string) => {
    const loadingKey = `${msgId}-${toneKey}`;
    setAudioLoadingId(loadingKey);
    try {
      const base64Audio = await generateNativeSpeech(text);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error(error);
      alert('Could not play audio.');
    } finally {
      setAudioLoadingId(null);
    }
  };

  const renderUserMessage = (msg: ChatMessage, nextMsg?: ChatMessage) => {
    const assessment = nextMsg?.role === 'assistant' ? nextMsg.assessment : undefined;

    if (!assessment?.improvements || assessment.improvements.length === 0) {
      return msg.content;
    }

    const text = msg.content;
    const matches: {start: number; end: number; improvement: Improvement}[] = [];

    assessment.improvements.forEach((imp) => {
      const lowerText = text.toLowerCase();
      const lowerImp = imp.original.toLowerCase();
      const idx = lowerText.indexOf(lowerImp);

      if (idx !== -1) {
        matches.push({
          start: idx,
          end: idx + imp.original.length,
          improvement: imp,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const uniqueMatches: typeof matches = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        uniqueMatches.push(m);
        lastEnd = m.end;
      }
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    uniqueMatches.forEach((m, i) => {
      if (m.start > lastIndex) {
        elements.push(<span key={`text-${i}`}>{text.substring(lastIndex, m.start)}</span>);
      }

      const isSaved = savedItems.some(
        (s) => s.original === m.improvement.original && s.correction === m.improvement.correction,
      );

      elements.push(
        <span
          key={`highlight-${i}`}
          className={`cursor-pointer border-b-2 ${m.improvement.type === 'grammar' ? 'border-rose-400 bg-rose-50/50 text-rose-700' : 'border-purple-400 bg-purple-50/50 text-purple-700'} px-0.5 rounded transition-all hover:bg-opacity-100 relative group/tooltip inline-block mx-0.5`}
          onClick={(e) => {
            e.stopPropagation();
            handleSaveItem({
              id: Date.now().toString() + i,
              original: m.improvement.original,
              correction: m.improvement.correction,
              type: m.improvement.type,
              context: text,
              timestamp: Date.now(),
              masteryScore: 0,
            });
          }}
        >
          {text.substring(m.start, m.end)}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-3 rounded-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
            <span className="block font-bold mb-1 text-emerald-400 flex items-center gap-1">
              {m.improvement.correction}
              {isSaved && <CheckCircle size={10} />}
            </span>
            {m.improvement.explanation}
            <span className="block mt-2 text-[10px] text-slate-400 uppercase font-bold border-t border-slate-700 pt-1">
              {isSaved ? 'Saved' : 'Click to Save'}
            </span>
          </span>
        </span>,
      );

      lastIndex = m.end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return <>{elements}</>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Text Selection Popover */}
      {selection && (
        <div
          className="fixed z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
          style={{
            left: selection.x,
            top: selection.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleSaveItem({
                id: Date.now().toString(),
                original: selection.text,
                correction: selection.text,
                type: 'vocabulary',
                context: selection.context,
                timestamp: Date.now(),
                masteryScore: 0,
              });
              window.getSelection()?.removeAllRanges();
              setSelection(null);
            }}
            className="flex items-center gap-1.5 text-xs font-medium hover:text-brand-300 transition-colors"
          >
            <BookmarkPlus size={14} />
            Save to Dictionary
          </button>
        </div>
      )}

      {/* Top Mode Switcher */}
      <ModeSwitcher
        chatMode={chatMode}
        setChatMode={setChatMode}
        onToggleSidebar={onToggleSidebar}
      />

      {/* Mobile Task Card (Roleplay Mode Only) */}
      {chatMode === 'roleplay' && currentLesson && (
        <div className="md:hidden px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ArrowRight size={12} className="text-brand-500" />
                Translate to {translationDirection === 'VN_to_EN' ? 'English' : 'Vietnamese'}
              </span>
              {onToggleDirection && (
                <button
                  onClick={onToggleDirection}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                >
                  <ArrowRightLeft size={14} />
                </button>
              )}
            </div>
            <p className="text-lg font-bold text-slate-800 leading-tight pr-8">
              "
              {translationDirection === 'VN_to_EN'
                ? currentLesson.vietnamesePhrase
                : currentLesson.englishPhrase}
              "
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          computeItemKey={(index, item) => item.id}
          className="h-full w-full scrollbar-hide"
          initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
          followOutput="smooth"
          components={{
            Header: () => (
              messages.length === 0 ? (
                <div className="text-center text-slate-400 mt-20 px-4">
                  {chatMode === 'roleplay' ? (
                    <p className="animate-in fade-in slide-in-from-bottom-4">
                      Listen to the context on the left and type your response to start.
                    </p>
                  ) : chatMode === 'story' ? (
                    <p className="animate-in fade-in slide-in-from-bottom-4">Setting the stage...</p>
                  ) : (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                      <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm">
                        <Languages size={32} />
                      </div>
                      <h3 className="font-bold text-slate-700 text-lg">Tone Translator</h3>
                      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                        Type any phrase to see it transformed into Formal, Friendly, Casual, and Native
                        tones.
                      </p>
                    </div>
                  )}
                </div>
              ) : <div className="h-6" />
            ),
            Footer: () => (
              <div className="pb-36 px-3 md:px-6">
                {isLoading && <LoadingBubble chatMode={chatMode} />}
                <div className="h-4" />
              </div>
            ),
            Item: ({ children, ...props }) => (
              <div {...props} className="px-3 md:px-6 py-4">
                {children}
              </div>
            )
          }}
          itemContent={(index, msg) => {
            const isLastMessage = index === messages.length - 1;

            return (
              <MessageItem
                msg={msg}
                index={index}
                isLastMessage={isLastMessage}
                messages={messages}
                chatMode={chatMode}
                savedItems={savedItems}
                audioLoadingId={audioLoadingId}
                videoLoadingId={videoLoadingId}
                expandedTranslations={expandedTranslations}
                collapsedAssessments={collapsedAssessments}
                onSaveItem={handleSaveItem}
                onPlayAudio={handlePlayAudio}
                toggleTranslation={toggleTranslation}
                toggleAssessmentDetails={toggleAssessmentDetails}
                onNextLesson={onNextLesson}
                onContinueStory={onContinueStory}
                handleGenerateVideo={handleGenerateVideo}
                onReturnToModes={onReturnToModes}
                userName={userName}
              />
            );
          }}
        />
      </div>

      {/* Input Area */}
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSend={onSend}
        onKeyDown={handleKeyDown}
        onMicClick={handleMicClick}
        isLoading={isLoading}
        isListening={isListening}
        isStoryWaiting={isStoryWaiting}
        chatMode={chatMode}
      />

      {/* Save Toast Notification */}
      {saveToast.show && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 size={16} className="text-emerald-400" />
            {saveToast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
