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


const count=Number(process.env.M13_E_SEEDS||20),dt=1/30,limit=420;
assert.ok(Number.isInteger(count)&&count>=3&&count<=24,'bounded sample count');
assert.equal(scenarios.length,8,'8 controlled Survival profiles including idle');;
const scenarios=[
 // Source of truth is the unchanged real combat engine; only test deployment
 // options vary, never synthetic armor, respawn protection or fake combat.
 {mode:'survival_ffa',profile:'base_3bots_3lives_standard',opts:{mapSize:'standard',botCount:3,startLives:3},idle:false},
 {mode:'survival_ffa',profile:'life_3bots_5lives_standard',opts:{mapSize:'standard',botCount:3,startLives:5},idle:false},
 {mode:'survival_ffa',profile:'bots_4bots_3lives_standard',opts:{mapSize:'standard',botCount:4,startLives:3},idle:false},
 {mode:'survival_ffa',profile:'both_4bots_5lives_standard',opts:{mapSize:'standard',botCount:4,startLives:5},idle:false},
 {mode:'survival_ffa',profile:'large_4bots_5lives_large',opts:{mapSize:'large',botCount:4,startLives:5},idle:false},
 {mode:'survival_ffa',profile:'base_3bots_3lives_standard',opts:{mapSize:'standard',botCount:3,startLives:3},idle:true},
 {mode:'survival_ffa',profile:'both_4bots_5lives_standard',opts:{mapSize:'standard',botCount:4,startLives:5},idle:true},
 {mode:'survival_ffa',profile:'large_4bots_5lives_large',opts:{mapSize:'large',botCount:4,startLives:5},idle:true}
 ];
assert.equal(scenarios.length,8,'8 controlled Survival profiles including idle');
const rows=[];
for(const scenario of scenarios)for(let n=1;n<=count;n++){
 const seed=1000003+n*97;seedRandom(seed+2718);
 const st=engine.start(scenario.mode,seed,'normal',scenario.opts,scenario.idle);
 const cap=st.scored?st.scored.clockSeconds:limit;let shot=null,ko=null,death=null,steps=0;
 while(st.winner<0&&steps<Math.ceil(cap/dt)){
  engine.tick(dt);steps++;
  if(shot===null&&st.fxEvents.some(f=>f.kind==='shot'))shot=st.elapsedSeconds;
  if(ko===null&&st.kos.some(k=>k>0))ko=st.elapsedSeconds;
  if(death===null&&st.deaths.some(d=>d>0))death=st.elapsedSeconds;
 }
 assert.ok(st.elapsedSeconds>=0&&st.elapsedSeconds<=cap+.1);
 rows.push({mode:scenario.mode,profile:scenario.profile,operator:scenario.idle?'IDLE':'AI_PROXY',
  seed,seconds:Math.round(st.elapsedSeconds*10)/10,finished:st.winner>=0,
  reason:st.scored?.result?.reason||(st.winner>=0?'last_side_standing':'sample_cap'),
  totalKOs:st.kos.reduce((s,n)=>s+n,0),totalDeaths:st.deaths.reduce((s,n)=>s+n,0),
  firstShotSeconds:shot,firstKOSeconds:ko,firstDeathSeconds:death,steps});
}
const groups={};
for(const row of rows)(groups[[row.mode,row.profile,row.operator].join('/')]??=[]).push(row);
const quantile=(data,p)=>{const a=data.slice().sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)]};
const summary=Object.fromEntries(Object.entries(groups).map(([id,list])=>[id,{
 n:list.length,finished:list.filter(r=>r.finished).length,
 below60:list.filter(r=>r.finished&&r.seconds<60).length,
 below120:list.filter(r=>r.finished&&r.seconds<120).length,
 p10:quantile(list.map(r=>r.seconds),.1),median:quantile(list.map(r=>r.seconds),.5),
 p90:quantile(list.map(r=>r.seconds),.9),
 meanKOs:Math.round(list.reduce((a,r)=>a+r.totalKOs,0)/list.length*10)/10,
 endReasons:list.reduce((o,r)=>(o[r.reason]=(o[r.reason]||0)+1,o),{})
}]));
const report={status:'M13_E_SIMULATED_AB_ONLY_NOT_SHIPPED',seedsPerScenario:count,hz:30,
 caveat:'M13-E deploy-only Survival A/B: unchanged real physics + natural bot AI. Human seat is idle or AI-proxy, NOT a real phone/human playtest. Survival winner remains last-side-standing, no minimum duration.',summary,rows};
fs.mkdirSync('qa-results/m13-e',{recursive:true});
fs.writeFileSync('qa-results/m13-e/survival-profile-trials.json',JSON.stringify(report,null,2)+'\n');
console.log('M13_E_SURVIVAL_PROFILE_TRIALS_OBSERVED '+JSON.stringify(summary));
