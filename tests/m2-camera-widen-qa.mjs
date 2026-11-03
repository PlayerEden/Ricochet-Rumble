// M2 camera-awareness owner preview: exercise the actual Canvas game in real Chromium.
// Automated viewport check, not a replacement for on-phone legibility/feel.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'Chrome or Chromium required');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.match(source,/\}\)\(\);\s*$/);
const addon=`window.__cameraWidenQA={sample(unit,mapSize,seed){
 mode='solo';paused=true;
 state=initialState(0,{...selectedRules,mapSize,botCount:2,pilotMode:true},seed);
 const t=state.tanks[0];
 if(!t)throw Error('missing playable actor');
 if(unit==='pilot'){t.onFoot=true;t.vehicleId=null;}
 else {const v=currentVehicle(t);if(!v)throw Error('missing starting vehicle');
  v.type=unit;t.onFoot=false;}
 camera.zoom=null;camera.x=0;camera.y=0;
 const target=cameraZoom(t),floor=Math.max(W/(worldW+CAMERA_APRON*2),H/(worldH+CAMERA_APRON*2));
 render(1/60);
 return {unit,mapSize,zoom:camera.zoom,target,floor,W,H,worldW,worldH,
  visibleWorldWidth:W/camera.zoom,visibleWorldHeight:H/camera.zoom,
  cameraX:camera.x,cameraY:camera.y,apron:CAMERA_APRON};
}};})();`;
const hooked=source.replace(/\}\)\(\);\s*$/,addon);
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','forward-bays.js','lan-series.js','lan-room.js']);
const missing=[];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/, '')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?hooked:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];page.on('pageerror',err=>errors.push(err.message));
const records=[];
const prior={pilot:1.07,tank:.82,mech:.77},newTarget={pilot:.98,tank:.75,mech:.71};
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.waitForFunction(()=>!!window.__cameraWidenQA);
 for(const viewport of [{width:915,height:412},{width:740,height:360},{width:412,height:915},{width:360,height:740}]){
  await page.setViewportSize(viewport);
  const measurements={};
  for(const mapSize of ['standard','large']){
   for(const unit of ['pilot','tank','mech']){
    const row=await page.evaluate(({unit,mapSize,seed})=>window.__cameraWidenQA.sample(unit,mapSize,seed),{unit,mapSize,seed:20261103});
    assert.ok(row.W>0&&row.H>0&&row.worldW>0&&row.worldH>0,'nonzero game dimensions');
    assert.ok(Math.abs(row.zoom-row.target)<1e-7,'real render reaches computed zoom on new match');
    assert.ok(row.zoom>=row.floor-1e-7,'perimeter zoom floor preserved');
    assert.ok(Math.abs(row.zoom-Math.max(newTarget[unit],row.floor))<1e-7,'correct vehicle zoom incl. floor');
    const oldZoom=Math.max(prior[unit],row.floor);
    assert.ok(row.visibleWorldWidth>=row.W/oldZoom*1.075,'wider world view than previous camera by at least 7.5%');
    assert.ok(row.visibleWorldHeight>=row.H/oldZoom*1.075,'wider vertical view by at least 7.5%');
    assert.ok(row.visibleWorldWidth<=row.W/oldZoom*1.105,'not excessively zoomed out');
    assert.ok(row.cameraX>=-row.apron-1e-7&&row.cameraY>=-row.apron-1e-7,'camera apron safety');
    measurements[mapSize+':'+unit]=row;
    records.push({viewport:viewport.width+'x'+viewport.height,...row});
   }
   assert.ok(measurements[mapSize+':pilot].zoom>measurements[mapSize+':tank].zoom,'pilot view closer than tank');
   assert.ok(measurements[mapSize+':tank].zoom>measurements[mapSize+':mech].zoom,'tank view closer than mech');
  }
 }
 assert.deepEqual(errors,[],'no runtime errors');
 assert.deepEqual(missing,[],'no missing bundled game assets');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/m2-camera-widen.json',JSON.stringify({status:'PASS',type:'CHROMIUM_VIEWPORT_QA_NOT_PHYSICAL_ANDROID',records},null,2)+'\n');
 console.log('M2_CAMERA_WIDEN_PASS: '+records.length+' real rendering checks across 4 landscape/portrait sizes, 2 arenas and 3 units, no errors, correct floor/order');
} finally{
 await page.close().catch(()=>{});await browser.close();await new Promise(ok=>server.close(ok));
}
