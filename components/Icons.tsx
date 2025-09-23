
/**
 * SVG icon components used throughout the application.
 * All icons are implemented as React components with customizable className props.
 */

import React from 'react';

/**
 * Chef hat icon for the generate recipe tab.
 */
export const ChefHatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5Z" />
    <path d="M12 9H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-3.5" />
    <path d="M12 9a2 2 0 0 1-2-2V3.5" />
    <path d="M14 7V5" />
  </svg>
);

/**
 * Convert/document icon for the convert recipe tab.
 */
export const ConvertIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.5 13.5-2-2-2 2" />
        <path d="m19.5 11.5v-6.5h-15v15h11"/>
        <path d="m2.5 7.5 2 2 2-2" />
        <path d="m4.5 9.5v-7" />
    </svg>
);

/**
 * Clock icon for displaying recipe preparation time.
 */
export const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/**
 * Users icon for displaying number of servings.
 */
export const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

/**
 * Thermomix icon for the welcome placeholder and branding.
 */
export const ThermomixIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 22.01V22a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v.01" />
        <path d="M4 18V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9" />
        <path d="M12 2v5" />
        <path d="M12 14a2 2 0 1 0-4 0" />
        <path d="M12 14a2 2 0 1 0 4 0" />
        <path d="M12 14a2 2 0 1 1-4 0" />
        <path d="M12 14a2 2 0 1 1 4 0" />
    </svg>
);

/**
 * Save icon for saving recipes.
 */
export const SaveIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
