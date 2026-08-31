/* SAKINA — Primitives UI : toast, burst, sheets, confirmation, echappement */

/* Rend une valeur inoffensive dans du HTML.

   L'application batit son DOM par gabarits : cent quatre-vingt-trois valeurs
   etaient interpolees dans du innerHTML sans qu'aucune regle ne l'interdise.
   Trois d'entre elles venaient de bases editables par le public — les noms de
   lieux d'OpenStreetMap, les fiches produit d'OpenFoodFacts — et une
   quatrieme d'un fichier de sauvegarde importe.

   Les cinq caracteres sont necessaires, pas quatre : les deux fonctions
   maison qui existaient n'echappaient que & et <, ce qui laisse intacte une
   sortie de contexte d'attribut par un simple guillemet. C'est exactement par
   la que passait l'injection dans halal.js.

   Prefere `textContent` quand c'est possible ; `esc()` est pour les cas ou le
   gabarit doit rester. */
export const esc=v=>String(v??'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* Une URL destinee a un attribut src ou href. Tout ce qui n'est pas
   explicitement http(s) ou une donnee d'image est refuse — `javascript:` et
   `data:text/html` en particulier. */
export const escUrl=v=>{
  const u=String(v??'').trim();
  return /^(https?:\/\/|data:image\/)/i.test(u)?esc(u):'';
};

let _tt;
export function toast(msg){
  const el=document.getElementById('toast');
  clearTimeout(_tt);
  el.textContent=msg;
  el.classList.add('show');
  _tt=setTimeout(()=>el.classList.remove('show'),2200);
}

export function burst(){
  const el=document.createElement('div');
  el.className='bst';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),700);
}

/* ── Sheets ──
   La classe `open` est posée deux frames plus tard, le temps que le
   navigateur ait pris en compte la position de départ : sans ce délai la
   transition de montée ne se joue pas.

   Ce report ouvrait une course. Le rappel `cb` d'une feuille peut en ouvrir
   une autre aussitôt — ouvrir « Mosquées à proximité » sans position
   déclenche le GPS, dont le refus ouvre « Choisir une ville ». La seconde
   feuille retirait bien `open` à la première, mais la frame en attente de
   la première la lui remettait juste après. Résultat : une feuille fantôme,
   visible sans voile derrière elle, que plus rien ne fermait puisque `_sh`
   désignait désormais l'autre.

   D'où le jeton : la frame ne pose `open` que si elle est toujours
   d'actualité. */
let _sh=null;
let _avant=null;      // element qui avait le focus avant l'ouverture
let _seq=0;
export function openSheet(id,cb){
  if(_sh)_sh.classList.remove('open');
  const sh=document.getElementById(id);
  if(!sh)return;
  const ov=document.getElementById('overlay');
  const mine=++_seq;
  // On retient d'ou l'on vient pour y revenir a la fermeture : sans cela le
  // clavier repart du haut de la page a chaque feuille refermee, et un
  // lecteur d'ecran relit tout depuis le debut.
  if(!_sh)_avant=document.activeElement;
  _sh=sh;
  ov.classList.add('open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(_seq===mine&&_sh===sh){
      sh.classList.add('open');
      // La feuille se comporte en boite de dialogue : le focus y entre, sur
      // le premier element utile ou sur la feuille elle-meme.
      //
      // Une image en retard suffit a tout rater : fermee, la feuille est
      // visibility:hidden, et focus() sur un element invisible ne fait rien.
      // On attend donc que la classe ait pris effet.
      requestAnimationFrame(()=>{
        // Un champ de saisie d'abord : ouvrir une feuille de recherche doit
        // poser le curseur dans la recherche. querySelector suit l'ordre du
        // document et non celui du selecteur — sans ce choix explicite, le
        // focus tombait sur la croix de fermeture, qui vient avant.
        const cible=sh.querySelector('input:not([type="hidden"])')
                  ||sh.querySelector('button,[tabindex]:not([tabindex="-1"])');
        if(cible){cible.focus({preventScroll:true});}
        else{sh.tabIndex=-1;sh.focus({preventScroll:true});}
      });
    }
  }));
  if(cb)cb();
}
export function closeSheet(){
  _seq++;                       // annule une ouverture encore en vol
  if(_sh)_sh.classList.remove('open');
  // Filet de sécurité : rien ne doit rester ouvert sans voile derrière.
  document.querySelectorAll('.sheet.open').forEach(s=>s.classList.remove('open'));
  document.getElementById('overlay').classList.remove('open');
  _sh=null;
  // Retour au point de depart, pour que le clavier ne reparte pas du haut.
  if(_avant&&document.contains(_avant)){
    try{_avant.focus({preventScroll:true});}catch{}
  }
  _avant=null;
  // Une feuille peut laisser tourner quelque chose derriere elle — un
  // minuteur, par exemple. On l'annonce plutot que d'aller le chercher ici.
  document.dispatchEvent(new CustomEvent('sheet-closed'));
}
export const sheetOpen=()=>_sh!==null;

/* ── Confirmation non bloquante (remplace window.confirm) ── */
let _cfResolve=null;
export function confirmDlg(msg,{okLabel='Confirmer',accent=false}={}){
  return new Promise(resolve=>{
    _cfResolve=resolve;
    document.getElementById('confirm-msg').textContent=msg;
    const ok=document.getElementById('cf-ok');
    ok.textContent=okLabel;
    ok.classList.toggle('accent',accent);
    document.getElementById('overlay').classList.add('open');
    document.getElementById('confirm-box').classList.add('open');
  });
}
function settleConfirm(val){
  document.getElementById('confirm-box').classList.remove('open');
  if(!_sh)document.getElementById('overlay').classList.remove('open');
  if(_cfResolve){_cfResolve(val);_cfResolve=null;}
}

export function initUI(){
  document.getElementById('overlay').addEventListener('click',()=>{
    if(_cfResolve){settleConfirm(false);return;}
    closeSheet();
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-close-sheet]'))closeSheet();
  });
  document.getElementById('cf-ok').addEventListener('click',()=>settleConfirm(true));
  document.getElementById('cf-cancel').addEventListener('click',()=>settleConfirm(false));
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(_cfResolve){settleConfirm(false);return;}
    closeSheet();
  });
  // Glissement vers le bas pour fermer la sheet active — uniquement depuis
  // la poignée ou l'en-tête (zone fixe non scrollable). Sans cette
  // restriction, tout glissement dans une liste (ex: calendrier) était
  // interprété comme une fermeture, ce qui rendait le scroll inutilisable.
  let y0=0,dragFromHandle=false;
  document.addEventListener('touchstart',e=>{
    y0=e.touches[0].clientY;
    dragFromHandle=!!e.target.closest('.sh-grip,.sh-hd');
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(_sh&&dragFromHandle&&(e.changedTouches[0].clientY-y0)>80)closeSheet();
  },{passive:true});
}
