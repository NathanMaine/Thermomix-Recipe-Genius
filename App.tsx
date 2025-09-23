import React, { useState, useCallback, useEffect } from 'react';
import { ThermomixRecipe, User, AIProvider } from './types';
import { generateOrConvertRecipe, AI_PROVIDERS } from './services/aiService';
import { getCurrentUser, saveRecipeToProfile } from './services/authService';
import RecipeDisplay from './components/RecipeDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import LoginForm from './components/LoginForm';
import Profile from './components/Profile';
import { ChefHatIcon, ConvertIcon, UsersIcon, SaveIcon } from './components/Icons';

type ActiveTab = 'generate' | 'convert' | 'profile';
type AppState = 'login' | 'main';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [generateInput, setGenerateInput] = useState('');
  const [convertInput, setConvertInput] = useState('');
  const [recipe, setRecipe] = useState<ThermomixRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setSelectedProvider(user.defaultProvider);
      setAppState('main');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAppState('main');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('login');
    setActiveTab('generate');
    setRecipe(null);
    setError(null);
  };

  const handleApiKeyChanged = () => {
    console.log('handleApiKeyChanged called');
    const user = getCurrentUser();
    console.log('Current user from localStorage:', user);
    setCurrentUser(user);
    if (user) {
      setSelectedProvider(user.defaultProvider);
      console.log('Selected provider updated to:', user.defaultProvider);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.apiKeys[selectedProvider]) {
      setError(`Please set your ${AI_PROVIDERS[selectedProvider].name} API key in settings first.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);

    const input = activeTab === 'generate' ? generateInput : convertInput;
    if (!input.trim()) {
      setError('Please enter a recipe idea or paste a recipe/URL.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateOrConvertRecipe(input, activeTab, selectedProvider, currentUser.apiKeys[selectedProvider]!);
      setRecipe(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, generateInput, convertInput, currentUser, selectedProvider]);

  const handleSaveRecipe = useCallback(() => {
    if (recipe && currentUser) {
      try {
        saveRecipeToProfile(currentUser.username, recipe);
        alert('Recipe saved to your profile!');
      } catch (err) {
        alert('Failed to save recipe. Please try again.');
      }
    }
  }, [recipe, currentUser]);

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

  if (appState === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Thermomix Recipe <span className="text-green-600">Genius</span>
          </h1>
          <p className="text-gray-600 mb-8">Your smart culinary assistant for the TM6</p>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md"
          >
            Get Started
          </button>
        </div>

        {showLogin && (
          <LoginForm
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="p-8 flex flex-col bg-white shadow-lg">
          <header className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bold text-gray-800">
                Thermomix Recipe <span className="text-green-600">Genius</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Welcome, {currentUser?.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
            <p className="text-gray-500">Your smart culinary assistant for the TM6</p>
          </header>

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
            <TabButton
              tabName="profile"
              label="My Profile"
              icon={<UsersIcon className="w-6 h-6" />}
            />
          </div>

          {/* AI Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <div className="flex gap-2">
              {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    selectedProvider === provider
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {AI_PROVIDERS[provider].name}
                </button>
              ))}
            </div>
            {!currentUser?.apiKeys[selectedProvider] && (
              <p className="text-red-600 text-xs mt-2">
                No API key set for {AI_PROVIDERS[selectedProvider].name}
              </p>
            )}
          </div>

          {activeTab === 'profile' ? (
            <Profile
              username={currentUser!.username}
              onLogout={handleLogout}
              onApiKeyChanged={handleApiKeyChanged}
            />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
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

              <button
                type="submit"
                disabled={isLoading || !currentUser?.apiKeys[selectedProvider]}
                className="mt-6 w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md disabled:transform-none"
              >
                {isLoading ? 'Generating...' : `Create Recipe with ${AI_PROVIDERS[selectedProvider].name}`}
              </button>

              {!currentUser?.apiKeys[selectedProvider] && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Please set your {AI_PROVIDERS[selectedProvider].name} API key in Profile → Settings
                </p>
              )}
            </form>
          )}
        </div>

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
          {!isLoading && !error && recipe && (
            <div>
              <div className="p-4 border-b bg-white">
                <button
                  onClick={handleSaveRecipe}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <SaveIcon className="w-4 h-4" />
                  Save Recipe
                </button>
              </div>
              <RecipeDisplay recipe={recipe} />
            </div>
          )}
          {!isLoading && !error && !recipe && activeTab !== 'profile' && (
            <RecipeDisplay recipe={null} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
