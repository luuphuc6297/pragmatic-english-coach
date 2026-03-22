import {useState, useMemo, useCallback} from 'react';
import {
  ChatMessage,
  LessonContext,
  UserPreferences,
  CEFRLevel,
  ChatMode,
  StoryScenario,
  SavedItem,
  ConversationHistory,
  PracticeDialogue,
  AppState,
} from './types';
import ChatInterface from './components/chat';
import Onboarding from './components/auth/Onboarding';
import UserProfile from './components/modals/UserProfile';
import SavedItemsModal from './components/modals/SavedItemsModal';
import ConversationHistoryModal from './components/modals/ConversationHistoryModal';
import ModeSelection from './components/layout/ModeSelection';
import Sidebar from './components/layout/Sidebar';
import ContextPanel from './components/layout/ContextPanel';
import VocabHub from './components/vocab/VocabHub';
import DialogueList from './components/practice/DialogueList';
import LiveConversation from './components/practice/LiveConversation';
import Auth from './components/auth/Auth';
import {supabase} from './lib/supabase';
import {supabaseService} from './services/supabaseService';
import {useAuth} from './hooks/useAuth';
import {usePersistence} from './hooks/usePersistence';
import {useConversationTracker} from './hooks/useConversationTracker';
import {useDataLoader} from './hooks/useDataLoader';
import {useLessonManager} from './hooks/useLessonManager';
import {useChatHandler} from './hooks/useChatHandler';
import {useSavedItemsManager} from './hooks/useSavedItemsManager';
import {ArrowLeft, Library, Plus} from 'lucide-react';
import {styles} from './configs/themeConfig';
import {generateNativeSpeech} from './services/geminiService';

const App = () => {
  const {user, authLoading, setAuthLoading} = useAuth();

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

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    initialSession?.currentConversationId || null,
  );
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedModeForHistory, setSelectedModeForHistory] = useState<ChatMode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(
    initialSession?.currentLessonIndex || 0,
  );
  const [generatedLessons, setGeneratedLessons] = useState<LessonContext[]>(
    initialSession?.generatedLessons || [],
  );
  const [currentStory, setCurrentStory] = useState<StoryScenario | null>(
    initialSession?.currentStory || null,
  );
  const [currentQuizItem, setCurrentQuizItem] = useState<SavedItem | null>(
    initialSession?.currentQuizItem || null,
  );
  const [currentDialogue, setCurrentDialogue] = useState<PracticeDialogue | null>(
    initialSession?.currentDialogue || null,
  );

  const [messages, setMessages] = useState<ChatMessage[]>(initialSession?.messages || []);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hintLevel, setHintLevel] = useState(initialSession?.hintLevel || 0);
  const [chatMode, setChatMode] = useState<ChatMode>(initialSession?.chatMode || 'roleplay');

  const [sessionStarted, setSessionStarted] = useState(initialSession?.sessionStarted || false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);

  const isInfiniteMode = true;
  const [translationDirection, setTranslationDirection] = useState<'VN_to_EN' | 'EN_to_VN'>(
    initialSession?.translationDirection || 'VN_to_EN',
  );
  const [tempDifficultyOverride, setTempDifficultyOverride] = useState<CEFRLevel | null>(
    initialSession?.tempDifficultyOverride || null,
  );

  const handleDataLoaded = useCallback(
    (state: AppState | null, history: ConversationHistory[], items: SavedItem[]) => {
      if (state) {
        setHasOnboarded(state.hasOnboarded ?? false);
        
        // Merge customTopics from localStorage if missing in Supabase
        let prefs = state.userPreferences ?? null;
        if (prefs && !prefs.customTopics) {
          const localPrefsStr = localStorage.getItem('pec_userPreferences');
          if (localPrefsStr) {
            try {
              const localPrefs = JSON.parse(localPrefsStr);
              if (localPrefs && localPrefs.customTopics) {
                prefs = { ...prefs, customTopics: localPrefs.customTopics };
              }
            } catch (e) {
              console.error('Failed to parse local preferences', e);
            }
          }
        }
        setUserPreferences(prefs);
        
        setCompletedLessons(new Set(state.completedLessons ?? []));
        setScoreHistory(state.scoreHistory ?? []);

        if (state.currentSession) {
          setCurrentConversationId(state.currentSession.currentConversationId ?? null);
          setCurrentLessonIndex(state.currentSession.currentLessonIndex ?? 0);
          setGeneratedLessons(state.currentSession.generatedLessons ?? []);
          setCurrentStory(state.currentSession.currentStory ?? null);
          setCurrentQuizItem(state.currentSession.currentQuizItem ?? null);
          setCurrentDialogue(state.currentSession.currentDialogue ?? null);
          setMessages(state.currentSession.messages ?? []);
          setHintLevel(state.currentSession.hintLevel ?? 0);
          setChatMode(state.currentSession.chatMode ?? 'roleplay');
          setSessionStarted(state.currentSession.sessionStarted ?? false);
          setTranslationDirection(state.currentSession.translationDirection ?? 'VN_to_EN');
          setTempDifficultyOverride(state.currentSession.tempDifficultyOverride ?? null);
        }
      } else if (user && !user.id.startsWith('guest-')) {
        // If Supabase returns null for a real user, it's a fresh account.
        // We must ignore any stale localStorage data from previous sessions.
        setHasOnboarded(false);
        setUserPreferences(null);
      }

      if (state && state.savedItems && state.savedItems.length > 0) {
        setSavedItems(state.savedItems);
      } else if (items && items.length > 0) {
        setSavedItems(items);
      }

      if (state && state.conversationHistory && state.conversationHistory.length > 0) {
        // appState has the most up-to-date auto-saved history
        setConversationHistory(state.conversationHistory);
      } else if (history && history.length > 0) {
        setConversationHistory(history);
      }
    },
    [user],
  );

  const {isDataLoaded} = useDataLoader(user, authLoading, handleDataLoaded);

  const activeLessonPool = generatedLessons.length > 0 ? generatedLessons : [];
  const safeIndex = currentLessonIndex % (activeLessonPool.length || 1);
  const currentLesson = activeLessonPool.length > 0 ? activeLessonPool[safeIndex] : null;

  const averageScore =
    scoreHistory.length > 0
      ? (scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length).toFixed(1)
      : '0.0';

  // --- PERSISTENCE & TRACKING ---
  usePersistence({
    user,
    isDataLoaded,
    hasOnboarded,
    userPreferences,
    completedLessons,
    scoreHistory,
    savedItems,
    conversationHistory,
    currentConversationId,
    currentLessonIndex,
    generatedLessons,
    currentStory,
    currentQuizItem,
    currentDialogue,
    messages,
    hintLevel,
    chatMode,
    sessionStarted,
    translationDirection,
    tempDifficultyOverride,
  });

  useConversationTracker({
    messages,
    currentConversationId,
    chatMode,
    currentLesson,
    currentStory,
    currentDialogue,
    setConversationHistory,
  });

  // --- DOMAIN HOOKS ---

  const {handleSaveItem, handleDeleteItem, handleUpdateItem, handlePracticeItem} =
    useSavedItemsManager({
      savedItems,
      generatedLessons,
      userPreferences,
      setSavedItems,
      setShowSavedItems,
      setChatMode,
      setSessionStarted,
      setIsGenerating,
      setGeneratedLessons,
      setCurrentLessonIndex,
      setMessages,
      setCurrentConversationId,
    });

  const {handleStartMode, handleNextLesson, handleSelectStoryContext, handleContinueStory} =
    useLessonManager({
      userPreferences,
      conversationHistory,
      generatedLessons,
      savedItems,
      currentStory,
      tempDifficultyOverride,
      chatMode,
      sessionStarted,
      setGeneratedLessons,
      setCurrentLessonIndex,
      setCurrentStory,
      setCurrentQuizItem,
      setCurrentDialogue,
      setMessages,
      setCurrentConversationId,
      setChatMode,
      setSessionStarted,
      setInputText,
      setHintLevel,
      setIsGenerating,
      setTempDifficultyOverride,
    });

  const {handleSendMessage, handleUpdateMessage} = useChatHandler({
    inputText,
    chatMode,
    currentStory,
    currentQuizItem,
    currentLesson,
    messages,
    completedLessons,
    translationDirection,
    setMessages,
    setInputText,
    setIsLoading,
    setScoreHistory,
    setCompletedLessons,
    setSavedItems,
  });

  // --- LOCAL HANDLERS ---

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    setHasOnboarded(true);
    setCurrentLessonIndex(0);
    setTempDifficultyOverride(null);
  };

  const handleUpdateProfile = (newPrefs: UserPreferences) => {
    const topicsChanged =
      JSON.stringify(newPrefs.topics) !== JSON.stringify(userPreferences?.topics);
    const levelChanged = newPrefs.level !== userPreferences?.level;

    setUserPreferences(newPrefs);

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

  const handleResetSettings = async () => {
    localStorage.removeItem('pec_hasOnboarded');
    localStorage.removeItem('pec_userPreferences');
    localStorage.removeItem('pec_completedLessons');
    localStorage.removeItem('pec_scoreHistory');
    localStorage.removeItem('pec_conversationHistory');
    localStorage.removeItem('pec_currentSession');

    if (user) {
      await supabaseService.deleteState(user.id);
    }

    setHasOnboarded(false);
    setSessionStarted(false);
    setMessages([]);
    setInputText('');
    setGeneratedLessons([]);
    setTempDifficultyOverride(null);
    setCurrentStory(null);
    setCurrentDialogue(null);
    setCompletedLessons(new Set());
    setScoreHistory([]);
    setUserPreferences(null);
    setShowProfile(false);
    setConversationHistory([]);
    setCurrentConversationId(null);
  };

  const handleToggleDirection = () => {
    setTranslationDirection((prev) => (prev === 'VN_to_EN' ? 'EN_to_VN' : 'VN_to_EN'));
  };

  const handleRestoreConversation = (item: ConversationHistory) => {
    setChatMode(item.mode);
    setMessages(item.messages);
    setCurrentConversationId(item.id);
    if (item.mode === 'roleplay' && item.context) {
      const lesson = item.context as LessonContext;
      setGeneratedLessons((prev) => {
        if (prev.findIndex((l) => l.id === lesson.id) >= 0) return prev;
        return [...prev, lesson];
      });
      const existingIndex = generatedLessons.findIndex((l) => l.id === lesson.id);
      setCurrentLessonIndex(existingIndex >= 0 ? existingIndex : generatedLessons.length);
    } else if (item.mode === 'story' && item.context) {
      setCurrentStory(item.context as StoryScenario);
    } else if (item.mode === 'dialogues' && item.context) {
      setCurrentDialogue(item.context as PracticeDialogue);
    }
    setSessionStarted(true);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      if (user && isDataLoaded && hasOnboarded) {
        const appState = {
          hasOnboarded,
          userPreferences,
          completedLessons: Array.from(completedLessons),
          scoreHistory,
          savedItems,
          conversationHistory,
          currentSession: {
            currentConversationId,
            currentLessonIndex,
            generatedLessons,
            currentStory,
            currentQuizItem,
            currentDialogue,
            messages,
            hintLevel,
            chatMode,
            sessionStarted,
            translationDirection,
            tempDifficultyOverride
          }
        };
        await supabaseService.saveState(user.id, appState);
        await supabaseService.syncHistory(user.id, conversationHistory);
      }
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthLoading(false);
    }
  };

  const handleSyncHistory = async () => {
    if (user && conversationHistory.length > 0) {
      await supabaseService.syncHistory(user.id, conversationHistory);
    }
  };

  const handleSyncSavedItems = async () => {
    if (user && savedItems.length > 0) {
      await supabaseService.syncSavedItems(user.id, savedItems);
    }
  };

  const handlePlayAudio = async (text: string) => {
    try {
      const base64Audio = await generateNativeSpeech(text);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
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
    }
  };

  const handleGenerateImage = async (id: string, text: string, context?: string) => {
    try {
      const { generateIllustration } = await import('./services/geminiService');
      const imageUrl = await generateIllustration(text, context);
      
      const updatedItems = savedItems.map(item => 
        item.id === id ? { ...item, imageUrl } : item
      );
      setSavedItems(updatedItems);
      
      if (user) {
        await supabaseService.syncSavedItems(user.id, updatedItems);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Could not generate image.');
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversationHistory((prev) => prev.filter((h) => h.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
      setSessionStarted(false);
    }
  };

  const handleModeSwitch = (mode: ChatMode) => {
    setIsLoading(false);
    if (mode === 'vocab_hub' || mode === 'quiz') {
      handleStartMode(mode);
    } else {
      setSelectedModeForHistory(mode);
      setShowHistoryModal(true);
    }
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedModeForHistory(null);
  };

  const handleSelectFromHistory = (item: ConversationHistory) => {
    setIsLoading(false);
    handleRestoreConversation(item);
    setShowHistoryModal(false);
    setSelectedModeForHistory(null);
  };

  const handleStartNewFromHistory = (mode: ChatMode) => {
    setIsLoading(false);
    setShowHistoryModal(false);
    setSelectedModeForHistory(null);
    handleStartMode(mode, true);
  };

  // --- RENDER ---

  if (authLoading || (user && !isDataLoaded)) {
    return (
      <div className={styles.layout.screenLight}>
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Loading" className="w-16 h-16 animate-pulse mb-4" referrerPolicy="no-referrer" />
        <p className="text-slate-500 font-medium">Loading your progress...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => {}} />;
  }

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!sessionStarted) {
    return (
      <>
        <ModeSelection
          userPreferences={userPreferences}
          onStartMode={handleModeSwitch}
          onShowHistory={() => {
            setSelectedModeForHistory(null);
            setShowHistoryModal(true);
          }}
          onResetSettings={handleResetSettings}
          showProfile={showProfile}
          onToggleProfile={setShowProfile}
          onSaveProfile={handleUpdateProfile}
          profileStats={{
            lessonsCompleted: completedLessons.size,
            averageScore: averageScore,
            totalMessages: messages.length,
          }}
          onSignOut={handleSignOut}
        />

        {showHistoryModal && (
          <ConversationHistoryModal
            history={conversationHistory}
            modeFilter={selectedModeForHistory || undefined}
            onStartNew={handleStartNewFromHistory}
            onClose={handleCloseHistoryModal}
            onSelect={handleSelectFromHistory}
            onDelete={handleDeleteConversation}
          />
        )}
      </>
    );
  }

  if (isGenerating && (!currentLesson || (chatMode === 'story' && !currentStory))) {
    return (
      <div className={styles.layout.screenDark}>
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Loading" className="w-16 h-16 animate-pulse mb-4" referrerPolicy="no-referrer" />
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {chatMode === 'story' ? 'Preparing Scenario' : 'Designing Lesson'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {chatMode === 'story'
              ? 'Setting the scene for you...'
              : 'Crafting a realistic situation...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-navy overflow-hidden relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={conversationHistory.filter((h) => h.mode === chatMode)}
        activeConversationId={currentConversationId}
        onSelectConversation={handleRestoreConversation}
        onSyncHistory={handleSyncHistory}
        onStartNew={() => { setIsLoading(false); handleStartMode(chatMode, true); }}
        onShowAllHistory={() => {
          setSelectedModeForHistory(null);
          setShowHistoryModal(true);
        }}
      />

      {showProfile && userPreferences && (
        <UserProfile
          preferences={userPreferences}
          stats={{
            lessonsCompleted: completedLessons.size,
            averageScore: averageScore,
            totalMessages: messages.length,
          }}
          onClose={() => setShowProfile(false)}
          onSave={handleUpdateProfile}
          onLogout={handleSignOut}
        />
      )}

      <ContextPanel
        chatMode={chatMode}
        currentLesson={currentLesson}
        currentStory={currentStory}
        currentDialogue={currentDialogue}
        latestGrammarAnalysis={
          chatMode === 'translator' 
            ? messages.filter(m => m.role === 'assistant' && m.translation?.grammarAnalysis).pop()?.translation?.grammarAnalysis 
            : null
        }
        safeIndex={safeIndex}
        isCurrentLessonCompleted={currentLesson ? completedLessons.has(currentLesson.id) : false}
        translationDirection={translationDirection}
        onToggleDirection={handleToggleDirection}
        hintLevel={hintLevel}
        onRequestHint={() => setHintLevel((prev) => Math.min(prev + 1, 3))}
        onResetHint={() => setHintLevel(0)}
        isGenerating={isGenerating}
        isInfiniteMode={isInfiniteMode}
        userName={userPreferences?.name}
        userAvatar={userPreferences?.avatarUrl}
        averageScore={averageScore}
        customTopics={userPreferences?.customTopics}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onBack={() => setSessionStarted(false)}
        onShowProfile={() => setShowProfile(true)}
        onShowHistory={() => {
          setSelectedModeForHistory(chatMode);
          setShowHistoryModal(true);
        }}
        onNextLesson={handleNextLesson}
        onStartNew={() => { setIsLoading(false); handleStartMode(chatMode, true); }}
      />

      <div className="flex-1 flex flex-col h-full bg-navy relative">
        <div className="md:hidden h-14 bg-navy-muted/50 border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button onClick={() => setSessionStarted(false)} className="p-1 -ml-2 text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 truncate text-sm w-32">
                {isGenerating
                  ? 'Loading...'
                  : chatMode === 'story'
                    ? currentStory?.topic
                    : chatMode === 'roleplay'
                      ? currentLesson?.title
                      : chatMode === 'vocab_hub'
                        ? 'Vocab Hub'
                        : chatMode === 'dialogues'
                          ? currentDialogue?.title || 'Practice Dialogues'
                          : 'Translator'}
              </span>
              <span className="text-[10px] text-primary/70">Avg: {averageScore}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsLoading(false); handleStartMode(chatMode, true); }}
              disabled={isGenerating}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title="New Conversation"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setShowSavedItems(true)}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
            >
              <Library size={20} />
            </button>
            {chatMode !== 'translator' && chatMode !== 'vocab_hub' && (
              <button
                onClick={() => handleNextLesson('same')}
                disabled={isGenerating}
                className="text-xs font-bold text-background-dark px-3 py-1 bg-primary rounded-full"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="hidden md:flex absolute top-4 right-6 z-40 gap-2">
            <button
              onClick={() => setShowSavedItems(true)}
              className="p-2 bg-navy-muted/80 backdrop-blur-sm border border-white/10 rounded-full text-slate-400 hover:text-primary hover:border-primary/30 shadow-sm transition-all hover:-translate-y-1"
              title="Saved Items"
            >
              <Library size={20} />
            </button>
          </div>
          {chatMode === 'live' ? (
            <LiveConversation
              userLevel={userPreferences?.level || 'A1-A2'}
              onBack={() => setSessionStarted(false)}
            />
          ) : chatMode === 'vocab_hub' ? (
            <VocabHub
              userLevel={userPreferences?.level || 'A1-A2'}
              savedItems={savedItems}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          ) : chatMode === 'story' && !currentStory ? (
            <DialogueList
              onSelect={handleSelectStoryContext}
              onBack={() => setSessionStarted(false)}
              userLevel={userPreferences?.level || 'A1-A2'}
            />
          ) : (
            <ChatInterface
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              onSend={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
              onNextLesson={handleNextLesson}
              isLoading={isLoading || isGenerating}
              currentSituation={
                chatMode === 'story'
                  ? currentStory?.situation
                  : chatMode === 'dialogues'
                    ? currentDialogue?.scenario
                    : currentLesson?.situation
              }
              chatMode={chatMode}
              setChatMode={handleModeSwitch}
              onContinueStory={handleContinueStory}
              savedItems={savedItems}
              onSaveItem={handleSaveItem}
              currentLesson={currentLesson}
              translationDirection={translationDirection}
              onToggleDirection={handleToggleDirection}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onReturnToModes={() => setSessionStarted(false)}
              userName={userPreferences?.name}
              userAvatar={userPreferences?.avatarUrl}
              onStartNew={() => startNewSession(chatMode)}
            />
          )}
        </div>
      </div>

      {showSavedItems && (
        <SavedItemsModal
          items={savedItems}
          onClose={() => setShowSavedItems(false)}
          onDelete={handleDeleteItem}
          onPractice={handlePracticeItem}
          onSync={handleSyncSavedItems}
          onPlayAudio={handlePlayAudio}
          onGenerateImage={handleGenerateImage}
        />
      )}

      {showHistoryModal && (
        <ConversationHistoryModal
          history={conversationHistory}
          modeFilter={selectedModeForHistory || undefined}
          onStartNew={handleStartNewFromHistory}
          onClose={handleCloseHistoryModal}
          onSelect={handleSelectFromHistory}
          onDelete={handleDeleteConversation}
        />
      )}
    </div>
  );
};

export default App;
