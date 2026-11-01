// Cross-preview persistence rehearsal: actual 100039 and current HTML/JS/CSS,
// same browser origin, no mocked app storage. This is NOT an Android install test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';

const beforeArg=process.argv[2] || 'before-preview/web';
const before=path.resolve(beforeArg);
const after=path.resolve('web');
for(const dir of [before,after])for(const file of ['index.html','game.js','style.css','dossier.js','save-backup.js','scored-match.js'])
 assert.ok(fs.existsSync(path.join(dir,file)),'Missing exact web source: '+dir+'/'+file);
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'Real Chromium browser is required for the preview upgrade rehearsal');
let served=before;
const allowed=new Set(['index.html','game.js','style.css','dossier.js','save-backup.js','scored-match.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/, '') || 'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(served,name)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const keys=['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1','rr-hangar-paint-v1'];
const snapshot=()=>page.evaluate(names=>Object.fromEntries(names.map(k=>[k,localStorage.getItem(k)])),keys);
async function uiState(phase){
 assert.equal(await page.locator('.home-screen').isVisible(),true,phase+': home visible');
 await page.locator('button[data-action="dossier"]').click();
 assert.equal((await page.locator('#dossier-matches').textContent()).trim(),'5',phase+': saved match total visible');
 assert.equal((await page.locator('#dossier-kos').textContent()).trim(),'8',phase+': saved KOs visible');
 await page.locator('button[data-action="hangar"]').click();
 assert.equal(await page.locator('button[data-paint-id="fieldgrid.moss"]').getAttribute('aria-pressed'),'true',phase+': equipped paint selected');
 await page.locator('button[data-hangar-tab="insignia"]').click();
 assert.equal(await page.locator('button[data-emblem-id="mark.vector"]').getAttribute('aria-pressed'),'true',phase+': earned emblem equipped');
 await page.locator('button[data-action="hangar-back"]').click();
 await page.locator('button[data-action="dossier-back"]').click();
 await page.locator('button[data-action="settings"]').click();
 assert.equal(await page.locator('#map-size').inputValue(),'standard',phase+': map size survives');
 assert.equal(await page.locator('#bot-count').inputValue(),'1',phase+': bot count survives');
 const box=page.locator('input[data-playlist-mode="survival_ffa"]');
 const other=page.locator('input[data-playlist-mode="survival_teams"]');
 await page.locator('.extra-rules summary').click();
 assert.equal(await box.isChecked(),true,phase+': selected playlist persisted');
 assert.equal(await other.isChecked(),false,phase+': unselected playlist persisted');
 await page.locator('button[data-action="settings-back"]').click();
 await page.locator('button[data-action="modes"]').click();
 await page.locator('button[data-action="custom"]').click();
 assert.equal(await page.locator('#custom-mode').inputValue(),'survival_ffa',phase+': saved Custom rules loaded');
 assert.equal(await page.locator('#custom-size').inputValue(),'large',phase+': Custom map size loaded');
 await page.locator('.custom-preset-fold summary').click();
 assert.equal(await page.locator('#custom-preset-count').textContent(),'1/5 SAVED ON THIS DEVICE',phase+': Custom preset count preserved');
 await page.locator('button[data-action="custom-back"]').click();
 await page.locator('button[data-action="modes-back"]').click();
}
try{
 const base='http://127.0.0.1:'+server.address().port+'/';
 await page.goto(base,{waitUntil:'load'});
 assert.equal(await page.locator('.home-screen').isVisible(),true,'baseline 100039 loaded');
 await page.evaluate(()=>{
  const draft={modeId:'survival_ffa',mapSize:'large',botCount:1,botSkill:'casual',startLives:3,bulletCap:2};
  const dossier={schemaVersion:1,matches:5,wins:4,losses:1,draws:0,kos:8,deaths:3,seconds:300,byMode:{
   survival_ffa:{matches:5,wins:4,losses:1,draws:0,kos:8,deaths:3,seconds:300}
  },recentKeys:[]};
  const entries={
   'rr-options-v06':{settings:{mapSize:'standard',botCount:1,bulletCap:3,startLives:2,teamMode:'ffa',botSkill:'casual'},comfort:{sound:true,music:false,shake:false,autoFire:false,leftHanded:false},playlist:{version:1,enabled:['survival_ffa']}},
   'rr-custom-v1':{version:1,rules:draft},
   'rr-custom-presets-v1':{version:1,entries:[{name:'Maze Duel',rules:draft}]},
   'rr-dossier-v1':dossier,
   'rr-hangar-paint-v1':{version:1,equipped:'fieldgrid.moss',emblem:'mark.vector'}
  };
  for(const [key,value] of Object.entries(entries))localStorage.setItem(key,JSON.stringify(value));
 });
 await page.reload({waitUntil:'load'});
 await uiState('verified older preview');
 const saved=await snapshot();
 assert.ok(keys.every(k=>typeof saved[k]==='string'),'five durable local stores seeded');
 served=after; // simulates a package update without clearing the installed origin
 await page.reload({waitUntil:'load'});
 assert.deepEqual(await snapshot(),saved,'opening the new app did not rewrite or destroy any saved record');
 await uiState('current preview');
 assert.deepEqual(await snapshot(),saved,'navigating current menus kept exact saved bytes intact');
 await page.reload({waitUntil:'load'});
 assert.deepEqual(await snapshot(),saved,'second launch retains exact records');
 assert.deepEqual(errors,[],'no browser runtime exceptions in either version');
 console.log('PREVIEW_UPGRADE_BROWSER_PASS: 100039 -> current same-origin reload, five raw records and Dossier/Hangar/Settings/Custom UI checks intact; Android upgrade still pending');
}finally{
 await page.close().catch(()=>{});
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
