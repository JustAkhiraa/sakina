/* SAKINA — Boussole Qibla : cap calculé + boussole matérielle quand disponible */
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
  $('qn').style.transform=`translateY(-100%) rotate(${bearing-_heading}deg)`;
  $('compass-ring').style.transform=`rotate(${-_heading}deg)`;
  $('q-hint').textContent=_sensorActive
    ?'Tournez-vous jusqu’à aligner l’aiguille dorée vers le haut.'
    :'Boussole matérielle indisponible — orientez-vous au Nord puis suivez le cap indiqué.';
}

function onOrientation(e){
  let h=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.absolute?360-e.alpha:null);
  if(h===null||Number.isNaN(h))return;
  _sensorActive=true;
  _heading=h;
  render();
}

function startSensor(){
  if(_listening)return;
  const go=()=>{
    _listening=true;
    if('ondeviceorientationabsolute' in window)
      window.addEventListener('deviceorientationabsolute',onOrientation,true);
    else
      window.addEventListener('deviceorientation',onOrientation,true);
  };
  if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){
    DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')go();}).catch(()=>{});
  }else if(window.DeviceOrientationEvent){
    go();
  }
}

export function initQibla(){
  $('btn-qref').addEventListener('click',()=>{render();startSensor();});
  on('location-changed',render);
}

export function onQiblaShow(){
  if(S.lat===null){requestGPS();return;}
  render();
  startSensor();
}
