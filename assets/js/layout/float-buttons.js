'use strict';

(() => {
  const SCROLL_THRESHOLD = 100;

  const init = () => {
    const backToTop = document.getElementById('back-to-top');
    const jumpToComments = document.getElementById('jump-to-comments');
    const comments = document.getElementById('comments');
    let frame = 0;

    const update = () => {
      frame = 0;
      backToTop.inert = window.scrollY <= SCROLL_THRESHOLD;
      if (jumpToComments) {
        jumpToComments.inert =
          !comments || comments.getBoundingClientRect().top <= window.innerHeight;
      }
    };

    const scheduleUpdate = () => {
      frame ||= requestAnimationFrame(update);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    update();
  };

  init();
})();
