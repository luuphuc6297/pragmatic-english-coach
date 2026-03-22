import { useEffect, Dispatch, SetStateAction } from 'react';
import { ChatMessage, ChatMode, LessonContext, StoryScenario, PracticeDialogue, ConversationHistory } from '../types';

interface ConversationTrackerDeps {
    messages: ChatMessage[];
    currentConversationId: string | null;
    chatMode: ChatMode;
    currentLesson: LessonContext | null;
    currentStory: StoryScenario | null;
    currentDialogue: PracticeDialogue | null;
    setConversationHistory: Dispatch<SetStateAction<ConversationHistory[]>>;
}

export const useConversationTracker = ({
    messages,
    currentConversationId,
    chatMode,
    currentLesson,
    currentStory,
    currentDialogue,
    setConversationHistory,
}: ConversationTrackerDeps) => {
    useEffect(() => {
        if (messages.length > 0 && currentConversationId) {
            setConversationHistory(prev => {
                const existingIndex = prev.findIndex(h => h.id === currentConversationId);

                let title = 'Conversation';
                let context: LessonContext | StoryScenario | PracticeDialogue | undefined = undefined;

                if (chatMode === 'roleplay' && currentLesson) {
                    title = currentLesson.title;
                    context = currentLesson;
                } else if (chatMode === 'story' && currentStory) {
                    title = `Story: ${currentStory.topic}`;
                    context = currentStory;
                } else if (chatMode === 'dialogues' && currentDialogue) {
                    title = `Dialogue: ${currentDialogue.title}`;
                    context = currentDialogue;
                } else if (chatMode === 'translator') {
                    title = 'Translation Session';
                } else if (chatMode === 'quiz') {
                    title = 'Vocabulary Quiz';
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
};
