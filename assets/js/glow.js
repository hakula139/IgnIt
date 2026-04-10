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
    let cursorInside = false;
    let rafId = 0;
    let trackingEnabled = false;

    const cachedRects = new Array(wrappers.length);
    let rectsDirty = true;

    const onMouseMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorInside = true;
      scheduleUpdate();
    };

    const invalidateRects = () => {
      rectsDirty = true;
      if (cursorInside) {
        scheduleUpdate();
      }
    };

    const scheduleUpdate = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    const updateGlow = () => {
      rafId = 0;
      if (rectsDirty) {
        refreshRects();
      }
      for (let i = 0; i < wrappers.length; i++) {
        const rect = cachedRects[i];
        wrappers[i].style.setProperty('--glow-x', `${Math.round(cursorX - rect.left)}px`);
        wrappers[i].style.setProperty('--glow-y', `${Math.round(cursorY - rect.top)}px`);
      }
    };

    const refreshRects = () => {
      for (let i = 0; i < wrappers.length; i++) {
        cachedRects[i] = wrappers[i].getBoundingClientRect();
      }
      rectsDirty = false;
    };

    const onMouseLeave = () => {
      cursorInside = false;
      resetGlow();
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
          document.documentElement.addEventListener('mouseleave', onMouseLeave);
          window.addEventListener('scroll', invalidateRects, { passive: true });
          window.addEventListener('resize', invalidateRects, { passive: true });
          rectsDirty = true;
          trackingEnabled = true;
        }
        return;
      }

      if (trackingEnabled) {
        document.removeEventListener('mousemove', onMouseMove);
        document.documentElement.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('scroll', invalidateRects);
        window.removeEventListener('resize', invalidateRects);
        cursorInside = false;
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
