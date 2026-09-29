/* Isolate production visits from historical previews without deleting either. */
(() => {
  const config = document.currentScript?.dataset;
  if (!config || location.origin !== config.productionOrigin || !config.pathPrefix) return;
  window.goatcounter = {
    // Strip query/hash information; retain distinct Chinese and English paths.
    path: () => config.pathPrefix + location.pathname
  };
  const tracker = document.createElement('script');
  tracker.dataset.goatcounter = 'https://ntnu-gptl.goatcounter.com/count';
  tracker.async = true;
  tracker.src = 'https://gc.zgo.at/count.js';
  document.head.append(tracker);
})();
