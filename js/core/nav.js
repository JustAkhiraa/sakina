/* SAKINA — Barre de navigation personnalisable.
   Source unique des items de nav : label i18n, icône SVG, id de page.
   L'utilisateur peut réordonner, masquer, et choisir la page de démarrage
   depuis Réglages → Navigation. Le résultat est stocké dans S.nav :
     { order:[pageId,…], hidden:[pageId,…], startPage:pageId }
   Au-delà de MAX_VISIBLE items visibles, les items en trop atterrissent
   dans la sheet « Plus » (#sh-more), accessible via un onglet ⋯. */
import {S,save} from './store.js';
import {goPage} from './router.js';
import {closeSheet,openSheet} from './ui.js';

/* SVG stockés en chaînes pour rester copiables tels quels dans d'autres projets. */
const SVG={
  tasbih:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4l3 3"/></svg>',
  salat:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728l.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707"/><circle cx="12" cy="12" r="4"/></svg>',
  qibla:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>',
  duas:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
  quran:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>',
  tools:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
  library:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h9a2 2 0 012 2v14a2 2 0 00-2-2H6a2 2 0 01-2-2V6z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 4h1a2 2 0 012 2v12a2 2 0 01-2 2"/><path stroke-linecap="round" d="M7 8h6M7 11h6"/></svg>',
  more:'<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
  settings:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>',
};

/* Registre des items de nav. Pour ajouter une catégorie : pousser une entrée ici,
   créer la page correspondante dans index.html, et l'utilisateur pourra la trier. */
export const NAV_ITEMS=[
  {id:'page-tasbih',  label:'Tasbih',    i18n:'nav.tasbih', icon:SVG.tasbih},
  {id:'page-salat',   label:'Salat',     i18n:'nav.salat',  icon:SVG.salat},
  {id:'page-qibla',   label:'Qibla',     i18n:'nav.qibla',  icon:SVG.qibla},
  {id:'page-duas',    label:'Douas',     i18n:'nav.duas',   icon:SVG.duas},
  {id:'page-quran',   label:'Coran',     i18n:'nav.quran',  icon:SVG.quran},
  {id:'page-library', label:'Bibliothèque',i18n:'nav.library',icon:SVG.library},
  {id:'page-tools',   label:'Outils',    i18n:'nav.tools',  icon:SVG.tools},
  // Paramètres : déplaçable mais JAMAIS masquable (locked) — sinon l'utilisateur
  // pourrait se verrouiller hors de la config. La sheet « Plus » l'affiche aussi
  // en secours si elle sort de la barre visible.
  {id:'page-settings',label:'Paramètres',i18n:'nav.settings',icon:SVG.settings,locked:true},
];

export const MAX_VISIBLE=5;

/* Initialise S.nav si absent ou incohérent (nouvel item ajouté au registre). */
export function ensureNavState(){
  if(!S.nav||typeof S.nav!=='object')S.nav={order:[],hidden:[],startPage:'page-tasbih'};
  const ids=NAV_ITEMS.map(n=>n.id);
  const lockedIds=NAV_ITEMS.filter(n=>n.locked).map(n=>n.id);
  // Ajoute les nouveaux items à la fin, retire ceux qui n'existent plus
  S.nav.order=[...S.nav.order.filter(id=>ids.includes(id)),
               ...ids.filter(id=>!S.nav.order.includes(id))];
  // Les items « locked » (Paramètres) ne peuvent JAMAIS être masqués
  S.nav.hidden=(S.nav.hidden||[]).filter(id=>ids.includes(id)&&!lockedIds.includes(id));
  if(!ids.includes(S.nav.startPage)||S.nav.hidden.includes(S.nav.startPage)){
    S.nav.startPage=S.nav.order.find(id=>!S.nav.hidden.includes(id))||ids[0];
  }
  save();
}

/* Renvoie la liste ordonnée des items visibles. */
export function visibleNavItems(){
  return S.nav.order
    .filter(id=>!S.nav.hidden.includes(id))
    .map(id=>NAV_ITEMS.find(n=>n.id===id))
    .filter(Boolean);
}

/* Reconstruit #navbar depuis S.nav. Appelé au boot et à chaque changement. */
export function renderNavbar(){
  const bar=document.getElementById('navbar');
  if(!bar)return;
  const visible=visibleNavItems();
  const shown=visible.slice(0,MAX_VISIBLE);
  const overflow=visible.slice(MAX_VISIBLE);
  const activeId=document.querySelector('.page.active')?.id;
  bar.innerHTML='';
  shown.forEach(it=>{
    const el=document.createElement('div');
    el.className='nv'+(it.id===activeId?' active':'');
    el.dataset.page=it.id;
    el.innerHTML=`${it.icon}<span class="nv-lbl" data-i18n="${it.i18n}">${it.label}</span>`;
    el.addEventListener('click',()=>goPage(it.id));
    bar.appendChild(el);
  });
  // Le bouton « Plus » est TOUJOURS présent : il expose l'overflow ET les
  // entrées incontournables (Paramètres) qui ne doivent jamais devenir
  // inatteignables même si l'utilisateur cache tout le reste.
  const el=document.createElement('div');
  el.className='nv nv-more';
  el.innerHTML=`${SVG.more}<span class="nv-lbl">Plus</span>`;
  el.addEventListener('click',()=>openMoreSheet(overflow,shown));
  bar.appendChild(el);
}

/* Icône engrenage inline pour l'entrée « Paramètres » dans la sheet Plus */
const SVG_SETTINGS='<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>';

function openMoreSheet(items,shown){
  const list=document.getElementById('more-list');
  if(!list)return;
  list.innerHTML='';
  const shownIds=new Set((shown||[]).map(i=>i.id));
  const overflowIds=new Set(items.map(i=>i.id));
  // 1) items d'overflow (catégories masquées ou en trop dans la barre)
  // 2) Paramètres en secours s'il n'est ni visible ni déjà dans l'overflow
  //    → ainsi l'utilisateur peut toujours revenir modifier sa configuration.
  //    Outils n'est PAS forcé ici : il suit les règles normales de la nav.
  const settingsItem=NAV_ITEMS.find(n=>n.id==='page-settings');
  const rows=[...items];
  if(settingsItem&&!shownIds.has('page-settings')&&!overflowIds.has('page-settings'))
    rows.push(settingsItem);
  rows.forEach(it=>{
    const row=document.createElement('div');
    row.className='row';
    row.innerHTML=`<div class="row-ic">${it.icon}</div><div class="row-body"><div class="row-name">${it.label}</div></div><svg class="row-chev" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
    row.addEventListener('click',()=>{closeSheet();goPage(it.id);});
    list.appendChild(row);
  });
  openSheet('sh-more');
}

/* Applique la page de démarrage (à appeler UNE fois au boot, après renderNavbar). */
export function goToStartPage(){
  const target=S.nav.startPage||'page-tasbih';
  if(document.getElementById(target))goPage(target);
}
