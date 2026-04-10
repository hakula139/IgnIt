'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const wrappers = document.querySelectorAll('.glass-glow');
    if (wrappers.length === 0) {
      return;
    }

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
          for (const wrapper of wrappers) {
            const rect = wrapper.getBoundingClientRect();
            wrapper.style.setProperty('--glow-x', `${Math.round(cursorX - rect.left)}px`);
            wrapper.style.setProperty('--glow-y', `${Math.round(cursorY - rect.top)}px`);
          }
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
