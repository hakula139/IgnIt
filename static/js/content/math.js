'use strict';

// Feature-gated companion to KaTeX auto-render — emitted by body-deps.html
// only when the page's assets.features registry includes "math".

(() => {
  const root = document.querySelector('.prose');
  if (root && typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(root);
  }
})();
