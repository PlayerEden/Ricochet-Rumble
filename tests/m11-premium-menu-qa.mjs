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
  // UIV2-E: the real Hangar must show equipped paint on the actual tank art,
  // preserve all paint/insignia unlocks, and work even on 568x320 landscape.
  await page.locator('#menu button[data-action="hangar"]').click();
  assert.equal(await page.locator('.hangar-screen').isVisible(),true,'Hangar opens');
  const hangar=await page.evaluate(()=>{
   const preview=document.querySelector('#hangar-unit-preview');
   const p=document.querySelector('#panel').getBoundingClientRect();
   const h=document.querySelector('.hangar-bay').getBoundingClientRect();
   const b=preview.getContext('2d');
   const data=b.getImageData(0,0,preview.width,preview.height).data;
   let visiblePixels=0;
   for(let i=0;i<data.length;i+=80)if(data[i+3]>0)visiblePixels++;
   return {paint:preview.dataset.paintId,visiblePixels,previewWidth:preview.width,
    panel:{x:p.x,right:p.right,y:p.y,bottom:p.bottom},
    hero:{x:h.x,right:h.right,y:h.y,bottom:h.bottom}};
  });
  assert.equal(hangar.paint,'fieldgrid.standard','Hangar preview starts with equipped paint');
  assert.ok(hangar.visiblePixels>150,'Hangar must render actual tank image, not empty panel');
  assert.ok(hangar.previewWidth>=120,'Hangar canvas has readable pixel dimensions');
  assert.ok(hangar.panel.x>=0&&hangar.panel.right<=w+1&&hangar.panel.bottom<=h+1);
  assert.ok(hangar.hero.x>=0&&hangar.hero.right<=w+1&&hangar.hero.bottom<=h+1);
  await page.screenshot({path:dir+'/hangar-quality-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#menu button[data-action="equip-paint"][data-paint-id="fieldgrid.moss"]').click();
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-paint-id'),'fieldgrid.moss',
   'Paint selection updates real vehicle preview with existing saved paint');
  assert.match(await page.locator('#hangar-status').textContent(),/MOSS/);
  await page.locator('#menu button[data-hangar-tab="insignia"]').click();
  assert.equal(await page.locator('#hangar-insignia').isVisible(),true,'original insignia unlocks available');
  await page.locator('#menu button[data-action="hangar-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  // UIV2-F: keep backup and Hangar utilities fully visible in the Dossier,
  // not clipped below the modal as they were in the owner's screenshots.
  await page.locator('#menu button[data-action="dossier"]').click();
  assert.equal(await page.locator('.dossier-screen').isVisible(),true,'Dossier opens');
  const dossier=await page.evaluate(()=>{
   const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height}};
   const btns=[...document.querySelectorAll('.dossier-backup-actions button')];
   return {panel:rect(document.querySelector('#panel')),
    workspace:rect(document.querySelector('.dossier-workspace')),
    footer:rect(document.querySelector('.dossier-footer')),
    buttons:btns.map(el=>{const r=rect(el),hit=document.elementFromPoint((r.x+r.right)/2,(r.y+r.bottom)/2);
     return {name:el.dataset.action,rect:r,hit:hit?.closest('button')?.dataset.action||null};}),
    modeRows:document.querySelectorAll('.dossier-mode').length};
  });
  assert.equal(dossier.modeRows,5,'five mode record entries retained');
  assert.ok(dossier.footer.bottom<=h+1&&dossier.footer.y>=0,'Dossier footer visible on phone');
  assert.ok(dossier.workspace.bottom<=dossier.footer.y+2,'Dossier stats cannot overlap footer');
  for(const item of dossier.buttons){
   assert.ok(item.rect.x>=0&&item.rect.right<=w+1&&item.rect.bottom<=h+1,
    'Dossier action clipped: '+item.name+' at '+w+'x'+h+' '+JSON.stringify({item,dossier}));
   assert.equal(item.hit,item.name,'Dossier action must remain tappable: '+item.name);
   assert.ok(item.rect.height>=31,'Dossier action thumb target too small');
  }
  await page.screenshot({path:dir+'/dossier-quality-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#menu button[data-action="backup"]').click();
  assert.equal(await page.locator('.backup-screen').isVisible(),true,'Dossier backup still opens');
  await page.locator('#menu button[data-action="backup-back"]').click();
  await page.locator('#menu button[data-action="dossier-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  await page.locator('#menu button[data-action="modes"]').click();
  assert.equal(await page.locator('.mode-screen').isVisible(),true,'current Choose Mode still works');
  const modeInfo=await page.evaluate(()=>{
   const p=document.querySelector('#panel'),screen=document.querySelector('.mode-screen');
   const r=screen.getBoundingClientRect(),q=p.getBoundingClientRect();
   const cards=[...screen.querySelectorAll('.mode-grid button')].map(el=>{
    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {action:el.dataset.action,accent:getComputedStyle(el).getPropertyValue('--sr-mission-accent').trim(),
      width:r.width,height:r.height,hit:hit?.closest('button')?.dataset.action};
   });
   return {cardCount:cards.length,cards,
    backPosition:getComputedStyle(screen.querySelector('.mode-back')).position,
    panelBounds:{x:q.x,right:q.right,top:q.top,bottom:q.bottom},
    screenWidth:r.width,scrollable:p.scrollHeight>p.clientHeight+3};
  });
  assert.equal(modeInfo.cardCount,4,'all four actual modes stay present');
  assert.deepEqual(modeInfo.cards.map(c=>c.action),['cqc','scored_ffa','scored_tdm','custom'],
    'existing game mode IDs and launch order remain unchanged');
  assert.equal(new Set(modeInfo.cards.map(c=>c.accent)).size,4,
    'core modes must have four distinct, intentional visual accents');
  assert.ok(modeInfo.cards.every(c=>c.width>=80&&c.height>=44&&c.hit===c.action),
    'core mode buttons retain tappable sizes and actual hit targets at '+w+'x'+h);
  assert.equal(modeInfo.backPosition,'static','Back must not cover experimental modes during scrolling');
  assert.ok(modeInfo.panelBounds.x>=-1&&modeInfo.panelBounds.right<=w+1,'mode selection must not clip screen width');
  await page.screenshot({path:dir+'/mode-quality-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#menu button[data-action="modes-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  await page.locator('#menu button[data-action="settings"]').click();
  assert.equal(await page.locator('.mission-setup-screen').isVisible(),true,
    'Mission Setup opens from the original Settings action');
  assert.equal(await page.locator('.mission-module').count(),2,'field and control modules are both rendered');
  assert.equal(await page.locator('.mission-rules').count(),1,'existing advanced rules remain expandable');
  const missionLayout=await page.evaluate(()=>{
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
    const panel=document.querySelector('#panel'),head=panel.querySelector('.mission-setup-head'),
      body=panel.querySelector('.mission-setup-body'),footer=panel.querySelector('.mission-setup-actions');
    const actions=[...footer.querySelectorAll('button')].map(el=>{
      const r=rect(el),hit=document.elementFromPoint((r.x+r.right)/2,(r.y+r.bottom)/2);
      return {action:el.dataset.action,rect:r,hit:hit?.closest('button')?.dataset.action};
    });
    return {panel:rect(panel),head:rect(head),body:rect(body),footer:rect(footer),
      actions,bodyScroll:body.scrollHeight-body.clientHeight,
      fields:[...panel.querySelectorAll('#map-size,#bot-count')].map(el=>rect(el)),
      prefCount:panel.querySelectorAll('input[id^="pref-"]').length,
      playlistCount:panel.querySelectorAll('input[data-playlist-mode]').length};
  });
  assert.ok(missionLayout.panel.x>=-1&&missionLayout.panel.right<=w+1&&
    missionLayout.panel.y>=-1&&missionLayout.panel.bottom<=h+1,
    'Mission Setup must remain inside the phone viewport at '+w+'x'+h);
  assert.ok(missionLayout.head.bottom<=missionLayout.body.y+1&&
    missionLayout.body.bottom<=missionLayout.footer.y+1&&
    missionLayout.footer.bottom<=h+1,
    'scrollable setup content must not overlap the visible header or deploy footer');
  assert.equal(missionLayout.prefCount,8,'all original comfort preferences are present');
  assert.equal(missionLayout.playlistCount,5,'all original Quick Play modes are present');
  assert.deepEqual(missionLayout.actions.map(a=>a.action),['settings-back','settings-play'],
    'original Settings actions remain intact');
  for(const item of missionLayout.actions){
    assert.ok(item.rect.h>=43&&item.rect.w>=90&&item.rect.y>=0&&item.rect.bottom<=h+1,
      'setup footer action is too small or clipped: '+item.action);
    assert.equal(item.hit,item.action,'setup footer action hit target is obstructed');
  }
  for(const control of missionLayout.fields){
    assert.ok(control.w>=90&&control.h>=43,'field selection must remain touch-sized');
  }
  await page.screenshot({path:dir+'/mission-setup-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#map-size').selectOption('large');
  await page.locator('#bot-count').selectOption('1');
  await page.locator('.mission-rules summary').click();
  assert.equal(await page.locator('#lives-choice').count(),1,'advanced survival rules preserved');
  assert.equal(await page.locator('#bullet-cap').count(),1,'tank shell cap preserved');
  assert.equal(await page.locator('#bot-skill').count(),1,'bot skill control preserved');
  await page.locator('#lives-choice').selectOption('3');
  await page.locator('#bot-skill').selectOption('spicy');
  await page.locator('input[data-playlist-mode="survival_ffa"]').uncheck();
  await page.locator('input[data-playlist-mode="survival_teams"]').uncheck();
  assert.equal(await page.locator('#menu button[data-action="settings-play"]').isDisabled(),true,
    'no modes selected must disable Start Match inside the redesigned briefing');
  await page.locator('input[data-playlist-mode="cqc"]').check();
  assert.equal(await page.locator('#menu button[data-action="settings-play"]').isDisabled(),false,
    'enabling one existing playlist mode must restore Start Match');
  assert.match(await page.locator('#playlist-status').textContent(),/1 SELECTED/);
  const shakeBefore=await page.locator('#pref-shake').isChecked();
  await page.locator('#pref-shake').setChecked(!shakeBefore);
  await page.locator('.mission-setup-body').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  const footerAfterScroll=await page.locator('.mission-setup-actions').evaluate(el=>{
    const b=el.getBoundingClientRect();
    return {top:b.top,bottom:b.bottom,viewport:innerHeight};
  });
  assert.ok(footerAfterScroll.top>=0&&footerAfterScroll.bottom<=h+1,
    'Start Match footer must remain in view after advancing to bottom of rules');
  await page.screenshot({path:dir+'/mission-advanced-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#menu button[data-action="settings-back"]').click();
  await page.locator('#menu button[data-action="settings"]').click();
  assert.equal(await page.locator('#map-size').inputValue(),'large',
    'field size survives navigating back into Mission Setup');
  assert.equal(await page.locator('#bot-count').inputValue(),'1',
    'bot count survives navigation');
  assert.equal(await page.locator('#pref-shake').isChecked(),!shakeBefore,
    'existing comfort preference persistence is unchanged');
  await page.locator('.mission-rules summary').click();
  assert.equal(await page.locator('#lives-choice').inputValue(),'3');
  assert.equal(await page.locator('#bot-skill').inputValue(),'spicy');
  assert.equal(await page.locator('input[data-playlist-mode="cqc"]').isChecked(),true,
    'opted-in mode remains saved after returning from Settings');
  await page.locator('#menu button[data-action="settings-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  // UIV2-D — visual-only Android LAN UX: fake the native bridge ONLY inside
  // this browser page; no network traffic or gameplay protocol is simulated.
  await page.evaluate(()=>{
    window.__lanUiCalls=[];
    window.AndroidBridge={
      stopNetwork(){window.__lanUiCalls.push(['stop']);},
      hostGame(){window.__lanUiCalls.push(['host']);},
      findGames(){window.__lanUiCalls.push(['find']);},
      joinGame(host,port){window.__lanUiCalls.push(['join',host,port]);}
    };
  });
  await page.locator('#menu button[data-action="nearby"]').click();
  assert.equal(await page.locator('.lan-entry').isVisible(),true,'Local Play entry is visible');
  const entry=await page.evaluate(()=>{
    const panel=document.querySelector('#panel'),main=panel.querySelector('.lan-entry-main'),
      buttons=[...panel.querySelectorAll('.lan-entry button[data-action]')];
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
    return {panel:rect(panel),main:rect(main),buttons:buttons.map(el=>{
      const r=rect(el),hit=document.elementFromPoint((r.x+r.right)/2,(r.y+r.bottom)/2);
      return {action:el.dataset.action,rect:r,hit:hit?.closest('button')?.dataset.action};
    })};
  });
  assert.deepEqual(entry.buttons.map(x=>x.action),['host','find','manual','help-back'],
    'Local Play exposes exact original host/find/manual/back actions');
  assert.ok(entry.panel.x>=-1&&entry.panel.right<=w+1&&entry.panel.y>=-1&&entry.panel.bottom<=h+1,
    'Local Play bounds stay within '+w+'x'+h);
  for(const item of entry.buttons){
    assert.ok(item.rect.h>=40&&item.rect.w>=80&&item.rect.x>=0&&item.rect.right<=w+1&&item.rect.bottom<=h+1,
      'Local Play action clipped: '+item.action+' at '+w+'x'+h);
    assert.equal(item.hit,item.action,'Local Play action must remain tappable');
  }
  await page.screenshot({path:dir+'/lan-entry-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.lan-entry button[data-action="host"]').click();
  assert.equal(await page.locator('.lan-lobby').isVisible(),true,'Host enters real LAN lobby');
  assert.equal(await page.locator('[data-lan-setting]').count(),9,'nine real LAN settings remain');
  const hostFooter=async()=>await page.locator('.lan-lobby-footer').evaluate(el=>{
    const r=el.getBoundingClientRect(),p=document.querySelector('#panel').getBoundingClientRect();
    return {top:r.top,bottom:r.bottom,panelBottom:p.bottom};
  });
  await page.locator('.lan-lobby-body').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  const footer=await hostFooter();
  assert.ok(footer.top>=0&&footer.bottom<=h+1&&footer.bottom<=footer.panelBottom+1,
    'host Ready/Start footer must remain visible after scrolling');
  assert.equal(await page.locator('[data-action="lan-start"]').count(),1,
    'real host Start Match action remains intact');
  assert.equal(await page.locator('[data-action="close"]').count(),1,
    'real Leave Match action remains intact');
  await page.screenshot({path:dir+'/lan-host-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('[data-lan-setting="teamMode"]').selectOption('tdm');
  assert.equal(await page.locator('[data-lan-setting="rounds"]').isVisible(),true,
    'TDM host match series selector remains accessible');
  await page.locator('.lan-lobby-actions button[data-action="close"]').click();
  await page.locator('#menu button[data-action="nearby"]').click();
  await page.locator('.lan-entry button[data-action="find"]').click();
  assert.equal(await page.locator('.lan-discover').isVisible(),true);
  await page.evaluate(()=>window.RR.nativeMessage(JSON.stringify({
    type:'found',host:'192.168.1.88',port:47321,name:'TEST ROOM'})));
  assert.equal(await page.locator('#rooms button').count(),1,
    'native-found room appears in original dynamic discovery list');
  await page.screenshot({path:dir+'/lan-discovery-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('#rooms button').click();
  assert.equal((await page.evaluate(()=>window.__lanUiCalls)).some(x=>x[0]==='join'&&x[1]==='192.168.1.88'&&x[2]===47321),true,
    'discovered room still dispatches host/port to native joinGame');
  await page.locator('.lan-discover button[data-action="manual"]').click();
  assert.equal(await page.locator('.lan-manual').isVisible(),true);
  const beforeInvalid=(await page.evaluate(()=>window.__lanUiCalls)).length;
  await page.locator('#lan-address').fill('invalid');
  await page.locator('.lan-manual button[data-action="ip-join"]').click();
  assert.equal((await page.evaluate(()=>window.__lanUiCalls)).length,beforeInvalid,
    'malformed IP:port cannot trigger native joinGame');
  await page.locator('#lan-address').fill('192.168.1.25:47321');
  await page.locator('.lan-manual button[data-action="ip-join"]').click();
  assert.equal((await page.evaluate(()=>window.__lanUiCalls)).some(x=>x[0]==='join'&&x[1]==='192.168.1.25'&&x[2]===47321),true,
    'valid manual address retains native join endpoint');
  await page.screenshot({path:dir+'/lan-manual-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.lan-manual button[data-action="close"]').click();
  await page.evaluate(()=>{delete window.AndroidBridge;});
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
