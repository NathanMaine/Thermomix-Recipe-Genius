
/**
 * Type definitions for the Thermomix Recipe Genius application.
 * These interfaces define the structure of recipe data used throughout the app.
 */

/**
 * Represents a single ingredient in a recipe.
 */
export interface Ingredient {
  /** The quantity and unit of the ingredient (e.g., "100 g", "1 tsp") */
  amount: string;
  /** The name of the ingredient (e.g., "Onion, quartered") */
  name: string;
}

/**
 * Represents a single step in a recipe's instructions.
 */
export interface RecipeStep {
  /** The detailed instruction for this step */
  instruction: string;
  /** Optional duration for the step (e.g., "3 sec", "10 min") */
  duration: string | null;
  /** Optional Thermomix speed setting (e.g., "Speed 5", "Spoon speed") */
  speed: string | null;
  /** Optional temperature setting (e.g., "100°C", "Varoma") */
  temperature: string | null;
}

/**
 * Complete recipe structure for Thermomix TM6 recipes.
 */
export interface ThermomixRecipe {
  /** The title of the recipe */
  title: string;
  /** A brief, enticing description of the dish */
  description: string;
  /** Number of servings (e.g., "4 people") */
  servings: string;
  /** Estimated total preparation and cooking time */
  totalTime: string;
  /** List of all ingredients with amounts */
  ingredients: Ingredient[];
  /** Step-by-step cooking instructions */
  steps: RecipeStep[];
}

/**
 * User profile information.
 */
export interface User {
  /** Unique username */
  username: string;
  /** Encrypted password (in a real app, this would be properly hashed) */
  password: string;
  /** API keys for different AI providers */
  apiKeys: {
    gemini?: string;
    grok?: string;
  };
  /** Default AI provider to use */
  defaultProvider: 'gemini' | 'grok';
  /** Timestamp of when the user was created */
  createdAt: string;
}

/**
 * User's saved recipes and preferences.
 */
export interface UserProfile {
  /** Username */
  username: string;
  /** List of saved recipes */
  savedRecipes: ThermomixRecipe[];
  /** User preferences */
  preferences: {
    /** Default number of servings */
    defaultServings?: number;
    /** Favorite cuisines */
    favoriteCuisines?: string[];
  };
}

/**
 * Supported AI providers for recipe generation.
 */
export type AIProvider = 'gemini' | 'grok';

/**
 * Configuration for AI providers.
 */
export interface AIProviderConfig {
  /** Display name for the provider */
  name: string;
  /** Description of the provider */
  description: string;
  /** URL to get API key */
  apiKeyUrl: string;
  /** Model name to use */
  model: string;
}
