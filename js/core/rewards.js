/* SAKINA — Récompenses : logique centrale de déblocage progressif.
   Chaque item avec un `unlockAt` est verrouillé tant que S.allTime < unlockAt.
   Les paliers sont volontairement croissants pour créer une progression
   sur plusieurs mois : plus on avance, plus le prochain cadeau est rare. */
import {S} from './store.js';
import {toast} from './ui.js';
import {vib} from './audio.js';
import {t} from '../lib/i18n.js';
import {BASE_THEMES,SOUNDS,BONUS_DHIKRS,AVATARS,TITLES,SKINS} from '../data/catalog.js';

export const isUnlocked=(item)=>!!S.devUnlock||!item.unlockAt||(S.allTime|0)>=item.unlockAt;
export const remainingFor=(item)=>Math.max(0,(item.unlockAt||0)-(S.allTime|0));

/* Formate 1234 → "1 234", 12000 → "12 k" pour économiser l'espace visuel */
export function fmtGoal(n){
  if(n>=10000)return Math.round(n/1000)+'k';
  return n.toLocaleString('fr-FR');
}

/* Toutes les catégories réunies : sert au balayage des nouveaux paliers.
   Chaque item est enrichi avec `__cat` (id catégorie) et `__label` (nom lisible). */
export function allRewards(){
  // __label porte la cle i18n de la categorie : le libelle lui-meme depend
  // de la langue et ne peut pas etre fige ici.
  const tag=(arr,cat)=>arr.filter(x=>x.unlockAt>0).map(x=>({...x,__cat:cat,__label:t(`rw.${cat}`)}));
  return [
    ...tag(SKINS,'skin'),
    ...tag(BASE_THEMES,'theme'),
    ...tag(SOUNDS,'sound'),
    ...tag(BONUS_DHIKRS,'dhikr'),
    ...tag(AVATARS,'avatar'),
    ...tag(TITLES,'title'),
  ];
}

/* Compte les cadeaux débloqués vs. totaux (pour l'écran Récompenses) */
export function rewardsSummary(){
  const all=allRewards();
  const unlocked=all.filter(isUnlocked).length;
  return {unlocked,total:all.length};
}

/* Prochain palier à atteindre (toutes catégories confondues) */
export function nextReward(){
  const all=allRewards().filter(r=>!isUnlocked(r));
  if(!all.length)return null;
  all.sort((a,b)=>a.unlockAt-b.unlockAt);
  return all[0];
}

/* À appeler après chaque incrément : détecte les seuils franchis et fête */
export function checkUnlocks(beforeAll,afterAll){
  if(afterAll<=beforeAll)return;
  const crossed=allRewards().filter(r=>r.unlockAt>beforeAll&&r.unlockAt<=afterAll);
  if(!crossed.length)return;
  // Groupé par palier pour éviter un défilé de toasts si plusieurs items
  // partagent le même seuil
  const byTier={};
  crossed.forEach(r=>{(byTier[r.unlockAt]=byTier[r.unlockAt]||[]).push(r);});
  Object.entries(byTier).forEach(([tier,items],i)=>{
    setTimeout(()=>{
      const names=items.map(x=>x.__label).join(' · ');
      toast(t(items.length>1?'msg.unlockedN':'msg.unlocked',{goal:fmtGoal(+tier),names}));
      vib([40,25,40,25,80]);
    },300+i*1400);
  });
}
