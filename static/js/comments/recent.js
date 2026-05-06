'use strict';

(() => {
  const PAGE_SIZE = 30;

  const initRecentComments = () => {
    const container = document.querySelector('[data-recent-comments]');
    if (!container) {
      return;
    }

    const status = container.querySelector('[data-recent-status]');
    const envId = container.dataset.twikooEnvId;
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
      li.className = 'glass-panel flex gap-3 p-4';

      const meta = document.createElement('a');
      meta.href = item.url || '#';
      meta.className = 'flex shrink-0 flex-col items-center text-sm text-text-secondary';
      meta.rel = 'noopener noreferrer';

      const avatar = document.createElement('img');
      avatar.src = item.avatar || '';
      avatar.alt = '';
      avatar.loading = 'lazy';
      avatar.className = 'h-10 w-10 rounded-full';

      const nick = document.createElement('strong');
      nick.className = 'mt-1 text-text';
      nick.textContent = item.nick || '';

      const time = document.createElement('time');
      time.className = 'text-xs';
      time.textContent = item.relativeTime || '';

      meta.append(avatar, nick, time);

      const body = document.createElement('div');
      body.className = 'prose min-w-0 max-w-none flex-1';

      // item.comment is server-sanitized HTML from Twikoo's cloud function.
      const parsed = new DOMParser().parseFromString(item.comment || '', 'text/html').body;
      while (parsed.firstChild) {
        body.appendChild(parsed.firstChild);
      }

      li.append(meta, body);
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
      if (typeof twikoo === 'undefined' || !envId) {
        setStatus(errorText);
        return;
      }

      twikoo
        .getRecentComments({ envId, pageSize: PAGE_SIZE, includeReply: true })
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
