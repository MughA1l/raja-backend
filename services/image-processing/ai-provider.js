import useGemini from './gemini-processing.js';
import useGroq from './groq-processing.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Provider abstraction layer
 * Switches between Gemini and Groq based on AI_PROVIDER environment variable
 *
 * Environment variables:
 * - AI_PROVIDER: 'gemini' | 'groq' (default: 'gemini')
 * - GOOGLE_API_KEY: Required for Gemini
 * - GROQ_API_KEY: Required for Groq
 * - GROQ_MODEL: Optional Groq model (default: 'llama-3.3-70b-versatile')
 */

const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    handler: useGemini,
    requiredEnv: 'GOOGLE_API_KEY',
  },
  groq: {
    name: 'Groq',
    handler: useGroq,
    requiredEnv: 'GROQ_API_KEY',
  },
};

/**
 * Get the current AI provider configuration
 * @returns {string} The provider name
 */
export const getProviderName = () => {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || 'gemini';
  return AI_PROVIDERS[provider]?.name || 'Google Gemini';
};

/**
 * Validate that the required environment variables are set for the provider
 * @param {string} provider - The provider key
 * @throws {Error} If required environment variables are missing
 */
const validateProvider = (provider) => {
  const config = AI_PROVIDERS[provider];
  if (!config) {
    throw new Error(
      `Invalid AI_PROVIDER: "${provider}". Valid options are: ${Object.keys(AI_PROVIDERS).join(', ')}`
    );
  }

  if (!process.env[config.requiredEnv]) {
    throw new Error(
      `Missing required environment variable "${config.requiredEnv}" for ${config.name}`
    );
  }
};

/**
 * Process OCR text using the configured AI provider
 * @param {string} ocrText - The raw OCR text to process
 * @returns {Promise<Array>} The processed result array with ocr, enhancedAIExplanation, and ytKeywords
 */
export const processWithAI = async (ocrText) => {
  const providerKey = process.env.AI_PROVIDER?.toLowerCase() || 'gemini';

  // Validate provider configuration
  validateProvider(providerKey);

  const provider = AI_PROVIDERS[providerKey];
  console.log(`Using AI Provider: ${provider.name}`);

  try {
    const result = await provider.handler(ocrText);

    if (!result) {
      throw new Error(`${provider.name} returned null result`);
    }

    return result;
  } catch (error) {
    console.error(`Error with ${provider.name}:`, error.message);

    // If primary provider fails and fallback is enabled, try the other provider
    if (process.env.AI_FALLBACK_ENABLED === 'true') {
      const fallbackKey = providerKey === 'gemini' ? 'groq' : 'gemini';

      try {
        validateProvider(fallbackKey);
        const fallbackProvider = AI_PROVIDERS[fallbackKey];
        console.log(`Falling back to: ${fallbackProvider.name}`);

        const fallbackResult = await fallbackProvider.handler(ocrText);
        if (fallbackResult) {
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.error(`Fallback provider also failed:`, fallbackError.message);
      }
    }

    throw error;
  }
};

export default processWithAI;
