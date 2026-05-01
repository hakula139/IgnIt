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

    const collectChain = (id) => {
      const chain = [];
      if (!id || !tocLinks.has(id)) {
        return chain;
      }
      for (const a of tocLinks.get(id)) {
        let li = a.closest('li');
        while (li) {
          chain.push(li);
          li = li.parentElement?.closest('li');
        }
      }
      return chain;
    };

    const setActive = (id) => {
      if (id === activeId) {
        return;
      }

      // Diff against the previous chain so we only flip .active on the
      // divergent prefix — consecutive headings usually share most ancestors.
      const oldChain = collectChain(activeId);
      const newChain = collectChain(id);
      const oldSet = new Set(oldChain);
      const newSet = new Set(newChain);

      for (const li of oldChain) {
        if (!newSet.has(li)) {
          li.classList.remove(ACTIVE_CLASS);
        }
      }
      if (activeId && tocLinks.has(activeId)) {
        for (const a of tocLinks.get(activeId)) {
          a.classList.remove(ACTIVE_CLASS);
        }
      }

      activeId = id;

      if (id && tocLinks.has(id)) {
        for (const a of tocLinks.get(id)) {
          a.classList.add(ACTIVE_CLASS);
        }
      }
      for (const li of newChain) {
        if (!oldSet.has(li)) {
          li.classList.add(ACTIVE_CLASS);
        }
      }

      // Defer the rect read so it doesn't force a sync layout flush inside
      // the IO callback that just dirtied styles.
      if (id && tocLinks.has(id)) {
        const links = tocLinks.get(id);
        requestAnimationFrame(() => {
          if (activeId !== id) {
            return;
          }
          for (const a of links) {
            ensureLinkVisible(a);
          }
        });
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
