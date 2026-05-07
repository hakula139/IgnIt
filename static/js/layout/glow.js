'use strict';

(() => {
  const initGlassGlow = () => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const MODAL_SELECTOR = '[data-glow-target][open]';
    const BG_SELECTOR = '.glass-glow, [data-glow-target]:not([open])';
    const GLOW_LAYER_SELECTOR = '.glow-ambient, .glow-border-spot';

    const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const queryActiveTargets = () => {
      const modal = document.querySelector(MODAL_SELECTOR);
      return modal ? [modal] : Array.from(document.querySelectorAll(BG_SELECTOR));
    };

    // Inject glow layers as real children so JS can write transform on them
    // directly, instead of invalidating the parent's style every cursor move.
    const ensureGlowLayers = (el) => {
      let ambient = el.querySelector(':scope > .glow-ambient');
      if (!ambient) {
        ambient = document.createElement('span');
        ambient.className = 'glow-ambient';
        ambient.setAttribute('aria-hidden', 'true');
        el.appendChild(ambient);
      }
      let border = el.querySelector(':scope > .glow-border');
      if (!border) {
        border = document.createElement('span');
        border.className = 'glow-border';
        border.setAttribute('aria-hidden', 'true');
        const spot = document.createElement('span');
        spot.className = 'glow-border-spot';
        border.appendChild(spot);
        el.appendChild(border);
      }
      return { ambient, borderSpot: border.firstElementChild };
    };

    const buildTarget = (el) => {
      const layers = ensureGlowLayers(el);
      return {
        el,
        rect: null,
        fixed: false,
        inView: true,
        ambient: layers.ambient,
        borderSpot: layers.borderSpot,
      };
    };

    let cursorX = -9999;
    let cursorY = -9999;
    let rafId = 0;
    let trackingEnabled = false;
    let targets = queryActiveTargets().map(buildTarget);
    let rectsDirty = true;
    let scrolling = false;
    let viewObserver = null;

    // ── Event Handlers ──

    const onMouseMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      scrolling = false;
      scheduleUpdate();
    };

    const invalidateRects = () => {
      rectsDirty = true;
      scheduleUpdate();
    };

    const onScroll = () => {
      scrolling = true;
      rectsDirty = true;
      resetGlow();
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
      if (scrolling) {
        return;
      }
      if (rectsDirty) {
        measureTargets();
      }
      for (const { ambient, borderSpot, rect, inView } of targets) {
        if (
          !inView ||
          cursorX < rect.left ||
          cursorX > rect.right ||
          cursorY < rect.top ||
          cursorY > rect.bottom
        ) {
          ambient.style.transform = '';
          borderSpot.style.transform = '';
          continue;
        }
        const transform = `translate3d(${Math.round(cursorX - rect.left)}px, ${Math.round(cursorY - rect.top)}px, 0)`;
        ambient.style.transform = transform;
        borderSpot.style.transform = transform;
      }
    };

    const measureTargets = () => {
      for (const t of targets) {
        t.rect = t.el.getBoundingClientRect();
        const pos = getComputedStyle(t.el).position;
        t.fixed = pos === 'fixed' || pos === 'sticky';
      }
      rectsDirty = false;
    };

    // ── Lifecycle ──

    const disconnectViewObserver = () => {
      if (viewObserver !== null) {
        viewObserver.disconnect();
        viewObserver = null;
      }
    };

    const observeViewport = () => {
      disconnectViewObserver();
      if (targets.length === 0) {
        return;
      }
      const targetByEl = new Map(targets.map((t) => [t.el, t]));
      viewObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const t = targetByEl.get(entry.target);
          if (t) {
            t.inView = entry.isIntersecting;
          }
        }
        scheduleUpdate();
      });
      for (const t of targets) {
        viewObserver.observe(t.el);
      }
    };

    const resetGlow = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      for (const el of document.querySelectorAll(GLOW_LAYER_SELECTOR)) {
        el.style.transform = '';
      }
    };

    const syncTargets = () => {
      targets = queryActiveTargets().map(buildTarget);
      rectsDirty = true;
      resetGlow();
      if (trackingEnabled) {
        observeViewport();
        scheduleUpdate();
      }
    };

    const enableTracking = () => {
      document.addEventListener('mousemove', onMouseMove);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', invalidateRects, { passive: true });
      observeViewport();
      trackingEnabled = true;
    };

    const disableTracking = () => {
      if (trackingEnabled) {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', invalidateRects);
        disconnectViewObserver();
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
