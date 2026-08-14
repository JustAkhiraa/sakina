/* SAKINA — Point d'entrée : câblage des modules + PWA */
import {initUI} from './core/ui.js';
import {initRouter,registerPageHook,goPage} from './core/router.js';
import {ensureNavState,renderNavbar,goToStartPage} from './core/nav.js';
import {initTasbih,renderTasbih,buildDhikrBar} from './features/tasbih.js';
import {initSalat,onSalatShow,renderPrayers} from './features/salat.js';
import {initQibla,onQiblaShow} from './features/qibla.js';
import {initDuas} from './features/duas.js';
import {initQuran,onQuranShow} from './features/quran.js';
import {initSettings} from './features/settings.js';
import {S,on} from './core/store.js';
import {initNotifications} from './features/notifications.js';
import {initTools} from './features/tools.js';
import {initOnboarding} from './features/onboarding.js';
import {initPlaces} from './features/places.js';
import {initHalal,stopCamera} from './features/halal.js';
import {initRoutines} from './features/routines.js';
import {initBooks} from './features/books.js';
import {initDevTools} from './core/devtools.js';

initUI();
initRouter();
ensureNavState();
renderNavbar();
initDevTools();
initSettings();   // applique le thème en premier (évite le flash)
initTasbih();
initSalat();
initQibla();
initDuas();
initQuran();
initTools();
initPlaces();
initHalal();
initNotifications();  // reprend les rappels programmés au démarrage

/* Changement de langue : les pages bâties en JS doivent être reconstruites,
   applyI18n ne touchant que les éléments marqués data-i18n. */
on('lang-changed',()=>{
  if(S.lat!==null){renderPrayers();onQiblaShow();}
  renderTasbih();buildDhikrBar();
  renderNavbar();
});
initRoutines();
initBooks();

// Engrenage (page Outils) → Réglages · flèche retour → Outils
document.getElementById('btn-open-settings').addEventListener('click',()=>goPage('page-settings'));
document.getElementById('btn-back-tools').addEventListener('click',()=>goPage('page-tools'));
initOnboarding(); // en dernier : peut afficher l'assistant par-dessus l'app prête

// Coupe la caméra du scanner si l'utilisateur ferme la sheet Vérif' Halal
document.getElementById('overlay').addEventListener('click',stopCamera);
document.addEventListener('click',e=>{if(e.target.closest('[data-close-sheet]'))stopCamera();});

registerPageHook('page-salat',onSalatShow);
registerPageHook('page-qibla',onQiblaShow);
registerPageHook('page-quran',onQuranShow);

// Page d'ouverture personnalisée (après que tous les modules soient prêts)
goToStartPage();



// PWA — enregistré uniquement sur le site publié (https), jamais en dev local
// ni dans une iframe. Échappatoire : ?sw=off désactive et purge le cache.
(function registerSW(){
  if(!('serviceWorker' in navigator))return;
  if(location.protocol!=='https:')return;
  if(window.top!==window.self)return; // pas dans une iframe d'aperçu
  if(location.search.includes('sw=off')){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));
    return;
  }
  navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
