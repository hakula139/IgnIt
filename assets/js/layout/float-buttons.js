'use strict';

(() => {
  const SCROLL_THRESHOLD = 100;

  const init = () => {
    const backToTop = document.getElementById('back-to-top');
    const jumpToComments = document.getElementById('jump-to-comments');
    const comments = document.getElementById('comments');

    const update = () => {
      backToTop.inert = window.scrollY <= SCROLL_THRESHOLD;
      if (jumpToComments) {
        jumpToComments.inert =
          !comments || comments.getBoundingClientRect().top <= window.innerHeight;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    update();
  };

  window.__onReady(init);
})();
