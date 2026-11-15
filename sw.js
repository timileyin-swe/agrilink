// Network first, the cached copy when offline. A new cache name for each release: the old one is deleted on
// activate, so returning visitors get the new site (v19: light and dark app screenshots, new Step 1 and Step 4).
const cacheName = 'agrilink-site-v19';
// The ?v= on styles and scripts matches index.html, so a new page never runs an old script from a browser cache.
const v = '?v=19';
const core = ['./', './index.html', './base.css' + v, './hero.css' + v, './pitch.css' + v, './hero.js' + v, './pitch.js' + v, './app.js' + v,
  './assets/word.svg', './assets/harvest.jpg', './assets/favicon.svg', './assets/fonts/inter-latin.woff2', './assets/fonts/inter-latin-ext.woff2',
  './assets/happy-farmers-720.webp']; // screenshots and photos are kept as they are viewed (below);
self.addEventListener('install', (event) => event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(core.map((url) => new Request(url, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== cacheName).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin || request.headers.has('range')) return;
  event.respondWith(fetch(request).then((res) => {
    // keep a fresh copy of what was loaded (so lazy images work offline after one visit)
    if (res.ok && res.type === 'basic' && !request.url.endsWith('.mp4')) { const copy = res.clone(); caches.open(cacheName).then((c) => c.put(request, copy)).catch(() => {}); }
    return res;
  }).catch(async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  }));
});
