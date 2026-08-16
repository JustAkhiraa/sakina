/* SAKINA — Invocations : catégories, recherche, copie, envoi vers le tasbih */
import {toast,openSheet} from '../core/ui.js';
import {t,tf,tfSrc,tfSrcLang} from '../lib/i18n.js';
import {DUAS} from '../data/duas.js';
import {LANGS} from '../data/catalog.js';
import {SURAHS} from '../data/surahs.js';
import {PHONETICS} from '../data/phonetics.js';
import {SURAH_NAMES} from '../data/surah-names.js';
import {setDhikr} from './tasbih.js';
import {goPage} from '../core/router.js';
import {S} from '../core/store.js';
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
     traduite de Hisn al-Muslim, relevee par scripts/extract_hisn.py.

   Sans l'une ni l'autre, on retombe sur le francais d'origine : mieux vaut
   un texte fiable dans une langue que le lecteur peut ignorer qu'un texte
   approximatif dans la sienne. */
export function duaTranslation(d){
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
  if(d.verses&&TR_BY_CODE[S.lang]&&versesText(d.verses,S.lang))return S.lang;
  return tfSrcLang(`dut.${d.id}`);
}

/* ── Phonetique ──
   La romanisation savante — « Rabbi-shraḥ lī ṣadrī » — n'aide que qui lit
   l'alphabet latin. Elle est retranscrite dans cinq autres ecritures par
   scripts/translit.py.

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
      <div class="dua-body"><div class="dua-ar">${arHtml}</div>${(ph=>ph?`<div class="${phoneticClass()}">${ph}</div>`:'')(duaPhonetic(d))}<div class="dua-tr">${duaTranslation(d)}${duaLangTag(d)}</div><div class="dua-ref">📚 ${duaRef(d)}</div>
      <div class="dua-acts"><div class="dua-act dua-act-copy">${t('duas.copy')}</div><div class="dua-act dua-act-use">${t('duas.count')}</div></div></div>`;
    card.querySelector('.dua-head').addEventListener('click',()=>card.classList.toggle('open'));
    card.querySelector('.dua-act-copy').addEventListener('click',e=>{
      e.stopPropagation();
      copyText(arHtml.replace(/<[^>]+>/g,''));
    });
    card.querySelector('.dua-act-use').addEventListener('click',e=>{
      e.stopPropagation();
      setDhikr({title:duaTitle(d),goal:33,reminder:33});
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
        <div class="dua-body"><div class="dua-ar">${arHtml}</div><div class="dua-tr">${duaTranslation(d)}${duaLangTag(d)}</div><div class="dua-ref">📚 ${duaRef(d)}</div></div>`;
      res.appendChild(el);
    });
  });
}

/* Rebati les puces et les cartes apres un changement de langue. initDuas
   ne convient pas : il rebrancherait les ecouteurs de recherche a chaque
   fois, et ils s'empileraient. */
export function refreshDuas(){
  buildCatBar();
  renderDuas();
}

export function initDuas(){
  buildCatBar();
  renderDuas();
  initSearch();
}
