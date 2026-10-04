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

  // ── Link Underlines ──

  const initLinkUnderlines = () => {
    const underlineSelector = 'u, ins, .underline';

    for (const link of document.querySelectorAll('.prose a[href]')) {
      if (
        link.closest('.not-prose, .footnote-reference') ||
        link.matches('.heading-anchor, .footnote-backref') ||
        (link.children.length === 1 &&
          link.firstElementChild.matches('img, .lqip') &&
          !link.textContent.trim())
      ) {
        continue;
      }

      for (const underline of link.querySelectorAll(underlineSelector)) {
        if (!underline.closest('.not-prose')) {
          underline.classList.add('underline-baseline');
        }
      }

      for (
        let underline = link.closest(underlineSelector);
        underline && underline.closest('.prose');
        underline = underline.parentElement?.closest(underlineSelector)
      ) {
        underline.classList.add('underline-baseline');
        link.classList.add('underline-baseline');
      }

      const track = document.createElement('span');
      track.className = 'underline-track';
      track.append(...link.childNodes);
      link.append(track);
      link.classList.add('animated-underline');
    }
  };

  // ── Init ──

  const init = () => {
    initCodeBlocks();
    initHeadingAnchors();
    initExternalLinks();
    initLinkUnderlines();
  };

  window.__onReady(init);
})();
