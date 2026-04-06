'use strict';

(() => {
  const STORAGE_KEY = 'theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  const getStoredTheme = () => localStorage.getItem(STORAGE_KEY);

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const label = `Switch to ${theme === DARK ? 'light' : 'dark'} mode`;
    for (const btn of document.querySelectorAll('[aria-label^="Switch to"]')) {
      btn.setAttribute('aria-label', label);
    }
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === DARK ? LIGHT : DARK);
  };

  // Apply initial theme (called inline in <head> to prevent flash)
  const stored = getStoredTheme();
  if (stored) {
    setTheme(stored);
  } else if (prefersDark()) {
    setTheme(DARK);
  }

  // Listen for system preference changes (when no explicit choice stored)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? DARK : LIGHT);
    }
  });

  // Re-sync aria-labels once the DOM is ready (the initial setTheme call
  // runs in <head> before buttons exist).
  const syncAriaLabels = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (!theme) {
      return;
    }
    const label = `Switch to ${theme === DARK ? 'light' : 'dark'} mode`;
    for (const btn of document.querySelectorAll('[aria-label^="Switch to"]')) {
      btn.setAttribute('aria-label', label);
    }
  };
  document.addEventListener('DOMContentLoaded', syncAriaLabels);

  // Expose toggle for the theme switch button
  window.__toggleTheme = toggleTheme;
})();
