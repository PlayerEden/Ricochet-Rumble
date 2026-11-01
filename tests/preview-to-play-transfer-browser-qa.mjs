// Two isolated browser app profiles. Export through the REAL backup screen
// in the first profile; import and preview/confirm through UI in the second.
// This rehearses separate preview and Play app storage, not real Android packages.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN required; test must never silently skip');
const root=path.resolve('web'),allowed=new Set(['index.html','style.css','game.js','scored-match.js','dossier.js','save-backup.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const oldProfile=await browser.newContext({viewport:{width:915,height:412}});
const newProfile=await browser.newContext({viewport:{width:915,height:412}});
const oldPage=await oldProfile.newPage(),newPage=await newProfile.newPage();
const errors=[];
for(const p of [oldPage,newPage])p.on('pageerror',e=>errors.push(e.message));
const keys=['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1','rr-hangar-paint-v1'];
const state=p=>p.evaluate(names=>Object.fromEntries(names.map(k=>[k,localStorage.getItem(k)])),keys);
try{
 const url='http://127.0.0.1:'+server.address().port+'/';
 await oldPage.goto(url,{waitUntil:'load'});
 await newPage.goto(url,{waitUntil:'load'});
 await oldPage.evaluate(()=>{
  const rules={modeId:'survival_ffa',mapSize:'large',botCount:1,botSkill:'casual',startLives:3,bulletCap:2};
  const dossier={schemaVersion:1,matches:6,wins:5,losses:1,draws:0,kos:11,deaths:2,seconds:410,
   byMode:{survival_ffa:{matches:6,wins:5,losses:1,draws:0,kos:11,deaths:2,seconds:410}},recentKeys:[]};
  const entries={
   'rr-options-v06':{settings:{mapSize:'standard',botCount:1,bulletCap:3,startLives:2,teamMode:'ffa',botSkill:'casual'},comfort:{sound:true,music:false,shake:false,autoFire:false,leftHanded:false},playlist:{version:1,enabled:['survival_ffa']}},
   'rr-custom-v1':{version:1,rules},
   'rr-custom-presets-v1':{version:1,entries:[{name:'Maze Duel',rules}]},
   'rr-dossier-v1':dossier,
   'rr-hangar-paint-v1':{version:1,equipped:'fieldgrid.moss',emblem:'mark.vector'}
  };
  for(const [key,value] of Object.entries(entries))localStorage.setItem(key,JSON.stringify(value));
 });
 await oldPage.reload({waitUntil:'load'});
 assert.equal(await oldPage.locator('.home-screen').isVisible(),true);
 await oldPage.locator('button[data-action="dossier"]').click();
 assert.equal((await oldPage.locator('#dossier-matches').textContent()).trim(),'6');
 await oldPage.locator('button[data-action="backup"]').click();
 await oldPage.locator('button[data-action="backup-export"]').click();
 const backup=await oldPage.locator('#backup-output').inputValue();
 const exported=JSON.parse(backup);
 assert.equal(exported.format,'sector-rebound-local-v1');
 assert.deepEqual(Object.keys(exported.entries).sort(),keys.slice().sort(),'all five saved records exported');
 const original=await state(oldPage);
 for(const name of keys)assert.equal(exported.entries[name],original[name],'text contains exact saved '+name);
 const fresh=await state(newPage);
 assert.equal(fresh['rr-dossier-v1'],null,'separate app profile does not inherit Dossier');
 assert.equal(fresh['rr-hangar-paint-v1'],null,'separate app profile does not inherit cosmetic choices');

 await newPage.locator('button[data-action="dossier"]').click();
 await newPage.locator('button[data-action="backup"]').click();
 await newPage.locator('#backup-import').fill(backup);
 assert.equal(await newPage.locator('#backup-restore').isDisabled(),true,'explicit preview required');
 await newPage.locator('button[data-action="backup-preview"]').click();
 assert.equal(await newPage.locator('#backup-restore').isDisabled(),false);
 assert.match(await newPage.locator('#backup-message').textContent(),/VALID BACKUP: 5 RECORDS/);
 await newPage.locator('#backup-restore').click();
 await newPage.waitForFunction(()=>!!document.querySelector('.home-screen')&&!!localStorage.getItem('rr-dossier-v1'));
 const imported=await state(newPage);
 assert.deepEqual(imported,original,'five raw saved values transferred exactly between isolated contexts');
 assert.deepEqual(await state(oldPage),original,'original donor state was not changed');
 assert.ok((await newPage.evaluate(()=>localStorage.getItem('rr-restore-recovery-v1')))?.length>10,'recovery snapshot recorded');
 await newPage.locator('button[data-action="dossier"]').click();
 assert.equal((await newPage.locator('#dossier-matches').textContent()).trim(),'6');
 assert.equal((await newPage.locator('#dossier-kos').textContent()).trim(),'11');
 await newPage.locator('button[data-action="hangar"]').click();
 assert.equal(await newPage.locator('button[data-paint-id="fieldgrid.moss"]').getAttribute('aria-pressed'),'true');
 await newPage.locator('button[data-hangar-tab="insignia"]').click();
 assert.equal(await newPage.locator('button[data-emblem-id="mark.vector"]').getAttribute('aria-pressed'),'true');
 await newPage.locator('button[data-action="hangar-back"]').click();
 await newPage.locator('button[data-action="dossier-back"]').click();
 await newPage.locator('button[data-action="settings"]').click();
 assert.equal(await newPage.locator('#map-size').inputValue(),'standard');
 assert.equal(await newPage.locator('#bot-count').inputValue(),'1');
 await newPage.locator('button[data-action="settings-back"]').click();
 await newPage.locator('button[data-action="modes"]').click();
 await newPage.locator('button[data-action="custom"]').click();
 assert.equal(await newPage.locator('#custom-size').inputValue(),'large');
 await newPage.locator('.custom-preset-fold summary').click();
 assert.equal((await newPage.locator('#custom-preset-count').textContent()).trim(),'1/5 SAVED ON THIS DEVICE');
 assert.deepEqual(errors,[],'no browser errors in user backup transfer');
 console.log('PREVIEW_TO_PLAY_MANUAL_TRANSFER_BROWSER_PASS: distinct app profiles, UI export/preview/restore, 5 exact records, Dossier/Hangar/Settings/Custom verified; not physical Android');
}finally{
 await oldProfile.close().catch(()=>{});
 await newProfile.close().catch(()=>{});
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}