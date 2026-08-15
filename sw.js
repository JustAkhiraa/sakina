/* SAKINA — Service worker : app shell en cache-first, APIs en réseau avec repli cache */
const VERSION='sakina-v79';
const SHELL=[
  './',
  './index.html',
  './privacy-policy.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './css/tokens.css','./css/base.css','./css/pages.css',
  './js/app.js',
  './js/core/store.js','./js/core/ui.js','./js/core/audio.js','./js/core/router.js',
  './js/core/nav.js','./js/core/rewards.js','./js/core/devtools.js',
  './js/lib/astro.js','./js/lib/hijri.js','./js/lib/i18n.js','./js/lib/blobstore.js',
  './js/data/catalog.js','./js/data/duas.js','./js/data/surahs.js','./js/data/surah-names.js','./js/data/additives.js',
  './js/data/routines.js','./js/data/halal-certifs.js','./js/data/translations.js',
  './js/features/tasbih.js','./js/features/salat.js','./js/features/qibla.js',
  './js/features/duas.js','./js/features/quran.js','./js/features/settings.js','./js/features/tools.js',
  './js/features/notifications.js','./js/features/onboarding.js','./js/features/places.js','./js/features/halal.js','./js/features/routines.js','./js/features/books.js','./js/features/search.js','./js/features/adhan.js',
  // Dictionnaires de langue (importes dynamiquement par lib/i18n.js)
  './js/i18n/index.js',
  './js/i18n/fr.js','./js/i18n/en.js','./js/i18n/es.js','./js/i18n/ru.js','./js/i18n/bs.js',
  './js/i18n/ar.js','./js/i18n/tr.js','./js/i18n/fa.js',
  './js/i18n/ur.js','./js/i18n/hi.js','./js/i18n/bn.js','./js/i18n/id.js','./js/i18n/ms.js','./js/i18n/zh.js','./js/i18n/ja.js',
  './js/i18n/so.js','./js/i18n/sw.js','./js/i18n/ha.js',
];

/* Corpus coranique embarqué (~2,3 Mo). Mis en cache à part du shell : s'il
   échoue, l'application s'installe quand même et le lecteur retombera sur
   l'API. */
const CORPUS=['./data/quran-ar.json','./data/quran-fr.json'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(VERSION)
      .then(c=>c.addAll(SHELL).then(()=>c.addAll(CORPUS).catch(()=>{})))
      .then(()=>self.skipWaiting())
  );
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

  // Corpus coraniques : cache d'abord. Une langue téléchargée une fois depuis
  // les réglages reste ensuite disponible hors connexion.
  if(url.origin===location.origin&&url.pathname.includes('/data/quran-')){
    e.respondWith(
      caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(VERSION).then(c=>c.put(e.request,copy));
        return res;
      }))
    );
    return;
  }

  // Adhân : cache d'abord, mais jamais précaché. Un appel pèse plusieurs
  // mégaoctets ; le mettre dans SHELL rendrait la première installation
  // longue pour une fonction que tout le monde n'active pas. Il se met en
  // cache tout seul à la première écoute, et reste disponible hors ligne.
  if(url.origin===location.origin&&url.pathname.includes('/assets/adhan/')){
    e.respondWith(
      caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
        if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(e.request,copy));}
        return res;
      }))
    );
    return;
  }

  // Navigations vers '/' (ou toute page HTML non trouvée) → app shell hors-ligne
  if(e.request.mode==='navigate'&&url.origin===location.origin){
    e.respondWith(
      fetch(e.request).catch(()=>caches.match('./index.html'))
    );
    return;
  }

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

  // App shell + fichiers locaux (livres…) : cache-first, mise en cache au vol
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(VERSION+'-rt').then(c=>c.put(e.request,copy));}
      return res;
    })));
  }
});
