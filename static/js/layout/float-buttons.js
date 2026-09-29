'use strict';

(() => {
  const SCROLL_THRESHOLD = 100;
  const DIRECTION_THRESHOLD = 20;

  const init = () => {
    const backToTop = document.getElementById('back-to-top');
    const jumpToComments = document.getElementById('jump-to-comments');
    const comments = document.getElementById('comments');
    const mobile = window.matchMedia('(max-width: 639px)');
    let lastScrollY = window.scrollY;
    let direction = 0;
    let distance = 0;
    let showBackToTop = false;

    const update = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;
      const nextDirection = Math.sign(delta);

      if (nextDirection) {
        distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;
        if (distance >= DIRECTION_THRESHOLD) {
          showBackToTop = direction < 0;
        }
      }

      backToTop.hidden = scrollY <= SCROLL_THRESHOLD || (mobile.matches && !showBackToTop);
      if (jumpToComments) {
        jumpToComments.hidden =
          !comments || comments.getBoundingClientRect().top <= window.innerHeight;
      }
      lastScrollY = scrollY;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

    update();
  };

  window.__onReady(init);
})();
