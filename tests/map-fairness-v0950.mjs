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


// SOURCE HOOK only: original engine is not otherwise modified.
const hook=String.raw`window.__mapFair={
 topology(seed,size){return createMaze(MAP_SIZES[size],seed)},
 setup(seed,size){
  mode='solo';connected=false;paused=true;
  state=initialState(0,{...selectedRules,pilotMode:true,mapSize:size,teamMode:'ffa',
   matchModeId:'survival_ffa',botCount:3,bulletCap:4,startLives:2},seed);
  return {maze:mazeGrid,seed:state.mazeSeed,
    actors:state.tanks.map(t=>({x:t.x,y:t.y})),
    spares:state.vehicles.filter(v=>v.occupant===-1&&v.armor>0)
      .map(v=>({x:v.x,y:v.y,type:v.type})),
    isBlocked:(x,y,r)=>blocked(x,y,r),
    hasSight:(a,b)=>hasLineOfSight(a.x,a.y,b.x,b.y)}
 }
};})();`;
assert.ok(/\}\)\(\);\s*$/.test(script),'Engine source wrapper changed');
script=script.replace(/\}\)\(\);\s*$/,hook);
vm.runInNewContext(script,env,{filename:'unmodified-engine-map-fairness.js'});
const engine=win.__mapFair;
assert.ok(engine,'production createMaze()/initialState() failed to load');

const sizes=['small','standard','large'];
const args=process.argv.slice(2);
const arg=(key,def)=>{const s=args.find(x=>x.startsWith('--'+key+'='));return s?s.split('=').slice(1).join('='):def};
const seeds=Number(arg('seeds','1000'));
const out=arg('out','qa-results/map-fairness-v0950');
assert.ok(Number.isInteger(seeds)&&seeds>=1&&seeds<=2000,'seed bound 1..2000');
fs.mkdirSync(out,{recursive:true});

const avg=a=>a.reduce((t,x)=>t+x,0)/(a.length||1);
const round=n=>Number.isFinite(n)?Math.round(n*100)/100:null;
const quantile=(values,p)=>{const a=values.filter(Number.isFinite).sort((a,b)=>a-b);return a[Math.min(a.length-1,Math.floor((a.length-1)*p))]};
const percent=a=>round(100*a.reduce((n,x)=>n+(x?1:0),0)/(a.length||1));
const cellIndex=(p,m)=>Math.floor(p.y/m.cell)*m.cols+Math.floor(p.x/m.cell);
const shortest=(m,start)=>{
 const d=new Int16Array(m.open.length).fill(-1);d[start]=0;
 const q=[start];for(let k=0;k<q.length;k++){const u=q[k];for(const v of m.open[u])if(d[v]<0){d[v]=d[u]+1;q.push(v)}}
 return d;
};
const nearLinks=(m,index)=>m.open[index].length;
const topologySignature=m=>m.open.map(adj=>adj.slice().sort((a,b)=>a-b).join(',')).join('|');
const rows=[],summary={};
for(const size of sizes){
 const fingerprints=new Set(),sizeRows=[];
 for(let seed=1;seed<=seeds;seed++){
  const st=engine.setup(seed,size),m=st.maze;
  assert.equal(st.seed,seed,'seed reproduction mismatch');
  assert.equal(m.open.length,m.cols*m.rows,'tile graph size');
  for(let u=0;u<m.open.length;u++)for(const v of m.open[u]){
   assert.ok(v>=0&&v<m.open.length&&m.open[v].includes(u),'broken bidirectional corridor');
   const ux=u%m.cols,uy=Math.floor(u/m.cols),vx=v%m.cols,vy=Math.floor(v/m.cols);
   assert.equal(Math.abs(ux-vx)+Math.abs(uy-vy),1,'non-grid adjacency');
  }
  const fingerprint=topologySignature(m);
  assert.ok(!fingerprints.has(fingerprint),size+' duplicate topology seed '+seed);
  fingerprints.add(fingerprint);
  const replay=engine.topology(seed,size);
  assert.equal(topologySignature(replay),fingerprint,'seed replay differs');
  const degree=m.open.map(x=>x.length);
  const ends=degree.filter(x=>x===1).length,loops=m.open.reduce((n,x)=>n+x.length,0)/2-(m.open.length-1);
  assert.ok(loops>=0,'graph lacks spanning connectivity');
  const positions=st.actors.map(p=>cellIndex(p,m));
  assert.equal(positions.length,4,'expected one user and three bots');
  assert.ok(positions.every(x=>x>=0&&x<m.open.length),'actor out of grid');
  const distances=positions.map(x=>shortest(m,x));
  assert.ok(distances.every(d=>d.every(x=>x>=0)),'unreachable tile');
  // Fairness is contextual, not a raw distance equality requirement.
  const pairs=[];
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)pairs.push({a:i,b:j,path:distances[i][positions[j]],
    unobstructed:st.hasSight(st.actors[i],st.actors[j])});
  const opponentPath=positions.map((_,i)=>Math.min(...positions.map((__,j)=>i===j?Infinity:distances[i][positions[j]])));
  const immediateExposure=st.actors.map((p,i)=>st.actors.some((q,j)=>i!==j&&st.hasSight(p,q)));
  const nearCover=positions.map(i=>4-degree[i]); // four cardinal sides, including arena rim
  const spareIndices=st.spares.map(p=>cellIndex(p,m));
  assert.ok(st.spares.length>=1,'no spare recovery vehicle');
  assert.ok(spareIndices.every(x=>x>=0&&x<m.open.length),'recovery vehicle out of bounds');
  const recovery=positions.map((_,i)=>Math.min(...spareIndices.map(s=>distances[i][s])));
  assert.ok(recovery.every(Number.isFinite),'a player cannot reach any recovery vehicle');
  const sourceDist=shortest(m,0);
  const pathP90=quantile(Array.from(sourceDist),.9);
  const row={
   seed,size,cells:m.open.length,edges:loops+m.open.length-1,
   topologyFingerprint:fingerprint.slice(0,120),loops,deadEnds:ends,deadEndPct:round(100*ends/m.open.length),
   longestFromPlayerCells:Math.max(...sourceDist),pathP90,
   pathPairs:pairs.map(p=>p.path),
   directSightPairs:pairs.filter(p=>p.unobstructed).length,
   firstPlayerVsEnemyMinPath:opponentPath[0],
   playerVsEnemyPathRange:Math.max(...opponentPath)-Math.min(...opponentPath),
   initialExposedActors:immediateExposure.filter(Boolean).length,
   coverByActor:nearCover,
   nearestSpareVehicleCells:recovery,
   playerRecoveryCells:recovery[0],
   recoveryImbalanceCells:Math.max(...recovery)-Math.min(...recovery),
   spareCount:st.spares.length,mechAvailable:st.spares.some(v=>v.type==='mech')
  };
  sizeRows.push(row);
  rows.push(row);
 }
 summary[size]={
  seeds,separateTopologies:fingerprints.size,
  deadEndPct:{median:round(quantile(sizeRows.map(x=>x.deadEndPct),.5)),p95:round(quantile(sizeRows.map(x=>x.deadEndPct),.95))},
  loops:{min:Math.min(...sizeRows.map(x=>x.loops)),median:quantile(sizeRows.map(x=>x.loops),.5)},
  playerEnemyShortestPathCells:{min:Math.min(...sizeRows.map(x=>x.firstPlayerVsEnemyMinPath)),median:quantile(sizeRows.map(x=>x.firstPlayerVsEnemyMinPath),.5),p95:quantile(sizeRows.map(x=>x.firstPlayerVsEnemyMinPath),.95)},
  initialSightExposurePct:percent(sizeRows.map(x=>x.initialExposedActors>0)),
  playerVehicleRecoveryCells:{max:Math.max(...sizeRows.map(x=>x.playerRecoveryCells)),median:quantile(sizeRows.map(x=>x.playerRecoveryCells),.5),p95:quantile(sizeRows.map(x=>x.playerRecoveryCells),.95)},
  recoveryImbalanceCells:{median:quantile(sizeRows.map(x=>x.recoveryImbalanceCells),.5),p95:quantile(sizeRows.map(x=>x.recoveryImbalanceCells),.95)},
  spareVehicles:{min:Math.min(...sizeRows.map(x=>x.spareCount)),mechAvailablePct:percent(sizeRows.map(x=>x.mechAvailable))}
 };
 console.log('SIZE_COMPLETE '+size+' '+JSON.stringify(summary[size]));
}
// Outliers are size-relative, NOT a fixed "6 cells is broken" rule:
 // large sectors naturally have longer corridors than 9x6 sectors.
const cutoffs=Object.fromEntries(sizes.map(size=>{
 const rs=rows.filter(r=>r.size===size);
 return [size,{
  highRecoveryCells:quantile(rs.map(r=>r.playerRecoveryCells),.95),
  highImbalanceCells:quantile(rs.map(r=>r.recoveryImbalanceCells),.95),
  lowEnemyPath:quantile(rs.map(r=>r.firstPlayerVsEnemyMinPath),.05)
 }]
}));
const outliers=rows.filter(r=>r.initialExposedActors>0||
 r.playerRecoveryCells>cutoffs[r.size].highRecoveryCells||
 r.recoveryImbalanceCells>cutoffs[r.size].highImbalanceCells||
 r.firstPlayerVsEnemyMinPath<cutoffs[r.size].lowEnemyPath)
 .map(r=>({...r,flags:[
  ...(r.initialExposedActors>0?['initial-line-of-sight']:[]),
  ...(r.playerRecoveryCells>cutoffs[r.size].highRecoveryCells?['long-recovery-walk']:[]),
  ...(r.recoveryImbalanceCells>cutoffs[r.size].highImbalanceCells?['unequal-recovery-walk']:[]),
  ...(r.firstPlayerVsEnemyMinPath<cutoffs[r.size].lowEnemyPath?['very-close-initial-actors']:[])
 ]}));
const leaderboard=(key,direction=1)=>rows.slice().sort((a,b)=>direction*(b[key]-a[key])).slice(0,12)
 .map(x=>({seed:x.seed,size:x.size,value:x[key]}));
const result={
 schemaVersion:1,method:'Real original seeded createMaze + initialState/spawnVehicles, 1000 deterministic seeds per small/standard/large size. Graph distances are corridor steps; no physical bullets, dynamic opponents or user control simulated.',
 expected:seeds*sizes.length,observed:rows.length,summary,cutoffs,
 extremeExamples:{
  longestRecovery:leaderboard('playerRecoveryCells'),
  greatestRecoveryImbalance:leaderboard('recoveryImbalanceCells'),
  mostDeadEnds:leaderboard('deadEndPct'),
  shortestEnemyPath:leaderboard('firstPlayerVsEnemyMinPath',-1)
 },
 warnings:[
  'Exposure tests are initial center-to-center wall LOS only; pilot hitbox/firing angle and movement are not simulated.',
  'Dead-end, cover and ricochet opportunity quality are proxies, not human fun metrics.',
  'A spare vehicle near player 0 is intentionally favored by spawnVehicles; compare recovery imbalance before claiming multiplayer fairness.',
  'No arbitrary fairness threshold or generator change authorized by this audit.'
 ],releaseGate:'MAP STRUCTURE SOURCE PASS; COMPETITIVE FAIRNESS NOT CERTIFIED',ownerVisualApproval:'PENDING'
};
const output=out+'/summary.json';
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(out+'/seed-records.json',JSON.stringify(rows,null,2)+'\n');
fs.writeFileSync(out+'/potential-outliers.json',JSON.stringify(outliers,null,2)+'\n');
console.log('MAP_FAIRNESS_AUTOMATED_PASS '+JSON.stringify({samples:result.observed,unique:true,summary,flaggedSeedRows:outliers.length}));

console.log('MAP_FAIRNESS_REPLAY_EXAMPLES '+JSON.stringify({cutoffs,extremeExamples:result.extremeExamples,flaggedRows:outliers.length}));
