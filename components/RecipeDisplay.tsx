
/**
 * Component for displaying a complete Thermomix recipe.
 * Shows recipe details, ingredients, and step-by-step instructions.
 */

import React from 'react';
import { ThermomixRecipe, RecipeStep } from '../types';
import { ClockIcon, UsersIcon, ThermomixIcon } from './Icons';

interface RecipeDisplayProps {
  recipe: ThermomixRecipe | null;
}

/**
 * Placeholder component shown when no recipe is available.
 * Displays a welcome message and instructions.
 */
const WelcomePlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
    <ThermomixIcon className="w-24 h-24 text-gray-300 mb-6" />
    <h2 className="text-2xl font-bold text-gray-700">Welcome to Recipe Genius</h2>
    <p className="mt-2 max-w-md">
      Generate a brand-new Thermomix recipe or convert your favorite from the web. Your culinary creation will appear here!
    </p>
  </div>
);

/**
 * Component for displaying individual step details (time, speed, temperature).
 * Only renders if the value is provided.
 */
const StepDetail = ({ label, value }: { label: string; value: string | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm bg-gray-100 rounded-full px-3 py-1 text-gray-700">
            <span className="font-medium">{label}:</span>
            <span>{value}</span>
        </div>
    );
};

/**
 * Main recipe display component.
 * Renders the complete recipe with title, description, ingredients, and instructions.
 */
const RecipeDisplay = ({ recipe }: RecipeDisplayProps) => {
  // Show placeholder if no recipe is provided
  if (!recipe) {
    return <WelcomePlaceholder />;
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Recipe header section */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-800">{recipe.title}</h1>
        <p className="mt-2 text-lg text-gray-600">{recipe.description}</p>
        {/* Recipe metadata: time and servings */}
        <div className="flex items-center gap-8 mt-6 text-gray-600">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            <span>{recipe.totalTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            <span>{recipe.servings}</span>
          </div>
        </div>
      </div>

      {/* Ingredients section */}
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-4">Ingredients</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 list-none">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-baseline text-gray-700 border-b border-gray-200 py-2">
              <span className="font-semibold w-24 flex-shrink-0">{ingredient.amount}</span>
              <span>{ingredient.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions section */}
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-6">Instructions</h2>
        <ol className="space-y-6">
          {recipe.steps.map((step: RecipeStep, index: number) => (
            <li key={index} className="flex gap-4">
              {/* Step number indicator */}
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              {/* Step content */}
              <div className="flex-grow">
                <p className="text-gray-800 text-base leading-relaxed">{step.instruction}</p>
                {/* Step details: time, speed, temperature */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <StepDetail label="Time" value={step.duration} />
                  <StepDetail label="Speed" value={step.speed} />
                  <StepDetail label="Temp" value={step.temperature} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDisplay;
