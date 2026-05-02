'use strict';

(() => {
  const COPIED_DURATION = 2000;

  const createIcon = (classes) => {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
  };

  // ── Collapsible Panels ──

  const makeCollapsible = (container, trigger, { skipSelector, preventDefault } = {}) => {
    const toggle = () => {
      container.classList.toggle('collapsed');
      if (trigger.hasAttribute('aria-expanded')) {
        const expanded = !container.classList.contains('collapsed');
        trigger.setAttribute('aria-expanded', String(expanded));
      }
    };

    trigger.addEventListener('click', (e) => {
      if (skipSelector && e.target.closest(skipSelector)) {
        return;
      }
      if (preventDefault) {
        e.preventDefault();
      }
      toggle();
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  };

  // ── Code Blocks ──

  const handleCopy = async (btn) => {
    const codeBlock = btn.closest('.code-block');
    if (!codeBlock) {
      return;
    }

    const codeEl = codeBlock.querySelector('.code pre code');
    if (!codeEl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(codeEl.textContent);
    } catch {
      return;
    }

    btn.replaceChildren(createIcon('fas fa-check'));
    btn.disabled = true;
    setTimeout(() => {
      btn.replaceChildren(createIcon('far fa-copy'));
      btn.disabled = false;
    }, COPIED_DURATION);
  };

  const initCodeBlocks = () => {
    for (const block of document.querySelectorAll('.code-block')) {
      const header = block.querySelector('.code-header');
      if (!header) {
        continue;
      }

      header.prepend(createIcon('fas fa-chevron-down chevron'));

      const copyBtn = header.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.replaceChildren(createIcon('far fa-copy'));
      }

      makeCollapsible(block, header, { skipSelector: '.copy-btn' });
    }

    // Delegated copy handler.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (btn) {
        handleCopy(btn);
      }
    });
  };

  // ── Callouts ──

  const initCallouts = () => {
    for (const callout of document.querySelectorAll('details.callout')) {
      const summary = callout.querySelector('.callout-title');
      const body = callout.querySelector('.callout-body');
      if (!summary || !body) {
        continue;
      }

      // Wrap body children in a single element for CSS grid animation.
      const inner = document.createElement('div');
      inner.className = 'callout-body-inner';
      while (body.firstChild) {
        inner.appendChild(body.firstChild);
      }
      body.appendChild(inner);

      // If initially closed, keep open in DOM but visually collapse via CSS.
      if (!callout.open) {
        callout.open = true;
        callout.classList.add('collapsed');
      }

      makeCollapsible(callout, summary, { preventDefault: true });
    }
  };

  // ── Table of Contents ──

  const initTocCollapse = () => {
    for (const toc of document.querySelectorAll('.toc-collapse')) {
      const trigger = toc.querySelector('.toc-trigger');
      if (!trigger) {
        continue;
      }

      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('aria-expanded', String(!toc.classList.contains('collapsed')));
      makeCollapsible(toc, trigger);
    }
  };

  // ── Heading Anchors ──

  const initHeadingAnchors = () => {
    const headings = document.querySelectorAll(
      '.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]',
    );
    const jumpToPrefix = document.documentElement.dataset.i18nJumpTo;
    for (const heading of headings) {
      const anchor = document.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.className = 'heading-anchor';
      anchor.textContent = '#';
      const label = jumpToPrefix ? `${jumpToPrefix} ${heading.textContent}` : heading.textContent;
      anchor.setAttribute('aria-label', label);
      heading.prepend(anchor);
    }
  };

  // ── LQIP Fade-In ──

  // Pairs with `theme.js`'s head-time `lqip-fade-enabled` flip on `<html>`.
  // The keyframe is opt-in per element so repeat visits don't re-animate.
  // Browser cache state alone is too leaky (304 revalidations cross the wire,
  // dev servers skip cache, hard reload bypasses it), so we persist a bounded
  // "seen" set in localStorage as the primary signal and fall back to
  // Resource Timing for first-session reveals.

  const LQIP_SEEN_KEY = 'lqip.seen.v1';
  const LQIP_SEEN_MAX = 200;

  const readSeen = () => {
    try {
      return JSON.parse(localStorage.getItem(LQIP_SEEN_KEY)) || {};
    } catch {
      return {};
    }
  };

  const writeSeen = (seen) => {
    try {
      const trimmed = Object.fromEntries(
        Object.entries(seen)
          .sort((a, b) => b[1] - a[1])
          .slice(0, LQIP_SEEN_MAX),
      );
      localStorage.setItem(LQIP_SEEN_KEY, JSON.stringify(trimmed));
    } catch {
      // Quota / private mode — animation still runs, just no persistence.
    }
  };

  // Key by URL + LQIP URI: the LQIP is a build-time content fingerprint, so
  // reusing a URL with new bytes also rotates the LQIP and misses the cache.
  const lqipKey = (wrapper, img) => {
    const url = img.currentSrc || img.src;
    if (!url) {
      return null;
    }
    const lqip = wrapper.style.getPropertyValue('--lqip-uri') || '';
    return `${new URL(url, location.href).href} ${lqip}`;
  };

  // `transferSize === 0 && encodedBodySize > 0` — pairing with the body size
  // rules out cross-origin entries that strip Timing-Allow-Origin (those also
  // report transferSize 0 and would be false positives).
  const isCacheHit = (img) => {
    const url = img.currentSrc || img.src;
    if (!url) {
      return false;
    }
    const entries = performance.getEntriesByName(url, 'resource');
    if (!entries.length) {
      return false;
    }
    const last = entries[entries.length - 1];
    return last.transferSize === 0 && last.encodedBodySize > 0;
  };

  const prefersReducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const initLqipFadeIn = () => {
    const seen = readSeen();
    const reduced = prefersReducedMotion();
    let dirty = false;

    const reveal = (wrapper, key, animate) => {
      if (animate) {
        wrapper.classList.add('lqip-fade-in');
      }
      wrapper.classList.add('lqip-loaded');
      if (key && !seen[key]) {
        seen[key] = Date.now();
        dirty = true;
      }
    };

    for (const wrapper of document.querySelectorAll('.lqip')) {
      const img = wrapper.querySelector(':scope > img');
      if (!img) {
        continue;
      }
      const key = lqipKey(wrapper, img);
      if (img.complete || (key && seen[key]) || isCacheHit(img)) {
        reveal(wrapper, key, false);
        continue;
      }
      img.addEventListener(
        'load',
        () => {
          const animate = !reduced && !(key && seen[key]) && !isCacheHit(img);
          reveal(wrapper, key, animate);
          if (dirty) {
            writeSeen(seen);
            dirty = false;
          }
        },
        { once: true },
      );
      img.addEventListener('error', () => reveal(wrapper, key, false), { once: true });
    }

    if (dirty) {
      writeSeen(seen);
      dirty = false;
    }
  };

  // ── External Links ──

  const initExternalLinks = () => {
    const { hostname } = window.location;
    for (const link of document.querySelectorAll('a[href]')) {
      try {
        const url = new URL(link.href);
        if (url.hostname && url.hostname !== hostname) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      } catch {
        // Skip relative or malformed URLs.
      }
    }
  };

  // ── Init ──

  const init = () => {
    initCodeBlocks();
    initCallouts();
    initTocCollapse();
    initHeadingAnchors();
    initLqipFadeIn();
    initExternalLinks();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
