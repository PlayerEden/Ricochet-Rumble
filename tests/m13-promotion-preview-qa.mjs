// Approved study-art M13 preview: real Chromium, five phone viewport sizes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium is mandatory');
const root=path.resolve('web'),errs=[],bad=[],remote=[];
const files=new Set(['index.html','style.css','game.js','dossier.js','save-backup.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js',
 ...['hangar-warm-empty-v1.svg','hangar-blueprint-empty-v1.svg',
 ...['cqc','ffa','tdm','custom','ctf','forward-bays'].map(n=>'mode-'+n+'-study-v1.svg'),
 ...['field','vector','ace','command'].map(n=>'insignia-'+n+'-study-v1.svg')].map(n=>'assets/m12/'+n)]);
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!files.has(name)){bad.push(name);res.writeHead(404);res.end();return;}
 const content=fs.readFileSync(path.join(root,name));
 const ct=name.endsWith('.svg')?'image/svg+xml':name.endsWith('.js')?'text/javascript':
  name.endsWith('.css')?'text/css':'text/html';
 res.writeHead(200,{'Content-Type':ct,'Cache-Control':'no-store'});res.end(content);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const dir='qa-results/m13/preview';fs.mkdirSync(dir,{recursive:true});
const sizes=[[568,320],[640,360],[740,360],[915,412],[1280,720]],rows=[];
const getStorage=p=>p.evaluate(()=>Object.fromEntries(
 Array.from({length:localStorage.length},(_,i)=>[localStorage.key(i),
  localStorage.getItem(localStorage.key(i))]).sort((a,b)=>a[0].localeCompare(b[0]))));
try{
 for(const [w,h] of sizes){
  const c=await browser.newContext({viewport:{width:w,height:h}}),p=await c.newPage();
  p.on('pageerror',e=>errs.push(w+'x'+h+' '+e.message));
  p.on('request',r=>{if(!r.url().startsWith(origin))remote.push(r.url())});
  await p.goto(origin+'/?m13Preview=1',{waitUntil:'load'});
  const original=await getStorage(p);
  await p.locator('#menu button[data-action="modes"]').click();
  assert.equal(await p.locator('.mode-screen').getAttribute('data-m12-mode-art'),'on');
  assert.equal(await p.locator('.m12-mode-art-cycle').isVisible(),false,'dev ART button in production preview');
  for(const [action,art] of [['cqc','cqc'],['scored_ffa','ffa'],['scored_tdm','tdm'],['custom','custom']]){
   const b=p.locator('.mode-grid button[data-action="'+action+'"]');
   assert.equal(await b.isVisible(),true);
   const bounds=await b.evaluate(el=>{
    const a=el.getBoundingClientRect(),t=el.querySelector('strong').getBoundingClientRect();
    return {left:a.left,right:a.right,bottom:a.bottom,titleLeft:t.left,titleRight:t.right,
     bg:getComputedStyle(el,'::before').backgroundImage};
   });
   assert.ok(bounds.left>=-1&&bounds.right<=w+1&&bounds.bottom<=h+1,
    'mode card clipped '+w+'x'+h+' '+action);
   assert.ok(bounds.titleLeft>=bounds.left-1&&bounds.titleRight<=bounds.right+1,
    'mode title clipped '+action);
   assert.ok(bounds.bg.includes('mode-'+art+'-study-v1.svg'),'missing default '+art);
  }
  await p.screenshot({path:dir+'/mode-'+w+'x'+h+'.png',animations:'disabled'});
  await p.locator('[data-action="modes-back"]').click();
  await p.locator('#menu button[data-action="hangar"]').click();
  assert.equal(await p.locator('.hangar-bay').getAttribute('data-m12-art'),'warm');
  assert.equal(await p.locator('.m12-art-cycle').isVisible(),false,'Hangar dev ART button displayed');
  const stage=await p.locator('.m12-art-plate').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.ok(stage.includes('hangar-warm-empty-v1.svg'));
  await p.screenshot({path:dir+'/hangar-'+w+'x'+h+'.png',animations:'disabled'});
  await p.locator('[data-hangar-tab="insignia"]').click();
  assert.equal(await p.locator('.m12-insignia-art-cycle').isVisible(),false,'badges dev ART button');
  assert.equal(await p.locator('.hangar-screen').getAttribute('data-m12-insignia-art'),'on');
  for(const name of ['field','vector','ace','command']){
   const el=p.locator('button[data-emblem-id="mark.'+name+'"]');
   assert.equal(await el.isDisabled(),name!=='field','Unlock eligibility drift '+name);
   const image=await el.locator('.emblem-symbol').evaluate(x=>getComputedStyle(x).backgroundImage);
   assert.ok(image.includes('insignia-'+name+'-study-v1.svg'),'missing badge '+name);
  }
  await p.screenshot({path:dir+'/insignia-'+w+'x'+h+'.png',animations:'disabled'});
  await p.locator('[data-action="hangar-back"]').click();
  await p.locator('#menu button[data-action="dossier"]').click();
  assert.equal(await p.locator('.dossier-screen').getAttribute('data-m13-preview'),'on');
  assert.equal(await p.locator('#dossier-emblem-mark').getAttribute('data-m13-emblem'),'field');
  const art=await p.locator('#dossier-emblem-mark').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.ok(art.includes('insignia-field-study-v1.svg'),'M13 Dossier art not promoted');
  await p.screenshot({path:dir+'/dossier-'+w+'x'+h+'.png',animations:'disabled'});
  assert.deepEqual(await getStorage(p),original,'M13 menu views changed storage '+w+'x'+h);
  rows.push({viewport:w+'x'+h,modeCards:4,badges:4,hangar:'warm',savesUnchanged:true});
  await c.close();
 }
 // The equipped Dossier insignia follows actual earned and saved identity.
 const c=await browser.newContext({viewport:{width:915,height:412}}),p=await c.newPage();
 p.on('pageerror',e=>errs.push('earned '+e.message));
 await p.goto(origin+'/?m13Preview=1',{waitUntil:'load'});
 await p.evaluate(()=>{
  localStorage.setItem('rr-hangar-paint-v1',JSON.stringify({version:1,equipped:'fieldgrid.moss',emblem:'mark.vector'}));
  localStorage.setItem('rr-dossier-v1',JSON.stringify({schemaVersion:1,matches:4,wins:1,losses:3,draws:0,kos:2,deaths:3,seconds:200,
   byMode:{survival_ffa:{matches:4,wins:1,losses:3,draws:0,kos:2,deaths:3,seconds:200}},recentKeys:[]}));
 });
 await p.reload({waitUntil:'load'});
 await p.locator('#menu button[data-action="dossier"]').click();
 assert.equal(await p.locator('#dossier-emblem-mark').getAttribute('data-m13-emblem'),'vector');
 const vectorBg=await p.locator('#dossier-emblem-mark').evaluate(el=>getComputedStyle(el).backgroundImage);
 assert.ok(vectorBg.includes('insignia-vector-study-v1.svg'));
 assert.equal((await p.locator('#dossier-matches').textContent()).trim(),'4');
 await c.close();
 const c2=await browser.newContext({viewport:{width:740,height:360}}),normal=await c2.newPage(),requests=[];
 normal.on('request',r=>{if(r.url().includes('/assets/m12/'))requests.push(r.url())});
 await normal.goto(origin+'/',{waitUntil:'load'});
 await normal.locator('#menu button[data-action="dossier"]').click();
 assert.equal(await normal.locator('.dossier-screen').getAttribute('data-m13-preview'),null);
 await normal.locator('[data-action="dossier-back"]').click();
 await normal.locator('#menu button[data-action="modes"]').click();
 assert.equal(await normal.locator('.mode-screen').getAttribute('data-m12-mode-art'),null);
 await normal.locator('[data-action="modes-back"]').click();
 await normal.locator('#menu button[data-action="hangar"]').click();
 assert.equal(await normal.locator('.hangar-bay').getAttribute('data-m12-art'),null);
 await normal.locator('[data-hangar-tab="insignia"]').click();
 assert.equal(await normal.locator('.hangar-screen').getAttribute('data-m12-insignia-art'),null);
 assert.deepEqual(requests,[],'canonical game fetched visual preview assets');
 await c2.close();
 assert.deepEqual(errs,[]);assert.deepEqual(bad,[]);assert.deepEqual(remote,[]);
 fs.writeFileSync(dir+'/report.json',JSON.stringify({result:'PASS',program:'M13-A',
  normalAppArtUnchanged:true,savesUntouched:true,deviceCheck:'CHROMIUM_NOT_PHYSICAL_ANDROID',rows},null,2)+'\n');
 console.log('M13_PREVIEW_ART_QA_PASS '+JSON.stringify({viewports:rows.map(r=>r.viewport),
  DossierRealEquipped:true,defaultGameUntouched:true,saveWrites:0}));
}finally{await browser.close();await new Promise(done=>server.close(done))}
