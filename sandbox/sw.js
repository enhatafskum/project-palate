// Only controls /project-palate/sandbox/ pages. Network first; offline fallback.
const CACHE="palate-sandbox-shell-v1";
self.addEventListener("install",event=>{self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith("palate-sandbox-shell-")&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})());});
self.addEventListener("fetch",event=>{
  if(event.request.mode!=="navigate"||new URL(event.request.url).origin!==self.location.origin)return;
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
