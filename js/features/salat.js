/* SAKINA — Horaires de prière : calculs précis, compte à rebours auto-rafraîchi,
   géolocalisation GPS + recherche manuelle de ville. */
import {S,save,emit} from '../core/store.js';
import {toast,openSheet,closeSheet} from '../core/ui.js';
import {computeTimes,fmtTime} from '../lib/astro.js';
import {toHijri,hijriLabelAr} from '../lib/hijri.js';
import {CALC_METHODS,MADHABS,CALC_BY_COUNTRY} from '../data/catalog.js';
import {t} from '../lib/i18n.js';

const $=id=>document.getElementById(id);
let _cdI=null;

const methodById=id=>CALC_METHODS.find(m=>m.id===id)||CALC_METHODS[0];
const asrFactor=()=>(MADHABS.find(m=>m.id===S.madhab)||MADHABS[0]).asrFactor;

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
  const today=computeTimes(S.lat,S.lon,now,m,asrFactor());
  for(const p of PRAYER_DEFS){
    const hr=today[p.key];
    if(hr!==null){
      const dt=timeToDate(now,hr);
      if(dt>now)return{...p,at:dt,today:true};
    }
  }
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const t2=computeTimes(S.lat,S.lon,tomorrow,m,asrFactor());
  if(t2.fajr!==null)return{...PRAYER_DEFS[0],at:timeToDate(tomorrow,t2.fajr),today:false};
  return null;
}

/* Prochaines prières à partir de `now`, sur plusieurs jours.
   Exposé pour les rappels, qui ont besoin de programmer à l'avance. */
export function upcomingPrayers(now=new Date(),days=2){
  if(S.lat===null)return[];
  const m=methodById(S.calcMethod),f=asrFactor(),out=[];
  for(let d=0;d<days;d++){
    const day=new Date(now);day.setDate(day.getDate()+d);
    const T=computeTimes(S.lat,S.lon,day,m,f);
    for(const p of PRAYER_DEFS){
      const hr=T[p.key];
      if(hr===null)continue;
      const at=timeToDate(day,hr);
      if(at>now)out.push({key:p.key,name:p.name,arabic:p.arabic,at});
    }
  }
  return out.sort((a,b)=>a.at-b.at);
}

export function renderPrayers(){
  if(S.lat===null)return;
  const now=new Date();
  const m=methodById(S.calcMethod);
  const T=computeTimes(S.lat,S.lon,now,m,asrFactor());

  $('hijri-date').textContent=hijriLabelAr(toHijri(now));
  $('greg-date').textContent=now.toLocaleDateString(S.lang||'fr',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('salat-sub').textContent=S.city||`${S.lat.toFixed(2)}°, ${S.lon.toFixed(2)}°`;
  $('loc-txt').textContent=S.city||t('salat.located');
  $('calc-name').textContent=m.name;

  const next=findNext(now);
  const grid=$('prayers-grid');grid.innerHTML='';
  PRAYER_DEFS.forEach(p=>{
    const hr=T[p.key];
    const isNext=next&&next.today&&p.key===next.key;
    const isPast=!isNext&&hr!==null&&timeToDate(now,hr)<now;
    const div=document.createElement('div');
    div.className='pcard gc'+(isNext?' next':'')+(isPast?' passed':'');
    div.innerHTML=`<div class="pc-name">${p.name}</div><div class="pc-ar">${p.arabic}</div><div class="pc-time">${fmtTime(hr,S.hourFmt)}</div>`;
    grid.appendChild(div);
  });

  $('ramadan-row').innerHTML=
    `<div class="row" style="cursor:default"><div class="row-ic">⭐</div><div class="row-body"><div class="row-name">${t('salat.imsak')}</div><div class="row-sub">${t('salat.imsakSub')}</div></div><div class="row-right gold">${fmtTime(T.imsak,S.hourFmt)}</div></div>
     <div class="row" style="cursor:default"><div class="row-ic">🌅</div><div class="row-body"><div class="row-name">${t('salat.sunrise')}</div><div class="row-sub">${t('salat.sunriseSub')}</div></div><div class="row-right gold">${fmtTime(T.sunrise,S.hourFmt)}</div></div>
     <div class="row" style="cursor:default;border-bottom:none"><div class="row-ic">🌙</div><div class="row-body"><div class="row-name">${t('salat.iftar')}</div><div class="row-sub">${t('salat.iftarSub')}</div></div><div class="row-right gold">${fmtTime(T.maghrib,S.hourFmt)}</div></div>`;

  // Compte à rebours — se re-rend seul quand la prière passe ou que le jour change
  if(_cdI)clearInterval(_cdI);
  let target=next;
  const tick=()=>{
    const n=new Date();
    if(!target||target.at<=n){renderPrayers();return;}
    const diff=Math.floor((target.at-n)/1000);
    const h=Math.floor(diff/3600),mi=Math.floor((diff%3600)/60),s=diff%60;
    $('next-name').textContent=target.today?target.name.toUpperCase():t('salat.tomorrow');
    $('next-cd').textContent=`${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  tick();
  _cdI=setInterval(tick,1000);
}

/* ── Localisation ── */
export async function reverseGeocode(lat,lon){
  try{
    const res=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`);
    const d=await res.json();
    const a=d.address||{};
    return{
      city:a.city||a.town||a.village||a.municipality||'',
      country:(a.country_code||'').toLowerCase(),
    };
  }catch{return{city:'',country:''};}
}

/* Méthode de calcul selon le pays détecté. Peu d'utilisateurs savent laquelle
   choisir ; le mauvais réglage décale surtout Fajr et Icha de plusieurs
   minutes. On ne l'applique qu'une fois, tant que l'utilisateur n'a pas
   choisi lui-même. */
function autoCalcMethod(country){
  if(!country||S.calcMethodPicked)return false;
  const id=CALC_BY_COUNTRY[country];
  if(id===undefined||id===S.calcMethod)return false;
  S.calcMethod=id;
  return true;
}

export async function geocodeCity(q){
  const res=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&accept-language=fr`);
  return res.json();
}

export function requestGPS(){
  if(!navigator.geolocation){toast(t('salat.noGeo'));return;}
  $('loc-txt').textContent=t('salat.detecting');
  navigator.geolocation.getCurrentPosition(
    async pos=>{
      S.lat=pos.coords.latitude;S.lon=pos.coords.longitude;
      const loc=await reverseGeocode(S.lat,S.lon);
      S.city=loc.city;
      const auto=autoCalcMethod(loc.country);
      save();renderPrayers();emit('location-changed');
      if(auto)toast(`📍 ${S.city||t('salat.located')} · ${methodById(S.calcMethod).name}`);
      else toast(S.city?`📍 ${S.city}`:`📍 ${t('salat.located')}`);
    },
    ()=>{
      $('loc-txt').textContent=t('salat.pickLoc');
      toast(t('salat.gpsDenied'));
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
    const items=await geocodeCity(q);
    box.innerHTML='';
    if(!items.length){box.innerHTML=`<div style="font-size:0.75rem;color:var(--t3);padding:10px 0;">${t('com.noResult')}</div>`;return;}
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
    box.innerHTML=`<div style="font-size:0.75rem;color:var(--t3);padding:10px 0;">${t('msg.netError')}</div>`;
  }
}

/* ── Méthodes de calcul ── */
function buildCalcMethods(){
  const bd=$('calc-bd');bd.innerHTML='';
  CALC_METHODS.forEach(m=>{
    const div=document.createElement('div');div.className='row';
    div.innerHTML=`<div class="row-ic">🕌</div><div class="row-body"><div class="row-name">${m.name}</div><div class="row-sub">${m.desc}</div></div>${S.calcMethod===m.id?'<svg width="18" height="18" fill="none" stroke="var(--a)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>':''}`;
    div.addEventListener('click',()=>{
      S.calcMethod=m.id;S.calcMethodPicked=true;  // choix explicite : l'auto ne l'écrase plus
      $('calc-name').textContent=m.name;
      save();if(S.lat!==null)renderPrayers();
      closeSheet();toast(t('salat.methodIs',{name:m.name}));
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
  $('greg-date').textContent=now.toLocaleDateString(S.lang||'fr',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  if(S.lat!==null)renderPrayers();
}

export function onSalatShow(){
  if(S.lat===null)requestGPS();
}
