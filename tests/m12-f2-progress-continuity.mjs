// M12-F2 same-origin raw save continuity. Uses real baseline/current code in headless Chromium,
// NOT an Android install-over test, nor any actual user records.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright-core';

const manifest=JSON.parse(fs.readFileSync('docs/M12_ASSET_MANIFEST_2026-11-04.json','utf8'));
const baseCommit=manifest.baselineCommit,root=path.resolve('web');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
assert.equal(git('merge-base',baseCommit,git('rev-parse','HEAD')),baseCommit,
 'Pinned baseline must be an ancestor of PR current code');
const headCommit=git('rev-parse','HEAD'),errors=[],missing=[],network=[];
const keys=['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1','rr-hangar-paint-v1','rr-daily-sector-v1'];
const cache=new Map();
let phase='baseline';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml',
 '.png':'image/png','.webp':'image/webp','.json':'application/json'};
function readAsset(file){
 if(phase==='head')return fs.readFileSync(path.join(root,file));
 const k=baseCommit+':web/'+file;
 if(!cache.has(k))cache.set(k,execFileSync('git',['show',k],{maxBuffer:8*1024*1024}));
 return cache.get(k);
}
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 let name;
 try{name=decodeURIComponent(pathname).replace(/^\/+/,'')||'index.html';}
 catch(_){res.writeHead(400);res.end();return;}
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 const safe=path.posix.normalize(name);
 if(safe!==name||safe.startsWith('..')||name.includes('\\')||!Object.hasOwn(types,path.extname(name))){
  res.writeHead(404);res.end();missing.push(phase+':'+name);return;
 }
 try{
  const content=readAsset(name);
  res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store'});
  res.end(content);
 }catch(e){missing.push(phase+':'+name);res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const bin=process.env.CHROME_BIN;
assert.ok(bin,'Real Chromium required for M12-F2 storage continuity test');
const browser=await chromium.launch({headless:true,executablePath:bin,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:1});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(phase+':'+e.message));
page.on('request',req=>{if(!req.url().startsWith(origin))network.push(req.url());});
const out='qa-results/m12/release-gate';fs.mkdirSync(out,{recursive:true});
const snapshot=async()=>await page.evaluate(names=>
 Object.fromEntries(names.map(n=>[n,localStorage.getItem(n)])),keys);
const fixture={
 'rr-options-v06':{settings:{mapSize:'standard',botCount:1,bulletCap:3,startLives:2,teamMode:'ffa',botSkill:'casual'},
  comfort:{sound:true,music:false,shake:false,autoFire:false,leftHanded:false},
  playlist:{version:1,enabled:['survival_ffa']}},
 'rr-custom-v1':{version:1,rules:{modeId:'survival_ffa',mapSize:'large',botCount:1,
  botSkill:'casual',startLives:3,bulletCap:2}},
 'rr-custom-presets-v1':{version:1,entries:[{name:'Maze Duel',rules:{modeId:'survival_ffa',
  mapSize:'large',botCount:1,botSkill:'casual',startLives:3,bulletCap:2}}]},
 'rr-dossier-v1':{schemaVersion:1,matches:5,wins:4,losses:1,draws:0,kos:8,deaths:3,seconds:300,
  byMode:{survival_ffa:{matches:5,wins:4,losses:1,draws:0,kos:8,deaths:3,seconds:300}},
  recentKeys:[]},
 'rr-hangar-paint-v1':{version:1,equipped:'fieldgrid.moss',emblem:'mark.vector'},
 'rr-daily-sector-v1':{version:1,days:{'2026-11-04':{attempts:1,
  best:{outcome:'victory',kos:1,deaths:0,seconds:150}}},recentKeys:['m12-f2-synthetic']}
};
const go=async pathname=>page.goto(origin+pathname,{waitUntil:'load'});
async function reviewUI(which){
 assert.equal(await page.locator('.home-screen').isVisible(),true,which+': main menu');
 await page.locator('#menu button[data-action="dossier"]').click();
 for(const [id,wanted] of [['#dossier-matches','5'],['#dossier-wins','4'],['#dossier-kos','8']])
  assert.equal((await page.locator(id).textContent()).trim(),wanted,which+': dossier '+id);
 await page.screenshot({path:out+'/m12-f2-'+which+'-dossier.png',animations:'disabled'});
 await page.locator('.dossier-screen [data-action="hangar"]').click();
 const paint=page.locator('button[data-action="equip-paint"][data-paint-id="fieldgrid.moss"]');
 assert.equal(await paint.getAttribute('aria-pressed'),'true',which+': equipped paint');
 await page.locator('.hangar-tabs [data-hangar-tab="insignia"]').click();
 const emblem=page.locator('[data-emblem-id="mark.vector"]');
 assert.equal(await emblem.getAttribute('aria-pressed'),'true',which+': earned and equipped Vector');
 assert.equal(await emblem.isDisabled(),false,which+': earned Vector must stay unlocked');
 assert.equal(await page.locator('#insignia-detail-name').textContent(),'VECTOR',
  which+': equipped insignia identity');
 await page.locator('.hangar-screen [data-action="hangar-back"]').click();
 await page.locator('.dossier-screen [data-action="dossier-back"]').click();
 await page.locator('#menu button[data-action="settings"]').click();
 assert.equal(await page.locator('#map-size').inputValue(),'standard',which+': map size');
 assert.equal(await page.locator('#bot-count').inputValue(),'1',which+': bot count');
 await page.locator('#menu button[data-action="settings-back"]').click();
 await page.locator('#menu button[data-action="modes"]').click();
 await page.locator('.mode-grid button[data-action="custom"]').click();
 assert.equal(await page.locator('#custom-mode').inputValue(),'survival_ffa',which+': Custom mode');
 assert.equal(await page.locator('#custom-size').inputValue(),'large',which+': Custom map size');
 await page.locator('.custom-preset-fold summary').click();
 assert.equal((await page.locator('#custom-preset-count').textContent()).trim(),
  '1/5 SAVED ON THIS DEVICE',which+': Custom presets');
 await page.locator('[data-action="custom-back"]').click();
 await page.locator('[data-action="modes-back"]').click();
}
try{
 await go('/');
 assert.equal(await page.locator('.home-screen').isVisible(),true,'baseline really launched');
 await page.evaluate(data=>{for(const [k,v] of Object.entries(data))
  localStorage.setItem(k,JSON.stringify(v));},fixture);
 await page.reload({waitUntil:'load'});
 await reviewUI('baseline');
 const before=await snapshot();
 assert.ok(keys.every(k=>typeof before[k]==='string'),'six real app keys exist in baseline');
 // Serve actual PR source without changing the origin or discarding the context.
 phase='head';await page.reload({waitUntil:'load'});
 assert.deepEqual(await snapshot(),before,'load-current must preserve exact raw saved bytes');
 await reviewUI('current');
 assert.deepEqual(await snapshot(),before,'new menus must preserve six raw saved values');
 await page.reload({waitUntil:'load'});
 assert.deepEqual(await snapshot(),before,'second launch must preserve saved records');
 // Intentional lab URL must not rewrite records either. The Android lab has a
 // separate package origin, so this check is UI-only, not proof of cross-app transfer.
 await go('/?m12Art=warm');
 assert.deepEqual(await snapshot(),before,'experimental art startup cannot rewrite saves');
 await page.locator('#menu button[data-action="hangar"]').click();
 await page.locator('[data-hangar-tab="insignia"]').click();
 const badge=page.locator('.m12-insignia-art-cycle');
 assert.equal(await badge.isVisible(),true,'lab art compare available');
 await badge.click();await badge.click();
 assert.deepEqual(await snapshot(),before,'badge A/B cannot mutate saved records');
 assert.deepEqual(errors,[],'baseline/current JavaScript errors');
 assert.deepEqual(network,[],'no third-party calls');
 assert.deepEqual(missing,[],'no missing local files');
 const hashes=Object.fromEntries(keys.map(k=>[k,crypto.createHash('sha256')
  .update(before[k]).digest('hex')]));
 const report={result:'PASS',scope:'REAL_CHROMIUM_SAME_ORIGIN_NOT_ANDROID_INSTALL',
  baselineSha:baseCommit,headSha:headCommit,syntheticKeys:keys,
  exactRawByteContinuity:true,labArtToggleWroteNoSaves:true,
  verifiedUI:['dossier','earned insignia','equipped paint','settings','custom draft/preset'],
  sourceFingerprintsSha256:hashes,androidInstallOverProven:false,
  disclaimer:'Android app updates additionally require same package ID, signer and compatible versionCode; uninstall removes local app data.'};
 fs.writeFileSync(out+'/m12-f2-progress-continuity.json',JSON.stringify(report,null,2)+'\n');
 console.log('M12_F2_SAME_ORIGIN_PROGRESS_PASS '+JSON.stringify({
  keys:keys.length,baseSha:baseCommit,headSha:headCommit,labNoSaveWrites:true}));
}finally{
 await page.close().catch(()=>{});
 await context.close().catch(()=>{});
 await browser.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
