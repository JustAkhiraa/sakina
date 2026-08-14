/* SAKINA — Réglages : ambiance, accent, skin, sons, préférences, stats, données.
   Règle d'or : dans les grilles de config, on N'AFFICHE PAS les cadeaux verrouillés
   (l'utilisateur ne peut pas les sélectionner de toute façon). Tout ce qui est
   verrouillé est regroupé dans la sheet « Cadeaux à débloquer » (#sh-bonus). */
import {S,save,streak,on} from '../core/store.js';
import {toast,confirmDlg,openSheet,closeSheet} from '../core/ui.js';
import {playSound,vib} from '../core/audio.js';
import {THEMES,SOUNDS,QADA_PRAYERS,MADHABS,LANGS,BASE_THEMES,AVATARS,TITLES,SKINS} from '../data/catalog.js';
import {isUnlocked,remainingFor,fmtGoal,rewardsSummary,nextReward,allRewards} from '../core/rewards.js';
import {applyI18n,setLang,t,n as num} from '../lib/i18n.js';
import {hasLang} from '../i18n/index.js';
import {TRANSLATIONS} from '../data/translations.js';
import {preloadTr,refreshTranslations} from './quran.js';
import {notifSupported,notifPermission,askNotifPermission,scheduleNext,testNotification} from './notifications.js';
import {renderTasbih,buildDhikrBar} from './tasbih.js';
import {renderPrayers} from './salat.js';
import {NAV_ITEMS,renderNavbar,visibleNavItems} from '../core/nav.js';


const $=id=>document.getElementById(id);

export function applyTheme(){
  const root=document.documentElement;
  let theme=BASE_THEMES.find(t=>t.id===S.baseTheme)||BASE_THEMES[0];
  if(!isUnlocked(theme)){theme=BASE_THEMES[0];S.baseTheme=theme.id;save();}
  let skin=SKINS.find(s=>s.id===S.skin)||SKINS[0];
  if(!isUnlocked(skin)){skin=SKINS[0];S.skin=skin.id;save();}
  root.setAttribute('data-accent',S.accent);
  root.setAttribute('data-theme',theme.id);
  root.setAttribute('data-skin',skin.id);
  root.setAttribute('data-night',(S.nightMode&&!theme.light)?'true':'false');
  if(theme.light)root.setAttribute('data-light-ui','');
  else root.removeAttribute('data-light-ui');

  const bg=(S.nightMode&&!theme.light)?'#000000':theme.swatch;
  const meta=$('theme-color-meta');
  if(meta)meta.content=bg;
  root.style.background=bg;
  root.style.colorScheme=theme.light?'light':'dark';
  const cs=document.querySelector('meta[name="color-scheme"]');
  if(cs)cs.content=theme.light?'light':'dark';

  const map={soundOn:'tog-sound',vibOn:'tog-vib',autoLoop:'tog-loop',nightMode:'tog-night'};
  Object.entries(map).forEach(([k,id])=>{const el=$(id);if(el)el.classList.toggle('on',!!S[k]);});
}

/* Petit helper : injecte un en-tête de groupe dans une grille/list. */
function groupHeader(label){
  const h=document.createElement('div');
  h.className='grp-h';
  h.textContent=label;
  return h;
}

export function buildBaseThemeGrid(targetId='base-theme-grid',opts={onlyUnlocked:true}){
  const host=$(targetId);
  if(!host)return;
  host.innerHTML='';host.style.display='block';
  const items=BASE_THEMES.filter(t=>opts.onlyUnlocked?isUnlocked(t):true);
  // On fusionne base + bonus dans une seule section par famille ;
  // à l'intérieur, les bonus (unlockAt>0) apparaissent après les bases.
  const groups=[
    {label:'Sombres', filter:t=>!t.light},
    {label:'Clairs',  filter:t=>t.light},
  ];
  const sortFn=(a,b)=>(a.unlockAt|0)-(b.unlockAt|0);
  const makeCell=(th)=>{
    const unlocked=isUnlocked(th);
    const el=document.createElement('div');
    el.className='tsw'+(S.baseTheme===th.id?' active':'')+(unlocked?'':' locked');
    const border=th.light?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.25)';
    const badge=unlocked
      ? (th.bonus?'<span class="tsw-badge">★</span>':'')
      : `<span class="tsw-lock" aria-label="Verrouillé">🔒</span>`;
    const sub=unlocked?th.name:`${th.name} · ${fmtGoal(th.unlockAt)}`;
    el.innerHTML=`<div class="sdot" style="background:${th.swatch};border-color:${border}">${badge}</div><div class="sname">${sub}</div>`;
    el.addEventListener('click',()=>{
      if(!unlocked){toast(t('msg.lockedTheme',{n:num(remainingFor(th))}));vib(10);return;}
      S.baseTheme=th.id;S.lightMode=th.light;
      save();applyTheme();
      buildBaseThemeGrid('base-theme-grid');
      buildBaseThemeGrid('ob-base-theme-grid');
      vib(18);
    });
    return el;
  };
  groups.forEach(g=>{
    const sub=items.filter(g.filter).sort(sortFn);
    if(!sub.length)return;
    host.appendChild(groupHeader(g.label));
    const grid=document.createElement('div');grid.className='tsw-grid';
    sub.forEach(t=>grid.appendChild(makeCell(t)));
    host.appendChild(grid);
  });
}

/* ── Grille des SKINS (surcouche visuelle) ──
   Rendu simplifié : chaque carte = une pastille couleur + un glyphe clair
   représentant le skin. Fini le vague « ✦ » qui ne parlait à personne. */
const SKIN_ICONS={
  classic:'✦', liquid:'◐', masjid:'🕌', neon:'⚡',
  emerald_deep:'❋', copper:'☀', royal:'♛', zellige:'❖',
  voxel:'▣', terminal:'▮', matrix:'⋮⋮', crt:'▤',
};
function buildSkinGrid(targetId='skin-grid',opts={onlyUnlocked:true}){
  const grid=$(targetId);if(!grid)return;grid.innerHTML='';
  SKINS.filter(s=>opts.onlyUnlocked?isUnlocked(s):true).forEach(s=>{
    const unlocked=isUnlocked(s);
    const el=document.createElement('div');
    el.className='skin-card'+(S.skin===s.id?' active':'')+(unlocked?'':' locked');
    const icon=unlocked?(SKIN_ICONS[s.id]||'✦'):'🔒';
    const meta=unlocked?s.desc:`Palier ${fmtGoal(s.unlockAt)} dhikr`;
    el.innerHTML=`<div class="skin-chip skin-prev-${s.id}"><span>${icon}</span></div>
      <div class="skin-info"><div class="skin-name">${s.name}</div>
      <div class="skin-desc">${meta}</div></div>`;
    el.addEventListener('click',()=>{
      if(!unlocked){toast(t('msg.lockedSkin',{n:num(remainingFor(s))}));vib(10);return;}
      S.skin=s.id;save();applyTheme();renderTasbih();buildSkinGrid('skin-grid');vib(18);
      toast(`✦ Skin « ${s.name} »`);
    });
    grid.appendChild(el);
  });
}


function buildAccentGrid(){
  const host=$('theme-grid');host.innerHTML='';host.style.display='block';
  const groups=[
    {label:'Chaudes', fam:'warm'},
    {label:'Froides', fam:'cool'},
    {label:'Neutres', fam:'neutral'},
  ];
  // Les accents verrouillés (bonus) ne sont PAS montrés ici — ils vivent
  // dans la sheet « Cadeaux à débloquer » pour ne pas encombrer la config.
  groups.forEach(g=>{
    const sub=THEMES.filter(t=>t.fam===g.fam && isUnlocked(t));
    if(!sub.length)return;
    host.appendChild(groupHeader(g.label));
    const grid=document.createElement('div');grid.className='tsw-grid';
    sub.forEach(t=>{
      const el=document.createElement('div');
      el.className='tsw'+(S.accent===t.key?' active':'');
      el.innerHTML=`<div class="sdot" style="background:${t.color}"></div><div class="sname">${t.name}</div>`;
      el.addEventListener('click',()=>{S.accent=t.key;save();applyTheme();buildAccentGrid();vib(18);});
      grid.appendChild(el);
    });
    host.appendChild(grid);
  });
}

function buildSoundList(opts={onlyUnlocked:true}){
  const list=$('sound-list');list.innerHTML='';
  const cats=[
    {id:'nature', label:'Nature & souffle'},
    {id:'perc',   label:'Percussion & bois'},
    {id:'melo',   label:'Mélodique & résonant'},
    {id:'digital',label:'Digital'},
    {id:'geek',   label:'Clin d\'œil'},
  ];
  cats.forEach(c=>{
    const sub=SOUNDS.filter(s=>(s.cat||'melo')===c.id).filter(s=>opts.onlyUnlocked?isUnlocked(s):true);
    if(!sub.length)return;
    list.appendChild(groupHeader(c.label));
    const grid=document.createElement('div');grid.className='sound-grid';
    sub.forEach(s=>{
      const unlocked=isUnlocked(s);
      const el=document.createElement('div');
      el.className='sound-chip'+(S.sound===s.id?' active':'')+(unlocked?'':' locked');
      el.title=unlocked?s.desc:t('msg.unlockAt',{n:fmtGoal(s.unlockAt)});
      const label=unlocked?s.name:`${s.name} · ${fmtGoal(s.unlockAt)}`;
      el.innerHTML=`<span class="sc-dot"></span>${label}${unlocked?'':' <span class="sc-lock">🔒</span>'}`;
      el.addEventListener('click',()=>{
        if(!unlocked){toast(t('msg.lockedSound',{n:num(remainingFor(s))}));vib(10);return;}
        S.sound=s.id;save();buildSoundList();playSound(s.id);vib(16);
      });
      grid.appendChild(el);
    });
    list.appendChild(grid);
  });
}

/* ── Avatars ── */
function buildAvatarGrid(opts={onlyUnlocked:true}){
  const grid=$('avatar-grid');if(!grid)return;grid.innerHTML='';
  AVATARS.filter(a=>opts.onlyUnlocked?isUnlocked(a):true).forEach(a=>{
    const unlocked=isUnlocked(a);
    const el=document.createElement('div');
    el.className='av-cell'+(S.avatar===a.id?' active':'')+(unlocked?'':' locked');
    const sub=unlocked?a.name:`${fmtGoal(a.unlockAt)}`;
    el.innerHTML=`<div class="av-emoji">${unlocked?a.emoji:'🔒'}</div><div class="av-name">${sub}</div>`;
    el.addEventListener('click',()=>{
      if(!unlocked){toast(t('msg.lockedAvatar',{n:num(remainingFor(a))}));vib(10);return;}
      S.avatar=a.id;save();buildAvatarGrid();renderStats();vib(16);
    });
    grid.appendChild(el);
  });
}

/* ── Titres ── L'emoji devient le pictogramme et se colle au nom affiché. */
function buildTitleList(opts={onlyUnlocked:true}){
  const list=$('title-list');if(!list)return;list.innerHTML='';
  TITLES.filter(ti=>opts.onlyUnlocked?isUnlocked(ti):true).forEach(ti=>{
    const unlocked=isUnlocked(ti);
    const row=document.createElement('div');
    row.className='title-row'+(S.titleId===ti.id?' sel':'')+(unlocked?'':' locked');
    row.innerHTML=`<div class="title-emoji">${ti.emoji||'✦'}</div>
      <div style="flex:1"><div class="title-name">${ti.name}</div>
      <div class="title-sub">${unlocked?t('reward.unlocked'):t('msg.unlockAt',{n:fmtGoal(ti.unlockAt)})}</div></div>
      <div class="title-lock">${unlocked?'':'🔒'}</div>`;
    row.addEventListener('click',()=>{
      if(!unlocked){toast(t('msg.lockedTitle',{n:num(remainingFor(ti))}));vib(10);return;}
      S.titleId=ti.id;save();buildTitleList();renderStats();vib(16);
    });
    list.appendChild(row);
  });
}

/* ── Sheet « Cadeaux à débloquer » : liste TOUS les items à unlockAt>0,
   classés par catégorie, avec barre de progression individuelle. ── */
function buildBonusSheet(){
  const body=$('bonus-body');if(!body)return;
  const items=allRewards();  // toutes catégories, item.__cat / __label injectés
  const grouped={};
  items.forEach(it=>{(grouped[it.__cat]=grouped[it.__cat]||{label:it.__label,items:[]}).items.push(it);});
  const summary=rewardsSummary();
  const next=nextReward();
  let html=`<div class="bonus-summary">
    <div class="bonus-count">${summary.unlocked}<span>/${summary.total}</span></div>
    <div class="bonus-sub">${next?`${t('prof.next')} : ${next.name||next.__label} · ${fmtGoal(next.unlockAt)} ${t('prof.dhikrs')} (${t('prof.remaining')} ${remainingFor(next).toLocaleString(S.lang||'fr')})`:t('prof.allUnlocked')}</div>
  </div>`;
  const catOrder=['skin','theme','avatar','sound','dhikr','title'];
  catOrder.forEach(cat=>{
    const g=grouped[cat];if(!g)return;
    html+=`<div class="bonus-cat"><div class="bonus-cat-title">${g.label}s</div><div class="bonus-list">`;
    g.items.sort((a,b)=>a.unlockAt-b.unlockAt).forEach(it=>{
      const u=isUnlocked(it);
      const pct=Math.min(100,((S.allTime|0)/it.unlockAt)*100);
      const nm=it.name||it.__label;
      const emoji=it.emoji||(u?'✓':'🔒');
      html+=`<div class="bonus-row${u?' unlocked':''}">
        <div class="bonus-ic">${emoji}</div>
        <div class="bonus-body">
          <div class="bonus-name">${nm}</div>
          <div class="bonus-prog"><div class="bonus-prog-fill" style="width:${pct}%"></div></div>
          <div class="bonus-meta">${u?'Débloqué':`${(S.allTime|0).toLocaleString('fr-FR')} / ${fmtGoal(it.unlockAt)} dhikr`}</div>
        </div>
      </div>`;
    });
    html+=`</div></div>`;
  });
  body.innerHTML=html;
}

const qdaTotal=()=>QADA_PRAYERS.reduce((s,p)=>s+(S.qada[p.key]||0),0);

function currentAvatar(){return (AVATARS.find(a=>a.id===S.avatar&&isUnlocked(a))||AVATARS[0]).emoji;}
function currentTitle(){
  const ti=TITLES.find(x=>x.id===S.titleId&&isUnlocked(x))||TITLES[0];
  return `${ti.emoji||''} ${ti.name}`.trim();
}

/* ── Système de flamme progressive ─────────────────────────────────────
   Plus la série de jours consécutifs est longue, plus la flamme grandit :
   0 j → 🌫️  · 1-2 j → 🕯️  · 3-6 j → 🔥  · 7-13 j → 🔥🔥
   14-29 j → 🔥🔥🔥  · 30-99 j → ⭐🔥  · 100+ j → 👑🔥
   Le CSS ajoute un léger scintillement au-dessus de 3 jours. */
function streakBadge(n){
  if(n<=0) return {icon:'🌫️',cls:'st-cold',label:t('prof.noStreak')};
  if(n<3)  return {icon:'🕯️',cls:'st-spark',label:'Étincelle'};
  if(n<7)  return {icon:'🔥',cls:'st-flame',label:'En feu'};
  if(n<14) return {icon:'🔥🔥',cls:'st-flame st-hot',label:'Brasier'};
  if(n<30) return {icon:'🔥🔥🔥',cls:'st-flame st-hot',label:'Fournaise'};
  if(n<100)return {icon:'⭐🔥',cls:'st-flame st-star',label:'Étoile ardente'};
  return {icon:'👑🔥',cls:'st-flame st-crown',label:'Souverain·e'};
}

export function renderStats(){
  const fmt=n=>n>9999?(n/1000).toFixed(1)+'k':n;
  $('st-total').textContent=fmt(S.allTime||0);
  $('st-sess').textContent=S.sessCount||0;
  const sk=streak();
  const badge=streakBadge(sk);
  const stEl=$('st-streak');
  if(stEl){
    stEl.textContent=sk;
    // La carte parent reçoit la classe → couleur/animation adaptées à la ferveur
    const card=stEl.closest('.ms-card');
    if(card){card.className='ms-card gc '+badge.cls;}
  }
  $('st-qada').textContent=qdaTotal();
  const av=$('prof-av');if(av)av.textContent=currentAvatar();
  const pn=$('prof-name');if(pn)pn.textContent=currentTitle();
  $('prof-sub').textContent=`${badge.icon} ${badge.label} · ${sk} ${t('prof.days')} · ${(S.allTime||0).toLocaleString(S.lang||'fr')} ${t('prof.dhikrs')}`;
  const rsum=rewardsSummary();
  const rc=$('rw-count');if(rc)rc.textContent=`${rsum.unlocked}/${rsum.total}`;
  const rn=$('rw-next');
  if(rn){
    const nxt=nextReward();
    rn.textContent=nxt
      ?`${t('prof.next')} : ${nxt.__label} · ${fmtGoal(nxt.unlockAt)} ${t('prof.dhikrs')}`
      :'Tout débloqué ✨';
  }
}

/* ── École juridique ── */
function buildMadhabList(){
  const list=document.getElementById('madhab-list');list.innerHTML='';
  MADHABS.forEach(m=>{
    const row=document.createElement('div');
    row.className='ob-method-row'+(S.madhab===m.id?' sel':'');
    row.innerHTML=`<div class="ob-method-radio"></div><div style="flex:1"><div class="ob-method-name">${m.name} <span style="font-family:var(--ff-a);color:var(--t2);font-weight:400;">${m.ar}</span></div><div class="ob-method-desc">${m.asrFactor===2?'Asr : ombre ×2 (plus tardif)':'Asr : ombre ×1 (majorité)'}</div></div>`;
    row.addEventListener('click',()=>{
      S.madhab=m.id;save();buildMadhabList();syncPracticeRows();
      if(S.lat!==null)renderPrayers();
      vib(16);toast(`École ${m.name.toLowerCase()}`);
    });
    list.appendChild(row);
  });
}

/* ── Langue ── */
function buildLangList(){
  const list=document.getElementById('lang-list');list.innerHTML='';
  LANGS.filter(l=>hasLang(l.code)).forEach(l=>{
    const row=document.createElement('div');
    row.className='ob-method-row'+(S.lang===l.code?' sel':'');
    row.innerHTML=`<div class="ob-method-radio"></div><div style="flex:1"><div class="ob-method-name">${l.flag} ${l.name}</div></div>`;
    row.addEventListener('click',()=>{
      vib(16);
      // setLang pose S.lang puis applique : on enregistre après, sinon on
      // sauvegarderait l'ancienne langue.
      setLang(l.code).then(()=>{save();buildLangList();syncPracticeRows();});
    });
    list.appendChild(row);
  });
}

function syncPracticeRows(){
  const m=MADHABS.find(x=>x.id===S.madhab)||MADHABS[0];
  const l=LANGS.find(x=>x.code===S.lang)||LANGS[0];
  document.getElementById('madhab-current').textContent=`${m.name} · ${m.ar}`;
  document.getElementById('lang-current').textContent=`${l.flag} ${l.name}`;
}

/* ═══ Éditeur de navigation (Lot 1) ═══
   Liste les 6 catégories avec ↑ ↓ pour trier et une case pour masquer/afficher.
   La barre du bas est reconstruite à chaque changement.  */
function buildNavEditor(){
  const host=$('nav-editor');
  if(!host)return;
  host.innerHTML='';
  const order=[...S.nav.order];
  order.forEach((id,idx)=>{
    const item=NAV_ITEMS.find(n=>n.id===id);
    if(!item)return;
    const hidden=S.nav.hidden.includes(id);
    const row=document.createElement('div');
    row.className='nav-edit-row'+(item.locked?' locked':'');
    // Item locked (Paramètres) : réordonnable mais case toggle remplacée par
    // un cadenas — impossible de se verrouiller hors des réglages.
    const togHtml=item.locked
      ? `<div class="nav-edit-lock" title="Toujours visible" aria-label="Verrouillé">🔒</div>`
      : `<div class="tog ${hidden?'':'on'}" data-act="toggle" role="switch" aria-checked="${!hidden}" aria-label="Afficher"></div>`;
    row.innerHTML=`
      <div class="nav-edit-icon">${item.icon}</div>
      <div class="nav-edit-name">${item.label}</div>
      <button class="nav-edit-btn" data-act="up"  ${idx===0?'disabled':''} aria-label="Monter">▲</button>
      <button class="nav-edit-btn" data-act="down" ${idx===order.length-1?'disabled':''} aria-label="Descendre">▼</button>
      ${togHtml}`;
    row.querySelector('[data-act="up"]').addEventListener('click',()=>moveNav(id,-1));
    row.querySelector('[data-act="down"]').addEventListener('click',()=>moveNav(id,1));
    const tog=row.querySelector('[data-act="toggle"]');
    if(tog)tog.addEventListener('click',()=>toggleNav(id));
    host.appendChild(row);
  });
  buildStartPageSelect();
}

function buildStartPageSelect(){
  const sel=$('nav-startpage');
  if(!sel)return;
  sel.innerHTML='';
  visibleNavItems().forEach(it=>{
    const opt=document.createElement('option');
    opt.value=it.id;opt.textContent=it.label;
    if(it.id===S.nav.startPage)opt.selected=true;
    sel.appendChild(opt);
  });
  sel.onchange=()=>{S.nav.startPage=sel.value;save();toast('Page d\'ouverture : '+sel.options[sel.selectedIndex].text);};
}

function moveNav(id,delta){
  const arr=S.nav.order;const i=arr.indexOf(id);
  const j=i+delta;if(i<0||j<0||j>=arr.length)return;
  [arr[i],arr[j]]=[arr[j],arr[i]];
  save();renderNavbar();buildNavEditor();vib(12);
}

function toggleNav(id){
  const item=NAV_ITEMS.find(n=>n.id===id);
  if(item&&item.locked){toast('Cette catégorie est toujours visible');return;}
  const h=S.nav.hidden;const i=h.indexOf(id);
  if(i>=0)h.splice(i,1); else h.push(id);
  // Ne pas tout masquer : garantit au moins 1 item visible (hors locked)
  const visibleCount=NAV_ITEMS.filter(n=>!h.includes(n.id)).length;
  if(visibleCount<1){h.pop();toast('Il faut au moins une catégorie visible');return;}
  // Si la page de démarrage vient d'être masquée, on la déplace
  if(h.includes(S.nav.startPage)){
    const first=visibleNavItems()[0];
    if(first)S.nav.startPage=first.id;
  }
  save();renderNavbar();buildNavEditor();vib(12);
}

/* ── Rappels de prière ──
   L'interrupteur principal demande l'autorisation au navigateur ; sans elle
   on ne l'allume pas, pour ne pas laisser croire que les rappels arrivent. */
const NOTIF_PRAYERS=[
  {key:'fajr',name:'Fajr'},{key:'dhuhr',name:'Dhouhr'},{key:'asr',name:'Asr'},
  {key:'maghrib',name:'Maghrib'},{key:'isha',name:'Icha'},
];

function notifSummary(){
  const sub=$('notif-sub'),state=$('notif-state');
  const perm=notifPermission();
  if(sub){
    if(!S.notifEnabled)sub.textContent=perm==='denied'?'Bloqués par le navigateur':'Désactivés';
    else{
      const on=NOTIF_PRAYERS.filter(p=>(S.notifPrayers||{})[p.key]!==false).length;
      const av=Number(S.notifOffset)||0;
      sub.textContent=`${on} prière${on>1?'s':''}${av?` · ${av} min avant`:''}`;
    }
  }
  if(state){
    state.textContent=perm==='denied'
      ? 'Autorisation refusée — à réactiver dans le navigateur'
      : perm==='granted' ? 'Autorisation accordée' : 'Autorisation nécessaire';
  }
  const det=$('notif-detail');
  if(det)det.style.display=S.notifEnabled?'block':'none';
}

function buildNotifPrayers(){
  const host=$('notif-prayers');
  if(!host)return;
  host.innerHTML='';
  NOTIF_PRAYERS.forEach((p,i)=>{
    const on=(S.notifPrayers||{})[p.key]!==false;
    const row=document.createElement('div');
    row.className='row';
    if(i===NOTIF_PRAYERS.length-1)row.style.borderBottom='none';
    row.innerHTML=`<div class="row-body"><div class="row-name">${p.name}</div></div><div class="tog${on?' on':''}"></div>`;
    row.querySelector('.tog').addEventListener('click',function(){
      const cur={...(S.notifPrayers||{})};
      cur[p.key]=cur[p.key]===false;
      S.notifPrayers=cur;save();
      this.classList.toggle('on',cur[p.key]!==false);
      notifSummary();scheduleNext();
    });
    host.appendChild(row);
  });
}

function buildNotifOffset(){
  const sel=$('notif-offset');
  if(!sel)return;
  sel.innerHTML='';
  [[0,"À l'heure exacte"],[5,'5 minutes avant'],[10,'10 minutes avant'],
   [15,'15 minutes avant'],[30,'30 minutes avant']].forEach(([v,label])=>{
    const o=document.createElement('option');
    o.value=v;o.textContent=label;
    if(Number(S.notifOffset)===v)o.selected=true;
    sel.appendChild(o);
  });
  sel.addEventListener('change',()=>{
    S.notifOffset=Number(sel.value)||0;save();
    notifSummary();scheduleNext();
  });
}

function initNotifSettings(){
  const tog=$('tog-notif');
  if(!tog)return;
  if(!notifSupported()){
    const st=$('notif-state');
    if(st)st.textContent='Non pris en charge par ce navigateur';
    tog.style.opacity='0.4';
    return;
  }
  tog.classList.toggle('on',!!S.notifEnabled);
  buildNotifPrayers();buildNotifOffset();notifSummary();

  tog.addEventListener('click',async()=>{
    if(S.notifEnabled){
      S.notifEnabled=false;save();
      tog.classList.remove('on');notifSummary();scheduleNext();
      return;
    }
    if(!await askNotifPermission()){notifSummary();return;}
    S.notifEnabled=true;save();
    tog.classList.add('on');notifSummary();
    const next=scheduleNext();
    toast(next
      ? `Prochain rappel : ${next.name} à ${next.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`
      : 'Rappels activés — définissez votre position');
  });

  $('btn-notif-test')?.addEventListener('click',async()=>{
    if(await testNotification())toast('Rappel envoyé');
  });
}

/* ── Traductions du Coran : sélection multilingue ──
   Activer une langue déclenche son téléchargement ; le service worker la
   conserve ensuite en cache. On empêche de tout décocher, sans quoi le
   lecteur n'aurait plus rien à afficher sous les versets. */
/* Résumé affiché sur la ligne repliée : le menu fermé doit dire ce qui est actif. */
function quranTrSummary(){
  const el=document.getElementById('quran-tr-sub');
  if(!el)return;
  const on=TRANSLATIONS.filter(t=>S.quranTr.includes(t.code)).map(t=>t.label);
  el.textContent=on.length<=3
    ? on.join(' · ')
    : `${on.slice(0,2).join(' · ')} et ${on.length-2} autres`;
}

function buildQuranTrList(){
  const host=document.getElementById('quran-tr-list');
  if(!host)return;
  if(!Array.isArray(S.quranTr)||!S.quranTr.length){S.quranTr=['fr'];save();}
  host.innerHTML='';
  quranTrSummary();

  TRANSLATIONS.forEach((t,i)=>{
    const on=S.quranTr.includes(t.code);
    const row=document.createElement('div');
    row.className='row';
    if(i===TRANSLATIONS.length-1)row.style.borderBottom='none';
    row.innerHTML=
      `<div class="row-body">`+
        `<div class="row-name">${t.label} <span style="color:var(--t2);font-weight:400">· ${t.native}</span></div>`+
        `<div class="row-sub">${t.author} · ${t.mb.toFixed(2)} Mo</div>`+
      `</div><div class="tog${on?' on':''}"></div>`;
    const tog=row.querySelector('.tog');

    tog.addEventListener('click',async()=>{
      const active=S.quranTr.includes(t.code);
      if(active){
        if(S.quranTr.length===1){toast('Gardez au moins une traduction');return;}
        S.quranTr=S.quranTr.filter(c=>c!==t.code);
        tog.classList.remove('on');save();
        quranTrSummary();refreshTranslations();
        return;
      }
      tog.classList.add('on');
      row.querySelector('.row-sub').textContent='Téléchargement…';
      try{
        await preloadTr(t.code);
        S.quranTr=[...S.quranTr,t.code];save();
        quranTrSummary();
        await refreshTranslations();
        row.querySelector('.row-sub').textContent=`${t.author} · disponible hors ligne`;
        toast(`${t.label} ajouté`);
      }catch{
        tog.classList.remove('on');
        row.querySelector('.row-sub').textContent=`${t.author} · ${t.mb.toFixed(2)} Mo`;
        toast('Téléchargement impossible');
      }
    });
    host.appendChild(row);
  });
}

export function initSettings(){

  // Replis sûrs : si un cadeau sélectionné n'est plus débloqué (après reset)
  if(!isUnlocked(AVATARS.find(a=>a.id===S.avatar)||{}))S.avatar='kaaba';
  if(!isUnlocked(TITLES.find(t=>t.id===S.titleId)||{}))S.titleId='traveler';
  if(!isUnlocked(SKINS.find(s=>s.id===S.skin)||{}))S.skin='classic';
  applyTheme();
  applyI18n();                 // français immédiat, sans attendre le réseau
  setLang(S.lang);             // puis la langue choisie, dès son fichier chargé
  buildBaseThemeGrid('base-theme-grid');
  buildSkinGrid('skin-grid');
  buildAccentGrid();
  buildSoundList();
  initNotifSettings();
  buildQuranTrList();
  buildAvatarGrid();
  buildTitleList();
  renderStats();
  syncPracticeRows();
  buildNavEditor();

  on('stats-changed',()=>{
    renderStats();
    // Refresh silencieux : les cadeaux fraîchement débloqués apparaissent immédiatement
    buildAvatarGrid();buildTitleList();buildSoundList();
    buildBaseThemeGrid('base-theme-grid');buildSkinGrid('skin-grid');
  });

  document.getElementById('btn-open-madhab').addEventListener('click',()=>openSheet('sh-madhab',buildMadhabList));
  document.getElementById('btn-open-lang').addEventListener('click',()=>openSheet('sh-lang',buildLangList));
  const bonusBtn=document.getElementById('btn-open-bonus');
  if(bonusBtn)bonusBtn.addEventListener('click',()=>openSheet('sh-bonus',buildBonusSheet));

  // Toggles de préférences
  const keyMap={'tog-sound':'soundOn','tog-vib':'vibOn','tog-loop':'autoLoop','tog-night':'nightMode'};
  Object.entries(keyMap).forEach(([id,key])=>{
    $(id).addEventListener('click',function(){
      S[key]=!S[key];this.classList.toggle('on',S[key]);save();
      if(key==='nightMode')applyTheme();
      if(key==='soundOn')toast(S[key]?'🔊 Son activé':'🔇 Son coupé');
      if(key==='vibOn'){vib(20);toast(S[key]?'📳 Vibration':'🔕 Vibration désactivée');}
    });
  });

  document.querySelectorAll('#translit-seg .seg-opt').forEach(opt=>{
    opt.classList.toggle('active',opt.dataset.tr===S.translit);
    opt.addEventListener('click',()=>{
      S.translit=opt.dataset.tr;
      document.querySelectorAll('#translit-seg .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.tr===S.translit));
      save();vib(14);
      toast(S.translit==='ph'?'abc Adhkâr en phonétique':'عربي Adhkâr en arabe');
    });
  });

  document.querySelectorAll('#fmt-seg .seg-opt').forEach(opt=>{
    opt.classList.toggle('active',opt.dataset.fmt===S.hourFmt);
    opt.addEventListener('click',()=>{
      S.hourFmt=opt.dataset.fmt;
      document.querySelectorAll('#fmt-seg .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.fmt===S.hourFmt));
      save();if(S.lat!==null)renderPrayers();
      toast(S.hourFmt==='12'?'Format 12H':'Format 24H');
    });
  });

  $('btn-export').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`sakina-donnees-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('📤 Exporté');
  });

  // Import : fusion non destructive d'un backup précédent. On garde toujours
  // le max des deux pour les compteurs cumulatifs (allTime, sessCount…) pour
  // ne jamais régresser si l'utilisateur importe un vieux fichier.
  const fileImport=$('file-import');
  $('btn-import').addEventListener('click',()=>fileImport.click());
  fileImport.addEventListener('change',async e=>{
    const f=e.target.files&&e.target.files[0];if(!f){return;}
    try{
      const data=JSON.parse(await f.text());
      if(!data||typeof data!=='object')throw new Error('format');
      if(!await confirmDlg('Importer ce fichier ? Il sera fusionné avec ta config actuelle (aucun effacement).',{okLabel:'Importer'})){fileImport.value='';return;}
      const maxKeys=new Set(['allTime','sessCount','sessTot']);
      const mergeObj=new Set(['daily','quranFavs','quranNotes','calEvents','qada','qdone']);
      for(const k of Object.keys(data)){
        if(maxKeys.has(k))S[k]=Math.max(S[k]|0,data[k]|0);
        else if(mergeObj.has(k))S[k]={...(S[k]||{}),...(data[k]||{})};
        else if(k==='history'&&Array.isArray(data.history))S.history=[...data.history,...S.history].slice(0,500);
        else if(k==='customDhikrs'&&Array.isArray(data.customDhikrs)){
          const seen=new Set(S.customDhikrs.map(d=>d.name));
          data.customDhikrs.forEach(d=>{if(!seen.has(d.name))S.customDhikrs.push(d);});
        }
        else S[k]=data[k];
      }
      save();location.reload();
    }catch{toast('⚠️ Fichier invalide');}
    fileImport.value='';
  });

  $('btn-reset-all').addEventListener('click',async()=>{
    if(!await confirmDlg('Tout effacer ? Compteurs, historique, qadâ\'. Action irréversible.',{okLabel:'Tout effacer'}))return;
    S.count=0;S.lapCount=0;S.sessTot=0;S.allTime=0;S.sessCount=0;
    S.history=[];S.daily={};
    QADA_PRAYERS.forEach(p=>{S.qada[p.key]=0;S.qdone[p.key]=0;});
    save();renderTasbih();buildDhikrBar();renderStats();
    toast('✓ Réinitialisé');vib([100,50,100]);
  });
}
