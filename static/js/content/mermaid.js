'use strict';

// Feature-gated companion to mermaid.js (UMD) — emitted by body-deps.html
// only when the page's assets.features registry includes "mermaid".

(() => {
  const themeFor = () =>
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';

  const render = async () => {
    const blocks = document.querySelectorAll('pre.mermaid');
    for (const el of blocks) {
      if (el.dataset.source !== undefined) {
        el.textContent = el.dataset.source;
      }
      el.removeAttribute('data-processed');
    }
    window.mermaid.initialize({ startOnLoad: false, theme: themeFor() });
    await window.mermaid.run({ nodes: blocks });
  };

  render();
  new MutationObserver((muts) => {
    if (muts.some((m) => m.attributeName === 'data-theme')) {
      render();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
