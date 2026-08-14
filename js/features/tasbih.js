/* SAKINA — Module Tasbih : compteur, dhikr bar, préréglages, historique */
import {S,save,todayKey,emit} from '../core/store.js';
import {toast,burst,openSheet,closeSheet,sheetOpen} from '../core/ui.js';
import {playSound,vib,getAC} from '../core/audio.js';
import {DHIKRS,BONUS_DHIKRS} from '../data/catalog.js';
import {isUnlocked,remainingFor,fmtGoal,checkUnlocks} from '../core/rewards.js';
import {t} from '../lib/i18n.js';

const $=id=>document.getElementById(id);
const CIRC=2*Math.PI*104;

/* ── Rendu ── */
function updateRing(pct){
  const arc=$('ring-arc');
  arc.style.strokeDasharray=CIRC;
  arc.style.strokeDashoffset=CIRC-(Math.min(pct,100)/100)*CIRC;
}

export function renderTasbih(){
  $('cnum').textContent=S.count;
  $('t-title').textContent=S.title;
  // Le libellé du bouton dérive uniquement de l'état : « MINÉ » sur le skin
  // Voxel, sinon la traduction courante. Pur (aucune mémoïsation fragile),
  // donc il redevient « APPUYER » dès qu'on quitte le skin.
  const cl=$('clabel');
  if(cl)cl.textContent=(S.skin==='voxel')?t('tasbih.mined'):t('tap.label');
  const nxt=S.reminder>0?(S.reminder-(S.count%S.reminder)):0;
  $('t-sub').textContent=S.reminder>0?t('tasbih.inNext',{n:nxt,r:S.reminder})
    :(S.goal>0?t('tasbih.goalIs',{n:S.goal}):t('tasbih.free'));
  $('sp-laps').textContent=S.lapCount;
  $('sp-total').textContent=S.sessTot;
  $('sp-goal').textContent=S.goal>0?S.goal:'∞';
  const pct=S.goal>0?Math.min((S.count/S.goal)*100,100):0;
  $('prog-fill').style.width=pct+'%';
  updateRing(pct);
  const lb=$('lap-badge');
  if(S.lapCount>0){lb.textContent=t('tasbih.lap',{n:S.lapCount+1});lb.classList.add('show');}
  else lb.classList.remove('show');
}

/* Particules "cassage de bloc" — projetées depuis le tap-btn en mode Voxel */
function voxelParticles(){
  const btn=$('tap-btn');if(!btn)return;
  const r=btn.getBoundingClientRect();
  const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const colors=['#5FE4F5','#B8F2FA','#7A8A9C','#3A4A5C','#E6F0FA'];
  for(let i=0;i<10;i++){
    const p=document.createElement('div');
    p.className='vox-particle';
    p.style.left=cx+'px';p.style.top=cy+'px';
    p.style.background=colors[i%colors.length];
    const ang=Math.random()*Math.PI*2;
    const dist=40+Math.random()*70;
    p.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
    p.style.setProperty('--dy',(Math.sin(ang)*dist-30)+'px');
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }
}

/* ── Compteur ── */
function increment(){
  getAC();
  const beforeAll=S.allTime|0;
  S.count++;S.sessTot++;S.allTime++;
  // Détecte tous les paliers de récompense franchis (thèmes, sons, avatars, titres, dhikrs bonus)
  checkUnlocks(beforeAll,S.allTime);
  const tk=todayKey();
  S.daily[tk]=(S.daily[tk]||0)+1;

  const milestone=(S.reminder>0&&S.count%S.reminder===0)||(S.goal>0&&S.count===S.goal);
  playSound(S.sound,milestone);
  // Bonus Voxel : bruit de minage + gerbe de particules à chaque coup
  if(S.skin==='voxel'){
    if(!milestone)playSound('mc_mine');
    voxelParticles();
  }
  vib(milestone?[70,35,70]:16);

  const cn=$('cnum');
  cn.classList.remove('bump');void cn.offsetWidth;cn.classList.add('bump');

  if(milestone){
    cn.classList.add('gold');burst();
    const tb=$('tap-btn');
    tb.classList.add('flash');
    setTimeout(()=>{cn.classList.remove('gold');tb.classList.remove('flash');},650);
    if(S.goal>0&&S.count>=S.goal){
      toast(t('tsb.goalReached'));S.lapCount++;
      if(S.autoLoop)setTimeout(()=>{S.count=S.startVal;renderTasbih();save();},800);
    }else if(S.reminder>0){
      toast(`✦ ${S.count} — ${S.title}`);
    }
  }
  save();renderTasbih();emit('stats-changed');
  if(_immersiveOpen)renderImmersive(milestone);
}

/* ── Mode plein écran : toute la surface compte, feedback sonore/haptique
   aux paliers → utilisable téléphone en poche, sans regarder ── */
let _immersiveOpen=false;
function renderImmersive(milestone=false){
  $('imm-title').textContent=S.title;
  $('imm-count').textContent=S.count;
  $('imm-sub').textContent=S.goal>0?t('tasbih.immSub',{goal:S.goal,lap:S.lapCount+1}):t('tasbih.immFree');
  const c=$('imm-count');
  if(milestone){
    c.classList.add('gold');
    const ov=$('immersive');
    ov.classList.remove('pulse');void ov.offsetWidth;ov.classList.add('pulse');
    setTimeout(()=>c.classList.remove('gold'),700);
  }
}
function openImmersive(){
  _immersiveOpen=true;
  renderImmersive();
  $('immersive').classList.add('open');
  vib(20);
}
function closeImmersive(){
  _immersiveOpen=false;
  $('immersive').classList.remove('open');
}

function undo(){
  if(S.count<=S.startVal)return;
  S.count--;S.sessTot=Math.max(0,S.sessTot-1);S.allTime=Math.max(0,S.allTime-1);
  const tk=todayKey();
  if(S.daily[tk])S.daily[tk]=Math.max(0,S.daily[tk]-1);
  playSound('click');vib(14);save();renderTasbih();emit('stats-changed');
}

async function resetCounter(){
  const {confirmDlg}=await import('../core/ui.js');
  if(!await confirmDlg(t('tsb.resetAsk'),{okLabel:t('tsb.resetOk')}))return;
  if(S.count>S.startVal)pushHistory();
  S.count=S.startVal;S.lapCount=0;S.sessTot=0;
  vib([60,30,60]);toast(t('msg.reset'));save();renderTasbih();
}

function saveSession(){
  if(S.count<=S.startVal){toast(t('msg.nothingSave'));return;}
  pushHistory();S.sessCount++;
  S.count=S.startVal;S.lapCount=0;S.sessTot=0;   // une session sauvegardée repart proprement
  vib([40,20,40]);toast(t('msg.sessionSaved'));
  save();renderTasbih();emit('stats-changed');
}

function pushHistory(){
  S.history.unshift({title:S.title,count:S.count,goal:S.goal,ts:Date.now()});
  if(S.history.length>60)S.history.pop();
}

/* ── Dhikr bar (catalogue + préréglages personnels) ── */
export function setDhikr({title,goal,reminder,resetCount=true}){
  S.title=title;
  if(goal!==undefined)S.goal=goal;
  if(reminder!==undefined)S.reminder=reminder;
  if(resetCount){S.count=S.startVal;S.lapCount=0;S.sessTot=0;}
  save();renderTasbih();buildDhikrBar();
}

export function buildDhikrBar(){
  const bar=$('dhikr-bar');bar.innerHTML='';
  // Les dhikrs bonus verrouillés ne s'affichent PAS dans la barre principale :
  // impossibles à sélectionner de toute façon, ils sont visibles dans la sheet Bonus.
  const all=[
    ...DHIKRS.map(d=>({...d,custom:false,bonus:false})),
    ...BONUS_DHIKRS.filter(d=>isUnlocked(d)).map(d=>({...d,custom:false,bonus:true})),
    ...S.customDhikrs.map(d=>({...d,custom:true,bonus:false})),
  ];
  all.forEach(d=>{
    const el=document.createElement('div');
    el.className='dchip'+(S.title===d.name?' active':'')+(d.bonus?' bonus':'');
    el.innerHTML=`<span class="dchip-ar">${d.arabic||d.name}</span><span class="dchip-n">${d.goal}×</span>${d.custom?'<span class="dchip-star">★</span>':''}${d.bonus?'<span class="dchip-star">✦</span>':''}`;
    el.addEventListener('click',()=>{
      setDhikr({title:d.name,goal:d.goal,reminder:d.reminder});
      toast(`✦ ${d.name}`);vib(20);
    });
    bar.appendChild(el);
  });
}

/* ── Sheet d'édition + préréglages ── */
function renderPresets(){
  const box=$('custom-presets');box.innerHTML='';
  if(!S.customDhikrs.length){
    box.innerHTML=`<div style="font-size:0.75rem;color:var(--t3);padding:8px 0;">${t('tasbih.noPreset')}</div>`;
    return;
  }
  S.customDhikrs.forEach((p,i)=>{
    const row=document.createElement('div');row.className='preset-row';
    row.innerHTML=`<div class="preset-name">★ ${p.name}</div><div class="preset-meta">${t('tasbih.presetMeta',{goal:p.goal,rem:p.reminder})}</div><div class="preset-del">✕</div>`;
    row.querySelector('.preset-del').addEventListener('click',()=>{
      S.customDhikrs.splice(i,1);save();renderPresets();buildDhikrBar();toast(t('msg.presetDel'));
    });
    box.appendChild(row);
  });
}

function openEdit(){
  $('inp-title').value=S.title;
  $('inp-start').value=S.startVal;
  $('inp-rem').value=S.reminder;
  $('inp-goal').value=S.goal;
  renderPresets();
  openSheet('sh-edit');
}

function readEditForm(){
  return{
    title:$('inp-title').value.trim()||'Dhikr',
    startVal:Math.max(0,parseInt($('inp-start').value)||0),
    reminder:Math.max(0,parseInt($('inp-rem').value)||0),
    goal:Math.max(0,parseInt($('inp-goal').value)||0),
  };
}

/* ── Historique ── */
function fmtTs(h){
  if(h.ts)return new Date(h.ts).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  return h.legacyTime||h.time||'';
}
function buildHistory(){
  const bd=$('hist-bd');
  if(!S.history.length){
    bd.innerHTML=`<div style="text-align:center;padding:40px 0;font-size:0.82rem;color:var(--t3);">${t('tasbih.noSession')}</div>`;
    return;
  }
  bd.innerHTML='';
  S.history.forEach(h=>{
    const el=document.createElement('div');
    el.style.cssText='display:flex;align-items:center;padding:12px 0;border-bottom:1px solid var(--bor2);gap:12px;';
    el.innerHTML=`<div style="width:7px;height:7px;border-radius:50%;background:var(--a);flex-shrink:0;box-shadow:0 0 6px rgba(var(--a-rgb),0.6)"></div>
      <div style="font-family:var(--ff-m);font-size:1rem;color:var(--t1);min-width:42px;">${h.count}</div>
      <div style="flex:1;font-size:0.82rem;color:var(--t2);">${h.title}${h.goal?' / '+h.goal:''}</div>
      <div style="font-size:0.61rem;color:var(--t3);">${fmtTs(h)}</div>`;
    bd.appendChild(el);
  });
}

/* ── Init ── */
export function initTasbih(){
  $('tap-btn').addEventListener('click',increment);
  $('btn-immersive').addEventListener('click',openImmersive);
  $('immersive').addEventListener('click',increment);
  $('imm-exit').addEventListener('click',e=>{e.stopPropagation();closeImmersive();});
  $('btn-undo').addEventListener('click',undo);
  $('btn-reset').addEventListener('click',resetCounter);
  $('btn-save-s').addEventListener('click',saveSession);
  $('btn-edit').addEventListener('click',openEdit);
  $('t-title-wrap').addEventListener('click',openEdit);
  $('btn-hst').addEventListener('click',()=>openSheet('sh-hist',buildHistory));
  $('btn-hlist').addEventListener('click',()=>openSheet('sh-hist',buildHistory));
  $('btn-clr-hist').addEventListener('click',async()=>{
    const {confirmDlg}=await import('../core/ui.js');
    if(!await confirmDlg(t('tsb.clearHistAsk'),{okLabel:t('com.clear')}))return;
    S.history=[];save();buildHistory();vib(40);toast(t('tasbih.histCleared'));
  });

  $('btn-save-edit').addEventListener('click',()=>{
    const f=readEditForm();
    S.title=f.title;S.startVal=f.startVal;S.reminder=f.reminder;S.goal=f.goal;
    if(S.count<S.startVal)S.count=S.startVal;
    save();renderTasbih();buildDhikrBar();closeSheet();
    vib([40,20,40]);toast(t('tasbih.saved'));
  });

  $('btn-pin-dhikr').addEventListener('click',()=>{
    const f=readEditForm();
    if(S.customDhikrs.some(p=>p.name===f.title)){toast(t('tasbih.alreadyPinned'));return;}
    S.customDhikrs.push({name:f.title,goal:f.goal,reminder:f.reminder});
    save();renderPresets();buildDhikrBar();
    vib(24);toast(t('tasbih.pinned',{name:f.title}));
  });

  // Steppers de la sheet d'édition
  [['ss-m','ss-p','inp-start'],['sr-m','sr-p','inp-rem'],['sg-m','sg-p','inp-goal']].forEach(([mid,pid,iid])=>{
    $(mid).addEventListener('click',()=>{const el=$(iid);el.value=Math.max(0,(parseInt(el.value)||0)-1);});
    $(pid).addEventListener('click',()=>{const el=$(iid);el.value=(parseInt(el.value)||0)+1;});
  });
  document.querySelectorAll('.chip[data-for]').forEach(c=>{
    c.addEventListener('click',()=>{$(c.dataset.for).value=c.dataset.val;});
  });

  // Clavier : espace/entrée = +1, retour/z = annuler (page tasbih uniquement)
  document.addEventListener('keydown',e=>{
    if(sheetOpen())return;
    const active=document.querySelector('.page.active');
    if(!active||active.id!=='page-tasbih')return;
    if(e.key===' '||e.key==='Enter'){e.preventDefault();increment();}
    if(e.key==='Backspace'||e.key.toLowerCase()==='z'){e.preventDefault();undo();}
  });

  buildDhikrBar();
  renderTasbih();
}
