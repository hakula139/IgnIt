'use strict';

(() => {
  const ACTIVE_CLASS = 'active';

  const initToc = () => {
    const tocElements = document.querySelectorAll('.toc');
    if (!tocElements.length) {
      return;
    }

    // Build a map from heading ID → TOC link(s).
    const headingIds = [];
    const tocLinks = new Map();
    for (const nav of tocElements) {
      for (const a of nav.querySelectorAll('a[href^="#"]')) {
        const id = decodeURIComponent(a.getAttribute('href').slice(1));
        if (!tocLinks.has(id)) {
          tocLinks.set(id, []);
          headingIds.push(id);
        }
        tocLinks.get(id).push(a);
      }
    }

    if (!headingIds.length) {
      return;
    }

    let activeId = null;

    const setActive = (id) => {
      if (id === activeId) {
        return;
      }

      // Deactivate previous.
      if (activeId && tocLinks.has(activeId)) {
        for (const a of tocLinks.get(activeId)) {
          a.classList.remove(ACTIVE_CLASS);
          // Collapse ancestor sections.
          let li = a.closest('li');
          while (li) {
            li.classList.remove(ACTIVE_CLASS);
            li = li.parentElement?.closest('li');
          }
        }
      }

      activeId = id;

      // Activate current.
      if (id && tocLinks.has(id)) {
        for (const a of tocLinks.get(id)) {
          a.classList.add(ACTIVE_CLASS);
          // Expand ancestor sections.
          let li = a.closest('li');
          while (li) {
            li.classList.add(ACTIVE_CLASS);
            li = li.parentElement?.closest('li');
          }
          ensureLinkVisible(a);
        }
      }
    };

    const ensureLinkVisible = (link) => {
      const scroll = link.closest('.toc-sidebar-scroll');
      if (!scroll) {
        return;
      }
      const cRect = scroll.getBoundingClientRect();
      const lRect = link.getBoundingClientRect();
      if (lRect.top >= cRect.top && lRect.bottom <= cRect.bottom) {
        return;
      }
      const offset = lRect.top - cRect.top - (cRect.height - lRect.height) / 2;
      scroll.scrollTo({ top: scroll.scrollTop + offset, behavior: 'smooth' });
    };

    // Track which headings are visible — pick the topmost one.
    const visibleHeadings = new Set();

    const pickActive = () => {
      // Find the first heading in document order that is visible.
      for (const id of headingIds) {
        if (visibleHeadings.has(id)) {
          setActive(id);
          return;
        }
      }
      // If none visible, keep current active.
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleHeadings.add(entry.target.id);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        }
        pickActive();
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );

    // Observe all headings referenced in the TOC.
    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    }

    // Activate the first heading initially.
    setActive(headingIds[0]);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToc);
  } else {
    initToc();
  }
})();
