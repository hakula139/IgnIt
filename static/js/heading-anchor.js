'use strict';

(() => {
  const initHeadingAnchors = () => {
    const headings = document.querySelectorAll('.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]');
    for (const heading of headings) {
      const anchor = document.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.className = 'heading-anchor';
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);
      heading.prepend(anchor);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeadingAnchors);
  } else {
    initHeadingAnchors();
  }
})();
