'use strict';

(() => {
  const COPIED_DURATION = 2000;

  const createIcon = (classes) => {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
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
    for (const btn of document.querySelectorAll('.code-block > .code-header > .copy-btn')) {
      btn.replaceChildren(createIcon('far fa-copy'));
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (btn) {
        e.preventDefault();
        handleCopy(btn);
      }
    });
  };

  // ── Heading Anchors ──

  const initHeadingAnchors = () => {
    const headings = document.querySelectorAll(
      '.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]',
    );
    const jumpToPrefix = document.documentElement.dataset.i18nJumpTo;
    for (const heading of headings) {
      if (heading.closest('.callout, blockquote') || heading.querySelector('a')) {
        continue;
      }

      const anchor = document.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.className = 'heading-anchor';
      const label = jumpToPrefix ? `${jumpToPrefix} ${heading.textContent}` : heading.textContent;
      anchor.setAttribute('aria-label', label);
      anchor.append(...heading.childNodes);
      heading.append(anchor);
    }
  };

  // ── External Links ──

  const initExternalLinks = () => {
    const { origin } = window.location;
    for (const link of document.querySelectorAll('a[href]')) {
      // Skip non-http(s) schemes (mailto, tel) where Anchor.origin is empty.
      if (link.protocol !== 'http:' && link.protocol !== 'https:') {
        continue;
      }
      if (link.origin && link.origin !== origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    }
  };

  // ── Init ──

  const init = () => {
    initCodeBlocks();
    initHeadingAnchors();
    initExternalLinks();
  };

  window.__onReady(init);
})();
