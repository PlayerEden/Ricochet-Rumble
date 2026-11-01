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


// Evaluate the ACTUAL default production candidate and the explicit legacy
// rollback against identical seeds. No independent copy of the spawn logic.
const hook=String.raw`window.__corridorAudit={
 spawn(seed,size,policy,matchModeId='survival_ffa'){
  mode='solo';paused=true;connected=false;
  state=initialState(0,{...selectedRules,botCount:3,pilotMode:true,
   mapSize:size,teamMode:'ffa',startLives:2,matchModeId,recoveryPolicy:policy},seed);
  return {seed:state.mazeSeed,maze:mazeGrid,
   actors:state.tanks.map(t=>({x:t.x,y:t.y})),
   spares:state.vehicles.filter(v=>v.occupant===-1&&v.armor>0)
     .map(v=>({id:v.id,x:v.x,y:v.y,type:v.type,armor:v.armor})),
   occupied:state.vehicles.filter(v=>v.occupant!==-1).map(v=>({id:v.id,x:v.x,y:v.y,type:v.type,occupant:v.occupant})),
   blocked:(x,y,r)=>blocked(x,y,r)};
 }
};})();`;
assert.ok(/\}\)\(\);\s*$/.test(script),'Game wrapper changed');
vm.runInNewContext(script.replace(/\}\)\(\);\s*$/,hook),env,{filename:'game-actual-recovery-under-test.js'});
const engine=win.__corridorAudit;
assert.ok(engine,'Actual game source failed to load');
const sizes=['small','standard','large'];
const arg=(name,def)=>{const x=process.argv.find(s=>s.startsWith('--'+name+'='));return x?x.split('=').slice(1).join('='):def;};
const N=Number(arg('seeds','1000')),out=arg('out','qa-results/corridor-recovery-v0951');
assert.ok(Number.isInteger(N)&&N>=1&&N<=2000);
fs.mkdirSync(out,{recursive:true});
const cell=(m,p)=>Math.floor(p.y/m.cell)*m.cols+Math.floor(p.x/m.cell);
const bfs=(m,p)=>{
 const start=cell(m,p),dist=new Int16Array(m.open.length).fill(-1),q=[start];dist[start]=0;
 for(let n=0;n<q.length;n++)for(const v of m.open[q[n]])if(dist[v]<0){dist[v]=dist[q[n]]+1;q.push(v)}
 return dist;
};
const distances=st=>{
 const paths=st.actors.map(a=>bfs(st.maze,a));
 return paths.map(route=>Math.min(...st.spares.map(p=>route[cell(st.maze,p)])));
};
const worst=a=>Math.max(...a);
const pctl=(rows,q)=>{const a=rows.slice().sort((x,y)=>x-y);return a[Math.floor((a.length-1)*q)]};
const stats=a=>({median:pctl(a,.5),p95:pctl(a,.95),max:Math.max(...a)});
const summary={},rows=[],examples=[375,395,947,671,991];
for(const size of sizes){
 const batch=[];
 for(let seed=1;seed<=N;seed++){
  const start=performance.now();
  const legacy=engine.spawn(seed,size,'legacy'),oldms=performance.now()-start;
  const pre=performance.now();
  const active=engine.spawn(seed,size,'corridor-v1'),newms=performance.now()-pre;
  const replay=engine.spawn(seed,size,'corridor-v1');
  const sig=st=>st.maze.open.map(n=>n.slice().sort((x,y)=>x-y).join(',')).join('|');
  assert.equal(sig(legacy),sig(active),'No map topology may change');
  assert.equal(legacy.seed,active.seed,'Seed changed');
  assert.equal(active.spares.length,legacy.spares.length,'Spare count changed');
  assert.equal(active.occupied.length,legacy.occupied.length,'Occupied count changed');
  assert.equal(JSON.stringify(active.occupied),JSON.stringify(legacy.occupied),'Initial occupied tanks moved');
  assert.equal(JSON.stringify(active.spares),JSON.stringify(replay.spares),'Deterministic policy replay failed');
  assert.equal(JSON.stringify(active.spares.map(v=>v.type)),JSON.stringify(legacy.spares.map(v=>v.type)),'Vehicle types altered');
  for(const v of active.spares){
   assert.equal(active.blocked(v.x,v.y,28),false,'Spare inside wall or world rim');
   assert.ok(active.actors.every(t=>Math.hypot(t.x-v.x,t.y-v.y)>=90),'Spare on top of player');
   assert.ok(active.occupied.every(t=>Math.hypot(t.x-v.x,t.y-v.y)>=150),'Spare too near occupied tank');
   assert.ok(active.spares.every(o=>o.id===v.id||Math.hypot(o.x-v.x,o.y-v.y)>=150),'Spare-to-spare collision');
  }
  const old=distances(legacy),next=distances(active);
  assert.ok(next.every(Number.isFinite),'All actor seats retain reachable vehicles');
  // Solo active: only change if local player has an actual unreasonable walk.
  if(old[0]<=8)assert.equal(JSON.stringify(active.spares),JSON.stringify(legacy.spares),'Already reasonable Solo placement must be untouched');
  if(old[0]>8)assert.ok(next[0]<=old[0],'Solo recovery must never worsen');
  const changed=legacy.spares.filter((v,i)=>v.x!==active.spares[i].x||v.y!==active.spares[i].y).length;
  assert.ok(changed<=1,'Solo policy must relocate at most one spare');
  const row={seed,size,legacyPlayer:old[0],proposedPlayer:next[0],legacyWorst:worst(old),
   proposedWorst:worst(next),changed,legacyDistances:old,proposedDistances:next,
   elapsedLegacyMs:oldms,elapsedProposedMs:newms};
  rows.push(row);batch.push(row);
 }
 summary[size]={tested:N,changed:batch.filter(r=>r.changed>0).length,
  originalPlayerRecovery:stats(batch.map(r=>r.legacyPlayer)),
  proposedPlayerRecovery:stats(batch.map(r=>r.proposedPlayer)),
  originalWorstSeat:stats(batch.map(r=>r.legacyWorst)),
  proposedWorstSeat:stats(batch.map(r=>r.proposedWorst)),
  changedRescueMeanSteps:Number((batch.filter(r=>r.changed).reduce((t,r)=>t+r.proposedPlayer,0)/Math.max(1,batch.filter(r=>r.changed).length)).toFixed(2)),
  originalCreateStateMs:stats(batch.map(r=>r.elapsedLegacyMs)),
  proposedCreateStateMs:stats(batch.map(r=>r.elapsedProposedMs))
 };
 console.log('CORRIDOR_GAME_REAL_SOURCE '+size+' '+JSON.stringify(summary[size]));
}
// Test separately: scored/competitive placement should consider all seats.
// Unlike Solo's player-0 rescue, it may relocate up to two spares.
const competition=[];
for(const size of sizes)for(let seed=1;seed<=Math.min(200,N);seed++){
 const old=engine.spawn(seed,size,'legacy','scored_ffa');
 const candidate=engine.spawn(seed,size,'corridor-v1','scored_ffa');
 const oldD=distances(old),newD=distances(candidate);
 assert.equal(old.spares.length,candidate.spares.length);
 assert.equal(JSON.stringify(old.occupied),JSON.stringify(candidate.occupied));
 assert.ok(Math.max(...newD)<=Math.max(...oldD),'Competitive worst-seat recovery worsened');
 const moved=old.spares.filter((v,i)=>v.x!==candidate.spares[i].x||v.y!==candidate.spares[i].y).length;
 assert.ok(moved<=2,'Competitive bounded two-relocation cap');
 competition.push({seed,size,originalWorst:worst(oldD),nextWorst:worst(newD),moved});
}
const comp=Object.fromEntries(sizes.map(s=>{
 const a=competition.filter(r=>r.size===s);
 return [s,{tested:a.length,changed:a.filter(r=>r.moved>0).length,
  originalWorst:stats(a.map(r=>r.originalWorst)),proposedWorst:stats(a.map(r=>r.nextWorst))}];
}));
const result={schemaVersion:1,method:'ACTUAL runtime spawnVehicles with explicit legacy fallback vs corridor-v1; 1000 seeds/size Solo plus 200/size scored. This is game-source headless placement, NOT human gameplay.',
 sourceUnchangedExceptSparePlacement:true,summaries:summary,competitive:comp,
 criticalReplayCases:rows.filter(x=>examples.includes(x.seed)).filter(x=>['small','standard','large'].includes(x.size)),
 manualPending:['pilot spawn/ejection meaningful risk','human actual recovery path and detours','real Android UI/perf','real two-phone synchronization'],
 release:'EXPERIMENTAL NOT MERGED; Android and human sign-off pending'};
fs.writeFileSync(out+'/summary.json',JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(out+'/all-replay-seeds.json',JSON.stringify(rows,null,2)+'\n');
console.log('CORRIDOR_RECOVERY_REAL_GAME_PASS '+JSON.stringify({soloSamples:rows.length,scoredSamples:competition.length,summary,competitive:comp}));
