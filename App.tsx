
/**
 * Main application component for Thermomix Recipe Genius.
 * Provides a tabbed interface for generating new recipes or converting existing ones.
 */

import React, { useState, useCallback } from 'react';
import { ThermomixRecipe } from './types';
import { generateOrConvertRecipe } from './services/geminiService';
import RecipeDisplay from './components/RecipeDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { ChefHatIcon, ConvertIcon } from './components/Icons';

// Type for the active tab state
type ActiveTab = 'generate' | 'convert';

/**
 * Main App component that handles the overall application state and UI.
 */
const App: React.FC = () => {
  // State for the currently active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  // Input text for recipe generation
  const [generateInput, setGenerateInput] = useState('');
  // Input text for recipe conversion
  const [convertInput, setConvertInput] = useState('');
  // The generated or converted recipe
  const [recipe, setRecipe] = useState<ThermomixRecipe | null>(null);
  // Loading state during API calls
  const [isLoading, setIsLoading] = useState(false);
  // Error message display
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission for both generate and convert modes.
   * Calls the Gemini service and updates the UI state accordingly.
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    // Get the appropriate input based on active tab
    const input = activeTab === 'generate' ? generateInput : convertInput;
    if (!input.trim()) {
      setError('Please enter a recipe idea or paste a recipe/URL.');
      setIsLoading(false);
      return;
    }

    try {
      // Call the Gemini service to generate or convert the recipe
      const result = await generateOrConvertRecipe(input, activeTab);
      setRecipe(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, generateInput, convertInput]);

  /**
   * Reusable tab button component for switching between generate and convert modes.
   */
  const TabButton = ({
    tabName,
    label,
    icon,
  }: {
    tabName: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center gap-3 p-4 text-lg font-semibold transition-all duration-300 border-b-4 ${
        activeTab === tabName
          ? 'border-green-500 text-green-600'
          : 'border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left panel: Input form */}
        <div className="p-8 flex flex-col bg-white shadow-lg">
          {/* Header section */}
          <header className="text-center mb-8">
             <h1 className="text-4xl font-bold text-gray-800">
               Thermomix Recipe <span className="text-green-600">Genius</span>
             </h1>
             <p className="text-gray-500 mt-2">Your smart culinary assistant for the TM6</p>
          </header>

          {/* Tab navigation */}
          <div className="flex border-b mb-6">
            <TabButton
              tabName="generate"
              label="Generate Recipe"
              icon={<ChefHatIcon className="w-6 h-6" />}
            />
            <TabButton
              tabName="convert"
              label="Convert Recipe"
              icon={<ConvertIcon className="w-6 h-6" />}
            />
          </div>

          {/* Main form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            {/* Generate tab content */}
            {activeTab === 'generate' && (
              <div className="flex flex-col flex-grow animate-fade-in">
                <label htmlFor="generate-input" className="text-lg font-medium mb-2 text-gray-700">
                  What would you like to make?
                </label>
                <textarea
                  id="generate-input"
                  value={generateInput}
                  onChange={(e) => setGenerateInput(e.target.value)}
                  placeholder="e.g., Creamy tomato soup, Gluten-free chocolate cake, Chicken and mushroom risotto..."
                  className="w-full flex-grow p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow resize-none"
                  rows={10}
                />
              </div>
            )}

            {/* Convert tab content */}
            {activeTab === 'convert' && (
              <div className="flex flex-col flex-grow animate-fade-in">
                <label htmlFor="convert-input" className="text-lg font-medium mb-2 text-gray-700">
                  Paste a recipe or URL to convert
                </label>
                <textarea
                  id="convert-input"
                  value={convertInput}
                  onChange={(e) => setConvertInput(e.target.value)}
                  placeholder="Paste the full recipe text or a URL here..."
                  className="w-full flex-grow p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow resize-none"
                  rows={10}
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md disabled:transform-none"
            >
              {isLoading ? 'Generating...' : 'Create Recipe'}
            </button>
          </form>
        </div>

        {/* Right panel: Recipe display or loading/error states */}
        <div className="bg-gray-100/50 overflow-y-auto max-h-screen">
          {isLoading && <LoadingSpinner />}
          {error && (
            <div className="flex items-center justify-center h-full p-8">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg max-w-md text-center">
                <p className="font-bold">An Error Occurred</p>
                <p className="mt-2">{error}</p>
              </div>
            </div>
          )}
          {!isLoading && !error && <RecipeDisplay recipe={recipe} />}
        </div>
      </main>
    </div>
  );
};

export default App;
