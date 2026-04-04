'use strict';

(() => {
  const pagination = document.querySelector('.pagination');
  if (!pagination) {
    return;
  }

  const base = pagination.dataset.baseUrl;

  const showInput = (li) => {
    li.querySelector('.pagination-jump').style.display = 'none';
    const input = li.querySelector('.pagination-input');
    input.style.display = '';
    input.focus();
  };

  const hideInput = (li) => {
    li.querySelector('.pagination-jump').style.display = '';
    li.querySelector('.pagination-input').style.display = 'none';
  };

  for (const el of document.querySelectorAll('.pagination-jump')) {
    el.addEventListener('click', () => showInput(el.closest('li')));
  }

  for (const input of document.querySelectorAll('.pagination-input')) {
    const go = () => {
      const n = parseInt(input.value, 10);
      if (n >= 1 && n <= parseInt(input.max, 10)) {
        location.href = n === 1 ? `${base}/` : `${base}/page/${n}/`;
      }
      hideInput(input.closest('li'));
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        go();
      } else if (e.key === 'Escape') {
        hideInput(input.closest('li'));
      }
    });

    input.addEventListener('blur', () => hideInput(input.closest('li')));
  }
})();
