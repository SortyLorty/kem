// Kem offline: salva la scheda alla prima apertura, poi funziona senza rete.
// Quando aggiorni index.html, cambia il numero di versione qui sotto.
const CACHE='kem-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // pagina: prima la rete (per gli aggiornamenti), poi la copia salvata
    if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));return}
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));return;
  }
  // font di Google: salvati al primo uso
  if(url.hostname.endsWith('googleapis.com')||url.hostname.endsWith('gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(r=>r||fetch(req).then(n=>{c.put(req,n.clone());return n}))));
  }
});
