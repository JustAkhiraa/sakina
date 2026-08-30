/* SAKINA — Outil développeur caché.

   Séquence : dans « Profil & récompenses », cliquer 1× sur son titre de rang
   (« Voyageur », « Fidèle »…) puis 10× sur son avatar. Les clics doivent
   s'enchaîner — chacun dans les 8 s du précédent. Une fois la séquence
   complétée, S.devUnlock bascule et toutes les récompenses verrouillées
   deviennent accessibles. Refaire la séquence désactive le mode.

   La séquence portait auparavant sur le titre de la page Réglages puis sur
   l'avatar : deux écrans différents, à enchaîner en huit secondes. Elle
   n'était pas cassée, elle était inatteignable — d'où l'impression qu'elle
   ne marchait plus. Les deux cibles sont désormais côte à côte dans la même
   feuille. */
import {S,save,emit} from './store.js';
import {toast} from './ui.js';
import {vib} from './audio.js';
import {t} from '../lib/i18n.js';

const NEED_TITLE=1;
const NEED_AVATAR=10;
const WINDOW_MS=8000;

export function initDevTools(){
  let phase='title',titleHits=0,avatarHits=0,last=0;
  const reset=()=>{phase='title';titleHits=0;avatarHits=0;last=0;};
  const tick=()=>{
    const now=Date.now();
    if(last&&now-last>WINDOW_MS)reset();
    last=now;
  };
  const finish=()=>{
    reset();
    S.devUnlock=!S.devUnlock;save();
    vib([60,30,60,30,120]);
    toast(S.devUnlock?t('dev.on'):t('dev.off'));
    emit('stats-changed');
  };

  const bind=()=>{
    const title=document.getElementById('prof-name');
    const av=document.getElementById('prof-av');
    if(title&&!title._devWired){
      title._devWired=true;
      title.style.cursor='default';
      title.addEventListener('click',()=>{
        tick();
        if(phase!=='title'){reset();return;}
        titleHits++;vib(12);
        if(titleHits>=NEED_TITLE){phase='avatar';vib([20,40,20]);}
      });
    }
    if(av&&!av._devWired){
      av._devWired=true;
      av.style.cursor='default';
      av.addEventListener('click',()=>{
        tick();
        if(phase!=='avatar'){reset();return;}
        avatarHits++;
        // Une pulsation un peu plus marquee tous les cinq clics : sans
        // retour, dix clics a l'aveugle ne se comptent pas.
        vib(avatarHits%5===0?[20,40,20]:12);
        if(avatarHits>=NEED_AVATAR)finish();
      });
    }
  };

  // Les deux cibles sont redessinees a chaque refreshSettings : on relance
  // le cablage apres chaque clic, le drapeau _devWired evite le doublon.
  bind();
  document.addEventListener('click',bind,true);
}
