// Real Chromium one-phone onboarding QA: practice is optional, no rewards or preference writes.
// This tests the rendered HTML/game code, not a mocked clickable prototype.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'Chrome/Chromium required for practice QA');
const root=path.resolve('web');
const original=fs.readFileSync(path.join(root,'game.js'),'utf8');
const end=/\}\)\(\);\s*$/;
assert.match(original,end);
const extra=`window.__practiceQA={
  status(){
   const s=dossierStore?.snapshot?.();
   return {mode,paused,botCount:state?.config?.botCount,teamMode:state?.config?.teamMode,
    mapSize:state?.config?.mapSize,matchModeId:state?.config?.matchModeId,
    quickPlay:state?.config?.quickPlayMatch,custom:state?.config?.customMatch,
    actors:state?.tanks?.length,label:document.getElementById('mode-label')?.textContent,
    cameraPilot:unitTargetZoom({onFoot:true}),
    savedSettings:JSON.stringify(selectedRules),
    storedSettings:window.localStorage?.getItem(PREF_KEY)||null,
    dossier:JSON.stringify(s||null)};
  }
};})();`;
const injected=original.replace(end,extra);
const server=http.createServer((req,res)=>{
  const file=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).slice(1)||'index.html';
  if(!['index.html','style.css','game.js','save-backup.js','dossier.js','scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js'].includes(file)){
   res.writeHead(404);res.end();return;
  }
  res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
  res.end(file==='game.js'?injected:fs.readFileSync(path.join(root,file)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try {
 for(const [width,height] of [[740,360],[915,412],[1280,720]]){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__practiceQA);
  const before=await page.evaluate(()=>window.__practiceQA.status());
  // Correct default controls. No misleading legacy hold-to-fire instruction.
  await page.locator('#menu button[data-action="help"]').click();
  assert.equal(await page.locator('.help-screen').count(),1);
  assert.match(await page.locator('.help-steps').innerText(),/Drag FIRE to aim; release to shoot/);
  assert.equal(await page.locator('.help-practice').count(),1);
  // First practice entry: from Help. A no-bot match with no progression.
  await page.locator('.help-practice').click();
  const practice=await page.evaluate(()=>window.__practiceQA.status());
  assert.equal(practice.mode,'solo');
  assert.equal(practice.paused,false);
  assert.equal(practice.botCount,0);
  assert.equal(practice.actors,1);
  assert.equal(practice.teamMode,'ffa');
  assert.equal(practice.quickPlay,false);
  assert.equal(practice.custom,false);
  assert.equal(practice.label,'PRACTICE FIELD');
  assert.equal(practice.savedSettings,before.savedSettings,'practice cannot change saved quick-play rules');
  assert.equal(practice.dossier,before.dossier,'practice cannot mutate Dossier on entry');
  assert.equal(practice.cameraPilot,.94,'protected v0.9.78 pilot camera');
  assert.ok(await page.locator('#menu').evaluate(e=>e.classList.contains('hidden')));
  const canvas=await page.locator('#arena').boundingBox();
  assert.ok(canvas&&Math.abs(canvas.width-width)<2&&Math.abs(canvas.height-height)<2,'live practice still uses fullscreen canvas');
  // A clear exit to the normal game, without changing the underlying settings.
  await page.locator('#menu-button').click();
  await page.locator('#menu button[data-action="close"]').click();
  const exited=await page.evaluate(()=>window.__practiceQA.status());
  assert.equal(exited.mode,'idle');
  assert.equal(exited.savedSettings,before.savedSettings,'exit retains original settings');
  await page.locator('#menu button[data-action="modes"]').click();
  assert.equal(await page.locator('.practice-launch').count(),1);
  assert.match(await page.locator('.practice-launch').innerText(),/NO BOTS · NO RECORD/);
  await page.locator('.practice-launch').click();
  const fromModes=await page.evaluate(()=>window.__practiceQA.status());
  assert.equal(fromModes.botCount,0);
  assert.equal(fromModes.label,'PRACTICE FIELD');
  assert.equal(fromModes.savedSettings,before.savedSettings);
  // Restoring the home route must not make normal Quick Play a 0-bot practice.
  await page.locator('#menu-button').click();
  await page.locator('#menu button[data-action="close"]').click();
  await page.locator('#menu button[data-action="solo"]').click();
  const quick=await page.evaluate(()=>window.__practiceQA.status());
  assert.equal(quick.mode,'solo');
  assert.ok(quick.botCount>0,'normal Quick Play still has opponents');
  assert.equal(quick.savedSettings,before.savedSettings,'Quick Play selection retained');
  assert.equal(quick.cameraPilot,.94);
  cases.push({viewport:width+'x'+height,practiceBots:practice.botCount,normalBots:quick.botCount,helpAndModes:true,prefsUnchanged:true});
  await page.close();
 }
 assert.deepEqual(errors,[],'No runtime script errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/solo-practice-onboarding.json',JSON.stringify({result:'PASS',type:'REAL_CHROMIUM',cases},null,2)+'\n');
 console.log('SOLO_PRACTICE_ONBOARDING_PASS '+JSON.stringify(cases));
} finally {await browser.close();await new Promise(ok=>server.close(ok));}
