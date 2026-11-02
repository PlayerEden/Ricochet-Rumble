// Real Chromium + actual game combat stepping. Controlled still-target fixtures
// isolate the firing cycle; natural CTF/Survival matches run in the full suite.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN);
const root=path.resolve('web'),src=fs.readFileSync(path.join(root,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(src));
function hooks(){
 window.__shotParity={
  setup(seed,kind,skill){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',matchModeId:kind==='pilot'?'cqc':'scored_ffa',
    botCount:1,teamMode:'ffa',botSkill:skill,pilotMode:true,startLives:3},seed);
   botBrains.clear();fireCooldown.fill(0);releaseControls();
   const human=state.tanks[0],bot=state.tanks[1];
   const x=mazeGrid.cell*2.5,y=mazeGrid.cell*2.5;
   human.x=x-25;human.y=y;bot.x=x+37;bot.y=y;bot.a=Math.PI;
   human.a=0;human.vx=human.vy=bot.vx=bot.vy=0;
   human.shield=120;bot.shield=0;
   human.onFoot=bot.onFoot=kind==='pilot';
   if(kind!=='pilot'){
    for(const t of [human,bot]){
     const v=state.vehicles[t.vehicleId];v.type=kind;v.armor=vehicleDef(v).armor;
    }
   }
   state.winner=-1;state.lives[0]=state.lives[1]=1;state.bullets=[];
   comfort.autoFire=false;comfort.releaseFire=true;comfort.pilotAssist=false;
   camera.x=140;camera.y=180;camera.zoom=1;
   // Stationary target and bot isolate the real aim/commit mechanics from the
   // pathfinding layer. Existing CTF natural-match tests remain unmodified.
   chooseBotObjective=(i,t)=>({kind:'hold',point:{x:state.tanks[i].x,y:state.tanks[i].y}});
   return {visible:pilotInLocalView(human.x,human.y)&&pilotInLocalView(bot.x,bot.y),
    line:hasLineOfSight(bot.x,bot.y,human.x,human.y),kind,skill};
  },
  traceChoice(){
   // Read actual bot decision state without faking its angle or firing cycle.
   const target=state.tanks[0],bot=state.tanks[1],oldY=target.y;
   botBrains.delete(1);
   const first=botInput(1,1/60);
   const brain=botBrains.get(1),angle=brain?.fireAngle;
   const count=brain?.fireCandidateCount||0,bank=brain?.fireBank;
   target.y+=18;const moved=botInput(1,1/60);
   const locked=botBrains.get(1)?.fireAngle;
   target.y=oldY;
   botBrains.delete(1); // leave the existing shot-cycle fixture unchanged
   return {firstFire:first.fire,firstAim:angle,candidates:count,
    banked:bank,movedFire:moved.fire,locked,hasAim:!!first.aimX||!!first.aimY};
  },
  sample(n=230){
   const shots=[],aims=[];let last=0;
   for(let f=1;f<=n;f++){
    const cd=fireCooldown[1];step(1/60);
    const brain=botBrains.get(1);
    if(f===1||f===9||f===23)aims.push({frame:f,heading:state.tanks[1].a,
     targetAngle:brain?.fireAngle,track:brain?.fireTrack,recover:brain?.fireRecover});
    if(fireCooldown[1]>cd+.16){shots.push(f);last=f;}
   }
   const brain=botBrains.get(1);
   return {shots,aims,fireCount:brain?.fireShots||0,
    botFacing:state.tanks[1].a,headingsFinite:Number.isFinite(brain?.fireAngle),
    alive:state.lives[0]>0&&state.lives[1]>0};
  },
  occlusion(){
   botBrains.delete(1);const human=state.tanks[0],bot=state.tanks[1];
   human.onFoot=false;state.config.botSkill='normal';
   const one=botInput(1,1/60);
   const progress=botBrains.get(1)?.fireTrack||0;
   camera.x=1200;const unseen=botInput(1,1/60);
   const cleared=botBrains.get(1)?.fireTrack||0;
   camera.x=140;const again=botInput(1,1/60);
   return {firstFire:one.fire,progress,unseen:unseen.fire,cleared,
    again:again.fire,track:botBrains.get(1)?.fireTrack||0};
  },
  targetIdentity(){
   botBrains.delete(1);const human=state.tanks[0];
   human.onFoot=false;botInput(1,1/60);
   const before=botBrains.get(1)?.fireTargetKind;
   human.onFoot=true;botInput(1,1/60);
   const after=botBrains.get(1)?.fireTargetKind;
   return {before,after,track:botBrains.get(1)?.fireTrack};
  }
 };
}
const game=src.replace(ending,'\n('+hooks.toString()+')();\n})();');
const names=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!names.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?game:fs.readFileSync(path.join(root,file)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try{
 for(const viewport of [{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__shotParity);
  for(const skill of ['casual','normal','spicy'])for(const kind of ['pilot','tank','mech']){
   const seed=kind==='pilot'?111:kind==='tank'?222:333;
   const init=await page.evaluate(({seed,kind,skill})=>window.__shotParity.setup(seed,kind,skill),
    {seed,kind,skill});
   assert.equal(init.line,true,'fixture must have actual world LOS');
   assert.equal(init.visible,true,'fixture visible on local viewport');
   const choice=await page.evaluate(()=>window.__shotParity.traceChoice());
   assert.equal(choice.firstFire,false,kind+' '+skill+' cannot fire first acquisition tick');
   assert.equal(choice.banked,false,kind+' '+skill+' clear short shot selects direct path');
   assert.ok(choice.candidates>=1&&choice.candidates<=7,
    kind+' '+skill+' caps per-shot evaluations at seven');
   assert.ok(Number.isFinite(choice.firstAim),kind+' '+skill+' plans a finite angle');
   assert.ok(Math.abs(choice.firstAim-choice.locked)<1e-9,
    kind+' '+skill+' shot heading locked when target changes position');
   const got=await page.evaluate(()=>window.__shotParity.sample());
   const firstMinimum=skill==='casual'?16:skill==='normal'?12:8;
   assert.ok(got.shots.length>=2,kind+' '+skill+' should commit at least two actual shots');
   assert.ok(got.shots[0]>=firstMinimum,kind+' '+skill+' cannot instant-fire on first sight');
   const minimumSpacing=skill==='casual'?39:skill==='normal'?31:24;
   for(let j=1;j<got.shots.length;j++)assert.ok(got.shots[j]-got.shots[j-1]>=minimumSpacing,
    kind+' '+skill+' must recover and reacquire between shots');
   assert.equal(got.alive,true,'controlled target survives shielded shooting');
   assert.equal(got.headingsFinite,true,'no invalid bot firing angle');
   const occlusion=await page.evaluate(()=>window.__shotParity.occlusion());
   assert.equal(occlusion.firstFire,false,'first newly acquired frame cannot shoot');
   assert.equal(occlusion.unseen,false,'offscreen bot cannot attack human vehicle');
   assert.equal(occlusion.cleared,0,'LOS/view loss clears shot acquisition');
   assert.equal(occlusion.again,false,'visible target requires reacquisition');
   const identity=await page.evaluate(()=>window.__shotParity.targetIdentity());
   assert.equal(identity.before,'vehicle');
   assert.equal(identity.after,'pilot');
   assert.ok(identity.track<=1/60+.001,'ejection restarts acquisition');
   cases.push({viewport,kind,skill,init,shotFrames:got.shots,occlusion,identity});
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no Chromium page exceptions');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/bot-shot-parity.json',JSON.stringify({cases},null,2));
 console.log('BOT_COMMIT_SHOT_REAL_BROWSER_PASS '+JSON.stringify({fixtures:cases.length,
  modes:['pilot','tank','mech'],difficulties:['casual','normal','spicy'],
  recoveryVerified:true,offscreenVehicleGuard:true,ejectionReacquisition:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
