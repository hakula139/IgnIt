'use strict';

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
    window.mermaid.initialize({
      startOnLoad: false,
      theme: themeFor(),
      layout: 'dagre',
      flowchart: { minNodeWidth: 40, nodeSpacing: 32, padding: 8, rankSpacing: 40 },
    });
    await window.mermaid.run({ nodes: blocks });
    for (const el of blocks) {
      const svg = el.querySelector('svg');
      if (svg) {
        svg.style.minWidth = `${svg.viewBox.baseVal.width * 0.75}px`;
      }
    }
  };

  render();
  new MutationObserver((muts) => {
    if (muts.some((m) => m.attributeName === 'data-theme')) {
      render();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
