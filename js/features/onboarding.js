/* SAKINA — Assistant de première configuration (bienvenue).
   Affiché une seule fois : apparence, méthode de calcul, position.
   Les utilisateurs migrés depuis l'ancienne app ne le voient pas. */
import {S,save,emit} from '../core/store.js';
import {toast} from '../core/ui.js';
import {vib} from '../core/audio.js';
import {THEMES,CALC_METHODS,MADHABS,LANGS} from '../data/catalog.js';
import {t,applyI18n} from '../lib/i18n.js';
import {applyTheme,buildBaseThemeGrid} from './settings.js';
import {renderPrayers,reverseGeocode,geocodeCity} from './salat.js';

const $=id=>document.getElementById(id);
const STEPS=4;
let _step=0;

function renderDots(){
  const box=$('ob-dots');box.innerHTML='';
  for(let i=0;i<STEPS;i++){
    const d=document.createElement('div');
    d.className='ob-dot'+(i===_step?' active':'');
    box.appendChild(d);
  }
}

function showStep(i){
  _step=Math.max(0,Math.min(STEPS-1,i));
  document.querySelectorAll('.ob-step').forEach(p=>{
    p.classList.toggle('active',parseInt(p.dataset.step)===_step);
  });
  renderDots();
  $('ob-back').style.display=_step===0?'none':'block';
  $('ob-back').textContent=t('ob.back');
  $('ob-skip').style.display=_step===3?'block':'none';
  $('ob-next').textContent=_step===0?t('ob.start'):(_step===STEPS-1?t('ob.letsgo'):t('ob.next'));
  updateScrollHint();
}

/* Signale qu'il y a du contenu plus bas (madhhab, format d'heure…) */
function updateScrollHint(){
  requestAnimationFrame(()=>{
    const panel=document.querySelector('.ob-step.active');
    const hint=$('ob-scroll-hint');
    if(!panel||!hint)return;
    const overflows=panel.scrollHeight>panel.clientHeight+12;
    hint.classList.toggle('show',overflows&&panel.scrollTop<20);
    if(overflows&&!panel._hintWired){
      panel._hintWired=true;
      panel.addEventListener('scroll',()=>{
        hint.classList.toggle('show',panel.scrollTop<20);
      },{passive:true});
    }
  });
}

/* ── Étape 0 : langue ── */
function buildLangGrid(){
  const grid=$('ob-lang-grid');grid.innerHTML='';
  LANGS.forEach(l=>{
    const el=document.createElement('div');
    el.className='chip'+(S.lang===l.code?' sel':'');
    el.style.cssText='margin:3px;display:inline-block;';
    el.textContent=`${l.flag} ${l.name}`;
    el.addEventListener('click',()=>{
      S.lang=l.code;save();applyI18n();buildLangGrid();showStep(_step);vib(16);
    });
    grid.appendChild(el);
  });
  grid.style.textAlign='center';
}

/* ── Étape 2 : madhhab ── */
function buildMadhabRow(){
  const row=$('ob-madhab-row');row.innerHTML='';
  MADHABS.forEach(m=>{
    const el=document.createElement('div');
    el.className='chip'+(S.madhab===m.id?' sel':'');
    el.textContent=`${m.name}`;
    el.title=m.asrFactor===2?'Asr : ombre ×2':'Asr : ombre ×1';
    el.addEventListener('click',()=>{S.madhab=m.id;save();buildMadhabRow();vib(14);});
    row.appendChild(el);
  });
}

/* ── Étape 1 : apparence ── */
function buildAccentGrid(){
  const grid=$('ob-accent-grid');grid.innerHTML='';
  THEMES.forEach(t=>{
    const el=document.createElement('div');
    el.className='tsw'+(S.accent===t.key?' active':'');
    el.innerHTML=`<div class="sdot" style="background:${t.color}"></div><div class="sname">${t.name}</div>`;
    el.addEventListener('click',()=>{
      S.accent=t.key;save();applyTheme();buildAccentGrid();vib(18);
    });
    grid.appendChild(el);
  });
}

/* ── Étape 2 : méthode de calcul ── */
function buildMethodList(){
  const list=$('ob-method-list');list.innerHTML='';
  CALC_METHODS.forEach(m=>{
    const row=document.createElement('div');
    row.className='ob-method-row'+(S.calcMethod===m.id?' sel':'');
    row.innerHTML=`<div class="ob-method-radio"></div><div style="flex:1"><div class="ob-method-name">${m.name}</div><div class="ob-method-desc">${m.desc}</div></div>`;
    row.addEventListener('click',()=>{
      S.calcMethod=m.id;save();buildMethodList();vib(16);
    });
    list.appendChild(row);
  });
}
function syncFmtSeg(){
  document.querySelectorAll('#ob-fmt-seg .seg-opt').forEach(o=>{
    o.classList.toggle('active',o.dataset.fmt===S.hourFmt);
  });
}

/* ── Étape 3 : position ── */
function wireLocation(){
  $('ob-gps').addEventListener('click',()=>{
    const st=$('ob-loc-status');
    if(!navigator.geolocation){st.textContent='✗ Géolocalisation non disponible sur cet appareil';return;}
    st.textContent='⟳ Détection en cours…';
    navigator.geolocation.getCurrentPosition(
      async pos=>{
        S.lat=pos.coords.latitude;S.lon=pos.coords.longitude;
        S.city=await reverseGeocode(S.lat,S.lon);
        save();emit('location-changed');
        st.textContent=`✓ ${S.city||'Position détectée'}`;
        vib([40,20,40]);
      },
      ()=>{st.textContent='✗ GPS refusé — cherchez votre ville ci-dessous';},
      {enableHighAccuracy:true,timeout:10000,maximumAge:300000}
    );
  });

  let t=null;
  $('ob-city-inp').addEventListener('input',e=>{
    clearTimeout(t);
    t=setTimeout(async()=>{
      const q=e.target.value;
      const box=$('ob-city-results');
      if(!q.trim()){box.innerHTML='';return;}
      box.innerHTML='<div style="font-size:0.75rem;color:var(--t3);padding:8px 0;">Recherche…</div>';
      try{
        const items=await geocodeCity(q);
        box.innerHTML='';
        if(!items.length){box.innerHTML='<div style="font-size:0.75rem;color:var(--t3);padding:8px 0;">Aucun résultat</div>';return;}
        items.forEach(it=>{
          const div=document.createElement('div');div.className='city-result';
          const name=it.display_name.split(',')[0];
          div.innerHTML=`${name}<div class="city-result-sub">${it.display_name}</div>`;
          div.addEventListener('click',()=>{
            S.lat=parseFloat(it.lat);S.lon=parseFloat(it.lon);S.city=name;
            save();emit('location-changed');
            box.innerHTML='';
            $('ob-city-inp').value=name;
            $('ob-loc-status').textContent=`✓ ${name}`;
            vib([40,20,40]);
          });
          box.appendChild(div);
        });
      }catch{
        box.innerHTML='<div style="font-size:0.75rem;color:var(--t3);padding:8px 0;">Erreur réseau</div>';
      }
    },450);
  });
}

/* ── Fin ── */
function finish(){
  S.onboarded=true;save();
  if(S.lat!==null)renderPrayers();
  const ob=$('onboard');
  ob.classList.add('hidden');
  setTimeout(()=>ob.remove(),500);
  toast('✦ Bienvenue sur Sakina');
  vib([50,30,50]);
}

export function initOnboarding(){
  const ob=$('onboard');
  if(!ob)return;
  if(S.onboarded){ob.remove();return;}

  buildLangGrid();
  buildAccentGrid();
  buildBaseThemeGrid('ob-base-theme-grid');
  buildMethodList();
  buildMadhabRow();
  syncFmtSeg();
  wireLocation();
  showStep(0);

  document.querySelectorAll('#ob-fmt-seg .seg-opt').forEach(opt=>{
    opt.addEventListener('click',()=>{
      S.hourFmt=opt.dataset.fmt;
      save();syncFmtSeg();vib(16);
      // Synchronise aussi le sélecteur de la page Réglages
      document.querySelectorAll('#fmt-seg .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.fmt===S.hourFmt));
    });
  });

  $('ob-next').addEventListener('click',()=>{
    if(_step===STEPS-1){finish();return;}
    showStep(_step+1);vib(14);
  });
  $('ob-back').addEventListener('click',()=>{showStep(_step-1);vib(14);});
  $('ob-skip').addEventListener('click',finish);
}
