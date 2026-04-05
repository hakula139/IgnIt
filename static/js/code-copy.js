'use strict';

(() => {
  const COPIED_TEXT = 'Copied!';
  const COPIED_DURATION = 2000;

  const handleCopy = async (btn) => {
    const codeBlock = btn.closest('.code-block');
    if (!codeBlock) return;

    const codeEl = codeBlock.querySelector('.code pre code');
    if (!codeEl) return;

    const text = codeEl.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    const original = btn.textContent;
    btn.textContent = COPIED_TEXT;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, COPIED_DURATION);
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (btn) handleCopy(btn);
  });
})();
