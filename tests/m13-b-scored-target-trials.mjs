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
// Team Survival and TDM require the exact real Forward Bays planner.
vm.runInNewContext(fs.readFileSync(new URL('../web/forward-bays.js',import.meta.url),'utf8'),env,{filename:'forward-bays.js'});
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');

// TEST-ONLY: substitute the HUMAN input adapter for seat 0 with the *same*
// unmodified in-game botInput controller. All combat/projectile/AI/map code
// remains identical to production. This models symmetric ALL-AI encounters,
// NOT human performance, thumbs, network, graphics, or player skill.
const playerSeat="i===0?makeControl(true):i===1";
assert.equal(script.split(playerSeat).length,2,"exact single local human input adapter to replace");
script=script.replace(playerSeat,"i===0?(window.__benchIdle?makeControl(true):botInput(i,dt)):i===1");
assert.ok(/\}\)\(\);\s*$/.test(script),"expected source trailer");
const auditHook=String.raw`window.__balance={
 start(id,seed,skill='normal',profile={},idle=false){
  const rule=SCORED_MATCH_RULES[id]||null;
  window.__benchIdle=!!idle;
  mode='solo';paused=false;connected=false;
  state=initialState(0,{...selectedRules,matchModeId:id,teamMode:rule?.mode==='teams'||id==='survival_teams'?'teams':'ffa',
   mapSize:id==='cqc'?'small':'standard',botCount:3,bulletCap:4,startLives:2,
   botSkill:skill,pilotMode:true,...profile},seed);
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



// M13-B3 experimental target A/B only. The real scored-match kernel runs with
// an overridden scoreTarget in this isolated VM; shipped score rules NEVER change.
const count=Number(process.env.M13_TARGET_SEEDS||12),dt=1/30;
assert.ok(Number.isInteger(count)&&count>=3&&count<=24);
const cases=[
 ['cqc',10],['cqc',15],['cqc',20],
 ['scored_tdm',15],['scored_tdm',20],['scored_tdm',30],
 ['scored_ffa',10],['scored_ffa',15]
];
const rows=[];
for(const [id,target] of cases)for(let n=1;n<=count;n++){
 const seed=1000003+n*97;seedRandom(seed+2718);
 const st=engine.start(id,seed,'normal',{mapSize:id==='cqc'?'small':'standard',botCount:3,startLives:2},false);
 assert.ok(st.scored&&st.scored.clockSeconds>=180);
 // Match-score A/B is intentionally TEST ONLY: immutable match replacement.
 st.scored=Object.freeze({...st.scored,scoreTarget:target});
 let steps=0,firstKO=null;
 while(st.winner<0&&steps<Math.ceil(st.scored.clockSeconds/dt)){
  engine.tick(dt);steps++;
  if(firstKO===null&&st.kos.some(k=>k>0))firstKO=st.elapsedSeconds;
 }
 assert.ok(st.winner>=0,'Every scored match ended by real score or time limit');
 assert.ok(st.scored.finished,'Pure scored kernel has result');
 assert.ok(st.elapsedSeconds<=st.scored.clockSeconds+.1);
 rows.push({mode:id,target,seed,
  seconds:Math.round(st.elapsedSeconds*10)/10,
  reason:st.scored.result.reason,firstKO,
  totalKOs:st.kos.reduce((sum,k)=>sum+k,0),
  winner:st.scored.result.winningSide,draw:st.scored.result.isDraw});
}
const percentile=(arr,p)=>{const a=arr.slice().sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)]};
const summary={};
for(const [id,target] of cases){
 const rowsFor=rows.filter(r=>r.mode===id&&r.target===target);
 summary[id+'/'+target]={
  seeds:rowsFor.length,p10:percentile(rowsFor.map(x=>x.seconds),.1),
  median:percentile(rowsFor.map(x=>x.seconds),.5),
  p90:percentile(rowsFor.map(x=>x.seconds),.9),
  scoredFinish:rowsFor.filter(r=>r.reason==='score_target').length,
  clockFinish:rowsFor.filter(r=>r.reason==='time_limit').length,
  finishedUnder90:rowsFor.filter(r=>r.seconds<90).length,
  draws:rowsFor.filter(r=>r.draw).length,
  meanKOs:Math.round(rowsFor.reduce((sum,r)=>sum+r.totalKOs,0)/rowsFor.length*10)/10
 };
}
fs.mkdirSync('qa-results/m13-b',{recursive:true});
fs.writeFileSync('qa-results/m13-b/score-target-trials.json',
 JSON.stringify({status:'EXPERIMENT_ONLY_NOT_SHIPPED',samplesPerTarget:count,
  control:'real existing physics/bot AI and scored kernel, AI-proxy human, same seeds',
  constraints:'Score targets altered only in VM. No human, real phone or LAN claims.',summary,rows},null,2)+'\n');
console.log('M13_B_SCORED_TARGET_AB_OBSERVED '+JSON.stringify(summary));
