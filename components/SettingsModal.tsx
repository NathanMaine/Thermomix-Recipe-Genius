/**
 * Settings modal for managing user API keys for multiple AI providers.
 * Allows updating or deleting API keys for different providers.
 */

import React, { useState } from 'react';
import { updateUserApiKey, deleteUserApiKey, setUserDefaultProvider, getCurrentUser } from '../services/authService';
import { AIProvider } from '../types';
import { AI_PROVIDERS } from '../services/aiService';

interface SettingsModalProps {
  username: string;
  onClose: () => void;
  onApiKeyChanged: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ username, onClose, onApiKeyChanged }) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [newApiKey, setNewApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const currentUser = getCurrentUser();
  const providerConfig = AI_PROVIDERS[selectedProvider];

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim()) {
      setError('Please enter a new API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      updateUserApiKey(username, selectedProvider, newApiKey);
      onApiKeyChanged();
      setNewApiKey('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setIsLoading(true);
    setError('');

    try {
      deleteUserApiKey(username, selectedProvider);
      onApiKeyChanged();
      setShowConfirmDelete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultProvider = async (provider: AIProvider) => {
    try {
      setUserDefaultProvider(username, provider);
      onApiKeyChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default provider');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">API Key Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Default Provider Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Default AI Provider</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose which AI provider to use by default for recipe generation.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => (
                <button
                  key={provider}
                  onClick={() => handleSetDefaultProvider(provider)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    currentUser?.defaultProvider === provider
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{AI_PROVIDERS[provider].name}</div>
                  <div className="text-xs text-gray-500 mt-1">{AI_PROVIDERS[provider].description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Selection for API Key Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Manage API Keys</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a provider to add or update its API key.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => (
                <button
                  key={provider}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setNewApiKey('');
                    setError('');
                    setShowConfirmDelete(false);
                  }}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedProvider === provider
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{AI_PROVIDERS[provider].name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentUser?.apiKeys[provider] ? 'Key set' : 'No key'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Management for Selected Provider */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              {providerConfig.name} API Key
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {providerConfig.description}
            </p>

            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder={`Enter ${providerConfig.name} API key`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
            />

            <div className="flex gap-3">
              <button
                onClick={handleUpdateApiKey}
                disabled={isLoading || !newApiKey.trim()}
                className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Key'}
              </button>

              {currentUser?.apiKeys[selectedProvider] && !showConfirmDelete && (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>

            {showConfirmDelete && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-3">
                  Are you sure you want to delete your {providerConfig.name} API key?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteApiKey}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    {isLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <a
            href={providerConfig.apiKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 text-sm"
          >
            Get {providerConfig.name} API Key →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;