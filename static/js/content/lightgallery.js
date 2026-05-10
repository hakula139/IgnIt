'use strict';

// Feature-gated companion to lightgallery, emitted by body-deps.html only
// when [params.lightgallery] enabled = true.

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
    if (img.closest('a.lightgallery')) {
      return;
    }
    // Wrap the .lqip parent rather than the inner img: lqip.css uses .lqip > img
    // direct-child selectors, so an anchor between them would break those rules.
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
    if (typeof window.lightGallery !== 'function') {
      console.warn('[lightgallery] window.lightGallery missing; CDN load likely failed');
      return;
    }
    if (scope.lgInstance) {
      scope.lgInstance.refresh();
      return;
    }
    scope.lgInstance = window.lightGallery(scope, {
      selector: 'a.lightgallery',
      plugins: [window.lgThumbnail, window.lgZoom].filter(Boolean),
      licenseKey,
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

  // Twikoo re-renders comment DOM on pagination and reply submit, so we re-scan
  // after each render rather than initializing once at page load.
  window.__rewrapLightGallery = (scope) => wrapAndInit(scope, COMMENTS_IMG_SELECTOR);

  window.__onReady(() => wrapAndInit(document.querySelector(ARTICLE_SCOPE), ARTICLE_IMG_SELECTOR));
})();
