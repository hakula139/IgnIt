'use strict';

(() => {
  // ── LQIP Fade-In ──

  // Enable LQIP CSS before first paint; `lqip.js` reveals each image.
  document.documentElement.classList.add('lqip-fade-enabled');

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

  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let mobileMenuLastFocus = null;

  const setRestAriaHidden = (hidden, except) => {
    for (const el of document.body.children) {
      if (el === except || el.contains(except)) {
        continue;
      }
      if (hidden) {
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('aria-hidden');
      }
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
    const icon = toggle.querySelector('i');
    if (isOpen) {
      icon.classList.replace('fa-bars', 'fa-xmark');
    } else {
      icon.classList.replace('fa-xmark', 'fa-bars');
    }
    updateMobileMenuToggleLabels(isOpen);

    setRestAriaHidden(isOpen, menu);

    if (isOpen) {
      mobileMenuLastFocus = document.activeElement;
      const first = menu.querySelector(FOCUSABLE_SELECTOR);
      first?.focus();
    } else {
      const target = mobileMenuLastFocus instanceof HTMLElement ? mobileMenuLastFocus : toggle;
      target.focus();
      mobileMenuLastFocus = null;
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') {
      return;
    }
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) {
      toggleMobileMenu();
    }
  });

  // ── Search Modal ──

  const SEARCH_MODAL_DIALOG_SELECTOR = 'dialog.pf-modal';

  const setSearchTriggerExpanded = (expanded) => {
    for (const btn of document.querySelectorAll('.search-trigger')) {
      btn.setAttribute('aria-expanded', String(expanded));
    }
  };

  const observeSearchDialogOpenState = (dialog) => {
    setSearchTriggerExpanded(dialog.hasAttribute('open'));
    const observer = new MutationObserver(() => {
      setSearchTriggerExpanded(dialog.hasAttribute('open'));
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  };

  const syncSearchModalGlowTarget = () => {
    const dialog = document.querySelector(SEARCH_MODAL_DIALOG_SELECTOR);
    if (!dialog) {
      return false;
    }

    dialog.toggleAttribute('data-glow-target', true);
    if (!dialog.dataset.searchTriggerWired) {
      dialog.dataset.searchTriggerWired = 'true';
      observeSearchDialogOpenState(dialog);
    }
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
