// Real Chromium touch input + production simulation, including cancel/hold parity.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN);
const root=path.resolve('web'),src=fs.readFileSync(path.join(root,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(src));
function hooks(){
 window.__pilotReleaseQA={
  setup(seed,release=true){
   mode='solo';paused=false;connected=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'standard',matchModeId:'cqc',botCount:1,teamMode:'ffa',pilotMode:true,botSkill:'casual'},seed);
   const t=state.tanks[0],bot=state.tanks[1];
   t.x=mazeGrid.cell*4.5;t.y=mazeGrid.cell*3.5;t.a=0;t.onFoot=true;t.vx=t.vy=0;t.shield=0;
   bot.x=mazeGrid.cell*10.5;bot.y=mazeGrid.cell*7.5;bot.onFoot=true;bot.a=Math.PI;
   state.lives=[1,1];state.winner=-1;state.bullets=[];fireCooldown.fill(0);releaseControls();
   comfort.releaseFire=release;comfort.autoFire=false;comfort.pilotAssist=false;
   camera.zoom=1.07;camera.x=0;camera.y=0;
   return {mode,foot:t.onFoot,release:comfort.releaseFire,blocked:blocked(t.x,t.y,10)};
  },
  pump(frames=1){for(let i=0;i<frames;i++)step(1/60);return this.status();},
  status(){
   const t=state.tanks[0],shots=state.bullets.filter(b=>b.owner===0);
   return {angle:t.a,shots:shots.length,bullets:shots.map(b=>({kind:b.kind,angle:Math.atan2(b.vy,b.vx)})),
    pending:!!releaseShot,ttl:releaseShot?.ttl,held:touch.has('fire'),drag:fireAim.active,
    headingInput:releaseShot?Math.atan2(releaseShot.y,releaseShot.x):null,cd:fireCooldown[0],
    pendingId:fireAim.pointerId,down:inputFrom(keys1,true).fire,
    currentVehicleType:currentVehicle(t)?.type??null};
  },
  setupWeapon(seed,kind){
   mode='solo';paused=false;connected=false;menu.classList.add('hidden');
   const opts={mapSize:'standard',matchModeId:kind==='pilot'?'cqc':'scored_ffa',
    botCount:1,teamMode:'ffa',pilotMode:true,botSkill:'casual',startLives:3};
   state=initialState(0,opts,seed);
   const t=state.tanks[0];t.a=0;t.shield=0;state.winner=-1;
   if(kind==='pilot'){t.onFoot=true;t.vehicleId=null;}
   else{
    t.onFoot=false;
    const v=state.vehicles[t.vehicleId];v.type=kind;v.armor=VEHICLE_TYPES[kind].armor;
   }
   comfort.releaseFire=true;comfort.autoFire=false;comfort.pilotAssist=false;
   fireCooldown.fill(0);releaseControls();
   const dirs=[0,Math.PI/2,Math.PI,-Math.PI/2].map(a=>previewTrajectory(t,a));
   return {kind,bounces:dirs.filter(d=>!!d.bounce).length,
    maxSections:Math.max(...dirs.map(d=>d.segments.length)),
    reach:Math.max(...dirs.map(d=>d.segments.reduce((sum,line)=>sum+line.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-line[i].x,p.y-line[i].y),0),0))),
    blocked:blocked(t.x,t.y,t.onFoot?10:21)};
  },
  untilShot(maxFrames=90){
   let fired=false,first=-1,kind=null,count=0;
   for(let n=1;n<=maxFrames;n++){
    const prior=fireCooldown[0];step(1/60);
    if(fireCooldown[0]>prior+.12){
     count++;if(first<0){first=n;kind=state.tanks[0].onFoot?'sidearm':currentVehicle(state.tanks[0])?.type;}
     fired=true;
    }
   }
   return {fired,first,kind,count,pending:!!releaseShot};
  },
  hostProtocol(){
   mode='host';connected=true;paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',botCount:0,teamMode:'ffa',pilotMode:true},455);
   state.winner=-1;state.lives[1]=1;state.tanks[1].a=0;state.tanks[1].shield=0;
   fireCooldown.fill(0);remoteReleaseShot=null;lastGuestFireSeq=0;
   guestInput={moveX:0,moveY:0,fire:false};guestInputAge=0;
   const packet={type:'fire-request',seq:1,matchId:state.matchId,aimX:1,aimY:0};
   window.RR.nativeMessage(JSON.stringify(packet));
   const accepted=!!remoteReleaseShot;
   window.RR.nativeMessage(JSON.stringify({...packet,seq:2,aimX:100,aimY:0}));
   const malformedDidNotReplace=remoteReleaseShot?.x===1;
   step(1/60);
   const fired=fireCooldown[1]>0;
   window.RR.nativeMessage(JSON.stringify(packet));
   const duplicateRejected=remoteReleaseShot===null;
   releaseControls();connected=false;paused=true;
   return {accepted,malformedDidNotReplace,fired,duplicateRejected};
  },
  cancel(){releaseControls();return this.status()},
  foot(value){state.tanks[0].onFoot=value;return inputFrom(keys1,true).fire;},
  pause(){releaseControls();paused=true;return this.status()},
  resume(){paused=false;return this.status()}
 };
}
const instrumented=src.replace(ending,'\n('+hooks.toString()+')();\n})();');
const names=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!names.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?instrumented:fs.readFileSync(path.join(root,file)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],results=[];
try{
 for(const viewport of [{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});
  page.setDefaultTimeout(6000);
  console.log('RELEASE_AIM_STAGE viewport '+viewport.width+'x'+viewport.height);
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__pilotReleaseQA);
  await page.locator('button[data-action="settings"]').click();
  const option=page.locator('#pref-releaseFire');
  assert.equal(await option.isChecked(),true,'release shooting defaults ON');
  await option.uncheck();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).comfort.releaseFire),false);
  await page.reload();
  await page.locator('button[data-action="settings"]').click();
  assert.equal(await page.locator('#pref-releaseFire').isChecked(),false,'classic control setting persists');
  await option.check();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).comfort.releaseFire),true);
  const rect=await page.locator('#pref-releaseFire').boundingBox();
  assert.ok(rect&&rect.width>=20&&rect.height>=20,'accessible existing checkbox');
  const fire=page.locator('.fire-btn');
  for(const seed of [101,202,303]){
   console.log('RELEASE_AIM_STAGE seed '+seed+' start');
   const init=await page.evaluate(seed=>window.__pilotReleaseQA.setup(seed,true),seed);
   assert.equal(init.blocked,false,'actual pilot can stand in fixture');
   const fireRect=await fire.boundingBox();
   assert.ok(fireRect&&fireRect.width>=76&&fireRect.height>=76,'unobstructed original FIRE touch target');
   const cx=fireRect.x+fireRect.width/2,cy=fireRect.y+fireRect.height/2;
   await page.mouse.move(cx,cy);await page.mouse.down();
   const held=await page.evaluate(()=>window.__pilotReleaseQA.pump(2));
   assert.equal(held.shots,0,'press cannot prematurely shoot in release mode');
   assert.equal(held.down,false,'touch hold suppressed, not keyboard');
   await page.mouse.move(cx,cy-56,{steps:3});
   const aiming=await page.evaluate(()=>window.__pilotReleaseQA.pump(22));
   assert.equal(aiming.shots,0,'holding while aiming never fires');
   assert.equal(aiming.drag,true,'FIRE-drag still guides pilot facing');
   await page.mouse.up();
   const queued=await page.evaluate(()=>window.__pilotReleaseQA.status());
   assert.equal(queued.pending,true,'real pointerup queues exactly one shot');
   const launched=await page.evaluate(()=>window.__pilotReleaseQA.pump(8));
   assert.equal(launched.pending,false,'queued shot consumed after alignment');
   assert.ok(launched.cd>0,'normal sidearm cooldown started after release');
   // The bullet may hit a real maze wall during the next 8 frames, so
   // assert the production sidearm cooldown that shoot() sets on success.
   assert.ok(launched.cd>0&&launched.cd<=.43,'single real sidearm shot with normal cooldown');
   results.push({viewport,seed,kind:'release',queued,launched});
   console.log('RELEASE_AIM_STAGE seed '+seed+' shot verified');
   // A cancelled or interrupted hold cannot queue a phantom shot.
   await page.evaluate(seed=>window.__pilotReleaseQA.setup(seed+10,true),seed);
   await page.mouse.move(cx,cy);await page.mouse.down();
   const pointer=await page.evaluate(()=>window.__pilotReleaseQA.status().pendingId);
   await fire.dispatchEvent('pointercancel',{pointerId:pointer,pointerType:'touch'});
   const cancelled=await page.evaluate(()=>window.__pilotReleaseQA.pump(6));
   assert.equal(cancelled.pending,false,'pointercancel never queues a shot');
   assert.equal(cancelled.shots,0,'cancelled FIRE cannot shoot');
   await page.mouse.up();
   await page.evaluate(seed=>window.__pilotReleaseQA.setup(seed+20,true),seed);
   await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.up();
   assert.equal((await page.evaluate(()=>window.__pilotReleaseQA.status())).pending,true);
   const paused=await page.evaluate(()=>window.__pilotReleaseQA.pause());
   assert.equal(paused.pending,false,'pause discards pending single shot');
   results.push({viewport,seed,kind:'cancel-and-pause',cancelled,paused});
   console.log('RELEASE_AIM_STAGE seed '+seed+' cancellation verified');
   // Old hold-to-fire path still shoots on the first physics tick.
   await page.evaluate(seed=>window.__pilotReleaseQA.setup(seed+30,false),seed);
   await page.mouse.move(cx,cy);await page.mouse.down();
   const legacy=await page.evaluate(()=>window.__pilotReleaseQA.pump(2));
   assert.ok(legacy.cd>0,'legacy press still fires immediately');
   await page.mouse.up();
   results.push({viewport,seed,kind:'hold',legacy});
   // Keyboard Space is not blocked by the alternative *touch* mode.
   await page.evaluate(seed=>window.__pilotReleaseQA.setup(seed+40,true),seed);
   await page.keyboard.down('Space');
   const keyboard=await page.evaluate(()=>window.__pilotReleaseQA.pump(2));
   assert.ok(keyboard.cd>0,'keyboard SPACE fires while release mode enabled');
   await page.keyboard.up('Space');
   results.push({viewport,seed,kind:'keyboard',keyboard});
   for(const weapon of ['pilot','tank','mech']){
    const terrain=await page.evaluate(({seed,weapon})=>window.__pilotReleaseQA.setupWeapon(seed+70,weapon),{seed,weapon});
    assert.equal(terrain.blocked,false,'real actor free of wall');
    assert.ok(terrain.maxSections<=2,'trajectory previews no more than one bounce');
    if(weapon==='pilot')assert.equal(terrain.bounces,0,'pilot sidearm never previews a ricochet');
    else assert.ok(terrain.bounces>0,'vehicle previews a real wall/bounce segment');
    await page.mouse.move(cx,cy);await page.mouse.down();
    await page.mouse.move(cx,cy-56,{steps:3});
    const heldVehicle=await page.evaluate(()=>window.__pilotReleaseQA.pump(20));
    assert.ok(heldVehicle.cd===0,'holding preview does not fire '+weapon);
    await page.mouse.up();
    const done=await page.evaluate(()=>window.__pilotReleaseQA.untilShot(75));
    assert.equal(done.fired,true,weapon+' release commits a shot after alignment');
    assert.equal(done.count,1,'one release produces only one '+weapon+' shot');
    assert.equal(done.pending,false,weapon+' queue cleared after shot');
    results.push({viewport,seed,kind:'weapon-'+weapon,terrain,done});
   }
   const protocol=await page.evaluate(()=>window.__pilotReleaseQA.hostProtocol());
   assert.equal(protocol.accepted,true,'host accepts valid release edge');
   assert.equal(protocol.malformedDidNotReplace,true,'host rejects oversized aim vector');
   assert.equal(protocol.fired,true,'host fires real authoritative shot');
   assert.equal(protocol.duplicateRejected,true,'host rejects duplicate shot sequence');
   results.push({viewport,seed,kind:'host-protocol',protocol});
   console.log('RELEASE_AIM_STAGE seed '+seed+' complete');
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no browser errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/pilot-release-aim-qa.json',JSON.stringify({results},null,2));
 console.log('PILOT_RELEASE_AIM_REAL_POINTER_PASS '+JSON.stringify({viewports:2,seeds:3,
  cases:results.length,weapons:['pilot','tank','mech'],oneBouncePreview:true,hostSequenceGuard:true,defaultOn:true,settingsPersist:true,previewNoPrematureShot:true,
  cancelAndPauseSafe:true,legacyHoldUnaffected:true,keyboardUnaffected:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
