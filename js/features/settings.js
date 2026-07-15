/* SAKINA — Réglages : thème, accents, sons, préférences, stats, données */
import {S,save,streak,on} from '../core/store.js';
import {toast,confirmDlg} from '../core/ui.js';
import {playSound,vib} from '../core/audio.js';
import {THEMES,SOUNDS,QADA_PRAYERS} from '../data/catalog.js';
import {renderTasbih,buildDhikrBar} from './tasbih.js';
import {renderPrayers} from './salat.js';

const $=id=>document.getElementById(id);

export function applyTheme(){
  const root=document.documentElement;
  root.setAttribute('data-accent',S.accent);
  root.setAttribute('data-theme',S.lightMode?'light':'dark');
  root.setAttribute('data-night',S.nightMode?'true':'false');
  const bg=S.lightMode?'#F5F4F0':(S.nightMode?'#000000':'#08090C');
  const meta=$('theme-color-meta');
  if(meta)meta.content=bg;
  root.style.background=bg;
  // Synchronise les toggles et le segment de thème
  const map={soundOn:'tog-sound',vibOn:'tog-vib',autoLoop:'tog-loop',nightMode:'tog-night',screenLock:'tog-lock'};
  Object.entries(map).forEach(([k,id])=>{const el=$(id);if(el)el.classList.toggle('on',!!S[k]);});
  document.querySelectorAll('#theme-seg .seg-opt').forEach(o=>{
    o.classList.toggle('active',o.dataset.thm===(S.lightMode?'light':'dark'));
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
  SOUNDS.forEach(s=>{
    const el=document.createElement('div');
    el.className='si'+(S.sound===s.id?' active':'');
    el.innerHTML=`<div class="si-dot"></div><div style="flex:1"><div class="si-name">${s.name}</div><div class="si-desc">${s.desc}</div></div><div class="si-play">▶</div>`;
    el.addEventListener('click',()=>{S.sound=s.id;save();buildSoundList();playSound(s.id);vib(16);});
    el.querySelector('.si-play').addEventListener('click',e=>{e.stopPropagation();playSound(s.id);});
    list.appendChild(el);
  });
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

export function initSettings(){
  applyTheme();
  buildThemeGrid();
  buildSoundList();
  renderStats();
  on('stats-changed',renderStats);

  // Toggles de préférences
  const keyMap={'tog-sound':'soundOn','tog-vib':'vibOn','tog-loop':'autoLoop','tog-night':'nightMode','tog-lock':'screenLock'};
  Object.entries(keyMap).forEach(([id,key])=>{
    $(id).addEventListener('click',function(){
      S[key]=!S[key];this.classList.toggle('on',S[key]);save();
      if(key==='nightMode')applyTheme();
      if(key==='soundOn')toast(S[key]?'🔊 Son activé':'🔇 Son coupé');
      if(key==='vibOn'){vib(20);toast(S[key]?'📳 Vibration':'🔕 Vibration désactivée');}
      if(key==='screenLock')toast(S[key]?'🔒 Écran verrouillé':'🔓 Écran déverrouillé');
    });
  });

  // Thème clair/sombre — sélecteur scopé (bug v8 corrigé)
  document.querySelectorAll('#theme-seg .seg-opt').forEach(opt=>{
    opt.addEventListener('click',()=>{
      S.lightMode=(opt.dataset.thm==='light');
      save();applyTheme();vib(18);
      toast(S.lightMode?'☀️ Mode clair activé':'🌙 Mode sombre activé');
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
