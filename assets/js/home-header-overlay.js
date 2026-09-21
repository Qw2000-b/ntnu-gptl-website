// Keep the existing homepage header out of flow at every scroll position.
(() => {
  const header = document.querySelector('.gptl-home-header');
  if (!header) return;
  const sync = () => header.classList.toggle('is-scrolled', window.scrollY > 0);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('pageshow', sync);
})();
