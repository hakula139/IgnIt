// Site-wide recent-comments list. Renders Twikoo's getRecentComments() result
// using createElement / textContent for attacker-controlled fields. Only
// item.comment is adopted as HTML — Twikoo's cloud function sanitizes it
// server-side before we ever see it.
(function () {
  const container = document.querySelector('[data-recent-comments]');
  if (!container) return;

  const status = container.querySelector('[data-recent-status]');
  const envId = container.dataset.twikooEnvId;
  const errorText = container.dataset.errorText || 'Failed to load comments.';
  const emptyText = container.dataset.emptyText || 'No comments yet.';
  const featureMath = container.dataset.featureMath === '1';
  const featureMermaid = container.dataset.featureMermaid === '1';

  function setStatus(text) {
    if (!status) return;
    status.textContent = text;
  }

  function renderItem(item) {
    const li = document.createElement('li');
    li.className = 'glass-panel p-4 flex gap-3';

    const meta = document.createElement('a');
    meta.href = item.url || '#';
    meta.className = 'flex flex-col items-center shrink-0 text-sm text-text-secondary';
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
    body.className = 'prose max-w-none flex-1 min-w-0';

    // item.comment is server-sanitized HTML (Twikoo cloud function). Parse to
    // a fragment then adopt — never innerHTML on attacker-controlled strings.
    const parsed = new DOMParser().parseFromString(item.comment || '', 'text/html').body;
    while (parsed.firstChild) body.appendChild(parsed.firstChild);

    li.append(meta, body);
    return li;
  }

  function rerunFeatures() {
    if (featureMermaid && typeof window.kilnRenderMermaid === 'function') {
      container.querySelectorAll('pre code.language-mermaid').forEach(function (code) {
        const pre = code.parentElement;
        const next = document.createElement('pre');
        next.className = 'mermaid';
        next.textContent = code.textContent;
        pre.replaceWith(next);
      });
      window.kilnRenderMermaid(container.querySelectorAll('pre.mermaid'));
    }
    if (featureMath && typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(container);
    }
  }

  function load() {
    if (typeof twikoo === 'undefined' || !envId) {
      setStatus(errorText);
      return;
    }
    twikoo
      .getRecentComments({ envId: envId, pageSize: 30, includeReply: true })
      .then(function (items) {
        if (status) status.remove();
        if (!items || items.length === 0) {
          const empty = document.createElement('li');
          empty.className = 'text-text-secondary';
          empty.textContent = emptyText;
          container.appendChild(empty);
          return;
        }
        items.forEach(function (item) {
          container.appendChild(renderItem(item));
        });
        rerunFeatures();
      })
      .catch(function () {
        setStatus(errorText);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
