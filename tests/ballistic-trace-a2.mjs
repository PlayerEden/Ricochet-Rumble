// A2 real-engine ballistic contract: live and trace share origin/microstep,
// while trace cannot mutate game state, deal damage or emit SFX/FX.
// Runs in Node VM using the normal browser game.js and supporting rules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const handlers={},nodes=new Map();
function node(id){
 if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},
  classList:(()=>{const s=new Set();return {add(x){s.add(x)},remove(x){s.delete(x)},contains(x){return s.has(x)},toggle(x,v){if(v??!s.has(x))s.add(x);else s.delete(x)}}})(),
  setPointerCapture(){},releasePointerCapture(){},
  getBoundingClientRect(){return {left:0,top:0,width:148,height:148}},
  addEventListener(n,fn){(handlers[id+':'+n]??=[]).push(fn)},querySelector(){return null}});
 return nodes.get(id);
}
const ctx=new Proxy({fillText(){},scale(){},clearRect(){},fillRect(){},strokeRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},stroke(){},clip(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){},setLineDash(){}},
 {get(o,k){return o[k]},set(o,k,v){o[k]=v;return true}});
node('arena').getContext=()=>ctx;
node('bot-skill').value='normal';node('bot-count').value='2';
node('bullet-cap').value='3';node('lives-choice').value='3';node('team-choice').value='ffa';node('map-size').value='standard';
let frame=null,now=0;const storage=new Map();
const win={AndroidBridge:{hostGame(){},findGames(){},joinGame(){},stopNetwork(){},sendPacket(){}},
 addEventListener(){},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))}};
const document={addEventListener(){},getElementById:node,querySelector(){return node('battlefield')},
 querySelectorAll(){return []}};
const env={window:win,document,performance:{now(){return now}},requestAnimationFrame(fn){frame=fn},
 clearTimeout(){},setTimeout(){return 1},console,Math,Number,Set,JSON,String};
for(const name of ['scored-match','forward-bays','dossier'])
 vm.runInNewContext(fs.readFileSync(new URL('../web/'+name+'.js',import.meta.url),'utf8'),env,{filename:name+'.js'});
let source=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
assert.ok(/\}\)\(\);\s*$/.test(source),'recognizable game closure');
source=source.replace(/\}\)\(\);\s*$/,`window.__trajA2={
 reset(seed=123,kind='pilot',botCount=1){
  mode='solo';paused=false;
  state=initialState(0,{mapSize:'standard',botCount,teamMode:'ffa',
   matchModeId:kind==='pilot'?'cqc':'scored_ffa',botSkill:'normal',
   pilotMode:true,startLives:3},seed);
  state.winner=-1;fireCooldown.fill(0);state.bullets=[];
  for(const t of state.tanks){t.shield=0;t.powerTimer=0;t.powerType=null;t.vx=t.vy=0;t.a=0;}
  for(const t of state.tanks)t.onFoot=kind==='pilot';
  if(kind==='mech')for(const t of state.tanks){
   const v=state.vehicles[t.vehicleId];v.type='mech';v.armor=vehicleDef(v).armor;
  }
  return state;
 },
 get state(){return state}, get maze(){return mazeGrid},
 blocked,hasLineOfSight,projectileOrigin,makeProjectile,advanceProjectileMicrostep,
 traceProjectile,previewTrajectory,shoot,step,
 get fx(){return fxSeq}
};})();`);
vm.runInNewContext(source,env,{filename:'game.js'});
assert.ok(frame,'real game RAF initialized');
const a=win.__trajA2;
const close=(u,v,label)=>assert.ok(Math.abs(u-v)<1e-7,label+': '+u+' vs '+v);
function openHorizontal(){
 const g=a.maze;
 for(let row=0;row<g.rows;row++)for(let col=0;col<g.cols-1;col++){
  const i=row*g.cols+col;
  if(!g.open[i].includes(i+1))continue;
  const x=(col+.5)*g.cell,y=(row+.5)*g.cell;
  if(!a.hasLineOfSight(x,y,x+g.cell,y))continue;
  return {x,y};
 }
 throw Error('no open lane');
}
for(const kind of ['pilot','tank','mech']){
 const s=a.reset(104,kind,1),p=s.tanks[0],enemy=s.tanks[1],lane=openHorizontal();
 Object.assign(p,{x:lane.x,y:lane.y,a:0,vx:0,vy:0,shield:0});
 Object.assign(enemy,{x:lane.x+112,y:lane.y,a:Math.PI,vx:0,vy:0,shield:0});
 const planned=a.makeProjectile(p,0,p.a);
 assert.equal(a.shoot(0),true,'live projectile fires for '+kind);
 const live=s.bullets[0];
 for(const key of ['x','y','vx','vy','life','age','bounces'])close(planned[key],live[key],kind+' '+key);
 assert.equal(planned.kind,live.kind,kind+' kind matches');
 s.bullets=[];const fx=a.fx,armor=s.vehicles[p.vehicleId]?.armor;
 const originBefore={x:p.x,y:p.y,shield:p.shield};
 const trace=a.traceProjectile(p,0,{maxDistance:450,maxBounces:3,checkActors:true});
 assert.equal(trace.hit,1,kind+' projected path hits unshielded enemy');
 assert.equal(s.bullets.length,0,kind+' simulation emits no bullets');
 assert.equal(a.fx,fx,kind+' simulation emits no effects');
 assert.equal(s.vehicles[p.vehicleId]?.armor,armor,kind+' simulation does not damage vehicle');
 assert.deepEqual({x:p.x,y:p.y,shield:p.shield},originBefore,kind+' simulation cannot mutate owner');
 assert.ok(trace.segments.length>=1&&trace.distance>0,kind+' trace has motion');
 enemy.shield=20;
 assert.notEqual(a.traceProjectile(p,0,{maxDistance:450,checkActors:true}).hit,1,
  kind+' protected enemy is not a predicted hit');
 enemy.shield=0;
 // Simulate live bullets at the identical fixed step and compare first few
 // frames to manual microsteps; proves live integration uses the shared core.
 const clone=a.makeProjectile(p,0,p.a);s.bullets=[a.makeProjectile(p,0,p.a)];
 // Put the enemy far away so no live actor impact interrupts this motion probe.
 enemy.x=lane.x+600;enemy.y=lane.y+600;
 for(let frame=0;frame<4;frame++){
  clone.age+=1/60;clone.life-=1/60;
  const count=Math.max(1,Math.ceil(Math.max(Math.abs(clone.vx),Math.abs(clone.vy))/60/5));
  for(let k=0;k<count&&clone.life>0;k++)a.advanceProjectileMicrostep(clone,1/60/count);
  a.step(1/60);
  const b=s.bullets[0];
  assert.ok(b,kind+' live shot survives initial motion frames');
  for(const key of ['x','y','vx','vy','bounces'])close(b[key],clone[key],kind+' shared '+key);
 }
}
{
 const s=a.reset(105,'pilot',0),p=s.tanks[0],g=a.maze;
 let wall=null;
 for(let row=0;row<g.rows&&!wall;row++)for(let col=0;col<g.cols-1;col++){
  const x=(col+.5)*g.cell,y=(row+.5)*g.cell;
  if(!a.blocked(x,y,10)&&a.blocked(x+g.cell/2,y,5)){wall={x,y};break;}
 }
 assert.ok(wall,'find a genuine right wall');
 p.x=wall.x;p.y=wall.y;p.a=0;
 const foot=a.traceProjectile(p,0,{maxDistance:400,maxBounces:5});
 assert.equal(foot.termination,'wall','sidearm stops at wall, no bank shot');
 assert.equal(foot.bounces,0,'sidearm cannot bounce');
 p.onFoot=false;
 const tank=a.traceProjectile(p,0,{maxDistance:500,maxBounces:1});
 assert.ok(tank.bounce,'tank shell can bank off a solid maze wall');
 assert.ok(tank.bounces>=1,'wall bounce counted');
 const hint=a.previewTrajectory(p,0);
 assert.ok(hint.distance<=520+7,'UI remains short even when physics supports more');
 assert.ok(hint.segments.length<=2,'UI shows only one reflection');
}
{
 const s=a.reset(122,'tank',1),p=s.tanks[0],mate=s.tanks[1],lane=openHorizontal();
 Object.assign(p,{x:lane.x,y:lane.y,a:0});
 Object.assign(mate,{x:lane.x+100,y:lane.y,shield:0});
 s.config.teamMode='teams'; // indices 0/1 oppose
 assert.equal(a.traceProjectile(p,0,{maxDistance:250,checkActors:true}).hit,1,'red body intercepts');
 s.config.teamMode='coop';s.humanCount=2;
 assert.notEqual(a.traceProjectile(p,0,{maxDistance:250,checkActors:true}).hit,1,
  'friendly does not intercept while FF is currently disabled');
}
console.log('BALLISTIC_A2_CONTRACT_PASS: all muzzle kinds, side-effect-free static hits, 4-frame microstep parity, sidearm wall stop, shell bounce, short UI hint, friendly/enemy distinction');