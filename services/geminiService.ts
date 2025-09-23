
/**
 * Service for interacting with Google's Gemini AI to generate and convert recipes.
 * Handles API communication, structured output parsing, and error handling.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ThermomixRecipe } from '../types';

// Validate that the API key environment variable is set
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Schema definition for structured recipe output from Gemini AI.
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
 * Generates a new Thermomix recipe or converts an existing recipe using Gemini AI.
 *
 * @param prompt - The user's input (recipe description for generation, or recipe text/URL for conversion)
 * @param mode - Whether to 'generate' a new recipe or 'convert' an existing one
 * @returns Promise resolving to a structured ThermomixRecipe object
 * @throws Error if API call fails or response parsing fails
 */
export const generateOrConvertRecipe = async (
  prompt: string,
  mode: 'generate' | 'convert'
): Promise<ThermomixRecipe> => {
  // System instruction to guide the AI's behavior
  const systemInstruction = `You are an expert chef specializing in creating and adapting recipes for the Thermomix TM6. You understand all its functions (e.g., chopping, mixing, kneading, cooking, steaming, weighing), speeds (Spoon, 1-10, Turbo), temperature settings, and special modes (e.g., Kneading, Varoma). Your output must be a valid JSON object following the provided schema. For each step, provide clear, concise instructions specific to the Thermomix TM6. Only include duration, speed, or temperature if they are applicable to the step.`;

  // Create the appropriate user prompt based on the mode
  const userPrompt =
    mode === 'generate'
      ? `Generate a new Thermomix TM6 recipe for the following dish: "${prompt}"`
      : `Convert the following recipe (it could be plain text or a URL) into a detailed Thermomix TM6 recipe. If it's a URL, analyze the recipe content from that page. Recipe input: "${prompt}"`;

  try {
    // Make the API call to Gemini with structured output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    // Parse the JSON response
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object matches the expected structure
    if (!recipeData.title || !Array.isArray(recipeData.steps)) {
        throw new Error("Invalid recipe format received from API.");
    }

    return recipeData as ThermomixRecipe;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate recipe: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the recipe.");
  }
};
