/* SAKINA — Primitives UI : toast, burst, sheets, confirmation */

let _tt;
export function toast(msg){
  const el=document.getElementById('toast');
  clearTimeout(_tt);
  el.textContent=msg;
  el.classList.add('show');
  _tt=setTimeout(()=>el.classList.remove('show'),2200);
}

export function burst(){
  const el=document.createElement('div');
  el.className='bst';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),700);
}

/* ── Sheets ── */
let _sh=null;
export function openSheet(id,cb){
  if(_sh)_sh.classList.remove('open');
  const sh=document.getElementById(id);
  const ov=document.getElementById('overlay');
  _sh=sh;
  ov.classList.add('open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>sh.classList.add('open')));
  if(cb)cb();
}
export function closeSheet(){
  if(_sh)_sh.classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  _sh=null;
}
export const sheetOpen=()=>_sh!==null;

/* ── Confirmation non bloquante (remplace window.confirm) ── */
let _cfResolve=null;
export function confirmDlg(msg,{okLabel='Confirmer',accent=false}={}){
  return new Promise(resolve=>{
    _cfResolve=resolve;
    document.getElementById('confirm-msg').textContent=msg;
    const ok=document.getElementById('cf-ok');
    ok.textContent=okLabel;
    ok.classList.toggle('accent',accent);
    document.getElementById('overlay').classList.add('open');
    document.getElementById('confirm-box').classList.add('open');
  });
}
function settleConfirm(val){
  document.getElementById('confirm-box').classList.remove('open');
  if(!_sh)document.getElementById('overlay').classList.remove('open');
  if(_cfResolve){_cfResolve(val);_cfResolve=null;}
}

export function initUI(){
  document.getElementById('overlay').addEventListener('click',()=>{
    if(_cfResolve){settleConfirm(false);return;}
    closeSheet();
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-close-sheet]'))closeSheet();
  });
  document.getElementById('cf-ok').addEventListener('click',()=>settleConfirm(true));
  document.getElementById('cf-cancel').addEventListener('click',()=>settleConfirm(false));
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(_cfResolve){settleConfirm(false);return;}
    closeSheet();
  });
  // Glissement vers le bas pour fermer la sheet active — uniquement depuis
  // la poignée ou l'en-tête (zone fixe non scrollable). Sans cette
  // restriction, tout glissement dans une liste (ex: calendrier) était
  // interprété comme une fermeture, ce qui rendait le scroll inutilisable.
  let y0=0,dragFromHandle=false;
  document.addEventListener('touchstart',e=>{
    y0=e.touches[0].clientY;
    dragFromHandle=!!e.target.closest('.sh-grip,.sh-hd');
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(_sh&&dragFromHandle&&(e.changedTouches[0].clientY-y0)>80)closeSheet();
  },{passive:true});
}
