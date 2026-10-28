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
 freeze(){paused=true}, registerHit, ejectPilot, refreshHUD
};
})();`);
assert.notEqual(instrumented,game,'QA hook injected into transient HTTP response');
const sources={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/game.js':'game.js'};
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
 console.log('PASS live Chromium Quick Play: '+JSON.stringify(result));
}finally{
 if(page)await page.close().catch(()=>{});
 await browser.close();
 await new Promise(r=>server.close(r));
}
