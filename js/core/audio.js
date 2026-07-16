/* SAKINA — Sons synthétisés (WebAudio) + retour haptique */
import {S} from './store.js';

let _ac=null;
export function getAC(){
  if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();
  if(_ac.state==='suspended')_ac.resume();
  return _ac;
}

export function playSound(type,milestone=false){
  if(!S.soundOn||type==='none')return;
  try{
    const ctx=getAC(),t=ctx.currentTime;
    const mk=(tp,fr)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=tp;o.frequency.value=fr;o.connect(g);g.connect(ctx.destination);
      return{o,g};
    };
    if(milestone){
      const{o:o1,g:g1}=mk('sine',660),{o:o2,g:g2}=mk('sine',990);
      g1.gain.setValueAtTime(0.3,t);g1.gain.exponentialRampToValueAtTime(0.001,t+0.2);
      g2.gain.setValueAtTime(0.001,t+0.1);g2.gain.linearRampToValueAtTime(0.28,t+0.2);g2.gain.exponentialRampToValueAtTime(0.001,t+0.42);
      o1.start(t);o1.stop(t+0.2);o2.start(t+0.1);o2.stop(t+0.42);
      return;
    }
    if(type==='drop'){const{o,g}=mk('sine',380);o.frequency.exponentialRampToValueAtTime(90,t+0.1);g.gain.setValueAtTime(0.45,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);o.start(t);o.stop(t+0.12);}
    else if(type==='click'){const{o,g}=mk('square',200);o.frequency.exponentialRampToValueAtTime(50,t+0.03);g.gain.setValueAtTime(0.2,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.04);o.start(t);o.stop(t+0.04);}
    else if(type==='bleep'){const{o,g}=mk('sine',900);g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.05);o.start(t);o.stop(t+0.05);}
    else if(type==='wood'){const{o,g}=mk('triangle',320);o.frequency.exponentialRampToValueAtTime(160,t+0.07);g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.08);o.start(t);o.stop(t+0.08);}
    else if(type==='bell'){const{o,g}=mk('sine',1200),{o:o2,g:g2}=mk('sine',2400);g.gain.setValueAtTime(0.22,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.55);g2.gain.setValueAtTime(0.1,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.55);o2.start(t);o2.stop(t+0.3);}
    /* ── Sons doux ── */
    else if(type==='pearl'){ // pincement feutré, attaque ronde
      const{o,g}=mk('triangle',523);
      o.frequency.exponentialRampToValueAtTime(392,t+0.16);
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.18,t+0.015);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
      o.start(t);o.stop(t+0.22);
    }
    else if(type==='calm'){ // onde 432 Hz, montée et descente lentes
      const{o,g}=mk('sine',432);
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.12,t+0.06);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.4);
      o.start(t);o.stop(t+0.4);
    }
    else if(type==='breath'){ // souffle très discret (sinus grave filtré)
      const{o,g}=mk('sine',180);
      o.frequency.linearRampToValueAtTime(150,t+0.18);
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.09,t+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.24);
      o.start(t);o.stop(t+0.24);
    }
    else if(type==='kalimba'){ // note chaude avec harmonique douce
      const{o,g}=mk('sine',660),{o:o2,g:g2}=mk('sine',1320);
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.2,t+0.008);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
      g2.gain.setValueAtTime(0.05,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.12);
      o.start(t);o.stop(t+0.35);o2.start(t);o2.stop(t+0.12);
    }
    else if(type==='chime2'){ // deux notes cristallines en cascade, volume contenu
      const{o,g}=mk('sine',784),{o:o2,g:g2}=mk('sine',1046);
      g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      g2.gain.setValueAtTime(0.0001,t+0.09);g2.gain.linearRampToValueAtTime(0.09,t+0.12);
      g2.gain.exponentialRampToValueAtTime(0.001,t+0.42);
      o.start(t);o.stop(t+0.3);o2.start(t+0.09);o2.stop(t+0.42);
    }
  }catch{}
}

export function vib(pattern){
  if(!S.vibOn||!navigator.vibrate)return;
  navigator.vibrate(pattern);
}
