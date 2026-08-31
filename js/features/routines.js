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
/* Etapes minutees : certaines adorations se mesurent en temps, pas en
   repetitions — « cinq minutes d'istighfar » n'est pas « cent istighfar ».
   L'etape porte alors `secs` au lieu de `count`, et la carte devient un
   minuteur qu'on demarre et met en pause du meme geste. */
let _timer=null;
let _reste=0;
let _enMarche=false;

const estMinutee=st=>!!st.secs;
const mmss=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

/* Les repetitions annoncees dans le catalogue : une etape minutee n'en a
   aucune, et en inventer fausserait le resume. */
function totalTaps(r){return r.steps.reduce((s,x)=>s+(x.count||0),0);}

/* La barre globale, elle, doit avancer aussi pendant une etape minutee. On
   compte une invocation toutes les trois secondes — la cadence ordinaire d'un
   dhikr pose. C'est une convention d'affichage : rien d'autre n'en depend. */
const poids=st=>estMinutee(st)?Math.max(1,Math.round(st.secs/3)):st.count;
function totalPoids(r){return r.steps.reduce((s,x)=>s+poids(x),0);}
function faitPoids(){
  const st=_routine.steps[_stepIdx];
  const enCours=estMinutee(st)?poids(st)*(1-_reste/st.secs):_count;
  return _routine.steps.slice(0,_stepIdx).reduce((s,x)=>s+poids(x),0)+enCours;
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
  _routine=r;
  $('routine-title').textContent=`${r.icon} ${rtName(r)}`;
  entre(0);
  openSheet('sh-routine');
}

/* Une suite composee par le lecteur, jouee par le meme moteur que les
   routines du catalogue. Rien de neuf ici : startRoutine accepte n'importe
   quel objet de cette forme, il suffisait de le lui donner. */
export function startSeries(steps,nom){
  if(!steps.length)return;
  startRoutine({id:'serie',name:nom,icon:'✦',desc:'',steps});
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
  const minutee=estMinutee(step);
  $('rt-count').textContent=minutee?mmss(_reste):_count;
  $('rt-target').textContent='/ '+(minutee?mmss(step.secs):step.count);
  $('rt-hint').textContent=minutee
    ?t(_enMarche?'routines.tapToPause':'routines.tapToStart')
    :t('routines.tapToCount');
  $('rt-step-fill').style.width=
    ((minutee?1-_reste/step.secs:_count/step.count)*100)+'%';
  $('rt-total-fill').style.width=(faitPoids()/totalPoids(_routine)*100)+'%';
  $('rt-prev').style.visibility=_stepIdx>0?'visible':'hidden';
  $('rt-next').textContent=_stepIdx<_routine.steps.length-1?t('routines.nextStep'):t('routines.finish');
}

/* Entrer dans une etape : c'est le seul endroit ou `_count` et le minuteur
   sont remis a zero, pour qu'aucun chemin ne puisse en oublier un. */
function entre(idx){
  arreteTimer();
  _stepIdx=idx;_count=0;
  _reste=_routine.steps[idx].secs||0;
  renderStep();
}

function arreteTimer(){
  if(_timer){clearInterval(_timer);_timer=null;}
  _enMarche=false;
}

/* Le minuteur s'arrete des que la feuille se ferme : sans cela il continue de
   courir en fond, et l'etape se termine toute seule dans le vide. */
export function stopRoutineTimer(){
  if(_timer){arreteTimer();renderStep();}
}

function basculeMinuteur(){
  if(_enMarche){arreteTimer();renderStep();vib(14);return;}
  getAC();
  _enMarche=true;
  _timer=setInterval(()=>{
    _reste=Math.max(0,_reste-1);
    if(_reste===0){
      arreteTimer();
      playSound(S.sound,true);vib([70,35,70]);
      if(_stepIdx<_routine.steps.length-1){
        burst();
        setTimeout(()=>entre(_stepIdx+1),450);
      }else{
        finishRoutine();
      }
    }
    renderStep();
  },1000);
  renderStep();vib(14);
}

function tap(){
  const st=_routine.steps[_stepIdx];
  if(estMinutee(st)){basculeMinuteur();return;}
  getAC();
  const step=st;
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
      setTimeout(()=>entre(_stepIdx+1),450);
    }else{
      finishRoutine();
    }
  }
  renderStep();
}

function finishRoutine(){
  arreteTimer();
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
  document.addEventListener('sheet-closed',stopRoutineTimer);
  $('rt-prev').addEventListener('click',()=>{
    if(_stepIdx>0){entre(_stepIdx-1);vib(14);}
  });
  $('rt-next').addEventListener('click',()=>{
    if(_stepIdx<_routine.steps.length-1){entre(_stepIdx+1);vib(14);}
    else finishRoutine();
  });
}
