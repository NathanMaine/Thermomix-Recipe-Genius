
/**
 * Loading spinner component displayed during recipe generation.
 * Shows an animated spinner with a descriptive message.
 */

import React from 'react';

/**
 * LoadingSpinner component that displays a spinning animation
 * and message while the app is generating or converting a recipe.
 */
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    {/* Animated CSS spinner */}
    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
    {/* Loading message */}
    <p className="text-gray-500 text-lg">Brewing up your recipe...</p>
  </div>
);

export default LoadingSpinner;
