// M13-C integration QA: approved M13-A art + B5 match pacing + Solo watch in ONE URL.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Real Chromium required');
const root=path.resolve('web'),original=fs.readFileSync('web/game.js','utf8');
const tail=/\}\)\(\);\s*$/;assert.match(original,tail);
function hooks(){
 window.__fusionQA={
  targets(){return ['cqc','scored_tdm','scored_ffa'].map(id=>SCORED_MATCH_RULES[id].scoreTarget)},
  watch(){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{...selectedRules,matchModeId:'survival_ffa',mapSize:'standard',
    teamMode:'ffa',botCount:3,startLives:3,pilotMode:true},12345);
   state.lives[0]=0;state.winner=-1;refreshHUD();render(1/60);
   return {active:soloWatchActive(),seat:soloWatchSeat,hidden:
    document.getElementById('game-screen').classList.contains('solo-watching')};
  },
  camera(){return soloWatchSeat},
  alive(){return state.lives[soloWatchSeat]>0},
  deny(){mode='host';refreshHUD();return soloWatchActive()}
 };
}
const script=original.replace(tail,'\n('+hooks.toString()+')();\n})();');
const missing=[];
const srv=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 const target=path.resolve(root,name);
 if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){
  missing.push(name);res.writeHead(404);res.end();return;
 }
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':
  name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html',
  'Cache-Control':'no-store'});
 res.end(name==='game.js'?script:fs.readFileSync(target));
});
await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const output='qa-results/m13-c';fs.mkdirSync(output,{recursive:true});
const origin='http://127.0.0.1:'+srv.address().port;
const sizes=[[568,320],[640,360],[740,360],[915,412],[1280,720]],results=[],errors=[];
const storage=p=>p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort()
 .map(k=>[k,localStorage.getItem(k)])));
try{
 for(const [w,h] of sizes){
  const ctx=await browser.newContext({viewport:{width:w,height:h}}),page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(w+'x'+h+' '+e.message));
  await page.goto(origin+'/?m13Preview=1&m13Pacing=1',{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__fusionQA);
  const initial=await storage(page);
  assert.deepEqual(await page.evaluate(()=>window.__fusionQA.targets()),[15,30,10]);
  await page.locator('#menu button[data-action="modes"]').click();
  assert.equal(await page.locator('.mode-screen').getAttribute('data-m12-mode-art'),'on');
  assert.equal(await page.locator('.m12-mode-art-cycle').isVisible(),false);
  assert.match(await page.locator('.mode-cqc .mode-copy small').textContent(),/15 KOs/);
  assert.match(await page.locator('.mode-tdm .mode-copy small').textContent(),/30 KOs/);
  assert.ok((await page.locator('.mode-cqc').evaluate(el=>getComputedStyle(el,'::before').backgroundImage))
   .includes('mode-cqc-study-v1.svg'));
  await page.screenshot({path:output+'/modes-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('[data-action="modes-back"]').click();
  await page.locator('#menu button[data-action="hangar"]').click();
  assert.equal(await page.locator('.hangar-bay').getAttribute('data-m12-art'),'warm');
  assert.equal(await page.locator('.m12-art-cycle').isVisible(),false);
  assert.ok((await page.locator('.m12-art-plate').evaluate(el=>getComputedStyle(el).backgroundImage))
   .includes('hangar-warm-empty-v1.svg'));
  await page.locator('[data-hangar-tab="insignia"]').click();
  assert.equal(await page.locator('.hangar-screen').getAttribute('data-m12-insignia-art'),'on');
  assert.equal(await page.locator('.m12-insignia-art-cycle').isVisible(),false);
  await page.screenshot({path:output+'/insignia-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('[data-action="hangar-back"]').click();
  await page.locator('#menu button[data-action="dossier"]').click();
  assert.equal(await page.locator('.dossier-screen').getAttribute('data-m13-preview'),'on');
  assert.equal(await page.locator('#dossier-emblem-mark').getAttribute('data-m13-emblem'),'field');
  await page.locator('[data-action="dossier-back"]').click();
  assert.deepEqual(await storage(page),initial,'UI must not mutate progress');
  const watch=await page.evaluate(()=>window.__fusionQA.watch());
  assert.equal(watch.active,true);
  assert.equal(watch.hidden,true);
  assert.equal(await page.locator('#solo-watch-bar').isVisible(),true);
  assert.equal(await page.locator('.touch-zone').first().isVisible(),false);
  const bounds=await page.locator('#solo-watch-bar').boundingBox();
  assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=w+1&&
   bounds.y>=0&&bounds.y+bounds.height<=h+1,'spectator camera button on screen');
  await page.locator('#solo-watch-next').click();
  assert.notEqual(await page.evaluate(()=>window.__fusionQA.camera()),watch.seat);
  assert.equal(await page.evaluate(()=>window.__fusionQA.alive()),true);
  await page.screenshot({path:output+'/watch-'+w+'x'+h+'.png',animations:'disabled'});
  assert.equal(await page.evaluate(()=>window.__fusionQA.deny()),false,'LAN cannot activate Solo watch');
  assert.deepEqual(await storage(page),initial,'spectating is read only');
  results.push({viewport:w+'x'+h,art:true,KOtargets:[15,30,10],
   watch:true,noSaveWrites:true});
  await ctx.close();
 }
 const c=await browser.newContext({viewport:{width:740,height:360}}),p=await c.newPage(),requests=[];
 p.on('request',q=>{if(q.url().includes('/assets/m12/'))requests.push(q.url())});
 await p.goto(origin+'/',{waitUntil:'load'});
 await p.waitForFunction(()=>!!window.__fusionQA);
 assert.deepEqual(await p.evaluate(()=>window.__fusionQA.targets()),[10,15,10],
  'normal unflagged URL must retain canonical score targets');
 await p.locator('#menu button[data-action="modes"]').click();
 assert.equal(await p.locator('.mode-screen').getAttribute('data-m12-mode-art'),null);
 await p.locator('[data-action="modes-back"]').click();
 await p.locator('#menu button[data-action="hangar"]').click();
 assert.equal(await p.locator('.hangar-bay').getAttribute('data-m12-art'),null);
 assert.deepEqual(requests,[],'normal URL must never load study SVGs');
 await c.close();
 assert.deepEqual(errors,[],'no production browser errors');
 assert.deepEqual(missing,[],'all image and script dependencies exist');
 fs.writeFileSync(output+'/report.json',JSON.stringify({
  result:'PASS',browser:'Chromium',physicalPhoneTested:false,
  canonicalGameplayUnchanged:true,results},null,2)+'\n');
 console.log('M13_C_UNIFIED_ART_AND_BATTLE_PASS '+JSON.stringify({
  sizes:results.length,spectator:true,art:true,experimentalTargets:[15,30,10],
  savesUnchanged:true,normalGameUnaffected:true}));
}finally{await browser.close();await new Promise(done=>srv.close(done))}
