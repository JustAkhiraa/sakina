/* SAKINA — Invocations : catégories, recherche, copie, envoi vers le tasbih */
import {toast,openSheet} from '../core/ui.js';
import {DUAS} from '../data/duas.js';
import {setDhikr} from './tasbih.js';
import {goPage} from '../core/router.js';

const $=id=>document.getElementById(id);
let _cat='Besoin';

function arabicHtml(d){
  if(d.arabic_parts)return d.arabic_parts.map(p=>p.type==='pause'?`<span class="dua-pause">${p.text}</span>`:p.text).join(' ');
  return d.arabic||'';
}

function copyText(txt){
  navigator.clipboard.writeText(txt).then(()=>toast('📋 Copié !')).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=txt;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');ta.remove();toast('📋 Copié !');
  });
}

function buildCatBar(){
  const bar=$('cat-bar');bar.innerHTML='';
  [...new Set(DUAS.map(d=>d.cat))].forEach(c=>{
    const el=document.createElement('div');
    el.className='cat-chip'+(c===_cat?' active':'');
    el.textContent=c;
    el.addEventListener('click',()=>{_cat=c;buildCatBar();renderDuas();});
    bar.appendChild(el);
  });
}

function matches(d,q){
  q=q.toLowerCase();
  return d.title.toLowerCase().includes(q)||d.translation.toLowerCase().includes(q)||d.occasion.toLowerCase().includes(q);
}

function renderDuas(){
  const list=$('duas-list');list.innerHTML='';
  const items=DUAS.filter(d=>d.cat===_cat);
  items.forEach((d,i)=>{
    const arHtml=arabicHtml(d);
    const card=document.createElement('div');card.className='dua-card gc';
    card.innerHTML=`<div class="dua-head"><div class="dua-num">${i+1}</div><div style="flex:1"><div class="dua-title">${d.icon||'✦'} ${d.title}</div><div class="dua-occ">${d.occasion}</div></div><div class="dua-chev"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></div></div>
      <div class="dua-body"><div class="dua-ar">${arHtml}</div><div class="dua-ph">${d.phonetic||''}</div><div class="dua-tr">${d.translation||''}</div><div class="dua-ref">📚 ${d.ref||''}</div>
      <div class="dua-acts"><div class="dua-act dua-act-copy">📋 Copier</div><div class="dua-act dua-act-use">📿 Compter</div></div></div>`;
    card.querySelector('.dua-head').addEventListener('click',()=>card.classList.toggle('open'));
    card.querySelector('.dua-act-copy').addEventListener('click',e=>{
      e.stopPropagation();
      copyText(arHtml.replace(/<[^>]+>/g,''));
    });
    card.querySelector('.dua-act-use').addEventListener('click',e=>{
      e.stopPropagation();
      setDhikr({title:d.title,goal:33,reminder:33});
      goPage('page-tasbih');toast(`📿 ${d.title}`);
    });
    list.appendChild(card);
  });
}

function initSearch(){
  $('btn-dsearch').addEventListener('click',()=>openSheet('sh-dsearch',()=>{
    $('dsearch-inp').value='';$('dsearch-res').innerHTML='';
    setTimeout(()=>$('dsearch-inp').focus(),400);
  }));
  $('dsearch-inp').addEventListener('input',e=>{
    const q=e.target.value;
    const res=$('dsearch-res');res.innerHTML='';
    if(!q.trim())return;
    const items=DUAS.filter(d=>matches(d,q));
    if(!items.length){res.innerHTML='<div style="text-align:center;padding:24px;font-size:0.82rem;color:var(--t3);">Aucun résultat</div>';return;}
    items.forEach(d=>{
      const arHtml=arabicHtml(d);
      const el=document.createElement('div');el.className='dua-card gc open';
      el.innerHTML=`<div class="dua-head"><div class="dua-num">✦</div><div style="flex:1"><div class="dua-title">${d.icon||''} ${d.title}</div><div class="dua-occ">${d.cat} · ${d.occasion}</div></div></div>
        <div class="dua-body"><div class="dua-ar">${arHtml}</div><div class="dua-tr">${d.translation||''}</div><div class="dua-ref">📚 ${d.ref||''}</div></div>`;
      res.appendChild(el);
    });
  });
}

export function initDuas(){
  buildCatBar();
  renderDuas();
  initSearch();
}
