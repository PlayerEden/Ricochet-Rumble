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


assert.ok(/\}\)\(\);\s*$/.test(script),'Expected the unmodified production game IIFE trailer');
script=script.replace(/\}\)\(\);\s*$/,"window.__feelProbe={\n sample(modeId,vehicleType,onFoot=false,aimOnly=false,launch=false){\n  mode='solo';paused=false;connected=false;\n  state=initialState(0,{...selectedRules,pilotMode:true,mapSize:'standard',teamMode:'ffa',\n   botCount:3,matchModeId:modeId==='survival_ffa'?'survival_ffa':modeId},829191);\n  fireCooldown.fill(0);const t=state.tanks[0];\n  for(let i=1;i<state.tanks.length;i++){state.tanks[i].x=90000+i*1000;state.tanks[i].y=90000+i*1000;}\n  t.x=(Math.floor(mazeGrid.cols/2)+.5)*mazeGrid.cell;\n  t.y=(Math.floor(mazeGrid.rows/2)+.5)*mazeGrid.cell;\n  t.a=0;t.vx=0;t.vy=0;t.powerType=null;t.powerTimer=0;\n  if(onFoot){t.onFoot=true;t.vehicleId=null;}\n  else {const v=state.vehicles[t.vehicleId];if(!v)throw Error('No spawned vehicle');v.type=vehicleType;v.x=t.x;v.y=t.y;}\n  if(launch){\n   t.shield=0;\n   const shot=shoot(0),b=state.bullets.at(-1);\n   return {shot,kind:b?.kind||null,speed:b?Math.hypot(b.vx,b.vy):0,life:b?.life??null,\n      vehicleCooldown:onFoot?.43:vehicleDef(currentVehicle(t)).fireCooldown,cap:activeBulletCap(t)};\n  }\n  const input=aimOnly?{moveX:0,moveY:0,aimX:0,aimY:1,fire:false,bot:false}:{moveX:0,moveY:1,fire:false,bot:false};\n  tankMove(t,input,STEP,0);\n  return {mode:modeId,unit:onFoot?'pilot':vehicleType,aimOnly,dt:STEP,\n    vx:t.vx,vy:t.vy,headingChangeRad:Math.atan2(Math.sin(t.a),Math.cos(t.a)),\n    posY:t.y,shield:t.shield};\n }\n};})();");
vm.runInNewContext(script,env,{filename:'control-feel-source-under-test.js'});
const probe=win.__feelProbe;
assert.ok(probe&&frame,'Real game engine loaded, no gameplay code substituted');

const rad=n=>Math.round(n*1000000)/1000000;
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-5,label+': expected '+b+', got '+a);
const rows=[];
for(const modeId of ['survival_ffa','scored_ffa','scored_tdm']){
 for(const unit of ['tank','mech','pilot']){
  const foot=unit==='pilot';
  const moving=probe.sample(modeId,unit,foot,false,false);
  const aim=probe.sample(modeId,unit,foot,true,false);
  const shot=probe.sample(modeId,unit,foot,false,true);
  assert.equal(shot.shot,true,'Actual shoot() succeeds on '+modeId+' '+unit);
  const expectedSpeed=foot?268:(modeId==='survival_ffa'?222:166)*(unit==='mech'?.76:1);
  // Real acceleration blend is 9/60 on the first moving frame.
  near(Math.hypot(moving.vx,moving.vy),expectedSpeed*.15,modeId+'/'+unit+' first-frame velocity');
  const turn=foot?6.5:modeId==='survival_ffa'?12:2.6;
  near(moving.headingChangeRad,turn/60,modeId+'/'+unit+' turn per physics frame');
  near(aim.headingChangeRad,foot?6.5/60:modeId==='survival_ffa'?0:1.8/60,modeId+'/'+unit+' stationary aim-only turn');
  const bulletSpeed=foot?475:unit==='mech'?355:415;
  near(shot.speed,bulletSpeed,modeId+'/'+unit+' actual projectile speed');
  const row={mode:modeId,unit,physicsDt:moving.dt,
    nominalMoveUnitsPerSecond:expectedSpeed,
    measuredFirstFrameVelocity:rad(Math.hypot(moving.vx,moving.vy)),
    measuredTurnPerFrameRadians:rad(moving.headingChangeRad),
    measuredAimOnlyTurnPerFrameRadians:rad(aim.headingChangeRad),
    projectileSpeedUnitsPerSecond:shot.speed,projectileKind:shot.kind,
    projectileLifetimeSeconds:shot.life,
    baseFireCooldownSeconds:shot.vehicleCooldown,activeProjectileCap:shot.cap};
  rows.push(row);
 }
}
assert.equal(rows.length,9);
const survival=rows.find(x=>x.mode==='survival_ffa'&&x.unit==='tank');
const scored=rows.find(x=>x.mode==='scored_ffa'&&x.unit==='tank');
assert.ok(survival.nominalMoveUnitsPerSecond>scored.nominalMoveUnitsPerSecond,'Confirmed Survival vs scored movement discrepancy');
assert.ok(survival.measuredTurnPerFrameRadians>scored.measuredTurnPerFrameRadians,'Confirmed different turning modes');
const report={schemaVersion:1,scope:'SOURCE ONLY: original unmodified game.js tankMove + shoot() actual physics, first 1/60s response; not a timed session or real touch test',rows,
 summary:{survivalTankSpeed:survival.nominalMoveUnitsPerSecond,scoredTankSpeed:scored.nominalMoveUnitsPerSecond,
 speedRatio:rad(survival.nominalMoveUnitsPerSecond/scored.nominalMoveUnitsPerSecond),
 survivalTurnRadPerPhysicsFrame:survival.measuredTurnPerFrameRadians,
 scoredTurnRadPerPhysicsFrame:scored.measuredTurnPerFrameRadians,
 scoredPrecisionAimRadPerPhysicsFrame:scored.measuredAimOnlyTurnPerFrameRadians,
 conclusion:'Measurable handling discrepancy; NO gameplay changes made'},
 manualPending:['actual two-thumb gestures','precision angle and ricochet hit rate','tank vs mech preference','eject/reboard comfort','30/60/90/120 Hz physical device behavior']};
const outPath='qa-results/control-feel-v0949/baseline.json';
fs.mkdirSync('qa-results/control-feel-v0949',{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
console.log('CONTROL_FEEL_SOURCE_BASELINE '+JSON.stringify(report.summary));
console.log('SOURCE_TEST_PASS '+rows.length+' real-engine mode/unit samples; zero production edits; physical feel PENDING');
