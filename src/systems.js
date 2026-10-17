import {items,recipes,addItem,canCraft} from './data.js';

// Shapes are normalized so a recipe can be shifted or mirrored in either grid.
export function recipePattern(r){
 const material=Number(Object.keys(r.cost).find(id=>+id!==30));
 if(r.out===8)return [[material]];
 if(r.out===30)return [[8],[8]];
 if(r.out===12)return [[8,8],[8,8]];
 if(r.out===19)return [[material],[30]];
 if(r.out===28)return [[6,6],[6,6]];
 if(r.out===56)return [[55,55,55]];
 if(r.out===18)return [[37,37,37],[8,8,8]];
 if(r.out===16||r.out===17){const m=r.out===16?9:8;return [[m,m,m],[m,0,m],[m,m,m]];}
 if(r.out===59)return [[34,34,34],[34,0,34]];
 if(r.out===60)return [[34,0,34],[34,34,34],[34,34,34]];
 if(r.out===61)return [[34,34,34],[34,0,34],[34,0,34]];
 if(r.out===62)return [[34,0,34],[34,0,34]];
 const tool=items[r.out]?.tool;
 if(tool==='pick')return [[material,material,material],[0,30,0],[0,30,0]];
 if(tool==='axe')return [[material,material],[material,30],[0,30]];
 if(tool==='hoe')return [[material,material],[0,30],[0,30]];
 if(tool==='sword')return [[material],[material],[30]];
 if(tool==='shovel')return [[material],[30],[30]];
 return [];
}
function normalized(grid,size){
 const cells=[];for(let i=0;i<grid.length;i++)if(grid[i])cells.push([i%size,Math.floor(i/size),grid[i].id]);
 if(!cells.length)return [];
 const minX=Math.min(...cells.map(c=>c[0])),minY=Math.min(...cells.map(c=>c[1]));
 const w=Math.max(...cells.map(c=>c[0]))-minX+1,h=Math.max(...cells.map(c=>c[1]))-minY+1;
 const rows=Array.from({length:h},()=>Array(w).fill(0));for(const [x,y,id]of cells)rows[y-minY][x-minX]=id;return rows;
}
export function matchRecipe(grid,size){
 const shape=JSON.stringify(normalized(grid,size));
 return recipes.find(r=>{if(r.furnace)return false;const p=recipePattern(r);return p.length<=size&&p[0]?.length<=size&&(JSON.stringify(p)===shape||JSON.stringify(p.map(row=>[...row].reverse()))===shape);})||null;
}
export function takeCraft(grid,size,cursor){
 const r=matchRecipe(grid,size);if(!r)return null;
 const max=items[r.out].durability?1:64;if(cursor&&(cursor.id!==r.out||cursor.n+r.n>max))return null;
 for(let i=0;i<grid.length;i++)if(grid[i]&&--grid[i].n===0)grid[i]=null;
 return cursor?{...cursor,n:cursor.n+r.n}:{id:r.out,n:r.n,...(items[r.out].durability?{dur:items[r.out].durability}:{})};
}
export function fillRecipe(bag,grid,size,r){
 const p=recipePattern(r);if(!p.length||p.length>size||p[0].length>size)return false;
 const next=bag.map(s=>s?{...s}:null);for(const stack of grid)if(stack&&addItem(next,stack.id,stack.n,stack.dur))return false;
 if(!canCraft(next,r))return false;
 const result=Array(size*size).fill(null);
 p.forEach((row,y)=>row.forEach((id,x)=>{if(!id)return;const i=next.findIndex(s=>s?.id===id);result[y*size+x]={id,n:1};if(--next[i].n===0)next[i]=null;}));
 bag.splice(0,bag.length,...next);grid.splice(0,grid.length,...result);return true;
}

export const smelting={33:34,35:36,6:10,9:3,4:57,25:57,26:57};
export const fuels={32:80,57:80,4:15,25:15,26:15,8:15,30:5};
export function newFurnace(){return {slots:[null,null,null],burn:0,burnTotal:0,progress:0,recipe:null};}
export function tickFurnace(f,dt){
 let changed=false;
 // Small slices preserve correct fuel accounting if a long frame occurs.
 while(dt>0){const step=Math.min(.1,dt);dt-=step;
  const [input,fuel,output]=f.slots,out=smelting[input?.id];
  const valid=!!out&&(!output||output.id===out&&output.n<64);
  if(f.recipe!==input?.id){f.progress=0;f.recipe=input?.id??null;}
  if(valid&&f.burn<=0&&fuels[fuel?.id]){f.burn=f.burnTotal=fuels[fuel.id];if(--fuel.n===0)f.slots[1]=null;changed=true;}
  const burning=f.burn>0;
  if(burning&&valid){f.progress+=Math.min(step,f.burn);if(f.progress>=8){f.progress-=8;if(--input.n===0)f.slots[0]=null;if(output)output.n++;else f.slots[2]={id:out,n:1};changed=true;}}
  else f.progress=Math.max(0,f.progress-step*2);
  f.burn=Math.max(0,f.burn-step);
 }
 return changed;
}

export function armorPoints(equipment){return equipment.reduce((n,s)=>n+(items[s?.id]?.points||0),0);}
