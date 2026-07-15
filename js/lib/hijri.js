/* SAKINA — Calendrier hégirien tabulaire (civil).
   Retourne des nombres exploitables plutôt qu'une chaîne à re-parser. */
import {julianDay} from './astro.js';

export const HIJRI_MONTHS_FR=['Mouharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Joumada al-Oula','Joumada al-Akhira','Rajab',"Sha'ban",'Ramadan','Chawwal',"Dhou al-Qa'da",'Dhou al-Hijja'];
export const HIJRI_MONTHS_AR=['مُحَرَّم','صَفَر','رَبِيعُ ٱلْأَوَّل','رَبِيعُ ٱلثَّانِي','جُمَادَى ٱلْأُولَى','جُمَادَى ٱلثَّانِيَة','رَجَب','شَعْبَان','رَمَضَان','شَوَّال','ذُو ٱلْقَعْدَة','ذُو ٱلْحِجَّة'];
export const HIJRI_SACRED=[0,6,10,11]; // indices des mois sacrés

export const toArabicNum=n=>[...n.toString()].map(c=>'٠١٢٣٤٥٦٧٨٩'[+c]??c).join('');

/** Grégorien → hégirien. @returns {{day:number,month:number,year:number}} (month: 0–11) */
export function toHijri(date){
  const j=julianDay(date.getFullYear(),date.getMonth()+1,date.getDate())+0.5;
  let l=j-1948440+10632;
  const n=Math.floor((l-1)/10631);
  l=l-10631*n+354;
  const K=Math.floor((10985-l)/5316)*Math.floor((50*l)/17719)+Math.floor(l/5670)*Math.floor((43*l)/15238);
  l=l-Math.floor((30-K)/15)*Math.floor((17719*K)/50)-Math.floor(K/16)*Math.floor((15238*K)/43)+29;
  const month=Math.floor((24*l)/709);
  const day=l-Math.floor((709*month)/24);
  const year=30*n+K-29;
  return{day,month:month-1,year};
}

export function hijriLabelAr(h){return`${toArabicNum(h.day)} ${HIJRI_MONTHS_AR[h.month]} ${toArabicNum(h.year)}`;}
export function hijriLabelFr(h){return`${h.day} ${HIJRI_MONTHS_FR[h.month]} ${h.year}`;}

/* Jours de jeûne remarquables */
export const isRamadan =h=>h.month===8;
export const isWhiteDay=h=>h.day>=13&&h.day<=15;
export const isAshura  =h=>h.month===0&&h.day===10;
export const isArafat  =h=>h.month===11&&h.day===9;
