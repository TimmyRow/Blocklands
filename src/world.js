import {B,solid} from './data.js';
export const SIZE=160,HEIGHT=64,CHUNK=16,SEA=18;
export function hashSeed(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function hash(x,z,s=0){let h=Math.imul(x,374761393)+Math.imul(z,668265263)+Math.imul(s,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;}
function noise(x,z,s){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;const u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(ix,iz,s)*(1-u)+hash(ix+1,iz,s)*u)*(1-v)+(hash(ix,iz+1,s)*(1-u)+hash(ix+1,iz+1,s)*u)*v;}
export class World{
 constructor(seed='Meadow'){this.seed=hashSeed(seed);this.seedName=seed;this.blocks=new Uint8Array(SIZE*SIZE*HEIGHT);this.edits=new Map();this.dirty=new Set();this.heights=new Uint8Array(SIZE*SIZE);this.chests={};}
 index(x,y,z){return (x*SIZE+z)*HEIGHT+y;}
 inside(x,y,z){return x>=0&&x<SIZE&&z>=0&&z<SIZE&&y>=0&&y<HEIGHT;}
 get(x,y,z){if(y<0)return B.BEDROCK;if(!this.inside(x,y,z))return 0;return this.blocks[this.index(x,y,z)];}
 set(x,y,z,id,record=true){if(!this.inside(x,y,z))return;this.blocks[this.index(x,y,z)]=id;if(record)this.edits.set(this.index(x,y,z),id);const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK);this.dirty.add(cx+','+cz);if(x%CHUNK===0)this.dirty.add((cx-1)+','+cz);if(x%CHUNK===15)this.dirty.add((cx+1)+','+cz);if(z%CHUNK===0)this.dirty.add(cx+','+(cz-1));if(z%CHUNK===15)this.dirty.add(cx+','+(cz+1));}
 terrain(x,z){const s=this.seed;const broad=noise(x/55,z/55,s);const hills=noise(x/22,z/22,s+1);const fine=noise(x/8,z/8,s+2);return Math.floor(12+broad*19+hills*9+fine*3);}
 generate(){const s=this.seed;for(let x=0;x<SIZE;x++)for(let z=0;z<SIZE;z++){let h=this.terrain(x,z);const river=Math.abs(z-(80+Math.sin(x/28)*17));if(river<7)h=Math.min(h,14+Math.floor(river*.62));else if(river<11)h=Math.min(h,18+Math.floor((river-7)*1.2));this.heights[x*SIZE+z]=h;
 for(let y=0;y<=Math.max(h,SEA);y++){let id=0;if(y===0)id=B.BEDROCK;else if(y>h)id=B.WATER;else if(y===h)id=h<=SEA+1?B.SAND:h>36?B.SNOW:B.GRASS;else if(y>h-4)id=h<=SEA+1?B.SAND:B.DIRT;else{id=B.STONE;const ore=hash(x*73+y*13,z*19+y*97,s);if(ore>.965)id=B.COAL_ORE;if(ore<.019&&y<25)id=B.IRON_ORE;if(ore>.949&&ore<.954&&y<11)id=B.DIAMOND_ORE;
 const cave=noise(x/13+y*.09,z/13-y*.065,s+15);const tunnel=Math.sin(x*.19+y*.48)+Math.cos(z*.21-y*.4);if(y>3&&y<h-5&&cave>.54&&Math.abs(tunnel)<.32)id=0;}
 this.blocks[this.index(x,y,z)]=id;}}
 for(let x=4;x<SIZE-4;x++)for(let z=4;z<SIZE-4;z++){const h=this.heights[x*SIZE+z];if(this.get(x,h,z)!==B.GRASS||hash(x,z,s+77)<.979)continue;const ht=4+Math.floor(hash(x,z,s+42)*3);for(let y=h+1;y<=h+ht;y++)this.blocks[this.index(x,y,z)]=B.WOOD;for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=-2;dy<=1;dy++){if(Math.abs(dx)+Math.abs(dz)>3&&dy!==-1)continue;if(dy===1&&(Math.abs(dx)>1||Math.abs(dz)>1))continue;const px=x+dx,py=h+ht+dy,pz=z+dz;if(!this.get(px,py,pz))this.blocks[this.index(px,py,pz)]=B.LEAVES;}}
 this.dirty.clear();return this;}
 ground(x,z){x=Math.floor(x);z=Math.floor(z);for(let y=HEIGHT-1;y>=0;y--){const b=this.get(x,y,z);if(solid(b)&&b!==B.LEAVES&&b!==B.WOOD)return y+1;}return SEA+1;}
 spawn(){for(let radius=0;radius<50;radius++)for(let dx=-radius;dx<=radius;dx++)for(const dz of [-radius,radius]){const x=65+dx,z=56+dz,y=this.ground(x,z);if(y>SEA+1&&this.get(x,y-1,z)===B.GRASS&&!this.get(x,y,z)&&!this.get(x,y+1,z))return{x:x+.5,y:y+.02,z:z+.5};}return{x:64.5,y:40,z:50.5};}
 restore(edits){for(const [idx,id] of edits||[]){if(Number.isInteger(idx)&&idx>=0&&idx<this.blocks.length&&id>=0&&id<=21){this.blocks[idx]=id;this.edits.set(idx,id);}}}
}
// Exact voxel traversal: avoids thin-step tunnelling when targeting block edges.
export function raycast(world,origin,dir,max=5){let x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);const sx=Math.sign(dir.x),sy=Math.sign(dir.y),sz=Math.sign(dir.z);const dx=Math.abs(1/dir.x),dy=Math.abs(1/dir.y),dz=Math.abs(1/dir.z);let tx=(dir.x>0?x+1-origin.x:origin.x-x)*dx,ty=(dir.y>0?y+1-origin.y:origin.y-y)*dy,tz=(dir.z>0?z+1-origin.z:origin.z-z)*dz;if(!sx)tx=Infinity;if(!sy)ty=Infinity;if(!sz)tz=Infinity;let normal={x:0,y:0,z:0},distance=0;for(let i=0;i<100&&distance<=max;i++){const id=world.get(x,y,z);if(id&&id!==B.WATER)return{x,y,z,id,normal,distance};if(tx<ty&&tx<tz){x+=sx;distance=tx;tx+=dx;normal={x:-sx,y:0,z:0};}else if(ty<tz){y+=sy;distance=ty;ty+=dy;normal={x:0,y:-sy,z:0};}else{z+=sz;distance=tz;tz+=dz;normal={x:0,y:0,z:-sz};}}return null;}
export function collides(world,p,height=1.8){for(let x=Math.floor(p.x-.29);x<=Math.floor(p.x+.29);x++)for(let y=Math.floor(p.y+.001);y<=Math.floor(p.y+height-.001);y++)for(let z=Math.floor(p.z-.29);z<=Math.floor(p.z+.29);z++)if(solid(world.get(x,y,z)))return true;return false;}
