import React, { useState, useEffect, useMemo } from 'react';
import { ChatMessage, LessonContext, UserPreferences, CEFRLevel, ChatMode, StoryScenario, SavedItem, ConversationHistory } from './types';
import ChatInterface from './components/ChatInterface';
import Onboarding from './components/Onboarding';
import UserProfile from './components/UserProfile';
import SavedItemsModal from './components/SavedItemsModal';
import ConversationHistoryModal from './components/ConversationHistoryModal';
import ModeSelection from './components/ModeSelection';
import Sidebar from './components/Sidebar';
import ContextPanel from './components/ContextPanel';
import { evaluateResponse, generateNextLesson, generateToneTranslations, generateStoryScenario, evaluateStoryTurn, evaluateQuizAnswer, generateDictionaryExplanation } from './services/geminiService';
import { Loader2, ArrowLeft, Library } from 'lucide-react';

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

    const handleRestoreConversation = (item: ConversationHistory) => {
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
    };

    // RENDER: Onboarding
    if (!hasOnboarded) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    if (!sessionStarted) {
        return (
            <ModeSelection
                userPreferences={userPreferences}
                onStartMode={handleStartMode}
                onShowHistory={() => setShowHistoryModal(true)}
                onResetSettings={handleResetSettings}
                showProfile={showProfile}
                onToggleProfile={setShowProfile}
                onSaveProfile={handleUpdateProfile}
                profileStats={{
                    lessonsCompleted: completedLessons.size,
                    averageScore: averageScore,
                    totalMessages: messages.length,
                }}
            />
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

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                history={conversationHistory}
                activeConversationId={currentConversationId}
                onSelectConversation={handleRestoreConversation}
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
                    onLogout={handleResetSettings}
                />
            )}

            <ContextPanel
                chatMode={chatMode}
                currentLesson={currentLesson}
                currentStory={currentStory}
                safeIndex={safeIndex}
                isCurrentLessonCompleted={currentLesson ? completedLessons.has(currentLesson.id) : false}
                translationDirection={translationDirection}
                onToggleDirection={handleToggleDirection}
                hintLevel={hintLevel}
                onRequestHint={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                onResetHint={() => setHintLevel(0)}
                isGenerating={isGenerating}
                isInfiniteMode={isInfiniteMode}
                userName={userPreferences?.name}
                averageScore={averageScore}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onBack={() => setSessionStarted(false)}
                onShowProfile={() => setShowProfile(true)}
                onShowHistory={() => setShowHistoryModal(true)}
                onNextLesson={handleNextLesson}
            />

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
                        setChatMode={handleStartMode}
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
                    onSelect={(item) => {
                        handleRestoreConversation(item);
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