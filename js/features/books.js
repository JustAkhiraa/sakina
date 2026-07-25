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
      "Le mode « Lecture » vous propose le texte propre, mis en forme pour un confort optimal. Pour vérifier un passage précis (surtout en arabe), basculez sur « Page scannée » pour retrouver la mise en page originale du livre.",
    ],
    pageCount:146,
    pagePath:n=>`books/citadelle-pages/page-${String(n).padStart(3,'0')}.png`,
    textSrc:'books/citadelle.json',
  },
  asma:{
    key:'asma',icon:'✨',type:'names',
    title:"Les 99 Noms d'Allah",titleAr:'أسماء الله الحسنى',
    author:"Al-Asma' al-Husna — tradition sunnite classique",
    stats:[{val:'99',label:'Noms'},{val:'Ar → Fr',label:'Traduction'}],
    desc:[
      "« Les Plus Beaux Noms » d'Allah — 99 noms rapportés par la tradition, chacun révélant une facette de Sa majesté, de Sa miséricorde et de Sa perfection.",
      "« À Allah appartiennent les plus beaux noms. Invoquez-Le par ces noms » (Coran 7:180). Cette lecture est un moyen d'accroître la connaissance d'Allah et l'attachement à Lui.",
    ],
    src:'books/asma.json',
  },
  salat:{
    key:'salat',icon:'🧎',type:'guide',
    title:'Comment faire la Salât',titleAr:'الصلاة',
    author:'Guide pratique — apprentissage général',
    stats:[{val:'5',label:'Prières'},{val:'Pas à pas',label:'Méthode'},{val:'Claire',label:'Lecture'}],
    desc:[
      "Une fiche d'apprentissage pour comprendre l'ordre général de la prière : intention, takbîr, récitation, inclinaison, prosternation, tashahhud et salâm.",
      "Selon les écoles et les mosquées, certains détails peuvent varier. Gardez ce guide comme base de révision et suivez l'enseignement de votre imam pour les points précis.",
    ],
    sections:[
      {icon:'🧭',title:'Avant de commencer',points:['Être en état de pureté avec les ablutions.','Prier dans un endroit propre, couvert correctement.','Se tourner vers la Qibla et savoir quelle prière on accomplit.','L’intention se fait dans le cœur, sans obligation de la prononcer.']},
      {icon:'1',title:'Entrée en prière',points:['Lever les mains puis dire : Allahu Akbar.','Poser les mains et commencer avec calme.','Réciter Al-Fâtiha, puis une sourate ou quelques versets dans les deux premières unités.']},
      {icon:'2',title:'Rukûʿ — inclinaison',points:['Dire Allahu Akbar puis s’incliner, dos posé et mains sur les genoux.','Dire plusieurs fois : Subhâna Rabbiyal ʿAzîm.','Se relever en disant : Samiʿa Allahu liman hamidah, puis Rabbana wa laka-l-hamd.']},
      {icon:'3',title:'Sujûd — prosternation',points:['Dire Allahu Akbar puis se prosterner.','Poser le front, le nez, les mains, les genoux et les pieds.','Dire plusieurs fois : Subhâna Rabbiyal Aʿlâ.','S’asseoir brièvement, puis faire une deuxième prosternation.']},
      {icon:'4',title:'Tashahhud & salâm',points:['À la fin, s’asseoir et réciter le tashahhud.','Ajouter la prière sur le Prophète ﷺ.','Clore par le salâm à droite puis à gauche : As-salâmu ʿalaykum wa rahmatullah.']},
      {icon:'🧩',title:'Nombre d’unités',points:['Fajr : 2 rakʿât.','Dhuhr : 4 rakʿât.','ʿAsr : 4 rakʿât.','Maghrib : 3 rakʿât.','ʿIshâ : 4 rakʿât.']},
    ],
  },
  wudu:{
    key:'wudu',icon:'💧',type:'guide',
    title:'Faire les ablutions',titleAr:'الوضوء',
    author:'Wudû’ — purification avant la prière',
    stats:[{val:'7',label:'Étapes'},{val:'Avant',label:'Salât'},{val:'Simple',label:'Mémo'}],
    desc:[
      "Les ablutions préparent à la prière et installent une intention de pureté, de concentration et de respect avant de se présenter devant Allah.",
      "Cette fiche donne l'ordre pratique le plus courant. Pour les détails de votre école juridique, suivez l'avis enseigné par votre mosquée ou professeur.",
    ],
    sections:[
      {icon:'🤲',title:'Intention & basmala',points:['Avoir l’intention de faire les ablutions pour la prière.','Dire : Bismillah.','Éviter le gaspillage d’eau, même si l’eau est disponible.']},
      {icon:'1',title:'Mains',points:['Laver les deux mains jusqu’aux poignets.','Faire passer l’eau entre les doigts.','Répéter jusqu’à trois fois.']},
      {icon:'2',title:'Bouche & nez',points:['Rincer la bouche.','Inspirer légèrement de l’eau dans le nez puis l’expulser.','Faire doucement si l’on jeûne.']},
      {icon:'3',title:'Visage',points:['Laver tout le visage : du haut du front au menton, et d’une oreille à l’autre.','Veiller aux contours du nez, de la barbe et du menton.']},
      {icon:'4',title:'Bras',points:['Laver le bras droit jusqu’au coude inclus.','Puis laver le bras gauche jusqu’au coude inclus.','Ne pas oublier l’arrière des coudes.']},
      {icon:'5',title:'Tête & oreilles',points:['Passer les mains mouillées sur la tête.','Essuyer les oreilles avec les doigts humides.','Un seul passage suffit dans la pratique courante.']},
      {icon:'6',title:'Pieds',points:['Laver le pied droit jusqu’à la cheville incluse, puis le gauche.','Passer entre les orteils.','Vérifier que le talon est bien mouillé.']},
      {icon:'✨',title:'Après les ablutions',points:['Dire l’attestation de foi.','Garder le calme et partir vers la prière sans se précipiter.','Si les ablutions sont annulées, il faut les refaire avant de prier.']},
    ],
  },
};

let _current=null;   // clé du livre ouvert
let _riyad=null;     // données JSON chargées (mise en cache)
let _view='intro';   // intro | list | chapter | names | guide | pages
let _page=1;

/* ── En-tête commun ── */
function setHeader({title,back=false,search=false,searchPh=''}){
  $('book-title').textContent=title;
  $('btn-book-back').style.display=back?'flex':'none';
  $('book-search-wrap').style.display=search?'block':'none';
  if(search&&searchPh)$('book-search').placeholder=searchPh;
  $('book-mode-toggle').style.display='none'; // ré-affiché explicitement par openPages()
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
    <div class="book-intro-src">${b.type==='chapters'?'Texte intégral, reproduit tel quel — édition riyad.fr.tc':b.type==='names'?"D'après la tradition classique — références coraniques et prophétiques":'Pages originales du livre imprimé'}</div>
  </div>`;
  $('book-start').addEventListener('click',()=>{
    vib(16);
    if(b.type==='chapters')openList();
    else if(b.type==='names')openNames();
    else if(b.type==='guide')openGuide();
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
  setHeader({title:BOOKS.riyad.title,back:true,search:true,searchPh:'Chercher un chapitre (patience, repentir…)'});
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
  // Numéro + point (ou tiret collé) + Majuscule = début d'un hadith, quel
  // que soit le nom du rapporteur (une liste de prénoms ratait "Al Hasan",
  // "Jarir", etc.). Le tiret collé ("1- Le calife...") est le format du
  // chapitre 1 ; il ne se confond pas avec les citations coraniques
  // internes ("1 - Chapitre 98 verset 48"), qui ont un espace avant le tiret.
  esc=esc.replace(/\s(?=\d{1,4}[.\-]\s?[A-ZÀ-Ü])/g,'\n\n');
  let seenHnum=false;
  return esc.split('\n\n').map(par=>{
    let p=par.trim();
    if(!p)return'';
    // "N. Majuscule" ou "N- Majuscule" = début d'un nouveau hadith
    const isH=/^(\d{1,4})[.\-]\s?[A-ZÀ-Ü]/.test(p);
    p=p.replace(/^(\d{1,4})[.\-]\s?(?=[A-ZÀ-Ü])/,'<span class="book-hnum">$1</span> ');
    // Enluminure horizontale avant chaque hadith (sauf le premier)
    let sep='';
    if(isH){
      if(seenHnum)sep='<div class="book-sep" aria-hidden="true"><span></span><span></span><span></span></div>';
      seenHnum=true;
    }
    return sep+`<p class="book-par">${p}</p>`;
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

/* ── Citadelle du Musulman : deux vues ──
   « Lecture » (mode texte) : source Markdown propre — c'est le mode par défaut,
   agréable à parcourir. « Page scannée » (image) : reproduction fidèle du PDF
   pour vérifier un passage précis. */
let _pageMode='text';    // text | image  (défaut = lecture propre)
let _citadelleText=null; // {pages:[{n,text}]} — chargé à la demande

async function loadCitadelleText(){
  if(_citadelleText)return _citadelleText;
  const res=await fetch(BOOKS.citadelle.textSrc);
  if(!res.ok)throw new Error('load');
  _citadelleText=await res.json();
  return _citadelleText;
}

function openPages(n){
  _view='pages';
  const b=BOOKS.citadelle;
  setHeader({title:b.title,back:true});
  $('book-mode-toggle').style.display='flex';
  // Synchronise l'état visuel du toggle avec le mode actif
  document.querySelectorAll('#book-mode-toggle .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.mode===_pageMode));
  const pager=$('book-pager');
  pager.style.display='flex';
  $('pager-total').textContent=`/ ${b.pageCount}`;
  showPage(Math.max(1,Math.min(b.pageCount,n)));
}

/* Petit rendu Markdown maison — juste ce dont la Citadelle a besoin :
   #/##/### pour les titres, **gras**, *italique*, listes -, séparateurs ---.
   L'arabe est enveloppé en RTL quand une ligne contient uniquement de l'arabe. */
function renderCitadelleMarkdown(md){
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const inline=s=>esc(s)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\[\^([^\]]+)\]/g,'<sup class="book-fn-ref">$1</sup>'); // renvoi de note
  const isArabic=s=>/[\u0600-\u06FF]/.test(s)&&!/[A-Za-z\u00C0-\u00FF]{2,}/.test(s);
  const lines=md.split('\n');
  const out=[];
  const notes=[];               // {mark,text} collectees puis rendues en bas de page
  let inList=false;
  const closeList=()=>{if(inList){out.push('</ul>');inList=false;}};
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trimEnd();
    const s=line.trim();
    if(!s){closeList();continue;}
    // Definition de note : "[^1]: texte"
    const nd=s.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if(nd){closeList();notes.push({mark:nd[1],text:nd[2]});continue;}
    // Tableau : "| ... |" + separateur "|---|---|"
    if(/^\|.*\|$/.test(s)&&i+1<lines.length&&/^\|[\s:|-]+\|$/.test(lines[i+1].trim())){
      closeList();
      const cells=r=>r.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      const head=cells(s);i++;
      const body=[];
      while(i+1<lines.length&&/^\|.*\|$/.test(lines[i+1].trim())){i++;body.push(cells(lines[i]));}
      let t='<table class="book-md-table"><thead><tr>'+head.map(h=>`<th>${inline(h)}</th>`).join('')+'</tr></thead><tbody>';
      t+=body.map(r=>'<tr>'+r.map(c=>{const ar=isArabic(c);return `<td${ar?' dir="rtl" lang="ar"':''}>${inline(c)}</td>`;}).join('')+'</tr>').join('');
      out.push(t+'</tbody></table>');continue;
    }
    if(/^#{1,6}\s+/.test(s)){
      closeList();
      const m=s.match(/^(#{1,6})\s+(.*)$/);
      const lvl=Math.min(m[1].length+1,6); // # -> h2 (h1 reserve au header du livre)
      out.push(`<h${lvl} class="book-md-h${lvl}">${inline(m[2])}</h${lvl}>`);continue;
    }
    if(/^---+$/.test(s)){
      closeList();
      out.push('<div class="book-sep" aria-hidden="true"><span></span><span></span><span></span></div>');continue;
    }
    // Table des matieres : "12. Titre ....... 15" ou "Titre ..... 15"
    const toc=s.match(/^(?:(\d+)\.\s+)?(.+?\S)\s*[.\u00B7]{2,}\s*(\d+)$/);
    if(toc&&!isArabic(s)){
      closeList();
      const num=toc[1]?`<span class="book-toc-n">${toc[1]}</span>`:'';
      out.push(`<div class="book-toc-row">${num}<span class="book-toc-t">${inline(toc[2])}</span><span class="book-toc-lead" aria-hidden="true"></span><span class="book-toc-p">${toc[3]}</span></div>`);continue;
    }
    if(/^[-\u2022]\s+/.test(s)){
      if(!inList){out.push('<ul class="book-md-ul">');inList=true;}
      out.push(`<li>${inline(s.replace(/^[-\u2022]\s+/,''))}</li>`);continue;
    }
    closeList();
    // Verset coranique entre ornements
    if(/[\uFD3E\uFD3F]/.test(s)){
      out.push(`<p class="book-md-verse" dir="rtl" lang="ar">${inline(s)}</p>`);continue;
    }
    const ar=isArabic(s);
    out.push(`<p class="book-md-p${ar?' book-md-ar':''}"${ar?' dir="rtl" lang="ar"':''}>${inline(line)}</p>`);
  }
  closeList();
  if(notes.length){
    out.push('<div class="book-fn-list">');
    notes.forEach(n=>{
      const ar=isArabic(n.text);
      out.push(`<div class="book-fn"${ar?' dir="rtl" lang="ar"':''}><span class="book-fn-mark">${esc(n.mark)}</span> ${inline(n.text)}</div>`);
    });
    out.push('</div>');
  }
  return out.join('');
}

async function showPage(n){
  _page=n;
  const b=BOOKS.citadelle;
  $('pager-input').value=n;
  $('pager-prev').classList.toggle('disabled',n<=1);
  $('pager-next').classList.toggle('disabled',n>=b.pageCount);
  const bd=$('book-bd');

  if(_pageMode==='image'){
    bd.innerHTML=`<div class="book-pages-viewer"><img class="book-page-img" src="${b.pagePath(n)}" alt="Page ${n}" loading="eager"></div>`;
    if(n<b.pageCount){const pre=new Image();pre.src=b.pagePath(n+1);}
  }else{
    bd.innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement du texte…</div>';
    try{await loadCitadelleText();}
    catch{bd.innerHTML='<div class="places-empty">Connexion requise pour le premier chargement du texte.</div>';return;}
    const page=_citadelleText.pages.find(p=>p.n===n);
    const html=page?renderCitadelleMarkdown(page.text||''):'';
    bd.innerHTML=`<div class="book-chapter book-md">
      ${html||'<p class="book-md-p" style="color:var(--t3)">(page vide)</p>'}
      <div class="book-md-foot">Page ${n} · Hisn al-Muslim</div>
    </div>`;
  }
  bd.scrollTop=0;
}

function setPageMode(mode){
  _pageMode=mode;
  document.querySelectorAll('#book-mode-toggle .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.mode===mode));
  showPage(_page);
}

/* ── 99 Noms d'Allah : chargement + rendu en cartes ── */
let _asma=null;
async function loadAsma(){
  if(_asma)return _asma;
  const res=await fetch(BOOKS.asma.src);
  if(!res.ok)throw new Error('load');
  _asma=await res.json();
  return _asma;
}
async function openNames(filter=''){
  _view='names';
  setHeader({title:BOOKS.asma.title,back:true,search:true,searchPh:'Chercher un nom (Rahmân, Paix, n°…)'});
  $('book-pager').style.display='none';
  if(!_asma){
    $('book-bd').innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement des noms…</div>';
    try{await loadAsma();}
    catch{$('book-bd').innerHTML='<div class="places-empty">Connexion requise pour le premier chargement.</div>';return;}
  }
  renderNames(filter);
}
/* Récitation d'un nom. Source par défaut : dépôt MIT MohammedAbidNafi/
   99-Names-of-Allah via CDN jsDelivr (champ `af` par nom dans asma.json).
   Repli local possible : books/asma-audio/{n à 3 chiffres}.mp3 — déposer les
   fichiers là suffit à les faire jouer hors-ligne, sans changer le code. */
function asmaAudioSrc(n){
  const nm=_asma&&_asma.names.find(x=>x.n===n);
  const base=(_asma&&_asma.audioSource&&_asma.audioSource.base)||'';
  if(nm&&nm.af&&base)return base+nm.af+'.mp3';
  return `books/asma-audio/${String(n).padStart(3,'0')}.mp3`;
}
let _asmaAudio=null,_asmaPlaying=0;
function playName(n,card){
  if(!_asmaAudio){_asmaAudio=new Audio();}
  document.querySelectorAll('.asma-card.playing').forEach(c=>c.classList.remove('playing'));
  // reclic sur le nom en cours → stop
  if(_asmaPlaying===n&&!_asmaAudio.paused){_asmaAudio.pause();_asmaPlaying=0;return;}
  _asmaAudio.src=asmaAudioSrc(n);_asmaPlaying=n;
  card.classList.add('playing');
  _asmaAudio.onended=()=>{card.classList.remove('playing');_asmaPlaying=0;};
  _asmaAudio.onerror=()=>{card.classList.remove('playing');_asmaPlaying=0;toast('Récitation de ce nom bientôt disponible 🎧');};
  _asmaAudio.play().catch(()=>{});
}

function renderNames(filter=''){
  const bd=$('book-bd');
  const f=filter.trim().toLowerCase();
  const items=_asma.names.filter(x=>!f||x.tr.toLowerCase().includes(f)||x.fr.toLowerCase().includes(f)||String(x.n)===f||x.ar.includes(filter.trim()));
  if(!items.length){bd.innerHTML='<div class="places-empty">Aucun nom trouvé.</div>';return;}
  bd.innerHTML=`<div class="asma-list">${items.map(x=>`
    <div class="asma-card" data-n="${x.n}" role="button" tabindex="0" aria-label="Écouter ${x.tr}">
      <div class="asma-head">
        <div class="asma-n">${x.n}</div>
        <div class="asma-ar" lang="ar" dir="rtl">${x.ar}</div>
        <div class="asma-play" aria-hidden="true">
          <svg class="ic-play" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="ic-stop" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
        </div>
      </div>
      <div class="asma-tr">${x.tr}</div>
      <div class="asma-fr">${x.fr}</div>
      <div class="asma-desc">${x.desc}</div>
    </div>`).join('')}</div>`;
  // Un clic (ou Entrée) sur une carte joue la récitation du nom
  bd.querySelectorAll('.asma-card').forEach(card=>{
    const n=+card.dataset.n;
    card.addEventListener('click',()=>playName(n,card));
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playName(n,card);}});
  });
  bd.scrollTop=0;
}

/* ── Apprendre : fiches pratiques lisibles en étapes courtes ── */
function openGuide(){
  _view='guide';
  const b=BOOKS[_current];
  setHeader({title:b.title,back:true});
  $('book-pager').style.display='none';
  const bd=$('book-bd');
  bd.innerHTML=`<div class="learn-reader">
    <div class="learn-hero">
      <div class="learn-mark">${b.icon}</div>
      <div><div class="learn-title">${b.title}</div>${b.titleAr?`<div class="learn-ar">${b.titleAr}</div>`:''}</div>
    </div>
    ${b.sections.map((sec,i)=>`<section class="learn-sec">
      <div class="learn-sec-head">
        <div class="learn-step">${sec.icon||i+1}</div>
        <h3>${sec.title}</h3>
      </div>
      <ul>${sec.points.map(p=>`<li>${p}</li>`).join('')}</ul>
    </section>`).join('')}
    <div class="learn-note">Ces rappels sont une base simple d’apprentissage. Pour les divergences de détails, suivez une personne de science ou votre mosquée.</div>
  </div>`;
  bd.scrollTop=0;
}


function openBook(key){
  _current=key;
  _pageMode='text'; // Lecture propre par défaut — le scan reste accessible via le toggle
  openSheet('sh-book',()=>{
    $('book-search').value='';
    showIntro();
  });
}

export function initBooks(){
  $('btn-open-riyad').addEventListener('click',()=>openBook('riyad'));
  $('btn-open-citadelle').addEventListener('click',()=>openBook('citadelle'));
  const btnAsma=$('btn-open-asma');
  if(btnAsma)btnAsma.addEventListener('click',()=>openBook('asma'));
  const btnSalat=$('btn-open-learn-salat');
  if(btnSalat)btnSalat.addEventListener('click',()=>openBook('salat'));
  const btnWudu=$('btn-open-learn-wudu');
  if(btnWudu)btnWudu.addEventListener('click',()=>openBook('wudu'));

  $('btn-book-back').addEventListener('click',()=>{
    if(_view==='chapter')openList($('book-search').value);
    else if(_view==='list')showIntro();
    else if(_view==='names')showIntro();
    else if(_view==='guide')showIntro();
    else if(_view==='pages')showIntro();
    else showIntro();
  });
  $('book-search').addEventListener('input',e=>{
    if(_view==='list')renderList(e.target.value);
    else if(_view==='names')renderNames(e.target.value);
  });

  // Visionneuse de pages
  $('pager-prev').addEventListener('click',()=>{if(_page>1){vib(12);showPage(_page-1);}});
  $('pager-next').addEventListener('click',()=>{if(_page<BOOKS.citadelle.pageCount){vib(12);showPage(_page+1);}});
  $('pager-input').addEventListener('change',e=>{
    const n=parseInt(e.target.value)||1;
    showPage(Math.max(1,Math.min(BOOKS.citadelle.pageCount,n)));
  });
  document.querySelectorAll('#book-mode-toggle .seg-opt').forEach(o=>{
    o.addEventListener('click',()=>{vib(12);setPageMode(o.dataset.mode);});
  });
}
