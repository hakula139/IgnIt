'use strict';

(() => {
  const COPIED_DURATION = 2000;

  const createIcon = (classes) => {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
  };

  const handleCopy = async (btn) => {
    const codeBlock = btn.closest('.code-block');
    if (!codeBlock) return;

    const codeEl = codeBlock.querySelector('.code pre code');
    if (!codeEl) return;

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
    for (const block of document.querySelectorAll('.code-block')) {
      const header = block.querySelector('.code-header');
      if (!header) continue;

      // Inject chevron before the language label
      header.prepend(createIcon('fas fa-chevron-down chevron'));

      // Replace copy button text with icon
      const copyBtn = header.querySelector('.copy-btn');
      if (copyBtn) copyBtn.replaceChildren(createIcon('far fa-copy'));

      // Toggle collapse on header click (skip if clicking copy button)
      header.addEventListener('click', (e) => {
        if (e.target.closest('.copy-btn')) return;
        block.classList.toggle('collapsed');
      });
    }
  };

  // Delegated copy handler (works for dynamically added blocks too)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (btn) handleCopy(btn);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
  } else {
    initCodeBlocks();
  }
})();
