'use strict';

(() => {
  const root = document.querySelector('.prose');
  if (root && typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(root);
  }
})();
