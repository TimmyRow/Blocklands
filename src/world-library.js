export class WorldLibrary{
 constructor(slots,{play,download,removed,changed}){Object.assign(this,{slots,play,download,removed,changed});this.list=document.getElementById('world-list');}
 render(){const {worlds,unreadable}=this.slots.list();this.list.replaceChildren();document.getElementById('world-count').textContent=`${worlds.length} saved ${worlds.length===1?'world':'worlds'} · on this device`;
  document.getElementById('worlds-note').textContent=unreadable.length?'An unreadable world was left untouched. Your other worlds are available.':'Each world saves separately. Download backups to keep a copy outside this browser.';
  if(!worlds.length){const empty=document.createElement('p');empty.className='world-empty';empty.textContent='Your next adventure starts here. Create a world or import a backup to begin.';this.list.append(empty);}
  for(const record of worlds)this.list.append(this.row(record));
 }
 button(text,action,className=''){const b=document.createElement('button');b.textContent=text;b.className=className;b.onclick=()=>{try{action();}catch(e){document.getElementById('worlds-note').textContent=e.message;}};return b;}
 row(record){const row=document.createElement('article');row.className='world-row';row.dataset.worldId=record.id;
  const icon=document.createElement('div');icon.className='world-icon '+record.save.mode;icon.textContent=record.save.mode==='creative'?'▧':'◆';
  const info=document.createElement('div');info.className='world-info';const title=document.createElement('h3');title.textContent=record.name;
  const meta=document.createElement('p');meta.textContent=`${record.save.mode==='creative'?'Creative':'Survival'} · Day ${record.save.day} · Seed: ${record.save.seed}`;
  const date=document.createElement('small');date.textContent='Saved '+new Date(record.updatedAt).toLocaleString();info.append(title,meta,date);
  const actions=document.createElement('div');actions.className='world-actions';actions.append(this.button('Play',()=>this.play(record.id),'primary'),this.button('Rename',()=>this.rename(row,record)),this.button('Download',()=>this.download(record)),this.button('Delete',()=>this.confirmDelete(row,record),'world-delete'));
  row.append(icon,info,actions);return row;
 }
 rename(row,record){const area=document.createElement('form');area.className='world-edit';const input=document.createElement('input');input.value=record.name;input.maxLength=48;input.required=true;input.setAttribute('aria-label','New world name');const save=document.createElement('button');save.textContent='Save name';save.className='primary';save.type='submit';const cancel=this.button('Cancel',()=>this.render());cancel.type='button';area.append(input,save,cancel);row.querySelector('.world-actions').replaceWith(area);area.onsubmit=e=>{e.preventDefault();try{this.slots.rename(record.id,input.value);this.changed();this.render();}catch(err){document.getElementById('worlds-note').textContent=err.message;}};input.focus();input.select();}
 confirmDelete(row,record){const area=document.createElement('div');area.className='world-edit delete-confirm';const text=document.createElement('p');text.textContent=`Delete “${record.name}”? This cannot be undone. Download a backup first if you want to keep it.`;area.append(text,this.button('Delete world',()=>{this.slots.remove(record.id);this.removed(record.id);this.changed();this.render();},'danger'),this.button('Cancel',()=>this.render()));row.querySelector('.world-actions').replaceWith(area);}
}
