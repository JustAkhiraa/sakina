/* SAKINA — Navigation entre pages avec hooks d'affichage */
import {closeSheet,sheetOpen} from './ui.js';

const hooks={};

export function registerPageHook(pageId,fn){hooks[pageId]=fn;}

export function goPage(pageId){
  /* Une feuille ouverte survivait au changement de page : on quittait Outils
     avec « Mosquées à proximité » ouverte et on la retrouvait par-dessus les
     Réglages, sans moyen evident de s'en defaire. */
  if(sheetOpen())closeSheet();
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
  // La navbar est reconstruite dynamiquement par core/nav.js — plus rien à câbler ici.
}

