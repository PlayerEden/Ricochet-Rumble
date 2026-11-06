// M13-F five-size comparator QA: M13-C art and spectator plus preview-only Solo TDM 40/360.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Real Chromium required');
const root=path.resolve('web'),original=fs.readFileSync('web/game.js','utf8');
const tail=/\}\)\(\);\s*$/;assert.match(original,tail);
function hooks(){
 window.__m13fQA={
  targets(){return ['cqc','scored_tdm','scored_ffa'].map(id=>SCORED_MATCH_RULES[id].scoreTarget)},
  clocks(){return ['cqc','scored_tdm','scored_ffa'].map(id=>SCORED_MATCH_RULES[id].clockSeconds)},
  eligible(){return M13_F_TDM_COMPARISON},
  actualTdm(session='solo',lanScoreTarget=30){
   mode=session;paused=false;menu.classList.add('hidden');
   state=initialState(0,{...selectedRules,matchModeId:'scored_tdm',mapSize:'standard',
    teamMode:'teams',botCount:session==='solo'?3:2,startLives:2,pilotMode:true,
    lanScoredTdm:session==='host',lanScoreTarget,lanSeriesRounds:1},42042);
   refreshHUD();
   return {target:state.scored.scoreTarget,clock:state.scored.clockSeconds,
    phase:matchArcFor()?.label||null,actualStateClock:state.scored.elapsedSeconds,
    scored:!!state.scored,session};
  },
  watch(){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{...selectedRules,matchModeId:'survival_ffa',mapSize:'standard',
    teamMode:'ffa',botCount:3,startLives:3,pilotMode:true},12345);
   state.lives[0]=0;state.deaths[0]=3;state.winner=-1;refreshHUD();render(1/60);
   const target=state.tanks[soloWatchSeat],sx=(target.x-camera.x)*camera.zoom,
    sy=(target.y-camera.y)*camera.zoom;
   return {active:soloWatchActive(),seat:soloWatchSeat,
    cameraOnTarget:sx>=0&&sx<=W&&sy>=0&&sy<=H,
    phase:matchArcFor()?.stage,clock:document.getElementById('score-clock').textContent,
    hidden:
    document.getElementById('game-screen').classList.contains('solo-watching')};
  },
  camera(){
   render(1/60);
   const target=state.tanks[soloWatchSeat],x=(target.x-camera.x)*camera.zoom,
     y=(target.y-camera.y)*camera.zoom;
   return {seat:soloWatchSeat,onTarget:x>=0&&x<=W&&y>=0&&y<=H};
  },
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
const output='qa-results/m13-f';fs.mkdirSync(output,{recursive:true});
const origin='http://127.0.0.1:'+srv.address().port;
const sizes=[[568,320],[640,360],[740,360],[915,412],[1280,720]],results=[],errors=[];
const storage=p=>p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort()
 .map(k=>[k,localStorage.getItem(k)])));
try{
 for(const [w,h] of sizes){
  const ctx=await browser.newContext({viewport:{width:w,height:h}}),page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(w+'x'+h+' '+e.message));
  await page.goto(origin+'/?m13Preview=1&m13Pacing=1&m13FCompare=1',{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__m13fQA);
  const initial=await storage(page);
  assert.deepEqual(await page.evaluate(()=>window.__m13fQA.targets()),[15,40,10]);
  assert.deepEqual(await page.evaluate(()=>window.__m13fQA.clocks()),[180,360,240]);
  assert.equal(await page.evaluate(()=>window.__m13fQA.eligible()),true);
  await page.locator('#menu button[data-action="modes"]').click();
  assert.equal(await page.locator('.mode-screen').getAttribute('data-m12-mode-art'),'on');
  assert.equal(await page.locator('.m12-mode-art-cycle').isVisible(),false);
  assert.match(await page.locator('.mode-cqc .mode-copy small').textContent(),/15 KOs/);
  assert.match(await page.locator('.mode-tdm .mode-copy small').textContent(),/40 KOs/);
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
  const watch=await page.evaluate(()=>window.__m13fQA.watch());
  assert.equal(watch.active,true);
  assert.equal(watch.hidden,true);
  assert.equal(watch.cameraOnTarget,true,'first watch target visible immediately');
  assert.equal(watch.phase,'spectating','other combatants are still fighting');
  assert.match(watch.clock,/WATCH FIGHT/);
  assert.equal(await page.locator('#solo-watch-bar').isVisible(),true);
  assert.equal(await page.locator('.touch-zone').first().isVisible(),false);
  const bounds=await page.locator('#solo-watch-bar').boundingBox();
  assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=w+1&&
   bounds.y>=0&&bounds.y+bounds.height<=h+1,'spectator camera button on screen');
  await page.locator('#solo-watch-next').click();
  const camera=await page.evaluate(()=>window.__m13fQA.camera());
  assert.notEqual(camera.seat,watch.seat);
  assert.equal(camera.onTarget,true,'NEXT CAMERA must put new survivor in view immediately');
  assert.equal(await page.evaluate(()=>window.__m13fQA.alive()),true);
  await page.screenshot({path:output+'/watch-'+w+'x'+h+'.png',animations:'disabled'});
  assert.equal(await page.evaluate(()=>window.__m13fQA.deny()),false,'LAN cannot activate Solo watch');
  const solo=await page.evaluate(()=>window.__m13fQA.actualTdm('solo'));
  assert.equal(solo.target,40,'actual Solo score kernel must use 40');
  assert.equal(solo.clock,360,'actual Solo score kernel must use 360 seconds');
  assert.equal(solo.phase,'DEPLOY','opening stage reflects real score state');
  const lan30=await page.evaluate(()=>window.__m13fQA.actualTdm('host',30));
  assert.equal(lan30.target,30,'LAN host-selected 30 KOs must retain authority');
  assert.equal(lan30.clock,300,'LAN TDM cap must remain 5 minutes');
  const lan15=await page.evaluate(()=>window.__m13fQA.actualTdm('host',15));
  assert.equal(lan15.target,15,'LAN host-selected 15 KOs must retain authority');
  assert.equal(lan15.clock,300);
  assert.deepEqual(await storage(page),initial,'spectating is read only');
  // Use a fresh tab because spectator test keeps main menu hidden.
  const settingsPage=await ctx.newPage();
  await settingsPage.goto(origin+'/?m13Preview=1&m13Pacing=1&m13FCompare=1',{waitUntil:'load'});
  await settingsPage.locator('#menu button[data-action="settings"]').click();
  const quickLabel=await settingsPage.locator('.quick-mode-option:has([data-playlist-mode="scored_tdm"])').textContent();
  assert.match(quickLabel,/40 KOs.*6 MIN/,'Quick Play label must agree with runtime');
  await settingsPage.close();
  results.push({viewport:w+'x'+h,art:true,KOtargets:[15,40,10],clocks:[180,360,240],
   watch:true,soloTdm:solo,lan30,lan15,noSaveWrites:true});
  await ctx.close();
 }
 const c=await browser.newContext({viewport:{width:740,height:360}}),p=await c.newPage(),requests=[];
 p.on('request',q=>{if(q.url().includes('/assets/m12/'))requests.push(q.url())});
 await p.goto(origin+'/',{waitUntil:'load'});
 await p.waitForFunction(()=>!!window.__m13fQA);
 assert.deepEqual(await p.evaluate(()=>window.__m13fQA.targets()),[10,15,10],
  'normal unflagged URL must retain canonical score targets');
 assert.deepEqual(await p.evaluate(()=>window.__m13fQA.clocks()),[180,300,240]);
 assert.equal(await p.evaluate(()=>window.__m13fQA.eligible()),false);
 await p.locator('#menu button[data-action="modes"]').click();
 assert.equal(await p.locator('.mode-screen').getAttribute('data-m12-mode-art'),null);
 await p.locator('[data-action="modes-back"]').click();
 await p.locator('#menu button[data-action="hangar"]').click();
 assert.equal(await p.locator('.hangar-bay').getAttribute('data-m12-art'),null);
 assert.deepEqual(requests,[],'normal URL must never load study SVGs');
 await c.close();
 for(const [suffix,expected] of [
   ['?m13Preview=1&m13Pacing=1',[15,30,10]],
   ['?m13FCompare=1',[10,15,10]],
   ['?m13Pacing=1&m13FCompare=1',[15,30,10]],
   ['?m13Preview=1&m13FCompare=1',[10,15,10]]]){
  const negative=await browser.newContext({viewport:{width:740,height:360}});
  const negPage=await negative.newPage();
  negPage.on('pageerror',e=>errors.push(suffix+' '+e.message));
  await negPage.goto(origin+'/'+suffix,{waitUntil:'load'});
  await negPage.waitForFunction(()=>!!window.__m13fQA);
  assert.deepEqual(await negPage.evaluate(()=>window.__m13fQA.targets()),expected,
   'comparison flag must require BOTH approved preview gates');
  assert.equal(await negPage.evaluate(()=>window.__m13fQA.eligible()),false);
  assert.equal((await negPage.evaluate(()=>window.__m13fQA.actualTdm('solo'))).clock,300);
  await negative.close();
 }
 assert.deepEqual(errors,[],'no production browser errors');
 assert.deepEqual(missing,[],'all image and script dependencies exist');
 fs.writeFileSync(output+'/report.json',JSON.stringify({
  result:'PASS',browser:'Chromium',physicalPhoneTested:false,
  previewOnly:true,normalAndroidPackageUnchanged:true,results},null,2)+'\n');
 console.log('M13_F_SOLO_TDM_COMPARATOR_BROWSER_PASS '+JSON.stringify({
  sizes:results.length,spectator:true,art:true,experimentalTargets:[15,40,10],
  savesUnchanged:true,normalGameUnaffected:true}));
}finally{await browser.close();await new Promise(done=>srv.close(done))}
