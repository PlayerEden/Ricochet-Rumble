// Real browser fault injection against a guest receiving short malformed LAN packets.
// Native Wi-Fi is mocked ONLY at the bridge boundary; game state/render code is real.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required; do not skip LAN fault QA');
const root=path.resolve('web'),src=fs.readFileSync(path.join(root,'game.js'),'utf8');
const close=/\}\)\(\);\s*$/;
assert.ok(close.test(src),'game IIFE trailer');
const injected=src.replace(close,`window.__fault={
 guest(){mode='guest';connected=true;paused=true;lanLobby=null;state=initialState(0,{...selectedRules,botCount:0,teamMode:'ffa'},271828);return this.snapshot()},
 host(){mode='host';connected=true;paused=false;lanLobby=null;state=initialState(0,{...selectedRules,botCount:0,teamMode:'ffa'},271829);neutralizeGuestInput();return this.snapshot()},
 snapshot(){return serializeState()},
 receiveState(s){const previous=state;window.RR.nativeMessage(JSON.stringify({type:'state',state:s}));return {changed:state!==previous,seed:state.mazeSeed}},
 receiveInput(v){window.RR.nativeMessage(JSON.stringify({type:'input',input:v}));return {...guestInput}},
 get safe(){return validRemoteSnapshot(this.snapshot())}
};})();`);
const names=new Set(['index.html','style.css','game.js','dossier.js','save-backup.js','scored-match.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.replace(/^\/+/,'')||'index.html';
 if(!names.has(name)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?injected:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.waitForFunction(()=>!!window.__fault);
 const base=await page.evaluate(()=>window.__fault.guest());
 assert.equal(await page.evaluate(()=>window.__fault.safe),true,'own normal host snapshot is valid');
 const cases=[
  null,{...base,bullets:null},{...base,vehicles:null},{...base,config:null},
  {...base,fxEvents:[null]},{...base,tanks:[null,...base.tanks.slice(1)]},
  {...base,tanks:base.tanks.map((t,i)=>i===1?{...t,x:'bad'}:t)},
  {...base,bullets:Array.from({length:129},()=>({x:1,y:1,vx:0,vy:0}))},
  {...base,lives:[1,1,1]},{...base,kos:[0]},{...base,mazeSeed:null},
  {...base,pickups:[{x:null,y:44}]}
 ];
 for(const [i,bad] of cases.entries()){
  const ans=await page.evaluate(v=>window.__fault.receiveState(v),bad);
  assert.equal(ans.changed,false,'malformed snapshot '+i+' rejected before replacing active state');
  assert.equal(ans.seed,base.mazeSeed,'original guest maze preserved');
 }
 const good=await page.evaluate(v=>window.__fault.receiveState(v),JSON.parse(JSON.stringify(base)));
 assert.equal(good.changed,true,'normal complete host snapshot still accepted');
 const h=await page.evaluate(()=>window.__fault.host());
 assert.equal(h.tanks.length,2);
 const input=await page.evaluate(()=>window.__fault.receiveInput({moveX:'garbage',moveY:null,aimX:'NaN',fire:'true'}));
 assert.equal(input.moveX,0);assert.equal(input.moveY,0);assert.equal(input.fire,false);
 const normalized=await page.evaluate(()=>window.__fault.receiveInput({moveX:1,moveY:1,fire:true,aimX:1,aimY:1}));
 assert.ok(Math.hypot(normalized.moveX,normalized.moveY)<=1.000001,'unit circle movement cap');
 assert.equal(normalized.fire,true);
 assert.deepEqual(errors,[],'malformed LAN traffic cannot throw browser runtime errors');
 console.log('LAN_FAULT_INJECTION_REAL_BROWSER_PASS: 12 malformed snapshots dropped; valid state and clamped guest controls accepted');
}finally{
 await page.close().catch(()=>{});await browser.close();await new Promise(ok=>server.close(ok));
}