'use strict';

(() => {
  const pagination = document.querySelector('.pagination');
  if (!pagination) {
    return;
  }

  const base = pagination.dataset.baseUrl;

  for (const el of document.querySelectorAll('.pagination-jump')) {
    el.addEventListener('click', () => {
      const li = el.closest('li');
      li.classList.add('editing');
      li.querySelector('.pagination-input').focus();
    });
  }

  for (const input of document.querySelectorAll('.pagination-input')) {
    const go = () => {
      const n = parseInt(input.value, 10);
      if (n >= 1 && n <= parseInt(input.max, 10)) {
        location.href = n === 1 ? `${base}/` : `${base}/page/${n}/`;
      }
      input.closest('li').classList.remove('editing');
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        go();
      } else if (e.key === 'Escape') {
        input.closest('li').classList.remove('editing');
      }
    });

    input.addEventListener('blur', () => {
      input.closest('li').classList.remove('editing');
    });
  }
})();
