// M12-C actual app visual comparisons. Never load images from CDN or touch owner save data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium is mandatory; do not skip visual QA');
const root=path.resolve('web'),problems=[],remote=[],missing=[];
const allowed=new Set(['index.html','style.css','game.js','dossier.js','save-backup.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js',
 'assets/m12/hangar-warm-empty-v1.svg','assets/m12/hangar-blueprint-empty-v1.svg']);
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1/').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html',
  'Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const out='qa-results/m12/visual';fs.mkdirSync(out,{recursive:true});
const rows=[];
const dimensions=[[568,320],[640,360],[740,360],[915,412],[1280,720]];
const imageLoad=async(page,name)=>await page.evaluate(async filename=>{
 const response=await fetch('assets/m12/'+filename,{cache:'no-store'});
 return {ok:response.ok,type:response.headers.get('content-type'),length:(await response.text()).length};
},name);
const box=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom}};
try{
 for(const [w,h] of dimensions){
  const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>problems.push(w+'x'+h+': '+e.message));
  page.on('request',r=>{if(!r.url().startsWith(origin))remote.push(r.url());});
  await page.goto(origin+'/?m12Art=warm',{waitUntil:'load'});
  await page.locator('#menu button[data-action="hangar"]').click();
  const btn=page.locator('#menu button[data-action="m12-art-next"]');
  assert.equal(await btn.isVisible(),true,'QA-only stage control visible '+w+'x'+h);
  const initial=await page.locator('.hangar-bay').getAttribute('data-m12-art');
  assert.equal(initial,'warm');
  for(const [variant,unit] of [['warm','tank'],['blueprint','mech'],['original','tank']]){
   assert.equal(await page.locator('.hangar-bay').getAttribute('data-m12-art'),variant);
   if(unit==='mech')await page.locator('#menu button[data-action="hangar-preview-unit"]').click();
   else if(await page.locator('#hangar-unit-preview').getAttribute('data-unit')==='mech')
    await page.locator('#menu button[data-action="hangar-preview-unit"]').click();
   assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-unit'),unit);
   const info=await page.evaluate(()=>{
    const stage=document.querySelector('.hangar-bay'),art=stage.querySelector('.m12-art-plate'),
     canvas=document.getElementById('hangar-unit-preview'),control=document.querySelector('.m12-art-cycle'),
     back=document.querySelector('.hangar-screen [data-action="hangar-back"]'),
     toggle=document.querySelector('.hangar-unit-toggle');
    const p=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    let pixels=0;for(let i=3;i<p.length;i+=4)if(p[i]>0)pixels++;
    const b=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
    return {variant:stage.dataset.m12Art,background:getComputedStyle(art).backgroundImage,
      imageDisplay:getComputedStyle(art).display,control:b(control),back:b(back),toggle:b(toggle),stage:b(stage),
      canvas:b(canvas),canvasPaint:canvas.dataset.paintId,canvasPixels:canvas.width*canvas.height,visiblePixels:pixels,
      artPointer:getComputedStyle(art).pointerEvents};
   });
   assert.ok(info.visiblePixels>150,'real '+unit+' render must stay present');
   assert.ok(info.stage.x>=-1&&info.stage.right<=w+1&&info.stage.bottom<=h+1,'stage out of viewport');
   assert.ok(info.control.x>=-1&&info.control.right<=w+1&&info.control.bottom<=h+1,'compare button clipped');
   assert.ok(info.back.x>=-1&&info.back.right<=w+1&&info.back.bottom<=h+1,'Back button clipped');
   assert.ok(info.control.right<=info.back.x+1 || info.back.right<=info.control.x+1,
      'compare control overlaps Back at '+w+'x'+h);
   assert.ok(info.control.h>=42,'button must be touchable');
   assert.equal(info.artPointer,'none','art never steals touches');
   if(variant==='original'){assert.equal(info.imageDisplay,'none','original has no art texture');}
   else{
    assert.notEqual(info.imageDisplay,'none','art is visibly rendered');
    assert.ok(info.background.includes('hangar-'+variant+'-empty-v1.svg'),'wrong art file for '+variant);
    const loaded=await imageLoad(page,'hangar-'+variant+'-empty-v1.svg');
    assert.equal(loaded.ok,true);assert.ok(loaded.length>5000);
    assert.ok(loaded.type.includes('svg'));
   }
   await page.screenshot({path:out+'/hangar-'+variant+'-'+unit+'-'+w+'x'+h+'.png',animations:'disabled'});
   rows.push({viewport:w+'x'+h,variant,unit,visiblePixels:info.visiblePixels,stage:info.stage,compare:info.control,
     paint:info.canvasPaint,assetLoaded:variant!=='original'});
   if(variant!=='original')await btn.click();
  }
  // Return to first experimental stage. Existing cosmetic controls still work.
  await btn.click();
  assert.equal(await page.locator('.hangar-bay').getAttribute('data-m12-art'),'warm');
  await page.locator('#menu button[data-action="equip-paint"][data-paint-id="fieldgrid.moss"]').click();
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-paint-id'),'fieldgrid.moss',
    'real paint selection survives stage variants');
  await page.locator('#menu button[data-hangar-tab="insignia"]').click();
  assert.equal(await page.locator('#hangar-insignia').isVisible(),true,'insignias unchanged');
  await context.close();
 }
 // Default launch must never show experimental art or even fetch any art asset.
 const context=await browser.newContext({viewport:{width:740,height:360}});
 const page=await context.newPage(),defaultArtRequests=[];
 page.on('request',r=>{if(r.url().includes('/assets/m12/'))defaultArtRequests.push(r.url());});
 page.on('pageerror',e=>problems.push('default: '+e.message));
 await page.goto(origin+'/',{waitUntil:'load'});
 await page.locator('#menu button[data-action="hangar"]').click();
 assert.equal(await page.locator('.m12-art-cycle').isVisible(),false,'normal Hangar has no test controls');
 assert.equal(await page.locator('.hangar-bay').getAttribute('data-m12-art'),null,'no opt-in art on normal launch');
 assert.deepEqual(defaultArtRequests,[],'normal Hangar must load no M12 texture bytes');
 await page.screenshot({path:out+'/hangar-original-default-740x360.png',animations:'disabled'});
 await context.close();
 assert.equal(rows.length,15);
 assert.deepEqual(problems,[],'no game JavaScript errors');
 assert.deepEqual(missing,[],'all game and visual assets available locally');
 assert.deepEqual(remote,[],'no external network calls');
 const report={result:'PASS',source:'REAL_CHROMIUM_GAME_UI_NOT_PHYSICAL_ANDROID',
  cases:rows.length,defaultUnchanged:true,independentStudyVariants:['warm','blueprint','original'],
  sizes:dimensions.map(x=>x.join('x')),screenshots:rows.length+1,rows};
 fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
 console.log('M12_VISUAL_HANGAR_QA_PASS '+JSON.stringify({cases:rows.length,defaultUnchanged:true,
  visualAssetsLoaded:true,originalUnitsPreserved:true,viewports:report.sizes}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
