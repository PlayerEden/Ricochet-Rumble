// M11-A real game (not isolated FX experiment) hybrid menu contract.
// CI must build the local Pixi bundle before running this test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'Chromium required for GPU menu QA');
const root=path.resolve('web');
const compiled=fs.readFileSync('web/hybrid-menu-pixi.bundle.js','utf8');
assert.ok(compiled.length>150000 && compiled.includes('SR_HYBRID_PIXI_V1'),
 'Refuse to test placeholder: bundle real PixiJS before QA');
assert.equal(compiled,fs.readFileSync('android/app/src/main/assets/hybrid-menu-pixi.bundle.js','utf8'));
for(const f of ['index.html','style.css','game.js'])
 assert.equal(fs.readFileSync('web/'+f,'utf8'),
 fs.readFileSync('android/app/src/main/assets/'+f,'utf8'),'Web/Android asset parity: '+f);

const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js',
 'ctf-rules.js','ctf-ai.js','hybrid-menu-pixi.bundle.js']);
const missing=[],external=[],errors=[];
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 const name=decodeURIComponent(pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 const type=name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html';
 res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const report=[];
fs.mkdirSync('qa-results/m11-hybrid',{recursive:true});
const sizes=[[568,320],[640,360],[740,360],[915,412]];
try{
 for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(''+e.message));
  page.on('request',req=>{
   if(req.url().startsWith('http')&&!req.url().startsWith(origin))external.push(req.url());
  });
  await page.goto(origin+'/?hybridMenu=1',{waitUntil:'load'});
  await page.waitForFunction(()=>window.__SRHybridMenu?.active===true&&window.__SRHybridMenu?.frames>=3,
    null,{timeout:30000});
  const first=await page.evaluate(()=>({...window.__SRHybridMenu}));
  assert.equal(first.backend,'webgl','real GPU renderer, not fake Canvas mode');
  assert.ok(first.mounts>=1,'at least one GPU mount');
  assert.equal(await page.locator('.home-stage [data-hybrid-pixi] canvas').count(),1);
  const hud=await page.evaluate(()=>{
   const stage=document.querySelector('.home-stage').getBoundingClientRect();
   const play=document.querySelector('[data-action="solo"]').getBoundingClientRect();
   const overlay=document.querySelector('.hybrid-menu-pixi');
   const hit=document.elementFromPoint(play.x+play.width/2,play.y+play.height/2);
   return {stage:{x:stage.x,y:stage.y,right:stage.right,bottom:stage.bottom,height:stage.height},
    deploy:{x:play.x,right:play.right,y:play.y,bottom:play.bottom,height:play.height},
    pointerEvents:getComputedStyle(overlay).pointerEvents,
    action:hit?.closest('button')?.dataset.action||''};
  });
  assert.equal(hud.pointerEvents,'none','Pixi graphics never steal taps');
  assert.equal(hud.action,'solo','Quick Play hit target stays on top');
  assert.ok(hud.stage.height>=105,'menu hero remains readable at compact landscape');
  assert.ok(hud.stage.x>=-1&&hud.stage.right<=width+1&&hud.deploy.bottom<=height+1);
  assert.ok(hud.deploy.height>=40,'primary action remains thumb-sized');
  await page.screenshot({path:'qa-results/m11-hybrid/hybrid-'+width+'x'+height+'.png'});
  // All existing real actions still route through the game's own menu handler.
  for(const [open,selector,back] of [
    ['hangar','.hangar-screen','hangar-back'],
    ['dossier','.dossier-screen','dossier-back'],
    ['help','.help-screen','help-back'],
    ['modes','.mode-screen','modes-back'],
    ['settings','.settings-head','settings-back']
  ]){
   await page.locator('#menu button[data-action="'+open+'"]').click();
   assert.equal(await page.locator(selector).isVisible(),true,open+' still opens');
   await page.waitForFunction(()=>window.__SRHybridMenu?.active===false,null,{timeout:15000});
   assert.equal(await page.locator('[data-hybrid-pixi] canvas').count(),0,
    'WebGL canvas should be disposed away from home');
   await page.locator('#menu button[data-action="'+back+'"]').click();
   await page.waitForFunction(()=>window.__SRHybridMenu?.active===true&&window.__SRHybridMenu?.frames>=3,
    null,{timeout:15000});
  }
  const again=await page.evaluate(()=>({...window.__SRHybridMenu}));
  assert.ok(again.mounts>=6&&again.unmounts>=5,'repeat home transitions release/recreate GPU context');
  await page.locator('#menu button[data-action="solo"]').click();
  await page.waitForFunction(()=>document.querySelector('#menu')?.classList.contains('hidden'),null,{timeout:15000});
  await page.waitForFunction(()=>window.__SRHybridMenu?.active===false,null,{timeout:15000});
  assert.equal(await page.locator('[data-hybrid-pixi] canvas').count(),0,'no Pixi GPU work during Canvas combat');
  assert.equal(await page.locator('#arena').isVisible(),true,'actual combat Canvas persists');
  await context.close();
  report.push({viewport:width+'x'+height,backend:'webgl',mounts:again.mounts,
   menuToHangarDossierHelpModesSettings:'PASS',input:'PASS',combatDisposal:'PASS'});
 }
 // Default run has no library request and still has fully functioning Canvas
 // showroom. It must not add a second GPU renderer or an externally fetched URL.
 const canvasContext=await browser.newContext({viewport:{width:740,height:360}});
 const canvasPage=await canvasContext.newPage();
 canvasPage.on('pageerror',e=>errors.push(e.message));
 const requests=[];
 canvasPage.on('request',req=>requests.push(req.url()));
 await canvasPage.goto(origin+'/',{waitUntil:'load'});
 await canvasPage.waitForTimeout(250);
 assert.ok((await canvasPage.locator('.home-stage #menu-preview').isVisible()),'Canvas fallback still present');
 assert.equal((await canvasPage.locator('.home-stage [data-hybrid-pixi] canvas').count()),0);
 assert.ok(!requests.some(x=>x.includes('hybrid-menu-pixi.bundle.js')),'no Pixi startup during default owner flow');
 await canvasContext.close();
 assert.deepEqual(errors,[],'no runtime exceptions');
 assert.deepEqual(missing,[],'no unknown app files');
 assert.deepEqual(external,[],'offline-only requests');
 const evidence={result:'PASS',scope:'main-rooted real browser hybrid menu only',cases:report,
   defaultCanvas:'PASS',noExternalAssets:true,noGameplayRendererMigration:true};
 fs.writeFileSync('qa-results/m11-hybrid/qa.json',JSON.stringify(evidence,null,2)+'\n');
 console.log('SR_M11_HYBRID_MENU_QA_PASS '+JSON.stringify(evidence));
}finally{await browser.close();await new Promise(done=>server.close(done));}
