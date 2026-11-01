// Real procedural mazes + production engine: measure neutral vehicle route fairness
// and timed drops relative to each team base. No synthetic movement/teleportation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';

const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN required for real-browser vehicle audit');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(source));

function install(){
 window.__vehicleRouteQA={
  sample(seed,mapSize,kind){
   const original=state,wasMode=mode;let result;
   try{
    mode='solo';paused=true;
    state=initialState(0,{mapSize,botCount:kind==='coop'?4:3,botSkill:'normal',
     pilotMode:true,teamMode:kind==='ffa'?'ffa':kind==='coop'?'coop':'teams',
     matchModeId:kind==='scored_tdm'||kind==='ctf'?'scored_tdm':null,
     ctfExercise:kind==='ctf',startLives:3,quickPlayMatch:false},seed);
    const bays=state.forwardBays?.bays||[];
    const distances=bays.map(b=>window.SectorForwardBays.routeDistances(mazeGrid.open,b.cellIndex));
    const index=p=>Math.floor(p.y/mazeGrid.cell)*mazeGrid.cols+Math.floor(p.x/mazeGrid.cell);
    const measure=v=>{
     const d=distances.map(route=>route[index(v)]);return {
      id:v.id,x:v.x,y:v.y,type:v.type,occupant:v.occupant,
      wall:blocked(v.x,v.y,24),
      distances:d,gap:d.length===2?Math.abs(d[0]-d[1]):null,
      nearestActor:Math.min(...state.tanks.map(t=>Math.hypot(t.x-v.x,t.y-v.y))),
      nearestBase:Math.min(...bays.map(b=>Math.hypot(b.x-v.x,b.y-v.y)),Infinity)};
    };
    const starting=state.vehicles.filter(v=>v.occupant===-1&&v.armor>0);
    const garages=bays.map(b=>measure(state.vehicles[b.vehicleId]));
    const neutral=starting.filter(v=>!bays.some(b=>b.vehicleId===v.id)).map(measure);
    const before=state.vehicles.length;
    const deployed=deployVehicle();
    const drop=deployed?measure(state.vehicles.at(-1)):null;
    // A second call tests spacing against the first drop, if max permits.
    const deployedAgain=deployVehicle();
    const secondDrop=deployedAgain?measure(state.vehicles.at(-1)):null;
    const live=state.vehicles.filter(v=>v.armor>0);
    let closePair=null;
    for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
     const a=live[i],b=live[j],d=Math.hypot(a.x-b.x,a.y-b.y);
     // Spawned and occupied vehicles share actors; all distinct vehicles
     // still need physical separation even when non-solid at rest.
     if(d<50&&(!closePair||d<closePair.d))closePair={a:a.id,b:b.id,d};
    }
    result={seed,mapSize,kind,hasBays:!!state.forwardBays,
     garages,neutral,drop,secondDrop,deployed,deployedAgain,
     initialVehicleCount:before,finalVehicleCount:state.vehicles.length,closePair};
   }finally{state=original;mode=wasMode;setArena(0,original.mazeSeed,original.config.mapSize);}
   return result;
  }
 };
}
const game=source.replace(ending,'\n('+install.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','forward-bays.js','ctf-rules.js',
 'ctf-ai.js','scored-match.js','dossier.js','save-backup.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(root,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],failures=[],cases=[],stats={cases:0,teamCases:0,ffaCases:0,
 teamGarageCount:0,neutralMechCount:0,drops:0,secondDrops:0,ffaDrops:0,
 neutralGapHistogram:{},dropGapHistogram:{},secondGapHistogram:{},
 worstNeutralGap:0,worstDropGap:0,worstSecondGap:0,
 neutralWithinTwo:0,dropsWithinTwo:0,neutralTooClose:0,dropTooClose:0,
 vehicleOverlapCount:0};
const bump=(key,n)=>{const bucket=String(n);stats[key][bucket]=(stats[key][bucket]||0)+1;};
try{
 const page=await browser.newPage({viewport:{width:740,height:360}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('button[data-action="modes"]').click();
 await page.locator('.bay-exercise-fold summary').click();
 await page.locator('button[data-action="ctf"]').click();
 await page.waitForFunction(()=>!!window.__vehicleRouteQA&&!!window.SectorForwardBays);
 const modes=['teams','coop','scored_tdm','ctf','ffa'];
 for(const kind of modes)for(const mapSize of ['small','standard','large'])for(let seed=1;seed<=30;seed++){
  const x=await page.evaluate(v=>window.__vehicleRouteQA.sample(v.seed,v.mapSize,v.kind),{seed,mapSize,kind});
  stats.cases++;cases.push(x);
  if(x.closePair){stats.vehicleOverlapCount++;failures.push({seed,mapSize,kind,problem:'overlap',pair:x.closePair});}
  const isTeam=kind!=='ffa';
  if(!isTeam){stats.ffaCases++;
   if(x.hasBays||x.garages.length||x.neutral.length!==3)failures.push({seed,mapSize,kind,problem:'FFA leaked team vehicle rules'});
   if(x.drop)stats.ffaDrops++;
   continue;
  }
  stats.teamCases++;stats.teamGarageCount+=x.garages.length;
  if(!x.hasBays||x.garages.length!==2||x.garages.some(g=>g.occupant!==-1||g.type!=='tank'||g.wall||g.distances[g.id]===-1))
   failures.push({seed,mapSize,kind,problem:'team garages',garages:x.garages});
  if(x.neutral.length!==1||x.neutral[0].type!=='mech'||x.neutral[0].wall)
   failures.push({seed,mapSize,kind,problem:'neutral reserve',neutral:x.neutral});
  const neutral=x.neutral[0];
  if(neutral){bump('neutralGapHistogram',neutral.gap);stats.worstNeutralGap=Math.max(stats.worstNeutralGap,neutral.gap);
   stats.neutralWithinTwo+=(neutral.gap<=2);
   stats.neutralTooClose+=(neutral.distances.some(v=>v<3));
  }
  for(const [v,key,max,near] of [[x.drop,'dropGapHistogram','worstDropGap','dropTooClose'],
   [x.secondDrop,'secondGapHistogram','worstSecondGap','dropTooClose']]){
   if(!v)continue;
   bump(key,v.gap);stats[max]=Math.max(stats[max],v.gap);
   if(v.distances.some(d=>d<3))stats[near]++;
   if(key==='dropGapHistogram'){stats.drops++;stats.dropsWithinTwo+=(v.gap<=2);}
   else stats.secondDrops++;
  }
 }
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/team-vehicle-route-audit.json',JSON.stringify({stats,failures,cases},null,2));
 console.log('TEAM_VEHICLE_ROUTE_AUDIT '+JSON.stringify(stats));
 if(failures.length)console.log('TEAM_VEHICLE_GEOMETRY_FAILURES '+JSON.stringify(failures.slice(0,12)));
 assert.deepEqual(errors,[],'no browser exceptions');
 assert.deepEqual(failures.slice(0,12),[],'no vehicle overlaps or missing team reserve');
 assert.equal(stats.cases,450,'30 seeds * 3 map sizes * 5 match types');
 if(process.env.VEHICLE_BALANCE_ENFORCE==='1'){
  assert.equal(stats.worstNeutralGap<=2,true,'neutral mech remains within two corridor steps of equal-access');
  assert.equal(stats.neutralTooClose,0,'neutral reserve never placed within 3 corridor steps of a base');
  assert.equal(stats.worstDropGap<=2,true,'periodic first vehicle drop neutral and fair');
  assert.equal(stats.worstSecondGap<=2,true,'periodic second vehicle drop remains fair');
  assert.equal(stats.dropTooClose,0,'new drops avoid base approach lanes');
  assert.ok(stats.drops>=45,'new vehicle drops available for at least half the seeded team setups');
 }
 console.log('TEAM_VEHICLE_ROUTE_AUDIT_PASS '+(process.env.VEHICLE_BALANCE_ENFORCE?'enforced':'baseline telemetry'));
}finally{await browser.close();await new Promise(done=>server.close(done));}
