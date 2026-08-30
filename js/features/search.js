/* SAKINA — Recherche globale.

   L'application compte sept pages, une vingtaine de feuilles, 114 sourates,
   des dizaines d'invocations et près de trois cents additifs. Retrouver une
   chose précise en naviguant devient plus long que de la chercher : c'est ce
   que corrige ce module.

   Tout est indexé en mémoire, hors ligne, sans réseau. L'index est bâti à la
   première ouverture seulement — le construire au démarrage retarderait le
   premier affichage pour une fonction dont on ne se sert pas toujours. */
import {S} from '../core/store.js';
import {openSheet,closeSheet} from '../core/ui.js';
import {vib} from '../core/audio.js';
import {goPage} from '../core/router.js';
import {t} from '../lib/i18n.js';
import fr from '../i18n/fr.js';
import {SURAHS} from '../data/surahs.js';
import {DUAS} from '../data/duas.js';
import {ROUTINES} from '../data/routines.js';
import {ADDITIVES,ADD_STATUS} from '../data/additives.js';
import {showSurah,surahName} from './quran.js';
import {openDuaSearch,duaTitle,duaOcc,duaCat} from './duas.js';
import {openRoutine} from './routines.js';
import {openHalal,addName,addNote} from './halal.js';
import {showBook} from './books.js';

const $=id=>document.getElementById(id);

/* Sans repli des diacritiques, « Fatiha » ne trouve pas « Al-Fâtiha » et
   « qada » ne trouve pas « Qadâ' ». On retire aussi les apostrophes et les
   traits d'union : personne ne les tape en cherchant. */
const fold=s=>(s||'')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g,'')
  .replace(/['’\-_]/g,' ')
  .replace(/\s+/g,' ')
  .trim();

/* ── Destinations : pages, outils et feuilles de réglages ──
   Elles n'existent dans aucun tableau de données : on les décrit ici, avec
   la clé i18n qui leur sert déjà d'étiquette ailleurs dans l'application. */
const DESTINATIONS=[
  {icon:'📿', i18n:'nav.tasbih',    go:()=>goPage('page-tasbih')},
  {icon:'🕌', i18n:'nav.salat',     go:()=>goPage('page-salat')},
  {icon:'🧭', i18n:'nav.qibla',     go:()=>goPage('page-qibla')},
  {icon:'🤲', i18n:'nav.duas',      go:()=>goPage('page-duas')},
  {icon:'📖', i18n:'nav.quran',     go:()=>goPage('page-quran')},
  {icon:'📚', i18n:'nav.library',   go:()=>goPage('page-library')},
  {icon:'🧰', i18n:'nav.tools',     go:()=>goPage('page-tools')},
  {icon:'⚙️', i18n:'nav.settings',  go:()=>goPage('page-settings')},
  {icon:'🕋', i18n:'row.qada',      go:()=>$('btn-open-qada')?.click()},
  {icon:'💰', i18n:'row.zakat',     go:()=>$('btn-open-zakat')?.click()},
  {icon:'🌙', i18n:'row.hijri',     go:()=>$('btn-open-hijri')?.click()},
  {icon:'🍽️', i18n:'row.fasting',   go:()=>$('btn-open-fasting')?.click()},
  {icon:'🗺️', i18n:'row.places',    go:()=>$('btn-open-places')?.click()},
  {icon:'🛡️', i18n:'row.routines',  go:()=>$('btn-open-routines')?.click()},
  {icon:'🔍', i18n:'halal.title',   go:()=>openHalal('scan')},
  {icon:'🎁', i18n:'sec.rewards',   go:()=>openSheet('sh-rewards')},
  {icon:'🌐', i18n:'row.lang',      go:()=>$('btn-open-lang')?.click()},
  {icon:'⚖️', i18n:'row.madhab',    go:()=>$('btn-open-madhab')?.click()},
  {icon:'🎨', i18n:'row.ambiance',  go:()=>goPage('page-settings')},
  {icon:'🔔', i18n:'row.notif',     go:()=>goPage('page-settings')},
];

const BOOK_KEYS=[
  {key:'riyad',     icon:'📗', i18n:'books.riyad'},
  {key:'citadelle', icon:'📘', i18n:'books.citadelle'},
  {key:'asma',      icon:'✨', i18n:'books.asma'},
  {key:'fruits',    icon:'🌿', i18n:'books.foods'},
  {key:'miracles',  icon:'✦',  i18n:'books.miracles'},
];

/* L'index est rebâti à chaque changement de langue : les libellés des
   destinations et des livres viennent de t(), qui a changé de dictionnaire. */
let _index=null;
let _indexLang=null;

function buildIndex(){
  const idx=[];
  const push=(kind,icon,label,sub,extra,go)=>
    idx.push({kind,icon,label,sub,go,hay:fold(`${label} ${sub||''} ${extra||''}`)});

  // On indexe aussi le libellé français, même quand l'interface est dans une
  // autre langue : sans lui, un lecteur d'arabe qui tape « qibla » au clavier
  // latin ne trouverait rien, puisque l'étiquette affichée est « القبلة ».
  DESTINATIONS.forEach(d=>push('nav',d.icon,t(d.i18n),'',fr[d.i18n],d.go));

  BOOK_KEYS.forEach(b=>push('book',b.icon,t(b.i18n),'',fr[b.i18n],()=>showBook(b.key)));

  // Une sourate se cherche par son nom translittéré, son nom arabe ou son
  // numéro : « 36 », « Ya-Sin » et « يس » doivent mener au même endroit.
  SURAHS.forEach(s=>push(
    'surah','﴾﴿',`${s.n}. ${surahName(s)}`,`${s.ar} · ${s.v} ${t('quran.verses')}`,`sourate surah ${s.n}`,
    ()=>{goPage('page-quran');showSurah(s.n);}
  ));

  // On indexe le libelle traduit ET le francais d'origine : chercher
  // « reveil » doit marcher meme quand l'interface est en japonais.
  DUAS.forEach(d=>push(
    'dua',d.icon||'🤲',duaTitle(d),`${duaCat(d)} · ${duaOcc(d)}`,
    `${d.title} ${d.occasion||''} ${d.cat}`,
    ()=>openDuaSearch(duaTitle(d))
  ));

  ROUTINES.forEach(r=>push(
    'routine',r.icon||'🛡️',r.name,r.desc,'',
    ()=>openRoutine(r.id)
  ));

  ADDITIVES.forEach(a=>{
    const st=ADD_STATUS[a.status]||{};
    push('additive',st.icon||'🧪',`${a.code} — ${addName(a)}`,addNote(a),`additif e-number ${a.name}`,
      ()=>openHalal('add',a.code));
  });

  _index=idx;
  _indexLang=S.lang;
  return idx;
}

/* Un résultat vaut d'autant plus qu'il commence par ce qui a été tapé :
   chercher « fa » doit proposer Al-Fâtiha avant « Nourriture et fatigue ».
   Tous les mots de la requête doivent apparaître (ET, pas OU) — sinon une
   requête de deux mots élargit le bruit au lieu de le réduire. */
function score(entry,words,raw){
  if(!words.every(w=>entry.hay.includes(w)))return 0;
  const h=entry.hay;
  let s=1;
  if(h.startsWith(raw))s+=100;
  else if(new RegExp(`(^| )${raw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`).test(h))s+=50;
  // À pertinence égale, une page se place avant une fiche d'additif.
  s+={nav:9,book:7,surah:6,routine:5,dua:4,additive:1}[entry.kind]||0;
  return s;
}

const GROUPS=[
  {kind:'nav',      i18n:'search.gNav'},
  {kind:'surah',    i18n:'search.gSurah'},
  {kind:'dua',      i18n:'search.gDua'},
  {kind:'routine',  i18n:'search.gRoutine'},
  {kind:'book',     i18n:'search.gBook'},
  {kind:'additive', i18n:'search.gAdditive'},
];
const PER_GROUP=6;   // au-delà, la liste cesse d'être une réponse

function render(query){
  const host=$('search-res');
  if(!host)return;
  host.innerHTML='';
  const raw=fold(query);
  if(!raw){
    host.innerHTML=`<div class="places-empty">${t('search.hint')}</div>`;
    return;
  }
  if(!_index||_indexLang!==S.lang)buildIndex();

  const words=raw.split(' ').filter(Boolean);
  const hits=[];
  for(const e of _index){
    const s=score(e,words,raw);
    if(s)hits.push({e,s});
  }
  if(!hits.length){
    host.innerHTML=`<div class="places-empty">${t('search.none',{q:query})}</div>`;
    return;
  }
  hits.sort((a,b)=>b.s-a.s);

  let shown=0;
  GROUPS.forEach(g=>{
    const rows=hits.filter(h=>h.e.kind===g.kind);
    if(!rows.length)return;
    const head=document.createElement('div');
    head.className='sl';
    head.style.margin='12px 0 4px';
    head.textContent=rows.length>PER_GROUP
      ? `${t(g.i18n)} · ${rows.length}`
      : t(g.i18n);
    host.appendChild(head);
    rows.slice(0,PER_GROUP).forEach(({e})=>{
      shown++;
      const row=document.createElement('div');
      row.className='row';
      row.innerHTML=`<div class="row-ic">${e.icon}</div><div class="row-body">
        <div class="row-name">${e.label}</div>
        ${e.sub?`<div class="row-sub">${e.sub}</div>`:''}</div>
        <svg class="row-chev" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
      row.addEventListener('click',()=>{
        vib(16);
        closeSheet();
        // La feuille met ~220 ms à se replier : ouvrir la destination avant
        // la fin de l'animation la ferait fermer dans la foulée.
        //
        // Pas de catch muet ici : un `try{}catch{}` a déjà masqué une vraie
        // panne (routines.js appelait t() sans l'importer) et la recherche
        // avait l'air de ne rien faire. Mieux vaut que l'erreur remonte.
        setTimeout(()=>e.go(),240);
      });
      host.appendChild(row);
    });
  });
  if(!shown)host.innerHTML=`<div class="places-empty">${t('search.none',{q:query})}</div>`;
}

export function openSearch(){
  openSheet('sh-search',()=>{
    const inp=$('search-inp');
    if(inp){inp.value='';setTimeout(()=>inp.focus(),400);}
    render('');
  });
}

export function initSearch(){
  const inp=$('search-inp');
  if(!inp)return;
  let deb=null;
  inp.addEventListener('input',e=>{
    const v=e.target.value;
    clearTimeout(deb);
    // 300 additifs à parcourir : au-delà d'une frappe rapide, on attend.
    deb=setTimeout(()=>render(v),120);
  });
  // Entrée ouvre le premier résultat : le geste attendu quand on a tapé
  // le nom exact de ce qu'on cherche.
  inp.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const first=$('search-res')?.querySelector('.row');
    if(first)first.click();
  });
}
