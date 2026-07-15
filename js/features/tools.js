/* SAKINA — Outils : Qadâ', Rak'ah, Zakat, convertisseur hégirien, calendrier du jeûne */
import {S,save,emit} from '../core/store.js';
import {toast,burst,openSheet,closeSheet,confirmDlg} from '../core/ui.js';
import {playSound,vib} from '../core/audio.js';
import {QADA_PRAYERS,RAKAH_REF} from '../data/catalog.js';
import {toHijri,hijriLabelAr,hijriLabelFr,toArabicNum,HIJRI_MONTHS_FR,HIJRI_MONTHS_AR,HIJRI_SACRED,isRamadan,isWhiteDay,isAshura,isArafat} from '../lib/hijri.js';

const $=id=>document.getElementById(id);

/* ══════════ QADÂ' ══════════ */
let _qdaMode='jours';
const qdaTotal=()=>QADA_PRAYERS.reduce((s,p)=>s+(S.qada[p.key]||0),0);
const qdaDone =()=>QADA_PRAYERS.reduce((s,p)=>s+(S.qdone[p.key]||0),0);

function renderQada(){
  const zone=$('qada-zone');
  const total=qdaTotal(),done=qdaDone();
  const pct=total+done>0?Math.min((done/(total+done))*100,100):0;
  zone.innerHTML=`
    <div class="qada-hero gc">
      <div class="qada-total">${total}</div>
      <div class="qada-total-lbl">Prières à rattraper</div>
      <div class="qada-progress-wrap"><div class="qada-progress-bar" style="width:${pct}%"></div></div>
      <div class="qada-note">${done} rattrapées · ${pct.toFixed(0)}% accompli</div>
    </div>
    <div class="mode-seg">
      <div class="mode-btn ${_qdaMode==='jours'?'active':''}" id="qdm-j">Jours</div>
      <div class="mode-btn ${_qdaMode==='ans'?'active':''}" id="qdm-a">Années</div>
    </div>
    <div class="qada-input-row">
      <input class="qada-inp" type="number" id="qda-inp" placeholder="${_qdaMode==='jours'?'Nb de jours':"Nb d'années"}" min="1">
      <div class="qada-ok" id="qda-apply">Ajouter</div>
    </div>
    <div class="sl" style="margin:4px 0 8px">Prières manquées</div>
    <div class="qada-grid" id="qada-rows"></div>
    <div class="qada-reset-row">
      <div class="qada-reset-btn" id="qda-reset-done">Reset rattrapées</div>
      <div class="qada-reset-btn" id="qda-reset-all">Tout effacer</div>
    </div>
    <div style="height:8px"></div>`;

  $('qdm-j').addEventListener('click',()=>{_qdaMode='jours';renderQada();});
  $('qdm-a').addEventListener('click',()=>{_qdaMode='ans';renderQada();});
  $('qda-apply').addEventListener('click',()=>{
    const raw=parseInt($('qda-inp').value)||0;
    if(raw<=0){toast('Entrez un nombre valide');return;}
    const days=_qdaMode==='ans'?Math.round(raw*354.37):raw; // année lunaire
    QADA_PRAYERS.forEach(p=>{S.qada[p.key]=(S.qada[p.key]||0)+days;});
    save();renderQada();emit('stats-changed');
    toast(`+${days} jours ajoutés`);vib([40,20,40]);
  });
  $('qda-reset-done').addEventListener('click',async()=>{
    if(!await confirmDlg('Réinitialiser les prières rattrapées ?',{okLabel:'Réinitialiser'}))return;
    QADA_PRAYERS.forEach(p=>{S.qdone[p.key]=0;});
    save();renderQada();toast('Rattrapées réinitialisées');
  });
  $('qda-reset-all').addEventListener('click',async()=>{
    if(!await confirmDlg('Effacer toutes les prières manquées ?',{okLabel:'Tout effacer'}))return;
    QADA_PRAYERS.forEach(p=>{S.qada[p.key]=0;S.qdone[p.key]=0;});
    save();renderQada();emit('stats-changed');
    toast('Tout effacé');vib([60,30,60]);
  });

  const rowsEl=$('qada-rows');
  QADA_PRAYERS.forEach(p=>{
    const q=S.qada[p.key]||0,dn=S.qdone[p.key]||0,isDone=q===0;
    const row=document.createElement('div');row.className='qada-row gc';
    row.innerHTML=`<div class="qada-row-icon">${p.icon}</div>
      <div class="qada-row-name"><div class="qada-row-title">${p.name}${isDone?' <span class="done-badge">✓ À jour</span>':''}</div><div class="qada-row-ar">${p.arabic}</div><div class="qada-done-count">${dn} rattrapées</div></div>
      <div class="qada-ctrls"><div class="qada-btn minus">−</div><div class="qada-val${isDone?' done':''}">${q}</div><div class="qada-btn plus">+</div></div>`;
    row.querySelector('.qada-btn.plus').addEventListener('click',e=>{
      e.stopPropagation();
      S.qada[p.key]=(S.qada[p.key]||0)+1;
      save();renderQada();emit('stats-changed');vib(16);
    });
    row.querySelector('.qada-btn.minus').addEventListener('click',e=>{
      e.stopPropagation();
      if((S.qada[p.key]||0)<=0){toast('Déjà à jour !');return;}
      S.qada[p.key]--;S.qdone[p.key]=(S.qdone[p.key]||0)+1;
      playSound('drop');vib([30,10,30]);
      if(S.qada[p.key]===0){toast(`🎉 ${p.name} — À jour !`);burst();}
      else toast(`✓ ${p.name} — ${S.qada[p.key]} restantes`);
      save();renderQada();emit('stats-changed');
    });
    rowsEl.appendChild(row);
  });
}

/* ══════════ RAK'AH ══════════ */
let _rkPrayer='fajr',_rkCount=0,_rkSujoud=0;

function renderRakahUI(){
  const total=RAKAH_REF[_rkPrayer]||4;
  const p=QADA_PRAYERS.find(x=>x.key===_rkPrayer);
  $('rakah-count').textContent=_rkCount;
  $('rakah-prayer-ar').textContent=p?p.arabic:'';
  $('sujoud-count').textContent=_rkSujoud;
  const dots=$('rakah-dots');dots.innerHTML='';
  for(let i=0;i<total;i++){
    const d=document.createElement('div');
    d.className='rakah-dot'+(i<_rkCount?' done':i===_rkCount?' current':'');
    dots.appendChild(d);
  }
  document.querySelectorAll('#rakah-prayer-sel .chip').forEach((el,i)=>{
    el.classList.toggle('sel',QADA_PRAYERS[i].key===_rkPrayer);
  });
}
function renderRakah(){
  const sel=$('rakah-prayer-sel');sel.innerHTML='';
  QADA_PRAYERS.forEach(p=>{
    const el=document.createElement('div');
    el.className='chip'+(_rkPrayer===p.key?' sel':'');
    el.innerHTML=`${p.icon} ${p.name}`;
    el.addEventListener('click',()=>{_rkPrayer=p.key;_rkCount=0;_rkSujoud=0;renderRakahUI();});
    sel.appendChild(el);
  });
  renderRakahUI();
}

/* ══════════ ZAKAT ══════════ */
let _zSym='€';
function calcZakat(){
  const nisab=parseFloat($('z-nisab').value)||0;
  const wealth=parseFloat($('z-wealth').value)||0;
  const amt=$('zakat-amount'),st=$('zakat-status');
  if(wealth<=0){amt.textContent=`0 ${_zSym}`;st.textContent='Entrez votre patrimoine';return;}
  if(wealth<nisab){amt.textContent=`0 ${_zSym}`;st.textContent=`✗ Patrimoine (${wealth.toLocaleString('fr-FR')} ${_zSym}) < Nisab (${nisab.toLocaleString('fr-FR')} ${_zSym}). Pas de Zakat due.`;return;}
  const due=(wealth*0.025).toLocaleString('fr-FR',{maximumFractionDigits:2});
  amt.textContent=`${due} ${_zSym}`;
  st.textContent=`✓ Patrimoine ≥ Nisab → Zakat due : 2.5%`;
}

/* ══════════ CONVERTISSEUR HÉGIRIEN ══════════ */
function openHijriSheet(){
  openSheet('sh-hijri',()=>{
    const now=new Date();
    const h=toHijri(now);
    $('hconv-hijri-today').textContent=hijriLabelAr(h);
    $('hconv-greg-today').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+` · ${hijriLabelFr(h)}`;
    const inp=$('hconv-inp');
    inp.value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const ml=$('hijri-months-list');ml.innerHTML='';
    HIJRI_MONTHS_FR.forEach((m,i)=>{
      const sacred=HIJRI_SACRED.includes(i);
      const div=document.createElement('div');div.className='row';div.style.cursor='default';
      div.innerHTML=`<div class="row-ic" style="font-family:var(--ff-a);font-size:0.85rem;width:42px;">${HIJRI_MONTHS_AR[i].split(' ')[0]}</div>
        <div class="row-body"><div class="row-name">${m}</div><div class="row-sub">Mois ${i+1}${sacred?' · Mois sacré':''}</div></div>
        ${sacred?'<div style="font-size:0.62rem;color:var(--a);font-weight:800;padding:2px 7px;border-radius:var(--r-pill);background:var(--a-dim);border:1px solid var(--a-glow);">Sacré</div>':''}`;
      if(i===11)div.style.borderBottom='none';
      ml.appendChild(div);
    });
  });
}

/* ══════════ CALENDRIER DU JEÛNE ══════════ */
let _fastYear=new Date().getFullYear(),_fastMonth=new Date().getMonth();

function renderFastingCalendar(){
  const bd=$('fasting-bd');
  const y=_fastYear,m=_fastMonth;
  const now=new Date();
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  const days=last.getDate();
  const startDow=(first.getDay()+6)%7; // Lundi=0
  const mName=first.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});

  let fastCount=0,whiteCount=0,ramCount=0;
  const dayInfo=[];
  for(let d=1;d<=days;d++){
    const dt=new Date(y,m,d);
    const h=toHijri(dt);
    const info={d,dow:dt.getDay(),h,ram:isRamadan(h),white:isWhiteDay(h),ash:isAshura(h),araf:isArafat(h)};
    dayInfo.push(info);
    if(info.ram){ramCount++;fastCount++;}
    else if(info.white)whiteCount++;
    else if(info.dow===1||info.dow===4)fastCount++;
    if(info.ash||info.araf)fastCount++;
  }

  let html=`<div class="fasting-stats">
    <div class="fs-card"><div class="fs-val">${ramCount||'—'}</div><div class="fs-lbl">Ramadan</div></div>
    <div class="fs-card"><div class="fs-val">${whiteCount}</div><div class="fs-lbl">Jours blancs</div></div>
    <div class="fs-card"><div class="fs-val">${fastCount}</div><div class="fs-lbl">Recommandés</div></div>
  </div>
  <div id="fasting-cal-header">
    <div class="fasting-nav" id="fast-prev">&#8249;</div>
    <div id="fasting-month-title">${mName.charAt(0).toUpperCase()+mName.slice(1)}</div>
    <div class="fasting-nav" id="fast-next">&#8250;</div>
  </div>
  <div class="fasting-grid-header">${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=>`<div class="fasting-day-label">${d}</div>`).join('')}</div>
  <div class="fasting-grid">`;
  for(let i=0;i<startDow;i++)html+='<div class="fc-day empty"></div>';
  dayInfo.forEach(info=>{
    const isToday=(info.d===now.getDate()&&m===now.getMonth()&&y===now.getFullYear());
    const isMon=info.dow===1,isThu=info.dow===4,isWE=info.dow===0||info.dow===6;
    let cls='fc-day';
    if(isToday)cls+=' today';
    if(info.ram)cls+=' ramadan';
    else if(info.araf)cls+=' arafat';
    else if(info.ash)cls+=' ashura';
    else if(info.white)cls+=' white-day';
    else if(isMon)cls+=' monday';
    else if(isThu)cls+=' thursday';
    if(isWE)cls+=' weekend';
    const dot=(info.ram||info.white||isMon||isThu||info.ash||info.araf)?'<div class="fc-dot"></div>':'';
    html+=`<div class="${cls}" title="${hijriLabelFr(info.h)}"><span>${info.d}</span><span class="fc-hijri">${toArabicNum(info.h.day)}</span>${dot}</div>`;
  });
  html+=`</div>
  <div class="fasting-legend">
    <div class="fl-item"><div class="fl-dot" style="background:rgba(201,169,110,0.5)"></div>Ramadan</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(212,195,140,0.7)"></div>Jours blancs 13-14-15</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(22,163,74,0.5)"></div>Lundi / Jeudi</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(37,99,235,0.5)"></div>Achoura (10 Mouharram)</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(194,65,12,0.5)"></div>Arafat (9 Dhou al-Hijja)</div>
  </div>
  <div style="font-size:0.7rem;color:var(--t3);margin-top:12px;line-height:1.6;padding:10px;background:var(--sur2);border-radius:var(--r-md);border:1px solid var(--bor2);">
    <strong style="color:var(--t2)">Note :</strong> Dates indicatives (calendrier tabulaire), peuvent varier selon l'observation de la lune. Consultez votre mosquée.
  </div>`;
  bd.innerHTML=html;
  $('fast-prev').addEventListener('click',()=>{_fastMonth--;if(_fastMonth<0){_fastMonth=11;_fastYear--;}renderFastingCalendar();});
  $('fast-next').addEventListener('click',()=>{_fastMonth++;if(_fastMonth>11){_fastMonth=0;_fastYear++;}renderFastingCalendar();});
}

/* ══════════ INIT ══════════ */
export function initTools(){
  // Qadâ'
  $('btn-open-qada').addEventListener('click',()=>openSheet('sh-qada',renderQada));
  $('btn-qada-info2').addEventListener('click',()=>{
    closeSheet();
    setTimeout(()=>openSheet('sh-qada-info-inner'),320);
  });

  // Rak'ah
  $('btn-open-rakah').addEventListener('click',()=>openSheet('sh-rakah',renderRakah));
  $('btn-reset-rakah').addEventListener('click',()=>{_rkCount=0;_rkSujoud=0;renderRakahUI();toast("Rak'ahs remises à zéro");vib([40,20,40]);});
  $('rakah-plus').addEventListener('click',()=>{
    const total=RAKAH_REF[_rkPrayer]||4;
    if(_rkCount>=total){
      toast(`🎉 ${QADA_PRAYERS.find(x=>x.key===_rkPrayer)?.name} terminée !`);
      burst();playSound(S.sound,true);vib([80,40,80]);
      return;
    }
    _rkCount++;_rkSujoud=0;playSound(S.sound);vib(20);renderRakahUI();
    if(_rkCount===total)setTimeout(()=>toast(`✓ ${_rkCount}/${total} rak'ahs accomplis`),100);
  });
  $('rakah-minus').addEventListener('click',()=>{
    if(_rkCount<=0)return;
    _rkCount--;_rkSujoud=0;playSound('click');vib(14);renderRakahUI();
  });
  $('sujoud-plus').addEventListener('click',()=>{_rkSujoud++;$('sujoud-count').textContent=_rkSujoud;playSound('click');vib(12);});
  $('sujoud-minus').addEventListener('click',()=>{if(_rkSujoud>0){_rkSujoud--;$('sujoud-count').textContent=_rkSujoud;}});

  // Zakat
  $('btn-open-zakat').addEventListener('click',()=>openSheet('sh-zakat',()=>{
    document.querySelectorAll('#zakat-currency .chip').forEach(c=>{
      c.classList.toggle('sel',c.dataset.sym===_zSym);
    });
    calcZakat();
  }));
  document.querySelectorAll('#zakat-currency .chip').forEach(c=>{
    c.addEventListener('click',()=>{
      _zSym=c.dataset.sym;
      $('zakat-cur-lbl').textContent=c.dataset.cur;
      $('zakat-sym-lbl').textContent=_zSym;
      document.querySelectorAll('#zakat-currency .chip').forEach(x=>x.classList.toggle('sel',x===c));
      calcZakat();
    });
  });
  [['z-nisab-m','z-nisab',-100],['z-nisab-p','z-nisab',100],['z-wealth-m','z-wealth',-100],['z-wealth-p','z-wealth',100]].forEach(([btn,inp,step])=>{
    $(btn).addEventListener('click',()=>{
      const el=$(inp);
      el.value=Math.max(0,(parseFloat(el.value)||0)+step);
      calcZakat();
    });
  });
  ['z-nisab','z-wealth'].forEach(id=>$(id).addEventListener('input',calcZakat));

  // Convertisseur hégirien
  $('btn-open-hijri').addEventListener('click',openHijriSheet);
  $('btn-hconv').addEventListener('click',()=>{
    const val=$('hconv-inp').value;
    if(!val)return;
    const d=new Date(val+'T12:00:00');
    const h=toHijri(d);
    $('hconv-result-hijri').textContent=hijriLabelAr(h);
    $('hconv-result-greg').textContent=`${d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · ${hijriLabelFr(h)}`;
    $('hconv-result').style.display='block';
  });

  // Calendrier du jeûne
  $('btn-open-fasting').addEventListener('click',()=>{
    _fastYear=new Date().getFullYear();_fastMonth=new Date().getMonth();
    openSheet('sh-fasting',renderFastingCalendar);
  });
}
