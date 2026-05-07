'use strict';

(() => {
  const SCROLL_THRESHOLD = 300;

  const bind = (id, predicate) => {
    const btn = document.getElementById(id);
    if (!btn) {
      return null;
    }

    const update = () => btn.classList.toggle('visible', predicate());
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    return btn;
  };

  const init = () => {
    // ── Back to Top ──

    const backToTop = bind('back-to-top', () => window.scrollY > SCROLL_THRESHOLD);
    if (backToTop) {
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0 }));
    }

    // ── Jump to Comments ──

    if (!document.getElementById('twikoo')) {
      return;
    }

    // Re-query #twikoo each tick: Twikoo replaces the mount node on init, so
    // the original reference becomes detached. `rect.top > viewportHeight`
    // avoids false positives IntersectionObserver triggers on tall comment
    // threads (the target stays intersecting long after the user passes the
    // comments header).
    const targetRect = () => document.getElementById('twikoo')?.getBoundingClientRect();
    const jump = bind(
      'jump-to-comments',
      () => window.scrollY > SCROLL_THRESHOLD && (targetRect()?.top ?? 0) > window.innerHeight,
    );
    if (jump) {
      jump.addEventListener('click', () => {
        document.getElementById('twikoo')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
