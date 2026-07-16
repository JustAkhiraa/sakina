/* SAKINA — Vérif' Halal : scan de produits (OpenFoodFacts) + encyclopédie des
   additifs E. Analyse indicative : détecte les indicateurs haram/douteux dans
   la composition. ⚠ Ne remplace jamais une certification — l'utilisateur reste
   responsable de sa vérification (abattage, étourdissement, traçabilité…). */
import {openSheet} from '../core/ui.js';
import {vib} from '../core/audio.js';
import {ADDITIVES,ADD_STATUS,HARAM_KEYWORDS} from '../data/additives.js';
import {CERT_ORGS,CERT_BRANDS} from '../data/halal-certifs.js';

const $=id=>document.getElementById(id);
let _tab='scan';
let _stream=null,_scanLoop=null;

/* ── Encyclopédie des additifs ── */
function searchAdditives(q){
  const box=$('halal-add-results');
  q=q.trim().toLowerCase().replace(/^e\s*/i,'e');
  if(!q){box.innerHTML='<div class="places-empty">Tapez un code (ex : E471) ou un nom (ex : gélatine).</div>';return;}
  const items=ADDITIVES.filter(a=>
    a.code.toLowerCase().includes(q)||a.name.toLowerCase().includes(q)
  ).slice(0,30);
  box.innerHTML='';
  if(!items.length){
    box.innerHTML='<div class="places-empty">Additif absent de la base — statut inconnu, vérifiez auprès d\'un organisme de certification.</div>';
    return;
  }
  items.forEach(a=>{
    const st=ADD_STATUS[a.status];
    const el=document.createElement('div');
    el.className='add-card';
    el.innerHTML=`<div class="add-head ${st.color}"><span class="add-code">${a.code}</span><span class="add-name">${a.name}</span><span class="add-badge">${st.icon} ${st.label}</span></div>
      <div class="add-note">${a.note}</div>`;
    box.appendChild(el);
  });
}

/* ── Analyse d'un produit OpenFoodFacts ── */
function analyzeProduct(p){
  const findings=[];
  const ingredients=(p.ingredients_text_fr||p.ingredients_text||'').toLowerCase();

  // 1. Mots-clés dans la composition
  HARAM_KEYWORDS.forEach(k=>{
    if(k.re.test(ingredients))findings.push({label:k.label,status:k.status});
  });
  // 2. Additifs détectés par OpenFoodFacts
  (p.additives_tags||[]).forEach(tag=>{
    const code=tag.replace('en:','').toUpperCase();
    const a=ADDITIVES.find(x=>x.code.toUpperCase()===code);
    if(a&&(a.status==='haram'||a.status==='douteux')){
      if(!findings.some(f=>f.label.includes(a.code)))
        findings.push({label:`${a.code} — ${a.name}`,status:a.status,note:a.note});
    }
  });

  const hasHaram=findings.some(f=>f.status==='haram');
  const hasDoubt=findings.some(f=>f.status==='douteux');
  const halalFindings=findings.filter(f=>f.status==='halal');
  const problems=findings.filter(f=>f.status!=='halal');

  let verdict,cls;
  if(hasHaram){verdict='✗ Indicateurs HARAM détectés';cls='err';}
  else if(hasDoubt){verdict='? Douteux — vérifiez la source des ingrédients signalés';cls='warn';}
  else if(!ingredients){verdict='· Composition indisponible — impossible d\'analyser';cls='mute';}
  else{verdict='✓ Aucun indicateur haram détecté dans la composition';cls='ok';}

  return{verdict,cls,problems,halalFindings,ingredients};
}

async function lookupBarcode(code){
  code=code.replace(/\D/g,'');
  const box=$('halal-scan-result');
  if(!code){box.innerHTML='';return;}
  box.innerHTML='<div class="places-empty"><div class="q-spinner" style="margin:0 auto 10px"></div>Recherche du produit…</div>';
  try{
    const res=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,image_front_small_url,ingredients_text_fr,ingredients_text,additives_tags`);
    const data=await res.json();
    if(data.status!==1||!data.product){
      box.innerHTML='<div class="places-empty">Produit introuvable dans OpenFoodFacts.<br>Vérifiez le code, ou le produit n\'est pas encore référencé.</div>';
      return;
    }
    const p=data.product;
    const a=analyzeProduct(p);
    box.innerHTML=`
      <div class="hp-card">
        <div class="hp-head">
          ${p.image_front_small_url?`<img class="hp-img" src="${p.image_front_small_url}" alt="">`:'<div class="hp-img hp-img-ph">🛒</div>'}
          <div><div class="hp-name">${p.product_name||'Produit '+code}</div><div class="hp-brand">${p.brands||''}</div></div>
        </div>
        <div class="hp-verdict ${a.cls}">${a.verdict}</div>
        ${a.problems.length?`<div class="hp-findings">${a.problems.map(f=>`<div class="hp-finding ${f.status==='haram'?'err':'warn'}"><strong>${f.status==='haram'?'✗':'?'} ${f.label}</strong>${f.note?`<div class="hp-fnote">${f.note}</div>`:''}</div>`).join('')}</div>`:''}
        ${a.ingredients?`<details class="hp-ing"><summary>Composition complète</summary><div>${a.ingredients}</div></details>`:''}
      </div>`;
  }catch{
    box.innerHTML='<div class="places-empty">Erreur réseau — réessayez.</div>';
  }
}

/* ── Scanner caméra (BarcodeDetector natif quand disponible) ── */
async function startCamera(){
  const video=$('halal-video');
  if(!('BarcodeDetector' in window)){
    $('halal-cam-hint').textContent='Scanner caméra non supporté par ce navigateur — saisissez le code-barres à la main.';
    return;
  }
  try{
    _stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject=_stream;
    video.style.display='block';
    await video.play();
    const detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128']});
    $('halal-cam-hint').textContent='Visez le code-barres…';
    _scanLoop=setInterval(async()=>{
      try{
        const codes=await detector.detect(video);
        if(codes.length){
          const code=codes[0].rawValue;
          stopCamera();
          $('halal-barcode-inp').value=code;
          vib([50,30,50]);
          lookupBarcode(code);
        }
      }catch{}
    },350);
  }catch{
    $('halal-cam-hint').textContent='Caméra refusée ou indisponible — saisissez le code à la main.';
  }
}
export function stopCamera(){
  if(_scanLoop){clearInterval(_scanLoop);_scanLoop=null;}
  if(_stream){_stream.getTracks().forEach(t=>t.stop());_stream=null;}
  const v=$('halal-video');
  if(v){v.style.display='none';v.srcObject=null;}
  const h=$('halal-cam-hint');if(h)h.textContent='';
}

/* ── Certifications : organismes & marques (source debat-halal.fr) ── */
const CRITS=[
  ['salaried','Contrôleurs salariés',true],
  ['everyProd','Présents à chaque production',true],
  ['sacrif','Sacrificateurs salariés',true],
  ['meca','Abattage mécanique',false],
  ['electro','Électronarcose',false],
  ['electrocution','Électrocution',false],
  ['assommage','Assommage bovins',false],
];
function renderOrgs(){
  const box=$('certs-orgs');box.innerHTML='';
  [...CERT_ORGS].sort((a,b)=>(b.trusted?1:0)-(a.trusted?1:0)).forEach(o=>{
    const card=document.createElement('div');card.className='org-card';
    const crits=CRITS.map(([key,label,goodWhenTrue])=>{
      const v=o[key];
      if(v===null)return `<span class="crit">${label} : mitigé</span>`;
      const good=goodWhenTrue?v:!v;
      const txt=goodWhenTrue?(v?'✓':'✗'):(v?'accepté ✗':'refusé ✓');
      return `<span class="crit ${good?'good':'bad'}">${label} : ${txt}</span>`;
    }).join('');
    card.innerHTML=`<div class="org-head ${o.trusted?'ok':'bad'}">
        <div class="org-name">${o.name}</div>
        <span class="org-badge">${o.trusted?'✓ Digne de confiance':'✗ Rite non respecté'}</span>
      </div>
      <div class="org-crit">${crits}</div>
      ${o.note?`<div class="org-note">⚠ ${o.note}</div>`:''}
      ${o.site?`<div class="org-site">${o.site}${o.created?` · depuis ${o.created}`:''}</div>`:''}`;
    box.appendChild(card);
  });
}
function renderBrands(filter=''){
  const box=$('brands-list');box.innerHTML='';
  const f=filter.trim().toLowerCase();
  const items=CERT_BRANDS.filter(b=>!f||b.name.toLowerCase().includes(f)||b.cert.toLowerCase().includes(f));
  if(!items.length){box.innerHTML='<div class="places-empty">Marque absente des relevés debat-halal.fr.</div>';return;}
  const wrap=document.createElement('div');
  wrap.style.cssText='border:1px solid var(--bor2);border-radius:var(--r-md);overflow:hidden;background:var(--sur2);';
  items.forEach(b=>{
    const row=document.createElement('div');row.className='brand-row';
    row.innerHTML=`<div class="brand-dot ${b.verdict==='halal'?'ok':'bad'}"></div>
      <div style="flex:1"><div class="brand-name">${b.name}</div><div class="brand-cert">Certifié par : ${b.cert}</div></div>
      <div style="font-size:0.62rem;font-weight:800;color:${b.verdict==='halal'?'var(--ok)':'#fb923c'};">${b.verdict==='halal'?'SEREIN':'DOUTEUX'}</div>`;
    wrap.appendChild(row);
  });
  box.appendChild(wrap);
}

/* ── UI ── */
function syncTabs(){
  document.querySelectorAll('#halal-tabs .seg-opt').forEach(o=>o.classList.toggle('active',o.dataset.tab===_tab));
  $('halal-tab-scan').style.display=_tab==='scan'?'block':'none';
  $('halal-tab-add').style.display=_tab==='add'?'block':'none';
  $('halal-tab-certs').style.display=_tab==='certs'?'block':'none';
  $('halal-tab-info').style.display=_tab==='info'?'block':'none';
  if(_tab!=='scan')stopCamera();
}

export function initHalal(){
  $('btn-open-halal').addEventListener('click',()=>{
    openSheet('sh-halal',()=>{
      _tab='scan';syncTabs();
      $('halal-scan-result').innerHTML='';
      searchAdditives('');renderOrgs();renderBrands();
    });
  });
  document.querySelectorAll('#halal-tabs .seg-opt').forEach(o=>{
    o.addEventListener('click',()=>{_tab=o.dataset.tab;syncTabs();});
  });
  document.querySelectorAll('#certs-sub .seg-opt').forEach(o=>{
    o.addEventListener('click',()=>{
      document.querySelectorAll('#certs-sub .seg-opt').forEach(x=>x.classList.toggle('active',x===o));
      $('certs-orgs').style.display=o.dataset.sub==='orgs'?'block':'none';
      $('certs-brands').style.display=o.dataset.sub==='brands'?'block':'none';
    });
  });
  $('brand-search').addEventListener('input',e=>renderBrands(e.target.value));
  $('btn-halal-cam').addEventListener('click',()=>{_stream?stopCamera():startCamera();});
  $('btn-halal-lookup').addEventListener('click',()=>lookupBarcode($('halal-barcode-inp').value));
  $('halal-barcode-inp').addEventListener('keydown',e=>{if(e.key==='Enter')lookupBarcode(e.target.value);});
  let t=null;
  $('halal-add-inp').addEventListener('input',e=>{
    clearTimeout(t);t=setTimeout(()=>searchAdditives(e.target.value),250);
  });
}
