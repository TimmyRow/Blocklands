import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true,args:['--enable-webgl']});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
fs.mkdirSync('test-results',{recursive:true});
try{
 await page.goto('http://127.0.0.1:5187/?qa');
 await page.waitForFunction(()=>window.__game);
 await page.click('#play');await page.waitForSelector('#pause:not(.hidden)');await page.click('#resume');
 // A deep pool against a bank one block higher than its surface.
 await page.evaluate(()=>{const g=__game.game;g.mobs=[];g.time=.3;g.waterJump=0;for(let x=60;x<70;x++)for(let z=42;z<60;z++){for(let y=25;y<40;y++)g.world.set(x,y,z,0);g.world.set(x,25,z,3);for(let y=26;y<(z>=52?29:30);y++)g.world.set(x,y,z,z>=52?7:3);}Object.assign(g.player,{x:64.5,y:26.1,z:53.5,yaw:0,pitch:-.15,vy:0,grounded:false});g.bag=Array(36).fill(null);});
 await page.keyboard.down('Space');await page.keyboard.down('KeyW');
 await page.waitForFunction(()=>__game.game.player.z<51.6,{},{timeout:20000});
 await page.keyboard.up('KeyW');await page.keyboard.up('Space');
 await page.waitForFunction(()=>__game.game.player.grounded);
 assert.ok(await page.evaluate(()=>__game.game.player.y>=30));
 await page.evaluate(()=>{__game.game.player.yaw=Math.PI;__game.game.player.pitch=-.35;});
 await page.screenshot({path:'test-results/water-exit.png'});
 console.log('PASS real Space + W swims out onto a raised shoreline');
 // A suspended platform: walking forward requires each new block to support us.
 await page.evaluate(()=>{const g=__game.game;for(let x=60;x<70;x++)for(let z=42;z<60;z++)for(let y=26;y<40;y++)g.world.set(x,y,z,0);g.world.set(64,29,54,3);Object.assign(g.player,{x:64.5,y:30.005,z:54.5,yaw:0,pitch:-.98,vy:0,grounded:true});g.waterJump=0;g.bag[0]={id:8,n:64};__game.select(0);});
 await page.waitForFunction(()=>__game.view.bridgeOutline.visible);
 assert.equal(await page.evaluate(()=>__game.game.placementTarget().z),53);
 await page.screenshot({path:'test-results/bridge-preview.png'});
 await page.mouse.down({button:'right'});await page.keyboard.down('KeyW');
 await page.waitForFunction(()=>__game.game.player.z<50.5,{},{timeout:15000});
 await page.keyboard.up('KeyW');await page.mouse.up({button:'right'});
 assert.ok(await page.evaluate(()=>__game.game.player.y>=30));
 const placed=await page.evaluate(()=>64-__game.game.bag[0].n);assert.ok(placed>=4);
 console.log('PASS hold right-click + W places a continuous bridge and spends blocks');
 // Reposition on the finished bridge to offer a fresh target after release.
 await page.evaluate(()=>{const g=__game.game;let end=54;while(g.world.get(64,29,end-1)===8)end--;Object.assign(g.player,{z:end+.5,pitch:-.98});});
 await page.waitForFunction(()=>__game.game.placementTarget()?.bridge);
 const released=await page.evaluate(()=>__game.game.bag[0].n);
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>__game.game.bag[0].n),released);
 await page.keyboard.down('ShiftLeft');await page.mouse.down({button:'right'});await page.keyboard.down('KeyW');
 await page.waitForFunction(n=>__game.game.bag[0].n<n-1,released,{timeout:15000});
 await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');await page.mouse.up({button:'right'});
 assert.ok(await page.evaluate(()=>__game.game.player.y>=30));
 console.log('PASS release stops building; sneaking supports continued forward bridging');
 await page.evaluate(()=>{const g=__game.game;g.player.yaw=Math.PI;g.player.pitch=-.5;});
 await page.screenshot({path:'test-results/bridge-built.png'});
 // Opening a menu while the button is held must clear the repeat state.
 await page.mouse.down({button:'right'});await page.keyboard.press('e');
 await page.waitForSelector('#inventory:not(.hidden)');await page.mouse.up({button:'right'});
 const paused=await page.evaluate(()=>__game.game.bag[0].n);
 await page.keyboard.press('e');
 await page.evaluate(()=>{const g=__game.game;let end=54;while(g.world.get(64,29,end-1)===8)end--;Object.assign(g.player,{z:end+.5,yaw:0,pitch:-.98});});
 await page.waitForFunction(()=>__game.game.placementTarget()?.bridge);
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>__game.game.bag[0].n),paused);
 console.log('PASS inventory transition clears held placement');
 assert.deepEqual(errors,[]);console.log('PASS no runtime or WebGL errors');
}finally{await browser.close();}
