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
      content/audio/adhan/ — le jour où on en dépose un, il apparaît tout seul.

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

/* Voix intégrées : fichiers attendus dans content/audio/adhan/. Une entrée dont le
   fichier manque est simplement retirée du choix (voir availableVoices). */
/* `clip` : ne jouer que les N premières secondes, avec un fondu de sortie.
   L'enregistrement d'Omar Hisham dure trois minutes ; son premier takbir
   (« Allāhu akbar » ×2) va de 1,05 s à 11,1 s, suivi d'un silence net de
   1,35 s — mesuré sur l'enveloppe du fichier, pas estimé. Couper à 12,4 s
   laisse la phrase entière respirer sans mordre sur la suivante. */
export const BUILTIN_ADHANS=[
  {id:'omar',       file:'content/audio/adhan/omar-hisham.mp3', i18n:'adhan.vOmar'},
  {id:'omar-takbir',file:'content/audio/adhan/omar-hisham.mp3', i18n:'adhan.vOmarTakbir', clip:12.4},
  {id:'makkah',     file:'content/audio/adhan/makkah.mp3',      i18n:'adhan.vMakkah'},
  {id:'madinah',    file:'content/audio/adhan/madinah.mp3',     i18n:'adhan.vMadinah'},
  {id:'fajr',       file:'content/audio/adhan/fajr.mp3',        i18n:'adhan.vFajr', fajrOnly:true},
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
    list.push({id:a.id,label:t(a.i18n),sub:a.clip?t('adhan.vOmarTakbirSub'):''});
  });
  const key=fajr?CUSTOM_FAJR_KEY:CUSTOM_KEY;
  if(await getBlob(key))list.push({id:'custom',label:t('adhan.vCustom'),sub:t('adhan.vCustomSub')});
  return list;
}

/* ── Carillon de repli ──
   Ce n'est PAS un adhân et ça ne cherche pas à l'imiter : une voix ne se
   synthétise pas avec des oscillateurs, et contrefaire l'appel à la prière
   serait pire que de ne rien jouer. C'est une sonnerie d'annonce — mais une
   vraie : cinq notes d'une gamme pentatonique, chacune bâtie sur trois
   partiels comme une cloche (fondamentale, octave, douzième), avec attaque
   douce et longue décroissance. Environ six secondes, de quoi s'entendre
   depuis la pièce d'à côté, là où les trois bips précédents passaient
   inaperçus. */
function playChime(volume){
  const ac=getAC();
  if(!ac)return;
  const t0=ac.currentTime+0.05;
  // Ré–Fa♯–La–Si–La : montée ouverte puis retour, sans tension finale.
  const notes=[
    {f:587.33,at:0.00,len:2.6},
    {f:739.99,at:0.62,len:2.6},
    {f:880.00,at:1.24,len:2.8},
    {f:987.77,at:1.98,len:3.0},
    {f:880.00,at:3.10,len:3.6},
  ];
  const master=ac.createGain();
  master.gain.value=Math.min(1,Math.max(0,volume));
  master.connect(ac.destination);

  notes.forEach(n=>{
    // Partiels d'une cloche : la douzième donne le timbre métallique, très
    // en retrait pour rester doux.
    [[1,0.30],[2,0.10],[3,0.045]].forEach(([mult,amp])=>{
      const osc=ac.createOscillator(),g=ac.createGain();
      osc.type='sine';
      osc.frequency.value=n.f*mult;
      const at=t0+n.at;
      g.gain.setValueAtTime(0,at);
      g.gain.linearRampToValueAtTime(amp,at+0.04);      // attaque douce
      g.gain.exponentialRampToValueAtTime(0.0001,at+n.len);
      osc.connect(g).connect(master);
      osc.start(at);osc.stop(at+n.len+0.05);
    });
  });
  _chimeEnd=t0+6.8;
}
let _chimeEnd=0;

let _clipTimer=null,_fadeRaf=null;

export function stopAdhan(){
  if(_clipTimer){clearTimeout(_clipTimer);_clipTimer=null;}
  if(_fadeRaf){cancelAnimationFrame(_fadeRaf);_fadeRaf=null;}
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
  return b?{kind:'file',file:b.file,clip:b.clip}:{kind:'chime'};
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
  // Coupe demandee : on baisse le volume sur la derniere seconde plutot que
  // de trancher net, sinon la phrase s'arrete comme un cable arrache.
  if(src.clip){
    const FADE=1.0;
    _clipTimer=setTimeout(()=>{
      if(!_audio)return;
      const from=_audio.volume,t0=performance.now();
      const step=()=>{
        if(!_audio)return;
        const k=Math.min(1,(performance.now()-t0)/(FADE*1000));
        _audio.volume=Math.max(0,from*(1-k));
        if(k<1)_fadeRaf=requestAnimationFrame(step); else stopAdhan();
      };
      step();
    },Math.max(0,(src.clip-FADE)*1000));
  }
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
