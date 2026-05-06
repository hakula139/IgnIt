'use strict';

(() => {
  const KATEX_DELIMITERS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ];

  const langOf = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return l.startsWith('zh') ? 'zh-CN' : 'en';
  };

  // Twikoo emits `<pre><code class="language-mermaid">` from marked; mermaid.js
  // wants `<pre class="mermaid">`. Idempotent across Twikoo's repaints.
  const transformMermaid = (root) => {
    for (const code of root.querySelectorAll('pre code.language-mermaid')) {
      const next = document.createElement('pre');
      next.className = 'mermaid';
      next.textContent = code.textContent;
      code.parentElement.replaceWith(next);
    }
  };

  const initTwikoo = () => {
    const root = document.getElementById('twikoo');
    if (!root || typeof twikoo === 'undefined') {
      return;
    }

    const envId = root.dataset.twikooEnvId;
    if (!envId) {
      return;
    }

    const featureMath = root.dataset.featureMath === '1';
    const featureMermaid = root.dataset.featureMermaid === '1';

    // Twikoo runs `renderMath` on every TkComment mount when `katex` is set, so
    // KaTeX needs no manual re-run here — only Mermaid does.
    const onCommentLoaded = featureMermaid
      ? () => {
          transformMermaid(root);
          if (typeof window.kilnRenderMermaid === 'function') {
            window.kilnRenderMermaid(root.querySelectorAll('pre.mermaid'));
          }
        }
      : undefined;

    const opts = {
      envId,
      el: '#twikoo',
      path: window.location.pathname,
      lang: langOf(),
    };
    if (onCommentLoaded) {
      opts.onCommentLoaded = onCommentLoaded;
    }
    if (featureMath) {
      opts.katex = { delimiters: KATEX_DELIMITERS, throwOnError: false };
    }

    twikoo.init(opts);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTwikoo);
  } else {
    initTwikoo();
  }
})();
