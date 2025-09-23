/**
 * User profile component showing saved recipes and account information.
 */

import React, { useState, useEffect } from 'react';
import { ThermomixRecipe } from '../types';
import { getUserProfile, removeRecipeFromProfile, logoutUser } from '../services/authService';
import RecipeDisplay from './RecipeDisplay';
import SettingsModal from './SettingsModal';

interface ProfileProps {
  username: string;
  onLogout: () => void;
  onApiKeyChanged: () => void;
}

const Profile: React.FC<ProfileProps> = ({ username, onLogout, onApiKeyChanged }) => {
  const [profile, setProfile] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<ThermomixRecipe | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile(username);
    setProfile(userProfile);
  }, [username]);

  const handleDeleteRecipe = (recipeTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${recipeTitle}" from your saved recipes?`)) {
      removeRecipeFromProfile(username, recipeTitle);
      const updatedProfile = getUserProfile(username);
      setProfile(updatedProfile);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  if (!profile) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {username}!</h1>
            <p className="text-gray-600">Manage your saved recipes and account settings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{profile.savedRecipes.length}</div>
            <div className="text-sm text-gray-600">Saved Recipes</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {profile.preferences?.favoriteCuisines?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Favorite Cuisines</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {profile.preferences?.defaultServings || 4}
            </div>
            <div className="text-sm text-gray-600">Default Servings</div>
          </div>
        </div>
      </div>

      {/* Saved Recipes */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Saved Recipes</h2>

        {profile.savedRecipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No saved recipes yet</p>
            <p>Generate or convert recipes to save them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.savedRecipes.map((recipe: ThermomixRecipe, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-800 mb-2">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  <span>{recipe.servings}</span> • <span>{recipe.totalTime}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.title)}
                    className="bg-red-600 text-white text-sm py-2 px-3 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedRecipe.title}</h2>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <RecipeDisplay recipe={selectedRecipe} />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          username={username}
          onClose={() => setShowSettings(false)}
          onApiKeyChanged={onApiKeyChanged}
        />
      )}
    </div>
  );
};

export default Profile;