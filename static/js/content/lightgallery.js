'use strict';

// Feature-gated companion to lightgallery, emitted by body-deps.html only
// when [params.lightgallery] enabled = true.

(() => {
  const ARTICLE_SCOPE = '.prose';
  const ARTICLE_IMG_SELECTOR = 'figure img';
  const COMMENTS_IMG_SELECTOR = 'img:not(.tk-owo-emotion)';

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
    if (img.closest('a.lightgallery')) {
      return;
    }
    // Wrap the lqip span when present so its fade-in stays on the inner element.
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

  const initOn = (scope) => {
    if (!scope || typeof window.lightGallery !== 'function') {
      return;
    }
    if (scope.lgInstance) {
      scope.lgInstance.refresh();
      return;
    }
    scope.lgInstance = window.lightGallery(scope, {
      selector: 'a.lightgallery',
      plugins: [window.lgThumbnail, window.lgZoom].filter(Boolean),
      licenseKey: window.__lgLicenseKey,
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

  // Called by twikoo.js after each comment render.
  window.__rewrapLightGallery = (scope) => wrapAndInit(scope, COMMENTS_IMG_SELECTOR);

  window.__onReady(() => wrapAndInit(document.querySelector(ARTICLE_SCOPE), ARTICLE_IMG_SELECTOR));
})();
