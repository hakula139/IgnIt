'use strict';

(() => {
  // ── Theme ──

  const STORAGE_KEY = 'theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  const getStoredTheme = () => localStorage.getItem(STORAGE_KEY);

  const updateThemeToggleLabels = (theme) => {
    for (const btn of document.querySelectorAll('[data-i18n-dark]')) {
      const label = theme === DARK ? btn.dataset.i18nLight : btn.dataset.i18nDark;
      if (!label) {
        continue;
      }
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeToggleLabels(theme);
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

  const updateMobileMenuToggleLabels = (isOpen) => {
    for (const btn of document.querySelectorAll('[data-i18n-open]')) {
      const label = isOpen ? btn.dataset.i18nClose : btn.dataset.i18nOpen;
      if (!label) {
        continue;
      }
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }
  };

  const toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    const panel = menu.querySelector('[data-glow-target]');
    menu.classList.toggle('hidden');
    const isOpen = !menu.classList.contains('hidden');
    panel?.toggleAttribute('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.querySelector('i').classList.toggle('fa-bars');
    toggle.querySelector('i').classList.toggle('fa-xmark');
    updateMobileMenuToggleLabels(isOpen);
  };

  // ── Search Modal ──

  const SEARCH_MODAL_DIALOG_SELECTOR = 'dialog.pf-modal';

  const syncSearchModalGlowTarget = () => {
    const dialog = document.querySelector(SEARCH_MODAL_DIALOG_SELECTOR);
    if (!dialog) {
      return false;
    }

    dialog.toggleAttribute('data-glow-target', true);
    return true;
  };

  const initSearchModal = () => {
    if (!document.querySelector('pagefind-modal')) {
      return;
    }

    if (syncSearchModalGlowTarget()) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (syncSearchModalGlowTarget()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  };

  const openSearchModal = () => {
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) {
      toggleMobileMenu();
    }

    syncSearchModalGlowTarget();
    document.querySelector('pagefind-modal')?.open?.();
  };

  // ── Initialization ──

  // Enable the image fade-in CSS contract before any <img> paints. Must run
  // synchronously in <head>; if deferred, the browser can paint cached
  // images before the class is set, causing a visible flash + re-fade.
  document.documentElement.classList.add('image-fade-enabled');

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
      updateThemeToggleLabels(theme);
    }

    initSearchModal();
  });

  // ── Exports ──

  window.__openSearchModal = openSearchModal;
  window.__toggleTheme = toggleTheme;
  window.__toggleMobileMenu = toggleMobileMenu;
})();
