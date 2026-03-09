import {GenerateContentResponse} from '@google/genai';

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 1,
  initialDelay = 1000,
): Promise<T> => {
  let lastError: unknown;
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      const errObj = error as { message?: string; status?: number };
      const msg = errObj?.message || JSON.stringify(error);
      const isRateLimit =
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        errObj?.status === 429 ||
        errObj?.status === 503;

      if (isRateLimit) {
        console.warn(
          `[Gemini Service] Transient error hit (${errObj?.status || 'unknown'}). Retrying attempt ${i + 1}/${maxRetries} in ${delay}ms`,
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

export const parseJsonResponse = <T>(response: GenerateContentResponse, errorLabel: string): T => {
  const jsonText = response.text;
  if (!jsonText) throw new Error(`No response from AI (${errorLabel})`);
  return JSON.parse(jsonText) as T;
};
