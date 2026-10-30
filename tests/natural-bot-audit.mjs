// V0.6 headless game-logic and protocol regression checks, no npm dependencies.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers={},nodes=new Map();
// Simulate Android WebView local preferences and controls when exercising settings.
const savedStorage=new Map();let acceptancePlaylistInputs=null,acceptancePlayButtons=null;
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},
  classList:(()=>{const flags=new Set();return {add(k){flags.add(k)},remove(k){flags.delete(k)},contains(k){return flags.has(k)},toggle(k,v){const active=v===undefined?!flags.has(k):!!v;if(active)flags.add(k);else flags.delete(k);return active}}})(),setPointerCapture(){},releasePointerCapture(){},
  getBoundingClientRect(){return {left:0,top:0,width:148,height:148}},
  addEventListener(name,fn){(handlers[id+':'+name]??=[]).push(fn)},querySelector(){return null}});return nodes.get(id)}
const ctx=new Proxy({fillText(){},scale(){},clearRect(){},fillRect(){},strokeRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},stroke(){},clip(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}},{get(t,p){return t[p]},set(t,p,v){t[p]=v;return true}});
node('arena').getContext=()=>ctx;
node('bot-skill').value='normal';
node('bot-count').value='1';node('bullet-cap').value='3';node('lives-choice').value='5';node('team-choice').value='ffa';node('map-size').value='standard';
let frame=null,tick=0,hostCalled=false,discoverCalled=false,packets=[];
const android={hostGame(){hostCalled=true},findGames(){discoverCalled=true},joinGame(){},stopNetwork(){},sendPacket(p){packets.push(JSON.parse(p))}};
const win={AndroidBridge:android,addEventListener(){},localStorage:{getItem(key){return ['rr-options-v06','rr-custom-v1','rr-custom-presets-v1'].includes(key)?savedStorage.get(key)??null:null},setItem(key,value){if(['rr-options-v06','rr-custom-v1','rr-custom-presets-v1'].includes(key))savedStorage.set(key,String(value))}}},document={addEventListener(){},getElementById:node,querySelector(){return node('battlefield')},querySelectorAll(sel){if(sel==='input[data-playlist-mode]')return acceptancePlaylistInputs||[];if(sel==='[data-action="solo"],[data-action="settings-play"]')return acceptancePlayButtons||[];return []}};
let simRand=null;
const testMath=Object.create(Math);testMath.random=()=>simRand?simRand():Math.random();
function seedRandom(seed){let z=seed>>>0;simRand=()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296;};}
const env={window:win,document,performance:{now(){return tick}},requestAnimationFrame(f){frame=f},clearTimeout(){},setTimeout(){return 1},console,Math:testMath,Number,Set,JSON,String};
vm.runInNewContext(fs.readFileSync(new URL('../web/scored-match.js',import.meta.url),'utf8'),env,{filename:'scored-match.js'});
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');

// TEST-ONLY: substitute the HUMAN input adapter for seat 0 with the *same*
// unmodified in-game botInput controller. All combat/projectile/AI/map code
// remains identical to production. This models symmetric ALL-AI encounters,
// NOT human performance, thumbs, network, graphics, or player skill.
const playerSeat="i===0?makeControl(true):i===1";
assert.equal(script.split(playerSeat).length,2,"exact single local human input adapter to replace");
script=script.replace(playerSeat,"i===0?botInput(i,dt):i===1");
assert.ok(/\}\)\(\);\s*$/.test(script),"expected source trailer");
const auditHook=String.raw`window.__balance={
 start(id,seed,skill='normal'){
  const rule=SCORED_MATCH_RULES[id];if(!rule)throw Error('Unknown scored mode '+id);
  mode='solo';paused=false;connected=false;
  state=initialState(0,{...selectedRules,matchModeId:id,teamMode:rule.mode==='teams'?'teams':'ffa',
   mapSize:id==='cqc'?'small':'standard',botCount:3,bulletCap:4,startLives:2,
   botSkill:skill,pilotMode:true},seed);
  fireCooldown.fill(0);botBrains.clear();return state;
 },
 tick(dt){step(dt);return state;},
 get state(){return state},
 blocked(x,y,r){return blocked(x,y,r)},
 sight(x,y,tx,ty){return hasLineOfSight(x,y,tx,ty)},
 topology(seed,size){return createMaze(MAP_SIZES[size],seed)},
 startingPosition(i){return startingPosition(i)},
 get world(){return [worldW,worldH]}
};})();`;
script=script.replace(/\}\)\(\);\s*$/,auditHook);
vm.runInNewContext(script,env,{filename:'natural-all-ai-game.js'});
const engine=win.__balance;
assert.ok(engine&&frame,"Actual gameplay engine loaded via unmodified production code, except human bot seat input");

const args=process.argv.slice(2);
const getFlag=(name,fallback)=>{const p=args.find(x=>x.startsWith('--'+name+'='));return p?p.split('=').slice(1).join('='):fallback;};
const seeds=Number(getFlag('seeds','50')),mazeSeeds=Number(getFlag('maze-seeds','300')),hz=Number(getFlag('hz','30')),seedOffset=Number(getFlag('seed-offset','0'));
if(!Number.isInteger(seeds)||seeds<1||seeds>200||!Number.isInteger(mazeSeeds)||mazeSeeds<1||mazeSeeds>2000||![30,60].includes(hz)||!Number.isInteger(seedOffset)||seedOffset<0||seedOffset>10000)throw Error('Invalid bounded seed count or unsupported simulation rate');
const outPath=getFlag('out','artifacts/natural-bot-audit.json'),dt=1/hz;
const modes=[
 {id:'cqc',clock:180,target:10,size:'small'},
 {id:'scored_ffa',clock:240,target:10,size:'standard'},
 {id:'scored_tdm',clock:300,target:15,size:'standard'}
].filter(x=>getFlag('modes','cqc,scored_ffa,scored_tdm').split(',').includes(x.id));
if(!modes.length)throw Error('No valid scored modes selected');
const cells=(maze)=>{
 const n=maze.open.length,seen=new Set([0]),queue=[0];
 for(let i=0;i<queue.length;i++)for(const j of maze.open[queue[i]])if(!seen.has(j)){seen.add(j);queue.push(j);}
 return seen.size===n;
};
const topology={};
for(const size of ['small','standard','large']){
 const seen=new Set(),samples=[];
 for(let seed=1;seed<=mazeSeeds;seed++){
  const m=engine.topology(seed,size);
  assert.ok(cells(m),'unreachable maze cell '+size+':'+seed);
  const signature=m.open.map(links=>[...links].sort((a,b)=>a-b).join(',')).join('|');
  seen.add(signature);
  samples.push({seed,edges:m.open.reduce((sum,links)=>sum+links.length,0)/2});
 }
 topology[size]={seeds:mazeSeeds,unique:seen.size,duplicates:mazeSeeds-seen.size,
  meanEdges:Math.round(samples.reduce((sum,x)=>sum+x.edges,0)/samples.length*10)/10};
 if(seen.size!==mazeSeeds)throw Error('Duplicate layout in '+size+': '+(mazeSeeds-seen.size));
}
const roundRows=[],start=Date.now();
for(const modeDef of modes){
 for(let seed=1;seed<=seeds;seed++){
  const seedId=1000003+(seed+seedOffset)*97;
  seedRandom(seedId+2718);
  const s=engine.start(modeDef.id,seedId);
  assert.equal(s.scored.scoreTarget,modeDef.target);
  assert.equal(s.config.mapSize,modeDef.size);
  assert.equal(s.tanks.length,4);
  const initial=s.tanks.map(t=>({x:t.x,y:t.y}));
  const firstDist=Math.min(...initial.slice(1).map(t=>Math.hypot(t.x-initial[0].x,t.y-initial[0].y)));
  let firstShot=null,firstImpact=null,firstKO=null,staleCount=0,minimumSpawnDistance=Infinity,
   vulnerableRespawns=0,badSpawns=0,respawnsSeen=s.scored.respawns.map(()=>0),
   maxProjectiles=0,hitEvents=new Set(),wallBounces=new Set(),totalShots=new Set(),stuckSamples=0,
   prevPoints=Array(4).fill(null),lastPositions=s.tanks.map(t=>[t.x,t.y]);
  for(let k=0;k<=Math.ceil((modeDef.clock+1)/dt)&&s.winner<0;k++){
   const a=engine.tick(dt);
   for(const f of a.fxEvents){
    if(f.kind==='shot')totalShots.add(f.id);
    if(f.kind==='hit'){hitEvents.add(f.id);if(firstImpact===null)firstImpact=a.elapsedSeconds;}
    if(f.kind==='bounce')wallBounces.add(f.id);
   }
   if(firstShot===null&&totalShots.size)firstShot=a.elapsedSeconds;
   if(firstKO===null&&a.scored.operatorKOs.some(x=>x>0))firstKO=a.elapsedSeconds;
   maxProjectiles=Math.max(maxProjectiles,a.bullets.length);
   for(let i=0;i<4;i++)if(a.scored.respawns[i]>respawnsSeen[i]){
    respawnsSeen[i]=a.scored.respawns[i];
    const t=a.tanks[i];
    const eligible=a.tanks.filter((_,j)=>j!==i&&(modeDef.id!=='scored_tdm'||j%2!==i%2)&&a.lives[j]>0);
    const min=eligible.length?Math.min(...eligible.map(x=>Math.hypot(x.x-t.x,x.y-t.y))):Infinity;
    minimumSpawnDistance=Math.min(minimumSpawnDistance,min);
    if(engine.blocked(t.x,t.y,12)||eligible.some(x=>Math.hypot(x.x-t.x,x.y-t.y)<30))badSpawns++;
    if(min<155&&eligible.some(x=>engine.sight(t.x,t.y,x.x,x.y)))vulnerableRespawns++;
   }
   if(k%30===0){
    const positions=a.tanks.map(t=>[t.x,t.y]);
    if(k>0&&positions.every((p,i)=>Math.hypot(p[0]-lastPositions[i][0],p[1]-lastPositions[i][1])<4))stuckSamples++;
    lastPositions=positions;
   }
  }
  assert.ok(s.scored.finished,'natural all-AI scored match never ended: '+modeDef.id+' seed '+seedId);
  assert.ok(s.finalResult,'missing final After Action: '+modeDef.id+' seed '+seedId);
  assert.ok(s.finalResult.durationSeconds<=modeDef.clock+.1,'clock overshoot '+modeDef.id);
  assert.equal(badSpawns,0,'unsafe actual respawn '+modeDef.id+' seed '+seedId);
  const teamScores=modeDef.id==='scored_tdm'?
   [s.scored.operatorKOs[0]+s.scored.operatorKOs[2],s.scored.operatorKOs[1]+s.scored.operatorKOs[3]]:
   [...s.scored.operatorKOs];
  roundRows.push({mode:modeDef.id,seed:seedId,seconds:Math.round(s.scored.elapsedSeconds*100)/100,
   reason:s.scored.result?.reason||null,draw:!!s.scored.result?.isDraw,
   winner:s.scored.result?.winningSide??null,teamScores,kos:[...s.scored.operatorKOs],deaths:[...s.scored.deaths],
   respawns:[...s.scored.respawns],initialEnemyDistance:Math.round(firstDist),
   firstShotSeconds:firstShot===null?null:Math.round(firstShot*100)/100,
   firstImpactSeconds:firstImpact===null?null:Math.round(firstImpact*100)/100,
   firstPilotKOSeconds:firstKO===null?null:Math.round(firstKO*100)/100,
   shots:totalShots.size,armorAndPilotHitEvents:hitEvents.size,ricochets:wallBounces.size,
   maxProjectiles,minimumRespawnEnemyDistance:Number.isFinite(minimumSpawnDistance)?Math.round(minimumSpawnDistance):null,
   closeExposedRespawns:vulnerableRespawns,unsafeRespawns:badSpawns,fullTeamStallSamples:stuckSamples});
 }
 console.log('Completed natural full-simulation '+modeDef.id+': '+seeds+' seeds');
}
const overview={};
for(const modeDef of modes){
 const rows=roundRows.filter(r=>r.mode===modeDef.id);
 const sum=k=>rows.reduce((a,r)=>a+r[k],0);
 const count=fn=>rows.filter(fn).length;
 const avg=fn=>Math.round(rows.reduce((a,r)=>a+fn(r),0)/rows.length*10)/10;
 overview[modeDef.id]={n:rows.length,timeLimit:count(r=>r.reason==='time_limit'),
 targetWins:count(r=>r.reason==='score_target'),draws:count(r=>r.draw),
 noShot:count(r=>r.shots===0),noImpact:count(r=>r.armorAndPilotHitEvents===0),
 noPilotKO:count(r=>r.kos.reduce((x,n)=>x+n,0)===0),
 meanKO:avg(r=>r.kos.reduce((x,n)=>x+n,0)),meanSeconds:avg(r=>r.seconds),
 meanFirstImpactSeconds:avg(r=>r.firstImpactSeconds??modeDef.clock),
 meanShots:avg(r=>r.shots),meanRicochets:avg(r=>r.ricochets),
 closeExposedRespawns:sum('closeExposedRespawns'),
 unsafeRespawns:sum('unsafeRespawns'),
 blueWins:modeDef.id==='scored_tdm'?count(r=>r.winner===0):null,
 redWins:modeDef.id==='scored_tdm'?count(r=>r.winner===1):null,
 minInitialEnemyDistance:Math.min(...rows.map(r=>r.initialEnemyDistance))};
}
const report={schemaVersion:1,scope:'Actual offline simulation, test-only player slot 0 controlled by existing botInput, not a human/device/LAN test',
 source:'web/game.js and web/scored-match.js from current checkout',
 simulatedPhysicsHz:hz,seedsPerScoredMode:seeds,seedOffset,modeIds:modes.map(x=>x.id),mazeSeedsPerSize:mazeSeeds,elapsedWallMs:Date.now()-start,
 topology,overview,rounds:roundRows};
fs.mkdirSync(outPath.split('/').slice(0,-1).join('/')||'.',{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
console.log('BALANCE_AUDIT_SUMMARY '+JSON.stringify({elapsedWallMs:report.elapsedWallMs,topology,overview}));

// Keep a compact, reproducible seed-level diagnostic in CI logs, in addition
// to all records preserved in the JSON artifact.
const outliers=roundRows.filter(r=>r.armorAndPilotHitEvents===0||r.reason==='time_limit'||r.unsafeRespawns>0||r.closeExposedRespawns>0)
 .map(r=>({mode:r.mode,seed:r.seed,reason:r.reason,draw:r.draw,seconds:r.seconds,
 shots:r.shots,hits:r.armorAndPilotHitEvents,kos:r.kos,respawns:r.respawns,
 firstImpactSeconds:r.firstImpactSeconds,closeExposedRespawns:r.closeExposedRespawns}));
console.log('BALANCE_AUDIT_OUTLIERS '+JSON.stringify(outliers));

