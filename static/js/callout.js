'use strict';

(() => {
  const initCallouts = () => {
    for (const callout of document.querySelectorAll('details.callout')) {
      const summary = callout.querySelector('.callout-title');
      const body = callout.querySelector('.callout-body');
      if (!summary || !body) {
        continue;
      }

      // Wrap body children in a single div for CSS grid animation
      const inner = document.createElement('div');
      inner.className = 'callout-body-inner';
      while (body.firstChild) {
        inner.appendChild(body.firstChild);
      }
      body.appendChild(inner);

      summary.addEventListener('click', (e) => {
        e.preventDefault();

        if (callout.open) {
          // Animate closed, then remove open attribute
          body.classList.add('collapsing');
          body.addEventListener(
            'transitionend',
            () => {
              callout.open = false;
              body.classList.remove('collapsing');
            },
            { once: true },
          );
        } else {
          // Set open, start collapsed, then animate to full height
          callout.open = true;
          body.classList.add('expanding');
          body.offsetHeight; // force reflow
          body.classList.remove('expanding');
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCallouts);
  } else {
    initCallouts();
  }
})();
