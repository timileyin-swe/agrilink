// Offline after one visit (see sw.js). A new site version takes over at once (skipWaiting) on the next load.
// A few seconds after the page has loaded, the worker is asked to save the rest of the site (both themes'
// screenshots and the photos) quietly, so it never competes with the first view.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
  const askToSave = () => navigator.serviceWorker.ready.then((reg) => reg.active && reg.active.postMessage('save-rest')).catch(() => {});
  const later = () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(askToSave, { timeout: 4000 }) : askToSave()), 3000);
  if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
}
