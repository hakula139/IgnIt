'use strict';

(() => {
  // Pairs with `theme.js`'s head-time `lqip-fade-enabled` flip on `<html>`.
  // `.lqip-fade-in` opts a wrapper into the keyframe; `.lqip-loaded` triggers it.
  const ANIMATE_CONTEXTS = '.home-card > .lqip, .post-banner-media > .lqip, .prose figure > .lqip';

  // `img.complete` lies for cached bytes under `decoding="async"`. Resource
  // Timing: no body crossed the wire = memory cache (transferSize=0) or
  // 304 revalidation (encodedBodySize=0).
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
    // Force-fetch lazy images the browser deferred past viewport during fast scroll.
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

      // Synchronously complete = no perceived wait → no animation.
      if (img.complete) {
        wrapper.classList.add('lqip-loaded');
        continue;
      }

      const animate =
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        wrapper.matches(ANIMATE_CONTEXTS);
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
