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

    const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';

    let cursorX = -9999;
    let cursorY = -9999;
    let rafId = 0;
    let trackingEnabled = false;

    const updateGlow = () => {
      rafId = 0;
      for (const wrapper of wrappers) {
        const rect = wrapper.getBoundingClientRect();
        wrapper.style.setProperty('--glow-x', `${Math.round(cursorX - rect.left)}px`);
        wrapper.style.setProperty('--glow-y', `${Math.round(cursorY - rect.top)}px`);
      }
    };

    const onMouseMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (rafId === 0) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    const resetGlow = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      for (const wrapper of wrappers) {
        wrapper.style.removeProperty('--glow-x');
        wrapper.style.removeProperty('--glow-y');
      }
    };

    const syncGlowTracking = () => {
      if (isDarkTheme()) {
        if (!trackingEnabled) {
          document.addEventListener('mousemove', onMouseMove);
          trackingEnabled = true;
        }
        return;
      }

      if (trackingEnabled) {
        document.removeEventListener('mousemove', onMouseMove);
        trackingEnabled = false;
      }

      resetGlow();
    };

    new MutationObserver(syncGlowTracking).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    syncGlowTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassGlow);
  } else {
    initGlassGlow();
  }
})();
