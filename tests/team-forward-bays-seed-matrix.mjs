// Actual Chromium game, not a mock, tests all mode types and true maze geometry.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(source));

function install(){
 window.__teamSpawnQA={
  sample(seed,mapSize,kind){
   const oldState=state,oldMode=mode;let result;
   try{
    mode='solo';paused=true;
    const opts={mapSize,botCount:kind==='coop'?4:3,botSkill:'normal',
     pilotMode:true,startLives:3,teamMode:kind==='coop'?'coop':
      kind==='ffa'||kind==='cqc'?'ffa':'teams',
     matchModeId:kind==='ctf'||kind==='scored_tdm'?'scored_tdm':
      kind==='cqc'?'cqc':null,
     ctfExercise:kind==='ctf',quickPlayMatch:false};
    state=initialState(0,opts,seed);
    const bays=state.forwardBays?.bays||[];
    const actors=state.tanks.map((t,i)=>{
     const team=teamOf(i),home=bays[team],index=Math.floor(t.y/mazeGrid.cell)*mazeGrid.cols+Math.floor(t.x/mazeGrid.cell);
     const dist=home?window.SectorForwardBays.routeDistances(mazeGrid.open,home.cellIndex)[index]:null;
     return {team,x:t.x,y:t.y,wall:blocked(t.x,t.y,t.onFoot?10:21),baySteps:dist};
    });
    const near=[];
    for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++)
     near.push({i,j,d:Math.hypot(actors[i].x-actors[j].x,actors[i].y-actors[j].y)});
    const garages=bays.map(b=>{
     const v=state.vehicles[b.vehicleId];
     return {occupied:v?.occupant??null,type:v?.type,
      wall:v?blocked(v.x,v.y,24):true,
      footprint:v?state.tanks.filter(t=>Math.hypot(t.x-v.x,t.y-v.y)<40).length:null,
      dist:v?Math.hypot(v.x-b.x,v.y-b.y):null};
    });
    let recovery=null;
    if(kind==='ctf'||kind==='scored_tdm'){
     if(creditScoredPilotKO(0,1)){
      const done=tryCqcRespawn(1),t=state.tanks[1],bay=bays[teamOf(1)];
      const d=window.SectorForwardBays.routeDistances(mazeGrid.open,bay.cellIndex);
      const at=Math.floor(t.y/mazeGrid.cell)*mazeGrid.cols+Math.floor(t.x/mazeGrid.cell);
      recovery={done,steps:done?d[at]:null,wall:done?blocked(t.x,t.y,12):null};
     }
    }else if(kind==='teams'||kind==='coop'){
     respawn(1);
     const t=state.tanks[1],bay=bays[teamOf(1)];
     const d=window.SectorForwardBays.routeDistances(mazeGrid.open,bay.cellIndex);
     const at=Math.floor(t.y/mazeGrid.cell)*mazeGrid.cols+Math.floor(t.x/mazeGrid.cell);
     recovery={done:true,steps:d[at],wall:blocked(t.x,t.y,12)};
    }
    result={seed,mapSize,kind,bays:bays.length,actors,near,garages,recovery,ctf:!!state.ctf};
   }finally{state=oldState;mode=oldMode;setArena(0,oldState.mazeSeed,oldState.config.mapSize);}
   return result;
  }
 };
}
const instrumented=source.replace(ending,'\n('+install.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'ctf-ai.js','ctf-rules.js','dossier.js','save-backup.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':
  name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?instrumented:fs.readFileSync(path.join(root,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],issues=[],stats={cases:0,perMode:{},baseCases:0,garageCount:0,respawnCount:0,
 respawnDeferred:0,minActorDistance:Infinity,maxBaySteps:0,maxRespawnSteps:0};
try{
 const page=await browser.newPage({viewport:{width:740,height:360}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('button[data-action="modes"]').click();
 await page.locator('.bay-exercise-fold summary').click();
 await page.locator('button[data-action="ctf"]').click();
 await page.waitForFunction(()=>!!window.__teamSpawnQA&&!!window.SectorFlags&&!!window.SectorCtfAI);
 for(const kind of ['teams','coop','scored_tdm','ctf','ffa','cqc'])
  for(const mapSize of ['small','standard','large'])
   for(let seed=1;seed<=12;seed++){
    const x=await page.evaluate(v=>window.__teamSpawnQA.sample(v.seed,v.mapSize,v.kind),{kind,mapSize,seed});
    stats.cases++;stats.perMode[kind]=(stats.perMode[kind]||0)+1;
    const expected=kind!=='ffa'&&kind!=='cqc';
    if((x.bays===2)!==expected)issues.push({kind,mapSize,seed,error:'base presence'});
    if(expected){
     stats.baseCases++;stats.garageCount+=x.garages.length;
     if(x.garages.length!==2||x.garages.some(g=>g.wall||g.occupied!==-1||g.type!=='tank'||g.dist>220||g.footprint>0))
      issues.push({kind,mapSize,seed,error:'garage',garages:x.garages});
     if(x.actors.some(t=>t.wall||t.baySteps<0||t.baySteps>7))
      issues.push({kind,mapSize,seed,error:'actor staging',actors:x.actors});
     stats.maxBaySteps=Math.max(stats.maxBaySteps,...x.actors.map(a=>a.baySteps));
     if(x.near.some(p=>p.d<43))issues.push({kind,mapSize,seed,error:'actor overlap',near:x.near.filter(p=>p.d<43)});
     stats.minActorDistance=Math.min(stats.minActorDistance,...x.near.map(p=>p.d));
     if(x.recovery?.done){
      stats.respawnCount++;stats.maxRespawnSteps=Math.max(stats.maxRespawnSteps,x.recovery.steps);
      if(x.recovery.steps<0||x.recovery.steps>7||x.recovery.wall)issues.push({kind,mapSize,seed,error:'respawn site',recovery:x.recovery});
     }else if(x.recovery)stats.respawnDeferred++;
    }else if(x.garages.length||x.ctf)issues.push({kind,mapSize,seed,error:'FFA/CQC leaked team bases'});
   }
 assert.deepEqual(errors,[]);
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/team-forward-bays-seed-matrix.json',JSON.stringify({stats,issues},null,2));
 console.log('TEAM_FORWARD_BAYS_SEED_MATRIX '+JSON.stringify(stats));
 assert.deepEqual(issues.slice(0,10),[],'team spawn/vehicle garage/respawn errors');
 assert.equal(stats.cases,216);
 console.log('TEAM_FORWARD_BAYS_SEED_MATRIX_PASS');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
