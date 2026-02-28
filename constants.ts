import {LessonContext, CEFRLevel} from './types';

export const ONBOARDING_LEVELS: {id: CEFRLevel; title: string; desc: string; details: string}[] = [
  {
    id: 'A1-A2',
    title: 'Beginner / Elementary',
    desc: 'I can understand basic phrases and everyday needs.',
    details: 'Short sentences (5-8 words), High-frequency vocab.',
  },
  {
    id: 'B1-B2',
    title: 'Intermediate',
    desc: 'I can discuss travel, work, and personal interests.',
    details: 'Complex sentences, Idioms, Past/Future tenses.',
  },
  {
    id: 'C1-C2',
    title: 'Advanced / Mastery',
    desc: 'I am fluent and understand nuance and complex texts.',
    details: 'Native speed, Abstract topics, Rare vocabulary.',
  },
];

// EXPANDED TO 16 TOPICS
export const ONBOARDING_TOPICS = [
  {id: 'travel', label: 'Travel & Survival', icon: '✈️'},
  {id: 'business', label: 'Business & Work', icon: '💼'},
  {id: 'social', label: 'Socializing', icon: '🥂'},
  {id: 'daily', label: 'Daily Life', icon: '🏠'},
  {id: 'tech', label: 'Technology', icon: '💻'},
  {id: 'food', label: 'Food & Dining', icon: '🍜'},
  {id: 'medical', label: 'Medical & Health', icon: '🏥'},
  {id: 'shopping', label: 'Shopping & Fashion', icon: '🛍️'},
  {id: 'entertainment', label: 'Movies & Music', icon: '🎬'},
  {id: 'sports', label: 'Sports & Fitness', icon: '⚽'},
  {id: 'education', label: 'Education & Academic', icon: '🎓'},
  {id: 'environment', label: 'Nature & Environment', icon: '🌿'},
  {id: 'finance', label: 'Money & Finance', icon: '💰'},
  {id: 'relationships', label: 'Love & Relationships', icon: '❤️'},
  {id: 'legal', label: 'Law & Politics', icon: '⚖️'},
  {id: 'property', label: 'Housing & Real Estate', icon: '🔑'},
];

// =========================================================================================
// FALLBACK LIBRARY ONLY
// =========================================================================================
// The app now relies on AI generation (Agent) effectively.
// These are just fallbacks if the API fails immediately.

export const FALLBACK_SCENARIOS: LessonContext[] = [
  {
    id: 'fb1',
    topic: 'social',
    title: 'Meeting a Friend',
    difficulty: 'A1-A2',
    situation: "You meet a friend you haven't seen in a while.",
    vietnamesePhrase: 'Lâu lắm không gặp, dạo này khỏe không?',
    englishPhrase: 'Long time no see, how have you been?',
    hints: {
      level1: 'Greeting after a long time.',
      level2: 'Long time no see, how...',
      level3: 'have you been',
    },
  },
  {
    id: 'fb2',
    topic: 'food',
    title: 'Ordering Coffee',
    difficulty: 'A1-A2',
    situation: 'Ordering a drink at a cafe.',
    vietnamesePhrase: 'Cho mình một ly đen đá ít đường nhé.',
    englishPhrase: "I'd like an iced black coffee with less sugar, please.",
    hints: {
      level1: "Polite request (I'd like...).",
      level2: "I'd like an iced black coffee...",
      level3: 'less sugar',
    },
  },
  {
    id: 'fb3',
    topic: 'travel',
    title: 'Asking Directions',
    difficulty: 'B1-B2',
    situation: 'Lost in a new city.',
    vietnamesePhrase: 'Xin lỗi, bạn có biết trạm xe buýt gần nhất ở đâu không?',
    englishPhrase: 'Excuse me, do you happen to know where the nearest bus stop is?',
    hints: {
      level1: 'Polite indirect question.',
      level2: 'Do you happen to know where...',
      level3: 'nearest / is',
    },
  },
];

export const LESSON_SCENARIOS = FALLBACK_SCENARIOS;
