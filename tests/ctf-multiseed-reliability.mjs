// CTF objective bots: 18 full-duration seeded CTF matches, actual game movement and flag rules.
// No relocation, teleport, altered combat stats, shortened bay distances or mocked movement.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN required');
const dir=path.resolve('web'),source=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;
assert.ok(ending.test(source),'game source must have expected closure');
const hook=`
window.__ctfNaturalQA={
 get state(){return state;},
 begin(seed,mapSize){
  mode='solo';paused=true;
  state=initialState(0,{mapSize,matchModeId:'scored_tdm',pilotMode:true,
   teamMode:'teams',botCount:3,botSkill:'normal',forwardBayExercise:true,
   ctfExercise:true,quickPlayMatch:false},seed);
  const homes=state.ctf.flags.map(f=>({...f.home}));
  this.stats={seed,mapSize,homes,frames:0,seconds:0,events:[],
   initialRunnerDistance:Math.hypot(state.tanks[1].x-homes[0].x,state.tanks[1].y-homes[0].y),
   closestRunnerToFlag:Infinity,runnerDistance:0,
   runnerMaxDisplacement:0,escortCloseFrames:0,defenderHomeFrames:0,
   escortDecisions:{},defenderDecisions:{},runnerDecisions:{},
   runnerPilotFrames:0,invalid:[],maxFrameMotion:0,samples:[],
   stalledSeconds:0,longestStall:0,currentStall:0,stallEpisodes:0,previousRunnerSecond:null,
   prior:state.tanks.map(t=>({x:t.x,y:t.y})),
   start:state.tanks.map(t=>({x:t.x,y:t.y})),lastEventSeq:state.ctf.seq};
  return {roles:[1,2,3].map(i=>window.SectorCtfAI.roleFor(i,state.humanCount,ctfActors())),
   initialRunnerDistance:this.stats.initialRunnerDistance,homes,seed,mapSize};
 },
 advance(frames){
  const m=this.stats;if(!m)throw Error('begin required');
  paused=false;
  try{
   for(let k=0;k<frames&&state.winner<0;k++){
    const before=state.tanks.map(t=>({x:t.x,y:t.y}));
    const oldRespawns=state.respawns.slice();
    step(1/60);m.frames++;m.seconds=state.ctf.elapsed;
    const actors=ctfActors(),flags=state.ctf.flags,bays=state.forwardBays.bays;
    for(let i=1;i<=3;i++){
     const t=state.tanks[i],last=before[i],dist=Math.hypot(t.x-last.x,t.y-last.y);
     if(!Number.isFinite(t.x)||!Number.isFinite(t.y)||!Number.isFinite(t.vx)||!Number.isFinite(t.vy)||
        t.x<0||t.x>worldW||t.y<0||t.y>worldH)m.invalid.push('position '+i+'/'+m.frames);
     if(state.respawns[i]===oldRespawns[i]&&dist>m.maxFrameMotion)m.maxFrameMotion=dist;
     if(i===1){
      if(state.respawns[i]===oldRespawns[i])m.runnerDistance+=dist;
      m.runnerMaxDisplacement=Math.max(m.runnerMaxDisplacement,Math.hypot(t.x-m.start[i].x,t.y-m.start[i].y));
      m.closestRunnerToFlag=Math.min(m.closestRunnerToFlag,Math.hypot(t.x-m.homes[0].x,t.y-m.homes[0].y));
      if(t.onFoot)m.runnerPilotFrames++;
     }
    }
    const escort=window.SectorCtfAI.choose({index:2,humanCount:1,actors,flags,bays});
    const defender=window.SectorCtfAI.choose({index:3,humanCount:1,actors,flags,bays});
    const runner=window.SectorCtfAI.choose({index:1,humanCount:1,actors,flags,bays});
    for(const [key,choice] of [['escortDecisions',escort],['defenderDecisions',defender],['runnerDecisions',runner]])
     if(choice)m[key][choice.kind]=(m[key][choice.kind]||0)+1;
    if(Math.hypot(state.tanks[2].x-state.tanks[0].x,state.tanks[2].y-state.tanks[0].y)<170)m.escortCloseFrames++;
    if(Math.hypot(state.tanks[3].x-bays[1].x,state.tanks[3].y-bays[1].y)<180)m.defenderHomeFrames++;
    if(state.ctf.seq!==m.lastEventSeq){
     m.events.push({s:Number(m.seconds.toFixed(2)),kind:state.ctf.event?.kind,team:state.ctf.event?.team,actor:state.ctf.event?.actor});
     m.lastEventSeq=state.ctf.seq;
    }
    // Measure low-progress intervals, not just distance traveled while oscillating.
    if(m.frames%60===0){
     const t=state.tanks[1],goal=runner?.point,was=m.previousRunnerSecond;
     const moved=was?Math.hypot(t.x-was.x,t.y-was.y):0;
     const far=goal&&Math.hypot(t.x-goal.x,t.y-goal.y)>100;
     if(was&&was.alive&&state.lives[1]>0&&state.respawns[1]===was.respawns&&far&&moved<12){
      m.currentStall++;m.stalledSeconds++;
      m.longestStall=Math.max(m.longestStall,m.currentStall);
      if(m.currentStall===8)m.stallEpisodes++;
     }else m.currentStall=0;
     m.previousRunnerSecond={x:t.x,y:t.y,alive:state.lives[1]>0,respawns:state.respawns[1]};
    }
    if(m.invalid.length>10)break;
   }
  }finally{paused=true;}
  const t=state.tanks[1],br=botBrains.get(1)||{},grid=mazeGrid,
   cell=grid?Math.floor(t.y/grid.cell)*grid.cols+Math.floor(t.x/grid.cell):null;
  m.samples.push({s:Number(m.seconds.toFixed(1)),x:Number(t.x.toFixed(1)),
   y:Number(t.y.toFixed(1)),onFoot:t.onFoot,alive:state.lives[1]>0,
   cell,goal:br.goal,waypoint:br.path?.[0]??null,
   pathHead:br.path?.slice(0,5),stuckFor:Number((br.stuckFor||0).toFixed(2)),
   blocked:blocked(t.x,t.y,t.onFoot?10:21),
   movement:m.runnerDistance,
   wallLeft:[0,10,20,30,40,50,60,70,90].map(dx=>[dx,blocked(t.x-dx,t.y,t.onFoot?10:21)]),
   neighbors:grid?grid.open[cell]:[],
   defender:{x:state.tanks[3].x,y:state.tanks[3].y},
   closeWalls:wallSet.filter(w=>Math.abs(w.x-t.x)<145&&Math.abs(w.y-t.y)<145).slice(0,12)});
  return {frames:m.frames,seconds:m.seconds,finished:state.ctf.finished,invalid:m.invalid.length};
 },
 result(){
  const m=this.stats;return {...m,prior:undefined,start:undefined,lastEventSeq:undefined,
   finalScores:state.ctf.scores.slice(),finished:state.ctf.finished,
   finishReason:state.ctf.reason,winTeam:state.ctf.winner,
   finalFlagCarrier:state.ctf.flags.map(f=>f.carrier),
   respawns:state.respawns.slice(),deaths:state.deaths.slice(),
   improvement:m.initialRunnerDistance-m.closestRunnerToFlag};
 }
};
})();`;
const instrumented=source.replace(ending,hook);
const allowed=new Set(['index.html','style.css','game.js','ctf-rules.js','ctf-ai.js',
 'forward-bays.js','daily-sector.js','dossier.js','save-backup.js','scored-match.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':
  name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?instrumented:fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=['small','standard','large'].flatMap((mapSize,i)=>
 Array.from({length:6},(_,n)=>({mapSize,seed:(i+1)*100+n+1,seconds:360})));
const results=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:740,height:360}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 // The CTF modules are intentionally lazy-loaded only when selecting CTF.
 await page.locator('button[data-action="modes"]').click();
 await page.locator('.bay-exercise-fold summary').click();
 await page.locator('button[data-action="ctf"]').click();
 await page.waitForFunction(()=>!!window.SectorCtfAI&&!!window.SectorFlags&&!!window.__ctfNaturalQA.state.ctf);
 for(const c of cases){
  const start=await page.evaluate(c=>window.__ctfNaturalQA.begin(c.seed,c.mapSize),c);
  assert.deepEqual(start.roles,['runner','escort','defender']);
  const totalFrames=c.seconds*60;
  for(let i=0;i<totalFrames;i+=600){
   const state=await page.evaluate(n=>window.__ctfNaturalQA.advance(n),Math.min(600,totalFrames-i));
   if(state.finished||state.invalid)break;
  }
  const result=await page.evaluate(()=>window.__ctfNaturalQA.result());
  results.push(result);
  fs.mkdirSync('qa-results',{recursive:true});
  fs.writeFileSync('qa-results/ctf-multiseed-telemetry.json',
   JSON.stringify({source:'unassisted game.js physics and CTF rules',cases:results},null,2));
  const summary={seed:c.seed,mapSize:c.mapSize,frames:result.frames,seconds:+result.seconds.toFixed(2),
   score:result.finalScores,reason:result.finishReason,
   firstPickup:result.events.find(e=>e.kind==='picked')?.s??null,
   pickups:result.events.filter(e=>e.kind==='picked').length,
   drops:result.events.filter(e=>e.kind==='dropped').length,
   captures:result.events.filter(e=>e.kind==='captured').length,
   returns:result.events.filter(e=>e.kind==='returned').length,
   improvement:+result.improvement.toFixed(1),runnerTravel:+result.runnerDistance.toFixed(1),
   longestStall:result.longestStall,stallEpisodes:result.stallEpisodes,
   escortCloseFraction:+(result.escortCloseFrames/result.frames).toFixed(3),
   defenderHomeFraction:+(result.defenderHomeFrames/result.frames).toFixed(3),
   defenderInterceptionFrames:result.defenderDecisions.intercept||0,invalid:result.invalid.length};
  console.log('CTF_RELIABILITY_CASE '+JSON.stringify(summary));
  assert.deepEqual(result.invalid,[],'bounded and finite unassisted actors');
  assert.ok(result.frames>=1000,'meaningful natural match time');
  assert.ok(Number.isFinite(result.runnerDistance),'runner travel measured without relocation');
  assert.ok(result.maxFrameMotion<100,'no non-respawn frame teleport');
  assert.ok(Number.isFinite(result.improvement),'distance-to-flag measurement finite');
  assert.ok(result.finalScores.every(n=>Number.isInteger(n)&&n>=0&&n<=3),'valid captured flags');
  assert.equal(result.finished,true,'finish full 360s CTF clock or legitimate capture target');
  assert.ok(result.events.every(e=>['picked','dropped','returned','captured'].includes(e.kind)),
   'only actual game flag events');
 }
 assert.deepEqual(errors,[],'no browser runtime errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/ctf-multiseed-telemetry.json',
  JSON.stringify({source:'actual game.js; no relocations, no physics cheats',cases:results},null,2));
 const stats={count:results.length,byMap:{}};
for(const size of ['small','standard','large']){
 const sample=results.filter(r=>r.mapSize===size),n=sample.length;
 const avg=fn=>+(sample.reduce((v,r)=>v+fn(r),0)/n).toFixed(2);
 stats.byMap[size]={n,withPickup:sample.filter(r=>r.events.some(e=>e.kind==='picked')).length,
  withCapture:sample.filter(r=>r.events.some(e=>e.kind==='captured')).length,
  winnerDeclared:sample.filter(r=>r.finishReason==='capture_target').length,
  meanCaptures:avg(r=>r.events.filter(e=>e.kind==='captured').length),
  meanStallSeconds:avg(r=>r.stalledSeconds),
  longestStallSeconds:Math.max(...sample.map(r=>r.longestStall)),
  escortCloseFraction:avg(r=>r.escortCloseFrames/r.frames),
  defenderHomeFraction:avg(r=>r.defenderHomeFrames/r.frames),
  observedDefenderInterceptions:sample.filter(r=>(r.defenderDecisions.intercept||0)>0).length};
}
fs.writeFileSync('qa-results/ctf-multiseed-summary.json',JSON.stringify(stats,null,2));
console.log('CTF_RELIABILITY_SUMMARY '+JSON.stringify(stats));
console.log('CTF_MULTISEED_SAFETY_PASS: 18 full-clock natural real-game simulations; gameplay outcomes observational');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
