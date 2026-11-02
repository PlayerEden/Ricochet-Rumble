// Real browser/prod-engine Solo bot awareness QA. Firing still has normal
// LOS requirements; hidden moving players must not silently update pursuit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const dir=path.resolve('web'),source=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const trailer=/\}\)\(\);\s*$/;assert.ok(trailer.test(source),'runtime IIFE');
function hooks(){
 window.__pursuitQA={
  run(seed,kind){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',pilotMode:true,botCount:1,
    matchModeId:kind==='pilot'?'cqc':'scored_ffa',teamMode:'ffa',botSkill:'normal'},seed);
   state.pickups=[];state.winner=-1;state.lives[0]=3;state.lives[1]=3;
   const human=state.tanks[0],bot=state.tanks[1];
   human.onFoot=bot.onFoot=kind==='pilot';
   if(kind!=='pilot')for(const t of [human,bot]){
    const v=state.vehicles[t.vehicleId];v.type=kind;v.armor=vehicleDef(v).armor;
   }
   human.shield=0;bot.shield=0;botBrains.clear();
   let openPair=null,wallPair=null;
   const cell=mazeGrid.cell,cols=mazeGrid.cols,rows=mazeGrid.rows;
   for(let y=1;y<rows-1;y++)for(let x=1;x<cols-2;x++){
    const index=y*cols+x,right=index+1;
    const a={x:(x+.5)*cell,y:(y+.5)*cell};
    const b={x:(x+1.5)*cell,y:a.y};
    if(!openPair&&mazeGrid.open[index].includes(right)&&
      hasLineOfSight(a.x,a.y,b.x,b.y))openPair=[a,b];
    if(!wallPair&&!mazeGrid.open[index].includes(right)&&
      !hasLineOfSight(a.x,a.y,b.x,b.y))wallPair=[a,b];
   }
   if(!openPair||!wallPair)throw Error('Expected visible and blocked physical maze pairs');
   bot.x=openPair[0].x;bot.y=openPair[0].y;
   human.x=openPair[1].x;human.y=openPair[1].y;
   camera.zoom=1;camera.x=(bot.x+human.x)/2-W/2;camera.y=human.y-H/2;
   const brain={timer:0,path:[],goal:-1};
   const initiallyVisible=pilotBotFireFair(bot,human)&&
     hasLineOfSight(bot.x,bot.y,human.x,human.y);
   const tracking=soloBotPursuitPoint(1,human,brain,1/60);
   const seen={x:human.x,y:human.y};
   bot.x=wallPair[0].x;bot.y=wallPair[0].y;
   human.x=wallPair[1].x;human.y=wallPair[1].y;
   const hidden=!hasLineOfSight(bot.x,bot.y,human.x,human.y);
   const snapshot=soloBotPursuitPoint(1,human,brain,1/60);
   const hiddenActual={x:human.x,y:human.y};
   human.x=wallPair[1].x+cell*.25;
   const remembered=soloBotPursuitPoint(1,human,brain,.1);
   const blockedFire=botFireCommit(brain,bot,human,'normal',1/60,false,true,1);
   for(let j=0;j<120;j++)soloBotPursuitPoint(1,human,brain,1/60);
   const searched=soloBotPursuitPoint(1,human,brain,1/60);
   const secret={x:human.x,y:human.y};
   human.x=wallPair[1].x+cell*.05;
   const another=soloBotPursuitPoint(1,human,brain,1/60);
   const patrolActive=!!brain.searchPoint; // Capture BEFORE reacquisition clears search.
   // Host/CTF retain their old objective behavior, unchanged by the Solo-only prototype.
   mode='host';const lan=soloBotPursuitPoint(1,human,brain,1/60)===human;
   mode='solo';state.ctf={};state.config.ctfExercise=true;
   const ctf=soloBotPursuitPoint(1,human,brain,1/60)===human;
   state.ctf=null;state.config.ctfExercise=false;
   bot.x=openPair[0].x;bot.y=openPair[0].y;
   human.x=openPair[1].x;human.y=openPair[1].y;
   camera.x=(bot.x+human.x)/2-W/2;camera.y=human.y-H/2;
   const reacquired=soloBotPursuitPoint(1,human,brain,1/60);
   return {kind,seed,initiallyVisible,trackingActual:tracking===human,
    hidden,rememberedX:snapshot.x,rememberedY:snapshot.y,
    afterMovementX:remembered.x,afterMovementY:remembered.y,
    seen,hiddenActual,blockedFire:blockedFire.fire,
    searchX:searched.x,searchY:searched.y,searchOtherX:another.x,
    searchOtherY:another.y,secret,patrolActive,
    lan,ctf,reacquiredActual:reacquired===human};
  }
 };
}
const game=source.replace(trailer,'\n('+hooks.toString()+')();\n})();');
const allow=new Set(['index.html','style.css','game.js','scored-match.js',
 'forward-bays.js','dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const f=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allow.has(f)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':
  f.endsWith('.css')?'text/css':'text/html'});
 res.end(f==='game.js'?game:fs.readFileSync(path.join(dir,f)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try {
 for(const viewport of [{width:568,height:320},{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__pursuitQA);
  for(const kind of ['pilot','tank','mech'])for(const seed of [101,202,303]){
   const r=await page.evaluate(({seed,kind})=>window.__pursuitQA.run(seed,kind),{seed,kind});
   assert.equal(r.initiallyVisible,true,'real visible open corridor '+kind);
   assert.equal(r.trackingActual,true,'clear LOS sees current target');
   assert.equal(r.hidden,true,'real maze wall blocks target');
   assert.equal(r.rememberedX,r.seen.x,'cover remembers last visible X');
   assert.equal(r.rememberedY,r.seen.y,'cover remembers last visible Y');
   assert.equal(r.afterMovementX,r.seen.x,'moving behind cover does not leak X');
   assert.equal(r.afterMovementY,r.seen.y,'moving behind cover does not leak Y');
   assert.equal(r.blockedFire,false,'cannot fire at lost target');
   assert.equal(r.patrolActive,true,'memory expiration returns to patrol');
   assert.equal(r.searchX,r.searchOtherX,'patrol ignores hidden X');
   assert.equal(r.searchY,r.searchOtherY,'patrol ignores hidden Y');
   assert.ok(r.searchX!==r.secret.x||r.searchY!==r.secret.y,'patrol not set to secret target');
   assert.equal(r.lan,true,'host remains unchanged');
   assert.equal(r.ctf,true,'CTF remains unchanged');
   assert.equal(r.reacquiredActual,true,'fresh sight reacquires target');
   cases.push({viewport,kind,seed,verified:true});
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no browser errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/solo-bot-last-seen.json',JSON.stringify({cases},null,2));
 console.log('SOLO_BOT_LAST_SEEN_REAL_BROWSER_PASS '+JSON.stringify({
  fixtures:cases.length,viewports:3,weapons:3,seeds:3,
  coverMemory:true,hiddenTargetNotTracked:true,searchFallback:true,
  ctfUntouched:true,lanUntouched:true,reacquisition:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
