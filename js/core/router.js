/* SAKINA — Navigation entre pages avec hooks d'affichage */
const hooks={};

export function registerPageHook(pageId,fn){hooks[pageId]=fn;}

export function goPage(pageId){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nv').forEach(n=>n.classList.remove('active'));
  const page=document.getElementById(pageId);
  if(!page)return;
  page.classList.add('active');
  const nv=document.querySelector(`.nv[data-page="${pageId}"]`);
  if(nv)nv.classList.add('active');
  if(hooks[pageId])hooks[pageId]();
}

export function initRouter(){
  document.querySelectorAll('.nv').forEach(el=>{
    el.addEventListener('click',()=>goPage(el.dataset.page));
  });
}
