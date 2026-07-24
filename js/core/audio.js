/* SAKINA — Sons synthétisés (WebAudio) + retour haptique */
import {S} from './store.js';

let _ac=null;
export function getAC(){
  if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();
  if(_ac.state==='suspended')_ac.resume();
  return _ac;
}

function osc(ctx,type,freq){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.value=freq;o.connect(g);g.connect(ctx.destination);
  return{o,g};
}
function noise(ctx,dur){
  const buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);
  const s=ctx.createBufferSource();s.buffer=buf;
  const g=ctx.createGain();s.connect(g);g.connect(ctx.destination);
  return{s,g};
}

export function playSound(type,milestone=false){
  if(!S.soundOn||type==='none')return;
  try{
    const ctx=getAC(),t=ctx.currentTime;
    const mk=(tp,fr)=>osc(ctx,tp,fr);
    if(milestone){
      const{o:o1,g:g1}=mk('sine',660),{o:o2,g:g2}=mk('sine',990);
      g1.gain.setValueAtTime(0.3,t);g1.gain.exponentialRampToValueAtTime(0.001,t+0.2);
      g2.gain.setValueAtTime(0.001,t+0.1);g2.gain.linearRampToValueAtTime(0.28,t+0.2);g2.gain.exponentialRampToValueAtTime(0.001,t+0.42);
      o1.start(t);o1.stop(t+0.2);o2.start(t+0.1);o2.stop(t+0.42);
      return;
    }
    switch(type){
      case 'drop':{const{o,g}=mk('sine',380);o.frequency.exponentialRampToValueAtTime(90,t+0.1);g.gain.setValueAtTime(0.45,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);o.start(t);o.stop(t+0.12);break;}
      case 'click':{const{o,g}=mk('square',200);o.frequency.exponentialRampToValueAtTime(50,t+0.03);g.gain.setValueAtTime(0.2,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.04);o.start(t);o.stop(t+0.04);break;}
      case 'bleep':{const{o,g}=mk('sine',900);g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.05);o.start(t);o.stop(t+0.05);break;}
      case 'wood':{const{o,g}=mk('triangle',320);o.frequency.exponentialRampToValueAtTime(160,t+0.07);g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.08);o.start(t);o.stop(t+0.08);break;}
      case 'bell':{const{o,g}=mk('sine',1200),{o:o2,g:g2}=mk('sine',2400);g.gain.setValueAtTime(0.22,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.55);g2.gain.setValueAtTime(0.1,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.55);o2.start(t);o2.stop(t+0.3);break;}
      case 'pearl':{const{o,g}=mk('triangle',523);o.frequency.exponentialRampToValueAtTime(392,t+0.16);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.18,t+0.015);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);o.start(t);o.stop(t+0.22);break;}
      case 'calm':{const{o,g}=mk('sine',432);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.12,t+0.06);g.gain.exponentialRampToValueAtTime(0.001,t+0.4);o.start(t);o.stop(t+0.4);break;}
      case 'breath':{const{o,g}=mk('sine',180);o.frequency.linearRampToValueAtTime(150,t+0.18);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.09,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+0.24);o.start(t);o.stop(t+0.24);break;}
      case 'kalimba':{const{o,g}=mk('sine',660),{o:o2,g:g2}=mk('sine',1320);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.2,t+0.008);g.gain.exponentialRampToValueAtTime(0.001,t+0.35);g2.gain.setValueAtTime(0.05,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.12);o.start(t);o.stop(t+0.35);o2.start(t);o2.stop(t+0.12);break;}
      case 'chime2':{const{o,g}=mk('sine',784),{o:o2,g:g2}=mk('sine',1046);g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);g2.gain.setValueAtTime(0.0001,t+0.09);g2.gain.linearRampToValueAtTime(0.09,t+0.12);g2.gain.exponentialRampToValueAtTime(0.001,t+0.42);o.start(t);o.stop(t+0.3);o2.start(t+0.09);o2.stop(t+0.42);break;}
      /* ── Nouveaux sons ── */
      case 'hang':{const{o,g}=mk('sine',440),{o:o2,g:g2}=mk('sine',880);
        g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.24,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+0.6);
        g2.gain.setValueAtTime(0.08,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.35);
        o.start(t);o.stop(t+0.6);o2.start(t);o2.stop(t+0.35);break;}
      case 'droplet':{const{o,g}=mk('sine',900);o.frequency.exponentialRampToValueAtTime(300,t+0.12);g.gain.setValueAtTime(0.25,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.15);o.start(t);o.stop(t+0.15);break;}
      case 'marimba':{const{o,g}=mk('triangle',523),{o:o2,g:g2}=mk('sine',1046);
        g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.28);
        g2.gain.setValueAtTime(0.08,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.14);
        o.start(t);o.stop(t+0.28);o2.start(t);o2.stop(t+0.14);break;}
      case 'sing':{const{o,g}=mk('sine',220),{o:o2,g:g2}=mk('sine',330);
        g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.18,t+0.15);g.gain.exponentialRampToValueAtTime(0.001,t+1.1);
        g2.gain.setValueAtTime(0.0001,t);g2.gain.linearRampToValueAtTime(0.08,t+0.25);g2.gain.exponentialRampToValueAtTime(0.001,t+0.9);
        o.start(t);o.stop(t+1.1);o2.start(t);o2.stop(t+0.9);break;}
      case 'harp':{const{o,g}=mk('triangle',784);o.frequency.exponentialRampToValueAtTime(392,t+0.02);
        g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.22,t+0.005);g.gain.exponentialRampToValueAtTime(0.001,t+0.5);
        o.start(t);o.stop(t+0.5);break;}
      case 'tabla':{const{o,g}=mk('sine',110);o.frequency.exponentialRampToValueAtTime(55,t+0.08);
        g.gain.setValueAtTime(0.45,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.14);
        o.start(t);o.stop(t+0.14);
        const{s,g:gn}=noise(ctx,0.05);gn.gain.setValueAtTime(0.08,t);gn.gain.exponentialRampToValueAtTime(0.001,t+0.05);s.start(t);break;}
      case 'glass':{const{o,g}=mk('sine',2100),{o:o2,g:g2}=mk('sine',3200);
        g.gain.setValueAtTime(0.14,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.5);
        g2.gain.setValueAtTime(0.06,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.3);
        o.start(t);o.stop(t+0.5);o2.start(t);o2.stop(t+0.3);break;}
      case 'gong':{const{o,g}=mk('sine',110),{o:o2,g:g2}=mk('sine',165),{o:o3,g:g3}=mk('sine',82);
        g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+1.4);
        g2.gain.setValueAtTime(0.15,t);g2.gain.exponentialRampToValueAtTime(0.001,t+1.0);
        g3.gain.setValueAtTime(0.2,t);g3.gain.exponentialRampToValueAtTime(0.001,t+1.6);
        o.start(t);o.stop(t+1.4);o2.start(t);o2.stop(t+1.0);o3.start(t);o3.stop(t+1.6);break;}
      case 'whisper':{const{s,g:gn}=noise(ctx,0.25);gn.gain.setValueAtTime(0.0001,t);gn.gain.linearRampToValueAtTime(0.08,t+0.05);gn.gain.exponentialRampToValueAtTime(0.001,t+0.25);s.start(t);break;}
      /* ── Sons « clin d'œil » (chiptune / arcade) ── */
      case 'chip8':{const{o,g}=mk('square',523);o.frequency.setValueAtTime(523,t);o.frequency.setValueAtTime(659,t+0.06);
        g.gain.setValueAtTime(0.12,t);g.gain.setValueAtTime(0.12,t+0.06);g.gain.exponentialRampToValueAtTime(0.001,t+0.14);
        o.start(t);o.stop(t+0.14);break;}
      case 'laser':{const{o,g}=mk('sawtooth',1800);o.frequency.exponentialRampToValueAtTime(180,t+0.18);
        g.gain.setValueAtTime(0.16,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);
        o.start(t);o.stop(t+0.2);break;}
      case 'coin':{const{o,g}=mk('square',988);o.frequency.setValueAtTime(988,t);o.frequency.setValueAtTime(1319,t+0.05);
        g.gain.setValueAtTime(0.14,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
        o.start(t);o.stop(t+0.22);break;}
      case 'modem':{const{o,g}=mk('square',600);o.frequency.setValueAtTime(600,t);o.frequency.setValueAtTime(1200,t+0.05);o.frequency.setValueAtTime(800,t+0.1);o.frequency.setValueAtTime(1400,t+0.15);
        g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);
        o.start(t);o.stop(t+0.25);break;}
      /* ── Ruisseau (nature) : bruit filtré très doux, ~0.35s ── */
      case 'stream':{
        const{s,g:gn}=noise(ctx,0.4);
        const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=650;bp.Q.value=0.9;
        gn.disconnect();gn.connect(bp);bp.connect(ctx.destination);
        gn.gain.setValueAtTime(0.0001,t);gn.gain.linearRampToValueAtTime(0.11,t+0.05);
        gn.gain.exponentialRampToValueAtTime(0.001,t+0.38);
        s.start(t);break;}
      /* ── Pulse digital doux : sinus 660Hz avec attaque douce ── */
      case 'pulse':{
        const{o,g}=mk('sine',660);
        g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.14,t+0.008);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.09);
        o.start(t);o.stop(t+0.09);break;}

      /* ── Sons Voxel (synthétisés, timbre pixel) ── */
      case 'mc_mine':{
        // Coup sec + éclat de gravier
        const{o,g}=mk('square',180);o.frequency.exponentialRampToValueAtTime(70,t+0.09);
        g.gain.setValueAtTime(0.28,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.11);
        o.start(t);o.stop(t+0.11);
        const{s,g:gn}=noise(ctx,0.14);
        gn.gain.setValueAtTime(0.22,t);gn.gain.exponentialRampToValueAtTime(0.001,t+0.14);
        s.start(t);break;}
      case 'mc_eat':{
        // Deux chomps rapides
        for(let i=0;i<2;i++){
          const t0=t+i*0.09;
          const{o,g}=mk('sawtooth',260);o.frequency.exponentialRampToValueAtTime(120,t0+0.06);
          g.gain.setValueAtTime(0.18,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+0.07);
          o.start(t0);o.stop(t0+0.07);
          const{s,g:gn}=noise(ctx,0.06);
          gn.gain.setValueAtTime(0.14,t0);gn.gain.exponentialRampToValueAtTime(0.001,t0+0.06);
          s.start(t0);
        }
        break;}
      case 'mc_rocket':{
        // Whoosh montant façon feu d'artifice
        const{s,g:gn}=noise(ctx,0.45);
        gn.gain.setValueAtTime(0.001,t);gn.gain.linearRampToValueAtTime(0.22,t+0.15);
        gn.gain.exponentialRampToValueAtTime(0.001,t+0.45);
        s.start(t);
        const{o,g}=mk('sawtooth',180);o.frequency.exponentialRampToValueAtTime(1400,t+0.4);
        g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.45);
        o.start(t);o.stop(t+0.45);
        break;}
      case 'mc_villager':{
        // Timbre nasal montant
        const{o,g}=mk('sawtooth',280);
        o.frequency.setValueAtTime(240,t);
        o.frequency.linearRampToValueAtTime(330,t+0.22);
        g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.18,t+0.05);
        g.gain.setValueAtTime(0.18,t+0.18);g.gain.exponentialRampToValueAtTime(0.001,t+0.28);
        o.start(t);o.stop(t+0.28);
        break;}

      /* ══════ Timbres courts « clin d'œil » (synthèse pure, aucun sample) ══════ */
      /* Blip pixel — carré très court, aigu */
      case 'ut_blip':{
        const{o,g}=mk('square',740);
        g.gain.setValueAtTime(0.14,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.04);
        o.start(t);o.stop(t+0.04);break;}
      /* Cristal — sinus + harmonique douce */
      case 'nier_beep':{
        const{o,g}=mk('sine',1320),{o:o2,g:g2}=mk('sine',2640);
        g.gain.setValueAtTime(0.10,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
        g2.gain.setValueAtTime(0.04,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.10);
        o.start(t);o.stop(t+0.18);o2.start(t);o2.stop(t+0.10);break;}
      /* Chiptune — deux notes rapides carrées */
      case 'pkm_menu':{
        const{o,g}=mk('square',880);
        o.frequency.setValueAtTime(880,t);o.frequency.setValueAtTime(1175,t+0.05);
        g.gain.setValueAtTime(0.12,t);g.gain.setValueAtTime(0.12,t+0.05);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.14);
        o.start(t);o.stop(t+0.14);break;}
      /* Tourne-page — triangle grave + petit souffle */
      case 'ddlc_page':{
        const{o,g}=mk('triangle',330);
        o.frequency.exponentialRampToValueAtTime(180,t+0.14);
        g.gain.setValueAtTime(0.18,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
        o.start(t);o.stop(t+0.16);
        const{s,g:gn}=noise(ctx,0.08);
        gn.gain.setValueAtTime(0.06,t);gn.gain.exponentialRampToValueAtTime(0.001,t+0.08);
        s.start(t);break;}
      /* Célesta — sinus 1568Hz + quinte 2349Hz */
      case 'wii_click':{
        const{o,g}=mk('sine',1568),{o:o2,g:g2}=mk('sine',2349);
        g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.16,t+0.006);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.32);
        g2.gain.setValueAtTime(0.08,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.18);
        o.start(t);o.stop(t+0.32);o2.start(t);o2.stop(t+0.18);break;}
      /* Ressort — sinus qui monte vite */
      case 'doodle_jump':{
        const{o,g}=mk('sine',300);
        o.frequency.exponentialRampToValueAtTime(900,t+0.16);
        g.gain.setValueAtTime(0.22,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
        o.start(t);o.stop(t+0.18);break;}
      /* Métal grave — confirmation basse fréquence */
      case 'ff7_confirm':{
        const{o,g}=mk('sine',196),{o:o2,g:g2}=mk('sine',392),{o:o3,g:g3}=mk('triangle',784);
        g.gain.setValueAtTime(0.20,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.45);
        g2.gain.setValueAtTime(0.12,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.35);
        g3.gain.setValueAtTime(0.06,t);g3.gain.exponentialRampToValueAtTime(0.001,t+0.22);
        o.start(t);o.stop(t+0.45);o2.start(t);o2.stop(t+0.35);o3.start(t);o3.stop(t+0.22);break;}
    }
  }catch{}
}

export function vib(pattern){
  if(!S.vibOn||!navigator.vibrate)return;
  navigator.vibrate(pattern);
}
