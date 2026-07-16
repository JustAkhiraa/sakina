/* SAKINA — Point d'entrée : câblage des modules + PWA */
import {initUI} from './core/ui.js';
import {initRouter,registerPageHook} from './core/router.js';
import {initTasbih} from './features/tasbih.js';
import {initSalat,onSalatShow} from './features/salat.js';
import {initQibla,onQiblaShow} from './features/qibla.js';
import {initDuas} from './features/duas.js';
import {initQuran,onQuranShow} from './features/quran.js';
import {initSettings} from './features/settings.js';
import {initTools} from './features/tools.js';
import {initOnboarding} from './features/onboarding.js';
import {initPlaces} from './features/places.js';
import {initHalal,stopCamera} from './features/halal.js';
import {initRoutines} from './features/routines.js';

initUI();
initRouter();
initSettings();   // applique le thème en premier (évite le flash)
initTasbih();
initSalat();
initQibla();
initDuas();
initQuran();
initTools();
initPlaces();
initHalal();
initRoutines();
initOnboarding(); // en dernier : peut afficher l'assistant par-dessus l'app prête

// Coupe la caméra du scanner si l'utilisateur ferme la sheet Vérif' Halal
document.getElementById('overlay').addEventListener('click',stopCamera);
document.addEventListener('click',e=>{if(e.target.closest('[data-close-sheet]'))stopCamera();});

registerPageHook('page-salat',onSalatShow);
registerPageHook('page-qibla',onQiblaShow);
registerPageHook('page-quran',onQuranShow);

// PWA — hors localhost/file pour ne pas gêner le développement
if('serviceWorker' in navigator&&location.protocol==='https:'){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
