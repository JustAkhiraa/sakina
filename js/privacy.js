/* SAKINA — Politique de confidentialité : traduction et sélecteur de langue.

   Cette page vit hors de l'application : elle s'ouvre dans un onglet à part
   depuis les Réglages. Elle etait donc restee en francais dans les dix-huit
   langues — un lecteur japonais ne pouvait pas lire ce qu'il acceptait.

   Elle reutilise le meme dictionnaire que l'application plutot que d'avoir
   le sien : `setLang` charge le fichier de langue, `applyI18n` renseigne
   tout ce qui porte data-i18n. Rien de neuf a maintenir.

   La langue vient d'abord de celle deja choisie dans l'application (meme
   origine, donc meme localStorage), ensuite de celle du navigateur, enfin
   du francais. Le selecteur permet de la changer sans revenir a l'app. */
import {S} from './core/store.js';
import {LANGS} from './data/catalog.js';
import {setLang, isRTL, t} from './lib/i18n.js';
import {AVAILABLE_LANGS} from './i18n/index.js';

const $=id=>document.getElementById(id);

/* Langue d'ouverture. S.lang vient du store, deja relu depuis localStorage ;
   s'il est absent — page ouverte directement, sans avoir lance l'app — on
   tente celle du navigateur avant de retomber sur le francais. */
function langueInitiale(){
  if(S.lang&&AVAILABLE_LANGS.includes(S.lang))return S.lang;
  for(const p of navigator.languages||[]){
    const c=p.slice(0,2).toLowerCase();
    if(AVAILABLE_LANGS.includes(c))return c;
  }
  return 'fr';
}

function construireSelecteur(courante){
  const sel=$('lang-pick');
  sel.innerHTML='';
  for(const l of LANGS){
    if(!AVAILABLE_LANGS.includes(l.code))continue;
    const o=document.createElement('option');
    o.value=l.code;
    o.textContent=`${l.flag} ${l.name}`;
    if(l.code===courante)o.selected=true;
    sel.appendChild(o);
  }
  sel.addEventListener('change',()=>appliquer(sel.value,true));
}

async function appliquer(code,memoriser){
  await setLang(code);
  if(memoriser)S.lang=code;          // le store persiste tout seul
  document.documentElement.lang=code;
  document.documentElement.dir=isRTL()?'rtl':'ltr';
  // Le titre de l'onglet n'est pas dans le DOM visible : applyI18n ne le
  // voit pas, il faut le poser a la main.
  document.title=t('priv.title');
  $('lang-pick').value=code;
  // Le bouton nomme la langue courante — « 🌐 Français », « 🌐 日本語 » —
  // plutot que le mot « Langue » : on voit d'un coup d'oeil ce qui est
  // choisi. L'etiquette du lecteur d'ecran, elle, reste « Langue » et suit
  // la traduction (data-i18n-aria sur le select).
  const l=LANGS.find(x=>x.code===code);
  if(l)$('lang-name').textContent=l.name;
}

const depart=langueInitiale();
construireSelecteur(depart);
appliquer(depart,false);
