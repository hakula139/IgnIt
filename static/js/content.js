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
    const toggle = () => {
      container.classList.toggle('collapsed');
      if (trigger.hasAttribute('aria-expanded')) {
        const expanded = !container.classList.contains('collapsed');
        trigger.setAttribute('aria-expanded', String(expanded));
      }
    };

    trigger.addEventListener('click', (e) => {
      if (skipSelector && e.target.closest(skipSelector)) {
        return;
      }
      if (preventDefault) {
        e.preventDefault();
      }
      toggle();
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
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

    // Delegated copy handler.
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

      // Wrap body children in a single element for CSS grid animation.
      const inner = document.createElement('div');
      inner.className = 'callout-body-inner';
      while (body.firstChild) {
        inner.appendChild(body.firstChild);
      }
      body.appendChild(inner);

      // If initially closed, keep open in DOM but visually collapse via CSS.
      if (!callout.open) {
        callout.open = true;
        callout.classList.add('collapsed');
      }

      makeCollapsible(callout, summary, { preventDefault: true });
    }
  };

  // ── Table of Contents ──

  const initTocCollapse = () => {
    for (const toc of document.querySelectorAll('.toc-collapse')) {
      const trigger = toc.querySelector('.toc-trigger');
      if (!trigger) {
        continue;
      }

      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('aria-expanded', String(!toc.classList.contains('collapsed')));
      makeCollapsible(toc, trigger);
    }
  };

  // ── Heading Anchors ──

  const initHeadingAnchors = () => {
    const headings = document.querySelectorAll(
      '.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]',
    );
    const jumpToPrefix = document.documentElement.dataset.i18nJumpTo;
    for (const heading of headings) {
      const anchor = document.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.className = 'heading-anchor';
      anchor.textContent = '#';
      const label = jumpToPrefix ? `${jumpToPrefix} ${heading.textContent}` : heading.textContent;
      anchor.setAttribute('aria-label', label);
      heading.prepend(anchor);
    }
  };

  // ── External Links ──

  const initExternalLinks = () => {
    const { hostname } = window.location;
    for (const link of document.querySelectorAll('a[href]')) {
      try {
        const url = new URL(link.href);
        if (url.hostname && url.hostname !== hostname) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      } catch {
        // Skip relative or malformed URLs.
      }
    }
  };

  // ── Init ──

  const init = () => {
    initCodeBlocks();
    initCallouts();
    initTocCollapse();
    initHeadingAnchors();
    initExternalLinks();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
