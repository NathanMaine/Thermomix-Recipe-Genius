/**
 * Multi-provider AI service for recipe generation.
 * Supports Gemini and Grok APIs for generating and converting recipes.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { ThermomixRecipe, AIProvider, AIProviderConfig } from '../types';

/**
 * Configuration for supported AI providers.
 */
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'s advanced AI model for recipe generation',
    apiKeyUrl: 'https://ai.google.dev/',
    model: 'gemini-1.5-pro',
  },
  grok: {
    name: 'Grok (xAI)',
    description: 'xAI\'s helpful and maximally truthful AI',
    apiKeyUrl: 'https://console.x.ai/',
    model: 'grok-2-1212',
  },
};

/**
 * Schema definition for structured recipe output.
 * Ensures consistent JSON structure for all generated recipes.
 */
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The title of the recipe." },
    description: { type: Type.STRING, description: "A brief, enticing description of the dish." },
    servings: { type: Type.STRING, description: "The number of servings, e.g., '4 people'." },
    totalTime: { type: Type.STRING, description: "The estimated total time to prepare the dish, e.g., '45 minutes'." },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.STRING, description: "The quantity and unit, e.g., '100 g' or '1 tsp'." },
          name: { type: Type.STRING, description: "The name of the ingredient, e.g., 'Onion, quartered'." },
        },
        required: ["amount", "name"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          instruction: { type: Type.STRING, description: "The specific action to perform." },
          duration: { type: Type.STRING, nullable: true, description: "Time for the operation, e.g., '3 sec' or '10 min'." },
          speed: { type: Type.STRING, nullable: true, description: "Thermomix speed setting, e.g., 'Speed 5', 'Spoon speed', or 'Kneading function'." },
          temperature: { type: Type.STRING, nullable: true, description: "Temperature setting, e.g., '100°C' or 'Varoma'." },
        },
        required: ["instruction"],
      },
    },
  },
  required: ["title", "description", "servings", "totalTime", "ingredients", "steps"],
};

/**
 * Generates a new Thermomix recipe or converts an existing recipe using the specified AI provider.
 *
 * @param prompt - The user's input (recipe description for generation, or recipe text/URL for conversion)
 * @param mode - Whether to 'generate' a new recipe or 'convert' an existing one
 * @param provider - The AI provider to use ('gemini' or 'grok')
 * @param apiKey - The user's API key for the specified provider
 * @returns Promise resolving to a structured ThermomixRecipe object
 * @throws Error if API call fails or response parsing fails
 */
export const generateOrConvertRecipe = async (
  prompt: string,
  mode: 'generate' | 'convert',
  provider: AIProvider,
  apiKey: string
): Promise<ThermomixRecipe> => {
  // Validate API key
  if (!apiKey) {
    const providerConfig = AI_PROVIDERS[provider];
    throw new Error(`API key is required for ${providerConfig.name}. Please set your API key in settings.`);
  }

  // System instruction to guide the AI's behavior
  const systemInstruction = `You are an expert chef specializing in creating and adapting recipes for the Thermomix TM6. You understand all its functions (e.g., chopping, mixing, kneading, cooking, steaming, weighing), speeds (Spoon, 1-10, Turbo), temperature settings, and special modes (e.g., Kneading, Varoma). Your output must be a valid JSON object with exactly these fields: title (string), description (string), servings (string), totalTime (string), ingredients (array of objects with amount and name), and steps (array of objects with instruction, and optional duration, speed, temperature).

IMPORTANT: Return ONLY the JSON object, without any markdown formatting, code blocks, or additional text. The JSON must include all required fields: title and steps array.`;

  // Create the appropriate user prompt based on the mode
  const userPrompt =
    mode === 'generate'
      ? `Generate a new Thermomix TM6 recipe for the following dish: "${prompt}"`
      : `Convert the following recipe (it could be plain text or a URL) into a detailed Thermomix TM6 recipe. If it's a URL, analyze the recipe content from that page. Recipe input: "${prompt}"`;

  try {
    if (provider === 'gemini') {
      return await callGeminiAPI(apiKey, userPrompt, systemInstruction);
    } else if (provider === 'grok') {
      return await callGrokAPI(apiKey, userPrompt, systemInstruction);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate recipe: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the recipe.");
  }
};

/**
 * Call Google Gemini API
 */
const callGeminiAPI = async (
  apiKey: string,
  userPrompt: string,
  systemInstruction: string
): Promise<ThermomixRecipe> => {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: AI_PROVIDERS.gemini.model,
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  const jsonText = response.text.trim();
  const recipeData = JSON.parse(jsonText);

  // Basic validation
  if (!recipeData.title || !Array.isArray(recipeData.steps)) {
    throw new Error("Invalid recipe format received from Gemini API.");
  }

  return recipeData as ThermomixRecipe;
};

/**
 * Call Grok API
 */
const callGrokAPI = async (
  apiKey: string,
  userPrompt: string,
  systemInstruction: string
): Promise<ThermomixRecipe> => {
  const grok = createXai({
    apiKey: apiKey,
  });

  const response = await generateText({
    model: grok(AI_PROVIDERS.grok.model),
    system: systemInstruction,
    prompt: userPrompt,
  });

  let jsonText = response.text.trim();

  // Extract JSON from markdown code blocks if present
  const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }

  // Also handle cases where JSON might be preceded by explanatory text
  const jsonStartIndex = jsonText.indexOf('{');
  const jsonEndIndex = jsonText.lastIndexOf('}');
  if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
    jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
  }

  console.log('Grok raw response:', response.text);
  console.log('Extracted JSON:', jsonText);

  const recipeData = JSON.parse(jsonText);

  console.log('Parsed recipe data:', recipeData);

  // More robust validation with better error messages
  const validationErrors = [];
  if (!recipeData.title || typeof recipeData.title !== 'string') {
    validationErrors.push('Missing or invalid title field');
  }
  if (!recipeData.steps || !Array.isArray(recipeData.steps)) {
    validationErrors.push('Missing or invalid steps array');
  } else if (recipeData.steps.length === 0) {
    validationErrors.push('Steps array is empty');
  }

  if (validationErrors.length > 0) {
    console.error('Validation errors:', validationErrors);
    console.error('Full recipe data:', JSON.stringify(recipeData, null, 2));
    throw new Error(`Invalid recipe format received from Grok API: ${validationErrors.join(', ')}`);
  }

  return recipeData as ThermomixRecipe;
};

/**
 * Test API key functionality for a provider.
 * Makes a simple API call to verify the key works.
 *
 * @param provider - The AI provider to test
 * @param apiKey - The API key to test
 * @returns Promise resolving to true if the API key works
 * @throws Error if the API key is invalid or the call fails
 */
export const testApiKey = async (
  provider: AIProvider,
  apiKey: string
): Promise<boolean> => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    if (provider === 'gemini') {
      return await testGeminiApiKey(apiKey);
    } else if (provider === 'grok') {
      return await testGrokApiKey(apiKey);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error testing ${provider} API key:`, error);
    if (error instanceof Error) {
      throw new Error(`API key test failed: ${error.message}`);
    }
    throw new Error('API key test failed: Unknown error');
  }
};

/**
 * Test Gemini API key with a simple call
 */
const testGeminiApiKey = async (apiKey: string): Promise<boolean> => {
  const ai = new GoogleGenAI({ apiKey });

  // Simple test prompt
  const testPrompt = "Say 'Hello, API key is working!' in exactly those words.";

  const response = await ai.models.generateContent({
    model: AI_PROVIDERS.gemini.model,
    contents: testPrompt,
    config: {
      maxOutputTokens: 50,
    },
  });

  const responseText = response.text.trim().toLowerCase();
  if (responseText.includes('hello') && responseText.includes('api key') && responseText.includes('working')) {
    return true;
  } else {
    throw new Error('Unexpected response from Gemini API');
  }
};

/**
 * Test Grok API key with a simple call
 */
const testGrokApiKey = async (apiKey: string): Promise<boolean> => {
  const grok = createXai({
    apiKey: apiKey,
  });

  // Simple test prompt
  const testPrompt = "Say 'Hello, API key is working!' in exactly those words.";

  const response = await generateText({
    model: grok(AI_PROVIDERS.grok.model),
    system: "You are a helpful assistant. Respond exactly as requested.",
    prompt: testPrompt,
  });

  const responseText = response.text.trim().toLowerCase();
  if (responseText.includes('hello') && responseText.includes('api key') && responseText.includes('working')) {
    return true;
  } else {
    throw new Error('Unexpected response from Grok API');
  }
};