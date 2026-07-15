/* SAKINA — Boussole Qibla.
   Géométrie : l'anneau (avec N/S/E/O) tourne de -cap pour suivre la boussole ;
   l'aiguille, ENFANT de l'anneau, porte le cap fixe de la Qibla.
   Rotation écran de l'aiguille = -cap + qibla = correct.
   (bug historique corrigé : l'aiguille recevait qibla-cap EN PLUS de la
   rotation de l'anneau → double soustraction du cap, direction fausse) */
import {S,on} from '../core/store.js';
import {qiblaBearing,kaabaDistance} from '../lib/astro.js';
import {requestGPS} from './salat.js';

const $=id=>document.getElementById(id);
let _heading=0;
let _sensorActive=false;
let _listening=false;

function render(){
  if(S.lat===null)return;
  const bearing=qiblaBearing(S.lat,S.lon);
  $('q-deg').textContent=Math.round(bearing)+'°';
  $('q-city').textContent=(S.city||`${S.lat.toFixed(2)}°, ${S.lon.toFixed(2)}°`)+` · ${kaabaDistance(S.lat,S.lon).toLocaleString('fr-FR')} km de la Ka'ba`;
  $('q-status').className='ok';
  $('q-status').textContent='✓ Direction calculée';
  // L'aiguille pointe le cap Qibla dans le référentiel de l'anneau
  $('qn').style.transform=`translateY(-100%) rotate(${bearing}deg)`;
  // L'anneau entier (N/S/E/O + aiguille) suit la boussole
  $('compass-ring').style.transform=`rotate(${-_heading}deg)`;
  $('q-hint').textContent=_sensorActive
    ?'Tournez-vous jusqu’à aligner l’aiguille dorée vers le haut de l’écran.'
    :'Boussole matérielle inactive — appuyez sur ⟳ pour l’activer, ou orientez le N vers le Nord réel et suivez l’aiguille.';
}

function onOrientation(e){
  let h=null;
  if(e.webkitCompassHeading!=null&&!Number.isNaN(e.webkitCompassHeading)){
    h=e.webkitCompassHeading;               // iOS : cap boussole direct
  }else if(e.absolute===true&&e.alpha!=null){
    h=(360-e.alpha)%360;                     // Android absolu : cap = 360 − alpha
  }
  if(h===null)return;
  _sensorActive=true;
  _heading=h;
  render();
}

function startSensor(){
  const go=()=>{
    if(_listening)return;
    _listening=true;
    if('ondeviceorientationabsolute' in window)
      window.addEventListener('deviceorientationabsolute',onOrientation,true);
    else
      window.addEventListener('deviceorientation',onOrientation,true);
  };
  // iOS : requestPermission ne fonctionne que depuis un geste utilisateur
  if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){
    DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted'){go();render();}}).catch(()=>{});
  }else if(window.DeviceOrientationEvent){
    go();
  }
}

export function initQibla(){
  $('btn-qref').addEventListener('click',()=>{startSensor();render();});
  on('location-changed',render);
}

export function onQiblaShow(){
  if(S.lat===null){requestGPS();return;}
  render();
  // Tente l'activation auto (Android) ; sur iOS l'utilisateur devra appuyer sur ⟳
  if(typeof DeviceOrientationEvent==='undefined'||!DeviceOrientationEvent.requestPermission)startSensor();
}
