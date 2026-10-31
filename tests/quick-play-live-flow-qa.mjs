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
 get playlist(){return selectedPlaylistIds.slice()}, unlocksFromResult,
 freeze(){paused=true}, get aim(){return {...fireAim}}, get control(){return makeControl(true)}, registerHit, ejectPilot, refreshHUD, tryCqcRespawn, resetAll,
 expire(seconds=180){paused=false;step(seconds);paused=true;}
};
})();`);
assert.notEqual(instrumented,game,'QA hook injected into transient HTTP response');
const sources={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/game.js':'game.js','/scored-match.js':'scored-match.js','/dossier.js':'dossier.js','/save-backup.js':'save-backup.js'};
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
 assert.equal(await page.locator('#menu .home-action-grid button').count(),3,'home has only three secondary game choices');
 assert.equal(await page.locator('#menu .home-action-grid button[data-action="cqc"]').count(),0,'specialist modes are organized off the home screen');
 await page.locator('#menu button[data-action="modes"]').click();
 assert.equal(await page.locator('.mode-grid button').count(),4,'all original specialist modes remain accessible');
 await page.locator('#menu button[data-action="modes-back"]').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true,'mode select back returns to the home screen');
 result.steps.push('live game loaded in Chromium, no bundled source instrumentation');

 // Phase 4A actual browser acceptance: paint must select/persist and the
 // Hangar must remain reachable at compact Android landscape dimensions.
 await page.locator('#menu button[data-action="hangar"]').click();
 assert.equal(await page.locator('.hangar-screen').isVisible(),true,'actual Hangar opens from game lobby');
 assert.equal(await page.locator('#hangar-paints').isVisible(),true,'paint category opens immediately');
 assert.equal(await page.locator('#hangar-insignia').isVisible(),false,'unselected insignia category does not lengthen the page');
 assert.equal((await page.locator('button[data-action="hangar-back"]').count()),1,'always visible header Back, no extra bottom scroll');
 assert.equal((await page.locator('button[data-hangar-tab]').count()),2,'paint and insignia have direct one-tap tabs');
 assert.equal(await page.locator('.hangar-grid button[data-paint-id]').count(),6,'four free and two earned finishes in Hangar');
 assert.equal(await page.locator('button[data-paint-id="fieldgrid.vanguard"]').isDisabled(),true,'five-match reward locked before play');
 assert.equal(await page.locator('button[data-paint-id="fieldgrid.veteran"]').isDisabled(),true,'twelve-win reward locked before play');
 assert.equal(await page.locator('.emblem-grid button[data-emblem-id]').count(),4,'one free and three earned operator emblems');
 assert.equal(await page.locator('button[data-emblem-id="mark.field"]').isDisabled(),false);
 assert.equal(await page.locator('button[data-emblem-id="mark.vector"]').isDisabled(),true,'VECTOR locked until three Solo matches');
 assert.equal(await page.locator('button[data-emblem-id="mark.ace"]').isDisabled(),true,'ACE locked until ten recorded KOs');
 assert.equal(await page.locator('button[data-emblem-id="mark.command"]').isDisabled(),true,'COMMAND locked until twelve wins');
 assert.ok((await page.locator('#emblem-status').textContent()).includes('FIELD'));
 await page.locator('button[data-hangar-tab="insignia"]').click();
 assert.equal(await page.locator('#hangar-insignia').isVisible(),true,'insignia reached with one tap');
 assert.equal(await page.locator('#hangar-paints').isVisible(),false,'paint hidden while customizing insignia');
 assert.equal(await page.locator('button[data-hangar-tab="insignia"]').getAttribute('aria-selected'),'true');
 await page.locator('button[data-hangar-tab="paint"]').focus();
 await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('#hangar-insignia').isVisible(),true,'keyboard arrow navigation stays in the insignia category');
 await page.keyboard.press('Home');
 assert.equal(await page.locator('#hangar-paints').isVisible(),true,'Home key moves focus to paint');
 assert.equal((await page.locator('button[data-paint-id="fieldgrid.vanguard"] small').textContent()).trim(),'0 / 5 MATCHES');
 await page.locator('button[data-paint-id="fieldgrid.moss"]').click();
 const equipped=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-hangar-paint-v1')));
 assert.deepEqual(equipped,{version:1,equipped:'fieldgrid.moss'},'actual UI saves selected Moss paint');
 assert.equal(await page.locator('button[data-paint-id="fieldgrid.moss"]').getAttribute('aria-pressed'),'true','selected paint accessible');
 for(const [vw,vh] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width:vw,height:vh});
  const layout=await page.evaluate(()=>{
   const p=document.querySelector('#panel').getBoundingClientRect(), buttons=[...document.querySelectorAll('.hangar-grid button')].map(e=>e.getBoundingClientRect());
   return {panel:{x:p.x,right:p.right,y:p.y,bottom:p.bottom},swatches:buttons.map(x=>({x:x.x,right:x.right,width:x.width,height:x.height}))};
  });
  assert.ok(layout.panel.x>=0&&layout.panel.right<=vw+1,'Hangar stays within landscape width '+vw);
  assert.ok(layout.swatches.every(b=>b.width>=45&&b.height>=70&&b.x>=0&&b.right<=vw+1),'paint swatches reachable and sized '+vw);
 }
 await page.setViewportSize({width:915,height:412});
 await page.locator('#menu button[data-action="hangar-back"]').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true,'Hangar back returns to lobby');
 assert.equal((await page.evaluate(()=>localStorage.getItem('rr-hangar-paint-v1'))),JSON.stringify({version:1,equipped:'fieldgrid.moss'}),'back navigation does not reset equipped paint');
 result.steps.push('Hangar four free paint selectors: real click, saved equip, responsive landscape, safe return');

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
 assert.equal(await page.locator('#custom-edit').isVisible(),false,'ordinary Survival win must not show EDIT RULES');
 assert.equal((await page.locator('#aa-kos').textContent()).trim(),'2');
 assert.equal((await page.locator('#aa-deaths').textContent()).trim(),'0');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 assert.equal(await page.locator('#aa-rewards').isVisible(),false,'first Solo match has no unlock');
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
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('#menu button[data-action="cqc"]').click();
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
 assert.equal(await page.locator('#custom-edit').isVisible(),false,'pilot-only CQC must not show EDIT RULES');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 const earnedNow=(await page.locator('#aa-rewards').textContent()).trim();
 assert.equal(await page.locator('#aa-rewards').isVisible(),true,'third saved Solo match should show new progress');
 assert.ok(earnedNow.includes('VECTOR INSIGNIA')&&earnedNow.includes('ACE INSIGNIA'),'real 3-match and 10-KO thresholds crossed in CQC');
 assert.deepEqual(await page.evaluate(()=>window.__flowQA.unlocksFromResult({matches:12,wins:11,kos:40},{matches:13,wins:12,kos:40})),['VETERAN PAINT','◆ COMMAND INSIGNIA'],'real 12th victory edge case');
 assert.deepEqual(await page.evaluate(()=>window.__flowQA.unlocksFromResult({matches:13,wins:12,kos:40},{matches:14,wins:13,kos:40})),[],'do not repeat already-earned rewards');
 result.steps.push('actual CQC 3-match VECTOR and 10-KO ACE unlock; verified 12th-win Veteran and Command thresholds');
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
 assert.equal(await page.locator('#aa-rewards').isVisible(),false,'no new threshold means no reward notice');
 result.steps.push('CQC NEXT MATCH fresh maze and score reset; actual game-clock expiration produced DRAW');
 // True scored vehicle FFA must never credit armor damage or ejection.
 await page.locator('#results-menu').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true);
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('#menu button[data-action="scored_ffa"]').click();
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
 assert.equal(await page.locator('#vehicle-aim').count(),0,'scored vehicles no longer show separate AIM pad');
 // The simpler two-thumb layout must fit three landscape screen sizes.
 for(const [vw,vh] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width:vw,height:vh});
  const layout=await page.evaluate(()=>{
   const bounds=id=>{const b=document.querySelector(id)?.getBoundingClientRect();return b?{x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}:null};
   return {fire:bounds('.fire-btn'),joy:bounds('#joystick'),hud:bounds('#menu-button')};
  });
  assert.ok(layout.fire?.width>=64&&layout.fire.height>=64,'FIRE target sized for thumb '+vw);
  assert.ok(layout.joy?.width>=64&&layout.joy.height>=64,'MOVE joystick sized for thumb '+vw);
  assert.ok(layout.joy.right+35<layout.fire.x,'MOVE and FIRE remain separate thumb zones '+vw);
  assert.ok(layout.fire.bottom<=vh-2,'FIRE within bottom viewport safe boundary '+vw);
  assert.ok(layout.fire.y>layout.hud.bottom+12,'no FIRE/menu overlap '+vw);
 }
 await page.setViewportSize({width:915,height:412});
 const stickBox=await page.locator('#joystick').boundingBox();
 assert.ok(stickBox?.width>=64&&stickBox?.height>=64,'real MOVE joystick has a thumb-sized hit area');
 const sx=stickBox.x+stickBox.width/2,sy=stickBox.y+stickBox.height/2;
 const beforeShells=await page.evaluate(()=>window.__flowQA.state.bullets.length);
 await page.mouse.move(sx,sy);await page.mouse.down();
 await page.mouse.move(sx,sy-35,{steps:3});
 const joystickInput=await page.evaluate(()=>window.__flowQA.control);
 assert.ok(joystickInput.moveY<-.6,'real MOVE stick points the scored tank');
 assert.equal(joystickInput.fire,false,'joystick alone cannot fire');
 assert.equal(joystickInput.aimX,undefined,'no independent vehicle AIM vector emitted');
 assert.equal(await page.evaluate(()=>window.__flowQA.state.bullets.length),beforeShells,'steering cannot spend shells');
 await page.mouse.up();
 const neutralInput=await page.evaluate(()=>window.__flowQA.control);
 assert.ok(Math.abs(neutralInput.moveY)<.01,'joystick release returns to neutral');
 result.steps.push('scored FFA: real pointer steering with left MOVE and independent FIRE; no AIM pad, three phone layouts');

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
 assert.equal(await page.locator('#custom-edit').isVisible(),false,'ordinary scored FFA must not show EDIT RULES');
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 assert.ok((await page.locator('#aa-rewards').textContent()).includes('VANGUARD PAINT'),'fifth completed saved Solo match earns Vanguard notice');
 assert.equal((await page.locator('#aa-rewards').textContent()).includes('ACE'),false,'old badges are not re-announced');
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


 // New v0.9.34 real Chromium scored 2v2 Team Deathmatch audit.
 await page.locator('#results-menu').click();
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('#menu button[data-action="scored_tdm"]').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const tdmStart=await page.evaluate(()=>{const s=window.__flowQA.state;return {mode:s.config.matchModeId,teams:[...s.scored.teamIds],target:s.scored.scoreTarget,clock:s.scored.clockSeconds,seed:s.mazeSeed};});
 assert.equal(tdmStart.mode,'scored_tdm');
 assert.deepEqual(tdmStart.teams,[0,1,0,1]);
 assert.equal(tdmStart.target,15);assert.equal(tdmStart.clock,300);
 assert.equal((await page.locator('#player0-label').textContent()).trim(),'BLUE');
 assert.equal((await page.locator('#player1-label').textContent()).trim(),'RED');
 assert.equal(await page.locator('#vehicle-aim').count(),0,'scored TDM also uses two-control layout');
 const tdmResult=await page.evaluate(()=>{
  const qa=window.__flowQA,s=qa.state,enemy=s.tanks[1],v=s.vehicles[enemy.vehicleId],hits=[];
  const friendly=qa.registerHit(0,2);
  const armor=v.armor;for(let i=0;i<armor;i++)hits.push(qa.registerHit(0,1));
  const pointsAfterArmor=s.scored.operatorKOs[0];enemy.shield=0;hits.push(qa.registerHit(0,1));
  enemy.respawnWait=0;hits.push(qa.tryCqcRespawn(1));enemy.shield=0;
  hits.push(qa.registerHit(2,1));const allyPoints=s.scored.operatorKOs[2];
  for(let i=2;i<15;i++){enemy.respawnWait=0;hits.push(qa.tryCqcRespawn(1));enemy.shield=0;hits.push(qa.registerHit(i%2===0?0:2,1));}
  return {friendly,hits,pointsAfterArmor,allyPoints,result:s.finalResult};
 });
 assert.equal(tdmResult.friendly,false);
 assert.ok(tdmResult.hits.every(Boolean),'TDM actual operator events and safe spawn');
 assert.equal(tdmResult.pointsAfterArmor,0);
 assert.equal(tdmResult.allyPoints,1);
 assert.equal(tdmResult.result.outcome,'victory');
 assert.equal(tdmResult.result.teamMode,'teams');
 assert.deepEqual([...tdmResult.result.scoreboard],[15,0]);
 assert.equal((await page.locator('#aa-lives-label').textContent()).trim(),'TEAM KO TARGET');
 assert.equal((await page.locator('#aa-mode-label').textContent()).trim(),'TEAM DEATHMATCH');
 result.steps.push('true live Chromium TDM: Blue ally+Red opponents, armor not KO, 15 shared KOs and truthful team victory');
 await page.locator('#quick-rematch').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const tdmNext=await page.evaluate(()=>({mode:window.__flowQA.state.config.matchModeId,seed:window.__flowQA.state.mazeSeed}));
 assert.equal(tdmNext.mode,'scored_tdm');assert.notEqual(tdmNext.seed,tdmStart.seed);
 const tdmDraw=await page.evaluate(()=>{window.__flowQA.expire(300);return window.__flowQA.state.finalResult;});
 assert.equal(tdmDraw.outcome,'draw');
 assert.equal(tdmDraw.winnerTeam,-1);
 result.steps.push('TDM NEXT MATCH regenerated sector, retained mode and respected score-clock draw');
 
 // v0.9.35: real Custom Match browser journey and independent Quick Play storage.
 await page.locator('#results-menu').click();
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('#menu button[data-action="custom"]').click();
 assert.equal(await page.locator('#custom-match').isVisible(),true);
 // Save -> collision protection -> reset -> reload -> load -> two-stage delete.
 const quickBeforePresets=await page.evaluate(()=>localStorage.getItem('rr-options-v06'));
 await page.locator('.custom-preset-fold summary').click();
 await page.locator('#custom-mode').selectOption('survival_teams');
 await page.locator('#custom-size').selectOption('large');
 await page.locator('#custom-bots').selectOption('3');
 await page.locator('#custom-preset-name').fill('Maze Duel');
 await page.locator('button[data-action="custom-preset-save"]').click();
 assert.ok((await page.locator('#custom-preset-status').textContent()).includes('SAVED · Maze Duel'));
 assert.equal(await page.locator('#custom-preset-select').inputValue(),'Maze Duel');
 const savedFirst=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-custom-presets-v1')));
 assert.equal(savedFirst.version,1);assert.equal(savedFirst.entries.length,1);
 await page.locator('#custom-preset-name').fill('maze duel');
 await page.locator('button[data-action="custom-preset-save"]').click();
 assert.ok((await page.locator('#custom-preset-status').textContent()).includes('ALREADY SAVED'));
 await page.locator('#custom-reset').click();
 assert.equal(await page.locator('#custom-mode').inputValue(),'survival_ffa','reset returns to real default');
 assert.equal(await page.locator('#custom-size').inputValue(),'standard');
 assert.ok((await page.locator('#custom-preset-count').textContent()).includes('1/5'),'reset keeps presets');
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__flowQA);
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('#menu button[data-action="custom"]').click();
 await page.locator('.custom-preset-fold summary').click();
 assert.equal(await page.locator('#custom-preset-select option').count(),2,'preset persists across browser reload');
 await page.locator('#custom-preset-select').selectOption('Maze Duel');
 await page.locator('#custom-preset-load').click();
 assert.equal(await page.locator('#custom-mode').inputValue(),'survival_teams');
 assert.equal(await page.locator('#custom-size').inputValue(),'large');
 assert.equal(await page.locator('#custom-bots').inputValue(),'3');
 await page.locator('#custom-preset-delete').click();
 assert.ok((await page.locator('#custom-preset-status').textContent()).includes('DELETE AGAIN'));
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-custom-presets-v1')))).entries.length,1,'first delete never erases');
 await page.locator('#custom-preset-delete').click();
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-custom-presets-v1')))).entries.length,0,'second delete persists');
 assert.equal(await page.locator('#custom-preset-load').isDisabled(),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-options-v06')),quickBeforePresets,'preset actions leave Quick Play untouched');
 result.steps.push('local preset named Save, duplicate guard, Reset to Default, reload persistence, Load, confirmed Delete and independent Quick Play');
 await page.locator('#custom-mode').selectOption('survival_teams');
 await page.locator('#custom-size').selectOption('large');
 await page.locator('#custom-bots').selectOption('1');
 await page.locator('#custom-skill').selectOption('spicy');
 await page.locator('#custom-lives').selectOption('3');
 await page.locator('#custom-shells').selectOption('1');
 assert.ok((await page.locator('#custom-preview').textContent()).includes('3 COMBATANTS'));
 const customSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-custom-v1')));
 assert.equal(customSaved.version,1);
 assert.equal(customSaved.rules.modeId,'survival_teams');
 assert.equal(customSaved.rules.botCount,1);
 await page.locator('button[data-action="custom-play"]').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const customStart=await page.evaluate(()=>{const s=window.__flowQA.state;return {id:s.config.matchModeId,size:s.config.mapSize,bots:s.config.botCount,lives:s.config.startLives,shell:s.config.bulletCap,seed:s.mazeSeed,custom:s.config.customMatch}});
 assert.equal(customStart.custom,true);
 assert.equal(customStart.id,'survival_teams');
 assert.equal(customStart.size,'large');assert.equal(customStart.bots,2);
 assert.equal(customStart.lives,3);assert.equal(customStart.shell,1);
 const endCustom=()=>page.evaluate(()=>{const q=window.__flowQA,s=q.state,t=s.tanks[1];q.ejectPilot(1);t.shield=0;const hits=[];for(let i=0;i<3;i++){hits.push(q.registerHit(0,1));t.shield=0;}return {hits,result:s.finalResult}});
 const customWin=await endCustom();
 assert.ok(customWin.hits.every(Boolean));assert.equal(customWin.result.outcome,'victory');
 assert.equal(await page.locator('#custom-edit').isVisible(),true);
 assert.ok((await page.locator('#quick-rematch').textContent()).includes('SAME RULES'));
 await page.locator('#quick-rematch').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const customNext=await page.evaluate(()=>({id:window.__flowQA.state.config.matchModeId,seed:window.__flowQA.state.mazeSeed,shell:window.__flowQA.state.config.bulletCap}));
 assert.equal(customNext.id,'survival_teams');assert.equal(customNext.shell,1);
 assert.notEqual(customNext.seed,customStart.seed);
 assert.equal((await endCustom()).result.outcome,'victory');
 await page.locator('#custom-edit').click();
 assert.equal(await page.locator('#custom-match').isVisible(),true);
 assert.equal(await page.locator('#custom-size').inputValue(),'large');
 await page.locator('#custom-mode').selectOption('scored_tdm');
 assert.equal(await page.locator('#custom-size').isDisabled(),true);
 assert.equal(await page.locator('#custom-bots').isDisabled(),true);
 assert.equal(await page.locator('#custom-size').inputValue(),'standard','scored preset shows actual enforced map');
 assert.equal(await page.locator('#custom-bots').inputValue(),'3','scored preset shows actual enforced bot count');
 assert.equal(await page.locator('#custom-lives').inputValue(),'2');
 assert.equal(await page.locator('#custom-shells').inputValue(),'4');
 for(const [vw,vh] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width:vw,height:vh});
  const geometry=await page.locator('#panel').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
  assert.ok(geometry.scrollWidth<=geometry.width+3,'Custom editor must not scroll horizontally at '+vw);
  await page.locator('button[data-action="custom-play"]').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('button[data-action="custom-play"]').isVisible(),true,'Custom deploy remains reachable at '+vw);
 }
 await page.setViewportSize({width:915,height:412});
 assert.ok((await page.locator('#custom-preview').textContent()).includes('SCORE 15 KOs / 5 MIN'));
 await page.locator('button[data-action="custom-play"]').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const customTdm=await page.evaluate(()=>({config:window.__flowQA.state.config,mode:window.__flowQA.state.scored.mode,target:window.__flowQA.state.scored.scoreTarget}));
 assert.equal(customTdm.config.customMatch,true);assert.equal(customTdm.config.mapSize,'standard');
 assert.equal(customTdm.mode,'teams');assert.equal(customTdm.target,15);
 result.steps.push('real Custom Match editor, saved separate rules, team victory, same-rule new sector, edit rules and locked scored TDM');

 // v0.9.37: Browser actually opts into scored modes without disturbing Survival defaults.
 // Finish Custom TDM first, because the main-menu button belongs to its After Action.
 const customFinished=await page.evaluate(()=>{window.__flowQA.expire(300);return window.__flowQA.state.finalResult;});
 assert.ok(customFinished&&customFinished.reason==='time_limit');
 await page.locator('#results-menu').click();
 await page.locator('#menu button[data-action="settings"]').click();
 await page.locator('details.extra-rules summary').click();
 for(const id of ['cqc','scored_ffa','scored_tdm']){
  assert.equal(await page.locator('input[data-playlist-mode="'+id+'"]').isChecked(),false,'scored '+id+' stays OFF by default');
 }
 for(const id of ['survival_ffa','survival_teams'])await page.locator('input[data-playlist-mode="'+id+'"]').uncheck();
 for(const id of ['cqc','scored_ffa','scored_tdm'])await page.locator('input[data-playlist-mode="'+id+'"]').check();
 const opted=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).playlist);
 assert.deepEqual(opted.enabled,['cqc','scored_ffa','scored_tdm'],'user-scored opt-in persists in versioned existing options');
 assert.equal(opted.version,1,'older playlist save schema remains recognized');
 assert.ok((await page.locator('#playlist-status').textContent()).includes('3 SCORING TRIALS ENABLED'));
 await page.locator('button[data-action="settings-play"]').click();
 const roundModes=[];
 for(let i=0;i<3;i++){
  await page.evaluate(()=>window.__flowQA.freeze());
  const battle=await page.evaluate(()=>{const m=window.__flowQA.state;return {id:m.config.matchModeId,fromQuick:!!m.config.quickPlayMatch,custom:!!m.config.customMatch,
   goal:m.scored?.scoreTarget,clock:m.scored?.clockSeconds,team:m.scored?.mode,seed:m.mazeSeed,matchId:m.matchId,bots:m.config.botCount}});
  assert.ok(['cqc','scored_ffa','scored_tdm'].includes(battle.id));
  assert.ok(battle.fromQuick&&!battle.custom,'scored round records Quick Play rather than Custom');
  assert.equal(battle.goal,battle.id==='scored_tdm'?15:10);
  assert.equal(battle.clock,battle.id==='cqc'?180:battle.id==='scored_tdm'?300:240);
  assert.equal(battle.bots,3);
  roundModes.push(battle.id);
  const ending=await page.evaluate(()=>{window.__flowQA.expire(300);return window.__flowQA.state.finalResult;});
  assert.equal(ending.reason,'time_limit','actual scored match terminates by clock');
  assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'DRAW');
  if(i<2)await page.locator('#quick-rematch').click();
 }
 assert.equal(new Set(roundModes).size,3,'3 scored choices appear once each before bag repeats');
 await page.locator('#results-menu').click();
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('#menu button[data-action="cqc"]').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 const standalone=await page.evaluate(()=>window.__flowQA.state.config);
 assert.equal(standalone.matchModeId,'cqc');
 assert.equal(standalone.quickPlayMatch,undefined,'standalone test button is NOT a playlist round');
 const directDraw=await page.evaluate(()=>{window.__flowQA.expire(180);return window.__flowQA.state.finalResult;});
 assert.equal(directDraw.outcome,'draw');
 await page.locator('#quick-rematch').click();
 await page.evaluate(()=>window.__flowQA.freeze());
 assert.equal(await page.evaluate(()=>window.__flowQA.state.config.matchModeId),'cqc','standalone button rematches CQC without rotating');
 result.steps.push('opt-in scored Quick Play: original defaults off, settings persistence, CQC/FFA/TDM shuffle+timeouts, standalone remains fixed');

 // v0.9.39: Only finalized local bot matches enter the actual dossier.
 const beforeDossier=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-dossier-v1')));
 assert.ok(beforeDossier?.matches>=4,'prior real scored/Custom matches must be recorded');
 const beforeCount=beforeDossier.matches;
 const endForDossier=await page.evaluate(()=>{window.__flowQA.expire(180);return window.__flowQA.state.finalResult;});
 assert.ok(endForDossier&&endForDossier.outcome==='draw');
 const afterDossier=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-dossier-v1')));
 assert.equal(afterDossier.matches,beforeCount+1,'one actual finished match gets one service record');
 assert.equal(afterDossier.draws,beforeDossier.draws+1);
 await page.evaluate(()=>window.__flowQA.refreshHUD());
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-dossier-v1')).matches),beforeCount+1,'repeated HUD does not duplicate dossier');
 await page.locator('#results-menu').click();
 for(const [vw,vh] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width:vw,height:vh});
  await page.locator('#menu button[data-action="dossier"]').click();
  assert.equal(await page.locator('.dossier-screen').isVisible(),true);
  assert.equal(await page.locator('#dossier-matches').textContent(),String(afterDossier.matches));
  assert.equal(await page.locator('#dossier-draws').textContent(),String(afterDossier.draws));
  assert.equal(await page.locator('#dossier-eligibility').count(),0,'nonfunctional future milestones are no longer shown next to real Dossier rewards');
   assert.equal(await page.locator('#dossier-emblem-mark').textContent(),'◇','default identity visible in Dossier');
  const geometry=await page.locator('#panel').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}));
  assert.ok(geometry.scrollWidth<=geometry.width+3,'dossier has no horizontal overflow at '+vw);
  const back=await page.locator('button[data-action="dossier-back"]').boundingBox();
  assert.ok(back&&back.y>=-1&&back.y+back.height<=vh+1,'Dossier Back is immediately visible without scroll at '+vw);
  await page.locator('button[data-action="dossier-back"]').click();
 }
 await page.setViewportSize({width:915,height:412});
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__flowQA);
 await page.locator('#menu button[data-action="dossier"]').click();
 assert.equal(await page.locator('#dossier-matches').textContent(),String(afterDossier.matches),'record survives full app reload');
 assert.ok((await page.locator('#dossier-save-status').textContent()).includes('READY'));
 // The real finalized match record earns VECTOR, which remains available after reload.
 assert.ok(afterDossier.matches>=3,'real completed Solo matches reached VECTOR threshold');
 await page.locator('button[data-action="hangar"]').click();
 assert.equal(await page.locator('button[data-action="hangar-back"]').getAttribute('aria-label'),'Back to Dossier','Hangar knows where player entered');
 await page.locator('button[data-hangar-tab="insignia"]').click();
 assert.equal(await page.locator('button[data-emblem-id="mark.vector"]').isDisabled(),false,'stored Dossier automatically unlocks VECTOR');
 await page.locator('button[data-emblem-id="mark.vector"]').click();
 assert.equal(await page.locator('button[data-emblem-id="mark.vector"]').getAttribute('aria-pressed'),'true');
 const operatorChoice=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-hangar-paint-v1')));
 assert.equal(operatorChoice.emblem,'mark.vector','operator insignia saved alongside existing paint');
 assert.equal(operatorChoice.equipped,'fieldgrid.moss','selecting emblem keeps previous tank paint');
 await page.locator('button[data-action="hangar-back"]').click();
 assert.equal(await page.locator('.dossier-screen').isVisible(),true,'Hangar Back returns to originating Dossier, no home-menu detour');
 assert.equal(await page.locator('#dossier-emblem-mark').textContent(),'△','Dossier shows equipped VECTOR');
 assert.equal(await page.locator('#dossier-emblem-name').textContent(),'VECTOR');
 result.steps.push('completed Solo match -> saved Dossier -> earned insignia -> persistent Hangar equip -> Dossier identity');

 // v0.9.40: actual user-controlled export + preview + confirmed restore.
 await page.locator('button[data-action="backup"]').click();
 assert.equal(await page.locator('.backup-screen').isVisible(),true);
 await page.locator('button[data-action="backup-export"]').click();
 const saveText=await page.locator('#backup-output').inputValue();
 const parsedSave=JSON.parse(saveText);
 assert.equal(parsedSave.format,'sector-rebound-local-v1');
 assert.deepEqual(Object.keys(parsedSave.entries).sort(),['rr-custom-presets-v1','rr-custom-v1','rr-dossier-v1','rr-hangar-paint-v1','rr-options-v06']);
 for(const [vw,vh] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width:vw,height:vh});
  const geom=await page.locator('#panel').evaluate(el=>({w:el.clientWidth,sw:el.scrollWidth}));
  assert.ok(geom.sw<=geom.w+3,'backup menu no horizontal overflow at '+vw);
  await page.locator('button[data-action="backup-preview"]').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('button[data-action="backup-preview"]').isVisible(),true);
 }
 await page.setViewportSize({width:915,height:412});
 await page.evaluate(()=>localStorage.setItem('rr-custom-presets-v1',JSON.stringify({version:1,entries:[{name:'Temporary',rules:{modeId:'survival_ffa'}}]})));
 await page.locator('#backup-import').fill('this is a long malformed JSON string, not an object');
 await page.locator('button[data-action="backup-preview"]').click();
 assert.equal(await page.locator('#backup-restore').isDisabled(),true);
 assert.ok((await page.locator('#backup-message').textContent()).includes('NOT VALID JSON'));
 await page.locator('#backup-import').fill(saveText);
 await page.locator('button[data-action="backup-preview"]').click();
 assert.equal(await page.locator('#backup-restore').isDisabled(),false,'only valid preview can enable destructive action');
 assert.ok((await page.locator('#backup-message').textContent()).includes('EXISTING WILL BE REPLACED'));
 await page.locator('#backup-restore').click();
 await page.waitForFunction(()=>!!document.querySelector('#menu button[data-action="dossier"]')&&!!window.__flowQA,{timeout:20000});
 const recovered=await page.evaluate(()=>({
  data:JSON.parse(localStorage.getItem('rr-dossier-v1')),
  presets:JSON.parse(localStorage.getItem('rr-custom-presets-v1')),
  recovery:JSON.parse(localStorage.getItem('rr-restore-recovery-v1'))
 }));
 assert.equal(recovered.data.matches,afterDossier.matches,'real dossier survives explicit export/import');
 assert.equal(recovered.presets.entries.length,0,'chosen saved Custom presets restored');
 assert.equal(recovered.recovery.entries['rr-custom-presets-v1'].includes('Temporary'),true,'pre-restore state was backed up');
 await page.locator('#menu button[data-action="dossier"]').click();
 assert.equal(await page.locator('#dossier-matches').textContent(),String(afterDossier.matches));
 result.steps.push('user manual offline backup export, 3 mobile layouts, invalid-code guard, explicit preview/restore, pre-import recovery snapshot and dossier reload');




 console.log('PASS live Chromium Quick Play: '+JSON.stringify(result));
}finally{
 if(page)await page.close().catch(()=>{});
 await browser.close();
 await new Promise(r=>server.close(r));
}
