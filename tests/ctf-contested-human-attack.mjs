// Input-driven, ARMED Cyan attacker against genuine Coral CTF defender.
// Planner uses normal movement, aim vectors, intermittent FIRE and EXIT.
// No actor teleport, privileged stats, hidden-position targeting, flag mutation or collision bypass.
// The script is NOT a skilled human and cannot certify difficulty or capture balance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';

const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN is required');
const dir=path.resolve('web');
const source=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;
assert.ok(ending.test(source),'recognizable real engine closure');
assert.ok(source.includes('i===0?makeControl(true)'),'test input integration anchor');
const hooked=source.replace('i===0?makeControl(true)',
 'i===0?(window.__ctfContestQA?.input()||makeControl(true))')
 .replace(ending,'\n('+installQA.toString()+')();\n})();');

function installQA(){
 const api={
  get state(){return state;},
  begin(seed,mapSize){
   mode='solo';paused=true;
   state=initialState(0,{mapSize,matchModeId:'scored_tdm',pilotMode:true,
    teamMode:'teams',botCount:3,botSkill:'normal',forwardBayExercise:true,
    ctfExercise:true,quickPlayMatch:false},seed);
   this.planner={timer:0,goal:-1,path:[],stuck:0,last:null,exitAttempts:0,fireTimer:0,
     lastFxId:0};
   this.log={seed,mapSize,frames:0,steps:0,humanTravel:0,humanExit:false,
    humanPickups:0,firstHumanPickup:null,carriedFrames:0,defenderInterceptFrames:0,
    defenderIncorrectFrames:0,defenderChangedPosition:0,escortSupportFrames:0,
    humanCaptures:0,defenderFireFrames:0,enemyFlagReturns:0,
    humanShots:0,aimCandidates:0,humanKOs:0,
    defenderTravelDuringCarry:0,firstDefenderCarrierRange:null,
    nearestDefenderCarrierRange:Infinity,lastDefenderFrame:null,events:[],
    invalid:[],nearestToEnemyFlag:Infinity,lastSeq:state.ctf.seq,
    firstDefenderPosition:null,lastDefenderPosition:null};
   return {seed,mapSize,start:{x:state.tanks[0].x,y:state.tanks[0].y},
    target:state.ctf.flags[1].home,
    roles:[1,2,3].map(i=>window.SectorCtfAI.roleFor(i,1,ctfActors()))};
  },
  input(){
   const t=state.tanks[0],m=this.log,b=this.planner;
   if(!m||state.lives[0]<=0)return {moveX:0,moveY:0,fire:false};
   const flag=state.ctf.flags[1];
   const carrying=flag.carrier===0;
   const target=carrying?state.ctf.flags[0].home:
    flag.carrier===null?flag:flag.home;
   const dist=Math.hypot(t.x-target.x,t.y-target.y);
   // Exactly the ordinary EXIT button logic; the flag still requires pilot
   // proximity, real pick-up, and a valid home flag before scoring.
   if(!carrying&&!t.onFoot&&dist<98&&hasLineOfSight(t.x,t.y,target.x,target.y)){
    b.exitAttempts++;
    if(tryInteract(0))m.humanExit=true;
   }
   const grid=mazeGrid;
   if(!grid)return {moveX:0,moveY:0,fire:false};
   const {cols,cell,open}=grid;
   const index=p=>clamp(Math.floor(p.y/cell),0,grid.rows-1)*cols+
     clamp(Math.floor(p.x/cell),0,cols-1);
   const start=index(t),goal=index(target);
   b.timer-=1/60;
   if(b.timer<=0||b.goal!==goal){
    const prev=Array(open.length).fill(-1),q=[start];prev[start]=start;
    for(let h=0;h<q.length&&prev[goal]===-1;h++)
     for(const j of open[q[h]])if(prev[j]===-1){prev[j]=q[h];q.push(j);}
    const route=[];
    if(prev[goal]!==-1){
     let n=goal;
     while(n!==start&&route.length<open.length){route.push(n);n=prev[n];}
    }
    b.path=route.reverse();b.goal=goal;b.timer=.28;
   }
   let waypoint=target;
   if(b.path.length){
    const n=b.path[0],p={x:((n%cols)+.5)*cell,y:(Math.floor(n/cols)+.5)*cell};
    if(Math.hypot(t.x-p.x,t.y-p.y)<24)b.path.shift();
    else waypoint=p;
   }
   let angle=Math.atan2(waypoint.y-t.y,waypoint.x-t.x);
   const moved=b.last?Math.hypot(t.x-b.last.x,t.y-b.last.y):100;
   if(moved<.06&&dist>55)b.stuck+=1/60;else b.stuck=0;
   b.last={x:t.x,y:t.y};
   if(b.stuck>1)angle+=((Math.floor(b.stuck/.8)%2)?1:-1)*1.14;
   const pace=dist<26?.35:1;
   // The attacking cyan pilot/tank only aims at hostile units in a
   // conservative on-screen rectangle and clear LOS. Never use hidden bots.
   // Seat 2 is our cyan escort; seats 1 and 3 are opposing Coral actors.
   const visible=[1,3].map(i=>state.lives[i]>0?state.tanks[i]:null)
    .filter(enemy=>enemy&&Math.abs(enemy.x-t.x)<175&&
     Math.abs(enemy.y-t.y)<85&&hasLineOfSight(t.x,t.y,enemy.x,enemy.y))
    .sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y));
   b.fireTimer=Math.max(0,b.fireTimer-1/60);
   let aimX,aimY,fire=false;
   if(visible.length){
    this.log.aimCandidates++;
    const enemy=visible[0],dx=enemy.x-t.x,dy=enemy.y-t.y,
     d=Math.hypot(dx,dy)||1;
    aimX=dx/d;aimY=dy/d;
    const targetAngle=Math.atan2(dy,dx),
     headingError=Math.abs(Math.atan2(Math.sin(targetAngle-t.a),Math.cos(targetAngle-t.a)));
    // A single FIRE pulse, respecting the actual game cooldown and hull/
    // pilot turn limit. The engine creates each real projectile via shoot().
    if(b.fireTimer<=0&&fireCooldown[0]<=1/60&&headingError<.11){
     fire=true;b.fireTimer=t.onFoot?.55:.55;
    }
   }
   return {moveX:Math.cos(angle)*pace,moveY:Math.sin(angle)*pace,
    aimX,aimY,fire};
  },
  advance(frames){
   const m=this.log;
   paused=false;
   try{
    for(let k=0;k<frames&&state.winner<0;k++){
     const old=state.tanks[0],px=old.x,py=old.y;
     step(1/60);m.frames++;m.steps=state.ctf.elapsed;
     const human=state.tanks[0],flag=state.ctf.flags[1],actors=ctfActors();
     m.humanTravel+=Math.hypot(human.x-px,human.y-py);
     for(const fx of state.fxEvents){
      if(fx.id>this.planner.lastFxId&&fx.kind==='shot'&&fx.owner===0)m.humanShots++;
      if(fx.id>this.planner.lastFxId)this.planner.lastFxId=fx.id;
     }
     m.nearestToEnemyFlag=Math.min(m.nearestToEnemyFlag,Math.hypot(human.x-flag.home.x,human.y-flag.home.y));
     if(flag.carrier===0){
      m.carriedFrames++;
      if(m.firstHumanPickup===null){m.firstHumanPickup=+state.ctf.elapsed.toFixed(2);m.humanPickups++;}
      const decision=window.SectorCtfAI.choose({
       index:3,humanCount:1,actors,flags:state.ctf.flags,bays:state.forwardBays.bays});
      if(decision?.kind==='intercept'&&Math.hypot(decision.point.x-human.x,decision.point.y-human.y)<1)
       m.defenderInterceptFrames++;
      else m.defenderIncorrectFrames++;
      const escort=window.SectorCtfAI.choose({
       index:2,humanCount:1,actors,flags:state.ctf.flags,bays:state.forwardBays.bays});
      if(escort?.kind==='escort'&&Math.hypot(escort.point.x-human.x,escort.point.y-human.y)<1)
       m.escortSupportFrames++;
      const defender=state.tanks[3];
      const range=Math.hypot(defender.x-human.x,defender.y-human.y);
      if(m.firstDefenderCarrierRange===null)m.firstDefenderCarrierRange=range;
      m.nearestDefenderCarrierRange=Math.min(m.nearestDefenderCarrierRange,range);
      if(m.lastDefenderFrame)m.defenderTravelDuringCarry+=
       Math.hypot(defender.x-m.lastDefenderFrame.x,defender.y-m.lastDefenderFrame.y);
      m.lastDefenderFrame={x:defender.x,y:defender.y};
      if(m.firstDefenderPosition===null)m.firstDefenderPosition={x:defender.x,y:defender.y};
      m.lastDefenderPosition={x:defender.x,y:defender.y};
     }
     if(state.ctf.seq!==m.lastSeq){
      const e=state.ctf.event;
      m.events.push({at:+state.ctf.elapsed.toFixed(2),kind:e.kind,team:e.team,actor:e.actor});
      if(e.kind==='captured'&&e.team===0&&e.actor===0)m.humanCaptures++;
      if(e.kind==='returned'&&e.team===1)m.enemyFlagReturns++;
      m.lastSeq=state.ctf.seq;
     }
     if(!Number.isFinite(human.x)||!Number.isFinite(human.y)||
        human.x<0||human.y<0||human.x>worldW||human.y>worldH){
      m.invalid.push('human position '+m.frames);break;
     }
    }
   }finally{paused=true;}
   return {frames:m.frames,score:state.ctf.scores.slice(),
    caught:m.firstHumanPickup!==null,finished:state.ctf.finished};
  },
  result(){
   const m=this.log;return {...m,finalScores:state.ctf.scores.slice(),
    finalReason:state.ctf.reason,humanDeaths:state.deaths[0],
    humanKOs:state.kos[0],lastDefenderFrame:undefined,
    defenderDisplacement:m.firstDefenderPosition&&m.lastDefenderPosition?
     Math.hypot(m.lastDefenderPosition.x-m.firstDefenderPosition.x,
      m.lastDefenderPosition.y-m.firstDefenderPosition.y):null};
  }
 };
 window.__ctfContestQA=api;
}
const allowed=new Set(['index.html','style.css','game.js','ctf-rules.js','ctf-ai.js',
 'forward-bays.js','daily-sector.js','dossier.js','save-backup.js','scored-match.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':
 name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?hooked:fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[{seed:101,mapSize:'small'},{seed:102,mapSize:'small'},
 {seed:104,mapSize:'small'},{seed:201,mapSize:'standard'}];
const results=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:740,height:360}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('button[data-action="modes"]').click();
 await page.locator('.bay-exercise-fold summary').click();
 await page.locator('button[data-action="ctf"]').click();
 await page.waitForFunction(()=>!!window.__ctfContestQA?.state?.ctf&&!!window.SectorCtfAI,
  null,{timeout:15000});
 for(const c of cases){
  const init=await page.evaluate(v=>window.__ctfContestQA.begin(v.seed,v.mapSize),c);
  assert.deepEqual(init.roles,['runner','escort','defender']);
  for(let f=0;f<180*60;f+=300){
   const p=await page.evaluate(n=>window.__ctfContestQA.advance(n),300);
   if(p.finished||p.frames>=180*60)break;
  }
  const result=await page.evaluate(()=>window.__ctfContestQA.result());
  results.push(result);
  console.log('CTF_CONTESTED_CASE '+JSON.stringify({
   seed:c.seed,map:c.mapSize,pickup:result.firstHumanPickup,
   carriedFrames:result.carriedFrames,humanDistance:+result.humanTravel.toFixed(1),
   closestFlag:+result.nearestToEnemyFlag.toFixed(1),
   defenderIntercept:result.defenderInterceptFrames,escortSupport:result.escortSupportFrames,
   defenderMovement:result.defenderDisplacement,
   defenderTravelDuringCarry:result.defenderTravelDuringCarry,
   firstDefenderCarrierRange:result.firstDefenderCarrierRange,
   nearestDefenderCarrierRange:result.nearestDefenderCarrierRange,
   humanShots:result.humanShots,aimCandidates:result.aimCandidates,
   humanKOs:result.humanKOs,humanCaptures:result.humanCaptures,
   humanDeaths:result.humanDeaths,events:result.events,invalid:result.invalid}));
  assert.deepEqual(result.invalid,[]);
 }
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/ctf-contested-human-attack.json',
  JSON.stringify({method:'scripted legitimate movement, intermittent aimed FIRE, EXIT, full maze and real collision/flag rules; not a skilled-human balance test',
   cases:results},null,2));
 assert.deepEqual(errors,[],'no uncaught browser exceptions');
 const successful=results.filter(x=>x.carriedFrames>0);
 assert.ok(successful.length>0,'at least one human reaches and steals the real flag');
 assert.ok(successful.some(x=>x.defenderInterceptFrames>0),
  'Coral defender chooses intercept against a real human carrier');
 assert.ok(successful.some(x=>x.escortSupportFrames>0),
  'Cyan escort identifies and supports its human flag carrier');
 assert.ok(results.some(x=>x.aimCandidates>0),
  'scripted attacker sees a hostile at legal screen-like range with clear LOS');
 assert.ok(results.some(x=>x.humanShots>0),
  'scripted attacker actually fires at least one legal engine-created shot');
 console.log('CTF_CONTESTED_ARMED_ATTACK_PASS: legitimate movement, actual engine shots, flag theft and objective response (capture balance not proven)');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
