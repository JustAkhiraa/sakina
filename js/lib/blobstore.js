/* SAKINA — Stockage de fichiers binaires (IndexedDB).

   localStorage ne prend que du texte et plafonne autour de 5 Mo : un adhân
   dure deux à trois minutes et pèse plusieurs mégaoctets. IndexedDB accepte
   les Blob tels quels, sans conversion en base64 — laquelle gonflerait le
   fichier d'un tiers et bloquerait le fil principal à chaque lecture.

   Une seule base, un seul magasin, trois opérations. Rien de plus n'est
   nécessaire ici, et une dépendance de plus le serait encore moins. */

const DB='sakina-files';
const STORE='blobs';
let _db=null;

function open(){
  if(_db)return Promise.resolve(_db);
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
    };
    req.onsuccess=()=>{_db=req.result;resolve(_db);};
    req.onerror=()=>reject(req.error);
  });
}

function tx(mode,fn){
  return open().then(db=>new Promise((resolve,reject)=>{
    const t=db.transaction(STORE,mode);
    const req=fn(t.objectStore(STORE));
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  }));
}

export const putBlob=(key,blob)=>tx('readwrite',s=>s.put(blob,key));
export const getBlob=key=>tx('readonly',s=>s.get(key));
export const delBlob=key=>tx('readwrite',s=>s.delete(key));

/* Le navigateur peut refuser IndexedDB (navigation privée, quota) : plutôt
   que de laisser une promesse rejetée remonter jusqu'à l'appelant, on teste
   une fois et on laisse l'appelant proposer une solution de repli. */
export async function blobsAvailable(){
  try{await open();return true;}
  catch{return false;}
}
