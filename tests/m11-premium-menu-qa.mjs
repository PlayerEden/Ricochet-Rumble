// M11-B premium composition QA, exercised against the actual game and its
// complete, offline-built Pixi menu decoration. No cloned/prototype UI.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium required');
const root=path.resolve('web'),issues=[],requests=[];
const graphicsSource=fs.readFileSync('hybrid-ui/src/menu.js','utf8');
assert.ok(!graphicsSource.includes('MBT // LIVE'),'fake mini-tank telemetry hologram must stay removed');
assert.ok(!graphicsSource.includes('function holoTexture('),'old duplicate tank drawing must not return');
const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js',
 'ctf-rules.js','ctf-ai.js','hybrid-menu-pixi.bundle.js']);
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html','Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const dir='qa-results/m11-premium';fs.mkdirSync(dir,{recursive:true});
const cases=[];
try{
 for(const [w,h] of [[568,320],[640,360],[740,360],[915,412],[1280,720]]){
  const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>issues.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith(origin))requests.push(req.url());});
  await page.goto(origin+'/?hybridMenu=1',{waitUntil:'load'});
  await page.waitForFunction(()=>window.__SRHybridMenu?.active&&window.__SRHybridMenu.frames>=4,null,{timeout:30000});
  const g=await page.evaluate(()=>{
   const q=s=>document.querySelector(s),rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
   const actions=q('.home-actions'),head=q('.home-topbar'),panel=q('#panel'),hero=q('.home-stage');
   const title=q('.premium-menu-title'),motto=q('.premium-menu-motto');
   const play=q('.home-deploy'),mode=q('.home-modes'),nav=[...document.querySelectorAll('.home-utilities button')];
   const grid=[...document.querySelectorAll('.home-action-grid button')];
   const visible=el=>{const st=getComputedStyle(el);const r=rect(el);return st.visibility!=='hidden'&&st.display!=='none'&&r.w>1&&r.h>1;};
   const hittest=el=>{const r=rect(el),hit=document.elementFromPoint(r.x+r.w/2,r.y+r.h/2);return hit?.closest('button')?.dataset.action||null;};
   return {panel:rect(panel),head:rect(head),hero:rect(hero),canvas:rect(q('#menu-preview')),pixi:rect(q('.hybrid-menu-pixi canvas')),gpuLabel:q('.home-stage-signal')?.textContent,actions:rect(actions),title:rect(title),motto:rect(motto),
    play:rect(play),mode:rect(mode),nav:nav.map(el=>({action:el.dataset.action,rect:rect(el),hit:hittest(el)})),
    grid:grid.map(el=>({action:el.dataset.action,rect:rect(el),hit:hittest(el)})),
    actionScroll:actions.scrollHeight-actions.clientHeight,screenScroll:panel.scrollHeight-panel.clientHeight,
    headline:visible(title),brand:document.querySelector('.premium-menu-title')?.textContent,
    playHit:hittest(play),modeHit:hittest(mode),engine:window.__SRHybridMenu.backend};
  });
  assert.equal(g.engine,'webgl');
  assert.equal(await page.locator('.home-stage-title').count(),0,
    'no bottom-right unit caption in premium main menu');
  assert.equal(await page.locator('#home-unit-name').count(),0,
    'no secondary ARMORED RESPONSE box or hidden anchor');
  assert.equal(await page.locator('#home-unit-type').count(),0,
    'no duplicated field-unit label');
  assert.equal(await page.locator('.home-stage').evaluate(el=>el.textContent.includes('ARMORED RESPONSE')),
    false,'main stage must contain no unwanted field-unit subtitle');
  assert.equal(g.headline,true,'title must be visible');
  assert.match(g.brand,/SECTOR\s+REBOUND/);
  assert.ok(g.title.h>=40&&g.motto.h>=8,'premium headline/tagline must be readable');
  assert.ok(g.head.bottom<=g.title.y+2,'menu title must stay beneath navigation');
  assert.ok(g.title.bottom<=g.play.y,'premium heading cannot cover Quick Play');
  assert.ok(g.panel.x>=-2&&g.panel.right<=w+2&&g.panel.y>=-2&&g.panel.bottom<=h+2,'no fullscreen panel clipping');
  assert.ok(g.hero.h>105,'full-height showroom canvas');
  assert.ok(g.canvas.x>=-1&&g.canvas.right<=w+1&&g.canvas.y>=-1&&g.canvas.bottom<=h+1,'Canvas art element must not extend beyond phone viewport');
  assert.ok(g.pixi.x>=-1&&g.pixi.right<=w+1&&g.pixi.y>=-1&&g.pixi.bottom<=h+1,'Pixi layer must be fully inside the phone viewport');
  assert.match(g.gpuLabel,/PIXI \/ WEBGL.*ACTIVE/,'live Pixi indicator must confirm the renderer used in the test APK');
  assert.ok(g.play.y>=0&&g.play.bottom<=h+1&&g.play.h>=43,'Quick Play must fit and remain thumb-sized');
  assert.equal(g.playHit,'solo','Quick Play center is clickable');
  assert.equal(g.modeHit,'modes','Choose Mode center is clickable');
  assert.ok(g.actionScroll<=3,'menu actions should not need scrolling at '+w+'x'+h+': '+g.actionScroll);
  assert.ok(g.screenScroll<=3,'home panel must not scroll at '+w+'x'+h+': '+g.screenScroll);
  for(const b of [...g.nav,...g.grid]){
   assert.ok(b.rect.x>=0&&b.rect.right<=w+2&&b.rect.y>=0&&b.rect.bottom<=h+2,
    b.action+' must fit viewport '+w+'x'+h);
   assert.equal(b.hit,b.action,'GPU stage must not steal '+b.action+' click');
   assert.ok(b.rect.h>=31,'button '+b.action+' too short');
  }
  await page.screenshot({path:dir+'/hybrid-premium-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#menu button[data-action="modes"]').click();
  assert.equal(await page.locator('.mode-screen').isVisible(),true,'current Choose Mode still works');
  const modeInfo=await page.evaluate(()=>{
   const p=document.querySelector('#panel'),screen=document.querySelector('.mode-screen');
   const r=screen.getBoundingClientRect(),q=p.getBoundingClientRect();
   return {cardCount:screen.querySelectorAll('.mode-grid button').length,
    backPosition:getComputedStyle(screen.querySelector('.mode-back')).position,
    panelBounds:{x:q.x,right:q.right,top:q.top,bottom:q.bottom},
    screenWidth:r.width,scrollable:p.scrollHeight>p.clientHeight+3};
  });
  assert.equal(modeInfo.cardCount,4,'all four actual modes stay present');
  assert.equal(modeInfo.backPosition,'static','Back must not cover experimental modes during scrolling');
  assert.ok(modeInfo.panelBounds.x>=-1&&modeInfo.panelBounds.right<=w+1,'mode selection must not clip screen width');
  await page.screenshot({path:dir+'/mode-quality-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#menu button[data-action="modes-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  const reloaded=await page.evaluate(()=>({active:window.__SRHybridMenu.active,mounts:window.__SRHybridMenu.mounts}));
  assert.ok(reloaded.active&&reloaded.mounts>=2,'GPU re-created after returning home');
  if(w===568||w===740||w===915){
   await page.locator('#menu button[data-action="solo"]').click();
   await page.waitForFunction(()=>document.querySelector('#menu')?.classList.contains('hidden'),null,{timeout:15000});
   await page.locator('#menu-button').click();
   await page.waitForFunction(()=>!!document.querySelector('.pause-actions'),null,{timeout:15000});
   const pauseDetails=await page.evaluate(()=>{
    const x=document.querySelector('#panel').getBoundingClientRect();
    const y=document.querySelector('.pause-actions').getBoundingClientRect();
    return {bounds:{x:x.x,right:x.right,top:x.top,bottom:x.bottom},actions:{top:y.top,bottom:y.bottom},
     labels:[...document.querySelectorAll('.pause-actions button')].map(b=>b.textContent.trim())};
   });
   assert.ok(pauseDetails.bounds.x>=0&&pauseDetails.bounds.right<=w+1&&pauseDetails.bounds.bottom<=h+1,
    'pause screen must fit the viewport at '+w+'x'+h);
   assert.ok(pauseDetails.labels.includes('RESUME MATCH')&&pauseDetails.labels.includes('MAIN MENU'),
    'existing pause actions must remain');
   await page.screenshot({path:dir+'/pause-quality-'+w+'x'+h+'.png',animations:'disabled'});
   await page.locator('#menu button[data-action="resume"]').click();
   await page.waitForFunction(()=>document.querySelector('#menu')?.classList.contains('hidden'),null,{timeout:15000});
  }
  await context.close();
  cases.push({viewport:w+'x'+h,primaryHeight:Math.round(g.play.h),headingHeight:Math.round(g.title.h),
   menuWithoutScroll:true,allControlsClickable:true,pixiWebgl:true});
 }
 // Main-user default starts in Canvas mode yet MUST retain the same premium
 // HTML/CSS composition without fetching PixiJS or a CDN.
 const fallback=await browser.newPage({viewport:{width:740,height:360}});
 await fallback.goto(origin+'/',{waitUntil:'load'});
 assert.equal(await fallback.locator('.premium-menu-title').isVisible(),true,'premium menu cannot require WebGL');
 assert.equal(await fallback.locator('.hybrid-menu-pixi canvas').count(),0);
 await fallback.screenshot({path:dir+'/canvas-fallback-premium-740x360.png',animations:'disabled'});
 await fallback.close();
 assert.deepEqual(issues,[],'no JS exceptions');
 assert.deepEqual(requests,[],'no CDN or remote fetch');
 const result={status:'PASS',cases,canvasFallback:'PASS',realGame:true,noMenuActionChanges:true};
 fs.writeFileSync(dir+'/report.json',JSON.stringify(result,null,2)+'\n');
 console.log('M11_PREMIUM_MENU_QA_PASS '+JSON.stringify(result));
}finally{await browser.close();await new Promise(done=>server.close(done));}
