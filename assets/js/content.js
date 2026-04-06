'use strict';

(() => {
  const COPIED_DURATION = 2000;

  const createIcon = (classes) => {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
  };

  // ── Collapsible Panels ──

  const makeCollapsible = (container, trigger, { skipSelector, preventDefault } = {}) => {
    trigger.addEventListener('click', (e) => {
      if (skipSelector && e.target.closest(skipSelector)) {
        return;
      }
      if (preventDefault) {
        e.preventDefault();
      }
      container.classList.toggle('collapsed');
    });
  };

  // ── Code Blocks ──

  const handleCopy = async (btn) => {
    const codeBlock = btn.closest('.code-block');
    if (!codeBlock) {
      return;
    }

    const codeEl = codeBlock.querySelector('.code pre code');
    if (!codeEl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(codeEl.textContent);
    } catch {
      return;
    }

    btn.replaceChildren(createIcon('fas fa-check'));
    btn.disabled = true;
    setTimeout(() => {
      btn.replaceChildren(createIcon('far fa-copy'));
      btn.disabled = false;
    }, COPIED_DURATION);
  };

  const initCodeBlocks = () => {
    for (const block of document.querySelectorAll('.code-block')) {
      const header = block.querySelector('.code-header');
      if (!header) {
        continue;
      }

      header.prepend(createIcon('fas fa-chevron-down chevron'));

      const copyBtn = header.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.replaceChildren(createIcon('far fa-copy'));
      }

      makeCollapsible(block, header, { skipSelector: '.copy-btn' });
    }

    // Delegated copy handler
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (btn) {
        handleCopy(btn);
      }
    });
  };

  // ── Callouts ──

  const initCallouts = () => {
    for (const callout of document.querySelectorAll('details.callout')) {
      const summary = callout.querySelector('.callout-title');
      const body = callout.querySelector('.callout-body');
      if (!summary || !body) {
        continue;
      }

      // Wrap body children in a single element for CSS grid animation
      const inner = document.createElement('div');
      inner.className = 'callout-body-inner';
      while (body.firstChild) {
        inner.appendChild(body.firstChild);
      }
      body.appendChild(inner);

      // If initially closed, keep open in DOM but visually collapse via CSS
      if (!callout.open) {
        callout.open = true;
        callout.classList.add('collapsed');
      }

      makeCollapsible(callout, summary, { preventDefault: true });
    }
  };

  // ── Heading Anchors ──

  const initHeadingAnchors = () => {
    const headings = document.querySelectorAll(
      '.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]',
    );
    for (const heading of headings) {
      const anchor = document.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.className = 'heading-anchor';
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);
      heading.prepend(anchor);
    }
  };

  // ── Init ──

  const init = () => {
    initCodeBlocks();
    initCallouts();
    initHeadingAnchors();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
