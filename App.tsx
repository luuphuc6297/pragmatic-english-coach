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
import {Loader2, ArrowLeft, Library, Plus} from 'lucide-react';
import {styles} from './configs/themeConfig';

const App = () => {
  const {user, authLoading, setAuthLoading} = useAuth();

  const handleDataLoaded = useCallback(
    (state: AppState | null, history: ConversationHistory[], items: SavedItem[]) => {
      if (state) {
        setHasOnboarded(state.hasOnboarded ?? false);
        setUserPreferences(state.userPreferences ?? null);
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
      }

      if (items && items.length > 0) {
        setSavedItems(items);
      } else if (state && state.savedItems) {
        setSavedItems(state.savedItems);
      }

      if (history && history.length > 0) {
        setConversationHistory(history);
      } else if (state && state.conversationHistory) {
        setConversationHistory(state.conversationHistory);
      }
    },
    [],
  );

  const {isDataLoaded} = useDataLoader(user, authLoading, handleDataLoaded);

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

  const handleResetSettings = () => {
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      localStorage.clear();
      setHasOnboarded(false);
      setUserPreferences(null);
      setCompletedLessons(new Set());
      setScoreHistory([]);
      setSavedItems([]);
      setConversationHistory([]);
      setCurrentConversationId(null);
      setMessages([]);
      setSessionStarted(false);
      setGeneratedLessons([]);
      setCurrentStory(null);
      setCurrentQuizItem(null);
      setCurrentDialogue(null);
      setTempDifficultyOverride(null);
      setShowProfile(false);
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

  const handleDeleteConversation = (id: string) => {
    setConversationHistory((prev) => prev.filter((h) => h.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
      setSessionStarted(false);
    }
  };

  const handleModeSwitch = (mode: ChatMode) => {
    if (mode === 'vocab_hub' || mode === 'translator' || mode === 'quiz') {
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
    handleRestoreConversation(item);
    setShowHistoryModal(false);
    setSelectedModeForHistory(null);
  };

  const handleStartNewFromHistory = (mode: ChatMode) => {
    setShowHistoryModal(false);
    setSelectedModeForHistory(null);
    handleStartMode(mode, true);
  };

  // --- RENDER ---

  if (authLoading || (user && !isDataLoaded)) {
    return (
      <div className={styles.layout.screenLight}>
        <Loader2 className="animate-spin text-brand-500" size={48} />
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
        <Loader2 className="animate-spin text-brand-400" size={48} />
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
    <div className="flex h-screen bg-slate-900 overflow-hidden relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={conversationHistory.filter((h) => h.mode === chatMode)}
        activeConversationId={currentConversationId}
        onSelectConversation={handleRestoreConversation}
        onSyncHistory={handleSyncHistory}
        onStartNew={() => handleStartMode(chatMode, true)}
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
        averageScore={averageScore}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onBack={() => setSessionStarted(false)}
        onShowProfile={() => setShowProfile(true)}
        onShowHistory={() => {
          setSelectedModeForHistory(chatMode);
          setShowHistoryModal(true);
        }}
        onNextLesson={handleNextLesson}
        onStartNew={() => handleStartMode(chatMode, true)}
      />

      <div className="flex-1 flex flex-col h-full bg-slate-50">
        <div className={styles.layout.mobileHeader}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSessionStarted(false)} className="p-1 -ml-2 text-slate-500">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 truncate text-sm w-32">
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
              <span className="text-[10px] text-slate-500">Avg: {averageScore}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartMode(chatMode, true)}
              disabled={isGenerating}
              className="p-2 text-slate-400 hover:text-brand-600"
              title="New Conversation"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setShowSavedItems(true)}
              className="p-2 text-slate-400 hover:text-brand-600"
            >
              <Library size={20} />
            </button>
            {chatMode !== 'translator' && chatMode !== 'vocab_hub' && (
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

        <div className="flex-1 overflow-hidden relative">
          <div className="hidden md:flex absolute top-4 right-6 z-40 gap-2">
            <button
              onClick={() => setShowSavedItems(true)}
              className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-slate-400 hover:text-brand-600 hover:border-brand-200 shadow-sm transition-all"
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
