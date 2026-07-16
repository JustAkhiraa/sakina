/* SAKINA — Routines d'adhkâr guidées : enchaînement d'étapes avec compteur,
   avancement automatique, progression globale. Les taps alimentent les
   statistiques quotidiennes comme le tasbih. */
import {S,save,todayKey,emit} from '../core/store.js';
import {toast,burst,openSheet} from '../core/ui.js';
import {playSound,vib,getAC} from '../core/audio.js';
import {ROUTINES} from '../data/routines.js';

const $=id=>document.getElementById(id);
let _routine=null;
let _stepIdx=0;
let _count=0;

function totalTaps(r){return r.steps.reduce((s,x)=>s+x.count,0);}
function doneTaps(){
  return _routine.steps.slice(0,_stepIdx).reduce((s,x)=>s+x.count,0)+_count;
}

function openPicker(){
  const list=$('routines-list');list.innerHTML='';
  ROUTINES.forEach(r=>{
    const row=document.createElement('div');row.className='row';
    row.innerHTML=`<div class="row-ic">${r.icon}</div>
      <div class="row-body"><div class="row-name">${r.name}</div><div class="row-sub">${r.desc} · ${r.steps.length} étapes, ${totalTaps(r)} répétitions</div></div>
      <svg class="row-chev" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
    row.addEventListener('click',()=>startRoutine(r));
    list.appendChild(row);
  });
  openSheet('sh-routines');
}

function startRoutine(r){
  _routine=r;_stepIdx=0;_count=0;
  $('routine-title').textContent=`${r.icon} ${r.name}`;
  renderStep();
  openSheet('sh-routine');
}

function renderStep(){
  const step=_routine.steps[_stepIdx];
  $('rt-step-label').textContent=`Étape ${_stepIdx+1}/${_routine.steps.length}`;
  $('rt-step-title').textContent=step.title;
  // Arabe ou phonétique selon la préférence (bouton abc/عربي + réglage)
  const usePh=S.translit==='ph'&&step.ph;
  $('rt-ar').textContent=usePh?step.ph:(step.ar||'');
  $('rt-ar').classList.toggle('latin',!!usePh);
  $('rt-translit').textContent=S.translit==='ph'?'عربي':'abc';
  $('rt-note').textContent=step.note||'';
  $('rt-note').style.display=step.note?'block':'none';
  $('rt-count').textContent=_count;
  $('rt-target').textContent='/ '+step.count;
  $('rt-step-fill').style.width=(_count/step.count*100)+'%';
  $('rt-total-fill').style.width=(doneTaps()/totalTaps(_routine)*100)+'%';
  $('rt-prev').style.visibility=_stepIdx>0?'visible':'hidden';
  $('rt-next').textContent=_stepIdx<_routine.steps.length-1?'Étape suivante ›':'Terminer ✦';
}

function tap(){
  getAC();
  const step=_routine.steps[_stepIdx];
  if(_count>=step.count)return;
  _count++;
  S.allTime++;
  const tk=todayKey();
  S.daily[tk]=(S.daily[tk]||0)+1;
  save();emit('stats-changed');

  const done=_count===step.count;
  playSound(S.sound,done);
  vib(done?[70,35,70]:14);
  const zone=$('rt-tap');
  zone.classList.remove('bump');void zone.offsetWidth;zone.classList.add('bump');

  if(done){
    if(_stepIdx<_routine.steps.length-1){
      burst();
      setTimeout(()=>{_stepIdx++;_count=0;renderStep();},450);
    }else{
      finishRoutine();
    }
  }
  renderStep();
}

function finishRoutine(){
  burst();
  toast(`✦ ${_routine.name} accomplie — qu'Allah l'accepte`);
  vib([80,40,80,40,120]);
  setTimeout(()=>openPicker(),700);
}

export function initRoutines(){
  $('btn-open-routines').addEventListener('click',openPicker);
  $('duas-routines-banner').addEventListener('click',openPicker);
  $('rt-translit').addEventListener('click',()=>{
    S.translit=S.translit==='ph'?'ar':'ph';
    save();renderStep();vib(14);
    // synchronise le sélecteur des Réglages
    document.querySelectorAll('#translit-seg .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.tr===S.translit));
  });
  $('rt-tap').addEventListener('click',tap);
  $('rt-prev').addEventListener('click',()=>{
    if(_stepIdx>0){_stepIdx--;_count=0;renderStep();vib(14);}
  });
  $('rt-next').addEventListener('click',()=>{
    if(_stepIdx<_routine.steps.length-1){_stepIdx++;_count=0;renderStep();vib(14);}
    else finishRoutine();
  });
}
