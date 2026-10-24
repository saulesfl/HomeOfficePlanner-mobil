const DB_NAME="ho-planner-pwa",STORE="state",DB_VERSION=3,STATE_KEY="planner",SAFETY_KEY="pre-import-safety";
function openDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function dbGet(key){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readonly"),request=tx.objectStore(STORE).get(key);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);tx.oncomplete=()=>db.close()})}
async function dbPut(key,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)})}
const loadState=()=>dbGet(STATE_KEY);
async function saveState(state){const now=new Date().toISOString(),saved={...state,schema_version:3,updated_at:now};await dbPut(STATE_KEY,saved);return saved}
const saveSafetyCopy=state=>dbPut(SAFETY_KEY,{...state,safety_copy_created_at:new Date().toISOString()});
const loadSafetyCopy=()=>dbGet(SAFETY_KEY);
