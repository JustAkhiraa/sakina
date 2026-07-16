/* SAKINA — Lecteur du Coran : API Quran.com, coloration tajwid (heuristique),
   favoris, notes, traduction Hamidullah, reprise de lecture. */
import {S,save} from '../core/store.js';
import {toast,burst,openSheet,closeSheet} from '../core/ui.js';
import {SURAHS,JUZ_STARTS} from '../data/surahs.js';
import {toArabicNum} from '../lib/hijri.js';

const $=id=>document.getElementById(id);

let _surah=1,_verses=[],_transl={},_selAyah=null;
const _cache={};
let _loaded=false;

/* ── Audio : récitation Mishary Alafasy (CDN islamic.network, gratuit) ──
   L'API audio est indexée par numéro de verset global (1–6236). */
const AYAH_OFFSET=(()=>{
  const o=[0];
  SURAHS.forEach(s=>o.push(o[s.n-1]+s.v));
  return o; // o[n-1] = nombre de versets avant la sourate n
})();
const globalAyah=key=>{
  const[s,a]=key.split(':').map(Number);
  return AYAH_OFFSET[s-1]+a;
};
const _player=new Audio();
_player.preload='none';
let _playingKey=null;

function highlightPlaying(key){
  document.querySelectorAll('.qv-ayah.playing').forEach(e=>e.classList.remove('playing'));
  if(!key)return;
  const el=document.querySelector(`.qv-ayah[data-key="${key}"]`);
  if(el){
    el.classList.add('playing');
    el.scrollIntoView({block:'center',behavior:'smooth'});
  }
}

function updatePlayerPill(){
  const pill=$('quran-player');
  if(_playingKey){
    const[s,a]=_playingKey.split(':');
    pill.querySelector('span').textContent=`▶ ${SURAHS[s-1].fr} · verset ${a}`;
    pill.classList.add('show');
  }else{
    pill.classList.remove('show');
  }
}

function playVerse(key){
  _playingKey=key;
  _player.src=`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyah(key)}.mp3`;
  _player.play().catch(()=>{stopPlayback();toast('Lecture audio indisponible');});
  highlightPlaying(key);
  updatePlayerPill();
}

export function stopPlayback(){
  _player.pause();
  _player.removeAttribute('src');
  _playingKey=null;
  highlightPlaying(null);
  updatePlayerPill();
}

/* Fin d'un verset → verset suivant de la sourate (lecture continue) */
function onVerseEnded(){
  if(!_playingKey)return;
  const[s,a]=_playingKey.split(':').map(Number);
  if(s===_surah&&a<SURAHS[s-1].v)playVerse(`${s}:${a+1}`);
  else stopPlayback();
}

/* ── API ── */
async function fetchSurah(n){
  if(_cache[n])return _cache[n];
  const res=await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${n}`);
  if(!res.ok)throw new Error('API error');
  const data=await res.json();
  _cache[n]=data.verses;
  return data.verses;
}
async function fetchTranslation(n){
  try{
    // 136 = Muhammad Hamidullah (français)
    const res=await fetch(`https://api.quran.com/api/v4/quran/translations/136?chapter_number=${n}`);
    if(!res.ok)return{};
    const data=await res.json();
    const m={};
    data.translations.forEach((t,i)=>{m[t.verse_key||`${n}:${i+1}`]=t.text;});
    return m;
  }catch{return{};}
}

/* ── Tajwid (heuristique Unicode, sans altérer le texte) ── */
function applyTajwid(text){
  // Madd : voyelle brève suivie de sa lettre de prolongation
  text=text.replace(/([َُِ])([اوي])(?![ً-ِْ])/g,'$1<span class="tj-madd">$2</span>');
  // Ghunna : ن ou م portant une shadda
  text=text.replace(/([نم])(ّ)/g,'<span class="tj-ghunna">$1$2</span>');
  // Qalqala : ق ط ب ج د portant un soukoun
  text=text.replace(/([قطبجد])(ْ)/g,'<span class="tj-qalqala">$1$2</span>');
  // Ikhfa : ن soukoun suivi (après espace éventuel) d'une lettre d'ikhfa — sans insérer d'espace
  text=text.replace(/(نْ)(\s*)([ثجدذزسشصضطظفقك])/g,'<span class="tj-ikhfa">$1</span>$2$3');
  return text;
}

/* ── Rendu ── */
async function renderSurah(n){
  if(_playingKey)stopPlayback(); // changer de sourate arrête la récitation
  _surah=n;
  const surah=SURAHS[n-1];
  $('quran-surah-name').textContent=`${surah.ar} — ${surah.fr}`;
  $('quran-surah-info').textContent=`Sourate ${n} · ${surah.v} versets · ${surah.t==='Makki'?'La Mecque':'Médine'}`;
  $('quran-basmala').style.display=(n===9)?'none':'block';

  const loading=$('quran-loading'),errEl=$('quran-error'),versesEl=$('quran-verses');
  loading.style.display='block';errEl.style.display='none';versesEl.innerHTML='';

  try{
    const [verses,transl]=await Promise.all([fetchSurah(n),fetchTranslation(n)]);
    _verses=verses;_transl=transl;
    loading.style.display='none';
    renderVerses();
    S.quranLast={surah:n};save();
  }catch{
    loading.style.display='none';
    errEl.style.display='block';
  }
}

function renderVerses(){
  const el=$('quran-verses');el.innerHTML='';
  _verses.forEach(v=>{
    const ayahNum=parseInt(v.verse_key.split(':')[1]);
    const isFav=!!S.quranFavs[v.verse_key];
    const hasNote=!!S.quranNotes[v.verse_key];
    const span=document.createElement('span');
    span.className='qv-ayah';
    span.dataset.key=v.verse_key;
    span.innerHTML=`${applyTajwid(v.text_uthmani)}<span class="qv-num">${toArabicNum(ayahNum)}</span>${isFav?'<span class="tj-fav-mark">♥</span>':''}${hasNote?'<span class="tj-fav-mark" style="color:#68D391">✎</span>':''}`;
    span.addEventListener('click',e=>{e.stopPropagation();selectAyah(v.verse_key,span);});
    el.appendChild(span);
  });
}

/* ── Sélection ── */
function selectAyah(key,el){
  document.querySelectorAll('.qv-ayah.selected').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  _selAyah=key;
  $('verse-action-bar').classList.add('show');
  $('transl-panel').classList.remove('show');
}
function deselectAyah(){
  document.querySelectorAll('.qv-ayah.selected').forEach(e=>e.classList.remove('selected'));
  _selAyah=null;
  $('verse-action-bar').classList.remove('show');
  $('transl-panel').classList.remove('show');
}

/* ── Liste des sourates + Juz' ── */
function buildSurahList(filter=''){
  const bd=$('surah-list-bd');bd.innerHTML='';
  const f=filter.toLowerCase();
  SURAHS.filter(s=>!f||s.fr.toLowerCase().includes(f)||s.ar.includes(filter)||String(s.n).includes(filter))
    .forEach(s=>{
      const div=document.createElement('div');
      div.className='surah-item'+(s.n===_surah?' active-surah':'');
      div.innerHTML=`<div class="surah-num">${s.n}</div><div style="flex:1"><div class="surah-fr">${s.fr}</div><div class="surah-info">${s.v} versets</div></div><div class="surah-ar">${s.ar}</div><div class="surah-type ${s.t.toLowerCase()}">${s.t==='Makki'?'Makkî':'Madinî'}</div>`;
      div.addEventListener('click',()=>{
        closeSheet();
        $('quran-scroll').scrollTop=0;
        renderSurah(s.n);deselectAyah();
      });
      bd.appendChild(div);
    });
}
function buildJuzTabs(){
  const tabs=$('quran-tabs');tabs.innerHTML='';
  for(let i=1;i<=30;i++){
    const el=document.createElement('div');el.className='qtab';el.textContent=`Juz' ${i}`;
    el.addEventListener('click',()=>{
      closeSheet();
      $('quran-scroll').scrollTop=0;
      renderSurah(JUZ_STARTS[i-1]||1);
    });
    tabs.appendChild(el);
  }
}

/* ── Favoris & notes ── */
function buildBookmarks(){
  const fl=$('bk-favs-list');fl.innerHTML='';
  const favs=Object.values(S.quranFavs).sort((a,b)=>(b.ts||0)-(a.ts||0));
  if(!favs.length){
    fl.innerHTML='<div style="text-align:center;padding:32px;font-size:0.82rem;color:var(--t3);">Aucun favori</div>';
  }else{
    favs.forEach(f=>{
      const[s,a]=f.key.split(':');
      const div=document.createElement('div');div.className='bk-item';
      div.innerHTML=`<div class="bk-item-ref">Sourate ${s}, Verset ${a}</div><div class="bk-item-ar">${f.text}</div>`;
      div.addEventListener('click',()=>{closeSheet();renderSurah(parseInt(s));});
      fl.appendChild(div);
    });
  }
  const nl=$('bk-notes-list');nl.innerHTML='';
  const notes=Object.entries(S.quranNotes);
  if(!notes.length){
    nl.innerHTML='<div style="text-align:center;padding:32px;font-size:0.82rem;color:var(--t3);">Aucune note</div>';
  }else{
    notes.forEach(([key,txt])=>{
      const[s,a]=key.split(':');
      const v=_verses.find(x=>x.verse_key===key);
      const div=document.createElement('div');div.className='bk-item';
      div.innerHTML=`<div class="bk-item-ref">Sourate ${s}, Verset ${a}</div>${v?`<div class="bk-item-ar">${v.text_uthmani}</div>`:''}<div class="bk-item-note">✏️ ${txt}</div>`;
      div.addEventListener('click',()=>{closeSheet();renderSurah(parseInt(s));});
      nl.appendChild(div);
    });
  }
}

/* ── Init ── */
export function initQuran(){
  $('quran-scroll').addEventListener('click',deselectAyah);

  // Lecture audio
  _player.addEventListener('ended',onVerseEnded);
  $('vact-play').addEventListener('click',()=>{
    if(!_selAyah)return;
    playVerse(_selAyah);
    deselectAyah();
  });
  $('quran-player').addEventListener('click',stopPlayback);

  $('vact-transl').addEventListener('click',()=>{
    if(!_selAyah)return;
    const verse=_verses.find(v=>v.verse_key===_selAyah);
    if(!verse)return;
    const[s,a]=_selAyah.split(':');
    $('transl-ayah-ref').textContent=`Sourate ${s}, Verset ${a}`;
    $('transl-arabic').textContent=verse.text_uthmani;
    const tr=_transl[_selAyah]||'Traduction non disponible.';
    $('transl-text').textContent=tr.replace(/<[^>]+>/g,'');
    // La barre d'action masquait le panneau sur iPhone : on la retire pendant la lecture
    $('verse-action-bar').classList.remove('show');
    $('transl-panel').classList.add('show');
  });
  $('btn-close-transl').addEventListener('click',()=>{
    $('transl-panel').classList.remove('show');
    if(_selAyah)$('verse-action-bar').classList.add('show');
  });

  $('vact-fav').addEventListener('click',()=>{
    if(!_selAyah)return;
    if(S.quranFavs[_selAyah]){
      delete S.quranFavs[_selAyah];toast('❤️ Retiré des favoris');
    }else{
      const v=_verses.find(x=>x.verse_key===_selAyah);
      S.quranFavs[_selAyah]={key:_selAyah,text:v?.text_uthmani||'',surah:_surah,ts:Date.now()};
      toast('❤️ Ajouté aux favoris');burst();
    }
    save();renderVerses();deselectAyah();
  });

  $('vact-copy').addEventListener('click',()=>{
    if(!_selAyah)return;
    const v=_verses.find(x=>x.verse_key===_selAyah);
    if(!v)return;
    navigator.clipboard.writeText(`${v.text_uthmani}\n[${_selAyah}]`)
      .then(()=>toast('📋 Verset copié')).catch(()=>toast('Copie impossible'));
    deselectAyah();
  });

  $('vact-note').addEventListener('click',()=>{
    if(!_selAyah)return;
    const v=_verses.find(x=>x.verse_key===_selAyah);
    const[s,a]=_selAyah.split(':');
    $('note-sheet-title').textContent=`Note — S.${s}:${a}`;
    $('note-ayah-preview').textContent=v?.text_uthmani||'';
    $('note-textarea').value=S.quranNotes[_selAyah]||'';
    openSheet('sh-quran-note');
  });
  $('btn-save-note').addEventListener('click',()=>{
    if(!_selAyah)return;
    const txt=$('note-textarea').value.trim();
    if(txt){S.quranNotes[_selAyah]=txt;toast('✓ Note sauvegardée');}
    else{delete S.quranNotes[_selAyah];toast('Note supprimée');}
    save();renderVerses();closeSheet();deselectAyah();
  });

  $('btn-quran-list').addEventListener('click',()=>{
    buildSurahList();buildJuzTabs();
    $('surah-search').value='';
    openSheet('sh-quran-list');
  });
  $('surah-search').addEventListener('input',e=>buildSurahList(e.target.value));

  $('btn-quran-bookmarks').addEventListener('click',()=>{buildBookmarks();openSheet('sh-quran-bk');});
  $('bk-tab-fav').addEventListener('click',()=>{
    $('bk-tab-fav').classList.add('active');$('bk-tab-notes').classList.remove('active');
    $('bk-favs-list').style.display='';$('bk-notes-list').style.display='none';
  });
  $('bk-tab-notes').addEventListener('click',()=>{
    $('bk-tab-notes').classList.add('active');$('bk-tab-fav').classList.remove('active');
    $('bk-notes-list').style.display='';$('bk-favs-list').style.display='none';
  });

  $('btn-quran-retry').addEventListener('click',()=>renderSurah(_surah));
}

export function onQuranShow(){
  if(_loaded)return;
  _loaded=true;
  renderSurah(S.quranLast?.surah||1);
}
