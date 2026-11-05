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
 'assets/m12/hangar-warm-empty-v1.svg','assets/m12/hangar-blueprint-empty-v1.svg',
 'assets/m12/mode-cqc-study-v1.svg','assets/m12/mode-ffa-study-v1.svg','assets/m12/mode-tdm-study-v1.svg','assets/m12/mode-custom-study-v1.svg','assets/m12/mode-ctf-study-v1.svg','assets/m12/mode-forward-bays-study-v1.svg',
 'assets/m12/insignia-field-study-v1.svg','assets/m12/insignia-vector-study-v1.svg',
 'assets/m12/insignia-ace-study-v1.svg','assets/m12/insignia-command-study-v1.svg']);
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
const rows=[],modeRows=[];
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
   assert.ok(info.back.x>=-1&&info.back.right<=w+1&&info.back.bottom<=h+1,'Back button clipped '+w+'x'+h+' '+JSON.stringify(info));
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
  const badgeToggle=page.locator('.m12-insignia-art-cycle');
  assert.equal(await badgeToggle.isVisible(),true,'badge study toggle visible on M12 only');
  assert.equal(await page.locator('.hangar-screen').getAttribute('data-m12-insignia-art'),'on');
  const bounds=await badgeToggle.evaluate(el=>{
   const p=el.getBoundingClientRect(),h=el.closest('.m12-insignia-head').getBoundingClientRect();
   return {x:p.x,right:p.right,height:p.height,headerLeft:h.left,headerRight:h.right};
  });
  assert.ok(bounds.height>=44&&bounds.x>=0&&bounds.right<=w+1&&bounds.x>=bounds.headerLeft&&bounds.right<=bounds.headerRight+1,
   'badge study toggle outside phone/header '+w+'x'+h+' '+JSON.stringify(bounds));
  for(const n of ['field','vector','ace','command']){
   const item=page.locator('.emblem-grid [data-emblem-id="mark.'+n+'"]');
   const image=await item.locator('.emblem-symbol').evaluate(el=>getComputedStyle(el).backgroundImage);
   const badgeRead=await item.evaluate(el=>{
    const r=el.getBoundingClientRect(),name=el.querySelector('strong').getBoundingClientRect(),
     small=el.querySelector('small').getBoundingClientRect(),s=getComputedStyle(el);
    return {card:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},
     title:{x:name.x,right:name.right},caption:{x:small.x,right:small.right},
     opacity:Number(s.opacity),overflow:el.scrollWidth-el.clientWidth};
   });
   assert.ok(badgeRead.title.x>=badgeRead.card.x-1&&badgeRead.title.right<=badgeRead.card.right+1,
    'Insignia title clipped '+n+' '+w+'x'+h+' '+JSON.stringify(badgeRead));
   assert.ok(badgeRead.caption.x>=badgeRead.card.x-1&&badgeRead.caption.right<=badgeRead.card.right+1,
    'Insignia caption clipped '+n+' '+w+'x'+h+' '+JSON.stringify(badgeRead));
   assert.ok(badgeRead.overflow<=2,'Insignia card overflow '+n+' '+w+'x'+h);
   if(n!=='field')assert.ok(badgeRead.opacity>=.70&&badgeRead.opacity<.9,
     'Locked badge study must remain legible and visibly unavailable');
   assert.ok(image.includes('insignia-'+n+'-study-v1.svg'),'study badge missing '+n);
   assert.equal(await item.isDisabled(),n!=='field','existing unlock requirements changed '+n);
   const loaded=await imageLoad(page,'insignia-'+n+'-study-v1.svg');
   assert.ok(loaded.ok&&loaded.type.includes('svg')&&loaded.length>100,'offline badge missing '+n);
  }
  assert.equal(await page.locator('.insignia-detail-mark').getAttribute('data-study-emblem'),'field');
  await page.screenshot({path:out+'/insignia-study-'+w+'x'+h+'.png',animations:'disabled'});
  const badgesBefore=await page.evaluate(()=>{const pairs=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);pairs.push([k,localStorage.getItem(k)]);}return pairs.sort((a,b)=>a[0].localeCompare(b[0]));});
  await badgeToggle.click();
  assert.equal(await badgeToggle.getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('.hangar-screen').getAttribute('data-m12-insignia-art'),'off');
  for(const n of ['field','vector','ace','command']){
   const image=await page.locator('.emblem-grid [data-emblem-id="mark.'+n+'"] .emblem-symbol')
    .evaluate(el=>getComputedStyle(el).backgroundImage);
   assert.ok(!image.includes('/insignia-'),'original SVG should be visible '+n);
  }
  await page.screenshot({path:out+'/insignia-original-'+w+'x'+h+'.png',animations:'disabled'});
  await badgeToggle.click();
  assert.equal(await badgeToggle.getAttribute('aria-pressed'),'true');
  assert.deepEqual(await page.evaluate(()=>{const pairs=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);pairs.push([k,localStorage.getItem(k)]);}return pairs.sort((a,b)=>a[0].localeCompare(b[0]));}),badgesBefore,
   'Badge art switching cannot alter saved local data');
  assert.equal(await page.locator('#insignia-detail-name').textContent(),'FIELD','equipped mark changed');

  // M12-E: real Mode Select. Decorative cards must not change controls or navigation.
  await page.locator('.hangar-screen [data-action="hangar-back"]').click();
  await page.locator('#menu button[data-action="modes"]').click();
  assert.equal(await page.locator('.mode-screen').getAttribute('data-m12-mode-art'),'on');
  const compare=page.locator('.m12-mode-art-cycle');
  assert.equal(await compare.isVisible(),true,'M12-only Mode Select compare is visible');
  const controls=await page.evaluate(()=>{
   const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();
    return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
   return {compare:rect('.m12-mode-art-cycle'),back:rect('.mode-head [data-action="modes-back"]'),
    preview:rect('.mode-vehicle-preview'),header:rect('.mode-head')};
  });
  assert.ok(controls.compare.height>=44,'M12 mode compare button touch target');
  assert.ok(controls.compare.x>=0&&controls.compare.right<=w&&controls.compare.bottom<=h,
   'compare button outside screen '+w+'x'+h+' '+JSON.stringify(controls));
  assert.ok(controls.compare.right<=controls.back.x+1&&controls.preview.right<=controls.compare.x+1,
   'mode compare overlaps Back or real vehicle preview '+w+'x'+h+' '+JSON.stringify(controls));
  const modesBefore=await page.evaluate(()=>{const pairs=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);pairs.push([k,localStorage.getItem(k)]);}return pairs.sort((a,b)=>a[0].localeCompare(b[0]));});
  await compare.click();
  assert.equal(await page.locator('.mode-screen').getAttribute('data-m12-mode-art'),'off');
  assert.equal(await compare.getAttribute('aria-pressed'),'false');
  for(const action of ['cqc','scored_ffa','scored_tdm','custom']){
   const css=await page.locator('.mode-grid [data-action="'+action+'"]')
    .evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
   assert.equal(css,'none','original mode must not show any art');
  }
  await page.screenshot({path:out+'/mode-original-'+w+'x'+h+'.png',animations:'disabled'});
  await compare.click();
  assert.equal(await page.locator('.mode-screen').getAttribute('data-m12-mode-art'),'on');
  assert.equal(await compare.getAttribute('aria-pressed'),'true');
  assert.deepEqual(await page.evaluate(()=>{const pairs=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);pairs.push([k,localStorage.getItem(k)]);}return pairs.sort((a,b)=>a[0].localeCompare(b[0]));}),modesBefore,
   'Mode art switching cannot alter saved local data');
  for(const [action,art] of [['cqc','cqc'],['scored_ffa','ffa'],['scored_tdm','tdm'],['custom','custom']]){
   const card=page.locator('.mode-grid button[data-action="'+action+'"]');
   assert.equal(await card.isVisible(),true,'mode button visible '+action);
   const geometry=await card.evaluate(el=>{
    const r=el.getBoundingClientRect(),art=getComputedStyle(el,'::before');
    const name=el.querySelector('.mode-copy strong').getBoundingClientRect();
    return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height,
     image:art.backgroundImage,pointer:art.pointerEvents,illustrationWidth:parseFloat(art.width),
     titleX:name.x,titleRight:name.right,background:getComputedStyle(el).backgroundImage};
   });
   assert.ok(geometry.x>=-1&&geometry.right<=w+1&&geometry.y>=-1&&geometry.bottom<=h+1,
    'mode clipped '+w+'x'+h+' '+action+' '+JSON.stringify(geometry));
   assert.ok(geometry.height>=40,'touch height must remain usable');
   assert.ok(geometry.image.includes('mode-'+art+'-study-v1.svg'),'missing art for '+action);
   assert.equal(geometry.pointer,'none','mode art cannot intercept touches');
   assert.ok(geometry.illustrationWidth>=70,
    'Mode illustration too small to identify at '+w+'x'+h+' '+action);
   assert.ok(geometry.titleX>=geometry.x-1&&geometry.titleRight<=geometry.right+1,
    'Mode title clipped by art/layout at '+w+'x'+h+' '+action);
   assert.ok(geometry.background.includes('linear-gradient'),
    'M12-G coherent dark steel frame missing '+action);
   modeRows.push({viewport:w+'x'+h,action,art,geometry});
  }
  for(const name of ['cqc','ffa','tdm','custom','ctf','forward-bays']){
   const asset=await imageLoad(page,'mode-'+name+'-study-v1.svg');
   assert.ok(asset.ok&&asset.type.includes('svg')&&asset.length>800,'missing local study '+name);
  }
  await page.screenshot({path:out+'/mode-study-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.bay-exercise-fold summary').click();
  for(const [action,art] of [['forwardbay','forward-bays'],['ctf','ctf']]){
   const card=page.locator('.bay-exercise-launch[data-action="'+action+'"]');
   assert.equal(await card.isVisible(),true,'exercise visible '+action);
   const artCss=await card.evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
   assert.ok(artCss.includes('mode-'+art+'-study-v1.svg'),'wrong exercise art '+action);
  }
  await page.screenshot({path:out+'/mode-exercises-'+w+'x'+h+'.png',animations:'disabled'});
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
 await page.locator('#menu button[data-hangar-tab="insignia"]').click();
 assert.equal(await page.locator('.m12-insignia-art-cycle').isVisible(),false,'no badge study control in normal app');
 assert.equal(await page.locator('.hangar-screen').getAttribute('data-m12-insignia-art'),null,
  'default game cannot enable badge study');
 assert.deepEqual(defaultArtRequests,[],'normal Hangar must load no M12 texture bytes');
 await page.screenshot({path:out+'/hangar-original-default-740x360.png',animations:'disabled'});
 await page.locator('.hangar-screen [data-action="hangar-back"]').click();
 await page.locator('#menu button[data-action="modes"]').click();
 assert.equal(await page.locator('.mode-screen').getAttribute('data-m12-mode-art'),null,'no study on default modes');
 assert.equal(await page.locator('.m12-mode-art-cycle').isVisible(),false,'no M12 button on normal launch');
 for(const action of ['cqc','scored_ffa','scored_tdm','custom']){
  const style=await page.locator('.mode-grid [data-action="'+action+'"]').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
  assert.equal(style,'none','default mode is not decorated by M12');
 }
 await page.locator('.bay-exercise-fold summary').click();
 assert.deepEqual(defaultArtRequests,[],'normal mode/exercise screens must fetch no study images');
 await context.close();
 // Explicit ?m12Art=original is the isolated preview app's opt-in baseline.
 // Unlike the former M12-E, original mode must not prefetch any mode textures.
 const originContext=await browser.newContext({viewport:{width:740,height:360}});
 const originalPage=await originContext.newPage(),originalRequests=[];
 originalPage.on('request',r=>{if(r.url().includes('/assets/m12/'))originalRequests.push(r.url());});
 originalPage.on('pageerror',e=>problems.push('original-URL: '+e.message));
 await originalPage.goto(origin+'/?m12Art=original',{waitUntil:'load'});
 await originalPage.locator('#menu button[data-action="modes"]').click();
 assert.equal(await originalPage.locator('.mode-screen').getAttribute('data-m12-mode-art'),'off');
 const originalCompare=originalPage.locator('.m12-mode-art-cycle');
 assert.equal(await originalCompare.isVisible(),true);
 assert.ok((await originalCompare.textContent()).includes('ORIGINAL'));
 assert.deepEqual(originalRequests,[],'original opt-in state must not fetch any M12 images');
 await originalPage.screenshot({path:out+'/mode-original-initial-740x360.png',animations:'disabled'});
 await originalCompare.click();
 assert.equal(await originalPage.locator('.mode-screen').getAttribute('data-m12-mode-art'),'on');
 const afterToggle=await originalPage.locator('.mode-cqc').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
 assert.ok(afterToggle.includes('mode-cqc-study-v1.svg'),'original->study compare did not enable art');
 await originContext.close();
 assert.equal(rows.length,15);assert.equal(modeRows.length,20);
 assert.deepEqual(problems,[],'no game JavaScript errors');
 assert.deepEqual(missing,[],'all game and visual assets available locally');
 assert.deepEqual(remote,[],'no external network calls');
 const report={result:'PASS',source:'REAL_CHROMIUM_GAME_UI_NOT_PHYSICAL_ANDROID',visualCohesionStage:'M12-G',
  cases:rows.length,defaultUnchanged:true,independentStudyVariants:['warm','blueprint','original'],
  modeCases:modeRows.length,sizes:dimensions.map(x=>x.join('x')),screenshots:rows.length+1+dimensions.length*5+1,originalModeNoPrefetch:true,insigniaVariants:['study','original'],rows,modeRows};
 fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
 console.log('M12_VISUAL_HANGAR_QA_PASS '+JSON.stringify({cases:rows.length,defaultUnchanged:true,
  visualAssetsLoaded:true,modeCases:modeRows.length,originalUnitsPreserved:true,viewports:report.sizes}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
