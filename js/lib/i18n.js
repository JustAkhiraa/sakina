/* SAKINA — Internationalisation de l'interface.

   Un fichier par langue dans js/i18n/ : ajouter une langue revient à
   déposer un fichier et à l'inscrire dans LANGS (data/catalog.js). Seul
   le français est embarqué d'office — il sert de socle de repli et évite
   qu'un écran reste vide si un fichier manque. Les autres langues sont
   chargées à la demande, puis gardées en mémoire.

   Chaîne de repli : langue courante → anglais → français → la clé elle-même.
   Une langue incomplète reste donc lisible.

   Le contenu religieux (livres, invocations, traductions du Coran) n'est
   pas concerné : il possède ses propres fichiers de contenu. */
import {S} from '../core/store.js';
import {LANGS} from '../data/catalog.js';
import fr from '../i18n/fr.js';

const _packs={fr};        // code → dictionnaire chargé
let _cur=fr, _en=null;

/* Charge une langue et la rend active. Sans réseau ni fichier, on retombe
   silencieusement sur le français plutôt que d'afficher des clés brutes. */
export async function loadLang(code){
  if(!_packs[code]){
    try{_packs[code]=(await import(`../i18n/${code}.js`)).default;}
    catch{_packs[code]=null;}
  }
  _cur=_packs[code]||fr;
  if(code!=='en'&&!_en){
    try{_en=(await import('../i18n/en.js')).default;}catch{_en=null;}
  }
  return _cur!==fr||code==='fr';
}

export function t(key){
  return _cur[key]||(_en&&_en[key])||fr[key]||key;
}

export function isRTL(){return !!(LANGS.find(l=>l.code===S.lang)||{}).rtl;}

/* Applique la langue courante à tout élément marqué data-i18n. */
export function applyI18n(){
  document.documentElement.lang=S.lang;
  document.documentElement.dir=isRTL()?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent=t(el.dataset.i18n);
  });
}

/* Charge puis applique — à utiliser au démarrage et à chaque changement. */
export async function setLang(code){
  S.lang=code;
  await loadLang(code);
  applyI18n();
}

/* Couverture d'une langue, pour les réglages : sur combien de clés du
   français cette langue est-elle traduite ? */
export function coverage(code){
  const p=_packs[code];
  if(!p)return null;
  const total=Object.keys(fr).length;
  return {done:Object.keys(p).length,total,pct:Math.round(100*Object.keys(p).length/total)};
}
