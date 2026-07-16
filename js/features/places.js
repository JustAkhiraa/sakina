/* SAKINA — Mosquées à proximité (OpenStreetMap/Overpass).
   Le volet « restaurants halal » a été retiré volontairement : afficher des
   adresses comme halal engagerait notre responsabilité — la sensibilisation
   se fait dans Vérif' Halal → Comprendre. */
import {S} from '../core/store.js';
import {toast,openSheet} from '../core/ui.js';
import {requestGPS} from './salat.js';

const $=id=>document.getElementById(id);
let _radius=5; // km

/* Instances publiques Overpass — bascule automatique si l'une est saturée */
const OVERPASS_ENDPOINTS=[
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

function distKm(lat1,lon1,lat2,lon2){
  const r=x=>x*Math.PI/180,R=6371;
  const a=Math.sin(r(lat2-lat1)/2)**2+Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(r(lon2-lon1)/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

const buildQuery=()=>`[out:json][timeout:25];(
  nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${_radius*1000},${S.lat},${S.lon});
);out center 40;`;

let _abort=null;
async function search(){
  const list=$('places-list');
  if(S.lat===null){
    list.innerHTML='<div class="places-empty">📍 Position requise — activez le GPS ou choisissez une ville dans l\'onglet Salat.</div>';
    return;
  }
  if(_abort)_abort.abort();
  _abort=new AbortController();
  const signal=_abort.signal;
  list.innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Recherche dans un rayon de '+_radius+' km…</div>';
  try{
    const body='data='+encodeURIComponent(buildQuery());
    let data=null;
    for(const endpoint of OVERPASS_ENDPOINTS){
      try{
        const res=await fetch(endpoint,{method:'POST',body,
          headers:{'Content-Type':'application/x-www-form-urlencoded'},signal});
        if(!res.ok)continue;
        data=await res.json();
        break;
      }catch(e){
        if(e.name==='AbortError')throw e;
      }
    }
    if(!data)throw new Error('all endpoints failed');

    const items=(data.elements||[]).map(e=>{
      const lat=e.lat??e.center?.lat,lon=e.lon??e.center?.lon;
      if(lat==null)return null;
      const t=e.tags||{};
      return{
        name:t.name||'Mosquée / salle de prière',
        lat,lon,
        dist:distKm(S.lat,S.lon,lat,lon),
        street:[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(' '),
      };
    }).filter(Boolean).sort((a,b)=>a.dist-b.dist);

    if(!items.length){
      list.innerHTML=`<div class="places-empty">Aucune mosquée référencée dans un rayon de ${_radius} km.<br>Essayez un rayon plus large — ou contribuez sur OpenStreetMap !</div>`;
      return;
    }
    list.innerHTML='';
    items.forEach(p=>{
      const el=document.createElement('a');
      el.className='place-row';
      el.href=`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`;
      el.target='_blank';el.rel='noopener';
      el.innerHTML=`<div class="place-ic">🕌</div>
        <div class="place-body">
          <div class="place-name">${p.name}</div>
          <div class="place-sub">${p.street||''}</div>
        </div>
        <div class="place-dist">${p.dist<1?Math.round(p.dist*1000)+' m':p.dist.toFixed(1)+' km'}<span class="place-go">Itinéraire ↗</span></div>`;
      list.appendChild(el);
    });
  }catch(e){
    if(e.name==='AbortError')return;
    list.innerHTML='<div class="places-empty">Erreur réseau — le service Overpass est peut-être saturé, réessayez dans un instant.</div>';
  }
}

function syncUI(){
  document.querySelectorAll('#places-radius .chip').forEach(c=>c.classList.toggle('sel',parseInt(c.dataset.km)===_radius));
}

export function initPlaces(){
  $('btn-open-places').addEventListener('click',()=>{
    openSheet('sh-places',()=>{
      if(S.lat===null){toast('Position requise');requestGPS();}
      syncUI();search();
    });
  });
  document.querySelectorAll('#places-radius .chip').forEach(c=>{
    c.addEventListener('click',()=>{_radius=parseInt(c.dataset.km);syncUI();search();});
  });
}
