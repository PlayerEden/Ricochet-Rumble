// M6: real game-screen local save continuity through browser reload and reopen.
// Current mainline check, complementary to historical actual Android WebView
// emulator upgrade QA. No physical phone or production Play claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'Chromium required');
const root=path.resolve('web'),notFound=[];
const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){notFound.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const url='http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const keys=['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1','rr-hangar-paint-v1'];
const rows=[],errors=[];
const raw=page=>page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),keys);
const checkPage=page=>page.waitForFunction(()=>!!window.SectorDossier&&!!window.SectorBackup&&!!window.RR?.appPause);
try{
 for(const [width,height] of [[740,360],[915,412]]){
  const context=await browser.newContext({viewport:{width,height}});
  let page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await checkPage(page);
  // Save user preferences through the actual settings controls.
  await page.locator('#menu button[data-action="settings"]').click();
  await page.locator('#map-size').selectOption('large');
  await page.locator('#bot-count').selectOption('1');
  await page.locator('.mission-comfort-details summary').click();
  await page.locator('#pref-leftHanded').check();
  await page.locator('#menu button[data-action="settings-back"]').click();
  // Configure and save a real Custom Match preset through the game UI.
  await page.locator('#menu button[data-action="modes"]').click();
  await page.locator('#menu button[data-action="custom"]').click();
  await page.locator('#custom-mode').selectOption('survival_teams');
  await page.locator('#custom-size').selectOption('large');
  await page.locator('#custom-skill').selectOption('varied');
  await page.locator('.custom-preset-fold summary').click();
  await page.locator('#custom-preset-name').fill('Long Loop');
  await page.locator('#menu button[data-action="custom-preset-save"]').click();
  assert.match(await page.locator('#custom-preset-status').innerText(),/SAVED · Long Loop/);
  assert.match(await page.locator('#custom-preset-count').innerText(),/1\/5 SAVED/);
  await page.locator('#menu button[data-action="custom-back"]').click();
  await page.locator('#menu button[data-action="modes-back"]').click();
  // A free Hangar paint must remain equipped across all later reloads.
  await page.locator('#menu button[data-action="hangar"]').click();
  await page.locator('#menu button[data-action="equip-paint"][data-paint-id="fieldgrid.dune"]').click();
  assert.match(await page.locator('#hangar-status').innerText(),/EQUIPPED · DUNE/);
  await page.locator('#menu button[data-action="hangar-back"]').click();
  // Simulate valid completed Solo matches through the live Dossier module.
  // These are synthetic QA records; no fake match awarded to any actual user.
  const seeded=await page.evaluate(()=>{
   const store=window.SectorDossier.createStore(window.localStorage),results=[];
   for(let i=0;i<3;i++){
    results.push(store.record({version:1,matchModeId:'survival_ffa',outcome:'victory',
     matchId:601+i,mazeSeed:18001+i,durationSeconds:35,operatorKOs:1,deaths:0},
     'qa-local-relaunch-record-'+i));
   }
   return results;
  });
  assert.ok(seeded.every(r=>r.ok),JSON.stringify(seeded));
  // Full page reload reads Dossier from localStorage and resolves unlocks.
  await page.reload();await checkPage(page);
  await page.locator('#menu button[data-action="dossier"]').click();
  assert.equal(await page.locator('#dossier-matches').innerText(),'3');
  assert.equal(await page.locator('#dossier-wins').innerText(),'3');
  await page.locator('#menu button[data-action="dossier-back"]').click();
  await page.locator('#menu button[data-action="hangar"]').click();
  await page.locator('#menu button[data-action="hangar-tab"][data-hangar-tab="insignia"]').click();
  const vector=page.locator('#menu button[data-action="equip-emblem"][data-emblem-id="mark.vector"]');
  assert.equal(await vector.isDisabled(),false,'3 saved matches unlock real insignia');
  await vector.click();
  assert.match(await page.locator('#emblem-status').innerText(),/VECTOR/);
  await page.locator('#menu button[data-action="hangar-back"]').click();
  const before=await raw(page);
  for(const k of keys)assert.ok(before[k]&&JSON.parse(before[k]),k+' has valid persisted JSON');
  const exported=await page.evaluate(()=>window.SectorBackup.makeBackup(localStorage));
  assert.equal(exported.ok,true,'all game records remain exportable after reload');
  assert.ok(exported.count>=5,'saved Settings/Custom/Presets/Dossier/Hangar in one backup');
  const parsed=JSON.parse(exported.text);
  for(const k of keys)assert.equal(parsed.entries[k],before[k],k+' exact backup record');
  // Normal background pause during one-player practice cannot overwrite records.
  await page.locator('#menu button[data-action="modes"]').click();
  await page.locator('.practice-launch').click();
  await page.evaluate(()=>window.RR.appPause());
  assert.ok(await page.locator('#menu button[data-action="resume"]').count());
  await page.locator('#menu button[data-action="close"]').click();
  assert.deepEqual(await raw(page),before,'pause/exit preserves exact records');
  // Close the WebView-equivalent document and open a new one in the same origin.
  await page.close();
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await checkPage(page);
  assert.deepEqual(await raw(page),before,'reopening retains all exact storage strings');
  // Inspect actual visible UI after restart rather than relying on raw records.
  await page.locator('#menu button[data-action="settings"]').click();
  assert.equal(await page.locator('#map-size').inputValue(),'large');
  assert.equal(await page.locator('#bot-count').inputValue(),'1');
  assert.equal(await page.locator('#pref-leftHanded').isChecked(),true);
  await page.locator('#menu button[data-action="settings-back"]').click();
  await page.locator('#menu button[data-action="dossier"]').click();
  assert.equal(await page.locator('#dossier-matches').innerText(),'3');
  assert.equal(await page.locator('#dossier-wins').innerText(),'3');
  await page.locator('#menu button[data-action="dossier-back"]').click();
  await page.locator('#menu button[data-action="hangar"]').click();
  assert.match(await page.locator('#hangar-status').innerText(),/EQUIPPED · DUNE/);
  await page.locator('#menu button[data-action="hangar-tab"][data-hangar-tab="insignia"]').click();
  assert.match(await page.locator('#emblem-status').innerText(),/VECTOR/);
  await page.locator('#menu button[data-action="hangar-back"]').click();
  await page.locator('#menu button[data-action="modes"]').click();
  await page.locator('#menu button[data-action="custom"]').click();
  assert.equal(await page.locator('#custom-mode').inputValue(),'survival_teams');
  assert.equal(await page.locator('#custom-size').inputValue(),'large');
  assert.equal(await page.locator('#custom-skill').inputValue(),'varied');
  assert.match(await page.locator('#custom-preset-count').innerText(),/1\/5 SAVED/);
  assert.equal(await page.locator('#custom-preset-select option[value="Long Loop"]').count(),1);
  rows.push({viewport:width+'x'+height,settings:true,customPreset:true,dossierMatches:3,paint:'DUNE',insignia:'VECTOR',backupKeys:exported.count,reopen:true});
  await context.close();
 }
 assert.deepEqual(errors,[],'No runtime game errors');
 assert.deepEqual(notFound,[],'No missing web assets');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/one-phone-local-relaunch.json',JSON.stringify({result:'PASS',type:'REAL_CHROMIUM_RELOAD_AND_REOPEN_NOT_PHYSICAL_ANDROID',rows},null,2)+'\n');
 console.log('ONE_PHONE_LOCAL_RELAUNCH_PASS '+JSON.stringify(rows));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
