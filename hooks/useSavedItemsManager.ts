import { Dispatch, SetStateAction } from 'react';
import { ChatMessage, LessonContext, UserPreferences, CEFRLevel, ChatMode, SavedItem } from '../types';
import { generateNextLesson, generateDictionaryExplanation } from '../services/geminiService';

interface SavedItemsManagerDeps {
    savedItems: SavedItem[];
    generatedLessons: LessonContext[];
    userPreferences: UserPreferences | null;
    setSavedItems: Dispatch<SetStateAction<SavedItem[]>>;
    setShowSavedItems: Dispatch<SetStateAction<boolean>>;
    setChatMode: Dispatch<SetStateAction<ChatMode>>;
    setSessionStarted: Dispatch<SetStateAction<boolean>>;
    setIsGenerating: Dispatch<SetStateAction<boolean>>;
    setGeneratedLessons: Dispatch<SetStateAction<LessonContext[]>>;
    setCurrentLessonIndex: Dispatch<SetStateAction<number>>;
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    setCurrentConversationId: Dispatch<SetStateAction<string | null>>;
}

export const useSavedItemsManager = (deps: SavedItemsManagerDeps) => {
    const {
        savedItems, generatedLessons, userPreferences,
        setSavedItems, setShowSavedItems, setChatMode, setSessionStarted,
        setIsGenerating, setGeneratedLessons, setCurrentLessonIndex,
        setMessages, setCurrentConversationId,
    } = deps;

    const handleSaveItem = async (item: SavedItem) => {
        if (!savedItems.find(i => i.id === item.id)) {
            const newItem = {
                ...item,
                nextReviewDate: Date.now(),
                interval: 0,
                easeFactor: 2.5,
                reviewCount: 0
            };
            setSavedItems(prev => [newItem, ...prev]);

            if (item.type === 'vocabulary') {
                try {
                    const dictData = await generateDictionaryExplanation(item.correction, item.context);
                    setSavedItems(prev => prev.map(i =>
                        i.id === item.id
                            ? { ...i, explanation: dictData.explanation, examples: dictData.examples, partOfSpeech: dictData.partOfSpeech }
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

    const handleUpdateItem = (updatedItem: SavedItem) => {
        setSavedItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    };

    const handlePracticeItem = async (item: SavedItem) => {
        setShowSavedItems(false);
        setChatMode('roleplay');
        setSessionStarted(true);

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

            setMessages([]);
            setCurrentConversationId(Date.now().toString());
        } catch (e) {
            console.error("Failed to generate practice lesson", e);
        } finally {
            setIsGenerating(false);
        }
    };

    return { handleSaveItem, handleDeleteItem, handleUpdateItem, handlePracticeItem };
};
