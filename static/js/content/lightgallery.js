'use strict';

(() => {
  const ARTICLE_SCOPE = '.prose';
  const ARTICLE_IMG_SELECTOR = 'figure img';
  const COMMENTS_IMG_SELECTOR = 'img:not(.tk-owo-emotion):not(.tk-avatar-img)';

  const escapeHtml = (s) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );

  const wrapImage = (img) => {
    if (img.closest('a')) {
      return;
    }
    // Keep the image as .lqip's direct child because lqip.css depends on that structure.
    const parent = img.parentElement;
    const wrapTarget = parent && parent.classList.contains('lqip') ? parent : img;
    if (!wrapTarget.parentNode) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.className = 'lightgallery';
    anchor.href = img.src;
    anchor.setAttribute('data-thumbnail', img.src);
    if (img.alt) {
      anchor.title = img.alt;
    }

    const figure = img.closest('figure');
    const caption = figure?.querySelector('figcaption')?.textContent.trim();
    if (caption) {
      anchor.setAttribute('data-sub-html', `<h2>${escapeHtml(caption)}</h2>`);
    }

    wrapTarget.parentNode.insertBefore(anchor, wrapTarget);
    anchor.appendChild(wrapTarget);
  };

  const wrapAll = (scope, selector) => {
    if (!scope) {
      return;
    }
    for (const img of scope.querySelectorAll(selector)) {
      wrapImage(img);
    }
  };

  const licenseKey = document.querySelector('meta[name="lg-license-key"]')?.content;

  const initOn = (scope) => {
    if (!scope) {
      return;
    }
    if (scope.lgInstance) {
      scope.lgInstance.refresh();
      return;
    }
    if (!scope.querySelector('a.lightgallery')) {
      return;
    }
    if (typeof window.lightGallery !== 'function') {
      console.warn('[lightgallery] window.lightGallery missing; CDN load likely failed');
      return;
    }
    scope.lgInstance = window.lightGallery(scope, {
      selector: 'a.lightgallery',
      plugins: [window.lgThumbnail, window.lgZoom].filter(Boolean),
      ...(licenseKey ? { licenseKey } : {}),
      speed: 400,
      hideBarsDelay: 2000,
      allowMediaOverlap: true,
      exThumbImage: 'data-thumbnail',
      toggleThumb: true,
      thumbWidth: 80,
      thumbHeight: '60px',
      actualSize: false,
      showZoomInOutIcons: true,
    });
  };

  const wrapAndInit = (scope, selector) => {
    wrapAll(scope, selector);
    initOn(scope);
  };

  window.__rewrapLightGallery = (scope) => wrapAndInit(scope, COMMENTS_IMG_SELECTOR);

  window.__onReady(() => wrapAndInit(document.querySelector(ARTICLE_SCOPE), ARTICLE_IMG_SELECTOR));
})();
