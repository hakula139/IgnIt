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

  const initTwikoo = () => {
    const root = document.getElementById('twikoo');
    if (!root || typeof twikoo === 'undefined') {
      return;
    }

    const envId = root.dataset.twikooEnvId;
    if (!envId) {
      return;
    }

    twikoo.init({
      envId,
      el: '#twikoo',
      path: window.location.pathname,
      lang: langOf(),
      katex: { delimiters: KATEX_DELIMITERS, throwOnError: false },
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTwikoo);
  } else {
    initTwikoo();
  }
})();
