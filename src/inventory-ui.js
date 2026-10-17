import {B,items,recipes,addItem,canCraft} from './data.js';
import {recipePattern,matchRecipe,takeCraft,fillRecipe,smelting,fuels,armorPoints} from './systems.js';
const $=id=>document.getElementById(id),show=(id,on)=>$(id).classList.toggle('hidden',!on);
export class InventoryUI{
 constructor(game,view,slotHTML,refresh,sound,toast){Object.assign(this,{game,view,slotHTML,refresh,sound,toast});this.context=null;this.cursor=null;this.grid=Array(4).fill(null);this.size=2;this.search='';this.pointer={x:0,y:0};
  $('inventory').addEventListener('click',e=>this.click(e));$('inventory').addEventListener('contextmenu',e=>this.click(e));
  $('recipe-search').addEventListener('input',e=>{this.search=e.target.value;this.renderRecipes();});
  $('clear-grid').onclick=()=>{this.returnGrid();this.render();this.refresh();};
 }
 open(context){this.returnItems();this.context=context;this.size=context?.id===B.TABLE?3:2;this.grid=Array(this.size*this.size).fill(null);this.search='';$('recipe-search').value='';this.render();}
 container(){if(this.context?.id!==B.CHEST)return null;const t=this.context,k=[t.x,t.y,t.z].join(',');return this.game.world.chests[k]??=Array(27).fill(null);}
 furnace(){return this.context?.id===B.FURNACE?this.game.furnaceAt(this.context):null;}
 returnStack(s){if(!s)return;const left=addItem(this.game.bag,s.id,s.n,s.dur);if(left)this.game.drop(s.id,left,this.game.player,s.dur);}
 returnCursor(){this.returnStack(this.cursor);this.cursor=null;this.renderCursor();}
 returnGrid(){for(const s of this.grid)this.returnStack(s);this.grid.fill(null);}
 returnItems(){this.returnCursor();this.returnGrid();}
 renderCursor(){show('cursor-stack',!!this.cursor);if(this.cursor){$('cursor-stack').innerHTML=this.slotHTML(this.cursor);$('cursor-stack').style.left=this.pointer.x-18+'px';$('cursor-stack').style.top=this.pointer.y-18+'px';}}
 slots(id,bag,indices,area){$(id).innerHTML=indices.map(i=>`<button class="slot" data-area="${area}" data-slot="${i}" title="${bag[i]?items[bag[i].id].name:'Empty slot'}" aria-label="${area} ${i+1}: ${bag[i]?items[bag[i].id].name+' × '+bag[i].n:'Empty slot'}">${this.slotHTML(bag[i])}</button>`).join('');}
 render(){const g=this.game,creative=g.mode==='creative',ctx=this.context?.id,chest=this.container(),f=this.furnace();
  $('inv-eyebrow').textContent=creative?'CREATIVE · UNLIMITED ITEMS':'SURVIVAL';$('inv-title').textContent=ctx===17?'Chest':ctx===16?'Furnace':ctx===12?'Crafting Table':'Inventory';$('craft-title').textContent=creative?'Block & item collection':f?'Smelting':this.size+' × '+this.size+' Crafting';$('player-stats').textContent=g.health+' / 20 HP';document.querySelector('.pixel-person').className='pixel-person '+g.equipment.map((s,i)=>s?'armor-'+i:'').join(' ');document.querySelector('.recipe-label').firstChild.textContent=creative?'Creative collection · click to select':'Recipe book · click to fill grid';
  show('craft-workspace',!creative&&!f&&!chest);show('furnace-workspace',!!f&&!creative);show('recipe-section',creative||!f&&!chest);show('container-slots',!!chest);show('equipment',!chest&&!f);show('recipe-search',creative||!f&&!chest);
  $('craft-grid').style.gridTemplateColumns=`repeat(${this.size},48px)`;this.slots('craft-grid',this.grid,this.grid.map((_,i)=>i),'craft');
  const r=matchRecipe(this.grid,this.size);$('craft-output').innerHTML=r?this.slotHTML({id:r.out,n:r.n}):'';$('craft-output').disabled=!r;$('craft-output').title=r?items[r.out].name:'Place ingredients to craft';
  this.slots('bag',g.bag,Array.from({length:27},(_,i)=>i+9),'bag');this.slots('inv-hotbar',g.bag,Array.from({length:9},(_,i)=>i),'bag');
  this.slots('armor-slots',g.equipment,[0,1,2,3],'equipment');$('armor-points').textContent=armorPoints(g.equipment)+' / 20 armor';
  if(chest)this.slots('container-slots',chest,chest.map((_,i)=>i),'container');
  if(f){this.slots('furnace-input',f.slots,[0],'furnace');this.slots('furnace-fuel',f.slots,[1],'furnace');this.slots('furnace-output',f.slots,[2],'furnace');this.progress();}
  this.renderRecipes();this.renderCursor();
 }
 progress(){const f=this.furnace();if(!f)return;$('smelt-progress').style.width=Math.min(100,f.progress/8*100)+'%';$('fuel-progress').style.height=(f.burnTotal?f.burn/f.burnTotal*100:0)+'%';$('furnace-state').textContent=f.burn>0?(smelting[f.slots[0]?.id]?'Smelting…':'Fuel burning'):f.slots[0]?'Add coal, charcoal, logs, or planks':'Add an item above and fuel below';}
 renderRecipes(){const creative=this.game.mode==='creative',filter=this.search.trim().toLowerCase(),box=$('recipes');box.innerHTML='';if(creative){for(const [id,item]of Object.entries(items)){if([23,24].includes(+id)||!item.name.toLowerCase().includes(filter))continue;const b=document.createElement('button');b.className='recipe';b.innerHTML=`<img src="${this.view.icons[id]}" alt=""><span>${item.name}</span>`;b.onclick=()=>{this.returnCursor();this.cursor={id:+id,n:item.durability?1:64,...(item.durability?{dur:item.durability}:{})};this.renderCursor();};box.append(b);}return;}
  this.game.discoverRecipes([...this.grid,this.cursor]);
  const available=recipes.filter(r=>this.game.recipeUnlocked(r)),stacks=[...this.game.bag,...this.grid];
  const fits=r=>{const p=recipePattern(r);return p.length>0&&p.length<=this.size&&p[0].length<=this.size;};
  const ready=r=>fits(r)&&canCraft(stacks,r);
  document.querySelector('.recipe-label').firstChild.textContent=`Recipe book · ${available.length} unlocked · click to fill`;
  for(const r of [...available].sort((a,b)=>Number(ready(b))-Number(ready(a)))){if(!items[r.out].name.toLowerCase().includes(filter))continue;
   const b=document.createElement('button');b.className='recipe'+(ready(r)?' craftable':'');b.setAttribute('aria-label',items[r.out].name);const cost=Object.entries(r.cost).map(([id,n])=>`${n} ${items[id].name}`).join(', '),state=!fits(r)?'Needs crafting table':canCraft(stacks,r)?'Ready to craft':'Missing materials';b.innerHTML=`<img src="${this.view.icons[r.out]}" alt=""><span>${r.n>1?r.n+'× ':''}${items[r.out].name}<small>${cost}</small><small class="recipe-state">${state}</small></span>`;b.title=state+': '+cost;b.disabled=!ready(r);b.onclick=()=>{if(fillRecipe(this.game.bag,this.grid,this.size,r)){this.render();this.refresh();}else this.toast('Free some inventory space before changing recipes.');};box.append(b);
  }
  if(!box.childElementCount)box.innerHTML='<p class="empty-recipes">'+(filter?'No unlocked recipes match.':'Collect logs to unlock planks. Collect new ingredients to discover more recipes.')+'</p>';
 }
 accepts(area,i,s){if(!s)return true;if(area==='equipment')return items[s.id]?.armor===i;if(area==='furnace')return i===0?!!smelting[s.id]:i===1?!!fuels[s.id]:false;return true;}
 click(e){if(e.target.closest('#craft-output')){e.preventDefault();if(e.button===2)return;const result=takeCraft(this.grid,this.size,this.cursor);if(result){this.cursor=result;this.sound('place');if(e.shiftKey)this.returnCursor();this.refresh();this.render();}return;}
  const b=e.target.closest('[data-slot]');if(!b)return;e.preventDefault();const area=b.dataset.area,i=+b.dataset.slot,g=this.game;const bag=area==='bag'?g.bag:area==='craft'?this.grid:area==='equipment'?g.equipment:area==='container'?this.container():this.furnace()?.slots;if(!bag)return;const s=bag[i];
  if(e.shiftKey&&s){if(area==='bag'){const chest=this.container(),f=this.furnace();if(chest){const left=addItem(chest,s.id,s.n,s.dur);s.n=left;if(!left)bag[i]=null;}else if(f){const j=smelting[s.id]?0:fuels[s.id]?1:-1;if(j>=0){const temp=[f.slots[j]];s.n=addItem(temp,s.id,s.n,s.dur);f.slots[j]=temp[0];if(!s.n)bag[i]=null;}}else if(items[s.id].armor!==undefined&&!g.equipment[items[s.id].armor]){g.equipment[items[s.id].armor]=s;bag[i]=null;}else{const indices=Array.from({length:i<9?27:9},(_,n)=>n+(i<9?9:0)),temp=indices.map(j=>g.bag[j]);s.n=addItem(temp,s.id,s.n,s.dur);indices.forEach((j,k)=>g.bag[j]=temp[k]);if(!s.n)bag[i]=null;}}else{s.n=addItem(g.bag,s.id,s.n,s.dur);if(!s.n)bag[i]=null;}}
  else if(area==='furnace'&&i===2){if(s&&(!this.cursor||this.cursor.id===s.id&&this.cursor.n+s.n<=64)){this.cursor=this.cursor?{...this.cursor,n:this.cursor.n+s.n}:s;bag[i]=null;g.xp++;}}
  else if(this.accepts(area,i,this.cursor)){if(e.button===2){if(!this.cursor&&s){const n=Math.ceil(s.n/2);this.cursor={...s,n};s.n-=n;if(!s.n)bag[i]=null;}else if(this.cursor&&(!s||s.id===this.cursor.id&&!items[s.id].durability&&s.n<64)){if(s)s.n++;else bag[i]={...this.cursor,n:1};if(--this.cursor.n<=0)this.cursor=null;}}else if(this.cursor&&s&&this.cursor.id===s.id&&!items[s.id].durability){const n=Math.min(64-s.n,this.cursor.n);s.n+=n;this.cursor.n-=n;if(!this.cursor.n)this.cursor=null;}else{bag[i]=this.cursor;this.cursor=s;}}
  this.refresh();this.render();
 }
}
