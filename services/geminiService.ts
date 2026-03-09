import {
  GoogleGenAI,
  Modality,
  GenerateContentResponse,
  GenerateVideosOperation,
} from '@google/genai';
import {
  AssessmentResult,
  LessonContext,
  CEFRLevel,
  TranslationResult,
  StoryScenario,
  Exercise,
  SavedItem,
} from '../types';
import {ai, MODEL_FLASH, MODEL_TTS, MODEL_VEO} from './gemini/config';
import {retryOperation, parseJsonResponse} from './gemini/helpers';
import {
  assessmentSchema,
  lessonSchema,
  storySchema,
  translationSchema,
  dictionarySchema,
  wordAnalysisSchema,
  mindMapRootSchema,
  mindMapChildrenSchema,
  customNodeSchema,
  exerciseSchema,
} from './gemini/schemas';
import {
  MOCK_ASSESSMENT_RESULT,
  MOCK_TRANSLATION_RESULT,
  MOCK_STORY_SCENARIO,
  MOCK_LESSON_CONTEXT,
} from './gemini/mocks';
import {
  buildEvaluateResponsePrompt,
  buildGenerateNextLessonPrompt,
  buildToneTranslationPrompt,
  buildStoryScenarioPrompt,
  buildStoryTurnPrompt,
  buildQuizEvaluationPrompt,
  buildVideoPrompt,
  buildDictionaryPrompt,
  buildWordAnalysisPrompt,
  buildMindMapRootPrompt,
  buildMindMapExpandPrompt,
  buildCustomNodePrompt,
  buildExercisesPrompt,
} from './gemini/prompts';

export type {WordAnalysis, MindMapNode, CustomNodeResult} from './gemini/types';
import type {WordAnalysis, MindMapNode, CustomNodeResult} from './gemini/types';

export const evaluateResponse = async (
  userInput: string,
  lesson: LessonContext,
  direction: 'VN_to_EN' | 'EN_to_VN' = 'VN_to_EN',
): Promise<AssessmentResult> => {
  const prompt = buildEvaluateResponsePrompt(userInput, lesson, direction);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: assessmentSchema,
          temperature: 0.3,
        },
      }),
    );
    return parseJsonResponse<AssessmentResult>(response, 'evaluateResponse');
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
  const {prompt, chosenTopic} = buildGenerateNextLessonPrompt(previousTitles, userLevel, userTopics);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: lessonSchema,
          temperature: 0.9,
        },
      }),
    );

    const lesson = parseJsonResponse<LessonContext>(response, 'generateNextLesson');
    lesson.id = Date.now().toString();
    lesson.topic = chosenTopic;
    return lesson;
  } catch (error) {
    console.warn('Generation Error (Falling back to Mock):', error);
    return {...MOCK_LESSON_CONTEXT, id: Date.now().toString()};
  }
};

export const generateToneTranslations = async (text: string): Promise<TranslationResult> => {
  const prompt = buildToneTranslationPrompt(text);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: translationSchema,
          temperature: 0.7,
        },
      }),
    );
    return parseJsonResponse<TranslationResult>(response, 'generateToneTranslations');
  } catch (error) {
    console.warn('Translation Error (Falling back to Mock):', error);
    return MOCK_TRANSLATION_RESULT;
  }
};

export const generateStoryScenario = async (
  level: CEFRLevel,
  topic: string,
  previousTitles: string[] = [],
  customContext?: string,
): Promise<StoryScenario> => {
  const prompt = buildStoryScenarioPrompt(level, topic, previousTitles, customContext);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: storySchema,
          temperature: 0.8,
        },
      }),
    );

    const story = parseJsonResponse<StoryScenario>(response, 'generateStoryScenario');
    story.id = Date.now().toString();

    if (customContext) {
      story.topic =
        customContext.length > 50 ? customContext.substring(0, 50) + '...' : customContext;
    }

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
  const prompt = buildStoryTurnPrompt(scenario, agentLastMessage, userReply);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: assessmentSchema,
          temperature: 0.4,
        },
      }),
    );
    return parseJsonResponse<AssessmentResult>(response, 'evaluateStoryTurn');
  } catch (error) {
    console.warn('Story Eval Error (Falling back to Mock):', error);
    return MOCK_ASSESSMENT_RESULT;
  }
};

export const evaluateQuizAnswer = async (
  savedItem: SavedItem,
  userAnswer: string,
): Promise<AssessmentResult> => {
  const prompt = buildQuizEvaluationPrompt(savedItem, userAnswer);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: assessmentSchema,
          temperature: 0.4,
        },
      }),
    );
    return parseJsonResponse<AssessmentResult>(response, 'evaluateQuizAnswer');
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
  const veoAi = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  const prompt = buildVideoPrompt(situation, phrase);
  console.log('Starting Video Generation...', prompt);

  try {
    let operation = await retryOperation<GenerateVideosOperation>(
      () =>
        veoAi.models.generateVideos({
          model: MODEL_VEO,
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9',
          },
        }),
      3,
      2000,
    );

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await retryOperation<GenerateVideosOperation>(
        () => veoAi.operations.getVideosOperation({operation: operation}),
        3,
        2000,
      );
      console.log('Generating video... status:', operation.metadata);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error('No video URI returned');
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || '',
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : null;
    if (errObj?.message?.includes('Requested entity was not found') && window.aistudio) {
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
): Promise<{explanation: string; examples: {en: string; vn: string}[]; partOfSpeech: string}> => {
  const prompt = buildDictionaryPrompt(phrase, context);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: dictionarySchema,
          temperature: 0.7,
        },
      }),
    );
    return parseJsonResponse(response, 'generateDictionaryExplanation');
  } catch (error) {
    console.warn('Dictionary Gen Error:', error);
    return {
      partOfSpeech: 'Unknown',
      explanation: 'Không thể tạo giải thích lúc này.',
      examples: [],
    };
  }
};

export const generateWordAnalysis = async (
  word: string,
  context?: string,
): Promise<WordAnalysis> => {
  const prompt = buildWordAnalysisPrompt(word, context);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: wordAnalysisSchema,
          temperature: 0.2,
        },
      }),
    );
    return parseJsonResponse<WordAnalysis>(response, 'generateWordAnalysis');
  } catch (error) {
    console.error('Word Analysis Error:', error);
    throw error;
  }
};

export const generateTopicMindMap = async (
  topic: string,
  level: CEFRLevel,
): Promise<MindMapNode> => {
  const prompt = buildMindMapRootPrompt(topic, level);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: mindMapRootSchema,
          temperature: 0.2,
        },
      }),
    );
    return parseJsonResponse<MindMapNode>(response, 'generateTopicMindMap');
  } catch (error) {
    console.error('Mind Map Generation Error:', error);
    throw error;
  }
};

export const expandMindMapNode = async (
  nodeLabel: string,
  rootTopic: string,
  level: CEFRLevel,
): Promise<MindMapNode[]> => {
  const prompt = buildMindMapExpandPrompt(nodeLabel, rootTopic, level);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: mindMapChildrenSchema,
          temperature: 0.2,
        },
      }),
    );
    return parseJsonResponse<MindMapNode[]>(response, 'expandMindMapNode');
  } catch (error) {
    console.error('Mind Map Expansion Error:', error);
    throw error;
  }
};

export const analyzeCustomNode = async (
  customWord: string,
  mindMapData: MindMapNode,
): Promise<CustomNodeResult> => {
  const prompt = buildCustomNodePrompt(customWord, mindMapData);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: customNodeSchema,
          temperature: 0.1,
        },
      }),
    );
    return parseJsonResponse<CustomNodeResult>(response, 'analyzeCustomNode');
  } catch (error) {
    console.error('Custom Node Analysis Error:', error);
    throw error;
  }
};

export const generateNativeSpeech = async (text: string): Promise<string> => {
  const ttsAi = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ttsAi.models.generateContent({
        model: MODEL_TTS,
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

export const generateExercises = async (
  savedItems: SavedItem[],
  count: number = 5,
): Promise<Exercise[]> => {
  if (!savedItems || savedItems.length === 0) return [];

  const shuffled = [...savedItems].sort(() => 0.5 - Math.random());
  const selectedItems = shuffled.slice(0, count);

  const vocabList = selectedItems.map((item) => ({
    word: item.correction,
    context: item.context || item.original,
  }));

  const prompt = buildExercisesPrompt(vocabList);

  try {
    const response = await retryOperation<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          responseMimeType: 'application/json',
          responseSchema: exerciseSchema,
          temperature: 0.7,
        },
      }),
    );
    return parseJsonResponse<Exercise[]>(response, 'generateExercises');
  } catch (error) {
    console.error('Exercise Generation Error:', error);
    throw error;
  }
};
