'use strict';

(() => {
  // ── LQIP Fade-In ──

  // Enable LQIP CSS before first paint. `lqip.js` then reveals each image.
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
    const theme = current === DARK ? LIGHT : DARK;
    setTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
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

  const menuInertElements = new Set();

  const setRestInert = (inert, ...except) => {
    if (inert) {
      for (const el of document.body.children) {
        if (el.inert || except.some((target) => el.contains(target))) {
          continue;
        }
        el.inert = true;
        menuInertElements.add(el);
      }
    } else {
      for (const el of menuInertElements) {
        el.inert = false;
      }
      menuInertElements.clear();
    }
  };

  const setMobileMenuOpen = (isOpen) => {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    menu.classList.toggle('hidden', !isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    const icon = toggle.querySelector('i');
    if (isOpen) {
      icon.classList.replace('fa-bars', 'fa-xmark');
    } else {
      icon.classList.replace('fa-xmark', 'fa-bars');
    }
    updateMobileMenuToggleLabels(isOpen);

    setRestInert(isOpen, menu, toggle);

    if (isOpen) {
      const first = menu.querySelector(FOCUSABLE_SELECTOR);
      first?.focus();
    } else {
      const target = toggle.getClientRects().length
        ? toggle
        : document.querySelector('.header-logo');
      target.focus();
    }
  };

  const toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    setMobileMenuOpen(menu.classList.contains('hidden'));
  };

  const initMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    if (!menu || !toggle) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!menu.classList.contains('hidden') && !toggle.getClientRects().length) {
        setMobileMenuOpen(false);
      }
    });
    observer.observe(toggle);
  };

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') {
      return;
    }
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) {
      setMobileMenuOpen(false);
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

  const syncSearchDialog = () => {
    const dialog = document.querySelector(SEARCH_MODAL_DIALOG_SELECTOR);
    if (!dialog) {
      return false;
    }

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

    if (syncSearchDialog()) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (syncSearchDialog()) {
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
      setMobileMenuOpen(false);
    }

    syncSearchDialog();
    document.querySelector('pagefind-modal')?.open?.();
  };

  // ── Initialization ──

  const stored = getStoredTheme();
  setTheme(stored || (prefersDark() ? DARK : LIGHT));

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

    initMobileMenu();
    initSearchModal();
  });

  // ── Exports ──

  window.__openSearchModal = openSearchModal;
  window.__toggleTheme = toggleTheme;
  window.__toggleMobileMenu = toggleMobileMenu;
})();
