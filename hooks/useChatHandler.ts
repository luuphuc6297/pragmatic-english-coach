import {Dispatch, SetStateAction} from 'react';
import {ChatMessage, LessonContext, ChatMode, StoryScenario, SavedItem} from '../types';
import {
  evaluateResponse,
  generateToneTranslations,
  evaluateStoryTurn,
  evaluateQuizAnswer,
} from '../services/geminiService';

interface ChatHandlerDeps {
  inputText: string;
  chatMode: ChatMode;
  currentStory: StoryScenario | null;
  currentQuizItem: SavedItem | null;
  currentLesson: LessonContext | null;
  messages: ChatMessage[];
  completedLessons: Set<string>;
  translationDirection: 'VN_to_EN' | 'EN_to_VN';
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setInputText: Dispatch<SetStateAction<string>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setScoreHistory: Dispatch<SetStateAction<number[]>>;
  setCompletedLessons: Dispatch<SetStateAction<Set<string>>>;
  setSavedItems: Dispatch<SetStateAction<SavedItem[]>>;
}

export const useChatHandler = (deps: ChatHandlerDeps) => {
  const {
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
  } = deps;

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (chatMode === 'translator') {
        const translations = await generateToneTranslations(userMsg.content);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here are 4 ways to say that:',
          translation: translations,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (chatMode === 'story') {
        if (!currentStory) return;
        const lastAgentMsg =
          messages.filter((m) => m.role === 'assistant').pop()?.content || currentStory.openingLine;
        const result = await evaluateStoryTurn(currentStory, lastAgentMsg, userMsg.content);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          assessment: result,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setScoreHistory((prev) => [...prev, result.score]);
      } else if (chatMode === 'quiz') {
        if (!currentQuizItem) return;
        const result = await evaluateQuizAnswer(currentQuizItem, userMsg.content);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.nextAgentReply || 'Here is my evaluation:',
          assessment: result,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setScoreHistory((prev) => [...prev, result.score]);

        setSavedItems((prev) =>
          prev.map((item) => {
            if (item.id === currentQuizItem.id) {
              const quality = Math.max(0, Math.min(5, Math.floor(result.score / 2)));

              let newInterval = item.interval || 0;
              let newReviewCount = (item.reviewCount || 0) + 1;
              let newEaseFactor =
                (item.easeFactor || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

              if (newEaseFactor < 1.3) newEaseFactor = 1.3;

              if (quality < 3) {
                newReviewCount = 0;
                newInterval = 1;
              } else {
                if (newReviewCount === 1) {
                  newInterval = 1;
                } else if (newReviewCount === 2) {
                  newInterval = 6;
                } else {
                  newInterval = Math.round(newInterval * newEaseFactor);
                }
              }

              const nextReviewDate = Date.now() + newInterval * 24 * 60 * 60 * 1000;

              return {
                ...item,
                masteryScore: Math.min(100, item.masteryScore + result.score * 10),
                interval: newInterval,
                easeFactor: newEaseFactor,
                reviewCount: newReviewCount,
                nextReviewDate: nextReviewDate,
              };
            }
            return item;
          }),
        );
      } else {
        if (!currentLesson) return;
        const result = await evaluateResponse(userMsg.content, currentLesson, translationDirection);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here is my evaluation of your response:',
          assessment: result,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setScoreHistory((prev) => [...prev, result.score]);
        if (!completedLessons.has(currentLesson.id)) {
          setCompletedLessons((prev) => new Set(prev).add(currentLesson.id));
        }
      }
    } catch (error) {
      console.error('Error processing message', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? {...m, ...updates} : m)));
  };

  return {handleSendMessage, handleUpdateMessage};
};
