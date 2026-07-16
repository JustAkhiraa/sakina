/* SAKINA — Réglages : thème, accents, sons, préférences, stats, données */
import {S,save,streak,on} from '../core/store.js';
import {toast,confirmDlg,openSheet,closeSheet} from '../core/ui.js';
import {playSound,vib} from '../core/audio.js';
import {THEMES,SOUNDS,QADA_PRAYERS,MADHABS,LANGS,BASE_THEMES} from '../data/catalog.js';
import {applyI18n} from '../lib/i18n.js';
import {renderTasbih,buildDhikrBar} from './tasbih.js';
import {renderPrayers} from './salat.js';

const $=id=>document.getElementById(id);

export function applyTheme(){
  const root=document.documentElement;
  const theme=BASE_THEMES.find(t=>t.id===S.baseTheme)||BASE_THEMES[0];
  root.setAttribute('data-accent',S.accent);
  root.setAttribute('data-theme',theme.id);
  root.setAttribute('data-night',(S.nightMode&&!theme.light)?'true':'false');
  if(theme.light)root.setAttribute('data-light-ui','');
  else root.removeAttribute('data-light-ui');

  const bg=(S.nightMode&&!theme.light)?'#000000':theme.swatch;
  const meta=$('theme-color-meta');
  if(meta)meta.content=bg;
  root.style.background=bg;
  // color-scheme dynamique : figé sur "dark", il laissait les zones système
  // (barre du bas, overscroll) noires même en thème clair
  root.style.colorScheme=theme.light?'light':'dark';
  const cs=document.querySelector('meta[name="color-scheme"]');
  if(cs)cs.content=theme.light?'light':'dark';

  const map={soundOn:'tog-sound',vibOn:'tog-vib',autoLoop:'tog-loop',nightMode:'tog-night'};
  Object.entries(map).forEach(([k,id])=>{const el=$(id);if(el)el.classList.toggle('on',!!S[k]);});
}

export function buildBaseThemeGrid(targetId='base-theme-grid'){
  const grid=$(targetId);
  if(!grid)return;
  grid.innerHTML='';
  BASE_THEMES.forEach(t=>{
    const el=document.createElement('div');
    el.className='tsw'+(S.baseTheme===t.id?' active':'');
    el.innerHTML=`<div class="sdot" style="background:${t.swatch};border-color:${t.light?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.25)'}"></div><div class="sname">${t.name}</div>`;
    el.addEventListener('click',()=>{
      S.baseTheme=t.id;S.lightMode=t.light;
      save();applyTheme();
      buildBaseThemeGrid('base-theme-grid');
      buildBaseThemeGrid('ob-base-theme-grid');
      vib(18);
    });
    grid.appendChild(el);
  });
}

function buildThemeGrid(){
  const grid=$('theme-grid');grid.innerHTML='';
  THEMES.forEach(t=>{
    const el=document.createElement('div');
    el.className='tsw'+(S.accent===t.key?' active':'');
    el.innerHTML=`<div class="sdot" style="background:${t.color}"></div><div class="sname">${t.name}</div>`;
    el.addEventListener('click',()=>{S.accent=t.key;save();applyTheme();buildThemeGrid();vib(18);});
    grid.appendChild(el);
  });
}

function buildSoundList(){
  const list=$('sound-list');list.innerHTML='';
  const grid=document.createElement('div');grid.className='sound-grid';
  SOUNDS.forEach(s=>{
    const el=document.createElement('div');
    el.className='sound-chip'+(S.sound===s.id?' active':'');
    el.title=s.desc;
    el.innerHTML=`<span class="sc-dot"></span>${s.name}`;
    el.addEventListener('click',()=>{S.sound=s.id;save();buildSoundList();playSound(s.id);vib(16);});
    grid.appendChild(el);
  });
  list.appendChild(grid);
}

const qdaTotal=()=>QADA_PRAYERS.reduce((s,p)=>s+(S.qada[p.key]||0),0);

export function renderStats(){
  const fmt=n=>n>9999?(n/1000).toFixed(1)+'k':n;
  $('st-total').textContent=fmt(S.allTime||0);
  $('st-sess').textContent=S.sessCount||0;
  $('st-streak').textContent=streak();
  $('st-qada').textContent=qdaTotal();
  $('prof-sub').textContent=`${S.sessCount||0} sessions · ${S.allTime||0} dhikrs · série de ${streak()} j`;
}

/* ── École juridique ── */
function buildMadhabList(){
  const list=document.getElementById('madhab-list');list.innerHTML='';
  MADHABS.forEach(m=>{
    const row=document.createElement('div');
    row.className='ob-method-row'+(S.madhab===m.id?' sel':'');
    row.innerHTML=`<div class="ob-method-radio"></div><div style="flex:1"><div class="ob-method-name">${m.name} <span style="font-family:var(--ff-a);color:var(--t2);font-weight:400;">${m.ar}</span></div><div class="ob-method-desc">${m.asrFactor===2?'Asr : ombre ×2 (plus tardif)':'Asr : ombre ×1 (majorité)'}</div></div>`;
    row.addEventListener('click',()=>{
      S.madhab=m.id;save();buildMadhabList();syncPracticeRows();
      if(S.lat!==null)renderPrayers();
      vib(16);toast(`École ${m.name.toLowerCase()}`);
    });
    list.appendChild(row);
  });
}

/* ── Langue ── */
function buildLangList(){
  const list=document.getElementById('lang-list');list.innerHTML='';
  LANGS.forEach(l=>{
    const row=document.createElement('div');
    row.className='ob-method-row'+(S.lang===l.code?' sel':'');
    row.innerHTML=`<div class="ob-method-radio"></div><div style="flex:1"><div class="ob-method-name">${l.flag} ${l.name}</div></div>`;
    row.addEventListener('click',()=>{
      S.lang=l.code;save();applyI18n();buildLangList();syncPracticeRows();vib(16);
    });
    list.appendChild(row);
  });
}

function syncPracticeRows(){
  const m=MADHABS.find(x=>x.id===S.madhab)||MADHABS[0];
  const l=LANGS.find(x=>x.code===S.lang)||LANGS[0];
  document.getElementById('madhab-current').textContent=`${m.name} · ${m.ar}`;
  document.getElementById('lang-current').textContent=`${l.flag} ${l.name}`;
}

export function initSettings(){
  applyTheme();
  applyI18n();
  buildBaseThemeGrid();
  buildThemeGrid();
  buildSoundList();
  renderStats();
  syncPracticeRows();
  on('stats-changed',renderStats);

  document.getElementById('btn-open-madhab').addEventListener('click',()=>openSheet('sh-madhab',buildMadhabList));
  document.getElementById('btn-open-lang').addEventListener('click',()=>openSheet('sh-lang',buildLangList));

  // Toggles de préférences
  const keyMap={'tog-sound':'soundOn','tog-vib':'vibOn','tog-loop':'autoLoop','tog-night':'nightMode'};
  Object.entries(keyMap).forEach(([id,key])=>{
    $(id).addEventListener('click',function(){
      S[key]=!S[key];this.classList.toggle('on',S[key]);save();
      if(key==='nightMode')applyTheme();
      if(key==='soundOn')toast(S[key]?'🔊 Son activé':'🔇 Son coupé');
      if(key==='vibOn'){vib(20);toast(S[key]?'📳 Vibration':'🔕 Vibration désactivée');}
    });
  });

  // Écriture des adhkâr : arabe / phonétique
  document.querySelectorAll('#translit-seg .seg-opt').forEach(opt=>{
    opt.classList.toggle('active',opt.dataset.tr===S.translit);
    opt.addEventListener('click',()=>{
      S.translit=opt.dataset.tr;
      document.querySelectorAll('#translit-seg .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.tr===S.translit));
      save();vib(14);
      toast(S.translit==='ph'?'abc Adhkâr en phonétique':'عربي Adhkâr en arabe');
    });
  });

  // Format 12H/24H — scopé et réellement appliqué aux horaires
  document.querySelectorAll('#fmt-seg .seg-opt').forEach(opt=>{
    opt.classList.toggle('active',opt.dataset.fmt===S.hourFmt);
    opt.addEventListener('click',()=>{
      S.hourFmt=opt.dataset.fmt;
      document.querySelectorAll('#fmt-seg .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.fmt===S.hourFmt));
      save();if(S.lat!==null)renderPrayers();
      toast(S.hourFmt==='12'?'Format 12H':'Format 24H');
    });
  });

  // Export JSON
  $('btn-export').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`sakina-donnees-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('📤 Exporté');
  });

  // Réinitialisation totale
  $('btn-reset-all').addEventListener('click',async()=>{
    if(!await confirmDlg('Tout effacer ? Compteurs, historique, qadâ\'. Action irréversible.',{okLabel:'Tout effacer'}))return;
    S.count=0;S.lapCount=0;S.sessTot=0;S.allTime=0;S.sessCount=0;
    S.history=[];S.daily={};
    QADA_PRAYERS.forEach(p=>{S.qada[p.key]=0;S.qdone[p.key]=0;});
    save();renderTasbih();buildDhikrBar();renderStats();
    toast('✓ Réinitialisé');vib([100,50,100]);
  });
}
