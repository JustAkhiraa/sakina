/* SAKINA — Bibliothèque.
   Trois natures de contenu, décrites par le champ `type` de chaque livre :
   · `chapters` — sommaire puis lecture chapitre par chapitre
     (Riyad as-Salihin, Les Aliments dans le Coran et la Sunna).
     Option `md:true` pour un rendu Markdown enrichi ; option `cat` sur
     les chapitres pour les regrouper en sections dans le sommaire.
   · `pages`    — lecture continue d'un texte long (La Citadelle du Musulman).
   · `names`    — grille de fiches (Les 99 Noms d'Allah).
   · `guide`    — fiche pratique en étapes courtes (Salât, Wudû').
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
    stats:[{val:'146',label:'Sections'},{val:'Intégral',label:'Édition'}],
    desc:[
      "« Hisn al-Muslim » rassemble des invocations authentiques tirées du Coran et de la Sunna pour chaque instant du quotidien : réveil, repas, voyage, épreuves — afin que le rappel d'Allah accompagne le musulman à chaque moment.",
      "Une lecture continue et soignée, du début à la fin, pensée pour un confort optimal — arabe, translittération et traduction mis en valeur.",
    ],
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
  fruits:{
    key:'fruits',icon:'🌿',type:'chapters',md:true,
    title:'Les Aliments dans le Coran et la Sunna',titleAr:'الأطعمة في القرآن والسنة',
    author:'Guide original — versets, hadiths et recherche nutritionnelle actuelle',
    searchPh:'Chercher un aliment (datte, miel, nigelle…)',
    stats:[{val:'12',label:'Aliments'},{val:'Coran',label:'Versets exacts'},{val:'60+',label:'Sources'}],
    desc:[
      "Datte, raisin, figue, olive, grenade, banane, jujube, miel — les aliments que le Coran nomme. Puis les remèdes transmis par la Sunna : nigelle, orge, vinaigre, eau de Zamzam.",
      "Pour chacun : les versets et hadiths cités intégralement avec leurs références, puis ce que dit la recherche — méta-analyses, essais randomisés, revues Cochrane — avec ses résultats comme ses limites. Toutes les sources sont rassemblées en fin de lecture.",
    ],
    src:'books/fruits.json',
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
const _chaptersCache={};  // JSON des livres « chapitres », en cache par clé
let _view='intro';   // intro | list | chapter | names | guide | pages

/* ── En-tête commun ── */
function setHeader({title,back=false,search=false,searchPh=''}){
  $('book-title').textContent=title;
  $('btn-book-back').style.display=back?'flex':'none';
  $('book-search-wrap').style.display=search?'block':'none';
  if(search&&searchPh)$('book-search').placeholder=searchPh;
}

/* ── Écran d'introduction (commun à tous les livres) ── */
function showIntro(){
  _view='intro';
  const b=BOOKS[_current];
  setHeader({title:'Bibliothèque',back:true});
  const bd=$('book-bd');
  bd.innerHTML=`<div class="book-intro">
    <div class="book-intro-badge">${b.icon}</div>
    <div class="book-intro-title">${b.title}</div>
    ${b.titleAr?`<div class="book-intro-ar">${b.titleAr}</div>`:''}
    <div class="book-intro-author">${b.author}</div>
    <div class="book-intro-stats">${b.stats.map(s=>`<div class="book-intro-stat"><b>${s.val}</b><span>${s.label}</span></div>`).join('')}</div>
    ${b.desc.map(p=>`<p class="book-intro-desc">${p}</p>`).join('')}
    <div class="book-intro-cta" id="book-start">✦ Commencer la lecture</div>
    <div class="book-intro-src">${b.key==='riyad'?'Texte intégral, reproduit tel quel — édition riyad.fr.tc':b.key==='fruits'?"Versets et hadiths cités intégralement ; recherche et rédaction originales — sources en fin de lecture":b.type==='names'?"D'après la tradition classique — références coraniques et prophétiques":'Pages originales du livre imprimé'}</div>
    ${b.key==='asma'?'<div class="book-intro-src">Invocation &amp; introspection de chaque nom : « Les Essentiels — Les 99 Noms d\'Allah » de Souad El Mansouri, éditions Al Bouraq</div>':''}
  </div>`;
  $('book-start').addEventListener('click',()=>{
    vib(16);
    if(b.type==='chapters')openList();
    else if(b.type==='names')openNames();
    else if(b.type==='guide')openGuide();
    else openPages();
  });
  bd.scrollTop=0;
}

/* ── Livres « chapitres » (Riyad as-Salihin, Les Aliments…) ──
   `_chaptersCache[key]` met en cache le JSON chargé, `key` = BOOKS[_current].key. */
async function loadChapters(key){
  if(_chaptersCache[key])return _chaptersCache[key];
  const res=await fetch(BOOKS[key].src);
  if(!res.ok)throw new Error('load');
  const data=await res.json();
  _chaptersCache[key]=data;
  return data;
}

async function openList(filter=''){
  _view='list';
  const key=_current;
  const b=BOOKS[key];
  setHeader({title:b.title,back:true,search:true,searchPh:b.searchPh||'Chercher un chapitre…'});
  if(!_chaptersCache[key]){
    $('book-bd').innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement du livre…</div>';
    try{await loadChapters(key);}
    catch{$('book-bd').innerHTML='<div class="places-empty">Connexion requise pour le premier chargement du livre.</div>';return;}
  }
  renderList(filter);
  if(!filter)$('book-search').focus({preventScroll:true});
}

function renderList(filter=''){
  const bd=$('book-bd');bd.innerHTML='';
  const data=_chaptersCache[_current];
  const f=filter.trim().toLowerCase();
  const items=data.chapters.filter(c=>!f||c.title.toLowerCase().includes(f)||String(c.n)===f);
  if(!items.length){
    bd.innerHTML='<div class="places-empty">Aucun chapitre trouvé.</div>';
    return;
  }
  // Les livres dont les chapitres portent un champ `cat` sont regroupés par
  // section (un intertitre s'insère à chaque changement de catégorie).
  let lastCat=null;
  items.forEach(c=>{
    if(c.cat&&c.cat!==lastCat){
      lastCat=c.cat;
      const h=document.createElement('div');
      h.className='book-cat-head';
      h.textContent=c.cat;
      bd.appendChild(h);
    }
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
  const key=_current;
  const data=_chaptersCache[key];
  const c=data.chapters.find(x=>x.n===n);
  if(!c)return;
  _view='chapter';
  setHeader({title:`${c.n}/${data.chapters.length}`,back:true});
  const idx=data.chapters.indexOf(c);
  const prev=data.chapters[idx-1],next=data.chapters[idx+1];
  const bd=$('book-bd');
  const body=BOOKS[key].md?renderCitadelleMarkdown(c.text):formatChapter(c.text);
  bd.innerHTML=`<div class="book-chapter book-read${BOOKS[key].md?' book-md':''}">
      <div class="book-chap-head">${c.n}. ${c.title}</div>
      ${body}
      <div class="book-src">${data.author} · ${data.source}</div>
      <div class="book-chap-nav">
        <div class="book-chap-nav-btn${prev?'':' disabled'}" id="book-prev-chap">‹ Chapitre précédent</div>
        <div class="book-chap-nav-btn${next?'':' disabled'}" id="book-next-chap">Chapitre suivant ›</div>
      </div>
    </div>`;
  bd.scrollTop=0;
  if(prev)$('book-prev-chap').addEventListener('click',()=>showChapter(prev.n));
  if(next)$('book-next-chap').addEventListener('click',()=>showChapter(next.n));
}

/* ── Citadelle du Musulman ──
   Lecture continue du texte intégral (source Markdown), d'un seul flux :
   ni pagination ni bascule vers les pages scannées. */
let _citadelleText=null; // {pages:[{n,text}]} — chargé à la demande

async function loadCitadelleText(){
  if(_citadelleText)return _citadelleText;
  const res=await fetch(BOOKS.citadelle.textSrc);
  if(!res.ok)throw new Error('load');
  _citadelleText=await res.json();
  return _citadelleText;
}

async function openPages(){
  _view='pages';
  const b=BOOKS.citadelle;
  setHeader({title:b.title,back:true});
  const bd=$('book-bd');
  bd.innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement du livre…</div>';
  try{await loadCitadelleText();}
  catch{bd.innerHTML='<div class="places-empty">Connexion requise pour le premier chargement du texte.</div>';return;}
  // Chaque page est rendue individuellement (ses notes de bas de page restent
  // près de leur texte) puis tout est enchaîné en un seul flux de lecture.
  const html=_citadelleText.pages
    .filter(p=>(p.text||'').trim())
    .map(p=>renderCitadelleMarkdown(p.text))
    .join('');
  bd.innerHTML=`<div class="book-chapter book-md book-read">${html}
    <div class="book-src">Hisn al-Muslim — La Citadelle du Musulman · Sa'îd Ibn 'Alî Ibn Wahf Al-Qahtânî · texte intégral</div></div>`;
  foldToc(bd);
  bd.scrollTop=0;
}

/* Le sommaire de la Citadelle fait 133 lignes réparties sur cinq pages :
   laissé à plat, il faut le faire défiler entièrement avant d'atteindre le
   texte. On replie donc tout le bloc dans un <details> fermé par défaut. */
function foldToc(bd){
  const rows=bd.querySelectorAll('.book-toc-row');
  if(rows.length<8)return;                     // pas un vrai sommaire
  /* Quelques intitulés du sommaire diffèrent de ceux du corps du livre
     (l'original n'est pas homogène) : sans titre correspondant, la ligne
     redevient du texte simple plutôt que d'afficher un lien qui ne mène
     nulle part. */
  rows.forEach(r=>{
    const id=r.dataset.goto;
    if(id&&!bd.querySelector(`#${CSS.escape(id)}`)){
      delete r.dataset.goto;
      r.removeAttribute('role');
      r.removeAttribute('tabindex');
    }
  });
  const first=rows[0],last=rows[rows.length-1];
  const det=document.createElement('details');
  det.className='book-toc-fold';
  det.innerHTML=`<summary class="book-toc-sum">Table des matières<span class="book-toc-count">${rows.length} sections</span></summary>`;
  const box=document.createElement('div');
  box.className='book-toc-box';
  first.parentNode.insertBefore(det,first);
  // Déplace la plage first…last (les lignes sont des frères adjacents une
  // fois les pages concaténées) à l'intérieur du dépliant.
  let node=first;
  while(node){
    const next=node.nextSibling;
    box.appendChild(node);
    if(node===last)break;
    node=next;
  }
  det.appendChild(box);
}

/* Clic sur une ligne de sommaire → défilement jusqu'au titre correspondant.
   `scrollIntoView` ne convient pas ici : il remonte jusqu'au <body>, dont
   l'`overflow:hidden` bloque le défilement. On positionne donc directement
   le conteneur (#book-bd) à partir de l'écart mesuré entre les deux. */
function gotoAnchor(bd,id){
  const target=bd.querySelector(`#${CSS.escape(id)}`);
  if(!target)return false;
  const fold=bd.querySelector('.book-toc-fold');
  if(fold)fold.open=false;                     // referme le sommaire derrière soi
  void bd.offsetHeight;                        // le repli change la hauteur : on remesure après
  const delta=target.getBoundingClientRect().top-bd.getBoundingClientRect().top;
  /* Saut instantané : le livre fait ~140 000 px de haut, un défilement animé
     sur une telle distance est long et désorientant. Le surlignage bref du
     titre atteint suffit à situer l'arrivée. */
  bd.scrollTo({top:Math.max(0,bd.scrollTop+delta-10),behavior:'auto'});
  target.classList.remove('book-md-flash');
  void target.offsetWidth;                     // relance l'animation
  target.classList.add('book-md-flash');
  return true;
}

/* Petit rendu Markdown maison — juste ce dont la Citadelle a besoin :
   #/##/### pour les titres, **gras**, *italique*, listes -, séparateurs ---.
   L'arabe est enveloppé en RTL quand une ligne contient uniquement de l'arabe. */
function renderCitadelleMarkdown(md){
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const inline=s=>esc(s)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\[\^([^\]]+)\]/g,'<sup class="book-fn-ref">$1</sup>') // renvoi de note
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>'); // lien [texte](url)
  const isArabic=s=>/[\u0600-\u06FF]/.test(s)&&!/[A-Za-z\u00C0-\u00FF]{2,}/.test(s);
  /* Sigles honorifiques : ligatures (\uFDFA \uFDFB \uFDF2, U+FDF2/FDFA/FDFB) et signes
     combinants isol\u00E9s (\u0610\u2026\u061A, U+0610-061A). Rendus minuscules par d\u00E9faut \u2014
     la cellule qui n'en contient qu'un est agrandie. */
  const isHonorific=s=>/^[\u0610-\u061A\uFDF2\uFDFA\uFDFB\s]+$/.test(s)&&!!s.trim();
  /* Ancre stable partag\u00E9e par un titre et sa ligne de sommaire : on retire
     la num\u00E9rotation de t\u00EAte (absente c\u00F4t\u00E9 sommaire, pr\u00E9sente c\u00F4t\u00E9 titre) et
     les accents, ce qui fait converger \u00AB 3. L'invocation\u2026 \u00BB et
     \u00AB L'invocation\u2026 \u00BB vers la m\u00EAme cl\u00E9. */
  const slug=s=>('c-'+s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036F]/g,'')
    .replace(/\[\^[^\]]*\]/g,'')       // renvois de note ([^24]) pr\u00E9sents c\u00F4t\u00E9 titre seulement
    .replace(/^\d+\s*(\([^)]*\))?\s*[.\-\u2013\u2014]?\s*/,'')  // num\u00E9rotation de t\u00EAte : \u00AB 12. \u00BB, \u00AB 37 \u00BB, \u00AB 77(bis). \u00BB
    .replace(/\s*\d+\s*$/,'')          // num\u00E9ro de page coll\u00E9 en fin (artefact d'oc\u00E9risation)
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,60)).replace(/-+$/,'');   // re-rogne si la coupe tombe sur un tiret
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
      t+=body.map(r=>'<tr>'+r.map(c=>{
        if(isHonorific(c))return `<td class="book-td-hon" dir="rtl" lang="ar">${inline(c)}</td>`;
        const ar=isArabic(c);
        return `<td${ar?' dir="rtl" lang="ar"':''}>${inline(c)}</td>`;
      }).join('')+'</tr>').join('');
      out.push(t+'</tbody></table>');continue;
    }
    if(/^#{1,6}\s+/.test(s)){
      closeList();
      const m=s.match(/^(#{1,6})\s+(.*)$/);
      const lvl=Math.min(m[1].length+1,6); // # -> h2 (h1 reserve au header du livre)
      out.push(`<h${lvl} id="${slug(m[2])}" class="book-md-h${lvl}">${inline(m[2])}</h${lvl}>`);continue;
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
      out.push(`<div class="book-toc-row" role="link" tabindex="0" data-goto="${slug(toc[2])}">${num}<span class="book-toc-t">${inline(toc[2])}</span><span class="book-toc-lead" aria-hidden="true"></span><span class="book-toc-p">${toc[3]}</span></div>`);continue;
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
  if(!_asma){
    $('book-bd').innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement des noms…</div>';
    try{await loadAsma();}
    catch{$('book-bd').innerHTML='<div class="places-empty">Connexion requise pour le premier chargement.</div>';return;}
  }
  renderNames(filter);
}
/* Récitation d'un nom : fichiers locaux books/asma-audio/{af}.mp3, où `af`
   (dans asma.json) est du type "001_ar-rahman" — triés par numéro, nom lisible.
   Récitations issues du dépôt MIT MohammedAbidNafi/99-Names-of-Allah (cf.
   `audioSource`), converties en MP3. Locaux = hors-ligne + cache SW. */
function asmaAudioSrc(n){
  const nm=_asma&&_asma.names.find(x=>x.n===n);
  return `books/asma-audio/${(nm&&nm.af)||String(n).padStart(3,'0')}.mp3`;
}
let _asmaAudio=null,_asmaPlaying=null;   // null = rien en lecture (n=0 = Allah, donc pas 0 comme sentinelle)
function playName(n,card){
  if(!_asmaAudio){_asmaAudio=new Audio();}
  stopNasheed();                         // une seule source à la fois
  document.querySelectorAll('.asma-card.playing').forEach(c=>c.classList.remove('playing'));
  // reclic sur le nom en cours → stop
  if(_asmaPlaying===n&&!_asmaAudio.paused){_asmaAudio.pause();_asmaPlaying=null;return;}
  _asmaAudio.src=asmaAudioSrc(n);_asmaPlaying=n;
  card.classList.add('playing');
  _asmaAudio.onended=()=>{card.classList.remove('playing');_asmaPlaying=null;};
  _asmaAudio.onerror=()=>{card.classList.remove('playing');_asmaPlaying=null;toast('Récitation de ce nom bientôt disponible 🎧');};
  _asmaAudio.play().catch(()=>{});
}

/* ── Anachid des 99 Noms : lecture continue du chant ──
   Objet Audio persistant (hors DOM) : filtrer la liste re-render la bannière
   sans interrompre la lecture ; l'icône est restaurée depuis `_nasheedOn`. */
const NASHEED_SRC='books/asma-audio/nasheed-99-noms.mp3';
let _nasheedAudio=null,_nasheedOn=false;
function stopNasheed(){
  if(_nasheedAudio&&!_nasheedAudio.paused)_nasheedAudio.pause();
  _nasheedOn=false;
  document.querySelectorAll('.asma-nasheed.playing').forEach(b=>b.classList.remove('playing'));
}
function toggleNasheed(banner){
  if(!_nasheedAudio){_nasheedAudio=new Audio(NASHEED_SRC);
    _nasheedAudio.onended=()=>{_nasheedOn=false;document.querySelectorAll('.asma-nasheed.playing').forEach(b=>b.classList.remove('playing'));};
    _nasheedAudio.onerror=()=>{_nasheedOn=false;banner.classList.remove('playing');toast('Anachid indisponible 🎧');};
  }
  if(_nasheedOn){stopNasheed();return;}
  if(_asmaAudio&&!_asmaAudio.paused){_asmaAudio.pause();_asmaPlaying=null;
    document.querySelectorAll('.asma-card.playing').forEach(c=>c.classList.remove('playing'));}
  _nasheedOn=true;banner.classList.add('playing');
  _nasheedAudio.play().catch(()=>{_nasheedOn=false;banner.classList.remove('playing');});
}

function nasheedBanner(){
  return `<div class="asma-nasheed${_nasheedOn?' playing':''}" role="button" tabindex="0" aria-label="Écouter l'anachid des 99 Noms">
    <div class="asma-nasheed-ic">
      <svg class="ic-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <svg class="ic-stop" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
    </div>
    <div class="asma-nasheed-tx">
      <div class="asma-nasheed-t">Anachid des 99 Noms</div>
      <div class="asma-nasheed-s">Le chant en continu · récités dans l'ordre</div>
    </div>
    <div class="asma-nasheed-eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
  </div>`;
}
function bindNasheed(bd){
  const b=bd.querySelector('.asma-nasheed');
  if(!b)return;
  b.addEventListener('click',()=>toggleNasheed(b));
  b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleNasheed(b);}});
}
function renderNames(filter=''){
  const bd=$('book-bd');
  const f=filter.trim().toLowerCase();
  const items=_asma.names.filter(x=>!f||x.tr.toLowerCase().includes(f)||x.fr.toLowerCase().includes(f)||String(x.n)===f||x.ar.includes(filter.trim()));
  if(!items.length){bd.innerHTML=nasheedBanner()+'<div class="places-empty">Aucun nom trouvé.</div>';bindNasheed(bd);return;}
  bd.innerHTML=nasheedBanner()+`<div class="asma-list">${items.map(x=>`
    <div class="asma-card" data-n="${x.n}" role="button" tabindex="0" aria-label="Écouter ${x.tr}">
      <div class="asma-head">
        <div class="asma-n">${x.n||'★'}</div>
        <div class="asma-ar" lang="ar" dir="rtl">${x.ar}</div>
        <div class="asma-play" aria-hidden="true">
          <svg class="ic-play" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="ic-stop" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
        </div>
      </div>
      <div class="asma-tr">${x.tr}</div>
      <div class="asma-fr">${x.fr}</div>
      <div class="asma-desc">${x.desc}</div>
      ${asmaDetail(x)}
    </div>`).join('')}</div>`;
  // Un clic (ou Entrée) sur une carte joue la récitation — sauf si on
  // interagit avec le dépliant Invocation/Introspection.
  bd.querySelectorAll('.asma-card').forEach(card=>{
    const n=+card.dataset.n;
    card.addEventListener('click',e=>{if(e.target.closest('.asma-detail'))return;playName(n,card);});
    card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('.asma-detail')){e.preventDefault();playName(n,card);}});
  });
  bindNasheed(bd);
  bd.scrollTop=0;
}

/* Dépliant « Invocation & introspection » d'un nom (si présent dans asma.json).
   Fermé par défaut : la liste reste compacte, un clic ouvre le détail. */
function asmaDetail(x){
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  if(!x.inv&&!(x.intro&&x.intro.length))return'';
  let inner='';
  if(x.inv){
    inner+=`<div class="asma-sec-t">Invocation</div>`;
    if(x.inv.fr)inner+=`<p class="asma-inv-fr">${esc(x.inv.fr)}</p>`;
    if(x.inv.ar)inner+=`<p class="asma-inv-ar" lang="ar" dir="rtl">${esc(x.inv.ar)}</p>`;
    if(x.inv.tr)inner+=`<p class="asma-inv-tr">${esc(x.inv.tr)}</p>`;
  }
  if(x.intro&&x.intro.length){
    inner+=`<div class="asma-sec-t">Introspection</div><ul class="asma-intro">`+
      x.intro.map(q=>`<li>${esc(q)}</li>`).join('')+`</ul>`;
  }
  return `<details class="asma-detail"><summary class="asma-detail-sum">✦ Invocation &amp; introspection</summary><div class="asma-detail-bd">${inner}</div></details>`;
}

/* ── Apprendre : fiches pratiques lisibles en étapes courtes ── */
function openGuide(){
  _view='guide';
  const b=BOOKS[_current];
  setHeader({title:b.title,back:true});
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
  const btnFruits=$('btn-open-fruits');
  if(btnFruits)btnFruits.addEventListener('click',()=>openBook('fruits'));
  const btnSalat=$('btn-open-learn-salat');
  if(btnSalat)btnSalat.addEventListener('click',()=>openBook('salat'));
  const btnWudu=$('btn-open-learn-wudu');
  if(btnWudu)btnWudu.addEventListener('click',()=>openBook('wudu'));

  $('btn-book-back').addEventListener('click',()=>{
    stopNasheed();                       // couper le chant en quittant la vue
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

  // Sommaire cliquable (délégation : les lignes sont recréées à chaque rendu)
  const bd=$('book-bd');
  bd.addEventListener('click',e=>{
    const row=e.target.closest('.book-toc-row[data-goto]');
    if(!row)return;
    vib(12);
    gotoAnchor(bd,row.dataset.goto);
  });
  bd.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const row=e.target.closest('.book-toc-row[data-goto]');
    if(!row)return;
    e.preventDefault();vib(12);
    gotoAnchor(bd,row.dataset.goto);
  });
}
