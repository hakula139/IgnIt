'use strict';

(() => {
  const KATEX_DELIMITERS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
  ];

  const TWIKOO_LANG_MAP = {
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'zh-cn': 'zh-CN',
    'zh-tw': 'zh-TW',
  };

  const langOf = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return TWIKOO_LANG_MAP[l] || 'en';
  };

  const initTwikoo = () => {
    const root = document.getElementById('twikoo');
    if (!root || !window.twikoo) {
      return;
    }

    const apiUrl = root.dataset.twikooApiUrl;
    if (!apiUrl) {
      return;
    }

    window.twikoo.init({
      envId: apiUrl,
      el: '#twikoo',
      path: window.location.pathname,
      lang: langOf(),
      katex: { delimiters: KATEX_DELIMITERS, throwOnError: false },
      onCommentLoaded: () => window.__rewrapLightGallery?.(root),
    });
  };

  window.__onReady(initTwikoo);
})();
