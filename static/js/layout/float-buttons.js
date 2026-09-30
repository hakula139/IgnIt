'use strict';

(() => {
  const SCROLL_THRESHOLD = 100;

  const init = () => {
    const backToTop = document.getElementById('back-to-top');
    const jumpToComments = document.getElementById('jump-to-comments');
    const comments = document.getElementById('comments');

    const update = () => {
      backToTop.hidden = window.scrollY <= SCROLL_THRESHOLD;
      backToTop.inert = backToTop.hidden;
      if (jumpToComments) {
        jumpToComments.hidden =
          !comments || comments.getBoundingClientRect().top <= window.innerHeight;
        jumpToComments.inert = jumpToComments.hidden;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

    update();
  };

  window.__onReady(init);
})();
