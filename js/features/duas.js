/* SAKINA — Invocations : catégories, recherche, copie, envoi vers le tasbih */
import {toast,openSheet,closeSheet,confirmDlg,esc} from '../core/ui.js';
import {t,tf,tfSrc,tfSrcLang} from '../lib/i18n.js';
import {DUAS} from '../data/duas.js';
import {LANGS} from '../data/catalog.js';
import {SURAHS} from '../data/surahs.js';
import {PHONETICS} from '../data/phonetics.js';
import {SURAH_NAMES} from '../data/surah-names.js';
import {setDhikr} from './tasbih.js';
import {startSeries} from './routines.js';
import {vib} from '../core/audio.js';
import {goPage} from '../core/router.js';
import {S,save} from '../core/store.js';
import {preloadTr,versesText,corpusReady} from './quran.js';
import {TR_BY_CODE} from '../data/translations.js';

const $=id=>document.getElementById(id);
let _cat='need';   // identifiant de catégorie, pas son libellé traduit

function arabicHtml(d){
  if(d.arabic_parts)return d.arabic_parts.map(p=>p.type==='pause'?`<span class="dua-pause">${p.text}</span>`:p.text).join(' ');
  return d.arabic||'';
}

function copyText(txt){
  navigator.clipboard.writeText(txt).then(()=>toast(t('duas.copied'))).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=txt;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');ta.remove();toast(t('duas.copied'));
  });
}

/* ── Sens de l'invocation ──
   Jamais de retraduction du francais, deux sources publiees seulement :

   · les huit invocations qui sont des versets servent le corpus coranique
     embarque dans la langue courante — Saheeh International en anglais,
     Ma Jian en chinois, Diyanet en turc —, exactement le texte qu'affiche
     le lecteur ;
   · les autres viennent de recueils de hadiths et servent une edition
     traduite de Hisn al-Muslim, relevee par scripts/hisn_extract.py.

   Sans l'une ni l'autre, on retombe sur le francais d'origine : mieux vaut
   un texte fiable dans une langue que le lecteur peut ignorer qu'un texte
   approximatif dans la sienne. */
export function duaTranslation(d){
  // L'arabe n'a pas de traduction a servir : le texte est deja au-dessus.
  // Lui montrer l'anglais serait absurde, et le compter comme une lacune
  // reviendrait a reclamer la traduction de l'arabe vers l'arabe.
  if((S.lang||'fr')==='ar')return '';
  if(d.verses&&TR_BY_CODE[S.lang]){
    const off=versesText(d.verses,S.lang);
    if(off)return off;
  }
  return tfSrc(`dut.${d.id}`,d.translation||'');
}

/* Langue reellement servie, pour la marquer quand ce n'est pas celle du
   lecteur. Quatre invocations n'existent dans aucune edition traduite
   (deux ne relevent pas de Hisn al-Muslim) : elles resteront en francais
   partout, autant le dire plutot que de laisser croire a un oubli. */
export function duaTranslationLang(d){
  if((S.lang||'fr')==='ar')return 'ar';
  if(d.verses&&TR_BY_CODE[S.lang]&&versesText(d.verses,S.lang))return S.lang;
  return tfSrcLang(`dut.${d.id}`);
}

/* ── Phonetique ──
   La romanisation savante — « Rabbi-shraḥ lī ṣadrī » — n'aide que qui lit
   l'alphabet latin. Elle est retranscrite dans cinq autres ecritures par
   scripts/duas_translit.py.

   Trois langues n'ont pas de ligne du tout, et c'est voulu : l'arabe, le
   persan et l'ourdou lisent deja l'ecriture du texte affiche au-dessus,
   une phonetique y serait la copie de l'original. */
const SANS_PHONETIQUE=new Set(['ar','fa','ur']);
export function duaPhonetic(d){
  const code=S.lang||'fr';
  if(SANS_PHONETIQUE.has(code))return '';
  return (PHONETICS[code]||{})[d.id]||d.phonetic||'';
}

/* L'italique de la romanisation signale un mot etranger dans un texte latin.
   Sur des katakana ou une devanagari elle n'apporte rien et deforme le
   trace : on ne la garde que pour les ecritures qui la connaissent. */
export const phoneticClass=()=>
  PHONETICS[S.lang]?'dua-ph dua-ph-script':'dua-ph';

/* ── Reference de la source ──
   Elle etait figee en francais — « Coran, Taha (20:25-28) », « Abu Dawud &
   Tirmidhi » — et s'affichait telle quelle sous une interface japonaise.
   On la recompose : le nom de sourate vient de SURAH_NAMES, deja traduit
   dans dix-sept langues, et les recueils d'un petit dictionnaire ferme.
   `ref` ne sert plus que de repli si la donnee n'est pas structuree. */
export function duaRef(d){
  const bouts=[];
  if(d.verses){
    const n=parseInt(d.verses,10);
    const s=SURAHS[n-1]||{};
    // SURAH_NAMES donne le sens du nom, traduit dans dix-sept langues.
    // L'arabe en est absent, et c'est normal : pour ce lecteur le nom de
    // la sourate est le nom arabe, pas sa traduction.
    const nom=S.lang==='ar'?(s.ar||'')
             :((SURAH_NAMES[S.lang]||[])[n-1]||s.fr||'');
    bouts.push(t('duas.refQuran',{s:nom,v:d.verses}));
  }
  const rec=(d.sources||[]).map(s=>t(`hds.${s}`));
  if(rec.length){
    const liste=rec.join(t('duas.refSep'));
    // Pour un verset, le recueil dit ou on le recite, pas d'ou il vient.
    bouts.push(d.srcHow==='recited'?t('duas.refRecited',{src:liste}):liste);
  }
  return bouts.length?bouts.join(t('duas.refSep')):(d.ref||'');
}

/* Etiquette de langue, vide quand la traduction est bien dans la langue lue. */
export function duaLangTag(d){
  const src=duaTranslationLang(d);
  if(src===(S.lang||'fr'))return '';
  const nom=(LANGS.find(l=>l.code===src)||{}).name||src.toUpperCase();
  return `<span class="dua-tr-lang" title="${t('duas.langFallback',{lang:nom})}">${src.toUpperCase()}</span>`;
}

/* Le corpus se charge une fois par langue, puis on redessine : le rendu
   reste synchrone, la traduction publiee arrive juste apres. */
let _trPending=null;
function ensureOfficialTr(after){
  const code=S.lang;
  if(!TR_BY_CODE[code]||corpusReady(code)||_trPending===code)return;
  _trPending=code;
  preloadTr(code).then(()=>{_trPending=null;if(S.lang===code)after();})
                 .catch(()=>{_trPending=null;});
}

/* Repli sur le texte français du corpus quand la clé n'existe pas. */
export const duaTitle=d=>tf(`dua.${d.id}.t`,d.title);
export const duaOcc  =d=>tf(`dua.${d.id}.o`,d.occasion);
export const duaCat  =d=>tf(`duacat.${d.catId}`,d.cat);

function buildCatBar(){
  const bar=$('cat-bar');bar.innerHTML='';
  // On distingue les catégories par leur identifiant, pas par leur libellé :
  // celui-ci change avec la langue, l'identifiant non.
  [...new Set(DUAS.map(d=>d.catId))].forEach(cid=>{
    const d=DUAS.find(x=>x.catId===cid);
    const el=document.createElement('div');
    el.className='cat-chip'+(cid===_cat?' active':'');
    el.textContent=duaCat(d);
    el.addEventListener('click',()=>{_cat=cid;buildCatBar();renderDuas();});
    bar.appendChild(el);
  });
}

function matches(d,q){
  q=q.toLowerCase();
  return [duaTitle(d),duaOcc(d),d.title,d.occasion,d.translation,duaTranslation(d)]
    .some(s=>(s||'').toLowerCase().includes(q));
}

function renderDuas(){
  ensureOfficialTr(renderDuas);
  const list=$('duas-list');list.innerHTML='';
  const items=DUAS.filter(d=>d.catId===_cat);
  items.forEach((d,i)=>{
    const arHtml=arabicHtml(d);
    const card=document.createElement('div');card.className='dua-card gc';
    card.innerHTML=`<div class="dua-head"><div class="dua-num">${i+1}</div><div style="flex:1"><div class="dua-title">${d.icon||'✦'} ${duaTitle(d)}</div><div class="dua-occ">${duaOcc(d)}</div></div><div class="dua-chev"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></div></div>
      <div class="dua-body"><div class="dua-ar">${arHtml}</div>${(ph=>ph?`<div class="${phoneticClass()}">${ph}</div>`:'')(duaPhonetic(d))}${(tr=>tr?`<div class="dua-tr">${tr}${duaLangTag(d)}</div>`:'')(duaTranslation(d))}<div class="dua-ref">📚 ${duaRef(d)}</div>
      <div class="dua-acts"><div class="dua-act dua-act-copy">${t('duas.copy')}</div><div class="dua-act dua-act-use">${t('duas.count')}</div></div></div>`;
    card.querySelector('.dua-head').addEventListener('click',()=>card.classList.toggle('open'));
    card.querySelector('.dua-act-copy').addEventListener('click',e=>{
      e.stopPropagation();
      copyText(arHtml.replace(/<[^>]+>/g,''));
    });
    card.querySelector('.dua-act-use').addEventListener('click',e=>{
      e.stopPropagation();
      setDhikr({title:duaTitle(d),src:`dua.${d.id}.t`,goal:33,reminder:33});
      goPage('page-tasbih');toast(`📿 ${duaTitle(d)}`);
    });
    list.appendChild(card);
  });
}

/* Point d'entrée de la recherche globale : ouvrir la recherche d'invocations
   déjà remplie, pour que le résultat s'affiche sans avoir à retaper. */
export function openDuaSearch(q=''){
  openSheet('sh-dsearch',()=>{
    const inp=$('dsearch-inp');
    inp.value=q;
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    setTimeout(()=>inp.focus(),400);
  });
}

function initSearch(){
  $('btn-dsearch').addEventListener('click',()=>openSheet('sh-dsearch',()=>{
    $('dsearch-inp').value='';$('dsearch-res').innerHTML='';
    setTimeout(()=>$('dsearch-inp').focus(),400);
  }));
  $('dsearch-inp').addEventListener('input',e=>{
    const q=e.target.value;
    const res=$('dsearch-res');res.innerHTML='';
    if(!q.trim())return;
    const items=DUAS.filter(d=>matches(d,q));
    if(!items.length){res.innerHTML=`<div style="text-align:center;padding:24px;font-size:0.82rem;color:var(--t3);">${t('com.noResult')}</div>`;return;}
    items.forEach(d=>{
      const arHtml=arabicHtml(d);
      const el=document.createElement('div');el.className='dua-card gc open';
      el.innerHTML=`<div class="dua-head"><div class="dua-num">✦</div><div style="flex:1"><div class="dua-title">${d.icon||''} ${duaTitle(d)}</div><div class="dua-occ">${duaCat(d)} · ${duaOcc(d)}</div></div></div>
        <div class="dua-body"><div class="dua-ar">${arHtml}</div>${(tr=>tr?`<div class="dua-tr">${tr}${duaLangTag(d)}</div>`:'')(duaTranslation(d))}<div class="dua-ref">📚 ${duaRef(d)}</div></div>`;
      res.appendChild(el);
    });
  });
}

/* Rebati les puces et les cartes apres un changement de langue. initDuas
   ne convient pas : il rebrancherait les ecouteurs de recherche a chaque
   fois, et ils s'empileraient. */
/* ── Series d'invocations ──

   Plusieurs series, chacune nommee. Les moments ne se ressemblent pas : le
   matin n'est pas le coucher, ni la maladie ; une seule serie obligerait a
   defaire pour refaire.

   S.duaSets = [{id, nom, ids:[...]}]. L'ancien S.duaSeries — un simple
   tableau d'identifiants — devient la premiere serie, pour ne rien perdre de
   ce qui avait ete compose. */
function sets(){
  if(!Array.isArray(S.duaSets)){
    const ancienne=Array.isArray(S.duaSeries)?S.duaSeries:[];
    S.duaSets=ancienne.length
      ?[{id:'s'+Date.now(),nom:t('serie.defaultName'),ids:ancienne}]
      :[];
    delete S.duaSeries;
    save();
  }
  return S.duaSets;
}
const setById=id=>sets().find(x=>x.id===id);
let _edit=null;          // identifiant de la serie en cours d'edition
let _brouillon=[];       // sa selection, avant enregistrement

/* ── Composition ── */
function brouillonToggle(id){
  const i=_brouillon.indexOf(id);
  if(i<0)_brouillon.push(id); else _brouillon.splice(i,1);
  buildComposer();vib(14);
}

/* Le choix est groupe par categorie : trente-sept lignes en vrac obligent a
   tout lire pour retrouver une invocation qu'on connait deja. Les categories
   existaient dans les donnees, elles ne servaient qu'au filtre du haut. */
function buildComposer(){
  const bd=$('serie-bd');if(!bd)return;
  bd.innerHTML='';
  $('serie-count').textContent=t('serie.count',{n:_brouillon.length});
  $('serie-save').disabled=!_brouillon.length;
  $('serie-del').hidden=!_edit;

  const parCat=new Map();
  DUAS.forEach(d=>{
    if(!parCat.has(d.catId))parCat.set(d.catId,[]);
    parCat.get(d.catId).push(d);
  });
  parCat.forEach((liste,cid)=>{
    const titre=document.createElement('div');
    titre.className='sl';titre.style.cssText='margin:14px 0 6px;';
    titre.textContent=duaCat(liste[0]);
    bd.appendChild(titre);
    const grp=document.createElement('div');
    grp.className='gc';grp.style.cssText='border-radius:var(--r-xl);overflow:hidden;';
    liste.forEach(x=>{
      const rang=_brouillon.indexOf(x.id);
      const row=document.createElement('div');
      row.className='row'+(rang>=0?' sel':'');
      row.innerHTML=`<div class="row-ic">${rang>=0?rang+1:(x.icon||'✦')}</div>`
        +`<div class="row-body"><div class="row-name">${duaTitle(x)}</div>`
        +`<div class="row-sub">${duaOcc(x)}</div></div>`
        +`<div class="serie-mark">${rang>=0?'✓':'+'}</div>`;
      row.addEventListener('click',()=>brouillonToggle(x.id));
      grp.appendChild(row);
    });
    bd.appendChild(grp);
  });
}

export function openComposer(id){
  _edit=id||null;
  const s0=_edit?setById(_edit):null;
  _brouillon=s0?s0.ids.slice():[];
  $('serie-nom').value=s0?s0.nom:'';
  $('serie-titre').textContent=_edit?t('serie.editTitle'):t('serie.newTitle');
  buildComposer();
  openSheet('sh-dua-serie');
}

function enregistre(){
  if(!_brouillon.length){toast(t('serie.empty'));return;}
  // Le champ limite la saisie a 40 caracteres, mais une donnee restauree
  // ou importee ne passe pas par le champ. On borne ici aussi.
  const nom=($('serie-nom').value||'').trim().slice(0,40)||t('serie.defaultName');
  const l=sets();
  if(_edit){
    const s0=setById(_edit);
    if(s0){s0.nom=nom;s0.ids=_brouillon.slice();}
  }else{
    l.push({id:'s'+Date.now(),nom,ids:_brouillon.slice()});
  }
  save();vib([20,40,20]);
  toast(t('serie.saved',{name:nom}));
  closeSheet();
  setTimeout(()=>{refreshSerieCard();openSeries();},240);
}

async function supprime(){
  if(!_edit)return;
  const s0=setById(_edit);
  if(!(await confirmDlg(t('serie.delAsk',{name:s0?s0.nom:''}),
                        {okLabel:t('serie.delOk')})))return;
  S.duaSets=sets().filter(x=>x.id!==_edit);
  save();closeSheet();refreshSerieCard();
  toast(t('serie.deleted'));
}

/* ── Liste des series enregistrees ── */
function buildSeries(){
  const bd=$('series-bd');if(!bd)return;
  bd.innerHTML='';
  const l=sets();
  if(!l.length){
    bd.innerHTML=`<div class="places-empty">${t('serie.none')}</div>`;
    return;
  }
  const grp=document.createElement('div');
  grp.className='gc';grp.style.cssText='border-radius:var(--r-xl);overflow:hidden;';
  l.forEach(s0=>{
    const noms=s0.ids.map(id=>DUAS.find(x=>x.id===id)).filter(Boolean).slice(0,2)
      .map(duaTitle).join(' · ');
    const row=document.createElement('div');
    row.className='row';
    row.innerHTML=`<div class="row-ic" style="color:var(--a);">✦</div>`
      +`<div class="row-body"><div class="row-name">${esc(s0.nom)}</div>`
      +`<div class="row-sub">${t('serie.count',{n:s0.ids.length})}`
      +`${noms?' · '+noms:''}</div></div>`
      +`<button class="serie-edit" data-edit="${s0.id}" aria-label="${t('serie.edit')}">`
      +`<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>`;
    row.addEventListener('click',e=>{
      const b=e.target.closest('[data-edit]');
      if(b){openSheet('sh-dua-serie');openComposer(b.dataset.edit);return;}
      lance(s0);
    });
    grp.appendChild(row);
  });
  bd.appendChild(grp);
}

export function openSeries(){buildSeries();openSheet('sh-dua-series');}

function lance(s0){
  const steps=s0.ids.map(id=>DUAS.find(x=>x.id===id)).filter(Boolean)
    .map(x=>({title:duaTitle(x),ar:arabicHtml(x),ph:duaPhonetic(x),
              count:1,note:duaOcc(x)}));
  if(!steps.length){toast(t('serie.empty'));return;}
  vib(18);closeSheet();
  setTimeout(()=>startSeries(steps,s0.nom),240);
}

/* ── La carte de la page Invocations ──
   Vide, elle invite. Composee, elle rappelle ce qu'on a bati et se lance d'un
   tap : l'investissement doit se voir, sinon rien ne ramene. */
function refreshSerieCard(){
  const carte=$('btn-dua-serie');
  if(!carte)return;
  const l=sets();
  const composee=l.length>0;

  carte.classList.toggle('composee',composee);
  $('serie-card-go').hidden=!composee;
  $('serie-card-edit').hidden=!composee;
  $('serie-card-chev').hidden=composee;

  if(composee){
    $('serie-card-t').textContent=l.length===1?l[0].nom:t('serie.mine');
    $('serie-card-s').textContent=l.length===1
      ? t('serie.count',{n:l[0].ids.length})
      : l.map(x=>x.nom).slice(0,3).join(' · ')+(l.length>3?'…':'');
    const routines=$('duas-routines-banner');
    if(routines&&carte.nextElementSibling!==routines)
      routines.parentNode.insertBefore(carte,routines);
  }else{
    $('serie-card-t').textContent=t('serie.compose');
    $('serie-card-s').textContent=t('serie.composeSub');
    const routines=$('duas-routines-banner');
    if(routines&&routines.nextElementSibling!==carte)
      routines.parentNode.insertBefore(carte,routines.nextSibling);
  }
}

export function refreshDuas(){
  refreshSerieCard();
  buildCatBar();
  renderDuas();
}

export function initDuas(){
  $('btn-dua-serie')?.addEventListener('click',e=>{
    const l=sets();
    // Le crayon ouvre la liste ; le reste lance — une serie unique part
    // directement, plusieurs series demandent laquelle.
    if(e.target.closest('#serie-card-edit')){openSeries();return;}
    if(!l.length){openComposer();return;}
    if(l.length===1){lance(l[0]);return;}
    openSeries();
  });
  $('serie-save')?.addEventListener('click',enregistre);
  $('serie-del')?.addEventListener('click',supprime);
  $('serie-new')?.addEventListener('click',()=>{closeSheet();setTimeout(()=>openComposer(),240);});
  refreshSerieCard();
  buildCatBar();
  renderDuas();
  initSearch();
}
