'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const GLOW_TARGET_SELECTOR = '.glass-glow, [data-glow-target]';
    const ACTIVE_MODAL_SELECTOR = '[data-glow-target][open]';
    const BACKGROUND_GLOW_SELECTOR = '.glass-glow, [data-glow-target]:not([open])';

    const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';
    const allGlowTargets = () => Array.from(document.querySelectorAll(GLOW_TARGET_SELECTOR));
    const activeGlowTargets = () => {
      const modal = document.querySelector(ACTIVE_MODAL_SELECTOR);
      if (modal) {
        return [modal];
      }
      return Array.from(document.querySelectorAll(BACKGROUND_GLOW_SELECTOR));
    };

    let cursorX = -9999;
    let cursorY = -9999;
    let rafId = 0;
    let trackingEnabled = false;

    let targets = Array.from(activeGlowTargets());
    let cachedRects = new Array(targets.length);
    let rectsDirty = true;

    const onMouseMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      scheduleUpdate();
    };

    const invalidateRects = () => {
      rectsDirty = true;
      scheduleUpdate();
    };

    const scheduleUpdate = () => {
      if (targets.length > 0 && rafId === 0) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    const updateGlow = () => {
      rafId = 0;
      if (targets.length === 0) {
        return;
      }
      if (rectsDirty) {
        measureTargets();
      }
      for (let i = 0; i < targets.length; i++) {
        const rect = cachedRects[i];
        targets[i].style.setProperty('--glow-x', `${Math.round(cursorX - rect.left)}px`);
        targets[i].style.setProperty('--glow-y', `${Math.round(cursorY - rect.top)}px`);
      }
    };

    const measureTargets = () => {
      cachedRects = new Array(targets.length);
      for (let i = 0; i < targets.length; i++) {
        cachedRects[i] = targets[i].getBoundingClientRect();
      }
      rectsDirty = false;
    };

    const syncTargets = () => {
      targets = Array.from(activeGlowTargets());
      cachedRects = new Array(targets.length);
      rectsDirty = true;
      resetGlow();
      if (trackingEnabled) {
        scheduleUpdate();
      }
    };

    const resetGlow = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      for (const wrapper of allGlowTargets()) {
        wrapper.style.removeProperty('--glow-x');
        wrapper.style.removeProperty('--glow-y');
      }
    };

    const enableTracking = () => {
      document.addEventListener('mousemove', onMouseMove);
      window.addEventListener('scroll', invalidateRects, { passive: true });
      window.addEventListener('resize', invalidateRects, { passive: true });
      trackingEnabled = true;
    };

    const disableTracking = () => {
      if (trackingEnabled) {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', invalidateRects);
        window.removeEventListener('resize', invalidateRects);
        trackingEnabled = false;
      }
      resetGlow();
    };

    const syncGlowTracking = () => {
      syncTargets();

      if (!isDarkTheme() || targets.length === 0) {
        disableTracking();
        return;
      }

      if (!trackingEnabled) {
        enableTracking();
      }
    };

    const observer = new MutationObserver(syncGlowTracking);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open', 'data-glow-target'],
    });

    syncGlowTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassGlow);
  } else {
    initGlassGlow();
  }
})();
