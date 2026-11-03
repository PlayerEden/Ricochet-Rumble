// M2 AI1 — real Chromium + actual botInput, physical tankMove and shot commit.
// Isolate acceleration and heading first, then run an ordinary bot engagement.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const binary=process.env.CHROME_BIN;
assert.ok(binary,'CHROME_BIN required; cannot silently skip actual bot-aim tests');
const root=path.resolve('web'),src=fs.readFileSync(path.join(root,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(src));
function hooks(){
 window.__aiPosture={
  setup(kind,skill){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',matchModeId:kind==='pilot'?'cqc':'scored_ffa',
    botCount:1,teamMode:'ffa',botSkill:skill,pilotMode:true,startLives:3},kind==='pilot'?111:222);
   botBrains.clear();fireCooldown.fill(0);releaseControls();
   const human=state.tanks[0],bot=state.tanks[1],
    x=mazeGrid.cell*2.5,y=mazeGrid.cell*2.5;
   human.x=x-25;human.y=y;human.a=0;human.vx=human.vy=0;
   bot.x=x+37;bot.y=y;bot.a=Math.PI;bot.vx=bot.vy=0;
   human.onFoot=bot.onFoot=kind==='pilot';
   human.shield=120;bot.shield=0;
   if(kind!=='pilot')for(const t of [human,bot]){
    const v=state.vehicles[t.vehicleId];v.type='tank';v.armor=vehicleDef(v).armor;
   }
   state.lives[0]=state.lives[1]=1;state.winner=-1;state.bullets=[];
   camera.x=140;camera.y=180;camera.zoom=1;
   return {los:hasLineOfSight(bot.x,bot.y,human.x,human.y),both:pilotInLocalView(human.x,human.y)&&pilotInLocalView(bot.x,bot.y)};
  },
  probes(skill){
   const bot=state.tanks[1],target=state.tanks[0],index=0;
   const seen={x:target.x,y:target.y,index,onFoot:!!target.onFoot,live:true};
   const run=(heading,speed,frames=55)=>{
    bot.a=heading;bot.vx=speed;bot.vy=0;
    const brain={timer:0,path:[],goal:-1,fireTarget:-1,fireTrack:0};
    let first=0,maxTrack=0,angle=null;
    for(let n=1;n<=frames;n++){
     const r=botFireCommit(brain,bot,target,skill,1/60,true,true,1,seen);
     if(Number.isFinite(brain.fireAngle))angle=brain.fireAngle;
     if(brain.fireTrack>maxTrack)maxTrack=brain.fireTrack;
     if(r.fire&&!first)first=n;
    }
    return {first,maxTrack,angle,posture:botAimPosture(bot,brain,skill),frames};
   };
   const moving=run(Math.PI,155);
   const sideways=run(0,0);
   const aligned=run(Math.PI,0);
   const movingFired=moving.first,turnedFired=sideways.first;
   bot.a=Math.PI;bot.vx=bot.vy=0;
   return {moving,sideways,aligned,movingFired,turnedFired};
  },
  natural(skill){
   const bot=state.tanks[1],human=state.tanks[0];
   botBrains.clear();bot.a=0;bot.vx=0;bot.vy=150;
   human.vx=human.vy=0;
   let first=0,earliestStable=0,maxSlowed=0,shotSpeed=null,
    fastestAttempt=0,misalignmentBlocked=0,observations=0,hadPlan=false;
   for(let f=1;f<=210;f++){
    const brainBefore=botBrains.get(1);
    const before=brainBefore?botAimPosture(bot,brainBefore,skill):null;
    const b=botInput(1,1/60),brain=botBrains.get(1);
    if(Number.isFinite(brain?.fireAngle)){
     hadPlan=true;observations++;
     const current=botAimPosture(bot,brain,skill);
     const travel=Math.hypot(b.moveX,b.moveY);
     if(brain.fireRecover<=0&&travel<.32)maxSlowed++;
     if(current.steady&&earliestStable===0)earliestStable=f;
     if(brain.fireTrack>1/600&&(!current.steady)&&!first)
      misalignmentBlocked++;
     if(b.fire&&!first){
      first=f;shotSpeed=current.speed;fastestAttempt=current.moveCap;
     }
    }
    // Real physical heading, movement and collisions; never rotate the bot
    // directly to its requested angle to simulate acquisition.
    tankMove(bot,b,1/60,1);
    if(first)break;
   }
   return {first,earliestStable,maxSlowed,hadPlan,observations,shotSpeed,
    fastestAttempt,misalignmentBlocked};
  }
 };
}
const game=src.replace(ending,'\n('+hooks.toString()+')();\n})();');
const names=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','lan-room.js','lan-series.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!names.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?game:fs.readFileSync(path.join(root,file)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:binary,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[],errors=[];
try{
 for(const viewport of [{width:740,height:360},{width:915,height:412}]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__aiPosture);
  for(const kind of ['pilot','tank'])for(const skill of ['casual','normal','spicy']){
   const setup=await page.evaluate(({kind,skill})=>window.__aiPosture.setup(kind,skill),{kind,skill});
   assert.equal(setup.los,true,'real game line of sight for controlled target');
   assert.equal(setup.both,true,'real game actors actually shown in local camera');
   const p=await page.evaluate(skill=>window.__aiPosture.probes(skill),skill);
   assert.equal(p.moving.first,0,'fast moving bot cannot fire even while muzzle already aligned');
   assert.equal(p.moving.maxTrack,0,'fast moving bot cannot charge firing progress');
   assert.equal(p.sideways.first,0,'bot must physically turn to committed shot angle');
   assert.equal(p.sideways.maxTrack,0,'unaligned bot cannot prepare shot while moving independently');
   assert.ok(p.aligned.first>0&&p.aligned.first<=33,'stationary aligned bot retains deliberate skill delay');
   assert.ok(Math.abs(Math.abs(p.aligned.angle)-Math.PI)<.13,'aim is an actual world-geometry target bearing');
   await page.evaluate(({kind,skill})=>window.__aiPosture.setup(kind,skill),{kind,skill});
   const n=await page.evaluate(skill=>window.__aiPosture.natural(skill),skill);
   assert.equal(n.hadPlan,true,'live bot searches and commits to a real aim heading');
   assert.ok(n.maxSlowed>4,'bot visibly brakes while aiming, rather than attacking at full navigation pace');
   assert.ok(n.earliestStable>0,'normal movement converges to alignment and low speed');
   assert.ok(n.first>=n.earliestStable+5,'bot does not instant-fire at the moment of settling');
   assert.ok(n.first>13,'bot cannot start with a perfect shot while driving and facing away');
   assert.ok(n.shotSpeed<=n.fastestAttempt,'shot obeys difficulty- and vehicle-specific travel cap');
   assert.equal(n.misalignmentBlocked,0,'aim progress cannot remain charged while unsteady');
   results.push({viewport,kind,skill,probes:p,natural:n});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/ai-aim-posture-m2-a1.json',JSON.stringify({results},null,2));
 console.log('AI_PHYSICAL_AIM_SETTLE_REAL_BROWSER_PASS '+JSON.stringify({scenarios:results.length,
  allTurned:true,fastStrafingBlocked:true,normalAiEngagement:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
