import { useEffect } from 'react';
import { UserPreferences, LessonContext, StoryScenario, SavedItem, ConversationHistory, ChatMessage, ChatMode, CEFRLevel, PracticeDialogue, AppUser } from '../types';
import { supabaseService } from '../services/supabaseService';

interface PersistenceState {
    user: AppUser | null;
    isDataLoaded: boolean;
    hasOnboarded: boolean;
    userPreferences: UserPreferences | null;
    completedLessons: Set<string>;
    scoreHistory: number[];
    savedItems: SavedItem[];
    conversationHistory: ConversationHistory[];
    currentConversationId: string | null;
    currentLessonIndex: number;
    generatedLessons: LessonContext[];
    currentStory: StoryScenario | null;
    currentQuizItem: SavedItem | null;
    currentDialogue: PracticeDialogue | null;
    messages: ChatMessage[];
    hintLevel: number;
    chatMode: ChatMode;
    sessionStarted: boolean;
    translationDirection: 'VN_to_EN' | 'EN_to_VN';
    tempDifficultyOverride: CEFRLevel | null;
}

export const usePersistence = (state: PersistenceState) => {
    const {
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
    } = state;

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
            currentDialogue,
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
        currentDialogue,
        messages,
        hintLevel,
        chatMode,
        sessionStarted,
        translationDirection,
        tempDifficultyOverride
    ]);

    useEffect(() => {
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
            
            const timeoutId = setTimeout(() => {
                supabaseService.saveState(user.id, appState);
            }, 1000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [
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
        tempDifficultyOverride
    ]);
};
