/* SAKINA — Calculs astronomiques des horaires de prière.
   Corrige la version historique : angles Fajr/Isha réels par méthode,
   Isha en intervalle (Umm al-Qura), Asr par facteur d'ombre (madhab). */

const rad=d=>d*Math.PI/180;
const deg=r=>r*180/Math.PI;

export function julianDay(y,m,d){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
}

/* Déclinaison solaire (°) + équation du temps (heures) */
function sunPosition(jd){
  const D=jd-2451545;
  const g=(357.529+0.98560028*D)%360;
  const q=(280.459+0.98564736*D)%360;
  const L=(q+1.915*Math.sin(rad(g))+0.02*Math.sin(rad(2*g)))%360;
  const e=23.439-0.00000036*D;
  let RA=deg(Math.atan2(Math.cos(rad(e))*Math.sin(rad(L)),Math.cos(rad(L))))/15;
  RA=(RA+24)%24;
  const dec=deg(Math.asin(Math.sin(rad(e))*Math.sin(rad(L))));
  let EqT=q/15-RA;
  if(EqT>12)EqT-=24;if(EqT<-12)EqT+=24;
  return{dec,EqT};
}

/* Demi-arc horaire (heures) pour atteindre l'altitude `alt` (° ; négative sous l'horizon).
   Retourne null au-delà du cercle polaire. */
function hourAngle(lat,dec,alt){
  const cosH=(Math.sin(rad(alt))-Math.sin(rad(lat))*Math.sin(rad(dec)))/
             (Math.cos(rad(lat))*Math.cos(rad(dec)));
  if(cosH<-1||cosH>1)return null;
  return deg(Math.acos(cosH))/15;
}

/**
 * @param {number} lat  latitude
 * @param {number} lon  longitude
 * @param {Date}   date jour local
 * @param {object} method {fajr:number, isha?:number, ishaInterval?:number}
 * @param {number} asrFactor 1 (majorité) ou 2 (hanafite)
 * @returns horaires en heures décimales locales (null si non calculable)
 */
export function computeTimes(lat,lon,date,method,asrFactor=1){
  const jd=julianDay(date.getFullYear(),date.getMonth()+1,date.getDate());
  const {dec,EqT}=sunPosition(jd+0.5-lon/360); // position au midi solaire local
  const tz=-date.getTimezoneOffset()/60;
  const noon=12+tz-lon/15-EqT;

  const haFajr=hourAngle(lat,dec,-method.fajr);
  const haSun=hourAngle(lat,dec,-0.833);
  // Asr : ombre = facteur × ombre au zénith → altitude = arctan(1/(facteur+tan|lat−dec|))
  const asrAlt=deg(Math.atan(1/(asrFactor+Math.tan(rad(Math.abs(lat-dec))))));
  const haAsr=hourAngle(lat,dec,asrAlt);

  const fajr=haFajr!==null?noon-haFajr:null;
  const sunrise=haSun!==null?noon-haSun:null;
  const dhuhr=noon+2/60;                       // léger délai après le zénith
  const asr=haAsr!==null?noon+haAsr:null;
  const maghrib=haSun!==null?noon+haSun:null;
  let isha=null;
  if(method.ishaInterval!=null){
    isha=maghrib!==null?maghrib+method.ishaInterval/60:null;
  }else{
    const haIsha=hourAngle(lat,dec,-method.isha);
    isha=haIsha!==null?noon+haIsha:null;
  }
  const imsak=fajr!==null?fajr-10/60:null;     // convention : 10 min avant le Fajr

  return{fajr,sunrise,dhuhr,asr,maghrib,isha,imsak};
}

/* Heures décimales → "HH:MM" (24h) ou "H:MM AM/PM" */
export function fmtTime(v,fmt='24'){
  if(v===null||v===undefined||Number.isNaN(v))return'--:--';
  let h=((Math.floor(v)%24)+24)%24;
  let m=Math.round((v-Math.floor(v))*60);
  if(m===60){h=(h+1)%24;m=0;}
  if(fmt==='12'){
    const ap=h>=12?'PM':'AM';
    const h12=h%12===0?12:h%12;
    return`${h12}:${String(m).padStart(2,'0')} ${ap}`;
  }
  return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

/* Direction de la Qibla (° depuis le Nord, sens horaire) */
const KAABA={lat:21.4225,lon:39.8262};
export function qiblaBearing(lat,lon){
  const dL=rad(KAABA.lon-lon);
  const y=Math.sin(dL)*Math.cos(rad(KAABA.lat));
  const x=Math.cos(rad(lat))*Math.sin(rad(KAABA.lat))-
          Math.sin(rad(lat))*Math.cos(rad(KAABA.lat))*Math.cos(dL);
  return(deg(Math.atan2(y,x))+360)%360;
}

/* Distance grand cercle vers la Ka'ba (km) */
export function kaabaDistance(lat,lon){
  const R=6371;
  const dLat=rad(KAABA.lat-lat),dLon=rad(KAABA.lon-lon);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat))*Math.cos(rad(KAABA.lat))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}
