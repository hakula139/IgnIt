'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';
    const syncModalGlowClass = () => {
      for (const modal of document.querySelectorAll('dialog.pf-modal')) {
        modal.classList.add('glass-glow');
      }
    };
    const allGlowTargets = () => document.querySelectorAll('.glass-glow');
    const activeGlowTargets = () => {
      const modal = document.querySelector('dialog.pf-modal[open].glass-glow');
      if (modal) {
        return [modal];
      }
      return Array.from(document.querySelectorAll('.glass-glow')).filter(
        (element) => !element.matches('dialog.pf-modal'),
      );
    };

    let cursorX = -9999;
    let cursorY = -9999;
    let cursorInside = false;
    let rafId = 0;
    let trackingEnabled = false;

    let wrappers = activeGlowTargets();
    let cachedRects = new Array(wrappers.length);
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
      if (wrappers.length > 0 && rafId === 0) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    const updateGlow = () => {
      rafId = 0;
      if (wrappers.length === 0) {
        return;
      }
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
      wrappers = activeGlowTargets();
      cachedRects = new Array(wrappers.length);
      for (let i = 0; i < wrappers.length; i++) {
        cachedRects[i] = wrappers[i].getBoundingClientRect();
      }
      rectsDirty = false;
    };

    const refreshTargets = () => {
      wrappers = activeGlowTargets();
      cachedRects = new Array(wrappers.length);
      rectsDirty = true;
      resetGlow();
      if (cursorInside) {
        scheduleUpdate();
      }
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

      for (const wrapper of allGlowTargets()) {
        wrapper.style.removeProperty('--glow-x');
        wrapper.style.removeProperty('--glow-y');
      }
    };

    const syncGlowTracking = () => {
      wrappers = activeGlowTargets();

      if (isDarkTheme() && wrappers.length > 0) {
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

    const observer = new MutationObserver(() => {
      syncModalGlowClass();
      refreshTargets();
      syncGlowTracking();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open'],
    });

    syncModalGlowClass();
    syncGlowTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassGlow);
  } else {
    initGlassGlow();
  }
})();
