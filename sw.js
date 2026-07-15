/* SAKINA — Service worker : app shell en cache-first, APIs en réseau avec repli cache */
const VERSION='sakina-v4';
const SHELL=[
  './',
  './index.html',
  './privacy-policy.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './css/tokens.css','./css/base.css','./css/pages.css',
  './js/app.js',
  './js/core/store.js','./js/core/ui.js','./js/core/audio.js','./js/core/router.js',
  './js/lib/astro.js','./js/lib/hijri.js','./js/lib/i18n.js',
  './js/data/catalog.js','./js/data/duas.js','./js/data/surahs.js','./js/data/additives.js',
  './js/features/tasbih.js','./js/features/salat.js','./js/features/qibla.js',
  './js/features/duas.js','./js/features/quran.js','./js/features/settings.js','./js/features/tools.js',
  './js/features/onboarding.js','./js/features/places.js','./js/features/halal.js',
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET')return;

  // Coran & géocodage : réseau d'abord, cache en secours (lecture hors-ligne)
  if(url.hostname==='api.quran.com'){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(VERSION+'-api').then(c=>c.put(e.request,copy));
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  // Polices Google : cache-first
  if(url.hostname.includes('fonts.g')){
    e.respondWith(
      caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(VERSION+'-fonts').then(c=>c.put(e.request,copy));
        return res;
      }))
    );
    return;
  }

  // App shell : cache-first
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));
  }
});
