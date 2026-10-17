import {items} from './data.js';
import {SIZE,HEIGHT} from './world.js';
// Both legacy browser saves and downloaded backups pass through the same checks.
export function validateSave(s){
 const fail=()=>{throw Error('This is not a valid Blocklands world backup.');};
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const stack=x=>x===null||(x&&items[x.id]&&Number.isInteger(x.n)&&x.n>0&&x.n<=(items[x.id].durability?1:64)&&(!items[x.id].durability||finite(x.dur)&&x.dur>0&&x.dur<=items[x.id].durability));
 const bag=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(stack);
 const position=p=>p&&['x','y','z'].every(k=>finite(p[k]))&&p.x>=0&&p.x<=SIZE&&p.z>=0&&p.z<=SIZE&&p.y>=-10&&p.y<=HEIGHT+32;
 const record=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length<=SIZE*SIZE*HEIGHT;
 const key=k=>/^\d+,\d+,\d+$/.test(k)&&k.split(',').every((n,i)=>+n>=0&&+n<(i===1?HEIGHT:SIZE));
 if(!s||s.version!==1||![undefined,1,2].includes(s.generatorVersion)||typeof s.seed!=='string'||s.seed.length>100||!['creative','survival'].includes(s.mode)||!bag(s.bag,36)||!position(s.player)||!position(s.spawnPoint)||!['yaw','pitch','vy'].every(k=>finite(s.player[k]))||!finite(s.health)||s.health<0||s.health>20||!finite(s.hunger)||s.hunger<0||s.hunger>20||!finite(s.time)||s.time<0||s.time>=1200||!Number.isInteger(s.selected)||s.selected<0||s.selected>8||!finite(s.xp)||s.xp<0||!Number.isInteger(s.day)||s.day<1)fail();
 if(!Array.isArray(s.edits)||s.edits.length>SIZE*SIZE*HEIGHT||!s.edits.every(e=>Array.isArray(e)&&e.length===2&&Number.isInteger(e[0])&&e[0]>=0&&e[0]<SIZE*SIZE*HEIGHT&&(e[1]===0||items[e[1]]?.block)))fail();
 if(!record(s.chests)||!Object.entries(s.chests).every(([k,v])=>key(k)&&bag(v,27)))fail();
 if(s.knownItems!==undefined&&(!Array.isArray(s.knownItems)||s.knownItems.length>Object.keys(items).length||!s.knownItems.every(id=>Number.isInteger(id)&&items[id])))fail();
 if(s.pendingItems!==undefined&&(!Array.isArray(s.pendingItems)||s.pendingItems.length>10||!s.pendingItems.every(s=>s!==null&&stack(s))))fail();
 if(s.equipment&&(!bag(s.equipment,4)||s.equipment.some((v,i)=>v&&items[v.id].armor!==i)))fail();
 if(s.furnaces&&(!record(s.furnaces)||!Object.entries(s.furnaces).every(([k,f])=>key(k)&&bag(f.slots,3)&&['burn','burnTotal','progress'].every(n=>finite(f[n])&&f[n]>=0&&f[n]<=1000))))fail();
 if(s.crops&&(!record(s.crops)||!Object.entries(s.crops).every(([k,c])=>key(k)&&finite(c.age)&&c.age>=0)))fail();
 if(!Array.isArray(s.mobs)||s.mobs.length>200||!s.mobs.every(m=>position(m)&&['pig','sheep','zombie','creeper'].includes(m.kind)&&['uid','hp','yaw','turn','attack'].every(k=>finite(m[k]))))fail();
 if(!Array.isArray(s.drops)||s.drops.length>10000||!s.drops.every(d=>position(d)&&stack(d)&&['uid','vy','delay','age'].every(k=>finite(d[k]))))fail();
 return s;
}
