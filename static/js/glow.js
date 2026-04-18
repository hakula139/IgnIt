'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const GLOW_SELECTOR = '.glass-glow, [data-glow-target]';
    const MODAL_SELECTOR = '[data-glow-target][open]';
    const BG_SELECTOR = '.glass-glow, [data-glow-target]:not([open])';

    const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const queryAllTargets = () => document.querySelectorAll(GLOW_SELECTOR);

    const queryActiveTargets = () => {
      const modal = document.querySelector(MODAL_SELECTOR);
      return modal ? [modal] : Array.from(document.querySelectorAll(BG_SELECTOR));
    };

    let cursorX = -9999;
    let cursorY = -9999;
    let rafId = 0;
    let trackingEnabled = false;
    let targets = queryActiveTargets().map((el) => ({ el, rect: null, fixed: false }));
    let rectsDirty = true;
    let lastScrollY = window.scrollY;
    let scrollEndTimer = 0;
    let lastScrollRender = 0;

    // On high-refresh-rate displays (120Hz+), each setProperty update
    // triggers backdrop-filter re-compositing. Cap scroll-triggered
    // renders to ~30fps to keep compositor commits within budget.
    const SCROLL_RENDER_MS = 32;

    // ── Event Handlers ──

    const onMouseMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      scheduleUpdate();
    };

    const invalidateRects = () => {
      rectsDirty = true;
      scheduleUpdate();
    };

    // Adjust cached rects by scroll delta instead of calling
    // getBoundingClientRect (which forces a synchronous reflow after
    // setProperty dirtied styles). Rect adjustment runs on every scroll
    // event (cheap math), but rendering is throttled via SCROLL_RENDER_MS.
    const onScroll = () => {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(invalidateRects, 150);

      if (rectsDirty) {
        return;
      }

      const scrollY = window.scrollY;
      const dy = scrollY - lastScrollY;
      lastScrollY = scrollY;
      if (dy === 0) {
        return;
      }

      for (const t of targets) {
        if (!t.fixed) {
          t.rect = { left: t.rect.left, top: t.rect.top - dy };
        }
      }

      const now = performance.now();
      if (now - lastScrollRender < SCROLL_RENDER_MS) {
        return;
      }
      lastScrollRender = now;
      scheduleUpdate();
    };

    // ── Rendering ──

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
      for (const { el, rect } of targets) {
        el.style.setProperty('--glow-x', `${Math.round(cursorX - rect.left)}px`);
        el.style.setProperty('--glow-y', `${Math.round(cursorY - rect.top)}px`);
      }
    };

    const measureTargets = () => {
      for (const t of targets) {
        t.rect = t.el.getBoundingClientRect();
        const pos = getComputedStyle(t.el).position;
        t.fixed = pos === 'fixed' || pos === 'sticky';
      }
      lastScrollY = window.scrollY;
      rectsDirty = false;
    };

    // ── Lifecycle ──

    const resetGlow = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      for (const el of queryAllTargets()) {
        el.style.removeProperty('--glow-x');
        el.style.removeProperty('--glow-y');
      }
    };

    const syncTargets = () => {
      targets = queryActiveTargets().map((el) => ({ el, rect: null, fixed: false }));
      rectsDirty = true;
      resetGlow();
      if (trackingEnabled) {
        scheduleUpdate();
      }
    };

    const enableTracking = () => {
      document.addEventListener('mousemove', onMouseMove);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', invalidateRects, { passive: true });
      trackingEnabled = true;
    };

    const disableTracking = () => {
      if (trackingEnabled) {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', invalidateRects);
        clearTimeout(scrollEndTimer);
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

    // ── Init ──

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
