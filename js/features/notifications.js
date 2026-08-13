/* SAKINA — Rappels de prière.

   Ce que cette implémentation peut, et ce qu'elle ne peut pas.

   Sans serveur de push, un site web ne peut pas réveiller le téléphone
   d'un utilisateur dont l'application est complètement fermée : les
   minuteurs meurent avec la page. Ce module programme donc les rappels
   tant que Sakina vit — au premier plan, ou en arrière-plan tant que le
   système garde l'onglet ou la PWA en mémoire — et les reprogramme à
   chaque retour. En pratique, l'appareil est prévenu s'il n'a pas été
   redémarré ni l'application balayée depuis la liste des tâches.

   Le service worker est utilisé pour afficher la notification quand il
   est disponible : sur Android et sur iOS installé en PWA, c'est la
   seule voie acceptée. `new Notification()` ne sert que de repli.

   Un seul minuteur est armé à la fois, sur la prière la plus proche, et
   il se réarme après chaque déclenchement. Programmer les cinq prières
   d'un coup multiplierait les minuteurs longs, que les navigateurs
   étranglent en arrière-plan. */
import {S,on} from '../core/store.js';
import {toast} from '../core/ui.js';
import {upcomingPrayers} from './salat.js';

const MAX_DELAY=6*3600*1000;   // au-delà, on se réveille pour réarmer
let _timer=null;

export const notifSupported=()=>'Notification' in window;
export const notifPermission=()=>notifSupported()?Notification.permission:'unsupported';

const enabledFor=key=>{
  const p=S.notifPrayers||{};
  return p[key]!==false;   // par défaut, toutes les prières sont annoncées
};

/* Demande l'autorisation. Renvoie true si elle est accordée. */
export async function askNotifPermission(){
  if(!notifSupported()){toast('Notifications non prises en charge');return false;}
  if(Notification.permission==='granted')return true;
  if(Notification.permission==='denied'){
    toast('Notifications bloquées dans les réglages du navigateur');
    return false;
  }
  const res=await Notification.requestPermission();
  return res==='granted';
}

async function show(title,body){
  const opts={
    body,
    icon:'assets/icon-192.png',
    badge:'assets/icon-192.png',
    tag:'sakina-salat',        // une seule notification de prière à la fois
    renotify:true,
    vibrate:[120,60,120],
  };
  try{
    const reg=await navigator.serviceWorker?.ready;
    if(reg){await reg.showNotification(title,opts);return;}
  }catch{/* repli ci-dessous */}
  try{new Notification(title,opts);}catch{/* rien à faire de plus */}
}

/* Programme le prochain rappel. Idempotent : rappelable à volonté. */
export function scheduleNext(){
  clearTimeout(_timer);_timer=null;
  if(!S.notifEnabled||notifPermission()!=='granted')return null;

  const offset=Math.max(0,Number(S.notifOffset)||0)*60*1000;
  const now=new Date();
  const next=upcomingPrayers(now,2)
    .filter(p=>enabledFor(p.key))
    .map(p=>({...p,fireAt:new Date(p.at.getTime()-offset)}))
    .find(p=>p.fireAt>now);
  if(!next)return null;

  const delay=next.fireAt-now;
  if(delay>MAX_DELAY){
    // Trop loin : on se réveille plus tôt pour réarmer un minuteur court
    _timer=setTimeout(scheduleNext,MAX_DELAY);
    return next;
  }
  _timer=setTimeout(async()=>{
    const heure=next.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    await show(
      offset?`${next.name} dans ${S.notifOffset} min`:`C'est l'heure de ${next.name}`,
      offset?`${next.name} à ${heure}`:`${next.arabic} · ${heure}`
    );
    scheduleNext();
  },delay);
  return next;
}

/* Notification de démonstration, pour que l'utilisateur vérifie que ça marche. */
export async function testNotification(){
  if(!await askNotifPermission())return false;
  await show('Sakina','Les rappels de prière sont actifs.');
  return true;
}

export function initNotifications(){
  if(!notifSupported())return;
  scheduleNext();
  // Reprogrammer au retour au premier plan : le minuteur a pu être étranglé
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)scheduleNext();
  });
  // La position change les horaires : il faut reprogrammer
  on('location-changed',scheduleNext);
}
