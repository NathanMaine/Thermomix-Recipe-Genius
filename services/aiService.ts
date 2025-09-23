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
  const systemInstruction = `You are an expert chef specializing in creating and adapting recipes for the Thermomix TM6. You understand all its functions (e.g., chopping, mixing, kneading, cooking, steaming, weighing), speeds (Spoon, 1-10, Turbo), temperature settings, and special modes (e.g., Kneading, Varoma). Your output must be a valid JSON object following the provided schema. For each step, provide clear, concise instructions specific to the Thermomix TM6. Only include duration, speed, or temperature if they are applicable to the step.`;

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
 * Call Grok API (xAI)
 */
const callGrokAPI = async (
  apiKey: string,
  userPrompt: string,
  systemInstruction: string
): Promise<ThermomixRecipe> => {
  const grok = createXai({
    apiKey: apiKey,
  });

  // Add JSON instruction to the system prompt for Grok
  const jsonSystemInstruction = `${systemInstruction}\n\nYou must respond with valid JSON only, following the exact schema provided. Do not include any other text or explanations.`;

  const response = await generateText({
    model: grok(AI_PROVIDERS.grok.model),
    system: jsonSystemInstruction,
    prompt: userPrompt,
    temperature: 0.7,
  });

  const jsonText = response.text.trim();
  const recipeData = JSON.parse(jsonText);

  // Basic validation
  if (!recipeData.title || !Array.isArray(recipeData.steps)) {
    throw new Error("Invalid recipe format received from Grok API.");
  }

  return recipeData as ThermomixRecipe;
};