'use strict';

(() => {
  const markLoaded = (wrapper) => wrapper.classList.add('lqip-loaded');

  const init = () => {
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
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
          )
        : null;

    const observeLazy = (wrapper, img) => {
      if (img.loading !== 'lazy' || img.complete) {
        return;
      }
      if (observer) {
        observer.observe(wrapper);
      } else {
        img.loading = 'eager';
      }
    };

    for (const wrapper of document.querySelectorAll('.lqip')) {
      const img = wrapper.querySelector(':scope > img');
      if (!img) {
        markLoaded(wrapper);
        continue;
      }

      img.addEventListener('load', () => markLoaded(wrapper), { once: true });
      img.addEventListener('error', () => markLoaded(wrapper), { once: true });

      if (img.complete) {
        markLoaded(wrapper);
      } else {
        observeLazy(wrapper, img);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
