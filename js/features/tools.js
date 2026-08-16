/* SAKINA — Outils : Qadâ', Rak'ah, Zakat, convertisseur hégirien, calendrier du jeûne */
import {S,save,emit} from '../core/store.js';
import {toast,burst,openSheet,closeSheet,confirmDlg} from '../core/ui.js';
import {playSound,vib} from '../core/audio.js';
import {t,tf,n as num} from '../lib/i18n.js';
import {QADA_PRAYERS} from '../data/catalog.js';
import {toHijri,hijriLabelAr,toArabicNum,HIJRI_MONTHS_FR,HIJRI_MONTHS_AR,HIJRI_SACRED,isRamadan,isWhiteDay,isAshura,isArafat} from '../lib/hijri.js';

const $=id=>document.getElementById(id);

/* Les mois hegiriens sont des noms propres arabes : chaque langue les
   translittere dans son ecriture, le francais de hijri.js servant de repli.
   Chiffres bruts volontairement : num() insererait un separateur de milliers
   dans l'annee (1447 → « 1 447 »). */
const hijMonth=i=>tf(`hij.${i}`,HIJRI_MONTHS_FR[i]);
const hijriLabel=h=>`${h.day} ${hijMonth(h.month)} ${h.year}`;

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
      <div class="qada-total-lbl">${t('tools.qadaTotal')}</div>
      <div class="qada-progress-wrap"><div class="qada-progress-bar" style="width:${pct}%"></div></div>
      <div class="qada-note">${t('tools.qadaNote',{done,pct:pct.toFixed(0)})}</div>
    </div>
    <div class="mode-seg">
      <div class="mode-btn ${_qdaMode==='jours'?'active':''}" id="qdm-j">${t('tools.days')}</div>
      <div class="mode-btn ${_qdaMode==='ans'?'active':''}" id="qdm-a">${t('tools.years')}</div>
    </div>
    <div class="qada-input-row">
      <input class="qada-inp" type="number" id="qda-inp" placeholder="${_qdaMode==='jours'?t('tools.phDays'):t('tools.phYears')}" min="1">
      <div class="qada-ok" id="qda-apply">${t('tools.add')}</div>
    </div>
    <div class="sl" style="margin:4px 0 8px">${t('tools.qadaMissed')}</div>
    <div class="qada-grid" id="qada-rows"></div>
    <div class="qada-reset-row">
      <div class="qada-reset-btn" id="qda-reset-done">${t('tools.qadaResetDone')}</div>
      <div class="qada-reset-btn" id="qda-reset-all">${t('com.clearAll')}</div>
    </div>
    <div style="height:8px"></div>`;

  $('qdm-j').addEventListener('click',()=>{_qdaMode='jours';renderQada();});
  $('qdm-a').addEventListener('click',()=>{_qdaMode='ans';renderQada();});
  $('qda-apply').addEventListener('click',()=>{
    const raw=parseInt($('qda-inp').value)||0;
    if(raw<=0){toast(t('msg.badNumber'));return;}
    const days=_qdaMode==='ans'?Math.round(raw*354.37):raw; // année lunaire
    QADA_PRAYERS.forEach(p=>{S.qada[p.key]=(S.qada[p.key]||0)+days;});
    save();renderQada();emit('stats-changed');
    toast(t('msg.daysAdded',{n:days}));vib([40,20,40]);
  });
  $('qda-reset-done').addEventListener('click',async()=>{
    if(!await confirmDlg(t('tools.qadaResetDoneAsk'),{okLabel:t('com.reset')}))return;
    QADA_PRAYERS.forEach(p=>{S.qdone[p.key]=0;});
    save();renderQada();toast(t('msg.madeUpReset'));
  });
  $('qda-reset-all').addEventListener('click',async()=>{
    if(!await confirmDlg(t('tools.qadaClearAsk'),{okLabel:t('com.clearAll')}))return;
    QADA_PRAYERS.forEach(p=>{S.qada[p.key]=0;S.qdone[p.key]=0;});
    save();renderQada();emit('stats-changed');
    toast(t('msg.allCleared'));vib([60,30,60]);
  });

  const rowsEl=$('qada-rows');
  QADA_PRAYERS.forEach(p=>{
    const q=S.qada[p.key]||0,dn=S.qdone[p.key]||0,isDone=q===0;
    const row=document.createElement('div');row.className='qada-row gc';
    row.innerHTML=`<div class="qada-row-icon">${p.icon}</div>
      <div class="qada-row-name"><div class="qada-row-title">${t(`pr.${p.key}`)}${isDone?` <span class="done-badge">${t('tools.upToDateBadge')}</span>`:''}</div><div class="qada-row-ar">${p.arabic}</div><div class="qada-done-count">${dn} ${t('tools.madeUp')}</div></div>
      <div class="qada-ctrls"><div class="qada-btn minus">−</div><div class="qada-val${isDone?' done':''}">${q}</div><div class="qada-btn plus">+</div></div>`;
    row.querySelector('.qada-btn.plus').addEventListener('click',e=>{
      e.stopPropagation();
      S.qada[p.key]=(S.qada[p.key]||0)+1;
      save();renderQada();emit('stats-changed');vib(16);
    });
    row.querySelector('.qada-btn.minus').addEventListener('click',e=>{
      e.stopPropagation();
      if((S.qada[p.key]||0)<=0){toast(t('msg.upToDate'));return;}
      S.qada[p.key]--;S.qdone[p.key]=(S.qdone[p.key]||0)+1;
      playSound('drop');vib([30,10,30]);
      if(S.qada[p.key]===0){toast(t('msg.prayerDone',{name:p.name}));burst();}
      else toast(t('msg.prayerLeft',{name:p.name,n:S.qada[p.key]}));
      save();renderQada();emit('stats-changed');
    });
    rowsEl.appendChild(row);
  });
}

/* ══════════ ZAKAT ══════════ */
let _zSym='€';
function calcZakat(){
  const nisab=parseFloat($('z-nisab').value)||0;
  const wealth=parseFloat($('z-wealth').value)||0;
  const amt=$('zakat-amount'),st=$('zakat-status');
  if(wealth<=0){amt.textContent=`0 ${_zSym}`;st.textContent=t('tools.zakatEnter');return;}
  if(wealth<nisab){
    amt.textContent=`0 ${_zSym}`;
    st.textContent=t('tools.zakatBelow',{w:`${num(wealth)} ${_zSym}`,n:`${num(nisab)} ${_zSym}`});
    return;
  }
  const due=Number(wealth*0.025).toLocaleString(S.lang||'fr',{maximumFractionDigits:2});
  amt.textContent=`${due} ${_zSym}`;
  st.textContent=t('tools.zakatDue');
}

/* ══════════ CONVERTISSEUR HÉGIRIEN ══════════ */
/* Separe de l'ouverture pour pouvoir etre rejoue au changement de langue :
   la date du jour et les douze mois sont ecrits en JS. */
function renderHijriSheet(){
  const ml=$('hijri-months-list');
  if(!ml)return;
  const now=new Date();
  const h=toHijri(now);
  $('hconv-hijri-today').textContent=hijriLabelAr(h);
  $('hconv-greg-today').textContent=now.toLocaleDateString(S.lang||'fr',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+` · ${hijriLabel(h)}`;
  ml.innerHTML='';
  HIJRI_MONTHS_FR.forEach((_,i)=>{
    const sacred=HIJRI_SACRED.includes(i);
    const div=document.createElement('div');div.className='row';div.style.cursor='default';
    div.innerHTML=`<div class="row-ic" style="font-family:var(--ff-a);font-size:0.85rem;width:42px;">${HIJRI_MONTHS_AR[i].split(' ')[0]}</div>
      <div class="row-body"><div class="row-name">${hijMonth(i)}</div><div class="row-sub">${t('tools.monthN',{n:i+1})}${sacred?` · ${t('tools.sacredMonth')}`:''}</div></div>
      ${sacred?`<div style="font-size:0.62rem;color:var(--a);font-weight:800;padding:2px 7px;border-radius:var(--r-pill);background:var(--a-dim);border:1px solid var(--a-glow);">${t('tools.sacred')}</div>`:''}`;
    if(i===11)div.style.borderBottom='none';
    ml.appendChild(div);
  });
}

function openHijriSheet(){
  openSheet('sh-hijri',()=>{
    renderHijriSheet();
    const now=new Date();
    $('hconv-inp').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  });
}

/* ══════════ CALENDRIER DU JEÛNE + ÉVÉNEMENTS ══════════ */
let _fastYear=new Date().getFullYear(),_fastMonth=new Date().getMonth();
let _evtDate=null; // 'YYYY-MM-DD' en cours d'édition

/* Jours de la semaine dans la langue de l'utilisateur, lundi en tete.
   Intl les fournit pour les 18 langues : aucune cle a maintenir, et les
   ecritures non latines sont servies correctement. */
function weekdayLabels(){
  const f=new Intl.DateTimeFormat(S.lang||'fr',{weekday:'short'});
  // 2024-01-01 est un lundi : sept jours consecutifs a partir de la donnent
  // la semaine complete dans le bon ordre.
  return Array.from({length:7},(_,i)=>f.format(new Date(Date.UTC(2024,0,1+i))));
}

const dateKey=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

/* ── Séries d'événements : générer tous les jours blancs / Achoura / Arafat /
   lundis-jeudis entre deux dates, puis exportables en .ics ── */
let _serieType='blancs';
const SERIES={
  blancs:{lk:'fast.sBlancs', ek:'fast.eBlancs', test:h=>isWhiteDay(h)},
  achoura:{lk:'fast.sAchoura',ek:'fast.eAchoura',test:h=>isAshura(h)},
  arafat:{lk:'fast.sArafat', ek:'fast.eArafat', test:h=>isArafat(h)},
  lunjeu:{lk:'fast.sLunjeu', ek:'fast.eLunjeu', test:(h,dow)=>dow===1||dow===4},
};
function generateSeries(){
  const start=$('serie-start').value,end=$('serie-end').value;
  if(!start||!end){toast(t('tools.pickDates'));return;}
  const d0=new Date(start+'T12:00:00'),d1=new Date(end+'T12:00:00');
  if(d1<d0){toast(t('tools.endBeforeStart'));return;}
  if((d1-d0)/86400000>1100){toast(t('tools.maxPeriod'));return;}
  const serie=SERIES[_serieType];
  let added=0;
  for(let d=new Date(d0);d<=d1;d.setDate(d.getDate()+1)){
    if(!serie.test(toHijri(d),d.getDay()))continue;
    const key=dateKey(d.getFullYear(),d.getMonth(),d.getDate());
    if(S.calEvents[key])continue; // ne pas écraser une note existante
    S.calEvents[key]=t(serie.ek);
    added++;
  }
  save();vib([40,20,40]);
  toast(added?t('tools.evtAdded',{n:added,label:t(serie.lk)}):t('tools.evtNone'));
  renderFastingCalendar();
}

/* Export des événements au format iCalendar (importable partout) */
function exportICS(){
  const esc=t=>t.replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sakina//Calendrier//FR','CALSCALE:GREGORIAN'];
  Object.entries(S.calEvents).sort(([a],[b])=>a.localeCompare(b)).forEach(([k,txt])=>{
    const d=k.replace(/-/g,'');
    const next=new Date(k+'T12:00:00');next.setDate(next.getDate()+1);
    const dEnd=`${next.getFullYear()}${String(next.getMonth()+1).padStart(2,'0')}${String(next.getDate()).padStart(2,'0')}`;
    lines.push('BEGIN:VEVENT',
      `UID:sakina-${k}@sakina.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${dEnd}`,
      `SUMMARY:${esc(txt)}`,
      'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='sakina-evenements.ics';
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('tools.icsExported'));
}

function openEventEditor(y,m,d){
  _evtDate=dateKey(y,m,d);
  const dt=new Date(y,m,d);
  $('cal-event-title').textContent=t('tools.event');
  $('cal-event-date').textContent=dt.toLocaleDateString(S.lang||'fr',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('cal-event-hijri').textContent=hijriLabel(toHijri(dt));
  $('cal-event-text').value=S.calEvents[_evtDate]||'';
  $('btn-del-cal-event').style.display=S.calEvents[_evtDate]?'block':'none';
  openSheet('sh-cal-event');
}

function renderFastingCalendar(){
  const bd=$('fasting-bd');
  const y=_fastYear,m=_fastMonth;
  const now=new Date();
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  const days=last.getDate();
  const startDow=(first.getDay()+6)%7; // Lundi=0
  const mName=first.toLocaleDateString(S.lang||'fr',{month:'long',year:'numeric'});

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

  let html=`<details class="help-fold"><summary class="help-fold-sum">${t('fast.how')}</summary><div class="help-fold-bd">${t('fast.howBody')}</div></details>
  <div class="fasting-stats">
    <div class="fs-card"><div class="fs-val">${ramCount||'—'}</div><div class="fs-lbl">${t('fast.ramadan')}</div></div>
    <div class="fs-card"><div class="fs-val">${whiteCount}</div><div class="fs-lbl">${t('fast.whiteDays')}</div></div>
    <div class="fs-card"><div class="fs-val">${fastCount}</div><div class="fs-lbl">${t('fast.recommended')}</div></div>
  </div>
  <div id="fasting-cal-header">
    <div class="fasting-nav" id="fast-prev">&#8249;</div>
    <div id="fasting-month-title">${mName.charAt(0).toUpperCase()+mName.slice(1)}</div>
    <div class="fasting-nav" id="fast-next">&#8250;</div>
  </div>
  <div class="fasting-grid-header">${weekdayLabels().map(d=>`<div class="fasting-day-label">${d}</div>`).join('')}</div>
  <div class="fasting-grid">`;
  for(let i=0;i<startDow;i++)html+='<div class="fc-day empty"></div>';
  dayInfo.forEach(info=>{
    const isToday=(info.d===now.getDate()&&m===now.getMonth()&&y===now.getFullYear());
    const isMon=info.dow===1,isThu=info.dow===4,isWE=info.dow===0||info.dow===6;
    const hasEvt=!!S.calEvents[dateKey(y,m,info.d)];
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
    html+=`<div class="${cls}" data-day="${info.d}" title="${hijriLabel(info.h)}">${hasEvt?'<div class="fc-evt">✦</div>':''}<span>${info.d}</span><span class="fc-hijri">${toArabicNum(info.h.day)}</span>${dot}</div>`;
  });
  html+=`</div>
  <div style="font-size:0.68rem;color:var(--t3);text-align:center;margin-top:8px;">${t('fast.tapDay')}</div>`;

  // Ajout en série (jours blancs, Achoura… entre deux dates)
  const today=new Date();
  const in1y=new Date();in1y.setMonth(in1y.getMonth()+1); // 1 mois par défaut
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  html+=`<div class="sl" style="margin:16px 0 8px;">${t('fast.addSeries')}</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;" id="serie-types">
    ${Object.entries(SERIES).map(([k,v])=>`<span class="chip${k===_serieType?' sel':''}" data-serie="${k}">${t(v.lk)}</span>`).join('')}
  </div>
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
    <input class="inp" type="date" id="serie-start" value="${iso(today)}" style="flex:1;min-width:0;">
    <span style="font-size:0.7rem;color:var(--t3);flex-shrink:0;">→</span>
    <input class="inp" type="date" id="serie-end" value="${iso(in1y)}" style="flex:1;min-width:0;">
  </div>
  <div class="qada-ok" id="btn-gen-series" style="text-align:center;">${t('fast.generate')}</div>`;

  const totalEvents=Object.keys(S.calEvents).length;
  if(totalEvents){
    html+=`<div class="qada-ok" id="btn-export-ics" style="text-align:center;margin-top:12px;background:var(--sur3);color:var(--a);border:1px solid var(--a-glow);box-shadow:none;">${t('fast.exportIcs')}</div>
    <div style="font-size:0.66rem;color:var(--t3);text-align:center;margin-top:6px;">${t('fast.exportSub',{n:totalEvents})}</div>`;
  }

  // Événements du mois affiché
  const monthEvents=Object.entries(S.calEvents)
    .filter(([k])=>k.startsWith(`${y}-${String(m+1).padStart(2,'0')}-`))
    .sort(([a],[b])=>a.localeCompare(b));
  if(monthEvents.length){
    html+=`<div class="sl" style="margin:14px 0 6px;">${t('fast.monthEvents')}</div><div class="cal-events">`;
    monthEvents.forEach(([k,txt])=>{
      const d=parseInt(k.slice(8));
      html+=`<div class="cal-event-row" data-day="${d}"><div class="cal-event-day">${d}</div><div class="cal-event-txt">${txt.replace(/</g,'&lt;')}</div></div>`;
    });
    html+='</div>';
  }

  html+=`<div class="fasting-legend">
    <div class="fl-item"><div class="fl-dot" style="background:rgba(201,169,110,0.5)"></div>${t('fast.ramadan')}</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(212,195,140,0.7)"></div>${t('fast.legWhite')}</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(22,163,74,0.5)"></div>${t('fast.legMonThu')}</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(37,99,235,0.5)"></div>${t('fast.legAshura')}</div>
    <div class="fl-item"><div class="fl-dot" style="background:rgba(194,65,12,0.5)"></div>${t('fast.legArafat')}</div>
  </div>
  <div style="font-size:0.7rem;color:var(--t3);margin-top:12px;line-height:1.6;padding:10px;background:var(--sur2);border-radius:var(--r-md);border:1px solid var(--bor2);">
    ${t('fast.note')}
  </div>`;
  bd.innerHTML=html;
  $('fast-prev').addEventListener('click',()=>{_fastMonth--;if(_fastMonth<0){_fastMonth=11;_fastYear--;}renderFastingCalendar();});
  $('fast-next').addEventListener('click',()=>{_fastMonth++;if(_fastMonth>11){_fastMonth=0;_fastYear++;}renderFastingCalendar();});
  // Clic sur un jour ou sur un événement listé → éditeur
  bd.querySelectorAll('.fc-day[data-day], .cal-event-row[data-day]').forEach(el=>{
    el.addEventListener('click',()=>openEventEditor(y,m,parseInt(el.dataset.day)));
  });
  const exp=document.getElementById('btn-export-ics');
  if(exp)exp.addEventListener('click',exportICS);
  bd.querySelectorAll('#serie-types .chip').forEach(c=>{
    c.addEventListener('click',()=>{
      _serieType=c.dataset.serie;
      bd.querySelectorAll('#serie-types .chip').forEach(x=>x.classList.toggle('sel',x===c));
    });
  });
  $('btn-gen-series').addEventListener('click',generateSeries);
}

/* ══════════ INIT ══════════ */
/* Changement de langue : qadâ' et calendrier du jeûne sont bâtis en JS, donc
   invisibles pour applyI18n. On ne les reconstruit que s'ils ont déjà servi —
   inutile de peupler une zone que l'utilisateur n'a jamais ouverte. */
export function refreshTools(){
  if($('qada-zone')?.children.length)renderQada();
  if($('fasting-bd')?.children.length)renderFastingCalendar();
  if($('hijri-months-list')?.children.length)renderHijriSheet();
  if($('z-wealth')?.value)calcZakat();
}

export function initTools(){
  // Qadâ'
  $('btn-open-qada').addEventListener('click',()=>openSheet('sh-qada',renderQada));
  $('btn-qada-info2').addEventListener('click',()=>{
    closeSheet();
    setTimeout(()=>openSheet('sh-qada-info-inner'),320);
  });

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
    $('hconv-result-greg').textContent=`${d.toLocaleDateString(S.lang||'fr',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · ${hijriLabel(h)}`;
    $('hconv-result').style.display='block';
  });

  // Calendrier du jeûne
  $('btn-open-fasting').addEventListener('click',()=>{
    _fastYear=new Date().getFullYear();_fastMonth=new Date().getMonth();
    openSheet('sh-fasting',renderFastingCalendar);
  });

  // Éditeur d'événement du calendrier
  $('btn-save-cal-event').addEventListener('click',()=>{
    if(!_evtDate)return;
    const txt=$('cal-event-text').value.trim();
    if(txt){S.calEvents[_evtDate]=txt;toast(t('tools.evtSaved'));}
    else{delete S.calEvents[_evtDate];}
    save();vib([30,15,30]);
    openSheet('sh-fasting',renderFastingCalendar);
  });
  $('btn-del-cal-event').addEventListener('click',()=>{
    if(!_evtDate)return;
    delete S.calEvents[_evtDate];
    save();toast(t('tools.evtDeleted'));vib(30);
    openSheet('sh-fasting',renderFastingCalendar);
  });
}
