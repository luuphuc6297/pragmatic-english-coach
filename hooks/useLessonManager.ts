import { Dispatch, SetStateAction } from 'react';
import { ChatMessage, LessonContext, UserPreferences, CEFRLevel, ChatMode, StoryScenario, SavedItem, ConversationHistory, PracticeDialogue } from '../types';
import { generateNextLesson, generateStoryScenario } from '../services/geminiService';
import { selectNextQuizItem } from '../utils/quizSelection';

interface LessonManagerDeps {
    userPreferences: UserPreferences | null;
    conversationHistory: ConversationHistory[];
    generatedLessons: LessonContext[];
    savedItems: SavedItem[];
    currentStory: StoryScenario | null;
    tempDifficultyOverride: CEFRLevel | null;
    chatMode: ChatMode;
    sessionStarted: boolean;
    setGeneratedLessons: Dispatch<SetStateAction<LessonContext[]>>;
    setCurrentLessonIndex: Dispatch<SetStateAction<number>>;
    setCurrentStory: Dispatch<SetStateAction<StoryScenario | null>>;
    setCurrentQuizItem: Dispatch<SetStateAction<SavedItem | null>>;
    setCurrentDialogue: Dispatch<SetStateAction<PracticeDialogue | null>>;
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    setCurrentConversationId: Dispatch<SetStateAction<string | null>>;
    setChatMode: Dispatch<SetStateAction<ChatMode>>;
    setSessionStarted: Dispatch<SetStateAction<boolean>>;
    setInputText: Dispatch<SetStateAction<string>>;
    setHintLevel: Dispatch<SetStateAction<number>>;
    setIsGenerating: Dispatch<SetStateAction<boolean>>;
    setTempDifficultyOverride: Dispatch<SetStateAction<CEFRLevel | null>>;
}

export const useLessonManager = (deps: LessonManagerDeps) => {
    const {
        userPreferences, conversationHistory, generatedLessons, savedItems,
        currentStory, tempDifficultyOverride, chatMode, sessionStarted,
        setGeneratedLessons, setCurrentLessonIndex, setCurrentStory,
        setCurrentQuizItem, setCurrentDialogue, setMessages,
        setCurrentConversationId, setChatMode, setSessionStarted,
        setInputText, setHintLevel, setIsGenerating, setTempDifficultyOverride,
    } = deps;

    const triggerLessonGeneration = async (level: CEFRLevel, topics: string[], direction: 'same' | 'harder' | 'easier') => {
        setIsGenerating(true);
        try {
            const sessionTitles = generatedLessons.map(l => l.title);
            const historyTitles = conversationHistory
                .filter(h => h.mode === 'roleplay' && h.context && 'title' in h.context)
                .map(h => (h.context as LessonContext).title);

            const prevTitles = [...new Set([...sessionTitles, ...historyTitles])];

            const newLesson = await generateNextLesson(prevTitles, level, topics);

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

    const handleStartMode = async (mode: ChatMode, forceNew: boolean = false) => {
        if (mode === 'quiz' && savedItems.length === 0) {
            alert("You need to save some vocabulary or grammar items first before starting a quiz!");
            return;
        }

        const isNewSession = !sessionStarted || mode !== chatMode || forceNew;

        setChatMode(mode);
        setSessionStarted(true);

        if (isNewSession) {
            setMessages([]);
            setCurrentConversationId(Date.now().toString());
            if (mode === 'dialogues') {
                setCurrentDialogue(null);
            }
        }
        setInputText('');
        setHintLevel(0);

        if (mode === 'roleplay') {
            if (generatedLessons.length === 0 || forceNew) {
                await triggerLessonGeneration(
                    userPreferences?.level || 'A1-A2',
                    userPreferences?.topics || ['General'],
                    'same'
                );
            }
        } else if (mode === 'story') {
            if (!currentStory || forceNew) {
                setCurrentStory(null);
            }
        } else if (mode === 'quiz' && isNewSession) {
            const selectedItem = selectNextQuizItem(savedItems);
            setCurrentQuizItem(selectedItem);
            const quizQuestion: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Quiz Time! Let's test your memory.\n\nHow would you correctly say or use this in English?\n\n"${selectedItem.original}"\n\n(Hint: It's related to ${selectedItem.type})`,
                timestamp: Date.now()
            };
            setMessages([quizQuestion]);
        }
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
        } else if (chatMode === 'dialogues') {
            setCurrentDialogue(null);
            setMessages(prev => prev.filter(m => m.id !== separatorMsg.id));
        } else if (chatMode === 'quiz') {
            const selectedItem = selectNextQuizItem(savedItems);
            setCurrentQuizItem(selectedItem);
            const quizQuestion: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Next Question!\n\nHow would you correctly say or use this in English?\n\n"${selectedItem.original}"\n\n(Hint: It's related to ${selectedItem.type})`,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, quizQuestion]);
        } else {
            if (chatMode === 'roleplay') {
                await triggerLessonGeneration(nextDifficulty, userPreferences?.topics || ['General'], direction);

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

    const handleSelectStoryContext = async (context: string) => {
        if (!userPreferences) return;
        setIsGenerating(true);
        try {
            const level = tempDifficultyOverride || userPreferences.level;
            const previousStoryTitles = conversationHistory
                .filter(h => h.mode === 'story' && h.context && 'topic' in h.context)
                .map(h => (h.context as StoryScenario).topic);

            const story = await generateStoryScenario(level, 'Custom Context', previousStoryTitles, context);
            setCurrentStory(story);
            setCurrentConversationId(Date.now().toString());

            const openingMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: story.openingLine,
                storyTranslation: story.openingLineVietnamese,
                timestamp: Date.now()
            };
            setMessages([openingMsg]);
        } catch (e) {
            console.error("Failed to generate story from context", e);
            alert("Failed to start story. Please try again.");
        } finally {
            setIsGenerating(false);
        }
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

    return {
        handleStartMode,
        handleNextLesson,
        handleSelectStoryContext,
        handleContinueStory,
    };
};
