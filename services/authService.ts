/**
 * Authentication and user management utilities.
 * Handles user login, registration, and profile management using localStorage.
 */

import { User, UserProfile, ThermomixRecipe } from '../types';

// Storage keys
const USERS_KEY = 'thermomix_users';
const CURRENT_USER_KEY = 'thermomix_current_user';
const PROFILES_KEY = 'thermomix_profiles';

/**
 * Get all users from localStorage
 */
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

/**
 * Save users to localStorage
 */
export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Get user profiles from localStorage
 */
export const getProfiles = (): UserProfile[] => {
  const profiles = localStorage.getItem(PROFILES_KEY);
  return profiles ? JSON.parse(profiles) : [];
};

/**
 * Save profiles to localStorage
 */
export const saveProfiles = (profiles: UserProfile[]): void => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Set current logged-in user
 */
export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

/**
 * Register a new user
 */
export const registerUser = (username: string, password: string, apiKey: string, provider: 'gemini' | 'grok' = 'gemini'): User => {
  const users = getUsers();

  // Check if user already exists
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }

  const newUser: User = {
    username,
    password: btoa(password), // Simple base64 encoding (in production, use proper hashing)
    apiKeys: {
      [provider]: apiKey,
    },
    defaultProvider: provider,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Create user profile
  const profiles = getProfiles();
  const newProfile: UserProfile = {
    username,
    savedRecipes: [],
    preferences: {},
  };
  profiles.push(newProfile);
  saveProfiles(profiles);

  return newUser;
};

/**
 * Login user
 */
export const loginUser = (username: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== btoa(password)) {
    throw new Error('Invalid password');
  }

  setCurrentUser(user);
  return user;
};

/**
 * Logout current user
 */
export const logoutUser = (): void => {
  setCurrentUser(null);
};

/**
 * Update user's API key for a specific provider
 */
export const updateUserApiKey = (username: string, provider: 'gemini' | 'grok', newApiKey: string): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].apiKeys[provider] = newApiKey;
  saveUsers(users);

  // Update current user if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.username === username) {
    currentUser.apiKeys[provider] = newApiKey;
    setCurrentUser(currentUser);
  }
};

/**
 * Delete user's API key for a specific provider
 */
export const deleteUserApiKey = (username: string, provider: 'gemini' | 'grok'): void => {
  updateUserApiKey(username, provider, '');
};

/**
 * Set user's default AI provider
 */
export const setUserDefaultProvider = (username: string, provider: 'gemini' | 'grok'): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].defaultProvider = provider;
  saveUsers(users);

  // Update current user if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.username === username) {
    currentUser.defaultProvider = provider;
    setCurrentUser(currentUser);
  }
};

/**
 * Get user's profile
 */
export const getUserProfile = (username: string): UserProfile | null => {
  const profiles = getProfiles();
  return profiles.find(p => p.username === username) || null;
};

/**
 * Save recipe to user's profile
 */
export const saveRecipeToProfile = (username: string, recipe: ThermomixRecipe): void => {
  const profiles = getProfiles();
  const profileIndex = profiles.findIndex(p => p.username === username);

  if (profileIndex === -1) {
    throw new Error('Profile not found');
  }

  // Check if recipe already exists (by title)
  const existingIndex = profiles[profileIndex].savedRecipes.findIndex(r => r.title === recipe.title);
  if (existingIndex >= 0) {
    // Update existing recipe
    profiles[profileIndex].savedRecipes[existingIndex] = recipe;
  } else {
    // Add new recipe
    profiles[profileIndex].savedRecipes.push(recipe);
  }

  saveProfiles(profiles);
};

/**
 * Remove recipe from user's profile
 */
export const removeRecipeFromProfile = (username: string, recipeTitle: string): void => {
  const profiles = getProfiles();
  const profileIndex = profiles.findIndex(p => p.username === username);

  if (profileIndex === -1) {
    throw new Error('Profile not found');
  }

  profiles[profileIndex].savedRecipes = profiles[profileIndex].savedRecipes.filter(
    r => r.title !== recipeTitle
  );

  saveProfiles(profiles);
};