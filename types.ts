
export type CEFRLevel = 'A1-A2' | 'B1-B2' | 'C1-C2';
export type ChatMode = 'roleplay' | 'translator' | 'story';

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
  userTone: string; 
  alternativeTones: {
    formal: string;
    friendly: string;
    informal: string;
    conversational: string;
  };
  nextAgentReply?: string; // For Story Mode: The agent's continuation
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