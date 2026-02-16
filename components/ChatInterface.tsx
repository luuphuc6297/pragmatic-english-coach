import React, { useRef, useEffect, useState } from 'react';
import { Send, Mic, User, Bot, AlertCircle, Video, Loader2, BookOpen, PenTool, Volume2, ArrowRight, TrendingUp, TrendingDown, RefreshCcw, Briefcase, Smile, Coffee, MessageCircle, Info, Languages, MessageSquare, ChevronDown, ChevronUp, Play, BarChart2 } from 'lucide-react';
import { ChatMessage, ChatMode } from '../types';
import RadarScore from './RadarScore';
import { generateScenarioVideo, generateNativeSpeech } from '../services/geminiService';

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
  onContinueStory?: (nextReply: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  inputText, 
  setInputText, 
  onSend, 
  onUpdateMessage,
  onNextLesson,
  isLoading,
  currentSituation = "General context",
  chatMode,
  setChatMode,
  onContinueStory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [videoLoadingId, setVideoLoadingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedTranslations, setExpandedTranslations] = useState<Set<string>>(new Set());
  
  // CHANGED: Use 'collapsedAssessments' instead of 'expanded' to show details by default
  const [collapsedAssessments, setCollapsedAssessments] = useState<Set<string>>(new Set());

  const isStoryWaiting = chatMode === 'story' && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !!messages[messages.length - 1].assessment;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, videoLoadingId, chatMode, isLoading, collapsedAssessments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleTranslation = (id: string) => {
      setExpandedTranslations(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  };

  const toggleAssessmentDetails = (id: string) => {
      setCollapsedAssessments(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition is not supported in this browser. Try Chrome.");
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
    const phraseToAct = msg.assessment.betterAlternative || msg.assessment.correction || msg.content;
    const situation = currentSituation;

    setVideoLoadingId(msg.id);
    try {
        const videoUrl = await generateScenarioVideo(situation, phraseToAct);
        onUpdateMessage(msg.id, { generatedVideoUrl: videoUrl });
    } catch (error) {
        alert("Failed to generate video. Please try again.");
    } finally {
        setVideoLoadingId(null);
    }
  };

  const handlePlayAudio = async (msgId: string, text: string, toneKey: string) => {
      const loadingKey = `${msgId}-${toneKey}`;
      setAudioLoadingId(loadingKey);
      try {
        const base64Audio = await generateNativeSpeech(text);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
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
          alert("Could not play audio.");
      } finally {
          setAudioLoadingId(null);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Top Mode Switcher */}
      <div className="flex-none px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex justify-start md:justify-center gap-2 shadow-sm z-10 overflow-x-auto no-scrollbar touch-pan-x">
          <button 
            onClick={() => setChatMode('roleplay')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                chatMode === 'roleplay' 
                ? 'bg-brand-50 text-brand-600 border border-brand-200 ring-2 ring-brand-100 ring-offset-1' 
                : 'text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-300'
            }`}
          >
              <MessageSquare size={14} />
              Roleplay
          </button>
           <button 
            onClick={() => setChatMode('story')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                chatMode === 'story' 
                ? 'bg-purple-50 text-purple-600 border border-purple-200 ring-2 ring-purple-100 ring-offset-1' 
                : 'text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-300'
            }`}
          >
              <BookOpen size={14} />
              Story Mode
          </button>
          <button 
            onClick={() => setChatMode('translator')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                chatMode === 'translator' 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 ring-2 ring-indigo-100 ring-offset-1' 
                : 'text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-300'
            }`}
          >
              <Languages size={14} />
              Translator
          </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-8 scrollbar-hide pb-36"
      >
        {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-20 px-4">
                {chatMode === 'roleplay' ? (
                    <p className="animate-in fade-in slide-in-from-bottom-4">Listen to the context on the left and type your response to start.</p>
                ) : chatMode === 'story' ? (
                    <p className="animate-in fade-in slide-in-from-bottom-4">Setting the stage...</p>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm">
                            <Languages size={32} />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">Tone Translator</h3>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">Type any phrase to see it transformed into Formal, Friendly, Casual, and Native tones.</p>
                    </div>
                )}
            </div>
        )}

        {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;

            return (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* CHANGED: Increased Max Width for Desktop to 90% */}
            <div className={`flex w-full md:max-w-[90%] lg:max-w-[90%] xl:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 md:gap-3`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm mt-1 ring-2 ring-white ${
                msg.role === 'user' 
                    ? 'bg-slate-800 text-white' 
                    : chatMode === 'translator' 
                        ? 'bg-indigo-600 text-white' 
                    : chatMode === 'story'
                        ? 'bg-purple-600 text-white'
                        : 'bg-emerald-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Content Wrapper */}
              <div className="flex flex-col gap-2 min-w-0 max-w-full flex-1">
                
                {/* Text Bubble */}
                {msg.content && (
                    <div className={`px-4 py-3 md:px-6 md:py-4 rounded-2xl text-[15px] md:text-base shadow-sm break-words leading-relaxed ${
                    msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-sm ml-auto' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                    }`}>
                        {msg.content}
                        
                        {/* Collapsible Translation */}
                        {msg.role === 'assistant' && msg.storyTranslation && (
                            <div className="mt-3 border-t border-slate-100 pt-2">
                                <button 
                                    onClick={() => toggleTranslation(msg.id)}
                                    className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 hover:text-purple-600 transition-colors"
                                >
                                    {expandedTranslations.has(msg.id) ? (
                                        <>Hide Translation <ChevronUp size={12} /></>
                                    ) : (
                                        <>Show Translation <ChevronDown size={12} /></>
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

                {/* TRANSLATOR RESULT */}
                {msg.role === 'assistant' && msg.translation && (
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-indigo-100 w-full animate-in slide-in-from-left-2 fade-in">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600 pb-2 border-b border-indigo-50">
                             <Languages size={18} />
                             <span className="font-bold text-sm uppercase tracking-wide">Variations</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                             {Object.entries(msg.translation.tones).map(([key, text]) => {
                                 let Icon = MessageCircle;
                                 let colorClass = "text-slate-600";
                                 let bgClass = "bg-slate-50/50";
                                 let label = key;

                                 if (key === 'formal') { Icon = Briefcase; colorClass = "text-indigo-600"; bgClass = "bg-indigo-50/30 hover:bg-indigo-50"; label = "Formal"; }
                                 if (key === 'friendly') { Icon = Smile; colorClass = "text-amber-600"; bgClass = "bg-amber-50/30 hover:bg-amber-50"; label = "Friendly"; }
                                 if (key === 'informal') { Icon = Coffee; colorClass = "text-pink-600"; bgClass = "bg-pink-50/30 hover:bg-pink-50"; label = "Casual"; }
                                 if (key === 'conversational') { Icon = MessageCircle; colorClass = "text-emerald-600"; bgClass = "bg-emerald-50/30 hover:bg-emerald-50"; label = "Neutral"; }

                                 return (
                                     <div key={key} className={`p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all ${bgClass}`}>
                                         <div className="flex items-center justify-between mb-2">
                                             <div className={`flex items-center gap-2 text-xs font-bold ${colorClass} uppercase tracking-wider`}>
                                                 <Icon size={14} /> {label}
                                             </div>
                                             <button 
                                                onClick={() => handlePlayAudio(msg.id, text as string, key)}
                                                disabled={audioLoadingId === `${msg.id}-${key}`}
                                                className="p-1.5 rounded-full bg-white text-slate-400 hover:text-brand-600 hover:shadow-sm transition-all disabled:opacity-50"
                                                title="Play Audio"
                                             >
                                                 {audioLoadingId === `${msg.id}-${key}` ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={16} />}
                                             </button>
                                         </div>
                                         <p className="text-slate-800 font-medium text-base leading-relaxed">{text as string}</p>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                )}

                {/* ASSESSMENT CARD */}
                {msg.role === 'assistant' && msg.assessment && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full animate-in slide-in-from-left-2 fade-in ring-1 ring-slate-100">
                    
                    {/* 1. HEADER & SUMMARY */}
                    <div className="p-4 md:p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                {/* Score Circle */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-sm border-2 ${
                                    msg.assessment.score >= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    msg.assessment.score >= 5 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                    {msg.assessment.score}
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 leading-tight">Assessment</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                                             msg.assessment.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                                             msg.assessment.score >= 5 ? 'bg-amber-100 text-amber-700' :
                                             'bg-rose-100 text-rose-700'
                                        }`}>
                                            {msg.assessment.score >= 8 ? 'Excellent' : msg.assessment.score >= 5 ? 'Good Effort' : 'Improvement Needed'}
                                        </span>
                                        {/* Tone Badge */}
                                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 uppercase">
                                            {msg.assessment.userTone || 'Neutral'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="mb-4">
                            <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                                {msg.assessment.feedback}
                            </p>
                        </div>

                        {/* Correction (Highlighted) */}
                        {(msg.assessment.correction || msg.assessment.betterAlternative) && (
                            <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100/80 flex gap-3">
                                <div className="mt-0.5 shrink-0"><AlertCircle size={18} className="text-orange-500"/></div>
                                <div>
                                    <span className="text-[10px] font-bold text-orange-600 uppercase block mb-0.5 tracking-wider">Better Way to Say It</span>
                                    <p className="text-slate-900 font-medium text-sm">
                                        {msg.assessment.correction || msg.assessment.betterAlternative}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. ACCORDION TRIGGER */}
                    <button 
                        onClick={() => toggleAssessmentDetails(msg.id)}
                        className="w-full px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700">
                            <BarChart2 size={14} />
                            <span>Detailed Metrics</span>
                        </div>
                        {/* CHANGED: Logic inverted because default is expanded */}
                        {!collapsedAssessments.has(msg.id) 
                            ? <ChevronUp size={16} className="text-slate-400"/> 
                            : <ChevronDown size={16} className="text-slate-400"/>
                        }
                    </button>

                    {/* 3. EXPANDED DETAILS (DEFAULT SHOW) */}
                    {!collapsedAssessments.has(msg.id) && (
                        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 fade-in">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                                {/* Radar Chart */}
                                <div className="h-48 w-full bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                                    <RadarScore assessment={msg.assessment} />
                                </div>

                                {/* Grammar & Vocab Cards */}
                                <div className="space-y-3">
                                    {/* Grammar */}
                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-50">
                                            <PenTool size={14} className="text-blue-500" />
                                            <span className="text-xs font-bold text-blue-700 uppercase">Grammar</span>
                                        </div>
                                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                                            {msg.assessment.grammarAnalysis}
                                        </p>
                                    </div>

                                    {/* Vocab */}
                                    <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-50">
                                            <BookOpen size={14} className="text-purple-500" />
                                            <span className="text-xs font-bold text-purple-700 uppercase">Vocabulary</span>
                                        </div>
                                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                                            {msg.assessment.vocabularyAnalysis}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tone Variations */}
                            {msg.assessment.alternativeTones && (
                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info size={14} className="text-slate-400" />
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tone Variations</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { key: 'formal', icon: Briefcase, color: 'text-indigo-600', bg: 'hover:border-indigo-200 hover:bg-indigo-50', label: 'Formal' },
                                            { key: 'conversational', icon: MessageCircle, color: 'text-emerald-600', bg: 'hover:border-emerald-200 hover:bg-emerald-50', label: 'Neutral' },
                                            { key: 'friendly', icon: Smile, color: 'text-amber-600', bg: 'hover:border-amber-200 hover:bg-amber-50', label: 'Friendly' },
                                            { key: 'informal', icon: Coffee, color: 'text-pink-600', bg: 'hover:border-pink-200 hover:bg-pink-50', label: 'Casual' }
                                        ].map((tone) => (
                                            <div key={tone.key} className={`p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-all group ${tone.bg}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${tone.color} uppercase`}>
                                                        <tone.icon size={12} /> {tone.label}
                                                    </div>
                                                    <button 
                                                        onClick={() => handlePlayAudio(msg.id, (msg.assessment!.alternativeTones as any)[tone.key], tone.key)}
                                                        disabled={audioLoadingId === `${msg.id}-${tone.key}`}
                                                        className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-full text-slate-400 hover:text-brand-600 disabled:opacity-50 shadow-sm border border-slate-100"
                                                    >
                                                        {audioLoadingId === `${msg.id}-${tone.key}` ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={14} />}
                                                    </button>
                                                </div>
                                                <p className="text-sm text-slate-700">"{(msg.assessment!.alternativeTones as any)[tone.key]}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* 4. ACTIONS */}
                    {chatMode !== 'translator' && (
                    <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex flex-col gap-4">
                        
                        {/* Video Button */}
                        <div>
                            {msg.generatedVideoUrl ? (
                                 <div className="rounded-xl overflow-hidden border border-slate-200 bg-black shadow-md">
                                     <div className="bg-slate-900 text-white text-[10px] py-2 px-3 font-bold uppercase flex items-center gap-2">
                                         <Video size={12} /> Generated Context Video
                                     </div>
                                     <video 
                                        src={msg.generatedVideoUrl} 
                                        controls 
                                        className="w-full aspect-video object-cover" 
                                        autoPlay 
                                        loop 
                                     />
                                 </div>
                            ) : (
                                <button
                                    onClick={() => handleGenerateVideo(msg)}
                                    disabled={videoLoadingId === msg.id}
                                    className="w-full py-3 bg-slate-50 hover:bg-slate-800 hover:text-white text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-slate-200 hover:border-slate-800"
                                >
                                    {videoLoadingId === msg.id ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
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
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                                >
                                    <TrendingDown size={20} className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-700 uppercase tracking-tight">Easier</span>
                                </button>
                                <button 
                                    onClick={() => onNextLesson('same')}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all group shadow-sm"
                                >
                                    <RefreshCcw size={20} className="text-brand-500 mb-1 group-hover:rotate-180 transition-transform duration-500" />
                                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-tight">New One</span>
                                </button>
                                <button 
                                    onClick={() => onNextLesson('harder')}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all group"
                                >
                                    <TrendingUp size={20} className="text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-rose-700 uppercase tracking-tight">Harder</span>
                                </button>
                            </div>
                        )}
                         
                         {/* Story Continue Options */}
                         {chatMode === 'story' && isLastMessage && (
                             <div className="flex flex-col gap-3">
                                 <button 
                                     onClick={() => onContinueStory && msg.assessment?.nextAgentReply && onContinueStory(msg.assessment.nextAgentReply)}
                                     className="w-full py-4 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transform transition-all active:scale-[0.98]"
                                 >
                                     <Play size={18} fill="currentColor" /> Continue Conversation
                                 </button>
                                 <button 
                                     onClick={() => onNextLesson('same')}
                                     className="w-full py-3 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                                 >
                                     End & Start New Story
                                 </button>
                             </div>
                         )}
                    </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )})}
        
        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex w-full justify-start animate-in fade-in zoom-in-95 duration-300">
            <div className="flex max-w-[85%] flex-row gap-3">
              <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mt-1 animate-pulse ${
                chatMode === 'translator' 
                    ? 'bg-indigo-500 text-white' 
                : chatMode === 'story'
                    ? 'bg-purple-500 text-white'
                    : 'bg-emerald-500 text-white'
              }`}>
                <Bot size={18} />
              </div>
              <div className="bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                 <span className="text-xs text-slate-400 font-bold mr-2 uppercase tracking-wider">Analysis in progress</span>
                 <div className="flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${chatMode === 'translator' ? 'bg-indigo-400' : chatMode === 'story' ? 'bg-purple-400' : 'bg-brand-400'}`} style={{ animationDelay: '0ms'}}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${chatMode === 'translator' ? 'bg-indigo-400' : chatMode === 'story' ? 'bg-purple-400' : 'bg-brand-400'}`} style={{ animationDelay: '150ms'}}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${chatMode === 'translator' ? 'bg-indigo-400' : chatMode === 'story' ? 'bg-purple-400' : 'bg-brand-400'}`} style={{ animationDelay: '300ms'}}></div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed Sticky Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-3 py-3 md:px-4 md:py-4 z-20 transition-all">
        <div className="max-w-4xl mx-auto">
            {/* Input Container */}
            <div className={`flex items-center gap-2 bg-slate-100 p-1.5 rounded-[2rem] border border-transparent focus-within:border-slate-200 focus-within:ring-2 focus-within:bg-white transition-all shadow-sm ${
                chatMode === 'translator' ? 'focus-within:ring-indigo-500/30 focus-within:border-indigo-500' 
                : chatMode === 'story' ? 'focus-within:ring-purple-500/30 focus-within:border-purple-500' 
                : 'focus-within:ring-brand-500/30 focus-within:border-brand-500'
            }`}>
              <button 
                onClick={handleMicClick}
                disabled={isStoryWaiting}
                className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                    isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                    : isStoryWaiting ? 'text-slate-300' : 'text-slate-400 hover:text-brand-600 hover:bg-white'
                }`}
                title="Voice Input"
              >
                <Mic size={22} />
              </button>
              
              <input
                type="text"
                autoFocus={false}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                    isStoryWaiting ? "Review the AI's feedback above to continue..." :
                    chatMode === 'translator' ? "Enter text to translate..." 
                    : chatMode === 'story' ? "Type your reply..." 
                    : "Type your answer..."
                }
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-2 py-3 text-base text-slate-800 placeholder-slate-400 min-w-0"
                disabled={isLoading || isStoryWaiting}
              />
              
              <button 
                onClick={onSend}
                disabled={!inputText.trim() || isLoading || isStoryWaiting}
                className={`p-3 text-white rounded-full shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 flex-shrink-0 ${
                    chatMode === 'translator' ? 'bg-indigo-600 hover:bg-indigo-700'
                    : chatMode === 'story' ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;