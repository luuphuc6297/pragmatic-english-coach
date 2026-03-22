import {LessonContext, CEFRLevel} from '../types';

export const ONBOARDING_LEVELS: {id: CEFRLevel; title: string; desc: string; details: string; icon: string; colorClass: string; textClass: string}[] = [
  {
    id: 'A1-A2',
    title: 'Beginner / Elementary',
    desc: 'I can understand basic phrases and everyday needs.',
    details: 'Short sentences (5-8 words), High-frequency vocab.',
    icon: '🌱',
    colorClass: 'bg-tealAccent/10 border-tealAccent shadow-[0_0_20px_rgba(78,217,204,0.3)]',
    textClass: 'text-tealAccent',
  },
  {
    id: 'B1-B2',
    title: 'Intermediate',
    desc: 'I can discuss travel, work, and personal interests.',
    details: 'Complex sentences, Idioms, Past/Future tenses.',
    icon: '🚀',
    colorClass: 'bg-goldAura/10 border-goldAura shadow-[0_0_20px_rgba(249,200,116,0.3)]',
    textClass: 'text-goldAura',
  },
  {
    id: 'C1-C2',
    title: 'Advanced / Mastery',
    desc: 'I am fluent and understand nuance and complex texts.',
    details: 'Native speed, Abstract topics, Rare vocabulary.',
    icon: '👑',
    colorClass: 'bg-purpleAccent/10 border-purpleAccent shadow-[0_0_20px_rgba(138,86,226,0.3)]',
    textClass: 'text-purpleAccent',
  },
];

// EXPANDED TO 16 TOPICS
export const ONBOARDING_TOPICS = [
  {id: 'travel', label: 'Travel & Survival', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Airplane.png', colorClass: 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25'},
  {id: 'business', label: 'Business & Work', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Briefcase.png', colorClass: 'bg-blue-500 text-white border-blue-500 shadow-blue-500/25'},
  {id: 'social', label: 'Socializing', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Clinking%20Glasses.png', colorClass: 'bg-rose-500 text-white border-rose-500 shadow-rose-500/25'},
  {id: 'daily', label: 'Daily Life', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/House.png', colorClass: 'bg-amber-500 text-white border-amber-500 shadow-amber-500/25'},
  {id: 'tech', label: 'Technology', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png', colorClass: 'bg-indigo-500 text-white border-indigo-500 shadow-indigo-500/25'},
  {id: 'food', label: 'Food & Dining', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Steaming%20Bowl.png', colorClass: 'bg-orange-500 text-white border-orange-500 shadow-orange-500/25'},
  {id: 'medical', label: 'Medical & Health', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Hospital.png', colorClass: 'bg-cyan-500 text-white border-cyan-500 shadow-cyan-500/25'},
  {id: 'shopping', label: 'Shopping & Fashion', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shopping%20Bags.png', colorClass: 'bg-pink-500 text-white border-pink-500 shadow-pink-500/25'},
  {id: 'entertainment', label: 'Movies & Music', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clapper%20Board.png', colorClass: 'bg-violet-500 text-white border-violet-500 shadow-violet-500/25'},
  {id: 'sports', label: 'Sports & Fitness', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Soccer%20Ball.png', colorClass: 'bg-red-500 text-white border-red-500 shadow-red-500/25'},
  {id: 'education', label: 'Education & Academic', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png', colorClass: 'bg-blue-600 text-white border-blue-600 shadow-blue-600/25'},
  {id: 'environment', label: 'Nature & Environment', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Herb.png', colorClass: 'bg-green-500 text-white border-green-500 shadow-green-500/25'},
  {id: 'finance', label: 'Money & Finance', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Money%20Bag.png', colorClass: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/25'},
  {id: 'relationships', label: 'Love & Relationships', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Red%20Heart.png', colorClass: 'bg-rose-600 text-white border-rose-600 shadow-rose-600/25'},
  {id: 'legal', label: 'Law & Politics', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Balance%20Scale.png', colorClass: 'bg-slate-500 text-white border-slate-500 shadow-slate-500/25'},
  {id: 'property', label: 'Housing & Real Estate', icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Key.png', colorClass: 'bg-amber-600 text-white border-amber-600 shadow-amber-600/25'},
];

export const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/9.x/micah/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/micah/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/micah/svg?seed=Jude&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/micah/svg?seed=Molly&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/micah/svg?seed=Oliver&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/micah/svg?seed=Sam&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/micah/svg?seed=Jack&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/micah/svg?seed=Lily&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/micah/svg?seed=Mia&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/micah/svg?seed=Leo&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/micah/svg?seed=Zoe&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/micah/svg?seed=Max&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/micah/svg?seed=Ava&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/micah/svg?seed=Eli&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/micah/svg?seed=Nia&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/micah/svg?seed=Ian&backgroundColor=b6e3f4',
];

export const BOT_AVATAR = 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=AuraBot&backgroundColor=0ea5e9';

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
