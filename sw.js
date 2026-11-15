// Offline copy of the site. Network first, the saved copy when offline. Version 20: after the first visit the
// whole site (both light and dark screenshots, photos, fonts, icons) is saved quietly in the background, so it
// opens complete offline. Each version has its own cache; old ones are deleted when this one takes over.
// All paths are relative, so this works at the github.io sub-folder (/agrilink/) too. The films (.mp4) are
// never saved.
const cacheName = 'agrilink-site-v20';
// The ?v= on styles and scripts matches index.html, so a new page never runs an old script from a browser cache.
const v = '?v=20';
// What the first view needs: saved while the worker installs.
const core = ['./', './index.html', './base.css' + v, './hero.css' + v, './pitch.css' + v, './hero.js' + v, './pitch.js' + v, './app.js' + v,
  './assets/word.svg', './assets/harvest.jpg', './assets/favicon.svg', './assets/fonts/inter-latin.woff2', './assets/fonts/inter-latin-ext.woff2'];
// Everything else: saved after the page has loaded (the page asks, see app.js), one file at a time.
const rest = ['./assets/happy-farmers-720.webp', './assets/happy-farmers.webp', './assets/happy-farmers.jpg', './assets/tomato.webp', './assets/pepper.webp',
  './assets/apple-touch-icon.png', './assets/og-image.jpg',
  ...['sell', 'deals', 'driver', 'cold', 'plant'].flatMap((n) => [`./assets/app/screen-${n}-light.webp`, `./assets/app/screen-${n}-dark.webp`])];

const fresh = (url) => new Request(url, { cache: 'reload' });
self.addEventListener('install', (event) => event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(core.map(fresh))).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('agrilink-') && k !== cacheName).map((k) => caches.delete(k)))).then(() => self.clients.claim())));

async function saveRest() {
  const cache = await caches.open(cacheName);
  for (const url of rest) {
    if (await cache.match(url)) continue; // already saved (for example, seen on the page)
    try { const res = await fetch(fresh(url)); if (res.ok) await cache.put(url, res); } catch { /* offline now: try again next visit */ }
  }
}
self.addEventListener('message', (event) => { if (event.data === 'save-rest') event.waitUntil(saveRest()); });

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin || request.headers.has('range')) return;
  event.respondWith(fetch(request).then((res) => {
    // keep a fresh copy of what was loaded
    if (res.ok && res.type === 'basic' && !request.url.endsWith('.mp4')) { const copy = res.clone(); caches.open(cacheName).then((c) => c.put(request, copy)).catch(() => {}); }
    return res;
  }).catch(async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
    return Response.error();
  }));
});
