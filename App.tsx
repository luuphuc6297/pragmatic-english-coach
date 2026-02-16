import React, { useState, useEffect, useMemo } from 'react';
import { LESSON_SCENARIOS } from './constants';
import { ChatMessage, LessonContext, UserPreferences, CEFRLevel, ChatMode, StoryScenario } from './types';
import ChatInterface from './components/ChatInterface';
import ProgressiveHint from './components/ProgressiveHint';
import Onboarding from './components/Onboarding';
import UserProfile from './components/UserProfile';
import { evaluateResponse, generateNextLesson, generateToneTranslations, generateStoryScenario, evaluateStoryTurn } from './services/geminiService';
import { Menu, MessageSquareQuote, Loader2, Sparkles, CheckCircle, TrendingUp, Activity, Settings, ArrowLeft, RotateCcw, ArrowRightLeft, BookOpen, MessageSquare, Languages, ChevronRight, Hash, User, MapPin, Briefcase, Plane, Coffee, Heart, Globe, GraduationCap, Gavel, Stethoscope, ShoppingBag, Music, TreePine, Banknote, Home, Dumbbell, Clapperboard, Monitor, Zap } from 'lucide-react';

const App = () => {
  // --- STATE INITIALIZATION WITH LOCAL STORAGE ---
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('pec_hasOnboarded') === 'true';
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(() => {
    const saved = localStorage.getItem('pec_userPreferences');
    return saved ? JSON.parse(saved) : null;
  });

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('pec_completedLessons');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [scoreHistory, setScoreHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem('pec_scoreHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [generatedLessons, setGeneratedLessons] = useState<LessonContext[]>([]);
  const [currentStory, setCurrentStory] = useState<StoryScenario | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For grading/responses
  const [isGenerating, setIsGenerating] = useState(false); // For new lesson/story generation
  const [hintLevel, setHintLevel] = useState(0);
  const [chatMode, setChatMode] = useState<ChatMode>('roleplay');
  
  // State to track if the user has actually started a session (selected a mode)
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const isInfiniteMode = true;
  const [translationDirection, setTranslationDirection] = useState<'VN_to_EN' | 'EN_to_VN'>('VN_to_EN');
  const [tempDifficultyOverride, setTempDifficultyOverride] = useState<CEFRLevel | null>(null);

  const activeLessonPool = generatedLessons.length > 0 ? generatedLessons : [];
  const safeIndex = currentLessonIndex % (activeLessonPool.length || 1);
  const currentLesson = activeLessonPool.length > 0 ? activeLessonPool[safeIndex] : null;
  
  const averageScore = scoreHistory.length > 0 
    ? (scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length).toFixed(1) 
    : '0.0';

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('pec_hasOnboarded', hasOnboarded.toString());
  }, [hasOnboarded]);

  useEffect(() => {
    if (userPreferences) {
      localStorage.setItem('pec_userPreferences', JSON.stringify(userPreferences));
    }
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem('pec_completedLessons', JSON.stringify([...completedLessons]));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('pec_scoreHistory', JSON.stringify(scoreHistory));
  }, [scoreHistory]);


  // --- HANDLERS ---

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    setHasOnboarded(true);
    setCurrentLessonIndex(0);
    setTempDifficultyOverride(null);
  };

  const handleUpdateProfile = (newPrefs: UserPreferences) => {
      setUserPreferences(newPrefs);
      // If level changed, we might want to reset temp override
      if (newPrefs.level !== userPreferences?.level) {
          setTempDifficultyOverride(null);
      }
  };

  const triggerLessonGeneration = async (level: CEFRLevel, topics: string[], direction: 'same' | 'harder' | 'easier') => {
      setIsGenerating(true);
      try {
          const prevTitles = generatedLessons.map(l => l.title);
          const newLesson = await generateNextLesson(
              prevTitles, 
              level,
              topics
          );
          setGeneratedLessons(prev => [...prev, newLesson]);
          if (generatedLessons.length > 0) {
              setCurrentLessonIndex(prev => prev + 1);
          }
      } catch (e) {
          console.error("Failed to generate initial lesson", e);
      } finally {
          setIsGenerating(false);
      }
  };

  const triggerStoryGeneration = async () => {
      if (!userPreferences) return;
      setIsGenerating(true);
      try {
          const topic = userPreferences.topics[Math.floor(Math.random() * userPreferences.topics.length)];
          const level = tempDifficultyOverride || userPreferences.level;
          const story = await generateStoryScenario(level, topic);
          setCurrentStory(story);
          
          const openingMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: story.openingLine,
              storyTranslation: story.openingLineVietnamese,
              timestamp: Date.now()
          };
          setMessages([openingMsg]);

      } catch (e) {
          console.error("Failed to generate story", e);
      } finally {
          setIsGenerating(false);
      }
  };

  // Main Entry Point for Modes
  const handleStartMode = async (mode: ChatMode) => {
      setChatMode(mode);
      setSessionStarted(true);
      setMessages([]);
      setInputText('');
      setHintLevel(0);

      if (mode === 'roleplay') {
          // Check if we already have a lesson to avoid re-generating on quick switches
          if (generatedLessons.length === 0) {
            await triggerLessonGeneration(
                userPreferences?.level || 'A1-A2', 
                userPreferences?.topics || ['General'], 
                'same'
            );
          }
      } else if (mode === 'story') {
          // Check if we already have a story
          if (!currentStory) {
            await triggerStoryGeneration();
          }
      } 
      // Translator mode needs no initial generation
  };

  // Handle in-app mode switching (Tabs)
  const handleModeSwitch = async (mode: ChatMode) => {
      // Just redirect to the start logic, logic inside handles caching check
      await handleStartMode(mode);
  };

  const handleResetSettings = () => {
    // Clear everything
    localStorage.removeItem('pec_hasOnboarded');
    localStorage.removeItem('pec_userPreferences');
    localStorage.removeItem('pec_completedLessons');
    localStorage.removeItem('pec_scoreHistory');
    
    setHasOnboarded(false);
    setSessionStarted(false);
    setMessages([]);
    setInputText('');
    setGeneratedLessons([]);
    setTempDifficultyOverride(null);
    setCurrentStory(null);
    setCompletedLessons(new Set());
    setScoreHistory([]);
    setUserPreferences(null);
  };

  const handleToggleDirection = () => {
      setTranslationDirection(prev => prev === 'VN_to_EN' ? 'EN_to_VN' : 'VN_to_EN');
  };

  const handleContinueStory = (nextReply: string) => {
      const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: nextReply,
          timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
        if (chatMode === 'translator') {
            const translations = await generateToneTranslations(userMsg.content);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Here are 4 ways to say that:",
                translation: translations,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, aiMsg]);

        } else if (chatMode === 'story') {
            if (!currentStory) return;
            const lastAgentMsg = messages.filter(m => m.role === 'assistant').pop()?.content || currentStory.openingLine;
            const result = await evaluateStoryTurn(currentStory, lastAgentMsg, userMsg.content);
            
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "", 
                assessment: result, 
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, aiMsg]);
             setScoreHistory(prev => [...prev, result.score]);

        } else {
            if (!currentLesson) return;
            const result = await evaluateResponse(userMsg.content, currentLesson, translationDirection);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Here is my evaluation of your response:",
                assessment: result,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setScoreHistory(prev => [...prev, result.score]);
            if (!completedLessons.has(currentLesson.id)) {
                setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
            }
        }
    } catch (error) {
        console.error("Error processing message", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const getNextLevel = (current: CEFRLevel, direction: 'harder' | 'easier'): CEFRLevel => {
      const levels: CEFRLevel[] = ['A1-A2', 'B1-B2', 'C1-C2'];
      const idx = levels.indexOf(current);
      if (idx === -1) return current;
      
      if (direction === 'harder') {
          return idx < levels.length - 1 ? levels[idx + 1] : levels[levels.length - 1];
      } else {
          return idx > 0 ? levels[idx - 1] : levels[0];
      }
  };

  const handleNextLesson = async (direction: 'same' | 'harder' | 'easier' = 'same') => {
    setMessages([]);
    setHintLevel(0);
    setInputText('');
    
    let nextDifficulty = tempDifficultyOverride || userPreferences?.level || 'A1-A2';
    if (direction !== 'same') {
        nextDifficulty = getNextLevel(nextDifficulty, direction);
        setTempDifficultyOverride(nextDifficulty); 
    }

    if (chatMode === 'story') {
        await triggerStoryGeneration();
    } else {
        // Only trigger if we are in Roleplay. If we are in translator, we don't need to generate.
        if (chatMode === 'roleplay') {
             await triggerLessonGeneration(nextDifficulty, userPreferences?.topics || ['General'], direction);
        }
    }
  };

  // Helper: Get Icon for Topic
  const getTopicConfig = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes('business') || t.includes('work')) return { icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    if (t.includes('travel') || t.includes('survival')) return { icon: Plane, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    if (t.includes('food') || t.includes('dining')) return { icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    if (t.includes('social') || t.includes('love')) return { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' };
    if (t.includes('tech')) return { icon: Monitor, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    if (t.includes('medical')) return { icon: Stethoscope, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (t.includes('shopping')) return { icon: ShoppingBag, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' };
    if (t.includes('music') || t.includes('entertainment')) return { icon: Music, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' };
    if (t.includes('environment')) return { icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (t.includes('finance')) return { icon: Banknote, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    if (t.includes('legal')) return { icon: Gavel, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
    if (t.includes('education')) return { icon: GraduationCap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    if (t.includes('sport')) return { icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    
    return { icon: Globe, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/30' };
  };

  const getDifficultyColor = (level: string) => {
      if (level === 'A1-A2') return 'bg-emerald-500 text-white shadow-emerald-500/20';
      if (level === 'B1-B2') return 'bg-amber-500 text-white shadow-amber-500/20';
      return 'bg-rose-500 text-white shadow-rose-500/20';
  };

  // RENDER: Onboarding
  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // RENDER: Mode Selection (After Onboarding, Before Session Start)
  if (!sessionStarted) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-slate-900 p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />
              
              <div className="max-w-4xl w-full z-10 text-center">
                  <div className="flex flex-col items-center mb-8">
                       <h1 className="text-3xl font-bold mb-2">Welcome back, {userPreferences?.name}</h1>
                       <p className="text-slate-400">Choose a mode to continue your journey.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Roleplay Coach Card */}
                      <button 
                          onClick={() => handleStartMode('roleplay')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-64"
                      >
                          <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                              <MessageSquareQuote size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Scenario Coach</h3>
                          <p className="text-sm text-slate-400 mb-4 flex-1">
                              Practice specific situations (e.g., "Ordering Coffee") with AI grading your grammar and naturalness.
                          </p>
                          <div className="flex items-center text-brand-400 text-sm font-bold uppercase tracking-wider">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>

                      {/* Story Mode Card */}
                      <button 
                          onClick={() => handleStartMode('story')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-64"
                      >
                           <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                              <BookOpen size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Story Mode</h3>
                          <p className="text-sm text-slate-400 mb-4 flex-1">
                              Immerse yourself in a continuous roleplay conversation. The AI adapts to your replies dynamically.
                          </p>
                          <div className="flex items-center text-purple-400 text-sm font-bold uppercase tracking-wider">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>

                      {/* Translator Card */}
                      <button 
                          onClick={() => handleStartMode('translator')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-64"
                      >
                           <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <Languages size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Tone Translator</h3>
                          <p className="text-sm text-slate-400 mb-4 flex-1">
                              Input any sentence and see it transformed into Formal, Friendly, Informal, and Native tones.
                          </p>
                          <div className="flex items-center text-indigo-400 text-sm font-bold uppercase tracking-wider">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>
                  </div>
                  
                   <div className="mt-10 flex gap-4 justify-center">
                        <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 transition-all">
                             <User size={16} /> Edit Profile
                        </button>
                        <button onClick={handleResetSettings} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-rose-500 transition-all">
                             <RotateCcw size={16} /> Reset All Data
                        </button>
                   </div>
              </div>

               {/* Profile Modal */}
               {showProfile && userPreferences && (
                <UserProfile 
                    preferences={userPreferences}
                    stats={{
                        lessonsCompleted: completedLessons.size,
                        averageScore: averageScore,
                        totalMessages: messages.length // Rough estimate, typically stored separately
                    }}
                    onClose={() => setShowProfile(false)}
                    onSave={handleUpdateProfile}
                />
               )}
          </div>
      );
  }

  // RENDER: Loading State (Generating Content)
  if (isGenerating && (!currentLesson || (chatMode === 'story' && !currentStory))) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
            <Loader2 className="animate-spin text-brand-400" size={48} />
            <div className="text-center">
                <h2 className="text-xl font-bold">
                    {chatMode === 'story' ? 'Preparing Scenario' : 'Designing Lesson'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                    {chatMode === 'story' ? 'Setting the scene for you...' : 'Crafting a realistic situation...'}
                </p>
            </div>
        </div>
      );
  }

  // RENDER: Main App Interface
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden relative">
      
      {/* Profile Modal Layer */}
      {showProfile && userPreferences && (
        <UserProfile 
            preferences={userPreferences}
            stats={{
                lessonsCompleted: completedLessons.size,
                averageScore: averageScore,
                totalMessages: messages.length 
            }}
            onClose={() => setShowProfile(false)}
            onSave={handleUpdateProfile}
        />
       )}

      {/* LEFT: Context & Visual Area */}
      {/* Changed Width to 40% (4/10 ratio) as requested */}
      <div className="hidden md:flex md:w-[40%] flex-col bg-slate-900 border-r border-slate-800">
        
        {/* Header with Stats & Back Button */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setSessionStarted(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
                    title="Back to Mode Selection"
                >
                    <ArrowLeft size={18} />
                </button>
                {/* User Profile Trigger */}
                <button 
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 text-white font-bold tracking-tight hover:bg-slate-800 py-1 px-2 rounded-lg transition-colors group"
                >
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[10px] uppercase text-white">
                        {userPreferences?.name?.slice(0, 2) || 'ME'}
                    </div>
                    <span className="group-hover:text-brand-400 transition-colors">{userPreferences?.name}</span>
                </button>
            </div>
            
            {/* Stats Widget */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                    <Activity size={14} className="text-brand-400" />
                    <span className="text-xs font-medium text-slate-300">
                        Avg: <span className="text-white font-bold">{averageScore}</span>
                    </span>
                </div>
            </div>
        </div>

        {/* COMPACT CONTEXT CARD (Replaced Huge Abstract Card) */}
        <div className="px-6 pt-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
                 {/* Background decorative elements */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

                 {/* Content based on Mode */}
                 {chatMode === 'roleplay' && currentLesson ? (
                     <div className="relative z-10">
                         {/* Header: Topic & Level */}
                        <div className="flex items-start justify-between mb-4">
                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTopicConfig(currentLesson.topic).bg} ${getTopicConfig(currentLesson.topic).border}`}>
                                {React.createElement(getTopicConfig(currentLesson.topic).icon, { size: 16, className: getTopicConfig(currentLesson.topic).color })}
                                <span className={`text-xs font-bold uppercase tracking-wider ${getTopicConfig(currentLesson.topic).color}`}>
                                    {currentLesson.topic}
                                </span>
                             </div>
                             
                             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg ${getDifficultyColor(currentLesson.difficulty)}`}>
                                 <Zap size={12} fill="currentColor" />
                                 <span className="text-[10px] font-black">{currentLesson.difficulty}</span>
                            </div>
                        </div>
                        
                        {/* Main Title */}
                        <div className="mb-4">
                             <h2 className="text-2xl font-black text-white leading-tight tracking-tight line-clamp-2">
                                {currentLesson.title}
                            </h2>
                        </div>

                        {/* Footer: Meta Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                             <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                                 <MessageSquareQuote size={14} /> 
                                 Scenario #{safeIndex + 1}
                             </span>
                             {completedLessons.has(currentLesson.id) && (
                                 <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                     <CheckCircle size={14} /> Completed
                                 </span>
                             )}
                        </div>
                     </div>
                 ) : chatMode === 'story' && currentStory ? (
                    <div className="relative z-10">
                         {/* Header: Topic & Level */}
                        <div className="flex items-start justify-between mb-4">
                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTopicConfig(currentStory.topic).bg} ${getTopicConfig(currentStory.topic).border}`}>
                                {React.createElement(getTopicConfig(currentStory.topic).icon, { size: 16, className: getTopicConfig(currentStory.topic).color })}
                                <span className={`text-xs font-bold uppercase tracking-wider ${getTopicConfig(currentStory.topic).color}`}>
                                    {currentStory.topic}
                                </span>
                             </div>
                             
                             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg ${getDifficultyColor(currentStory.difficulty)}`}>
                                 <Zap size={12} fill="currentColor" />
                                 <span className="text-[10px] font-black">{currentStory.difficulty}</span>
                            </div>
                        </div>

                        {/* Agent Info */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-purple-500/50 flex items-center justify-center shrink-0 relative">
                                <User className="text-slate-300" size={28} />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800" title="Online"></div>
                            </div>
                            <div>
                                <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Speaking With</span>
                                <h2 className="text-2xl font-black text-white leading-none">
                                    {currentStory.agentName}
                                </h2>
                            </div>
                        </div>
                        
                         {/* Footer: Meta Info */}
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
                 ) : (
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                <Languages size={24} />
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-indigo-900/30 border border-indigo-500/20">
                                <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Tool</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white leading-tight">Tone Translator</h2>
                            <p className="text-sm text-slate-400 mt-1">Explore nuance, formality, and cultural context.</p>
                        </div>
                    </div>
                 )}
            </div>
        </div>

        {/* Context Details - SWITCH BASED ON MODE */}
        <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-y-auto">
            
            {/* TRANSLATOR MODE PANEL */}
            {chatMode === 'translator' && (
                <div className="text-center mt-4">
                    <h2 className="text-indigo-400 font-bold text-xl mb-2">Tone & Nuance Translator</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Enter any sentence in English or Vietnamese. The AI will translate it and provide 4 pragmatic variations: Formal, Friendly, Casual, and Neutral.
                    </p>
                </div>
            )}

            {/* STORY MODE PANEL */}
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
                            onRequestHint={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                            onResetHint={() => setHintLevel(0)}
                        />
                    </div>
                </>
            )}
            
            {/* ROLEPLAY MODE PANEL */}
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
                                    onClick={handleToggleDirection}
                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                                    title="Swap Language"
                                >
                                    <ArrowRightLeft size={14} />
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                    "{translationDirection === 'VN_to_EN' ? currentLesson.vietnamesePhrase : currentLesson.englishPhrase}"
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <ProgressiveHint 
                            hints={currentLesson.hints} 
                            currentLevel={hintLevel} 
                            onRequestHint={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                            onResetHint={() => setHintLevel(0)}
                        />
                    </div>
                </>
            )}

            {/* Bottom Controls */}
            {chatMode !== 'translator' && (
            <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-800 shrink-0">
                <span className="text-slate-500 text-xs">
                    {chatMode === 'story' ? 'Conversational AI' : `Scenario ${safeIndex + 1}`}
                </span>
                <button 
                    onClick={() => handleNextLesson('same')}
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

      {/* RIGHT: Chat Interface */}
      {/* Takes remaining space (flex-1), effectively ~60% */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        <div className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
             <div className="flex items-center gap-2">
                 <button onClick={() => setSessionStarted(false)} className="p-1 -ml-2 text-slate-500">
                     <ArrowLeft size={20} />
                 </button>
                 <div className="flex flex-col">
                     <span className="font-bold text-slate-800 truncate text-sm w-40">
                         {isGenerating ? 'Loading...' : (chatMode === 'story' ? currentStory?.topic : chatMode === 'roleplay' ? currentLesson?.title : 'Translator')}
                     </span>
                     <span className="text-[10px] text-slate-500">Avg: {averageScore}</span>
                 </div>
             </div>
             {chatMode !== 'translator' && (
             <button 
                onClick={() => handleNextLesson('same')} 
                disabled={isGenerating}
                className="text-xs font-bold text-brand-600 px-3 py-1 bg-brand-50 rounded-full"
             >
                 Next
             </button>
             )}
        </div>

        <div className="flex-1 overflow-hidden relative">
            <ChatInterface 
                messages={messages}
                inputText={inputText}
                setInputText={setInputText}
                onSend={handleSendMessage}
                onUpdateMessage={handleUpdateMessage}
                onNextLesson={handleNextLesson} 
                isLoading={isLoading}
                currentSituation={chatMode === 'story' ? currentStory?.situation : currentLesson?.situation}
                chatMode={chatMode}
                setChatMode={handleModeSwitch}
                onContinueStory={handleContinueStory}
            />
        </div>
      </div>
    </div>
  );
};

export default App;