// Offline after one visit (see sw.js). A new site version takes over at once (skipWaiting) on the next load.
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
