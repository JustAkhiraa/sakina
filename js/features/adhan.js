/* SAKINA — Appel à la prière.

   Ce module sait jouer un adhân à l'heure de chaque prière, choisir une voix
   différente pour le Fajr, régler le volume et n'annoncer que les prières
   voulues. Trois choses méritent d'être dites franchement.

   1. Aucun enregistrement n'est livré avec l'application. Un adhân dure deux
      à trois minutes ; en embarquer plusieurs alourdirait le paquet de
      dizaines de mégaoctets, et les récitations diffusées en ligne ne sont
      pas toutes libres de droits. L'utilisateur importe donc la sienne :
      elle est rangée dans IndexedDB et fonctionne ensuite hors ligne, sans
      réseau ni dépendance. Les voix intégrées ci-dessous sont déclarées mais
      ne s'affichent que si le fichier correspondant existe réellement dans
      assets/adhan/ — le jour où on en dépose un, il apparaît tout seul.

   2. À défaut d'enregistrement, un carillon de synthèse marque l'heure. Ce
      n'est pas un adhân et il ne le remplace pas : c'est un signal sonore,
      nommé comme tel dans l'interface.

   3. La même limite que les rappels s'applique : sans serveur de push, rien
      ne peut sonner quand l'application a été complètement fermée. Et un
      navigateur refuse de jouer un son tant que l'utilisateur n'a jamais
      interagi avec la page — d'où le bouton d'écoute des réglages, qui sert
      aussi à débloquer l'audio. */
import {S,save} from '../core/store.js';
import {toast} from '../core/ui.js';
import {getAC} from '../core/audio.js';
import {t} from '../lib/i18n.js';
import {putBlob,getBlob,delBlob} from '../lib/blobstore.js';

/* Voix intégrées : fichiers attendus dans assets/adhan/. Une entrée dont le
   fichier manque est simplement retirée du choix (voir availableVoices). */
export const BUILTIN_ADHANS=[
  {id:'omar',    file:'assets/adhan/omar-hisham.mp3', i18n:'adhan.vOmar'},
  {id:'makkah',  file:'assets/adhan/makkah.mp3',      i18n:'adhan.vMakkah'},
  {id:'madinah', file:'assets/adhan/madinah.mp3',     i18n:'adhan.vMadinah'},
  {id:'fajr',    file:'assets/adhan/fajr.mp3',        i18n:'adhan.vFajr', fajrOnly:true},
];

export const CUSTOM_KEY='adhan-custom';
export const CUSTOM_FAJR_KEY='adhan-custom-fajr';

let _audio=null;       // élément en cours de lecture
let _url=null;         // URL d'objet à révoquer après usage
let _probe=null;       // cache de la disponibilité des fichiers intégrés

/* Un HEAD suffit à savoir si le fichier a été déposé, sans le télécharger.
   Le résultat est mémorisé : inutile de resonder à chaque ouverture. */
async function probeBuiltins(){
  if(_probe)return _probe;
  const out={};
  await Promise.all(BUILTIN_ADHANS.map(async a=>{
    try{
      const r=await fetch(a.file,{method:'HEAD'});
      out[a.id]=r.ok;
    }catch{out[a.id]=false;}
  }));
  _probe=out;
  return out;
}

/* La liste réellement proposable : le carillon, les voix dont le fichier
   existe, et l'import de l'utilisateur s'il en a déposé un. */
export async function availableVoices({fajr=false}={}){
  const probe=await probeBuiltins();
  const list=[{id:'chime',label:t('adhan.vChime'),sub:t('adhan.vChimeSub')}];
  BUILTIN_ADHANS.forEach(a=>{
    if(!probe[a.id])return;
    if(a.fajrOnly&&!fajr)return;
    list.push({id:a.id,label:t(a.i18n),sub:''});
  });
  const key=fajr?CUSTOM_FAJR_KEY:CUSTOM_KEY;
  if(await getBlob(key))list.push({id:'custom',label:t('adhan.vCustom'),sub:t('adhan.vCustomSub')});
  return list;
}

/* ── Carillon de repli ──
   Trois notes descendantes, douces, sans percussion : de quoi marquer
   l'heure sans imiter un appel à la prière. */
function playChime(volume){
  const ac=getAC();
  if(!ac)return;
  const now=ac.currentTime;
  [880,660,440].forEach((f,i)=>{
    const osc=ac.createOscillator(),gain=ac.createGain();
    osc.type='sine';osc.frequency.value=f;
    const at=now+i*0.5;
    gain.gain.setValueAtTime(0,at);
    gain.gain.linearRampToValueAtTime(volume*0.25,at+0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001,at+0.48);
    osc.connect(gain).connect(ac.destination);
    osc.start(at);osc.stop(at+0.5);
  });
}

export function stopAdhan(){
  if(_audio){_audio.pause();_audio.currentTime=0;_audio=null;}
  if(_url){URL.revokeObjectURL(_url);_url=null;}
}

/* Résout la source à jouer pour une prière donnée. */
async function sourceFor(prayerKey){
  const isFajr=prayerKey==='fajr';
  const voice=(isFajr&&S.adhanFajrVoice)||S.adhanVoice||'chime';
  if(voice==='chime')return {kind:'chime'};
  if(voice==='custom'){
    const blob=await getBlob(isFajr&&S.adhanFajrVoice==='custom'?CUSTOM_FAJR_KEY:CUSTOM_KEY);
    return blob?{kind:'blob',blob}:{kind:'chime'};
  }
  const b=BUILTIN_ADHANS.find(a=>a.id===voice);
  return b?{kind:'file',file:b.file}:{kind:'chime'};
}

/* Joue l'appel. `prayerKey` sert à choisir la voix du Fajr. */
export async function playAdhan(prayerKey='dhuhr'){
  stopAdhan();
  const vol=Math.min(1,Math.max(0,Number(S.adhanVolume)??0.8));
  const src=await sourceFor(prayerKey);
  if(src.kind==='chime'){playChime(vol);return 'chime';}

  _audio=new Audio();
  _audio.volume=vol;
  if(src.kind==='blob'){_url=URL.createObjectURL(src.blob);_audio.src=_url;}
  else _audio.src=src.file;
  _audio.onended=stopAdhan;
  // Un fichier absent ou illisible ne doit pas laisser l'heure passer en
  // silence : on retombe sur le carillon.
  _audio.onerror=()=>{stopAdhan();playChime(vol);};
  try{await _audio.play();}
  catch{
    // Lecture refusée faute d'interaction préalable : le carillon passe par
    // WebAudio, qui est parfois autorisé là où <audio> ne l'est pas.
    stopAdhan();playChime(vol);
    return 'blocked';
  }
  return 'audio';
}

export const adhanPlaying=()=>!!(_audio&&!_audio.paused);

/* Cette prière doit-elle être annoncée ? */
export const adhanEnabledFor=key=>
  !!S.adhanEnabled&&(S.adhanPrayers||{})[key]!==false;

/* ── Import d'un enregistrement ── */
export async function importAdhan(file,{fajr=false}={}){
  if(!file)return false;
  if(!/^audio\//.test(file.type)&&!/\.(mp3|m4a|ogg|wav|aac)$/i.test(file.name)){
    toast(t('adhan.notAudio'));
    return false;
  }
  // 20 Mo : au-delà, c'est un album, pas un adhân — et le quota IndexedDB
  // d'un navigateur mobile s'y refuserait de toute façon.
  if(file.size>20*1024*1024){toast(t('adhan.tooBig'));return false;}
  try{
    await putBlob(fajr?CUSTOM_FAJR_KEY:CUSTOM_KEY,file);
    if(fajr)S.adhanFajrVoice='custom'; else S.adhanVoice='custom';
    save();
    toast(t('adhan.imported'));
    return true;
  }catch{
    toast(t('adhan.importFail'));
    return false;
  }
}

export async function removeCustom({fajr=false}={}){
  await delBlob(fajr?CUSTOM_FAJR_KEY:CUSTOM_KEY);
  if(fajr&&S.adhanFajrVoice==='custom')S.adhanFajrVoice='';
  if(!fajr&&S.adhanVoice==='custom')S.adhanVoice='chime';
  save();
}
