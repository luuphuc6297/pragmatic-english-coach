import {GoogleGenAI} from '@google/genai';

export const MODEL_FLASH = 'gemini-3-flash-preview';
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
export const MODEL_VEO = 'veo-3.1-fast-generate-preview';
export const MODEL_PRO = 'ge'

export const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
