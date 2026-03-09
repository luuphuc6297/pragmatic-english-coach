export interface WordAnalysis {
  word: string;
  phonetic: string;
  translation: string;
  morphology: {
    prefix?: { morpheme: string; meaning: string };
    root: { morpheme: string; meaning: string; origin: string };
    suffix?: { morpheme: string; meaning: string };
    equation: string;
  };
  contextualEmbedding: {
    positiveExample: { en: string; vn: string };
    negativeExample: { en: string; vn: string };
    collocations: string[];
  };
  derivatives: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  synonyms: string[];
  antonyms: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'topic' | 'category' | 'word';
  translation?: string;
  partOfSpeech?: string;
  context?: string;
  children?: MindMapNode[];
}

export interface CustomNodeResult {
  status: 'connected' | 'unrelated';
  parentNodeId?: string;
  message?: string;
  translation?: string;
  partOfSpeech?: string;
  context?: string;
}
