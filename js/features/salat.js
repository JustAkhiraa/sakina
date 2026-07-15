/* SAKINA — Horaires de prière : calculs précis, compte à rebours auto-rafraîchi,
   géolocalisation GPS + recherche manuelle de ville. */
import {S,save,emit} from '../core/store.js';
import {toast,openSheet,closeSheet} from '../core/ui.js';
import {computeTimes,fmtTime} from '../lib/astro.js';
import {toHijri,hijriLabelAr} from '../lib/hijri.js';
import {CALC_METHODS} from '../data/catalog.js';

const $=id=>document.getElementById(id);
let _cdI=null;

const methodById=id=>CALC_METHODS.find(m=>m.id===id)||CALC_METHODS[0];

const PRAYER_DEFS=[
  {key:'fajr',   name:'Fajr',   arabic:'الفجر'},
  {key:'dhuhr',  name:'Dhouhr', arabic:'الظهر'},
  {key:'asr',    name:'Asr',    arabic:'العصر'},
  {key:'maghrib',name:'Maghrib',arabic:'المغرب'},
  {key:'isha',   name:'Icha',   arabic:'العشاء'},
];

/* Date cible réelle d'un horaire décimal (gère minuit) */
function timeToDate(base,hours){
  const d=new Date(base);
  d.setHours(0,0,0,0);
  d.setTime(d.getTime()+hours*3600*1000);
  return d;
}

/* Prochaine prière : aujourd'hui, sinon Fajr de demain */
function findNext(now){
  const m=methodById(S.calcMethod);
  const today=computeTimes(S.lat,S.lon,now,m);
  for(const p of PRAYER_DEFS){
    const t=today[p.key];
    if(t!==null){
      const dt=timeToDate(now,t);
      if(dt>now)return{...p,at:dt,today:true};
    }
  }
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const t2=computeTimes(S.lat,S.lon,tomorrow,m);
  if(t2.fajr!==null)return{...PRAYER_DEFS[0],at:timeToDate(tomorrow,t2.fajr),today:false};
  return null;
}

export function renderPrayers(){
  if(S.lat===null)return;
  const now=new Date();
  const m=methodById(S.calcMethod);
  const T=computeTimes(S.lat,S.lon,now,m);

  $('hijri-date').textContent=hijriLabelAr(toHijri(now));
  $('greg-date').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('salat-sub').textContent=S.city||`${S.lat.toFixed(2)}°, ${S.lon.toFixed(2)}°`;
  $('loc-txt').textContent=S.city||'Position détectée';
  $('calc-name').textContent=m.name;

  const next=findNext(now);
  const grid=$('prayers-grid');grid.innerHTML='';
  PRAYER_DEFS.forEach(p=>{
    const t=T[p.key];
    const isNext=next&&next.today&&p.key===next.key;
    const isPast=!isNext&&t!==null&&timeToDate(now,t)<now;
    const div=document.createElement('div');
    div.className='pcard gc'+(isNext?' next':'')+(isPast?' passed':'');
    div.innerHTML=`<div class="pc-name">${p.name}</div><div class="pc-ar">${p.arabic}</div><div class="pc-time">${fmtTime(t,S.hourFmt)}</div>`;
    grid.appendChild(div);
  });

  $('ramadan-row').innerHTML=
    `<div class="row" style="cursor:default"><div class="row-ic">⭐</div><div class="row-body"><div class="row-name">Imsak (Suhoor)</div><div class="row-sub">Début du jeûne</div></div><div class="row-right gold">${fmtTime(T.imsak,S.hourFmt)}</div></div>
     <div class="row" style="cursor:default"><div class="row-ic">🌅</div><div class="row-body"><div class="row-name">Lever du Soleil</div><div class="row-sub">Fin de Fajr</div></div><div class="row-right gold">${fmtTime(T.sunrise,S.hourFmt)}</div></div>
     <div class="row" style="cursor:default;border-bottom:none"><div class="row-ic">🌙</div><div class="row-body"><div class="row-name">Iftar (Maghrib)</div><div class="row-sub">Rupture du jeûne</div></div><div class="row-right gold">${fmtTime(T.maghrib,S.hourFmt)}</div></div>`;

  // Compte à rebours — se re-rend seul quand la prière passe ou que le jour change
  if(_cdI)clearInterval(_cdI);
  let target=next;
  const tick=()=>{
    const n=new Date();
    if(!target||target.at<=n){renderPrayers();return;}
    const diff=Math.floor((target.at-n)/1000);
    const h=Math.floor(diff/3600),mi=Math.floor((diff%3600)/60),s=diff%60;
    $('next-name').textContent=target.today?target.name.toUpperCase():'FAJR (DEMAIN)';
    $('next-cd').textContent=`${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  tick();
  _cdI=setInterval(tick,1000);
}

/* ── Localisation ── */
async function reverseGeocode(lat,lon){
  try{
    const res=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`);
    const d=await res.json();
    return d.address?.city||d.address?.town||d.address?.village||d.address?.municipality||'';
  }catch{return'';}
}

export function requestGPS(){
  if(!navigator.geolocation){toast('Géolocalisation non disponible');return;}
  $('loc-txt').textContent='⟳ Détection en cours…';
  navigator.geolocation.getCurrentPosition(
    async pos=>{
      S.lat=pos.coords.latitude;S.lon=pos.coords.longitude;
      S.city=await reverseGeocode(S.lat,S.lon);
      save();renderPrayers();emit('location-changed');
      toast(S.city?`📍 ${S.city}`:'📍 Position détectée');
    },
    ()=>{
      $('loc-txt').textContent='Appuyer pour choisir ma position';
      toast('GPS refusé — cherchez votre ville manuellement');
      openSheet('sh-city');
    },
    {enableHighAccuracy:true,timeout:10000,maximumAge:300000}
  );
}

let _citySearchT=null;
async function searchCity(q){
  const box=$('city-results');
  if(!q.trim()){box.innerHTML='';return;}
  box.innerHTML='<div style="font-size:0.75rem;color:var(--t3);padding:10px 0;">Recherche…</div>';
  try{
    const res=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&accept-language=fr`);
    const items=await res.json();
    box.innerHTML='';
    if(!items.length){box.innerHTML='<div style="font-size:0.75rem;color:var(--t3);padding:10px 0;">Aucun résultat</div>';return;}
    items.forEach(it=>{
      const div=document.createElement('div');div.className='city-result';
      const name=it.display_name.split(',')[0];
      div.innerHTML=`${name}<div class="city-result-sub">${it.display_name}</div>`;
      div.addEventListener('click',()=>{
        S.lat=parseFloat(it.lat);S.lon=parseFloat(it.lon);S.city=name;
        save();closeSheet();renderPrayers();emit('location-changed');
        toast(`📍 ${name}`);
      });
      box.appendChild(div);
    });
  }catch{
    box.innerHTML='<div style="font-size:0.75rem;color:var(--t3);padding:10px 0;">Erreur réseau</div>';
  }
}

/* ── Méthodes de calcul ── */
function buildCalcMethods(){
  const bd=$('calc-bd');bd.innerHTML='';
  CALC_METHODS.forEach(m=>{
    const div=document.createElement('div');div.className='row';
    div.innerHTML=`<div class="row-ic">🕌</div><div class="row-body"><div class="row-name">${m.name}</div><div class="row-sub">${m.desc}</div></div>${S.calcMethod===m.id?'<svg width="18" height="18" fill="none" stroke="var(--a)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>':''}`;
    div.addEventListener('click',()=>{
      S.calcMethod=m.id;$('calc-name').textContent=m.name;
      save();if(S.lat!==null)renderPrayers();
      closeSheet();toast(`Méthode : ${m.name}`);
    });
    bd.appendChild(div);
  });
}

export function initSalat(){
  $('btn-locate').addEventListener('click',requestGPS);
  $('loc-bar').addEventListener('click',()=>{
    $('city-inp').value='';$('city-results').innerHTML='';
    openSheet('sh-city');
  });
  $('btn-gps').addEventListener('click',()=>{closeSheet();requestGPS();});
  $('city-inp').addEventListener('input',e=>{
    clearTimeout(_citySearchT);
    _citySearchT=setTimeout(()=>searchCity(e.target.value),450);
  });
  $('btn-calc').addEventListener('click',()=>openSheet('sh-calc',buildCalcMethods));

  // Affichage de la date même sans position
  const now=new Date();
  $('hijri-date').textContent=hijriLabelAr(toHijri(now));
  $('greg-date').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  if(S.lat!==null)renderPrayers();
}

export function onSalatShow(){
  if(S.lat===null)requestGPS();
}
