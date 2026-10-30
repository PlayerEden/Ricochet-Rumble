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


// Test-only placement policy evaluation. The real production vehicle-spawn
// method is called to capture each map's unchanged baseline first.
const hook=String.raw`window.__recovery={
 setup(seed,size){
  mode='solo';paused=true;connected=false;
  state=initialState(0,{...selectedRules,pilotMode:true,mapSize:size,
   teamMode:'ffa',matchModeId:'survival_ffa',botCount:3,startLives:2},seed);
  return {maze:mazeGrid,actors:state.tanks.map(t=>({x:t.x,y:t.y})),
   spares:state.vehicles.filter(v=>v.occupant===-1&&v.armor>0).map(v=>({x:v.x,y:v.y,type:v.type})),
   wallClear:(x,y,r)=>!blocked(x,y,r)};
 }
};})();`;
assert.ok(/\}\)\(\);\s*$/.test(script),'Original engine trailer changed');
vm.runInNewContext(script.replace(/\}\)\(\);\s*$/,hook),env,{filename:'unmodified-vehicle-spawn-under-test.js'});
const engine=win.__recovery;
const dirs=['small','standard','large'];
const args=process.argv.slice(2);
const flag=(name,def)=>{const v=args.find(s=>s.startsWith('--'+name+'='));return v?v.split('=').slice(1).join('='):def};
const N=Number(flag('seeds','1000'));
assert.ok(Number.isInteger(N)&&N>0&&N<=2000,'1..2000 samples/size');
const output='qa-results/recovery-placement-v09501';
fs.mkdirSync(output,{recursive:true});
const path=(m,p)=>Math.floor(p.y/m.cell)*m.cols+Math.floor(p.x/m.cell);
const bfs=(m,start)=>{
 const d=new Int16Array(m.open.length).fill(-1);const q=[start];d[start]=0;
 for(let i=0;i<q.length;i++)for(const v of m.open[q[i]])if(d[v]<0){d[v]=d[q[i]]+1;q.push(v)}
 return d;
};
const nearest=(spares,distances,m)=>distances.map(d=>Math.min(...spares.map(p=>d[path(m,p)])));
const gap=d=>Math.max(...d)-Math.min(...d);
const sum=a=>a.reduce((s,v)=>s+v,0);
const pct=(arr,fn)=>Math.round(100*arr.filter(fn).length/arr.length*100)/100;
const pctl=(arr,q)=>{const a=arr.slice().sort((a,b)=>a-b);return a[Math.floor((a.length-1)*q)]};
const stats=a=>({median:pctl(a,.5),p95:pctl(a,.95),max:Math.max(...a),mean:Math.round(sum(a)/a.length*100)/100});
const results=[];
for(const size of dirs){
 const sizeRows=[];
 for(let seed=1;seed<=N;seed++){
  const st=engine.setup(seed,size),m=st.maze;
  const seats=st.actors.map(t=>bfs(m,path(m,t)));
  assert.equal(st.spares.length,3,'Test expected 3 recoverable vehicles');
  const old=st.spares.map(x=>({...x})),baseline=nearest(old,seats,m);
  // Candidate sites respect existing game footprint/radius, no spawning
  // inside walls or within 150 pixels of any occupied tank.
  const candidates=[];
  for(let cell=0;cell<m.open.length;cell++){
   const p={x:(cell%m.cols+.5)*m.cell,y:(Math.floor(cell/m.cols)+.5)*m.cell};
   if(!st.wallClear(p.x,p.y,28)||st.actors.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<150))continue;
   candidates.push(p);
  }
  assert.ok(candidates.length>=3,'No viable alternative vehicle placement');
  const eligible=(p,spares,k)=>spares.every((v,j)=>j===k||Math.hypot(v.x-p.x,v.y-p.y)>=150);
  // ALTERNATIVE A: Move at most ONE spare to shorten the solo player's path.
  let solo=old.map(x=>({...x})),soloBest=baseline[0];
  for(let k=0;k<solo.length;k++)for(const p of candidates)if(eligible(p,solo,k)){
   const trial=solo.slice();trial[k]={...p,type:solo[k].type};
   const d=nearest(trial,seats,m);
   // Prioritize fewer steps to PLAYER 0; tie-break toward lower total gap.
   if(d[0]<soloBest||(d[0]===soloBest&&gap(d)<gap(nearest(solo,seats,m)))){
    soloBest=d[0];solo=trial;
   }
  }
  // ALTERNATIVE B: local search among three spare positions to minimize
  // maximum player travel, with equal seat weights. No additional vehicles.
  let balanced=old.map(x=>({...x}));
  const objective=(spares)=>{
   const d=nearest(spares,seats,m);
   return Math.max(...d)*100+sum(d);
  };
  let current=objective(balanced);
  for(let pass=0;pass<3;pass++){
   let best=current,bestTeam=null;
   for(let k=0;k<balanced.length;k++)for(const p of candidates)if(eligible(p,balanced,k)){
    const trial=balanced.slice();trial[k]={...p,type:balanced[k].type};
    const score=objective(trial);
    if(score<best){best=score;bestTeam=trial}
   }
   if(bestTeam===null)break;balanced=bestTeam;current=best;
  }
  const solod=nearest(solo,seats,m),balancedD=nearest(balanced,seats,m);
  assert.ok(solo.length===old.length&&balanced.length===old.length,'Vehicle count changed');
  assert.ok(solod.every(Number.isFinite)&&balancedD.every(Number.isFinite),'Unreachable spare');
  assert.ok(solod[0]<=baseline[0],'Solo graph-aware candidate worsens player 0');
  assert.ok(objective(balanced)<=objective(old),'Balanced candidate worsens objective');
  const row={size,seed,baseline,solo:solod,balanced:balancedD,
    baselineWorst:Math.max(...baseline),soloWorst:Math.max(...solod),balancedWorst:Math.max(...balancedD),
    baselineGap:gap(baseline),soloGap:gap(solod),balancedGap:gap(balancedD),
    baselinePlayer:baseline[0],soloPlayer:solod[0],balancedPlayer:balancedD[0]};
  sizeRows.push(row);results.push(row);
 }
 const summary={
  samples:sizeRows.length,
  currentPlayerRecovery:stats(sizeRows.map(r=>r.baselinePlayer)),
  soloProposedPlayerRecovery:stats(sizeRows.map(r=>r.soloPlayer)),
  seatBalancedProposedPlayerRecovery:stats(sizeRows.map(r=>r.balancedPlayer)),
  currentWorstSeatRecovery:stats(sizeRows.map(r=>r.baselineWorst)),
  soloProposedWorstSeatRecovery:stats(sizeRows.map(r=>r.soloWorst)),
  seatBalancedProposedWorstSeatRecovery:stats(sizeRows.map(r=>r.balancedWorst)),
  currentSeatGap:stats(sizeRows.map(r=>r.baselineGap)),
  soloProposedSeatGap:stats(sizeRows.map(r=>r.soloGap)),
  seatBalancedProposedSeatGap:stats(sizeRows.map(r=>r.balancedGap)),
  soloPlayerImprovedPct:pct(sizeRows,r=>r.soloPlayer<r.baselinePlayer),
  soloWorstSeatWorsenedPct:pct(sizeRows,r=>r.soloWorst>r.baselineWorst),
  balancedWorstSeatImprovedPct:pct(sizeRows,r=>r.balancedWorst<r.baselineWorst),
  balancedPlayerWorsenedPct:pct(sizeRows,r=>r.balancedPlayer>r.baselinePlayer)
 };
 fs.writeFileSync(output+'/'+size+'-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('SPARE_POLICY_COMPARISON '+size+' '+JSON.stringify(summary));
}
const severe=results.filter(r=>r.baselinePlayer>=16||r.baselineGap>=24||r.soloWorst>r.baselineWorst)
  .sort((a,b)=>b.baselineWorst-a.baselineWorst);
fs.writeFileSync(output+'/all-seeds.json',JSON.stringify(results,null,2)+'\n');
fs.writeFileSync(output+'/review-these-seeds.json',JSON.stringify(severe,null,2)+'\n');
console.log('SPARE_PLACEMENT_PROTOTYPE_PASS '+JSON.stringify({total:results.length,gameplayCodeChanged:false,
 interpretation:'Hypothetical placement positions only, current game remains unchanged. Candidate does not test combat, powerups or physical balance.'}));
