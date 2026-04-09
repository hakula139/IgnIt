'use strict';

(() => {
  // ── Theme ──

  const STORAGE_KEY = 'theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  const getStoredTheme = () => localStorage.getItem(STORAGE_KEY);

  const updateAriaLabels = (theme) => {
    const label = `Switch to ${theme === DARK ? 'light' : 'dark'} mode`;
    for (const btn of document.querySelectorAll('[aria-label^="Switch to"]')) {
      btn.setAttribute('aria-label', label);
    }
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateAriaLabels(theme);
  };

  const enableTransition = () => {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  const toggleTheme = () => {
    enableTransition();
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === DARK ? LIGHT : DARK);
  };

  // ── Mobile Menu ──

  const toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', !menu.classList.contains('hidden'));
    toggle.querySelector('i').classList.toggle('fa-bars');
    toggle.querySelector('i').classList.toggle('fa-xmark');
  };

  // ── Initialization ──

  // Apply initial theme (called inline in <head> to prevent flash).
  const stored = getStoredTheme();
  if (stored) {
    setTheme(stored);
  } else if (prefersDark()) {
    setTheme(DARK);
  }

  // Listen for system preference changes (when no explicit choice stored).
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      enableTransition();
      setTheme(e.matches ? DARK : LIGHT);
    }
  });

  // Re-sync aria-labels once the DOM is ready. The initial setTheme call
  // runs in <head> before buttons exist.
  document.addEventListener('DOMContentLoaded', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme) {
      updateAriaLabels(theme);
    }
  });

  // ── Exports ──

  window.__toggleTheme = toggleTheme;
  window.__toggleMobileMenu = toggleMobileMenu;
})();
