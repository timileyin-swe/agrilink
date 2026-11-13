const cacheName='agrilink-demo-v16';
const core=['./','./index.html','./base.css','./pitch.css','./pitch.js','./assets/field.jpg','./assets/farmer-portrait.jpg','./assets/tomatoes.jpg','./assets/market.jpg','./hero.css','./flows.css','./hero.js','./flows.js','./app.js','./assets/word.svg','./assets/harvest.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(core)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==location.origin||request.headers.has('range'))return;
  event.respondWith(fetch(request).catch(async()=>{
    const cached=await (await caches.open(cacheName)).match(request);
    if(cached)return cached;
    if(request.mode==='navigate')return await (await caches.open(cacheName)).match('./index.html');
    return Response.error();
  }));
});















