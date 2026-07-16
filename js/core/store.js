/* SAKINA — État global persistant.
   Migre automatiquement les données de l'ancienne app (clés 'tpv5' + 'qdata'). */

const KEY='sakina.v1';
const LEGACY_KEY='tpv5';
const LEGACY_QURAN='qdata';

const DEFAULTS={
  // Première configuration (assistant de bienvenue)
  onboarded:false,
  // Compteur
  count:0,lapCount:0,sessTot:0,allTime:0,sessCount:0,
  title:'Subhanallah',startVal:0,reminder:33,goal:33,
  customDhikrs:[],
  daily:{},                      // { 'YYYY-MM-DD': nb de dhikrs }
  history:[],                    // [{title,count,goal,ts}]
  // Apparence / préférences
  accent:'gold',sound:'drop',soundOn:true,vibOn:true,
  nightMode:false,autoLoop:false,screenLock:false,lightMode:false,
  baseTheme:'dark',              // ambiance : dark|emerald|ocean|mocha|light|sand|dawn
  hourFmt:'24',
  // Localisation & prières
  calcMethod:3,lat:null,lon:null,city:'',
  madhab:'maliki',               // école juridique (hanafi → Asr ombre ×2)
  lang:'fr',                     // langue de l'interface
  calEvents:{},                  // { 'YYYY-MM-DD': 'texte de l'événement' }
  // Qadâ'
  qada:{fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0},
  qdone:{fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0},
  // Coran
  quranLast:{surah:1},
  quranFavs:{},quranNotes:{},
};

function migrateLegacy(){
  try{
    const old=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
    if(!old)return null;
    // L'ancien historique stockait une chaîne formatée ; on la conserve telle quelle en label.
    if(Array.isArray(old.history)){
      old.history=old.history.map(h=>h.ts?h:{...h,ts:null,legacyTime:h.time});
    }
    const q=JSON.parse(localStorage.getItem(LEGACY_QURAN)||'{}');
    old.quranFavs=q.favs||{};
    old.quranNotes=q.notes||{};
    old.onboarded=true; // utilisateur existant : déjà configuré, pas d'assistant
    return old;
  }catch{return null;}
}

function load(){
  try{
    const cur=JSON.parse(localStorage.getItem(KEY)||'null');
    if(cur)return {...structuredClone(DEFAULTS),...cur};
    const legacy=migrateLegacy();
    if(legacy)return {...structuredClone(DEFAULTS),...legacy};
  }catch{}
  return structuredClone(DEFAULTS);
}

export const S=load();
// Sécurise les sous-objets pour les anciennes sauvegardes
for(const k of ['qada','qdone','daily','quranFavs','quranNotes','quranLast','calEvents'])
  if(!S[k]||typeof S[k]!=='object')S[k]=structuredClone(DEFAULTS[k]);
if(!Array.isArray(S.customDhikrs))S.customDhikrs=[];
if(!Array.isArray(S.history))S.history=[];
// Migration : l'ancien booléen lightMode devient une ambiance nommée
if(!S.baseTheme)S.baseTheme=S.lightMode?'light':'dark';
// Le verrouillage écran a été remplacé par le mode plein écran :
// on le désactive pour ne pas bloquer le compteur des anciens utilisateurs
S.screenLock=false;

let _pending=null;
function flush(){
  _pending=null;
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch{}
}
export function save(){
  // Regroupe les écritures rapprochées (le compteur peut battre vite).
  // setTimeout plutôt que rAF : rAF ne tourne pas quand l'onglet est en arrière-plan.
  if(_pending)return;
  _pending=setTimeout(flush,80);
}
// Aucune écriture ne doit se perdre quand l'app passe en arrière-plan ou se ferme
addEventListener('pagehide',()=>{if(_pending){clearTimeout(_pending);flush();}});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'&&_pending){clearTimeout(_pending);flush();}
});

export function todayKey(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* Série de jours consécutifs (streak) terminant aujourd'hui ou hier */
export function streak(){
  let n=0;const d=new Date();
  if(!S.daily[todayKey(d)])d.setDate(d.getDate()-1); // la série d'hier tient encore
  while(S.daily[todayKey(d)]){n++;d.setDate(d.getDate()-1);}
  return n;
}

/* Bus d'événements minimal, basé sur le DOM */
export const emit=(name,detail)=>document.dispatchEvent(new CustomEvent(name,{detail}));
export const on=(name,fn)=>document.addEventListener(name,fn);
