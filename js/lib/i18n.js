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
import {S,emit} from '../core/store.js';
import {LANGS} from '../data/catalog.js';
import fr from '../i18n/fr.js';
import {AVAILABLE_LANGS,hasLang} from '../i18n/index.js';

const _packs={fr};        // code → dictionnaire chargé
let _cur=fr, _en=null;

/* Charge une langue et la rend active. Sans réseau ni fichier, on retombe
   silencieusement sur le français plutôt que d'afficher des clés brutes. */
export async function loadLang(code){
  // Une langue enregistree puis retiree (ou jamais livree) ne doit pas
  // laisser l'app dans un etat batard : on revient au francais.
  if(!hasLang(code)){_cur=fr;S.lang='fr';return false;}
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

/* t('cle') ou t('cle',{n:12}) — les {marqueurs} du texte sont remplacés.
   Sans cela, tout message contenant une valeur devait être assemblé sur
   place, donc écrit en français en dur : c'est ce qui laissait des toasts
   non traduits partout dans l'app. */
export function t(key,params){
  let s=_cur[key]||(_en&&_en[key])||fr[key]||key;
  if(params)for(const k in params)s=s.split(`{${k}}`).join(params[k]);
  return s;
}

/* Formatage des nombres dans la langue courante. */
export const n=v=>Number(v||0).toLocaleString(S.lang||'fr');

/* t() renvoie la clé quand elle manque : un simple `||` ne peut donc pas
   servir de repli. `tf` répond la traduction si elle existe, sinon le texte
   d'origine — c'est ce qu'il faut pour les données de catalogue, dont le
   français reste la source. */
export function tf(key,fallback){
  const v=t(key);
  return v===key?fallback:v;
}

/* Variante de tf pour les contenus dont le francais est l'original et non
   un repli : les traductions publiees des invocations, par exemple. La
   chaine ordinaire remonte jusqu'a l'anglais, ce qui ferait lire l'anglais
   a un francophone alors que le texte francais est la source. Ici la
   langue courante decide seule ; a defaut, l'anglais ; a defaut, l'original. */
export function tfSrc(key,original){
  if((S.lang||'fr')==='fr')return _cur[key]||original;
  return _cur[key]||(_en&&_en[key])||original;
}

/* Dans quelle langue tfSrc a-t-il repondu ? Renvoie le code de langue.

   Les editions publiees ne couvrent pas toutes les invocations : selon la
   langue, une liste peut melanger le turc, l'anglais et le francais. Le
   melange lui-meme est inevitable — on ne fabrique pas une traduction qui
   n'existe pas —, mais il ne doit pas etre silencieux, sinon le lecteur
   croit a un oubli. L'appelant s'en sert pour marquer discretement les
   lignes qui ne sont pas dans sa langue. */
export function tfSrcLang(key){
  const cur=S.lang||'fr';
  if(cur==='fr')return 'fr';
  if(_cur[key])return cur;
  if(_en&&_en[key])return 'en';
  return 'fr';
}

export {AVAILABLE_LANGS};

export function isRTL(){return !!(LANGS.find(l=>l.code===S.lang)||{}).rtl;}

/* Applique la langue courante à tout élément marqué data-i18n. */
export function applyI18n(){
  document.documentElement.lang=S.lang;
  document.documentElement.dir=isRTL()?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent=t(el.dataset.i18n);
  });
  // Le texte d'un champ de saisie vit dans un attribut, pas dans le noeud :
  // sans cette passe les placeholders resteraient en francais.
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.placeholder=t(el.dataset.i18nPh);
  });
  // Les paragraphes explicatifs portent de l'emphase (<strong>) : textContent
  // l'effacerait, on injecte donc le balisage de la traduction.
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    el.innerHTML=t(el.dataset.i18nHtml);
  });
}

/* Charge puis applique — à utiliser au démarrage et à chaque changement. */
export async function setLang(code){
  S.lang=code;
  await loadLang(code);
  applyI18n();
  // Les sections construites en JS evaluent t() une seule fois : sans ce
  // signal elles gardent la langue qu'elles avaient au moment du rendu.
  // C'est ce qui laissait la page Priere et le Tasbih en francais.
  emit('lang-changed',{lang:code});
}

/* Couverture d'une langue, pour les réglages : sur combien de clés du
   français cette langue est-elle traduite ? */
export function coverage(code){
  const p=_packs[code];
  if(!p)return null;
  const total=Object.keys(fr).length;
  return {done:Object.keys(p).length,total,pct:Math.round(100*Object.keys(p).length/total)};
}
