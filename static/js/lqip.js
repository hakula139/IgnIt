'use strict';

(() => {
  const ANIMATE_CONTEXTS = '.home-card > .lqip, .post-banner-media .lqip, .prose figure > .lqip';

  // `img.complete` can lag cached bytes under `decoding="async"`.
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
    return last.transferSize === 0 || last.encodedBodySize === 0;
  };

  const init = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Nudge browser-native lazy loading after fast scrolls.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const img = entry.target.querySelector(':scope > img');
          if (img && img.loading === 'lazy' && !img.complete) {
            img.loading = 'eager';
          }
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' },
    );

    for (const wrapper of document.querySelectorAll('.lqip')) {
      const img = wrapper.querySelector(':scope > img');
      if (!img) {
        wrapper.classList.add('lqip-loaded');
        continue;
      }

      if (img.complete) {
        wrapper.classList.add('lqip-loaded');
        continue;
      }

      const animate = !reduceMotion && wrapper.matches(ANIMATE_CONTEXTS);
      if (animate) {
        wrapper.classList.add('lqip-fade-in');
      }

      img.addEventListener(
        'load',
        () => {
          if (animate && isCacheHit(img)) {
            wrapper.classList.remove('lqip-fade-in');
          }
          wrapper.classList.add('lqip-loaded');
        },
        { once: true },
      );
      img.addEventListener(
        'error',
        () => {
          wrapper.classList.remove('lqip-fade-in');
          wrapper.classList.add('lqip-loaded');
        },
        { once: true },
      );

      if (img.loading === 'lazy') {
        observer.observe(wrapper);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
