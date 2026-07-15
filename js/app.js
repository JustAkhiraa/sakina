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

initUI();
initRouter();
initSettings();   // applique le thème en premier (évite le flash)
initTasbih();
initSalat();
initQibla();
initDuas();
initQuran();
initTools();

registerPageHook('page-salat',onSalatShow);
registerPageHook('page-qibla',onQiblaShow);
registerPageHook('page-quran',onQuranShow);

// PWA — hors localhost/file pour ne pas gêner le développement
if('serviceWorker' in navigator&&location.protocol==='https:'){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
