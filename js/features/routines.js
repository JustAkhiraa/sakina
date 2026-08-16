/* SAKINA — Routines d'adhkâr guidées : enchaînement d'étapes avec compteur,
   avancement automatique, progression globale. Les taps alimentent les
   statistiques quotidiennes comme le tasbih. */
import {S,save,todayKey,emit} from '../core/store.js';
import {toast,burst,openSheet} from '../core/ui.js';
import {playSound,vib,getAC} from '../core/audio.js';
import {t,tf} from '../lib/i18n.js';
import {ROUTINES} from '../data/routines.js';
import {PHONETICS} from '../data/phonetics.js';

const $=id=>document.getElementById(id);

/* Les etapes n'ont pas d'identifiant : on indexe leur texte par un slug.
   Content-addresse plutot que positionnel — si le texte francais change, la
   cle change avec lui et l'affichage retombe simplement sur le francais,
   plutot que de coller une traduction sur la mauvaise etape.
   Ce calcul doit rester identique a celui de scripts/ (generation des cles). */
const slug=s=>(s||'').normalize('NFKD').replace(/[̀-ͯ]/g,'')
  .replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()
  .replace(/-{2,}/g,'-').slice(0,34);

export const rtName =r=>tf(`rt.${r.id}.n`,r.name);
export const rtDesc =r=>tf(`rt.${r.id}.d`,r.desc);
const stepTitle=st=>tf(`rtx.${slug(st.title)}`,st.title);
/* Phonetique dans l'ecriture du lecteur, comme pour les invocations.
   L'arabe, le persan et l'ourdou n'en ont pas besoin : ils lisent deja le
   texte original, que le bouton de bascule leur rend. */
const stepPhonetic=st=>
  (PHONETICS[S.lang]||{})[`rtx.${slug(st.title)}`]||st.ph||'';
const stepNote =st=>st.note?tf(`rtn.${slug(st.note)}`,st.note):'';
let _routine=null;
let _stepIdx=0;
let _count=0;

function totalTaps(r){return r.steps.reduce((s,x)=>s+x.count,0);}
function doneTaps(){
  return _routine.steps.slice(0,_stepIdx).reduce((s,x)=>s+x.count,0)+_count;
}

function buildPicker(){
  const list=$('routines-list');list.innerHTML='';
  ROUTINES.forEach(r=>{
    const row=document.createElement('div');row.className='row';
    row.innerHTML=`<div class="row-ic">${r.icon}</div>
      <div class="row-body"><div class="row-name">${rtName(r)}</div><div class="row-sub">${rtDesc(r)} · ${t('rt.summary',{n:r.steps.length,r:totalTaps(r)})}</div></div>
      <svg class="row-chev" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
    row.addEventListener('click',()=>startRoutine(r));
    list.appendChild(row);
  });
}

function openPicker(){buildPicker();openSheet('sh-routines');}

/* Changement de langue : la liste et l'etape en cours sont baties en JS, donc
   invisibles pour applyI18n. Sans ca, une routine ouverte reste en francais. */
export function refreshRoutines(){
  if($('routines-list').children.length)buildPicker();
  if(_routine){
    $('routine-title').textContent=`${_routine.icon} ${rtName(_routine)}`;
    renderStep();
  }
}

function startRoutine(r){
  _routine=r;_stepIdx=0;_count=0;
  $('routine-title').textContent=`${r.icon} ${rtName(r)}`;
  renderStep();
  openSheet('sh-routine');
}

function renderStep(){
  const step=_routine.steps[_stepIdx];
  $('rt-step-label').textContent=t('routines.step',{n:_stepIdx+1,total:_routine.steps.length});
  $('rt-step-title').textContent=stepTitle(step);
  // Arabe ou phonétique selon la préférence (bouton abc/عربي + réglage)
  const usePh=S.translit==='ph'&&step.ph;
  $('rt-ar').textContent=usePh?stepPhonetic(step):(step.ar||'');
  // La classe « latin » met le texte en italique — un usage propre a
  // l'alphabet latin, qui deforme katakana et devanagari.
  $('rt-ar').classList.toggle('latin',!!usePh&&!PHONETICS[S.lang]);
  // « abc » ne veut rien dire a qui ne lit pas l'alphabet latin : le bouton
  // porte le nom de l'ecriture vers laquelle il bascule.
  $('rt-translit').textContent=S.translit==='ph'?t('routines.toArabic'):t('routines.toPhonetic');
  $('rt-note').textContent=stepNote(step);
  $('rt-note').style.display=step.note?'block':'none';
  $('rt-count').textContent=_count;
  $('rt-target').textContent='/ '+step.count;
  $('rt-step-fill').style.width=(_count/step.count*100)+'%';
  $('rt-total-fill').style.width=(doneTaps()/totalTaps(_routine)*100)+'%';
  $('rt-prev').style.visibility=_stepIdx>0?'visible':'hidden';
  $('rt-next').textContent=_stepIdx<_routine.steps.length-1?t('routines.nextStep'):t('routines.finish');
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
  toast(t('rt.done',{name:rtName(_routine)}));
  vib([80,40,80,40,120]);
  setTimeout(()=>openPicker(),700);
}

/* Point d'entrée de la recherche globale : lancer une routine par son id. */
export function openRoutine(id){
  const r=ROUTINES.find(x=>x.id===id);
  if(r)startRoutine(r);
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
