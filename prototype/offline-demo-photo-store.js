// Separate encrypted photo records for the isolated offline demo. Never stores data URLs in checklist snapshots.
export function createOfflineDemoPhotoStore({indexedDBImpl=globalThis.indexedDB,dbName="tmh-offline-demo-photos-v1"}={}){
 if(!indexedDBImpl?.open)throw new TypeError("IndexedDB is required");
 let opening;
 function open(){if(opening)return opening;opening=new Promise((resolve,reject)=>{const r=indexedDBImpl.open(dbName,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains("photos"))db.createObjectStore("photos",{keyPath:"key"});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return opening;}
 async function put(key,encrypted){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction("photos","readwrite");tx.objectStore("photos").put({key,encrypted,updatedAt:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
 async function get(key){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction("photos","readonly"),r=tx.objectStore("photos").get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
 async function remove(key){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction("photos","readwrite");tx.objectStore("photos").delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 return Object.freeze({put,get,remove});
}
