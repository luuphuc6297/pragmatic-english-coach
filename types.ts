
export type CEFRLevel = 'A1-A2' | 'B1-B2' | 'C1-C2';
export type ChatMode = 'roleplay' | 'translator' | 'story' | 'quiz' | 'vocab_hub' | 'dialogues';

export type ExerciseType = 'fill-in-the-blank' | 'sentence-construction';

export interface PracticeDialogue {
  id: string;
  title: string;
  description: string;
  difficulty: CEFRLevel;
  roles: {
    user: string;
    ai: string;
  };
  scenario: string;
  startingLine: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[]; // For multiple choice fill-in-the-blank
  answer: string;
  hint?: string;
  explanation: string;
  targetWord: string;
}

export interface UserPreferences {
  name: string; // Added user name
  level: CEFRLevel;
  topics: string[];
}

export interface LessonContext {
  id: string;
  topic: string; 
  title: string;
  situation: string; 
  vietnamesePhrase: string; 
  englishPhrase: string; 
  difficulty: CEFRLevel;
  hints: {
    level1: string; 
    level2: string; 
    level3: string; 
  };
}

export interface StoryScenario {
  id: string;
  topic: string;
  situation: string; // The background context
  agentName: string;
  openingLine: string; // The English starting line
  openingLineVietnamese: string; // Collapsible translation
  difficulty: CEFRLevel;
  hints: { // Hints for the user's reply
    level1: string; 
    level2: string; 
    level3: string; 
  };
}

export interface Improvement {
  original: string; // The phrase in user's input
  correction: string; // The better version
  type: 'grammar' | 'vocabulary';
  explanation: string;
}

export interface SavedItem {
  id: string;
  original: string;
  correction: string;
  type: 'grammar' | 'vocabulary';
  context: string; // The full sentence where it appeared
  timestamp: number;
  masteryScore: number; // 0-100
  explanation?: string;
  examples?: { en: string; vn: string }[];
  partOfSpeech?: string; // e.g., Noun, Verb, Adjective, Phrasal Verb, etc.
  
  // Spaced Repetition fields
  nextReviewDate?: number; // timestamp
  interval?: number; // in days
  easeFactor?: number; // default 2.5
  reviewCount?: number;
  
  // Organization
  category?: string;
}

export interface AssessmentResult {
  score: number; // 1-10
  accuracyScore: number;
  naturalnessScore: number;
  complexityScore: number;
  feedback: string;
  correction: string | null;
  betterAlternative: string | null;
  analysis: string;
  grammarAnalysis: string; 
  vocabularyAnalysis: string; 
  improvements: Improvement[]; // Structured errors/suggestions
  userTone: string; 
  alternativeTones: {
    formal: string;
    friendly: string;
    informal: string;
    conversational: string;
  };
  nextAgentReply?: string; // For Story Mode: The agent's continuation
  nextAgentReplyVietnamese?: string; // For Story Mode: The translation of the agent's continuation
}

export interface TranslationResult {
  original: string;
  tones: {
    formal: string;
    friendly: string;
    informal: string;
    conversational: string;
  };
}

export interface ConversationHistory {
  id: string;
  mode: ChatMode;
  timestamp: number;
  title: string;
  messages: ChatMessage[];
  context?: LessonContext | StoryScenario | PracticeDialogue;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  generatedVideoUrl?: string; 
  assessment?: AssessmentResult;
  translation?: TranslationResult; 
  storyTranslation?: string; // For Story Mode: The Vietnamese translation of the agent's line
  timestamp: number;
}