/* SAKINA — Bibliothèque.
   Deux ouvrages, deux natures de contenu :
   · Riyad as-Salihin — texte intégral extrait du PDF (trad. Kechrid),
     lu comme un livre : intro → liste de chapitres → lecture.
   · La Citadelle du Musulman — le PDF source est un scan sans couche de
     texte fiable (l'arabe y était irrécupérable après extraction) ; on
     affiche donc les pages originales du livre telles qu'imprimées.
   Emotional Design (Norman) : chaque livre s'ouvre sur un écran qui
   explique ce qu'il est et pourquoi il compte (réflexif) avant la
   lecture (comportemental), avec une présentation soignée (viscéral). */
import {openSheet} from '../core/ui.js';
import {vib} from '../core/audio.js';

const $=id=>document.getElementById(id);

const BOOKS={
  riyad:{
    key:'riyad',icon:'📗',type:'chapters',
    title:'Riyad as-Salihin',titleAr:'رياض الصالحين',
    author:"Imam an-Nawawi · traduction Salaheddine Kechrid",
    stats:[{val:'373',label:'Chapitres'},{val:'1896',label:'Hadiths'},{val:'VIIIᵉ s.',label:'Hégire'}],
    desc:[
      "« Les Jardins des Vertueux » est un recueil de hadiths authentiques compilé au XIIIᵉ siècle par l'imam Yahya ibn Sharaf an-Nawawi, l'un des plus grands savants du hadith et du fiqh shafiite de l'histoire musulmane.",
      "Organisé en 373 chapitres thématiques — sincérité, patience, bonté envers les parents, adab du quotidien, repentir — c'est l'un des recueils les plus lus au monde pour ancrer la foi dans le comportement de tous les jours.",
    ],
    src:'books/riyad.json',
  },
  citadelle:{
    key:'citadelle',icon:'📘',type:'pages',
    title:'La Citadelle du Musulman',titleAr:'حصن المسلم',
    author:"Sa'id ibn Ali ibn Wahf Al-Qahtani",
    stats:[{val:'146',label:'Pages'},{val:'Intégral',label:'Édition'}],
    desc:[
      "« Hisn al-Muslim » rassemble des invocations authentiques tirées du Coran et de la Sunna pour chaque instant du quotidien : réveil, repas, voyage, épreuves — afin que le rappel d'Allah accompagne le musulman à chaque moment.",
      "Le texte source de ce livre est un document scanné ; pour préserver l'exactitude de l'arabe, vous consultez ici les pages originales du livre, telles qu'imprimées.",
    ],
    pageCount:146,
    pagePath:n=>`books/citadelle-pages/page-${String(n).padStart(3,'0')}.png`,
  },
};

let _current=null;   // clé du livre ouvert
let _riyad=null;     // données JSON chargées (mise en cache)
let _view='intro';   // intro | list | chapter | pages
let _page=1;

/* ── En-tête commun ── */
function setHeader({title,back=false,search=false}){
  $('book-title').textContent=title;
  $('btn-book-back').style.display=back?'flex':'none';
  $('book-search-wrap').style.display=search?'block':'none';
}

/* ── Écran d'introduction (commun aux deux livres) ── */
function showIntro(){
  _view='intro';
  const b=BOOKS[_current];
  setHeader({title:'Bibliothèque',back:true});
  $('book-pager').style.display='none';
  const bd=$('book-bd');
  bd.innerHTML=`<div class="book-intro">
    <div class="book-intro-badge">${b.icon}</div>
    <div class="book-intro-title">${b.title}</div>
    ${b.titleAr?`<div class="book-intro-ar">${b.titleAr}</div>`:''}
    <div class="book-intro-author">${b.author}</div>
    <div class="book-intro-stats">${b.stats.map(s=>`<div class="book-intro-stat"><b>${s.val}</b><span>${s.label}</span></div>`).join('')}</div>
    ${b.desc.map(p=>`<p class="book-intro-desc">${p}</p>`).join('')}
    <div class="book-intro-cta" id="book-start">✦ Commencer la lecture</div>
    <div class="book-intro-src">${b.type==='chapters'?'Texte intégral, reproduit tel quel — édition riyad.fr.tc':'Pages originales du livre imprimé'}</div>
  </div>`;
  $('book-start').addEventListener('click',()=>{
    vib(16);
    if(b.type==='chapters')openList();
    else openPages(1);
  });
  bd.scrollTop=0;
}

/* ── Riyad as-Salihin : liste de chapitres ── */
async function loadRiyad(){
  if(_riyad)return _riyad;
  const res=await fetch(BOOKS.riyad.src);
  if(!res.ok)throw new Error('load');
  _riyad=await res.json();
  return _riyad;
}

async function openList(filter=''){
  _view='list';
  setHeader({title:BOOKS.riyad.title,back:true,search:true});
  $('book-pager').style.display='none';
  if(!_riyad){
    $('book-bd').innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement du livre…</div>';
    try{await loadRiyad();}
    catch{$('book-bd').innerHTML='<div class="places-empty">Connexion requise pour le premier chargement du livre.</div>';return;}
  }
  renderList(filter);
  if(!filter)$('book-search').focus({preventScroll:true});
}

function renderList(filter=''){
  const bd=$('book-bd');bd.innerHTML='';
  const f=filter.trim().toLowerCase();
  const items=_riyad.chapters.filter(c=>!f||c.title.toLowerCase().includes(f)||String(c.n)===f);
  if(!items.length){
    bd.innerHTML='<div class="places-empty">Aucun chapitre trouvé.</div>';
    return;
  }
  items.forEach(c=>{
    const div=document.createElement('div');
    div.className='book-chap-row';
    div.innerHTML=`<div class="book-chap-n">${c.n}</div><div class="book-chap-t">${c.title}</div>
      <svg class="row-chev" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
    div.addEventListener('click',()=>showChapter(c.n));
    bd.appendChild(div);
  });
}

/* Mise en forme du texte verbatim : numéros de hadith mis en valeur —
   le contenu lui-même n'est jamais modifié */
function formatChapter(text){
  let esc=text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  // Numéro + point + Majuscule = début d'un hadith, quel que soit le nom du
  // rapporteur (une liste de prénoms ratait "Al Hasan", "Jarir", etc.)
  esc=esc.replace(/\s(?=\d{1,4}\.\s[A-ZÀ-Ü])/g,'\n\n');
  return esc.split('\n\n').map(par=>{
    let p=par.trim();
    if(!p)return'';
    p=p.replace(/^(\d{1,4})\.\s/,'<span class="book-hnum">$1</span> ');
    return`<p class="book-par">${p}</p>`;
  }).join('');
}

function showChapter(n){
  const c=_riyad.chapters.find(x=>x.n===n);
  if(!c)return;
  _view='chapter';
  setHeader({title:`${c.n}/${_riyad.chapters.length}`,back:true});
  $('book-pager').style.display='none';
  const idx=_riyad.chapters.indexOf(c);
  const prev=_riyad.chapters[idx-1],next=_riyad.chapters[idx+1];
  const bd=$('book-bd');
  bd.innerHTML=`<div class="book-chapter">
      <div class="book-chap-head">${c.n}. ${c.title}</div>
      ${formatChapter(c.text)}
      <div class="book-src">${_riyad.author} · ${_riyad.source}</div>
      <div class="book-chap-nav">
        <div class="book-chap-nav-btn${prev?'':' disabled'}" id="book-prev-chap">‹ Chapitre précédent</div>
        <div class="book-chap-nav-btn${next?'':' disabled'}" id="book-next-chap">Chapitre suivant ›</div>
      </div>
    </div>`;
  bd.scrollTop=0;
  if(prev)$('book-prev-chap').addEventListener('click',()=>showChapter(prev.n));
  if(next)$('book-next-chap').addEventListener('click',()=>showChapter(next.n));
}

/* ── Citadelle du Musulman : pages scannées ── */
function openPages(n){
  _view='pages';
  const b=BOOKS.citadelle;
  setHeader({title:b.title,back:true});
  const pager=$('book-pager');
  pager.style.display='flex';
  $('pager-total').textContent=`/ ${b.pageCount}`;
  showPage(Math.max(1,Math.min(b.pageCount,n)));
}

function showPage(n){
  _page=n;
  const b=BOOKS.citadelle;
  $('pager-input').value=n;
  $('pager-prev').classList.toggle('disabled',n<=1);
  $('pager-next').classList.toggle('disabled',n>=b.pageCount);
  const bd=$('book-bd');
  bd.innerHTML=`<div class="book-pages-viewer"><img class="book-page-img" src="${b.pagePath(n)}" alt="Page ${n}" loading="eager"></div>`;
  bd.scrollTop=0;
  // Précharge la page suivante pour une navigation fluide
  if(n<b.pageCount){const pre=new Image();pre.src=b.pagePath(n+1);}
}

/* ── Ouverture d'un livre depuis les Outils ── */
function openBook(key){
  _current=key;
  openSheet('sh-book',()=>{
    $('book-search').value='';
    showIntro();
  });
}

export function initBooks(){
  $('btn-open-riyad').addEventListener('click',()=>openBook('riyad'));
  $('btn-open-citadelle').addEventListener('click',()=>openBook('citadelle'));

  $('btn-book-back').addEventListener('click',()=>{
    if(_view==='chapter')openList($('book-search').value);
    else if(_view==='list')showIntro();
    else if(_view==='pages')showIntro();
    else showIntro();
  });
  $('book-search').addEventListener('input',e=>{if(_view==='list')renderList(e.target.value);});

  // Visionneuse de pages
  $('pager-prev').addEventListener('click',()=>{if(_page>1){vib(12);showPage(_page-1);}});
  $('pager-next').addEventListener('click',()=>{if(_page<BOOKS.citadelle.pageCount){vib(12);showPage(_page+1);}});
  $('pager-input').addEventListener('change',e=>{
    const n=parseInt(e.target.value)||1;
    showPage(Math.max(1,Math.min(BOOKS.citadelle.pageCount,n)));
  });
}
