// Real Chromium Quick Play acceptance: original game code + test-only window hook.
// Unlike the static After Action layout fixture, completion comes from registerHit
// and the *actual* combat finalization, HUD and button listeners.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

const chrome=process.env.CHROME_BIN;
if(!chrome){console.log('SKIP live flow QA: CHROME_BIN not configured');process.exit(0);}
const root=process.cwd(),web=path.join(root,'web');
const game=fs.readFileSync(path.join(web,'game.js'),'utf8');
const closing=/\}\)\(\);\s*$/;
assert.ok(closing.test(game),'game source should close the expected IIFE');
const instrumented=game.replace(closing,`
// TEST-ONLY hook, injected into the HTTP-served JS, NOT committed to Android/web:
// changes nothing in the bundled game or player-facing features.
window.__flowQA={
 get state(){return state}, get mode(){return mode},
 get playlist(){return selectedPlaylistIds.slice()},
 freeze(){paused=true}, get aim(){return {...fireAim}}, get control(){return makeControl(true)}, registerHit, ejectPilot, refreshHUD, tryCqcRespawn, resetAll,
 expire(seconds=180){paused=false;step(seconds);paused=true;}
};
})();`);
assert.notEqual(instrumented,game,'QA hook injected into transient HTTP response');
const sources={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/game.js':'game.js','/scored-match.js':'scored-match.js'};
const server=http.createServer((req,res)=>{
 const name=sources[new URL(req.url,'http://localhost').pathname];
 if(!name){res.writeHead(404);res.end();return}
 const bytes=name==='game.js'?instrumented:fs.readFileSync(path.join(web,name));
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(bytes);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
let page=null;
const result={steps:[],viewport:'915x412'};
try{
 page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:1});
 page.on('pageerror',e=>{throw e});
 await page.goto(base,{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__flowQA);
 assert.equal(await page.locator('.home-screen').isVisible(),true,'real lobby displayed');
 result.steps.push('live game loaded in Chromium, no bundled source instrumentation');

 await page.locator('#menu button[data-action="settings"]').click();
 const advanced=page.locator('details.extra-rules');
 await advanced.locator('summary').click();
 const ffa=page.locator('input[data-playlist-mode="survival_ffa"]');
 const teams=page.locator('input[data-playlist-mode="survival_teams"]');
 await ffa.uncheck();await teams.uncheck();
 assert.equal(await page.locator('button[data-action="settings-play"]').isDisabled(),true,'zero-mode play disabled');
 const emptyPrefs=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')));
 assert.deepEqual(emptyPrefs.playlist.enabled,[],'empty selection persists in localStorage');
 await teams.check();
 assert.equal(await page.locator('button[data-action="settings-play"]').isDisabled(),false,'one selected mode starts a match');
 await ffa.check();
 await page.locator('#bot-count').selectOption('1');
 result.steps.push('zero-mode blocked; one/two selected modes enabled and persisted');

 await page.locator('button[data-action="settings-play"]').click();
 await page.waitForFunction(()=>!document.querySelector('#menu').classList.contains('hidden')===false);
 await page.evaluate(()=>window.__flowQA.freeze());
 const before=await page.evaluate(()=>({id:window.__flowQA.state.matchId,seed:window.__flowQA.state.mazeSeed,mode:window.__flowQA.state.config.matchModeId,human:window.__flowQA.state.humanCount,bots:window.__flowQA.state.config.botCount}));
 assert.equal(before.bots,before.mode==='survival_teams'?2:1,'one-bot Team Survival adds one ally without affecting FFA');
 assert.equal(before.human,1,'solo actual player');
 assert.ok(['survival_ffa','survival_teams'].includes(before.mode),'supported mode shown');
 assert.equal(await page.locator('#after-action').isVisible(),false,'no premature results');
 const victory=await page.evaluate(()=>{
  const qa=window.__flowQA,enemy=qa.state.tanks[1];qa.ejectPilot(1);enemy.shield=0;
  const hits=[qa.registerHit(0,1)];enemy.shield=0;hits.push(qa.registerHit(0,1));
  return {hits,state:{winner:qa.state.winner,ko:qa.state.kos[0],deaths:qa.state.deaths[0],final:qa.state.finalResult}};
 });
 assert.deepEqual(victory.hits,[true,true],'real two-hit pilot knockout');
 assert.equal(victory.state.final.outcome,'victory');
 assert.equal(victory.state.ko,2,'actual kill counter');
 assert.equal(victory.state.deaths,0);
 assert.equal(await page.locator('#after-action').isVisible(),true,'actual match result panel displayed');
 assert.equal((await page.locator('#aa-title').textContent()).trim(),'SECTOR CLEARED');
 assert.equal((await page.locator('#aa-kos').textContent()).trim(),'2');
 assert.equal((await page.locator('#aa-deaths').textContent()).trim(),'0');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 assert.equal(await page.locator('#quick-rematch').isVisible(),true,'NEXT MATCH playable');
 result.steps.push('real combat finalization -> HUD victory, KO/deaths and NEXT MATCH button');

 await page.locator('#quick-rematch').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const after=await page.evaluate(()=>({id:window.__flowQA.state.matchId,seed:window.__flowQA.state.mazeSeed,mode:window.__flowQA.state.config.matchModeId,bots:window.__flowQA.state.config.botCount,final:window.__flowQA.state.finalResult,ended:window.__flowQA.state.winner>=0}));
 assert.notEqual(after.id,before.id,'NEXT MATCH creates new match ID');
 assert.notEqual(after.seed,before.seed,'NEXT MATCH creates new procedural maze seed');
 assert.notEqual(after.mode,before.mode,'with both modes selected NEXT MATCH does not repeat');
 assert.equal(after.bots,after.mode==='survival_teams'?2:1,'NEXT MATCH recalculates bot count from user settings for each mode');
 assert.equal(after.final,null,'old result discarded only for next match');
 assert.equal(after.ended,false,'fresh match active');
 assert.equal(await page.locator('#after-action').isVisible(),false,'results close after new match');
 result.steps.push('NEXT MATCH changed seed, matchId, mode and cleared last After Action');

 const defeat=await page.evaluate(()=>{
  const qa=window.__flowQA,local=qa.state.tanks[0];qa.ejectPilot(0);local.shield=0;
  const hits=[qa.registerHit(1,0)];local.shield=0;hits.push(qa.registerHit(1,0));
  // In Team Survival the player can be eliminated while BLUE survives:
  // defeat is not final until the RED side also defeats the last BLUE bot.
  if(qa.state.config.matchModeId==='survival_teams'){
   const ally=qa.state.tanks[2];qa.ejectPilot(2);ally.shield=0;
   hits.push(qa.registerHit(1,2));ally.shield=0;hits.push(qa.registerHit(1,2));
  }
  return {hits,final:qa.state.finalResult};
 });
 assert.ok(defeat.hits.length>=2&&defeat.hits.every(Boolean),'each hit is a real combat event');
 assert.equal(defeat.final.outcome,'defeat');
 assert.equal(defeat.final.deaths,2);
 assert.equal(defeat.final.operatorKOs,0);
 assert.equal((await page.locator('#aa-title').textContent()).trim(),'SECTOR LOST');
 assert.equal((await page.locator('#aa-lives').textContent()).trim(),'0');
 assert.equal((await page.locator('#aa-deaths').textContent()).trim(),'2');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'DEFEAT');
 result.steps.push('actual loss screen preserves lives, deaths and defeat outcome');

 await page.locator('#results-menu').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true,'MAIN MENU returns to lobby');
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__flowQA);
 await page.locator('#menu button[data-action="settings"]').click();
 await page.locator('details.extra-rules summary').click();
 assert.equal(await ffa.isChecked(),true,'FFA choice persists across fresh browser instance');
 assert.equal(await teams.isChecked(),true,'Team choice persists across fresh browser instance');
 result.steps.push('MAIN MENU works and playlist choices persist across reload');
 // CQC is an explicitly separate score-tested playable mode; it MUST NOT
 // pollute the saved Survival Quick Play playlist or masquerade as Survival.
 await page.locator('button[data-action="settings-back"]').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true);
 await page.locator('button[data-action="cqc"]').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const pilotStart=await page.evaluate(()=>{const s=window.__flowQA.state;return {seed:s.mazeSeed,matchId:s.matchId,mode:s.config.matchModeId,vehicles:s.vehicles.length,bots:s.config.botCount,allFoot:s.tanks.every(t=>t.onFoot),clock:s.scored.clockSeconds}});
 assert.equal(pilotStart.mode,'cqc');
 assert.equal(pilotStart.vehicles,0);
 assert.equal(pilotStart.bots,3);
 assert.equal(pilotStart.allFoot,true);
 assert.equal(pilotStart.clock,180);
 assert.equal((await page.locator('#score-clock').textContent()).trim(),'03:00');
 assert.equal((await page.locator('#player0-label').textContent()).trim(),'YOU KOs');
 assert.equal((await page.locator('#interact-btn').isVisible()),false);
 assert.equal((await page.locator('#fire-mode').textContent()).trim(),'HOLD · DRAG TO AIM');
 const fireBox=await page.locator('.fire-btn').boundingBox();
 assert.ok(fireBox?.width>=35&&fireBox.height>=35,'right FIRE drag target has a mobile-sized hit area');
 const pressX=fireBox.x+fireBox.width/2,pressY=fireBox.y+fireBox.height/2;
 await page.mouse.move(pressX,pressY);await page.mouse.down();
 const untouched=await page.evaluate(()=>window.__flowQA.aim);
 assert.equal(untouched.active,false,'press and hold retains original fire action without instant swing');
 await page.mouse.move(pressX,pressY-32,{steps:3});
 const dragged=await page.evaluate(()=>({aim:window.__flowQA.aim,control:window.__flowQA.control}));
 assert.equal(dragged.aim.active,true,'actual captured right-button pointermove enables CQC aim');
 assert.ok(dragged.control.aimY<-.95,'independent right-thumb drag points the pistol up');
 assert.equal(dragged.control.fire,true,'right drag does not interrupt firing');
 await page.mouse.up();
 assert.equal((await page.evaluate(()=>window.__flowQA.aim)).active,false,'actual pointerup clears aim state');
 result.steps.push('real Chromium FIRE thumb drag independently aims while firing, with release reset');

 const earned=await page.evaluate(()=>{
  const qa=window.__flowQA,s=qa.state,hits=[];
  for(let n=0;n<10;n++){
   s.tanks[1].shield=0;
   hits.push(qa.registerHit(0,1));
   if(n<9){s.tanks[1].respawnWait=0;hits.push(qa.tryCqcRespawn(1));}
  }
  return {hits,result:s.finalResult,score:s.scored.operatorKOs[0],deaths:s.scored.deaths[1],vehicles:s.vehicles.length};
 });
 assert.ok(earned.hits.every(Boolean),'CQC pilot hits and actual safe respawns all valid');
 assert.equal(earned.result.outcome,'victory');
 assert.equal(earned.result.reason,'score_target');
 assert.equal(earned.score,10);
 assert.equal(earned.deaths,10);
 assert.equal(earned.vehicles,0);
 assert.equal((await page.locator('#aa-kos').textContent()).trim(),'10');
 assert.equal((await page.locator('#aa-lives-label').textContent()).trim(),'KO TARGET');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 result.steps.push('real CQC score-to-10: pilots-only, exact KO credit and safe respawns, truthful live result');
 await page.locator('#quick-rematch').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const another=await page.evaluate(()=>({seed:window.__flowQA.state.mazeSeed,matchId:window.__flowQA.state.matchId,mode:window.__flowQA.state.config.matchModeId,score:window.__flowQA.state.scored.operatorKOs[0]}));
 assert.equal(another.mode,'cqc','CQC next match remains pilot-only, not rotated to survival');
 assert.notEqual(another.seed,pilotStart.seed);
 assert.notEqual(another.matchId,pilotStart.matchId);
 assert.equal(another.score,0);
 const timed=await page.evaluate(()=>{const qa=window.__flowQA;qa.expire();return qa.state.finalResult});
 assert.equal(timed.outcome,'draw','real 3-minute time expiration results in a draw when no KOs');
 assert.equal(timed.reason,'time_limit');
 assert.equal((await page.locator('#aa-title').textContent()).trim(),'MATCH DRAW');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'DRAW');
 result.steps.push('CQC NEXT MATCH fresh maze and score reset; actual game-clock expiration produced DRAW');
 // True scored vehicle FFA must never credit armor damage or ejection.
 await page.locator('#results-menu').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true);
 await page.locator('button[data-action="scored_ffa"]').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const ffaStart=await page.evaluate(()=>{const s=window.__flowQA.state;return {mode:s.config.matchModeId,seed:s.mazeSeed,matchId:s.matchId,bots:s.config.botCount,vehicles:s.vehicles.length,inTanks:s.tanks.every(t=>!t.onFoot),limit:s.scored.scoreTarget,clock:s.scored.clockSeconds,hasMech:s.vehicles.some(v=>v.type==='mech')}});
 assert.equal(ffaStart.mode,'scored_ffa');
 assert.equal(ffaStart.bots,3);
 assert.equal(ffaStart.inTanks,true);
 assert.ok(ffaStart.vehicles>=5);
 assert.equal(ffaStart.hasMech,true);
 assert.equal(ffaStart.limit,10);
 assert.equal(ffaStart.clock,240);
 assert.equal((await page.locator('#mode-label').textContent()).trim(),'SCORED FREE-FOR-ALL');
 assert.equal((await page.locator('#score-clock').textContent()).trim(),'04:00');
 assert.equal(await page.locator('#vehicle-aim').isVisible(),true,'scored vehicle shows deliberate AIM button');
 const aimBounds=await page.locator('#vehicle-aim').boundingBox();
 assert.ok(aimBounds?.width>=70&&aimBounds?.height>=32,'mobile vehicle AIM touch pad is reachable');
 const aimX=aimBounds.x+aimBounds.width/2,aimY=aimBounds.y+aimBounds.height/2;
 const initialBullets=await page.evaluate(()=>window.__flowQA.state.bullets.length);
 await page.mouse.move(aimX,aimY);await page.mouse.down();
 const restingAim=await page.evaluate(()=>window.__flowQA.aim);
 assert.equal(restingAim.source,'aim');
 assert.equal(restingAim.active,false,'tap jitter never rotates a tank');
 await page.mouse.move(aimX,aimY-34,{steps:3});
 const activeAim=await page.evaluate(()=>({aim:window.__flowQA.aim,control:window.__flowQA.control,bullets:window.__flowQA.state.bullets.length}));
 assert.equal(activeAim.aim.source,'aim');
 assert.equal(activeAim.aim.active,true,'real AIM pad capture receives pointermove');
 assert.ok(activeAim.control.aimY<-.95,'AIM points vehicle upward');
 assert.equal(activeAim.control.fire,false,'independent vehicle AIM must never press FIRE');
 assert.equal(activeAim.bullets,initialBullets,'AIM never consumes scarce projectiles');
 await page.mouse.up();
 assert.equal((await page.evaluate(()=>window.__flowQA.aim)).active,false,'AIM pointer release resets control');
 assert.equal((await page.evaluate(()=>window.__flowQA.aim)).source,null);
 result.steps.push('real scored FFA vehicle AIM pad touch drag: rotation vector without moving, shooting or losing shells');

 const vehicleProof=await page.evaluate(()=>{
  const qa=window.__flowQA,s=qa.state,t=s.tanks[1],v=s.vehicles[t.vehicleId],before=v.armor,hits=[];
  for(let i=0;i<before;i++)hits.push(qa.registerHit(0,1));
  return {hits,armor:v.armor,ejected:t.onFoot,lives:s.lives[1],kos:s.scored.operatorKOs[0],deaths:s.scored.deaths[1],shield:t.shield};
 });
 assert.ok(vehicleProof.hits.every(Boolean));
 assert.equal(vehicleProof.armor,0);
 assert.equal(vehicleProof.ejected,true);
 assert.equal(vehicleProof.lives,1);
 assert.equal(vehicleProof.kos,0,'armor and ejection are never operator KO');
 assert.equal(vehicleProof.deaths,0);
 assert.ok(vehicleProof.shield>0);
 const ffaResult=await page.evaluate(()=>{
  const qa=window.__flowQA,s=qa.state,t=s.tanks[1],hits=[];
  t.shield=0;
  for(let i=0;i<10;i++){
   hits.push(qa.registerHit(0,1));
   if(i<9){t.respawnWait=0;hits.push(qa.tryCqcRespawn(1));t.shield=0;}
  }
  return {hits,result:s.finalResult,score:s.scored.operatorKOs[0],vehicleCount:s.vehicles.length};
 });
 assert.ok(ffaResult.hits.every(Boolean),'shared live FFA scoring and respawns valid');
 assert.equal(ffaResult.result.matchModeId,'scored_ffa');
 assert.equal(ffaResult.result.outcome,'victory');
 assert.equal(ffaResult.result.reason,'score_target');
 assert.equal(ffaResult.score,10);
 assert.ok(ffaResult.vehicleCount>0);
 assert.equal((await page.locator('#aa-mode-label').textContent()).trim(),'SCORED FREE-FOR-ALL');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 result.steps.push('real scored vehicle FFA: armor/ejection not KO, actual pilot death to 10, honest winner');
 await page.locator('#quick-rematch').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const ffaRestart=await page.evaluate(()=>({seed:window.__flowQA.state.mazeSeed,matchId:window.__flowQA.state.matchId,mode:window.__flowQA.state.config.matchModeId,score:window.__flowQA.state.scored.operatorKOs[0],vehicles:window.__flowQA.state.vehicles.length}));
 assert.equal(ffaRestart.mode,'scored_ffa');
 assert.notEqual(ffaRestart.seed,ffaStart.seed);
 assert.notEqual(ffaRestart.matchId,ffaStart.matchId);
 assert.equal(ffaRestart.score,0);
 assert.ok(ffaRestart.vehicles>0);
 const ffaTimeout=await page.evaluate(()=>{window.__flowQA.expire(240);return window.__flowQA.state.finalResult});
 assert.equal(ffaTimeout.outcome,'draw');
 assert.equal(ffaTimeout.reason,'time_limit');
 assert.equal((await page.locator('#aa-title').textContent()).trim(),'MATCH DRAW');
 result.steps.push('real 4-minute scored FFA time draw, fresh procedural rematch and score reset');


 console.log('PASS live Chromium Quick Play: '+JSON.stringify(result));
}finally{
 if(page)await page.close().catch(()=>{});
 await browser.close();
 await new Promise(r=>server.close(r));
}
