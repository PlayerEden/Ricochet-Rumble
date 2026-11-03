// M2-AI2: real Chromium, actual source game and wall/actor geometry.
// Faster *earned* windows must never allow shots while still turning/driving.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required for actual engine AI fairness');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const tail=/\}\)\(\);\s*$/;assert.ok(tail.test(source),'game IIFE must be intact');
function hooks(){
 window.__rareQA={
  setup(kind,skill,seed=222){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',matchModeId:kind==='pilot'?'cqc':'scored_ffa',
    botCount:1,teamMode:'ffa',botSkill:skill,pilotMode:true,startLives:3},seed);
   botBrains.clear();fireCooldown.fill(0);releaseControls();
   const h=state.tanks[0],b=state.tanks[1],x=mazeGrid.cell*2.5,y=mazeGrid.cell*2.5;
   h.x=x-25;h.y=y;b.x=x+37;b.y=y;
   h.a=0;b.a=Math.PI;
   h.vx=h.vy=b.vx=b.vy=0;
   h.onFoot=b.onFoot=kind==='pilot';h.shield=120;b.shield=0;
   if(kind!=='pilot')for(const t of [h,b]){
    const v=state.vehicles[t.vehicleId];v.type='tank';v.armor=vehicleDef(v).armor;
   }
   state.lives[0]=state.lives[1]=1;state.winner=-1;state.bullets=[];
   camera.x=140;camera.y=180;camera.zoom=1;
   return {los:hasLineOfSight(b.x,b.y,h.x,h.y),
    visible:pilotInLocalView(b.x,b.y)&&pilotInLocalView(h.x,h.y),
    matchSeed:state.mazeSeed,skill,kind};
  },
  survey(skill,seed,kind){
   const h=state.tanks[0],b=state.tanks[1],seen={
    x:h.x,y:h.y,index:0,onFoot:h.onFoot,live:true};
   const results=[];
   for(let shots=0;shots<42;shots++){
    b.a=Math.PI;b.vx=b.vy=0;
    const brain={timer:0,path:[],goal:-1,fireTarget:-1,fireTrack:0,
     fireRecover:0,fireShots:shots};
    let first=0,early=null;
    for(let f=1;f<=60;f++){
     const o=botFireCommit(brain,b,h,skill,1/60,true,true,1,seen);
     if(f===1)early={quick:brain.fireQuick,bank:brain.fireBank,
      angle:brain.fireAngle,ready:botAimPosture(b,brain,skill).steady};
     if(o.fire){first=f;break}
    }
    results.push({shots,first,quick:early.quick,bank:early.bank,
      angle:early.angle,ready:early.ready});
   }
   const fast=results.filter(r=>r.quick),usual=results.filter(r=>!r.quick);
   const period=skill==='spicy'?4:skill==='casual'?7:5;
   // No stale target/hidden pilot/LOS bypass for a nominally lucky slot.
   const marked=fast[0];
   let held=null,turn=null,occluded=null,bankDenied=null;
   if(marked){
    const run=(speed,heading,hidden=false)=>{
     b.a=heading;b.vx=speed;b.vy=0;
     const brain={timer:0,path:[],goal:-1,fireTrack:0,fireShots:marked.shots};
     let fired=false,highest=0,staleQuick=false;
     for(let f=0;f<80;f++){
      const v=botFireCommit(brain,b,h,skill,1/60,!hidden,true,1,
       hidden?null:seen);
      fired ||= v.fire;
      highest=Math.max(highest,brain.fireTrack||0);
      staleQuick ||= brain.fireQuick===true;
     }
     return {fired,highest,quick:brain.fireQuick,staleQuick};
    };
    held=run(155,Math.PI);turn=run(0,0);occluded=run(0,Math.PI,true);
    // A bank shot is never a shortcut, even for a matching phase.
    const fake={fireShots:marked.shots,fireAngle:Math.PI,fireBank:true};
    b.a=Math.PI;b.vx=b.vy=0;
    bankDenied=botQuickOpening(fake,b,seen,skill,1);
   }
   return {results,period,fastCount:fast.length,
    usualCount:usual.length,held,turn,occluded,bankDenied,
    baseline:botAimDelay(skill,false,false),quickDelay:botAimDelay(skill,false,true),
    pilotBase:botAimDelay(skill,true,false),pilotFast:botAimDelay(skill,true,true),
    seed};
  },
  cue(skill){
   const h=state.tanks[0],b=state.tanks[1];
   if(h.onFoot)return {skipped:true};
   const shotNums=Array.from({length:48},(_,i)=>i+2);
   for(const shots of shotNums){
    b.a=Math.PI;b.vx=b.vy=0;
    const seen={x:h.x,y:h.y,index:0,onFoot:false,live:true};
    const brain={fireTarget:-1,fireTrack:0,fireRecover:0,fireShots:shots};
    botFireCommit(brain,b,h,skill,1/60,true,true,1,seen);
    if(!brain.fireQuick)continue;
    brain.fireTrack=botAimDelay(skill,false,true)*.60;
    botBrains.set(1,brain);
    const cue=enemyBotCue(1,0);
    return {found:true,reported:cue?.progress??null,phase:cue?.phase,
      expected:brain.fireTrack/botAimDelay(skill,false,true)};
   }
   return {found:false};
  },
  actualHost(){
   mode='host';state.config.lanHostSolo=true;
   const input=botInput(1,1/60);
   return {bot:input.bot,brain:botBrains.has(1),lanHostSolo:state.config.lanHostSolo};
  }
 };
}
const js=source.replace(tail,'\n('+hooks.toString()+')();\n})();');
const files=new Set(['index.html','style.css','game.js','scored-match.js',
 'forward-bays.js','dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js',
 'daily-sector.js','lan-room.js','lan-series.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!files.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?js:fs.readFileSync(path.join(root,file)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const data=[],errors=[];
try{
 for(const viewport of [{width:740,height:360},{width:915,height:412}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__rareQA);
  for(const skill of ['casual','normal','spicy']){
   const init=await page.evaluate(skill=>window.__rareQA.setup('tank',skill,222),skill);
   assert.ok(init.los&&init.visible,'fixture uses live human-visible, real wall LOS');
   const stats=await page.evaluate(skill=>window.__rareQA.survey(skill,222,'tank'),skill);
   const fast=stats.results.filter(x=>x.quick),slow=stats.results.filter(x=>!x.quick);
   assert.equal(stats.results.length,42,'fixed sample window');
   assert.ok(fast.length>=3&&fast.length<=11,'rare opportunities occur, not every shot');
   assert.ok(fast.length<slow.length/2,'never permanently boosted AI');
   assert.equal(stats.results[0].quick,false,'first ever shot uses full fair aim');
   assert.equal(stats.results[1].quick,false,'second shot uses full fair aim');
   assert.ok(stats.results.every(x=>x.first>0&&x.first<50),'all normal and lucky shots follow actual timing');
   assert.ok(stats.results.every(x=>!x.bank&&x.ready),'real visible geometric direct shots only');
   const minFast=Math.max(...fast.map(x=>x.first)),minSlow=Math.min(...slow.map(x=>x.first));
   assert.ok(minFast+2<=minSlow,'quick shots materially faster but still have visible acquisition frames');
   assert.ok(stats.quickDelay>=.18&&stats.quickDelay<stats.baseline,
    'quick shot is a modest bounded delay adjustment, not immediate fire');
   assert.equal(stats.pilotFast,stats.pilotBase,'pilot protection unchanged');
   assert.equal(stats.held.fired,false,'fast sideways bot cannot fire even in a quick window');
   assert.equal(stats.held.highest,0,'fast bot never charges a quick shot');
   assert.equal(stats.turn.fired,false,'off-angle bot cannot fire in a quick window');
   assert.equal(stats.turn.highest,0,'off-angle bot cannot charge a quick shot');
   assert.equal(stats.occluded.fired,false,'no hidden target fire');
   assert.equal(stats.occluded.quick,false,'lost LOS cancels lucky shot state');
   assert.equal(stats.bankDenied,false,'wall banking cannot receive quick window');
   const cue=await page.evaluate(skill=>window.__rareQA.cue(skill),skill);
   assert.ok(cue.found&&cue.phase==='acquire','real cue rendered for accelerated shot');
   assert.ok(Math.abs(cue.reported-cue.expected)<.00001&&Math.abs(cue.reported-.6)<.00001,
    'telegraph readiness is timed with actual fast acquisition');
   const guestSeat=await page.evaluate(()=>window.__rareQA.actualHost());
   assert.ok(guestSeat.bot&&guestSeat.brain&&guestSeat.lanHostSolo,
    'vacant LAN guest slot still uses real AI');
   // Pilot-only always gets previous fair delay, and is never quick.
   const pilot=await page.evaluate(skill=>window.__rareQA.setup('pilot',skill,111),skill);
   assert.ok(pilot.visible&&pilot.los);
   const pilotStats=await page.evaluate(skill=>window.__rareQA.survey(skill,111,'pilot'),skill);
   assert.equal(pilotStats.fastCount,0,'never quick-shot a fragile foot pilot');
   assert.ok(pilotStats.results.every(x=>x.first>0),'pilot retains a normal aim window');
   data.push({viewport,skill,fastCount:fast.length,normalCount:slow.length,
    standardFrames:minSlow,quickFrames:minFast,cue,protectedPilot:true});
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no Chromium runtime exception');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/bot-rare-opportunities-m2-a2.json',JSON.stringify({data},null,2));
 console.log('BOT_RARE_QUICK_OPENING_REAL_BROWSER_PASS '+JSON.stringify({
  cases:data.length,skills:3,viewports:2,lowFrequency:true,
  physicalPostureStillRequired:true,noPilotAdvantage:true,accurateTelegraph:true}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
