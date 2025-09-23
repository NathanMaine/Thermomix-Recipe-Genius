/**
 * Login and registration form component.
 * Allows users to login or create new accounts.
 */

import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { User, AIProvider } from '../types';
import { AI_PROVIDERS } from '../services/aiService';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const user = loginUser(username, password);
        onLogin(user);
        onClose();
      } else {
        // Registration
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!apiKey.trim()) {
          throw new Error('API key is required');
        }
        const user = registerUser(username, password, apiKey, selectedProvider);
        onLogin(user);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setSelectedProvider(provider)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedProvider === provider
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-sm">{AI_PROVIDERS[provider].name}</div>
                      <div className="text-xs text-gray-500 mt-1">{AI_PROVIDERS[provider].description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  {AI_PROVIDERS[selectedProvider].name} API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${AI_PROVIDERS[selectedProvider].name} API key`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href={AI_PROVIDERS[selectedProvider].apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    {AI_PROVIDERS[selectedProvider].name} Console
                  </a>
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setApiKey('');
              setConfirmPassword('');
            }}
            className="text-green-600 hover:text-green-700 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;