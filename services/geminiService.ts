import {GoogleGenAI, Type, Schema, Modality, GenerateContentResponse} from '@google/genai';
import {
  AssessmentResult,
  LessonContext,
  CEFRLevel,
  TranslationResult,
  StoryScenario,
} from '../types';

// Declare window.aistudio types for Veo key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

// Initialize Gemini
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

// --- MOCK DATA FOR FALLBACKS ---
const MOCK_ASSESSMENT_RESULT: AssessmentResult = {
  score: 7.8,
  accuracyScore: 8,
  naturalnessScore: 7,
  complexityScore: 8,
  feedback:
    '[DEMO] This is a simulated assessment because the API quota is exhausted. Your sentence structure is solid but could be more idiomatic.',
  correction: null,
  betterAlternative: "I'd appreciate it if you could update me by EOD.",
  analysis:
    "You used the conditional tense correctly. To sound more native in a business context, 'EOD' is common for 'end of day'.",
  grammarAnalysis: 'Grammar Point: Subject-verb agreement is correct. Good use of polite markers.',
  vocabularyAnalysis:
    "Vocabulary Point: 'Update' is a good choice, but consider specific timeframes.",
  improvements: [
    {
      original: 'update me',
      correction: 'update me by EOD',
      type: 'vocabulary',
      explanation: 'Adding a timeframe makes it more actionable.',
    },
  ],
  userTone: 'Polite/Formal',
  alternativeTones: {
    formal: 'I would be grateful for an update at your earliest convenience.',
    friendly: "Can you let me know how it's going later?",
    informal: "Lmk what's up later.",
    conversational: 'Could you give me an update by the end of the day?',
  },
  nextAgentReply: 'Certainly! I will have the report ready for you by 5 PM.',
  nextAgentReplyVietnamese:
    'Chắc chắn rồi! Tôi sẽ chuẩn bị xong báo cáo cho bạn trước 5 giờ chiều.',
};

const MOCK_TRANSLATION_RESULT: TranslationResult = {
  original: 'Simulated Input',
  tones: {
    formal: 'I apologize, but I am currently unavailable to assist.',
    friendly: "Sorry! I can't help right now, maybe later?",
    informal: "Can't do it rn, sorry.",
    conversational: "I'm afraid I'm busy at the moment.",
  },
};

const MOCK_STORY_SCENARIO: StoryScenario = {
  id: 'mock_story_1',
  topic: 'Travel',
  situation:
    '[DEMO MODE] You are checking into a boutique hotel in Paris. The receptionist cannot find your reservation.',
  agentName: 'Sophie',
  openingLine:
    "Bonjour! Welcome to Le Grand Hotel. I am looking for your booking, but I don't see it in the system...",
  openingLineVietnamese:
    'Xin chào! Chào mừng đến với Le Grand Hotel. Tôi đang tìm đơn đặt phòng của bạn, nhưng không thấy trên hệ thống...',
  difficulty: 'B1-B2',
  hints: {
    level1: 'Express concern and show your confirmation.',
    level2: 'I booked it via...',
    level3: 'confirmation / email',
  },
};

const MOCK_LESSON_CONTEXT: LessonContext = {
  id: 'mock_lesson_1',
  topic: 'Business',
  title: '[DEMO] Negotiating a Deadline',
  situation: 'You need to ask your manager for two more days to finish the report.',
  vietnamesePhrase: 'Sếp ơi, em có thể xin thêm 2 ngày để hoàn thiện báo cáo này không?',
  englishPhrase: 'Boss, could I possibly have two more days to finalize this report?',
  difficulty: 'B1-B2',
  hints: {
    level1: 'Use a polite request structure.',
    level2: 'Could I possibly have...',
    level3: 'extension / finalize',
  },
};

// --- RETRY LOGIC HELPER ---
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 1,
  initialDelay = 1000,
): Promise<T> => {
  let lastError: any;
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || JSON.stringify(error);
      const isRateLimit =
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        error?.status === 429;

      if (isRateLimit) {
        console.warn(
          `[Gemini Service] Rate limit hit. Retrying attempt ${i + 1}/${maxRetries} in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

const assessmentSchema: Schema = {
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

const lessonSchema: Schema = {
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

const storySchema: Schema = {
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

const translationSchema: Schema = {
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

export const evaluateResponse = async (
  userInput: string,
  lesson: LessonContext,
  direction: 'VN_to_EN' | 'EN_to_VN' = 'VN_to_EN',
): Promise<AssessmentResult> => {
  const modelId = 'gemini-3-flash-preview';
  const isVnToEn = direction === 'VN_to_EN';
  const sourceLang = isVnToEn ? 'Vietnamese' : 'English';
  const targetLang = isVnToEn ? 'English' : 'Vietnamese';
  const sourcePhrase = isVnToEn ? lesson.vietnamesePhrase : lesson.englishPhrase;

  const systemInstruction = `
Role: You are a strict linguistic expert and CEFR assessor.
Task: Evaluate the User's ${targetLang} translation of a ${sourceLang} source sentence based on a specific Context.
Scoring Rubric (Scale 1-10):
9-10: Native-like, idiomatically perfect for the context. (C2)
7-8: Grammatically correct, fluent, but slightly textbook-like. (B2-C1)
5-6: Grammatically correct but stiff/formal or slight unnatural phrasing. (B1)
3-4: Understandable but with grammatical errors. (A2)
1-2: Incomprehensible or completely wrong meaning. (A1)
Formula: Final Score = 0.4 * Accuracy + 0.4 * Naturalness + 0.2 * Complexity.
Input Context:
Source ${sourceLang}: "${sourcePhrase}"
Situation: "${lesson.situation}"
Target CEFR Level: "${lesson.difficulty}"
User Input to Evaluate (${targetLang}): "${userInput}"
Instructions:
1. Analyze Grammatical Accuracy in ${targetLang}.
2. Analyze Pragmatic Naturalness. Is this how a native speaker sounds in this context?
3. Analyze Vocabulary. Are the words precise?
4. **Identify Specific Improvements**: Find exact substrings in the user's input that are wrong or unnatural. Provide corrections and explanations for each.
5. **Tone Analysis**: Identify the tone of the user's input.
6. **Generate Variations**: Provide 4 distinct versions of the translation in ${targetLang}:
   - Formal
   - Friendly
   - Informal
   - Conversational
7. Provide scores and detailed feedback.
`;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [
          {
            role: 'user',
            parts: [{text: systemInstruction}],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: assessmentSchema,
          temperature: 0.3,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No response from AI');
    return JSON.parse(jsonText) as AssessmentResult;
  } catch (error) {
    console.warn('AI Evaluation Error (Falling back to Mock):', error);
    return MOCK_ASSESSMENT_RESULT;
  }
};

export const generateNextLesson = async (
  previousTitles: string[],
  userLevel: CEFRLevel,
  userTopics: string[],
): Promise<LessonContext> => {
  const modelId = 'gemini-3-flash-preview';
  // Use up to 20 previous titles to ensure better uniqueness
  const recentContext = previousTitles.slice(-20).join(' | ');
  const levelSpecs = {
    'A1-A2':
      'Sentence Length: 5-8 words. Vocabulary: High frequency. Focus: Basic needs, simple questions.',
    'B1-B2':
      'Sentence Length: 12-18 words. Vocabulary: Idioms, phrasal verbs. Focus: Opinions, experiences, polite requests.',
    'C1-C2':
      'Sentence Length: 15-22+ words. Vocabulary: Nuanced, abstract. Focus: Persuasion, hypothesis, subtle humor.',
  };

  const targetSpec = levelSpecs[userLevel] || levelSpecs['A1-A2'];
  const chosenTopic = userTopics[Math.floor(Math.random() * userTopics.length)] || 'General';

  const prompt = `
    You are an expert English teacher creating a realistic roleplay scenario for a Vietnamese student.
    Target Profile:
    - Level: ${userLevel}
    - Topic: ${chosenTopic}
    - Specs: ${targetSpec}
    Instructions:
    1. **Context First**: Create a specific, highly unique, and realistic situation within '${chosenTopic}'.
    2. **Avoid Repetition**: Do NOT use the structure "I need to [verb] the [noun]" or "Please [verb]...".
    3. **Naturalness**: 
       - The Vietnamese phrase MUST sound like real spoken Vietnamese (use particles like 'nhỉ', 'à', 'với', 'hộ mình', 'cái', etc.).
       - The English phrase MUST sound native and appropriate for the context (Slang for friends, Formal for business).
    4. **Variety**: Generate a Question, an Exclamation, a Complaint, or an Idiomatic expression. DO NOT just generate a simple statement.
    5. **STRICT UNIQUENESS**: You MUST NOT generate any scenario that is similar in theme, title, or situation to these previously generated scenarios: [${recentContext}]. Think outside the box and create a completely new sub-topic or situation.
    Output JSON Format:
    {
      "id": "generated_id",
      "title": "Short Title",
      "topic": "${chosenTopic}",
      "situation": "Description of the scene and who is talking to whom.",
      "vietnamesePhrase": "Natural spoken Vietnamese sentence.",
      "englishPhrase": "Natural English equivalent.",
      "difficulty": "${userLevel}",
      "hints": { "level1": "Meaning hint", "level2": "Structure hint", "level3": "Key word" }
    }
    `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: lessonSchema,
          temperature: 0.9,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No content generated');

    const lesson = JSON.parse(jsonText) as LessonContext;
    lesson.id = Date.now().toString();
    lesson.topic = chosenTopic;
    return lesson;
  } catch (error) {
    console.warn('Generation Error (Falling back to Mock):', error);
    return {...MOCK_LESSON_CONTEXT, id: Date.now().toString()};
  }
};

export const generateToneTranslations = async (text: string): Promise<TranslationResult> => {
  const modelId = 'gemini-3-flash-preview';
  const prompt = `
  Translate the following text into English.
  If the text is already English, translate/paraphrase it into English variations.
  Input Text: "${text}"
  You MUST provide 4 distinct tonal variations:
  1. Formal (Business/Professional)
  2. Friendly (Warm/Polite)
  3. Informal (Casual/Slang)
  4. Conversational (Neutral/Daily use)
  Return strictly JSON.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: translationSchema,
          temperature: 0.7,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No translation generated');
    return JSON.parse(jsonText) as TranslationResult;
  } catch (error) {
    console.warn('Translation Error (Falling back to Mock):', error);
    return MOCK_TRANSLATION_RESULT;
  }
};

export const generateStoryScenario = async (
  level: CEFRLevel,
  topic: string,
  previousTitles: string[] = [],
): Promise<StoryScenario> => {
  const modelId = 'gemini-3-flash-preview';
  const recentContext = previousTitles.slice(-20).join(' | ');
  const prompt = `
    Create a conversation starter scenario for an English learner.
    Level: ${level}.
    Topic: ${topic}.
    Instructions:
    1. Define a specific, highly unique situation where the User interacts with an Agent.
    2. Give the Agent a name.
    3. Write the FIRST line (opening line) that the Agent says to the User. It should be a greeting or a question to start the conversation.
    4. Provide the Vietnamese translation for that opening line.
    5. Provide 3 progressive hints for the USER on how to reply to this opening line:
       - Level 1: Meaning/Intent hint (e.g., "You should greet back and ask about...").
       - Level 2: Structure hint (e.g., "Start with 'Hi', then use Present Perfect...").
       - Level 3: Vocabulary hint (e.g., "Use the word '...').
    6. **STRICT UNIQUENESS**: You MUST NOT generate any scenario that is similar in theme, title, or situation to these previously generated scenarios: [${recentContext}]. Think outside the box and create a completely new sub-topic or situation.
    Output JSON.
    `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: storySchema,
          temperature: 0.8,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No story generated');
    const story = JSON.parse(jsonText) as StoryScenario;
    story.id = Date.now().toString();
    return story;
  } catch (error) {
    console.warn('Story Gen Error (Falling back to Mock):', error);
    return {...MOCK_STORY_SCENARIO, id: Date.now().toString()};
  }
};

export const evaluateStoryTurn = async (
  scenario: StoryScenario,
  agentLastMessage: string,
  userReply: string,
): Promise<AssessmentResult> => {
  const modelId = 'gemini-3-flash-preview';
  const prompt = `
    Role: Conversational English Coach.
    Context: 
    - Scene: ${scenario.situation}
    - Agent Name: ${scenario.agentName}
    - Agent just said: "${agentLastMessage}"
    - User replied: "${userReply}"
    - Target Level: ${scenario.difficulty}
    Task:
    1. Evaluate the user's reply for logic (does it make sense?), grammar, and appropriate tone for the situation.
    2. Assign scores (1-10).
    3. **Identify Specific Improvements**: Find exact substrings in the user's input that are wrong or unnatural. Provide corrections and explanations for each.
    4. Generate the Next Logical Reply for the Agent to continue the conversation naturally.
    Return JSON.
    `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: assessmentSchema,
          temperature: 0.4,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No response from AI');

    return JSON.parse(jsonText) as AssessmentResult;
  } catch (error) {
    console.warn('Story Eval Error (Falling back to Mock):', error);
    return MOCK_ASSESSMENT_RESULT;
  }
};

export const evaluateQuizAnswer = async (
  savedItem: SavedItem,
  userAnswer: string,
): Promise<AssessmentResult> => {
  const modelId = 'gemini-3-flash-preview';
  const prompt = `
    Role: Vocabulary and Grammar Quiz Master.
    Context:
    The user is being tested on a saved item from their learning history.
    - Original phrase/context: "${savedItem.original}"
    - Correct target phrase/usage: "${savedItem.correction}"
    - Item Type: ${savedItem.type}
    - Full Context: "${savedItem.context}"
    
    The user's answer to the quiz question is: "${userAnswer}"
    
    Task:
    1. Evaluate if the user's answer correctly demonstrates understanding of the target phrase/usage ("${savedItem.correction}").
    2. Assign scores (1-10). If they nailed it, give high scores.
    3. Provide constructive feedback.
    4. **Identify Specific Improvements**: Find exact substrings in the user's input that are wrong or unnatural. Provide corrections and explanations for each.
    5. Generate the Next Logical Reply (nextAgentReply) which should be a short encouraging message or a follow-up question.
    Return JSON.
    `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: assessmentSchema,
          temperature: 0.4,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No response from AI');

    return JSON.parse(jsonText) as AssessmentResult;
  } catch (error) {
    console.warn('Quiz Eval Error (Falling back to Mock):', error);
    return MOCK_ASSESSMENT_RESULT;
  }
};

export const generateScenarioVideo = async (situation: string, phrase: string): Promise<string> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
  const veoAi = new GoogleGenAI({apiKey: process.env.API_KEY});
  const prompt = `
    Cinematic, realistic 4k video. 
    Context: ${situation}.
    Action: A person clearly and naturally speaking the phrase: "${phrase}".
    Style: Educational, clear facial expressions, high quality, professional lighting.
    `;
  console.log('Starting Video Generation...', prompt);

  try {
    let operation = await retryOperation<any>(() =>
      veoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9',
        },
      }),
    );

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await retryOperation<any>(() =>
        veoAi.operations.getVideosOperation({operation: operation}),
      );
      console.log('Generating video... status:', operation.metadata);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error('No video URI returned');
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    if (error.message?.includes('Requested entity was not found') && window.aistudio) {
      console.log('Key might be invalid or project not found. Prompting re-selection.');
      await window.aistudio.openSelectKey();
    }
    console.error('Video Generation Error:', error);
    throw error;
  }
};

export const generateDictionaryExplanation = async (
  phrase: string,
  context: string,
): Promise<{explanation: string; examples: {en: string; vn: string}[]}> => {
  const modelId = 'gemini-3-flash-preview';
  const prompt = `
    You are an expert English teacher. The user wants to save the phrase/word "${phrase}" from the following context:
    "${context}"

    Please provide:
    1. A clear, concise explanation of what this phrase means in this specific context (in Vietnamese).
    2. 3 practical examples of how to use this phrase in other common situations. Each example must have an English sentence and its Vietnamese translation.

    Output strictly in this JSON format:
    {
        "explanation": "Giải thích ý nghĩa...",
        "examples": [
            { "en": "English example 1", "vn": "Vietnamese translation 1" },
            { "en": "English example 2", "vn": "Vietnamese translation 2" },
            { "en": "English example 3", "vn": "Vietnamese translation 3" }
        ]
    }
    `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: modelId,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
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
            required: ['explanation', 'examples'],
          },
          temperature: 0.7,
        },
      }),
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error('No explanation generated');
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('Dictionary Gen Error:', error);
    return {
      explanation: 'Không thể tạo giải thích lúc này.',
      examples: [],
    };
  }
};

export const generateNativeSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{parts: [{text: text}]}],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {voiceName: 'Kore'},
            },
          },
        },
      }),
    );
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error('No audio generated');
    return base64Audio;
  } catch (e) {
    console.warn('TTS Error (Quota):', e);
    throw e;
  }
};
