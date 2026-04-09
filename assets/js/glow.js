'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const panels = document.querySelectorAll('.glass-panel');
    if (panels.length === 0) {
      return;
    }

    let cursorX = -9999;
    let cursorY = -9999;

    const updatePanels = () => {
      for (const panel of panels) {
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty('--glow-x', `${cursorX - rect.left}px`);
        panel.style.setProperty('--glow-y', `${cursorY - rect.top}px`);
      }
    };

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      updatePanels();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassGlow);
  } else {
    initGlassGlow();
  }
})();
