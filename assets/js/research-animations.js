// SVG documents isolate animation styles and IDs from the website and one another.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-direction-animation]').forEach((container) => {
    const frame = container.querySelector('iframe');
    const button = container.querySelector('button');
    let paused = reducedMotion.matches;
    let visible = !('IntersectionObserver' in window);

    const update = () => {
      const root = frame.contentDocument?.documentElement;
      if (!root || !root.querySelector('svg')) return;
      root.classList.toggle('is-paused', paused || !visible);
      root.classList.toggle('motion-enabled', !paused);
      const label = paused ? button.dataset.play : button.dataset.pause;
      button.dataset.paused = String(paused);
      button.setAttribute('aria-label', label);
      button.title = label;
      button.hidden = false;
    };

    frame.addEventListener('load', update);
    button.addEventListener('click', () => {
      paused = !paused;
      update();
    });
    reducedMotion.addEventListener('change', (event) => {
      paused = event.matches;
      update();
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      });
      observer.observe(frame);
    }
    update();
  });
})();
