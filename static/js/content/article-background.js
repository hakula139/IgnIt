'use strict';

(() => {
  const init = () => {
    const article = document.querySelector('article.glass-panel');
    const image = document.querySelector('.body-bg > img');
    if (!article || !image) {
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context || !('filter' in context)) {
      return;
    }

    const cachedClass = 'article-background-cached';
    let resizeTimer;
    let generation = 0;
    let cachedUrl;

    const render = async () => {
      const currentGeneration = ++generation;
      article.classList.remove(cachedClass);
      if (!window.matchMedia('screen').matches || !image.complete || !image.naturalWidth) {
        return;
      }

      const { width, height } = image.getBoundingClientRect();
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const filter = getComputedStyle(article, '::before').backdropFilter;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Rasterize the whole image so CSS can preserve every object-position value.
      // Convert the blur from viewport pixels to image pixels before CSS scales it.
      context.filter = filter.replace(
        /blur\(([\d.]+)px\)/g,
        (_, radius) => `blur(${radius / scale}px)`,
      );
      context.drawImage(image, 0, 0);

      let nextUrl;
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        if (!blob || currentGeneration !== generation) {
          return;
        }

        nextUrl = URL.createObjectURL(blob);
        const cachedImage = new Image();
        cachedImage.src = nextUrl;
        await cachedImage.decode();
        if (currentGeneration !== generation) {
          return;
        }

        article.style.setProperty('--article-background-image', `url("${nextUrl}")`);
        article.style.setProperty(
          '--article-background-position',
          getComputedStyle(image).objectPosition,
        );
        article.classList.add(cachedClass);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
        }
        cachedUrl = nextUrl;
        nextUrl = null;
      } catch (error) {
        // A cross-origin background can be displayed but cannot be read back from canvas.
        console.warn('Could not cache the article background.', error);
      } finally {
        if (nextUrl) {
          URL.revokeObjectURL(nextUrl);
        }
      }
    };

    image.addEventListener('load', render);
    window.addEventListener('resize', () => {
      generation += 1;
      article.classList.remove(cachedClass);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 150);
    });
    window.addEventListener('afterprint', render);
    render();
  };

  window.__onReady(init);
})();
