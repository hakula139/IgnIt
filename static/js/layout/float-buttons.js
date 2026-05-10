'use strict';

(() => {
  const SCROLL_THRESHOLD = 300;

  const bind = (id, predicate, onClick) => {
    const btn = document.getElementById(id);
    if (!btn) {
      return;
    }

    const update = () => {
      const visible = predicate();
      btn.classList.toggle('visible', visible);
      // Mirror the CSS hide so screen readers don't announce the offscreen control.
      btn.toggleAttribute('aria-hidden', !visible);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    btn.addEventListener('click', onClick);
    update();
  };

  const init = () => {
    bind(
      'back-to-top',
      () => window.scrollY > SCROLL_THRESHOLD,
      () => window.scrollTo({ top: 0 }),
    );

    const comments = document.getElementById('comments');
    if (!comments) {
      return;
    }

    // Manual rect.top check: IntersectionObserver only fires on state change, and a
    // thread taller than the viewport never exits the root, so the flip never arrives.
    bind(
      'jump-to-comments',
      () =>
        window.scrollY > SCROLL_THRESHOLD &&
        comments.getBoundingClientRect().top > window.innerHeight,
      () => comments.scrollIntoView(),
    );
  };

  window.__onReady(init);
})();
