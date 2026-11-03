// M8: real game UI After Action -> Hangar reward routing. Synthetic
// completed match fixtures seed valid local Dossier records; the actual game
// reward calculation, result button, Hangar controls and storage are exercised.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'Chromium is required');
const root=path.resolve('web'),errors=[],missing=[];
const original=fs.readFileSync(path.join(root,'game.js'),'utf8');
const suffix=/\}\)\(\);\s*$/;
assert.match(original,suffix);
const injected=original.replace(suffix,[
 'window.__rewardQA={',
 ' seed(matches,wins){',
 '  const results=[];',
 '  for(let i=0;i<matches;i++)results.push(dossierStore.record({',
 '   version:1,matchModeId:"survival_ffa",outcome:i<wins?"victory":"defeat",',
 '   matchId:4000+i,mazeSeed:5200+i,durationSeconds:28,operatorKOs:0,deaths:0',
 '  },"qa-reward-seed-"+i));',
 '  return {ok:results.every(r=>r.ok),data:dossierStore.snapshot()};',
 ' },',
 ' finish(){',
 '  newMatch("solo");',
 '  if(state.config.botCount===0)throw Error("Expected an actual bot match");',
 '  state.finalResult=Object.freeze({',
 '   version:1,matchModeId:state.config.matchModeId,outcome:"victory",',
 '   matchId:state.matchId,mazeSeed:state.mazeSeed,durationSeconds:36,',
 '   operatorKOs:0,deaths:0,livesRemaining:state.lives[0],event:"QA SECTOR CLEARED"',
 '  });',
 '  state.winner=0;state.winnerTeam=teamOf(0);refreshHUD();',
 '  return {earned:roundUnlocks.slice(),record:dossierStore.snapshot()};',
 ' },',
 ' again(){refreshHUD();return {earned:roundUnlocks.slice(),record:dossierStore.snapshot()}}',
 '};})();'
].join('\n'));
const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js','scored-match.js',
 'forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?injected:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const scenarios=[
 {label:'Insignia threshold',w:740,h:360,matches:2,wins:0,
  rewards:['△ VECTOR INSIGNIA'],tab:'insignia',
  ids:['[data-action="equip-emblem"][data-emblem-id="mark.vector"]']},
 {label:'Paint threshold',w:915,h:412,matches:4,wins:0,
  rewards:['VANGUARD PAINT'],tab:'paint',
  ids:['[data-action="equip-paint"][data-paint-id="fieldgrid.vanguard"]']},
 {label:'Mixed threshold / short landscape',w:568,h:320,matches:11,wins:11,
  rewards:['VETERAN PAINT','◆ COMMAND INSIGNIA'],tab:'paint',
  ids:['[data-action="equip-paint"][data-paint-id="fieldgrid.veteran"]',
       '[data-action="equip-emblem"][data-emblem-id="mark.command"]']}
];
const results=[];
const snapshot=page=>page.evaluate(()=>({
 dossier:localStorage.getItem('rr-dossier-v1'),
 hangar:localStorage.getItem('rr-hangar-paint-v1'),
 settings:localStorage.getItem('rr-options-v06')
}));
try{
 for(const sc of scenarios){
  const context=await browser.newContext({viewport:{width:sc.w,height:sc.h}});
  let page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__rewardQA&&!!window.SectorDossier);
  // Normal Hangar visits have no transient messages or new-item markers.
  await page.locator('#menu button[data-action="hangar"]').click();
  assert.equal(await page.locator('#hangar-new-unlocks').isHidden(),true);
  assert.equal(await page.locator('.hangar-tabs .new-reward').count(),0);
  assert.equal(await page.locator('.hangar-pane .new-reward-item').count(),0);
  assert.equal(await page.locator('[data-hangar-tab="paint"]').getAttribute('aria-selected'),'true');
  await page.locator('#menu button[data-action="hangar-back"]').click();

  const seeded=await page.evaluate(([n,w])=>window.__rewardQA.seed(n,w),[sc.matches,sc.wins]);
  assert.equal(seeded.ok,true,'test Dossier setup uses valid results');
  assert.equal(seeded.data.matches,sc.matches);
  const outcome=await page.evaluate(()=>window.__rewardQA.finish());
  assert.equal(outcome.record.matches,sc.matches+1);
  assert.deepEqual(outcome.earned,sc.rewards,'only real threshold-crossed rewards advertised');
  const again=await page.evaluate(()=>window.__rewardQA.again());
  assert.deepEqual(again.earned,sc.rewards);
  assert.equal(again.record.matches,sc.matches+1,'HUD refresh never repeats Dossier reward');
  assert.equal(await page.locator('#aa-rewards').isVisible(),true,'real After Action reward CTA is visible');
  const before=await snapshot(page);
  await page.locator('#aa-rewards').click();
  assert.equal(await page.locator('.hangar-screen').count(),1,'CTA routes to Hangar');
  assert.equal(await page.locator('#hangar-new-unlocks').isVisible(),true);
  for(const name of sc.rewards)assert.ok((await page.locator('#hangar-new-unlocks').innerText()).includes(name));
  assert.equal(await page.locator('[data-hangar-tab="'+sc.tab+'"]').getAttribute('aria-selected'),'true','open earned category first');
  assert.equal(await page.locator('.hangar-pane .new-reward-item').count(),sc.rewards.length);
  assert.deepEqual(await snapshot(page),before,'opening earned Hangar never writes progress');
  const size=await page.locator('#panel').evaluate(el=>({
   scrollW:el.scrollWidth,clientW:el.clientWidth,scrollH:el.scrollHeight,clientH:el.clientHeight
  }));
  assert.ok(size.scrollW<=size.clientW+3,'no horizontal overflow from reward notice');

  for(const [i,id] of sc.ids.entries()){
   const item=page.locator('#panel '+id);
   if(i===1)await page.locator('[data-hangar-tab="insignia"]').click();
   assert.equal(await item.isDisabled(),false,'earned item is equip-ready');
   assert.match(await item.getAttribute('class')||'',/new-reward-item/);
   await item.click();
   assert.equal(await item.getAttribute('aria-pressed'),'true','earned cosmetic equipped by user');
  }
  const after=await snapshot(page);
  assert.equal(after.dossier,before.dossier,'equipping cosmetics never writes Dossier results');
  assert.notEqual(after.hangar,before.hangar,'equipping reward persists actual choice');
  await page.locator('#menu button[data-action="hangar-back"]').click();
  await page.locator('#menu button[data-action="hangar"]').click();
  assert.equal(await page.locator('#hangar-new-unlocks').isHidden(),true,'no stale reward banner');
  assert.equal(await page.locator('.hangar-pane .new-reward-item').count(),0,'no stale new-item highlight');
  assert.equal(await page.locator('.hangar-tabs .new-reward').count(),0,'no stale new-tab highlight');
  assert.equal(await page.locator('[data-hangar-tab="paint"]').getAttribute('aria-selected'),'true','ordinary Hangar still starts at Paint');
  await page.locator('#menu button[data-action="hangar-back"]').click();

  // The selected reward persists through a full document reload, while
  // transient After Action guidance does not persist or award data.
  await page.reload();
  await page.locator('#menu button[data-action="hangar"]').click();
  if(sc.rewards.some(r=>r.endsWith(' PAINT'))){
   const id=sc.ids[0];assert.equal(await page.locator('#panel '+id).getAttribute('aria-pressed'),'true');
  }
  if(sc.rewards.some(r=>r.endsWith(' INSIGNIA'))){
   await page.locator('[data-hangar-tab="insignia"]').click();
   const id=sc.ids.at(-1);assert.equal(await page.locator('#panel '+id).getAttribute('aria-pressed'),'true');
  }
  assert.equal(await page.locator('#hangar-new-unlocks').isHidden(),true);
  assert.equal((await snapshot(page)).dossier,before.dossier);
  results.push({scenario:sc.label,viewport:sc.w+'x'+sc.h,rewards:sc.rewards,
   opened:sc.tab,onceOnly:true,savePreserved:true,reload:true,overflow:false});
  await context.close();
 }
 assert.deepEqual(errors,[],'no runtime errors');
 assert.deepEqual(missing,[],'no missing app assets');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/reward-hangar-navigation.json',JSON.stringify({result:'PASS',type:'REAL_CHROMIUM_UI',cases:results},null,2)+'\n');
 console.log('REWARD_HANGAR_NAVIGATION_PASS '+JSON.stringify(results));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
