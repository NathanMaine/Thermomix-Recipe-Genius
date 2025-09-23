
/**
 * Application entry point for Thermomix Recipe Genius.
 * Renders the main App component into the DOM using React 18's createRoot API.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root DOM element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create React root and render the App component
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
