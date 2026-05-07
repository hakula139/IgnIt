'use strict';

(() => {
  const KATEX_DELIMITERS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ];

  // Twikoo's i18n table uses fixed locale codes (zh-CN, zh-TW, en, ...). Map
  // the BCP-47 forms a site might declare in <html lang> — script-based
  // (zh-Hans / zh-Hant) and region-based (zh-CN / zh-TW) — to what Twikoo
  // recognizes. Anything else falls through to English.
  const TWIKOO_LANG_MAP = {
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'zh-cn': 'zh-CN',
    'zh-tw': 'zh-TW',
  };

  const langOf = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return TWIKOO_LANG_MAP[l] || (l.startsWith('zh') ? 'zh-CN' : 'en');
  };

  const initTwikoo = () => {
    const root = document.getElementById('twikoo');
    if (!root || typeof twikoo === 'undefined') {
      return;
    }

    const apiUrl = root.dataset.twikooApiUrl;
    if (!apiUrl) {
      return;
    }

    twikoo.init({
      envId: apiUrl,
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
