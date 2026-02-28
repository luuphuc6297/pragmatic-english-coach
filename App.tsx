import React, { useState, useEffect, useMemo } from 'react';
import { LESSON_SCENARIOS } from './constants';
import { ChatMessage, LessonContext, UserPreferences, CEFRLevel, ChatMode, StoryScenario, SavedItem } from './types';
import ChatInterface from './components/ChatInterface';
import ProgressiveHint from './components/ProgressiveHint';
import Onboarding from './components/Onboarding';
import UserProfile from './components/UserProfile';
import SavedItemsModal from './components/SavedItemsModal';
import ConversationHistoryModal from './components/ConversationHistoryModal';
import { evaluateResponse, generateNextLesson, generateToneTranslations, generateStoryScenario, evaluateStoryTurn, evaluateQuizAnswer, generateDictionaryExplanation } from './services/geminiService';
import { Menu, MessageSquareQuote, Loader2, Sparkles, CheckCircle, TrendingUp, Activity, Settings, ArrowLeft, RotateCcw, ArrowRightLeft, BookOpen, MessageSquare, Languages, ChevronRight, Hash, User, MapPin, Briefcase, Plane, Coffee, Heart, Globe, GraduationCap, Gavel, Stethoscope, ShoppingBag, Music, TreePine, Banknote, Home, Dumbbell, Clapperboard, Monitor, Zap, Library, Clock, PanelLeft, PanelLeftClose, BrainCircuit } from 'lucide-react';

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

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
      const saved = localStorage.getItem('pec_savedItems');
      return saved ? JSON.parse(saved) : [];
  });

  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>(() => {
      const saved = localStorage.getItem('pec_conversationHistory');
      return saved ? JSON.parse(saved) : [];
  });

  const initialSession = useMemo(() => {
      const saved = localStorage.getItem('pec_currentSession');
      return saved ? JSON.parse(saved) : null;
  }, []);

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialSession?.currentConversationId || null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialSession?.currentLessonIndex || 0);
  const [generatedLessons, setGeneratedLessons] = useState<LessonContext[]>(initialSession?.generatedLessons || []);
  const [currentStory, setCurrentStory] = useState<StoryScenario | null>(initialSession?.currentStory || null);
  const [currentQuizItem, setCurrentQuizItem] = useState<SavedItem | null>(initialSession?.currentQuizItem || null);

  const [messages, setMessages] = useState<ChatMessage[]>(initialSession?.messages || []);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For grading/responses
  const [isGenerating, setIsGenerating] = useState(false); // For new lesson/story generation
  const [hintLevel, setHintLevel] = useState(initialSession?.hintLevel || 0);
  const [chatMode, setChatMode] = useState<ChatMode>(initialSession?.chatMode || 'roleplay');
  
  // State to track if the user has actually started a session (selected a mode)
  const [sessionStarted, setSessionStarted] = useState(initialSession?.sessionStarted || false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  
  const isInfiniteMode = true;
  const [translationDirection, setTranslationDirection] = useState<'VN_to_EN' | 'EN_to_VN'>(initialSession?.translationDirection || 'VN_to_EN');
  const [tempDifficultyOverride, setTempDifficultyOverride] = useState<CEFRLevel | null>(initialSession?.tempDifficultyOverride || null);

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

  useEffect(() => {
      localStorage.setItem('pec_savedItems', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
      localStorage.setItem('pec_conversationHistory', JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  useEffect(() => {
      const sessionState = {
          currentConversationId,
          currentLessonIndex,
          generatedLessons,
          currentStory,
          currentQuizItem,
          messages,
          hintLevel,
          chatMode,
          sessionStarted,
          translationDirection,
          tempDifficultyOverride
      };
      localStorage.setItem('pec_currentSession', JSON.stringify(sessionState));
  }, [
      currentConversationId,
      currentLessonIndex,
      generatedLessons,
      currentStory,
      currentQuizItem,
      messages,
      hintLevel,
      chatMode,
      sessionStarted,
      translationDirection,
      tempDifficultyOverride
  ]);

  useEffect(() => {
      if (messages.length > 0 && currentConversationId) {
          setConversationHistory(prev => {
              const existingIndex = prev.findIndex(h => h.id === currentConversationId);
              
              let title = 'Conversation';
              let context: LessonContext | StoryScenario | undefined = undefined;

              if (chatMode === 'roleplay' && currentLesson) {
                  title = currentLesson.title;
                  context = currentLesson;
              } else if (chatMode === 'story' && currentStory) {
                  title = `Story: ${currentStory.topic}`;
                  context = currentStory;
              } else if (chatMode === 'translator') {
                  title = 'Translation Session';
              }

              const updatedHistoryItem: ConversationHistory = {
                  id: currentConversationId,
                  mode: chatMode,
                  timestamp: existingIndex >= 0 ? prev[existingIndex].timestamp : Date.now(),
                  title,
                  messages: [...messages],
                  context
              };

              if (existingIndex >= 0) {
                  const newHistory = [...prev];
                  newHistory[existingIndex] = updatedHistoryItem;
                  return newHistory;
              } else {
                  return [updatedHistoryItem, ...prev];
              }
          });
      }
  }, [messages, currentConversationId, chatMode, currentLesson, currentStory]);

  // --- HANDLERS ---

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    setHasOnboarded(true);
    setCurrentLessonIndex(0);
    setTempDifficultyOverride(null);
  };

  const handleUpdateProfile = (newPrefs: UserPreferences) => {
      const topicsChanged = JSON.stringify(newPrefs.topics) !== JSON.stringify(userPreferences?.topics);
      const levelChanged = newPrefs.level !== userPreferences?.level;

      setUserPreferences(newPrefs);
      
      // If level changed, we might want to reset temp override
      if (levelChanged) {
          setTempDifficultyOverride(null);
      }

      if (topicsChanged || levelChanged) {
          setGeneratedLessons([]);
          setCurrentStory(null);
          setMessages([]);
          setSessionStarted(false);
      }
  };

  const handleSaveItem = async (item: SavedItem) => {
      if (!savedItems.find(i => i.id === item.id)) {
          // Optimistically add the item
          setSavedItems(prev => [item, ...prev]);
          
          if (item.type === 'vocabulary') {
              // Fetch explanation and examples in the background
              try {
                  const dictData = await generateDictionaryExplanation(item.correction, item.context);
                  setSavedItems(prev => prev.map(i => 
                      i.id === item.id 
                      ? { ...i, explanation: dictData.explanation, examples: dictData.examples } 
                      : i
                  ));
              } catch (error) {
                  console.error("Failed to generate dictionary explanation", error);
              }
          }
      }
  };

  const handleDeleteItem = (id: string) => {
      setSavedItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePracticeItem = async (item: SavedItem) => {
      setShowSavedItems(false);
      setChatMode('roleplay');
      setSessionStarted(true);
      
      // Generate a lesson focused on this item
      setIsGenerating(true);
      try {
          const focusTopic = `Practicing: "${item.correction}"`;
          const newLesson = await generateNextLesson(
              generatedLessons.map(l => l.title), 
              userPreferences?.level || 'A1-A2', 
              [focusTopic]
          );
          setGeneratedLessons(prev => [...prev, newLesson]);
          setCurrentLessonIndex(prev => prev + 1);
          
          // Clear messages to start fresh for practice
          setMessages([]);
          setCurrentConversationId(Date.now().toString());
          
      } catch (e) {
          console.error("Failed to generate practice lesson", e);
      } finally {
          setIsGenerating(false);
      }
  };

  const triggerLessonGeneration = async (level: CEFRLevel, topics: string[], direction: 'same' | 'harder' | 'easier') => {
      setIsGenerating(true);
      try {
          // Combine titles from current session and past history
          const sessionTitles = generatedLessons.map(l => l.title);
          const historyTitles = conversationHistory
              .filter(h => h.mode === 'roleplay' && h.context && 'title' in h.context)
              .map(h => (h.context as LessonContext).title);
              
          const prevTitles = [...new Set([...sessionTitles, ...historyTitles])];
          
          const newLesson = await generateNextLesson(
              prevTitles, 
              level,
              topics
          );
          
          setGeneratedLessons(prev => {
              const newLessons = [...prev, newLesson];
              setCurrentLessonIndex(newLessons.length - 1);
              return newLessons;
          });
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
          
          // Collect previous story topics/titles from conversation history to avoid duplicates
          const previousStoryTitles = conversationHistory
              .filter(h => h.mode === 'story' && h.context && 'topic' in h.context)
              .map(h => (h.context as StoryScenario).topic);

          const story = await generateStoryScenario(level, topic, previousStoryTitles);
          setCurrentStory(story);
          
          const openingMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: story.openingLine,
              storyTranslation: story.openingLineVietnamese,
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, openingMsg]);

      } catch (e) {
          console.error("Failed to generate story", e);
      } finally {
          setIsGenerating(false);
      }
  };

  // Main Entry Point for Modes
  const handleStartMode = async (mode: ChatMode) => {
      if (mode === 'quiz' && savedItems.length === 0) {
          alert("You need to save some vocabulary or grammar items first before starting a quiz!");
          return;
      }

      const isNewSession = !sessionStarted || mode !== chatMode;
      
      setChatMode(mode);
      setSessionStarted(true);
      
      if (isNewSession) {
          setMessages([]);
          setCurrentConversationId(Date.now().toString());
      }
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
      } else if (mode === 'quiz' && isNewSession) {
          // Start the quiz with a random saved item
          const randomItem = savedItems[Math.floor(Math.random() * savedItems.length)];
          setCurrentQuizItem(randomItem);
          const quizQuestion: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Quiz Time! Let's test your memory.\n\nHow would you correctly say or use this in English?\n\n"${randomItem.original}"\n\n(Hint: It's related to ${randomItem.type})`,
              timestamp: Date.now()
          };
          setMessages([quizQuestion]);
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
    localStorage.removeItem('pec_conversationHistory');
    localStorage.removeItem('pec_currentSession');
    
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
    setShowProfile(false);
    setConversationHistory([]);
    setCurrentConversationId(null);
  };

  const handleToggleDirection = () => {
      setTranslationDirection(prev => prev === 'VN_to_EN' ? 'EN_to_VN' : 'VN_to_EN');
  };

  const handleContinueStory = (nextReply: string, nextReplyVietnamese?: string) => {
      const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: nextReply,
          storyTranslation: nextReplyVietnamese,
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

        } else if (chatMode === 'quiz') {
            if (!currentQuizItem) return;
            const result = await evaluateQuizAnswer(currentQuizItem, userMsg.content);
            
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.nextAgentReply || "Here is my evaluation:", 
                assessment: result, 
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setScoreHistory(prev => [...prev, result.score]);
            
            // Update mastery score
            setSavedItems(prev => prev.map(item => {
                if (item.id === currentQuizItem.id) {
                    return { ...item, masteryScore: Math.min(100, item.masteryScore + (result.score * 10)) };
                }
                return item;
            }));

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
    // Add system separator instead of clearing
    const separatorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: direction === 'same' ? '--- Next Scenario ---' : `--- ${direction === 'harder' ? 'Increasing Difficulty' : 'Decreasing Difficulty'} ---`,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, separatorMsg]);
    
    setHintLevel(0);
    setInputText('');
    
    let nextDifficulty = tempDifficultyOverride || userPreferences?.level || 'A1-A2';
    if (direction !== 'same') {
        nextDifficulty = getNextLevel(nextDifficulty, direction);
        setTempDifficultyOverride(nextDifficulty); 
    }

    if (chatMode === 'story') {
        await triggerStoryGeneration();
    } else if (chatMode === 'quiz') {
        const randomItem = savedItems[Math.floor(Math.random() * savedItems.length)];
        setCurrentQuizItem(randomItem);
        const quizQuestion: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Next Question!\n\nHow would you correctly say or use this in English?\n\n"${randomItem.original}"\n\n(Hint: It's related to ${randomItem.type})`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, quizQuestion]);
    } else {
        // Only trigger if we are in Roleplay. If we are in translator, we don't need to generate.
        if (chatMode === 'roleplay') {
             await triggerLessonGeneration(nextDifficulty, userPreferences?.topics || ['General'], direction);
             
             // Add a prompt message from the assistant so the user knows the new scenario is ready
             const promptMsg: ChatMessage = {
                 id: Date.now().toString() + '_prompt',
                 role: 'assistant',
                 content: "I've prepared a new scenario for you! Please check the context on the left and type your first response to start.",
                 timestamp: Date.now() + 1
             };
             setMessages(prev => [...prev, promptMsg]);
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
              
              <div className="max-w-5xl w-full z-10 text-center px-4">
                  <div className="flex flex-col items-center mb-10">
                       <h1 className="text-4xl font-bold mb-3">Welcome back, {userPreferences?.name}</h1>
                       <p className="text-slate-400 text-lg">Choose a mode to continue your journey.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      
                      {/* Roleplay Coach Card */}
                      <button 
                          onClick={() => handleStartMode('roleplay')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-brand-500 rounded-2xl p-5 md:p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-56 md:h-64"
                      >
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                              <MessageSquareQuote size={20} className="md:w-6 md:h-6" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Scenario Coach</h3>
                          <p className="text-xs md:text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                              Practice specific situations (e.g., "Ordering Coffee") with AI grading your grammar and naturalness.
                          </p>
                          <div className="flex items-center text-brand-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-auto">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>

                      {/* Story Mode Card */}
                      <button 
                          onClick={() => handleStartMode('story')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-2xl p-5 md:p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-56 md:h-64"
                      >
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                              <BookOpen size={20} className="md:w-6 md:h-6" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Story Mode</h3>
                          <p className="text-xs md:text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                              Immerse yourself in a continuous roleplay conversation. The AI adapts to your replies dynamically.
                          </p>
                          <div className="flex items-center text-purple-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-auto">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>

                      {/* Translator Card */}
                      <button 
                          onClick={() => handleStartMode('translator')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-2xl p-5 md:p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-56 md:h-64"
                      >
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <Languages size={20} className="md:w-6 md:h-6" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Tone Translator</h3>
                          <p className="text-xs md:text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                              Input any sentence and see it transformed into Formal, Friendly, Informal, and Native tones.
                          </p>
                          <div className="flex items-center text-indigo-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-auto">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>

                      {/* Quiz Mode Card */}
                      <button 
                          onClick={() => handleStartMode('quiz')}
                          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 rounded-2xl p-5 md:p-6 text-left transition-all duration-300 hover:scale-[1.02] flex flex-col h-56 md:h-64"
                      >
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                              <BrainCircuit size={20} className="md:w-6 md:h-6" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Vocab Quiz</h3>
                          <p className="text-xs md:text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                              Test your memory on the vocabulary and grammar items you've saved.
                          </p>
                          <div className="flex items-center text-amber-400 text-xs md:text-sm font-bold uppercase tracking-wider mt-auto">
                              Start <ChevronRight size={16} className="ml-1" />
                          </div>
                      </button>
                  </div>
                  
                   <div className="mt-10 flex gap-4 justify-center flex-wrap">
                        <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 transition-all">
                             <Clock size={16} /> History
                        </button>
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
                    onLogout={handleResetSettings}
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
      
      {/* Sidebar for History */}
      <div 
        className={`flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 overflow-hidden absolute md:relative z-50 h-full ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <h2 className="text-white font-bold flex items-center gap-2 whitespace-nowrap">
            <Clock size={18} className="text-brand-400" /> History
          </h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {conversationHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm whitespace-nowrap">No history yet</div>
          ) : (
            conversationHistory.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setChatMode(item.mode);
                  setMessages(item.messages);
                  setCurrentConversationId(item.id);
                  if (item.mode === 'roleplay' && item.context) {
                      const lesson = item.context as LessonContext;
                      setGeneratedLessons(prev => {
                          if (prev.findIndex(l => l.id === lesson.id) >= 0) return prev;
                          return [...prev, lesson];
                      });
                      const existingIndex = generatedLessons.findIndex(l => l.id === lesson.id);
                      setCurrentLessonIndex(existingIndex >= 0 ? existingIndex : generatedLessons.length);
                  } else if (item.mode === 'story' && item.context) {
                      setCurrentStory(item.context as StoryScenario);
                  }
                  setSessionStarted(true);
                }}
                className={`w-full text-left p-3 rounded-xl transition-colors flex flex-col ${currentConversationId === item.id ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50 border border-transparent'}`}
              >
                <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    item.mode === 'roleplay' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.mode === 'story' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.mode}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-slate-200 line-clamp-1 w-full">{item.title}</h3>
              </button>
            ))
          )}
        </div>
      </div>

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
            onLogout={handleResetSettings}
        />
       )}

      {/* LEFT: Context & Visual Area */}
      {/* Changed Width to 40% (4/10 ratio) as requested */}
      <div className="hidden md:flex md:w-[40%] flex-col bg-slate-900 border-r border-slate-800">
        
        {/* Header with Stats & Back Button */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle Button */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"
                    title="Toggle History Sidebar"
                >
                    <PanelLeft size={18} />
                </button>
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
                {/* History Button */}
                <button 
                    onClick={() => setShowHistoryModal(true)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700 ml-2"
                    title="View Conversation History"
                >
                    <Clock size={18} />
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
                     <span className="font-bold text-slate-800 truncate text-sm w-32">
                         {isGenerating ? 'Loading...' : (chatMode === 'story' ? currentStory?.topic : chatMode === 'roleplay' ? currentLesson?.title : 'Translator')}
                     </span>
                     <span className="text-[10px] text-slate-500">Avg: {averageScore}</span>
                 </div>
             </div>
             <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowSavedItems(true)}
                    className="p-2 text-slate-400 hover:text-brand-600"
                >
                    <Library size={20} />
                </button>
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
        </div>

        {/* Header Actions (Desktop) */}
        <div className="hidden md:flex absolute top-4 right-6 z-30 gap-2">
             <button 
                onClick={() => setShowSavedItems(true)}
                className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-slate-400 hover:text-brand-600 hover:border-brand-200 shadow-sm transition-all"
                title="Saved Items"
             >
                 <Library size={20} />
             </button>
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
                savedItems={savedItems}
                onSaveItem={handleSaveItem}
                currentLesson={currentLesson}
                translationDirection={translationDirection}
                onToggleDirection={handleToggleDirection}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
        </div>
      </div>

      {/* Saved Items Modal */}
      {showSavedItems && (
          <SavedItemsModal 
              items={savedItems} 
              onClose={() => setShowSavedItems(false)} 
              onDelete={handleDeleteItem}
              onPractice={handlePracticeItem}
          />
      )}

      {/* History Modal */}
      {showHistoryModal && (
          <ConversationHistoryModal
              history={conversationHistory}
              onClose={() => setShowHistoryModal(false)}
              onSelect={(historyItem) => {
                  setChatMode(historyItem.mode);
                  setMessages(historyItem.messages);
                  setCurrentConversationId(historyItem.id);
                  if (historyItem.mode === 'roleplay' && historyItem.context) {
                      const lesson = historyItem.context as LessonContext;
                      setGeneratedLessons(prev => {
                          const existingIndex = prev.findIndex(l => l.id === lesson.id);
                          if (existingIndex >= 0) {
                              // We can't call setCurrentLessonIndex here safely if it depends on prev, 
                              // but we can just use a timeout or useEffect. 
                              // Actually, we can just do it before setting state.
                              return prev;
                          }
                          return [...prev, lesson];
                      });
                      
                      // Find index to set
                      const existingIndex = generatedLessons.findIndex(l => l.id === lesson.id);
                      if (existingIndex >= 0) {
                          setCurrentLessonIndex(existingIndex);
                      } else {
                          setCurrentLessonIndex(generatedLessons.length);
                      }
                  } else if (historyItem.mode === 'story' && historyItem.context) {
                      setCurrentStory(historyItem.context as StoryScenario);
                  }
                  setSessionStarted(true);
                  setShowHistoryModal(false);
              }}
              onDelete={(id) => {
                  setConversationHistory(prev => prev.filter(h => h.id !== id));
                  if (currentConversationId === id) {
                      setCurrentConversationId(null);
                      setMessages([]);
                      setSessionStarted(false);
                  }
              }}
          />
      )}
    </div>
  );
};

export default App;