'use strict';

(() => {
  const SCROLL_THRESHOLD = 300;

  const init = () => {
    const btn = document.getElementById('back-to-top');
    if (!btn) {
      return;
    }

    btn.addEventListener('click', () => window.scrollTo({ top: 0 }));
    window.addEventListener(
      'scroll',
      () => btn.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD),
      { passive: true },
    );
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
