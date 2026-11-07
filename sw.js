// PALATE production: network-first navigation with offline fallback.
// Sandbox has its own more-specific service worker and cache.
const CACHE="palate-production-shell-v1";
self.addEventListener("install",event=>{self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith("palate-production-shell-")&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})());});
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.mode!=="navigate"||url.origin!==self.location.origin||url.pathname.includes("/sandbox/"))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request,{cache:"no-store"});
      if(response.ok){const cache=await caches.open(CACHE);await cache.put("./index.html",response.clone());}
      return response;
    }catch(error){
      const cache=await caches.open(CACHE);
      return await cache.match("./index.html")||Response.error();
    }
  })());
});
