'use strict';

(() => {
  const PAGE_SIZE = 8;

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

    // Twikoo's recent feed gives a page URL; the comment ID becomes the in-page anchor.
    const jumpUrl = (item) => {
      if (item.href) {
        return item.href;
      }
      const url = item.url || '';
      if (url && item._id) {
        return `${url}#${item._id}`;
      }
      return url || '#';
    };

    const renderItem = (item) => {
      const root = document.createElement('div');
      root.className = 'tk-comment';

      const target = jumpUrl(item);

      const avatarLink = document.createElement('a');
      avatarLink.href = target;
      avatarLink.className = 'tk-avatar';

      const avatar = document.createElement('img');
      avatar.src = item.avatar || '';
      avatar.alt = '';
      avatar.loading = 'lazy';
      avatar.className = 'tk-avatar-img';
      avatarLink.appendChild(avatar);

      const main = document.createElement('div');
      main.className = 'tk-main';

      const meta = document.createElement('div');
      meta.className = 'tk-meta';

      const nickLink = document.createElement('a');
      nickLink.href = target;
      nickLink.className = 'tk-nick';
      nickLink.textContent = item.nick || '';

      const time = document.createElement('span');
      time.className = 'tk-time';
      time.textContent = item.relativeTime || '';

      meta.append(nickLink, time);
      main.appendChild(meta);

      // item.comment is server-sanitized HTML from Twikoo's cloud function.
      const snippet = document.createElement('div');
      snippet.className = 'tk-snippet';
      const parsed = new DOMParser().parseFromString(item.comment || '', 'text/html').body;
      while (parsed.firstChild) {
        snippet.appendChild(parsed.firstChild);
      }
      main.appendChild(snippet);

      // Inner anchors keep their native click semantics (Cmd / middle click).
      root.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
          return;
        }
        if (target !== '#') {
          window.location.assign(target);
        }
      });

      root.append(avatarLink, main);
      return root;
    };

    const renderEmpty = () => {
      const div = document.createElement('div');
      div.className = 'tk-empty';
      div.textContent = emptyText;
      container.appendChild(div);
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
