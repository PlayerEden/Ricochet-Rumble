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
  // M2: icons belong to genuine real-route buttons, not overlaid hit targets.
  const iconAudit=await page.evaluate(()=>{
    const icons=[...document.querySelectorAll('.home-utilities button .sr-ui-icon, .home-action-grid button .sr-ui-icon, .home-deploy .sr-ui-icon')];
    return icons.map(svg=>{
      const use=svg.querySelector('use');
      const href=use?.getAttribute('href')||'';
      return {href,pointer:getComputedStyle(svg).pointerEvents,
        parentAction:svg.closest('button')?.dataset.action||'',
        symbol:!!document.querySelector('symbol'+href)};
    });
  });
  assert.equal(iconAudit.length,7,'Home uses a consistent set of seven original icons');
  for(const item of iconAudit){
    assert.ok(item.symbol,'SVG icon resolves to a locally bundled symbol');
    assert.equal(item.pointer,'none','Icon must not intercept the real button hit area');
    assert.ok(item.parentAction,'Icon is attached to an actual navigation action');
  }

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
 // Mode identification is derived from real runtime rule fields, never from
 // which menu button the player last pressed. Exercise the tricky variants.
 const mapped=await page.evaluate(()=>{
  const details=(cfg,session='solo',scored=null)=>window.__SRModeHudTest({config:cfg,scored},session).code;
  return {
   ffa:details({matchModeId:'scored_ffa',teamMode:'ffa',botCount:3},'solo',null),
   tdm:details({matchModeId:'scored_tdm',teamMode:'teams',botCount:3}),
   cqc:details({matchModeId:'cqc',teamMode:'ffa',botCount:3}),
   ctf:details({matchModeId:'scored_tdm',teamMode:'teams',ctfExercise:true}),
   bays:details({matchModeId:'scored_tdm',teamMode:'teams',forwardBayExercise:true}),
   practice:details({matchModeId:'survival_ffa',teamMode:'ffa',botCount:0}),
   daily:details({matchModeId:'survival_ffa',teamMode:'ffa',dailySector:true}),
   survival:details({matchModeId:'survival_ffa',teamMode:'ffa',botCount:2}),
   teamSurvival:details({matchModeId:'survival_teams',teamMode:'teams',botCount:2}),
   custom:details({matchModeId:'scored_ffa',teamMode:'ffa',customMatch:true,botCount:2}),
   lanFfa:details({matchModeId:'survival_ffa',teamMode:'ffa',botCount:1},'host'),
   lanTdm:details({matchModeId:'scored_tdm',teamMode:'teams',botCount:2},'guest'),
   lanCoop:details({matchModeId:'survival_ffa',teamMode:'coop',botCount:2},'host')
  };
 });
 assert.deepEqual(mapped,{ffa:'FFA',tdm:'TDM',cqc:'CQC',ctf:'CTF',bays:'BAYS',practice:'PRACTICE',
  daily:'DAILY',survival:'S-FFA',teamSurvival:'S-TEAM',custom:'C:FFA',lanFfa:'LAN:S-FFA',
  lanTdm:'LAN:TDM',lanCoop:'LAN:CO-OP'});
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
  assert.equal((await page.locator('[data-paint-id="fieldgrid.standard"] small').textContent()).trim(),
    'FACTORY COLORS','factory cyan tank and gold mech are not a single cyan-only paint');
  assert.ok((await page.locator('[data-paint-id="fieldgrid.standard"]').getAttribute('aria-label')).includes('gold mech'));
  assert.ok(hangar.visiblePixels>150,'Hangar must render actual tank image, not empty panel');
  assert.ok(hangar.previewWidth>=120,'Hangar canvas has readable pixel dimensions');
  assert.ok(hangar.panel.x>=0&&hangar.panel.right<=w+1&&hangar.panel.bottom<=h+1);
  assert.ok(hangar.hero.x>=0&&hangar.hero.right<=w+1&&hangar.hero.bottom<=h+1);
  // M1: only the true equipped item receives a check, the active tab uses
  // an underline, and all dock staging stays invisible to the touch layer.
  const premiumHangar=await page.evaluate(()=>{
    const stage=document.querySelector('.hangar-bay'),
      selected=document.querySelector('.hangar-grid button.selected'),
      tab=document.querySelector('.hangar-tabs button[aria-selected="true"]'),
      foot=document.querySelector('.hangar-bay-foot');
    return {
      dockPointer:getComputedStyle(stage,'::after').pointerEvents,
      dockGraphic:getComputedStyle(stage,'::after').content,
      equippedChecks:document.querySelectorAll('.hangar-grid button.selected').length,
      equippedMark:selected?getComputedStyle(selected,'::after').content:'',
      tabCount:document.querySelectorAll('.hangar-tabs button[aria-selected="true"]').length,
      tabUnderline:tab?getComputedStyle(tab).borderBottomWidth:'',
      footer:foot?.textContent||''
    };
  });
  assert.equal(premiumHangar.dockPointer,'none','Decorative dock cannot steal touch');
  assert.notEqual(premiumHangar.dockGraphic,'none','Premium Hangar includes a procedural dock');
  assert.equal(premiumHangar.equippedChecks,1,'Exactly one paint is equipped');
  assert.ok(premiumHangar.equippedMark.includes('✓'),'Equipped paint receives one check');
  assert.equal(premiumHangar.tabCount,1,'Exactly one Hangar category is active');
  assert.ok(parseFloat(premiumHangar.tabUnderline)>=2,'Active tab uses underline');
  assert.match(premiumHangar.footer,/PREVIEW ONLY/,'Unit preview never claims a match selection');
  await page.screenshot({path:dir+'/hangar-quality-'+w+'x'+h+'.png',animations:'disabled'});
  // UIV3-J4: switch between actual tank and mech art without altering paint.
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-unit'),'tank');
  await page.locator('#menu button[data-action="hangar-preview-unit"]').click();
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-unit'),'mech',
    'Hangar must draw the actual game mech');
  assert.equal(await page.locator('.hangar-bay').getAttribute('data-hangar-study'),'warm','procedural default dock is warm');
  assert.equal(await page.locator('#menu').getAttribute('data-input-modality'),'pointer','click uses pointer focus mode');
  assert.equal(await page.locator('.hangar-unit-toggle').evaluate(el=>getComputedStyle(el).outlineStyle),'none',
    'tapping the preview toggle must not leave a misleading selection ring');
  assert.match(await page.locator('#hangar-preview-unit-label').textContent(),/PREVIEW ONLY/,
    'unit preview never claims to choose a spawn vehicle');
  assert.ok(Number(await page.locator('#hangar-unit-preview').getAttribute('data-preview-scale'))<3.16,
    'real sprite scales to fit the hangar stage');
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-paint-id'),'fieldgrid.standard',
    'Visual-only vehicle preview must not alter paint');
  await page.locator('#menu button[data-action="hangar-preview-unit"]').click();
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-unit'),'tank',
    'Hangar returns to tank on demand');
  await page.locator('#menu button[data-action="equip-paint"][data-paint-id="fieldgrid.moss"]').click();
  assert.equal(await page.locator('#hangar-unit-preview').getAttribute('data-paint-id'),'fieldgrid.moss',
   'Paint selection updates real vehicle preview with existing saved paint');
  assert.match(await page.locator('#hangar-status').textContent(),/MOSS/);
  await page.locator('#menu button[data-hangar-tab="insignia"]').click();
  assert.equal(await page.locator('#hangar-insignia').isVisible(),true,'original insignia unlocks available');
  // M3: four earned symbols share one offline icon family; original unlocks survive.
  const marks=await page.evaluate(()=>[...document.querySelectorAll('.emblem-grid button')].map(button=>{
    const icon=button.querySelector('.sr-mark-icon'),href=icon?.querySelector('use')?.getAttribute('href')||'';
    return {id:button.dataset.emblemId,href,local:!!document.querySelector('symbol'+href),
      pointer:icon?getComputedStyle(icon).pointerEvents:null,
      locked:button.disabled,selected:button.classList.contains('selected'),
      label:button.getAttribute('aria-label')};
  }));
  assert.deepEqual(marks.map(x=>x.id),['mark.field','mark.vector','mark.ace','mark.command']);
  assert.deepEqual(marks.map(x=>x.href),['#sr-mark-field','#sr-mark-vector','#sr-mark-ace','#sr-mark-command']);
  assert.ok(marks.every(x=>x.local&&x.pointer==='none'),'all original marks render offline and cannot intercept taps');
  assert.deepEqual(marks.map(x=>x.locked),[false,true,true,true]);
  assert.equal(marks.filter(x=>x.selected).length,1);
  assert.ok(marks.slice(1).every(x=>x.label.includes('LOCKED')));
  assert.equal(await page.locator('#emblem-status').textContent(),'EQUIPPED · FIELD');
  assert.equal(await page.locator('#insignia-detail-use').getAttribute('href'),'#sr-mark-field');
  assert.equal(await page.locator('#insignia-detail-name').textContent(),'FIELD');
  assert.match(await page.locator('#insignia-next-progress').textContent(),/VECTOR · 0 \/ 3 MATCHES/);
  assert.equal(await page.locator('.hangar-architecture').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  if(h>360){
   assert.equal(await page.locator('.insignia-detail').isVisible(),true,'insignia status is visible on medium phones');
   const box=await page.locator('.insignia-detail').boundingBox();
   assert.ok(box&&box.y+box.height<=h+2,'earned badge panel cannot overflow '+w+'x'+h);
  }
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
  assert.equal(await page.locator('#dossier-emblem-mark use').getAttribute('href'),'#sr-mark-field');
  assert.match(await page.locator('.dossier-emblem').getAttribute('aria-label'),/FIELD/);
  assert.match(await page.locator('#dossier-intro').textContent(),/FINISH A SOLO MATCH/);
  assert.match(await page.locator('#dossier-record-note').textContent(),/FIRST MATCH AWAITS/,
    'empty dossier provides genuine first-match context, not invented stats');
  const dossierScroll=await page.locator('#panel').evaluate(el=>({
    excess:el.scrollHeight-el.clientHeight,
    height:el.clientHeight,
    content:el.scrollHeight,
    header:el.querySelector('.dossier-head').getBoundingClientRect().height,
    workspace:el.querySelector('.dossier-workspace').getBoundingClientRect().height,
    footer:el.querySelector('.dossier-footer').getBoundingClientRect().height
  }));
  assert.ok(dossierScroll.excess<=3,
    'Dossier should be a compact, non-scrollable operator card: '+w+'x'+h+' '+JSON.stringify(dossierScroll));
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
  // UIV2-J: Mode Select now displays the same authentic tank/mech Canvas
  // renderer as Home, while keeping the header Back action unobstructed.
  await page.waitForFunction(()=>
    ['tank','mech'].includes(document.querySelector('.mode-vehicle-preview')?.dataset.unit),
    null,{timeout:6000});
  const modeHero=await page.evaluate(()=>{
    const hero=document.querySelector('.mode-vehicle-preview'),
      back=document.querySelector('.mode-head .mode-back'),r=back.getBoundingClientRect(),
      hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    const canvas=hero.getContext('2d');
    return {width:hero.width,height:hero.height,
      pixel:canvas.getImageData(Math.floor(hero.width/2),Math.floor(hero.height/2),1,1).data[3],
      backHit:hit?.closest('button')?.dataset.action,scale:Number(hero.dataset.previewScale||0),
      position:getComputedStyle(hero).position};
  });
  assert.ok(modeHero.width>=100&&modeHero.height>=50&&modeHero.pixel>0,
    'Mode Select renders real in-game vehicle presentation rather than an empty decoration');
  assert.ok(modeHero.scale>=.55&&modeHero.scale<=1.3,'compact mode vehicle is scaled to fit its stage, not cropped: '+modeHero.scale);
  assert.equal(modeHero.position,'relative','Mode vehicle must participate in header layout, not cover the heading');
  assert.equal(modeHero.backHit,'modes-back','header Back remains an actual touch hit target');
  const modeInfo=await page.evaluate(()=>{
   const p=document.querySelector('#panel'),screen=document.querySelector('.mode-screen');
   const r=screen.getBoundingClientRect(),q=p.getBoundingClientRect();
   const cards=[...screen.querySelectorAll('.mode-grid button')].map(el=>{
    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {action:el.dataset.action,accent:getComputedStyle(el).getPropertyValue('--sr-mission-accent').trim(),
      x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,
      hit:hit?.closest('button')?.dataset.action,hitTag:hit?.tagName,
      hitClass:typeof hit?.className==='string'?hit.className:null};
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
    'core mode buttons retain tappable sizes and actual hit targets at '+w+'x'+h+': '+JSON.stringify(modeInfo.cards));
  assert.equal(modeInfo.backPosition,'static','Back must not cover experimental modes during scrolling');
  assert.ok(modeInfo.panelBounds.x>=-1&&modeInfo.panelBounds.right<=w+1,'mode selection must not clip screen width');
  const density=await page.evaluate(()=>{
    const panel=document.querySelector('#panel'),title=panel.querySelector('.mode-head h2'),
      back=panel.querySelector('.mode-back'),summary=panel.querySelector('.bay-exercise-fold summary'),
      cards=[...panel.querySelectorAll('.mode-grid .mode-mission')];
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    return {panel:rect(panel),title:rect(title),back:rect(back),summary:rect(summary),
      cards:cards.map(rect),scrollHeader:getComputedStyle(panel.querySelector('.mode-head')).position};
  });
  assert.ok(density.panel.w<=Math.min(730,w)+1,
    'Mode Select should use a restrained 720px panel instead of filling the entire viewport');
  assert.ok(density.title.h<=36,
    'Mode Select heading should be smaller than the hero heading, not oversized');
  assert.ok(density.cards.every(c=>c.h>=44&&c.h<=65),
    'Mode cards should be compact yet remain finger-sized');
  assert.ok(density.back.h>=43.5&&density.summary.h>=43.5,
    'Back and experimental disclosure remain full-size touch targets');
  assert.equal(density.scrollHeader,'static',
    'Mode Select must never scroll under a sticky header');
  assert.ok(await page.locator('#panel').evaluate(el=>el.scrollHeight-el.clientHeight<=3),
    'Core Mode Select must fit without any page scrolling at '+w+'x'+h);
  await page.locator('.bay-exercise-fold summary').click();
  assert.equal(await page.locator('.bay-return-label').isVisible(),true,
    'Experimental view explicitly offers Back to Core Modes');
  assert.equal(await page.locator('.bay-exercise-launch .sr-ui-icon').count(),2,
    'Forward Bays and CTF use two real original vector diagrams');
  const exerciseActions=await page.locator('.bay-exercise-launch').evaluateAll(els=>
    els.map(el=>({action:el.dataset.action,hasTitle:!!el.querySelector('strong'),
      hasRule:!!el.querySelector('small')})));
  assert.deepEqual(exerciseActions,[{action:'forwardbay',hasTitle:true,hasRule:true},
    {action:'ctf',hasTitle:true,hasRule:true}],
    'experimental actions retain their original game modes and truthful labels');
  const expMode=await page.evaluate(()=>{
    const panel=document.querySelector('#panel'),p=panel.getBoundingClientRect(),
      h=document.querySelector('.mode-head').getBoundingClientRect(),
      b=document.querySelector('.bay-exercise-fold button[data-action="ctf"]').getBoundingClientRect(),
      back=panel.querySelector('.mode-back').getBoundingClientRect();
    return {headerVisible:h.top>=p.top-3&&h.bottom<=p.bottom+1,
      exerciseVisible:b.top>=p.top-1&&b.bottom<=p.bottom+1,
      backVisible:back.bottom<=p.bottom+1,
      coreHidden:getComputedStyle(panel.querySelector('.mode-grid')).display==='none',
      scroll:panel.scrollHeight-panel.clientHeight};
  });
  assert.ok(expMode.headerVisible&&expMode.exerciseVisible&&expMode.backVisible&&
    expMode.coreHidden&&expMode.scroll<=3,
    'Field Exercises must replace core modes in-place with no scrolling '+w+'x'+h);
  await page.screenshot({path:dir+'/mode-density-expanded-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.bay-exercise-fold summary').click();
  assert.equal(await page.locator('.bay-fold-label').isVisible(),true,
    'Closing experimental restores the standard mode entry');
  assert.ok(await page.locator('.mode-grid').isVisible(),
    'closing experimental mode sheet restores all four core choices');
  await page.screenshot({path:dir+'/mode-density-return-'+w+'x'+h+'.png',animations:'disabled'});

  await page.screenshot({path:dir+'/mode-quality-'+w+'x'+h+'.png',animations:'disabled'});
  // UIV3-J6: Custom Match retains original options and a pinned start action.
  await page.locator('.mode-grid button[data-action="custom"]').click();
  assert.equal(await page.locator('.custom-screen').isVisible(),true,
    'Custom opens the existing real rule editor');
  assert.equal(await page.locator('.custom-grid select').count(),4,
    'first page has four core real inputs');
  assert.equal(await page.locator('.custom-advanced-grid select').count(),4,
    'advanced drawer contains all four additional real inputs');
  assert.equal(await page.locator('.custom-advanced').getAttribute('open'),null,
    'advanced settings should not crowd the first screen by default');
  const customFooter=await page.evaluate(()=>{
    const q=document.querySelector('.custom-actions'),r=q.getBoundingClientRect(),
      el=q.querySelector('[data-action="custom-play"]'),b=el.getBoundingClientRect(),
      hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2),
      p=document.querySelector('#panel');
    return {bottom:r.bottom,startHeight:b.height,startHit:hit?.closest('button')?.dataset.action,
      panelOverflow:p.scrollHeight-p.clientHeight};
  });
  assert.ok(customFooter.bottom<=h+1&&customFooter.startHeight>=43&&
    customFooter.startHit==='custom-play'&&customFooter.panelOverflow<=3,
    'Custom Start must stay visible and hittable: '+w+'x'+h+' '+JSON.stringify(customFooter));
  await page.screenshot({path:dir+'/custom-core-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.custom-advanced>summary').click();
  assert.equal(await page.locator('#custom-friendly').isVisible(),true,
    'real friendly-fire selection remains available in advanced settings');
  await page.screenshot({path:dir+'/custom-advanced-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.custom-advanced>summary').click();
  await page.locator('.custom-preset-fold>summary').click();
  assert.equal(await page.locator('#custom-preset-name').isVisible(),true,
    'preset save/restore controls remain present');
  await page.screenshot({path:dir+'/custom-presets-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.custom-actions button[data-action="custom-back"]').click();
  assert.equal(await page.locator('.mode-screen').isVisible(),true,
    'Custom Back returns to Modes');
  await page.locator('#menu button[data-action="modes-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  await page.locator('#menu button[data-action="settings"]').click();
  assert.equal(await page.locator('.mission-setup-screen').isVisible(),true,
    'Mission Setup opens from the original Settings action');
  // UIV3-J2: confirm the authentic game renderer runs on this battle briefing.
  await page.waitForFunction(()=>['tank','mech'].includes(
    document.querySelector('.mission-live-preview')?.dataset.unit
  ),null,{timeout:6000});
  const stageInfo=await page.evaluate(()=>{
    const c=document.querySelector('.mission-live-preview'),p=c.getContext('2d');
    return {w:c.width,h:c.height,alpha:p.getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data[3],
      scale:Number(c.dataset.previewScale||0),position:getComputedStyle(c).position,
      primaryCount:document.querySelectorAll('.mission-setup-actions .primary').length};
  });
  assert.ok(stageInfo.w>=100&&stageInfo.h>=50&&stageInfo.alpha>0,
    'Mission Setup displays real vehicle renderer instead of a placeholder');
  assert.ok(stageInfo.scale>=.55&&stageInfo.scale<=1.3,'Mission unit stage must fit the real artwork');
  assert.equal(stageInfo.position,'relative','Mission vehicle must not overlap the briefing title');
  assert.equal(stageInfo.primaryCount,1,
    'Mission Setup retains one obvious Start Match primary action');
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
  assert.ok(missionLayout.bodyScroll<=3,
    'Default Mission Setup must fit without scrolling '+w+'x'+h+': '+missionLayout.bodyScroll);
  const missionColumns=await page.evaluate(()=>{
    const parent=document.querySelector('.mission-setup-body'),
      field=document.querySelector('.mission-field').getBoundingClientRect(),
      comfort=document.querySelector('.mission-comfort').getBoundingClientRect(),
      advanced=document.querySelector('.mission-rules').getBoundingClientRect(),
      footer=document.querySelector('.mission-setup-actions').getBoundingClientRect();
    return {columns:getComputedStyle(parent).gridTemplateColumns,
      field:{x:field.left,right:field.right,y:field.top,bottom:field.bottom},
      comfort:{x:comfort.left,right:comfort.right,y:comfort.top,bottom:comfort.bottom},
      advanced:{x:advanced.left,right:advanced.right,y:advanced.top,bottom:advanced.bottom},
      footerTop:footer.top};
  });
  assert.ok(missionColumns.field.x<=missionColumns.comfort.x+2&&
    missionColumns.field.right>=missionColumns.advanced.right-2&&
    Math.abs(missionColumns.comfort.y-missionColumns.advanced.y)<=3&&
    missionColumns.comfort.right<=missionColumns.advanced.x+2&&
    missionColumns.comfort.y>=missionColumns.field.bottom-2&&
    Math.max(missionColumns.comfort.bottom,missionColumns.advanced.bottom)<=missionColumns.footerTop+2,
    'Match Conditions must span the top, with Controls/Rules aligned below and Start unobstructed '+w+'x'+h+
    ': '+JSON.stringify(missionColumns));
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
  // Focused Controls/Feedback is a separate in-panel section; ordinary
  // deployment must not scroll just to expose its seven toggles.
  assert.equal(await page.locator('.mission-comfort-details').getAttribute('open'),null,
    'Controls section starts collapsed on the main deployment page');
  await page.locator('.mission-comfort-details summary').click();
  assert.equal(await page.locator('#pref-shake').isVisible(),true,
    'expanded controls exposes real audio/display preferences');
  assert.ok(await page.locator('#panel').evaluate(el=>el.scrollHeight-el.clientHeight<=3),
    'Controls subview fits without scrolling '+w+'x'+h);
  await page.screenshot({path:dir+'/mission-controls-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.mission-comfort-details summary').click();
  assert.ok(await page.locator('#map-size').isVisible(),
    'closing Controls returns to field parameters');
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
  await page.locator('.mission-rules summary').click();
  await page.locator('.mission-comfort-details summary').click();
  const shakeBefore=await page.locator('#pref-shake').isChecked();
  await page.locator('#pref-shake').setChecked(!shakeBefore);
  await page.locator('.mission-comfort-details summary').click();
  await page.locator('.mission-rules summary').click();
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
  await page.waitForFunction(()=>
    ['tank','mech'].includes(document.querySelector('.lan-room-preview')?.dataset.unit),
    null,{timeout:6000});
  assert.equal(await page.locator('.lan-room-preview').count(),1,
    'Local Play uses only one actual Canvas scene');
  const entry=await page.evaluate(()=>{
    const panel=document.querySelector('#panel'),main=panel.querySelector('.lan-entry-main'),
      buttons=[...panel.querySelectorAll('.lan-entry button[data-action]')];
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
    return {panel:rect(panel),main:rect(main),buttons:buttons.map(el=>{
      const r=rect(el),hit=document.elementFromPoint((r.x+r.right)/2,(r.y+r.bottom)/2);
      return {action:el.dataset.action,rect:r,hit:hit?.closest('button')?.dataset.action};
    })};
  });
  assert.deepEqual(entry.buttons.map(x=>x.action),['help-back','host','find','manual'],
    'Local Play exposes exact original host/find/manual/back actions');
  assert.ok(entry.panel.x>=-1&&entry.panel.right<=w+1&&entry.panel.y>=-1&&entry.panel.bottom<=h+1,
    'Local Play bounds stay within '+w+'x'+h);
  for(const item of entry.buttons){
    assert.ok(item.rect.h>=40&&item.rect.w>=80&&item.rect.x>=0&&item.rect.right<=w+1&&item.rect.bottom<=h+1,
      'Local Play action clipped: '+item.action+' at '+w+'x'+h);
    assert.equal(item.hit,item.action,'Local Play action must remain tappable');
  }
  await page.screenshot({path:dir+'/lan-entry-'+w+'x'+h+'.png',animations:'disabled'});
  assert.ok(await page.locator('#panel').evaluate(el=>el.scrollHeight-el.clientHeight<=3),
    'Local Play intro must not be scrollable');
  await page.locator('.lan-entry button[data-action="host"]').click();
  assert.equal(await page.locator('.lan-lobby').isVisible(),true,'Host enters real LAN lobby');
  assert.equal(await page.locator('[data-lan-setting]').count(),9,'nine real LAN settings remain');
  assert.equal(await page.locator('[data-lan-setting="teamMode"]').evaluate(el=>
    el.closest('label')?.textContent.includes('MATCH TYPE')),true,
    'Host match type must be a player-friendly label');
  assert.match(await page.locator('.lan-lobby-head p').textContent(),
    /joining mid-match wait for the next match/,
    'Host explanation cannot promise immediate mid-match multiplayer joining');
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
  await page.evaluate(()=>window.RR.nativeMessage(JSON.stringify({type:'error',message:'Not reachable'})));
  assert.equal(await page.locator('.lan-recovery').isVisible(),true,
    'native connection error opens FIELDGRID recovery UI');
  assert.deepEqual(await page.locator('.lan-recovery button[data-action]').evaluateAll(
    els=>els.map(e=>e.dataset.action)),['lan-retry','find','manual','close'],
    'original retry / find / manual / close actions retained');
  await page.screenshot({path:dir+'/lan-recovery-'+w+'x'+h+'.png',animations:'disabled'});
  const beforeRetry=(await page.evaluate(()=>window.__lanUiCalls)).filter(x=>x[0]==='join').length;
  await page.locator('.lan-recovery button[data-action="lan-retry"]').click();
  assert.equal((await page.evaluate(()=>window.__lanUiCalls)).filter(x=>x[0]==='join').length,beforeRetry+1,
    'Retry still calls native join on same saved endpoint');
  await page.evaluate(()=>window.RR.nativeMessage(JSON.stringify({type:'error',message:'Not reachable'})));
  await page.locator('.lan-recovery button[data-action="find"]').click();
  assert.equal(await page.locator('.lan-discover').isVisible(),true,'recovery can navigate to discovery');
  await page.locator('.lan-discover button[data-action="close"]').click();
  await page.locator('#menu button[data-action="nearby"]').click();
  await page.locator('.lan-entry button[data-action="host"]').click();
  await page.evaluate(()=>window.RR.nativeMessage(JSON.stringify({type:'host-offline'})));
  assert.equal(await page.locator('.lan-recovery button[data-action="host"]').count(),1,
    'host-offline retains new-room action');
  await page.screenshot({path:dir+'/lan-offline-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.lan-recovery button[data-action="close"]').click();
  await page.evaluate(()=>{delete window.AndroidBridge;});
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  await page.locator('#menu button[data-action="help"]').click();
  assert.equal(await page.locator('.help-steps article').count(),4,'four tutorial steps remain');
  const helpLayout=await page.evaluate(()=>{
    const r=el=>{const a=el.getBoundingClientRect();return {top:a.top,bottom:a.bottom,height:a.height}};
    return {head:r(document.querySelector('.help-head')),body:r(document.querySelector('.help-scroll')),
      footer:r(document.querySelector('.help-footer'))};
  });
  assert.ok(helpLayout.head.bottom<=helpLayout.body.top+2&&
    helpLayout.body.bottom<=helpLayout.footer.top+2&&helpLayout.footer.bottom<=h+1,
    'Help scrolling content must not cover navigation or practice action');
  await page.locator('.help-more summary').click();
  await page.locator('.privacy-more summary').click();
  await page.locator('.help-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  const practiceHit=await page.locator('.help-footer .help-practice').evaluate(el=>{
    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {height:r.height,bottom:r.bottom,action:hit?.closest('button')?.dataset.action};
  });
  assert.ok(practiceHit.height>=43&&practiceHit.bottom<=h+1&&practiceHit.action==='practice',
    'Help Practice remains visible and clickable after expanding both disclosures');
  await page.screenshot({path:dir+'/help-refined-'+w+'x'+h+'.png',animations:'disabled'});
  await page.locator('.help-head button[data-action="help-back"]').click();
  await page.waitForFunction(()=>window.__SRHybridMenu?.active,null,{timeout:15000});
  const reloaded=await page.evaluate(()=>({active:window.__SRHybridMenu.active,mounts:window.__SRHybridMenu.mounts}));
  assert.ok(reloaded.active&&reloaded.mounts>=2,'GPU re-created after returning home');
  // M5.1: every five-size real in-match HUD has an accurate readable mode,
  // never overlapping lives, armor, enemies or the MENU hit target.
  if([568,640,740,915,1280].includes(w)){
   await page.locator('#menu button[data-action="solo"]').click();
   await page.waitForFunction(()=>document.querySelector('#menu')?.classList.contains('hidden'),null,{timeout:15000});
   const hud=await page.evaluate(()=>{
    const r=el=>{const b=el.getBoundingClientRect();return {x:b.x,right:b.right,y:b.y,bottom:b.bottom,w:b.width,h:b.height};};
    const chip=document.querySelector('#hud-mode-chip'),rail=document.querySelector('.scorestrip'),
      lives=rail.querySelector('.blue-tag'),armor=document.querySelector('#round'),enemies=rail.querySelector('.pink-tag'),
      menu=document.querySelector('#menu-button');
    return {code:chip.textContent,actual:window.__SRModeHudTest().code,aria:chip.getAttribute('aria-label'),
      chip:r(chip),rail:r(rail),lives:r(lives),armor:r(armor),enemies:r(enemies),menu:r(menu),
      pointer:getComputedStyle(chip).pointerEvents};
   });
   assert.equal(hud.code,hud.actual,'visible HUD must come from real current match mode');
   assert.match(hud.aria,/Current game mode: /);
   assert.equal(hud.pointer,'none','match mode display must never steal gameplay touches');
   assert.ok(hud.chip.w>=27&&hud.chip.h>=25&&hud.chip.x>=hud.rail.x-1&&hud.chip.right<=hud.lives.x+1,
     'HUD mode must fit at '+w+'x'+h+': '+JSON.stringify(hud));
   assert.ok(hud.lives.right<=hud.armor.x+1&&hud.armor.right<=hud.enemies.x+1,
     'lives, armor and enemies must not overlap at '+w+'x'+h+': '+JSON.stringify(hud));
   assert.ok(hud.enemies.right<=hud.rail.right+2&&hud.menu.right<=hud.rail.x+1,
     'match rail must fit beside MENU at '+w+'x'+h+': '+JSON.stringify(hud));
   await page.screenshot({path:dir+'/m5-1-live-mode-hud-'+w+'x'+h+'.png',animations:'disabled'});
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
   assert.equal(await page.locator('.pause-screen').isVisible(),true,
     'new game-native pause composition renders');
   assert.equal((await page.locator('.pause-head .eyebrow').textContent()).trim(),hud.code+' · PAUSED',
     'Pause must reflect the current actual live match type, not generic Solo Play');
   assert.ok(pauseDetails.labels.includes('NEW MATCH'),'honest restart button must say NEW MATCH');
   const pauseHit=await page.evaluate(()=>[...document.querySelectorAll('.pause-screen button[data-action]')].map(el=>{
     const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
     return {action:el.dataset.action,height:r.height,bottom:r.bottom,hit:hit?.closest('button')?.dataset.action};
   }));
   assert.ok(pauseHit.every(b=>b.height>=43&&b.bottom<=h+1&&b.hit===b.action),
     'pause/audio controls must be usable in short landscape: '+JSON.stringify(pauseHit));
   await page.screenshot({path:dir+'/pause-quality-'+w+'x'+h+'.png',animations:'disabled'});
   await page.locator('#menu button[data-action="resume"]').click();
   await page.waitForFunction(()=>document.querySelector('#menu')?.classList.contains('hidden'),null,{timeout:15000});
  }
  await context.close();
  cases.push({viewport:w+'x'+h,primaryHeight:Math.round(g.play.h),headingHeight:Math.round(g.title.h),
   menuWithoutScroll:true,allControlsClickable:true,pixiWebgl:true});
 }
 // M3 seeded real local record: mark eligibility and profile values follow saved matches/KOs/wins.
 const earnedCtx=await browser.newContext({viewport:{width:740,height:360}});
 const earnedPage=await earnedCtx.newPage();
 earnedPage.on('pageerror',e=>issues.push(e.message));
 await earnedPage.goto(origin+'/',{waitUntil:'load'});
 await earnedPage.evaluate(()=>window.localStorage.setItem('rr-dossier-v1',JSON.stringify({
  schemaVersion:1,matches:15,wins:12,losses:2,draws:1,kos:40,deaths:7,seconds:3600,
  byMode:{scored_ffa:{matches:15,wins:12,losses:2,draws:1,kos:40,deaths:7,seconds:3600}},
  recentKeys:[]})));
 await earnedPage.reload({waitUntil:'load'});
 await earnedPage.locator('#menu button[data-action="hangar"]').click();
 await earnedPage.locator('#menu button[data-hangar-tab="insignia"]').click();
 assert.equal(await earnedPage.locator('.emblem-grid button:disabled').count(),0);
 await earnedPage.locator('.emblem-grid button[data-emblem-id="mark.command"]').click();
 assert.equal(await earnedPage.locator('.emblem-grid button.selected').getAttribute('data-emblem-id'),'mark.command');
 assert.equal(await earnedPage.locator('#insignia-detail-use').getAttribute('href'),'#sr-mark-command');
 assert.match(await earnedPage.locator('#insignia-next-progress').textContent(),/ALL FOUR INSIGNIAS EARNED/);
 await earnedPage.locator('#menu button[data-action="hangar-back"]').click();
 await earnedPage.locator('#menu button[data-action="dossier"]').click();
 assert.equal(await earnedPage.locator('#dossier-matches').textContent(),'15');
 assert.equal(await earnedPage.locator('#dossier-wins').textContent(),'12');
 assert.equal(await earnedPage.locator('#dossier-kos').textContent(),'40');
 assert.equal(await earnedPage.locator('#dossier-emblem-name').textContent(),'COMMAND');
 assert.equal(await earnedPage.locator('#dossier-emblem-mark use').getAttribute('href'),'#sr-mark-command');
 assert.match(await earnedPage.locator('#dossier-intro').textContent(),/RECORDED SOLO/);
 await earnedPage.screenshot({path:dir+'/m3-earned-command-dossier-740x360.png',animations:'disabled'});
 await earnedCtx.close();
 // M5 visual comparison: second procedural background is opt-in, never a shipped image.
 const studyPage=await browser.newPage({viewport:{width:915,height:412}});
 studyPage.on('pageerror',e=>issues.push(e.message));
 await studyPage.goto(origin+'/?hangarStudy=blueprint',{waitUntil:'load'});
 await studyPage.locator('#menu button[data-action="hangar"]').click();
 assert.equal(await studyPage.locator('.hangar-bay').getAttribute('data-hangar-study'),'blueprint');
 assert.equal(await studyPage.locator('#hangar-unit-preview').getAttribute('data-unit'),'tank');
 await studyPage.screenshot({path:dir+'/m5-blueprint-hangar-915x412.png',animations:'disabled'});
 await studyPage.close();
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
