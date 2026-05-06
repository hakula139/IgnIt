'use strict';

(() => {
  const PAGE_SIZE = 30;

  const initRecentComments = () => {
    const container = document.querySelector('[data-recent-comments]');
    if (!container) {
      return;
    }

    const status = container.querySelector('[data-recent-status]');
    const apiUrl = container.dataset.twikooApiUrl;
    const errorText = container.dataset.errorText || 'Failed to load comments.';
    const emptyText = container.dataset.emptyText || 'No comments yet.';

    const setStatus = (text) => {
      if (status) {
        status.textContent = text;
      }
    };

    // ── Rendering ──

    const renderItem = (item) => {
      const li = document.createElement('li');
      li.className = 'flex gap-3 border-b border-border/30 py-3 last:border-b-0';

      const avatarLink = document.createElement('a');
      avatarLink.href = item.url || '#';
      avatarLink.className = 'shrink-0';

      const avatar = document.createElement('img');
      avatar.src = item.avatar || '';
      avatar.alt = '';
      avatar.loading = 'lazy';
      avatar.className = 'h-10 w-10 rounded-full';
      avatarLink.appendChild(avatar);

      const main = document.createElement('div');
      main.className = 'min-w-0 flex-1';

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-baseline gap-x-2 text-sm';

      const nickLink = document.createElement('a');
      nickLink.href = item.url || '#';
      nickLink.className = 'font-semibold text-text no-underline hover:text-link';
      nickLink.textContent = item.nick || '';

      const time = document.createElement('time');
      time.className = 'text-xs text-text-secondary';
      time.textContent = item.relativeTime || '';

      header.append(nickLink, time);

      const body = document.createElement('div');
      body.className = 'prose mt-1 line-clamp-3 max-w-none text-sm';

      // item.comment is server-sanitized HTML from Twikoo's cloud function.
      const parsed = new DOMParser().parseFromString(item.comment || '', 'text/html').body;
      while (parsed.firstChild) {
        body.appendChild(parsed.firstChild);
      }

      main.append(header, body);
      li.append(avatarLink, main);
      return li;
    };

    const renderEmpty = () => {
      const li = document.createElement('li');
      li.className = 'text-text-secondary';
      li.textContent = emptyText;
      container.appendChild(li);
    };

    // ── Load ──

    const load = () => {
      if (typeof twikoo === 'undefined' || !apiUrl) {
        setStatus(errorText);
        return;
      }

      twikoo
        .getRecentComments({ envId: apiUrl, pageSize: PAGE_SIZE, includeReply: true })
        .then((items) => {
          if (status) {
            status.remove();
          }
          if (!items || items.length === 0) {
            renderEmpty();
            return;
          }
          for (const item of items) {
            container.appendChild(renderItem(item));
          }
          if (typeof window.renderMathInElement === 'function') {
            window.renderMathInElement(container);
          }
        })
        .catch(() => setStatus(errorText));
    };

    load();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecentComments);
  } else {
    initRecentComments();
  }
})();
