import {validateSave} from './saves.js';

export const SLOT_PREFIX='blocklands-slot-v1:';
export const LAST_SLOT='blocklands-last-slot-v1';
export const MIGRATED='blocklands-slots-migrated-v1';
const LEGACY='blocklands-world-v1';
const cleanName=(name,fallback)=>String(name||fallback||'My world').trim().slice(0,48)||'My world';

// Each world is one atomic localStorage record. There is no separate index
// that could lose track of worlds if the browser reaches its storage quota.
export class WorldSlots{
 constructor(storage){this.storage=storage;}
 read(id){const raw=this.storage.getItem(SLOT_PREFIX+id);if(!raw)throw Error('This world is no longer available.');const record=JSON.parse(raw);if(record.slotVersion!==1||record.id!==id||typeof record.name!=='string'||!Number.isFinite(record.updatedAt))throw Error('This world record could not be read.');validateSave(record.save);return record;}
 list(){const worlds=[],unreadable=[];for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i);if(!key?.startsWith(SLOT_PREFIX))continue;try{worlds.push(this.read(key.slice(SLOT_PREFIX.length)));}catch{unreadable.push(key);}}worlds.sort((a,b)=>b.updatedAt-a.updatedAt||a.name.localeCompare(b.name));return {worlds,unreadable};}
 create(save,name,id=crypto.randomUUID()){
  validateSave(save);if(this.storage.getItem(SLOT_PREFIX+id)!==null)throw Error('A world with this ID already exists.');
  const record={slotVersion:1,id,name:cleanName(name,save.worldName||save.seed),updatedAt:Date.now(),save};
  this.storage.setItem(SLOT_PREFIX+id,JSON.stringify(record));return record;
 }
 save(id,save){const record=this.read(id);record.save=save;record.updatedAt=Date.now();this.storage.setItem(SLOT_PREFIX+id,JSON.stringify(record));return record;}
 rename(id,name){const record=this.read(id);record.name=cleanName(name,record.name);this.storage.setItem(SLOT_PREFIX+id,JSON.stringify(record));return record;}
 remove(id){this.storage.removeItem(SLOT_PREFIX+id);if(this.storage.getItem(LAST_SLOT)===id)this.storage.removeItem(LAST_SLOT);}
 select(id){this.read(id);try{this.storage.setItem(LAST_SLOT,id);}catch{/* The world itself is already saved; this is only a shortcut. */}}
 last(){const id=this.storage.getItem(LAST_SLOT);if(id){try{return this.read(id);}catch{}}return this.list().worlds[0]||null;}
 migrate(){
  if(this.storage.getItem(MIGRATED))return [];
  const issues=[];let current=null;
  for(const [key,id,suffix]of [[LEGACY,'legacy-current',''],[LEGACY+'-backup','legacy-previous',' (previous)']]){
   const raw=this.storage.getItem(key);if(!raw)continue;
   let save;try{save=validateSave(JSON.parse(raw));}catch{issues.push('An older save could not be read and was left untouched.');continue;}
   // Fixed migration IDs make retries safe after an interrupted or failed write.
   if(!this.storage.getItem(SLOT_PREFIX+id))this.create(save,save.seed+suffix,id);
   else this.read(id);
   if(!suffix)current=id;
  }
  this.storage.setItem(MIGRATED,'1');
  if(current)this.select(current);
  // Old keys remain available for recovery; migration never modifies them.
  return issues;
 }
}
