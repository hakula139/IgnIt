'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    if (document.querySelectorAll('.glass-glow').length === 0) {
      return;
    }

    const root = document.documentElement;
    let cursorX = -9999;
    let cursorY = -9999;
    let rafPending = false;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          root.style.setProperty('--glow-x', `${cursorX}px`);
          root.style.setProperty('--glow-y', `${cursorY}px`);
        });
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassGlow);
  } else {
    initGlassGlow();
  }
})();
