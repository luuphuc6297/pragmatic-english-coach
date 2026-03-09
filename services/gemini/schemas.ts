import {Type, Schema} from '@google/genai';

export const assessmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: 'Overall score on a scale of 1-10 based on CEFR mapping.',
    },
    accuracyScore: {
      type: Type.NUMBER,
      description: 'Score for grammatical accuracy (1-10).',
    },
    naturalnessScore: {
      type: Type.NUMBER,
      description: 'Score for pragmatic naturalness (1-10).',
    },
    complexityScore: {
      type: Type.NUMBER,
      description: 'Score for vocabulary complexity (1-10).',
    },
    feedback: {
      type: Type.STRING,
      description: 'General constructive feedback.',
    },
    grammarAnalysis: {
      type: Type.STRING,
      description: "Specific analysis of grammatical errors. Start with 'Grammar Point:'.",
    },
    vocabularyAnalysis: {
      type: Type.STRING,
      description:
        "Specific analysis of vocabulary choice/appropriateness. Start with 'Vocabulary Point:'.",
    },
    correction: {
      type: Type.STRING,
      description: 'Corrected version if the user input is grammatically wrong. Null if correct.',
      nullable: true,
    },
    betterAlternative: {
      type: Type.STRING,
      description:
        'A more natural/native phrasing if the user input is correct but unnatural. Null if perfect.',
      nullable: true,
    },
    analysis: {
      type: Type.STRING,
      description: 'Detailed summary of why this score was given.',
    },
    improvements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: "The exact substring from the user's input that needs improvement.",
          },
          correction: {
            type: Type.STRING,
            description: 'The corrected word or phrase.',
          },
          type: {type: Type.STRING, enum: ['grammar', 'vocabulary']},
          explanation: {
            type: Type.STRING,
            description: 'Short explanation of why this change is needed.',
          },
        },
        required: ['original', 'correction', 'type', 'explanation'],
      },
    },
    userTone: {
      type: Type.STRING,
      description:
        "The detected tone/register of the user's input (e.g., 'Too Formal', 'Casual', 'Rude', 'Neutral').",
    },
    alternativeTones: {
      type: Type.OBJECT,
      properties: {
        formal: {
          type: Type.STRING,
          description: 'A formal/business appropriate version.',
        },
        friendly: {
          type: Type.STRING,
          description: 'A warm, friendly version.',
        },
        informal: {
          type: Type.STRING,
          description: 'A very casual or slang version.',
        },
        conversational: {
          type: Type.STRING,
          description: 'A standard, neutral conversational version.',
        },
      },
      required: ['formal', 'friendly', 'informal', 'conversational'],
    },
    nextAgentReply: {
      type: Type.STRING,
      description: 'The next logical response from the Agent to continue the story conversation.',
      nullable: true,
    },
    nextAgentReplyVietnamese: {
      type: Type.STRING,
      description: 'The Vietnamese translation of the nextAgentReply.',
      nullable: true,
    },
  },
  required: [
    'score',
    'accuracyScore',
    'naturalnessScore',
    'complexityScore',
    'feedback',
    'grammarAnalysis',
    'vocabularyAnalysis',
    'analysis',
    'improvements',
    'userTone',
    'alternativeTones',
  ],
};

export const lessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: {type: Type.STRING},
    title: {type: Type.STRING},
    situation: {type: Type.STRING},
    vietnamesePhrase: {type: Type.STRING},
    englishPhrase: {
      type: Type.STRING,
      description: 'The English translation of the Vietnamese phrase, matching the tone.',
    },
    difficulty: {type: Type.STRING, enum: ['A1-A2', 'B1-B2', 'C1-C2']},
    hints: {
      type: Type.OBJECT,
      properties: {
        level1: {type: Type.STRING},
        level2: {type: Type.STRING},
        level3: {type: Type.STRING},
      },
      required: ['level1', 'level2', 'level3'],
    },
  },
  required: [
    'id',
    'title',
    'situation',
    'vietnamesePhrase',
    'englishPhrase',
    'difficulty',
    'hints',
  ],
};

export const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: {type: Type.STRING},
    topic: {type: Type.STRING},
    situation: {
      type: Type.STRING,
      description: 'Detailed background of the conversation scene.',
    },
    agentName: {
      type: Type.STRING,
      description: 'Name of the character the AI is playing.',
    },
    openingLine: {
      type: Type.STRING,
      description: 'The first sentence spoken by the Agent (in English).',
    },
    openingLineVietnamese: {
      type: Type.STRING,
      description: 'Vietnamese translation of the opening line.',
    },
    difficulty: {type: Type.STRING, enum: ['A1-A2', 'B1-B2', 'C1-C2']},
    hints: {
      type: Type.OBJECT,
      properties: {
        level1: {
          type: Type.STRING,
          description: 'Hint about the meaning/intent of how to reply.',
        },
        level2: {
          type: Type.STRING,
          description: 'Hint about the sentence structure.',
        },
        level3: {
          type: Type.STRING,
          description: 'Hint about key vocabulary to use.',
        },
      },
      required: ['level1', 'level2', 'level3'],
    },
  },
  required: [
    'id',
    'topic',
    'situation',
    'agentName',
    'openingLine',
    'openingLineVietnamese',
    'difficulty',
    'hints',
  ],
};

export const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    original: {type: Type.STRING},
    tones: {
      type: Type.OBJECT,
      properties: {
        formal: {
          type: Type.STRING,
          description: 'Formal, business-appropriate version.',
        },
        friendly: {type: Type.STRING, description: 'Warm, friendly version.'},
        informal: {
          type: Type.STRING,
          description: 'Casual, slang, or close-friend version.',
        },
        conversational: {
          type: Type.STRING,
          description: 'Neutral, everyday conversational version.',
        },
      },
      required: ['formal', 'friendly', 'informal', 'conversational'],
    },
  },
  required: ['original', 'tones'],
};

export const dictionarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    partOfSpeech: {type: Type.STRING},
    explanation: {type: Type.STRING},
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          en: {type: Type.STRING},
          vn: {type: Type.STRING},
        },
        required: ['en', 'vn'],
      },
    },
  },
  required: ['partOfSpeech', 'explanation', 'examples'],
};

export const wordAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: {type: Type.STRING},
    phonetic: {type: Type.STRING},
    translation: {type: Type.STRING},
    morphology: {
      type: Type.OBJECT,
      properties: {
        prefix: {
          type: Type.OBJECT,
          properties: {morpheme: {type: Type.STRING}, meaning: {type: Type.STRING}},
          required: ['morpheme', 'meaning'],
        },
        root: {
          type: Type.OBJECT,
          properties: {
            morpheme: {type: Type.STRING},
            meaning: {type: Type.STRING},
            origin: {type: Type.STRING},
          },
          required: ['morpheme', 'meaning', 'origin'],
        },
        suffix: {
          type: Type.OBJECT,
          properties: {morpheme: {type: Type.STRING}, meaning: {type: Type.STRING}},
          required: ['morpheme', 'meaning'],
        },
        equation: {type: Type.STRING},
      },
      required: ['root', 'equation'],
    },
    contextualEmbedding: {
      type: Type.OBJECT,
      properties: {
        positiveExample: {
          type: Type.OBJECT,
          properties: {en: {type: Type.STRING}, vn: {type: Type.STRING}},
          required: ['en', 'vn'],
        },
        negativeExample: {
          type: Type.OBJECT,
          properties: {en: {type: Type.STRING}, vn: {type: Type.STRING}},
          required: ['en', 'vn'],
        },
        collocations: {type: Type.ARRAY, items: {type: Type.STRING}},
      },
      required: ['positiveExample', 'negativeExample', 'collocations'],
    },
    derivatives: {
      type: Type.OBJECT,
      properties: {
        noun: {type: Type.STRING},
        verb: {type: Type.STRING},
        adjective: {type: Type.STRING},
        adverb: {type: Type.STRING},
      },
    },
    synonyms: {type: Type.ARRAY, items: {type: Type.STRING}},
    antonyms: {type: Type.ARRAY, items: {type: Type.STRING}},
  },
  required: [
    'word',
    'phonetic',
    'translation',
    'morphology',
    'contextualEmbedding',
    'derivatives',
    'synonyms',
    'antonyms',
  ],
};

const mindMapNodeProperties = {
  id: {type: Type.STRING},
  label: {type: Type.STRING},
  type: {type: Type.STRING, enum: ['topic', 'category', 'word']},
  translation: {type: Type.STRING},
  partOfSpeech: {type: Type.STRING},
  context: {type: Type.STRING},
};

const mindMapNodeRequired = ['id', 'label', 'type', 'translation', 'partOfSpeech', 'context'];

export const mindMapRootSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ...mindMapNodeProperties,
    children: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: mindMapNodeProperties,
        required: mindMapNodeRequired,
      },
    },
  },
  required: [...mindMapNodeRequired, 'children'],
};

export const mindMapChildrenSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: mindMapNodeProperties,
    required: mindMapNodeRequired,
  },
};

export const customNodeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {type: Type.STRING, enum: ['connected', 'unrelated']},
    parentNodeId: {type: Type.STRING, description: 'The ID of the best parent node if connected.'},
    message: {type: Type.STRING, description: 'Explanation if unrelated.'},
    translation: {type: Type.STRING},
    partOfSpeech: {type: Type.STRING},
    context: {type: Type.STRING},
  },
  required: ['status'],
};

export const exerciseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: {type: Type.STRING},
      type: {type: Type.STRING, enum: ['fill-in-the-blank', 'sentence-construction']},
      question: {type: Type.STRING},
      options: {type: Type.ARRAY, items: {type: Type.STRING}},
      answer: {type: Type.STRING},
      hint: {type: Type.STRING},
      explanation: {type: Type.STRING},
      targetWord: {type: Type.STRING},
    },
    required: ['id', 'type', 'question', 'answer', 'explanation', 'targetWord'],
  },
};
