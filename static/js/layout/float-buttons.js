'use strict';

(() => {
  const SCROLL_THRESHOLD = 300;

  const bind = (id, predicate, onClick) => {
    const btn = document.getElementById(id);
    if (!btn) {
      return;
    }

    const update = () => btn.classList.toggle('visible', predicate());
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

    // rect.top, not IntersectionObserver — tall threads stay intersecting past the header.
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
