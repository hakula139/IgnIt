'use strict';

// Run `cb` when the DOM is ready. If parsing already finished (e.g., the
// caller is a `defer` script that loaded after DOMContentLoaded), invoke `cb`
// synchronously so the helper stays idempotent across script timings.
window.__onReady = (cb) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  } else {
    cb();
  }
};
