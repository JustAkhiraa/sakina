/* SAKINA — Outil développeur caché.
   Séquence : dans la page Réglages, cliquer 5× sur le titre « Paramètres »
   puis 5× sur son avatar de profil. La séquence doit être enchaînée
   (chaque clic dans les 8 s). Une fois complétée, S.devUnlock bascule et
   toutes les récompenses verrouillées deviennent accessibles. Refaire la
   séquence désactive le mode. */
import {S,save,emit} from './store.js';
import {toast} from './ui.js';
import {vib} from './audio.js';
import {t} from '../lib/i18n.js';

const NEED_TITLE=5;
const NEED_AVATAR=5;
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
    const title=document.querySelector('#page-settings .phd-title');
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
      av.addEventListener('click',()=>{
        tick();
        if(phase!=='avatar'){reset();return;}
        avatarHits++;vib(12);
        if(avatarHits>=NEED_AVATAR)finish();
      });
    }
  };

  // Le page Réglages est déjà dans le DOM au chargement, mais on relance
  // le binding après chaque re-render (au cas où le prof-av soit remplacé).
  bind();
  document.addEventListener('click',bind,true);
}
