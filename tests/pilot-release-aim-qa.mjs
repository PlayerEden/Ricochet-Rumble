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
   comfort.pilotRelease=release;comfort.autoFire=false;comfort.pilotAssist=false;
   camera.zoom=1.07;camera.x=0;camera.y=0;
   return {mode,foot:t.onFoot,release:comfort.pilotRelease,blocked:blocked(t.x,t.y,10)};
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
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__pilotReleaseQA);
  await page.locator('button[data-action="settings"]').click();
  const option=page.locator('#pref-pilotRelease');
  assert.equal(await option.isChecked(),false,'release aim opt-in defaults OFF');
  await option.check();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).comfort.pilotRelease),true);
  await page.reload();
  await page.locator('button[data-action="settings"]').click();
  assert.equal(await page.locator('#pref-pilotRelease').isChecked(),true,'opt-in survives reload');
  await option.uncheck();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).comfort.pilotRelease),false);
  const rect=await page.locator('#pref-pilotRelease').boundingBox();
  assert.ok(rect&&rect.width>=20&&rect.height>=20,'accessible existing checkbox');
  const fire=page.locator('.fire-btn');
  for(const seed of [101,202,303]){
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
   assert.ok(launched.bullets.some(b=>b.kind==='sidearm'),'genuine projectile without homing');
   results.push({viewport,seed,kind:'release',queued,launched});
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
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no browser errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/pilot-release-aim-qa.json',JSON.stringify({results},null,2));
 console.log('PILOT_RELEASE_AIM_REAL_POINTER_PASS '+JSON.stringify({viewports:2,seeds:3,
  cases:results.length,defaultOff:true,settingsPersist:true,previewNoPrematureShot:true,
  cancelAndPauseSafe:true,legacyHoldUnaffected:true,keyboardUnaffected:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
