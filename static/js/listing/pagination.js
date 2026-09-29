'use strict';

(() => {
  const initPagination = () => {
    for (const pagination of document.querySelectorAll('.pagination')) {
      const base = pagination.dataset.baseUrl;

      for (const button of pagination.querySelectorAll('.pagination-jump')) {
        const input = button.nextElementSibling;

        const hideInput = (restoreFocus = false) => {
          input.hidden = true;
          button.hidden = false;
          if (restoreFocus) {
            button.focus();
          }
        };

        button.addEventListener('click', () => {
          button.hidden = true;
          input.hidden = false;
          input.focus();
          input.select();
        });

        input.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            hideInput(true);
          } else if (event.key === 'Enter') {
            const number = Number(input.value);
            if (Number.isInteger(number) && input.checkValidity()) {
              location.href = number === 1 ? `${base}/` : `${base}/page/${number}/`;
            } else {
              input.reportValidity();
            }
          }
        });

        input.addEventListener('blur', () => hideInput());
      }
    }
  };

  window.__onReady(initPagination);
})();
