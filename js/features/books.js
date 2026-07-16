/* SAKINA — Bibliothèque : lecteur de Riyad as-Salihin (texte intégral extrait
   verbatim du PDF, trad. Kechrid). Chargé à la demande (books/riyad.json). */
import {openSheet} from '../core/ui.js';

const $=id=>document.getElementById(id);
let _book=null;      // données chargées
let _view='list';    // list | chapter

async function loadBook(){
  if(_book)return _book;
  const res=await fetch('books/riyad.json');
  if(!res.ok)throw new Error('load');
  _book=await res.json();
  return _book;
}

function showList(filter=''){
  _view='list';
  $('btn-book-back').style.display='none';
  $('book-search-wrap').style.display='block';
  $('book-title').textContent='Riyad as-Salihin';
  const bd=$('book-bd');bd.innerHTML='';
  const f=filter.trim().toLowerCase();
  const items=_book.chapters.filter(c=>!f||c.title.toLowerCase().includes(f)||String(c.n)===f);
  if(!items.length){
    bd.innerHTML='<div class="places-empty">Aucun chapitre trouvé.</div>';
    return;
  }
  items.forEach(c=>{
    const div=document.createElement('div');
    div.className='book-chap-row';
    div.innerHTML=`<div class="book-chap-n">${c.n}</div><div class="book-chap-t">${c.title}</div>
      <svg class="row-chev" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
    div.addEventListener('click',()=>showChapter(c));
    bd.appendChild(div);
  });
}

/* Mise en forme du texte verbatim : numéros de hadith et versets mis en
   valeur — le contenu lui-même n'est jamais modifié */
function formatChapter(text){
  let esc=text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  // Aère la lecture : saut de paragraphe devant chaque hadith
  // (« N. Selon… », « N. D'après… ») — le texte lui-même reste identique
  esc=esc.replace(/\s(?=\d{1,4}\.\s(?:Selon|D['’]après|Abou|Abd|Anas|Ibn|Omar|Abda|Aïcha|Djaber|Moâdh|On))/g,'\n\n');
  return esc.split('\n\n').map(par=>{
    let p=par.trim();
    if(!p)return'';
    // numéro de hadith en tête de paragraphe → pastille
    p=p.replace(/^(\d{1,4})\.\s/,'<span class="book-hnum">$1</span> ');
    return`<p class="book-par">${p}</p>`;
  }).join('');
}

function showChapter(c){
  _view='chapter';
  $('btn-book-back').style.display='flex';
  $('book-search-wrap').style.display='none';
  $('book-title').textContent=`${c.n}. ${c.title.length>34?c.title.slice(0,34)+'…':c.title}`;
  const bd=$('book-bd');
  bd.innerHTML=`<div class="book-chapter">
      <div class="book-chap-head">${c.title}</div>
      ${formatChapter(c.text)}
      <div class="book-src">${_book.author} · ${_book.source}</div>
    </div>`;
  bd.scrollTop=0;
}

export function initBooks(){
  $('btn-open-riyad').addEventListener('click',async()=>{
    openSheet('sh-book',()=>{
      $('book-bd').innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Chargement du livre…</div>';
    });
    try{
      await loadBook();
      $('book-search').value='';
      showList();
    }catch{
      $('book-bd').innerHTML='<div class="places-empty">Connexion requise pour le premier chargement du livre.</div>';
    }
  });
  $('btn-book-back').addEventListener('click',()=>showList($('book-search').value));
  $('book-search').addEventListener('input',e=>{if(_view==='list')showList(e.target.value);});
}
