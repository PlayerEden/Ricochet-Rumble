// Dependency-free runtime tests for the actual game script and input wiring.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers={};const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){}},style:{},
  setPointerCapture(){},releasePointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:148,height:148}},
  addEventListener(name,fn){(handlers[id+':'+name]??=[]).push(fn)},querySelector(){return null}});return nodes.get(id)}
const ctx=new Proxy({fillText(){},clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}},{get(t,p){return t[p]},set(t,p,v){t[p]=v;return true}});
node('arena').getContext=()=>ctx;
let frame=null,tick=0,hostCalled=false,discoverCalled=false,packets=[];
const android={hostGame(){hostCalled=true},findGames(){discoverCalled=true},joinGame(){},stopNetwork(){},sendPacket(p){packets.push(JSON.parse(p))}};
const win={AndroidBridge:android,addEventListener(){}};
const document={getElementById:node,querySelectorAll(){return []}};
const env={window:win,document,performance:{now(){return tick}},requestAnimationFrame(f){frame=f},clearTimeout(){},setTimeout(){return 1},console,Math,Number,Set,JSON,String};
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
// Add test-only access to internal state; production JS stays unchanged.
script=script.replace(/\}\)\(\);\s*$/,'window.__test={get state(){return state},registerHit,resetAll,step,makeControl,setArena,spawnPickup,collectPickup,serializeState,shoot};})();');
vm.runInNewContext(script,env,{filename:'game.js'});
assert.ok(frame,'animation callback scheduled');
function click(action){for(const f of handlers['menu:click'])f({target:{closest(){return {dataset:{action}}},dataset:{action}}})}
function runFrames(count){for(let i=0;i<count;i++){tick+=16.667;const fn=frame;frame=null;fn(tick);assert.ok(frame,'next animation frame scheduled')}}
click('solo');runFrames(12);assert.equal(node('mode-label').textContent,'SOLO VS BOT');
assert.equal(node('score0').textContent,5);assert.equal(node('score1').textContent,5);
// A nonlethal hit deducts only a life: no pause, no arena reset.
assert.equal(win.__test.registerHit(0,1),true);assert.equal(win.__test.state.lives[1],4);
assert.equal(win.__test.state.winner,-1);assert.ok(win.__test.state.tanks[1].shield>0);
assert.equal(win.__test.registerHit(0,1),false,'spawn shield prevents chain kills');
runFrames(12);assert.equal(win.__test.state.lives[1],4,'remaining lives persist after normal frames');
assert.equal(node('score1').textContent,4);
// Analog joystick input: grab, drag and release, with variable intensity.
const stickDown=handlers['joystick:pointerdown'][0],stickMove=handlers['joystick:pointermove'][0],stickUp=handlers['joystick:pointerup'][0];
stickDown({pointerId:7,clientX:74,clientY:74,preventDefault(){}});
stickMove({pointerId:7,clientX:115,clientY:74,preventDefault(){}});
assert.ok(win.__test.makeControl(true).moveX>.7,'analog joystick sends positive X');
assert.ok(Math.abs(win.__test.makeControl(true).moveY)<.01);
stickUp({pointerId:7});assert.equal(win.__test.makeControl(true).moveX,0,'released joystick returns to zero');
// Elimination only after all five lives; rematch resets cleanly.
for(let i=0;i<4;i++){win.__test.state.tanks[1].shield=0;assert.equal(win.__test.registerHit(0,1),true)}
assert.equal(win.__test.state.lives[1],0);assert.equal(win.__test.state.winner,0);
click('restart');assert.equal(win.__test.state.lives[1],5);assert.equal(win.__test.state.winner,-1);
click('duel');runFrames(10);assert.equal(node('mode-label').textContent,'LOCAL DUEL');
// Real projectile collision must deduct a life without deleting unrelated shells or resetting the arena.
const target=win.__test.state.tanks[1];
win.__test.state.bullets.push({x:target.x,y:target.y,vx:5,vy:0,owner:0,life:1,bounces:0,age:0});
win.__test.state.bullets.push({x:400,y:295,vx:0,vy:0,owner:0,life:1,bounces:0,age:0});
win.__test.step(.016);
assert.equal(win.__test.state.lives[1],4,'projectile contact deducts one life');
assert.ok(win.__test.state.bullets.some(b=>b.life>0),'unrelated bullets survive the hit');
assert.equal(win.__test.state.winner,-1,'normal combat continues after projectile hit');
click('host');assert.ok(hostCalled);win.RR.nativeMessage(JSON.stringify({type:'hosting',address:'192.168.1.1',port:35670}));
win.RR.nativeMessage(JSON.stringify({type:'connected'}));runFrames(10);
assert.ok(packets.some(p=>p.type==='state'&&p.state.lives.length===2),'host sends lives and game snapshots');
win.RR.nativeMessage(JSON.stringify({type:'input',input:{moveX:.75,moveY:-.25,fire:true}}));
assert.ok(win.__test.state.winner===-1);
click('find');assert.ok(discoverCalled);win.RR.nativeMessage(JSON.stringify({type:'connected'}));
win.RR.nativeMessage(JSON.stringify({type:'state',state:{tanks:[{x:100,y:100,a:0,shield:0},{x:900,y:500,a:3,shield:0}],bullets:[],lives:[2,3],kos:[3,2],winner:-1,event:'',eventTimer:0,matchId:0}}));
assert.equal(node('score0').textContent,2);assert.equal(node('score1').textContent,3);
runFrames(6);assert.ok(packets.some(p=>p.type==='input'&&'moveX' in p.input),'guest sends analog move vector');
// v0.3: three maps, player-selected map and host-to-guest map synchronization.
node('arena-choice').value='2';
click('solo');assert.equal(win.__test.state.arenaId,2,'Pinball arena selected before match');
win.__test.resetAll(true);assert.equal(win.__test.state.arenaId,0,'next arena cycles back to Foundry');
node('arena-choice').value='1';click('duel');
assert.equal(win.__test.state.arenaId,1,'Crossroads loads with its own obstacles');
// A pickup should be spawned and its effect should survive serialization.
win.__test.state.pickups=[{x:win.__test.state.tanks[0].x,y:win.__test.state.tanks[0].y,type:'rapid'}];
win.__test.step(.016);
assert.equal(win.__test.state.tanks[0].powerType,'rapid','pickup collected by tank');
assert.equal(win.__test.state.pickups.length,0,'picked up item removed');
const pre=win.__test.state.bullets.length;
win.__test.shoot(0);
assert.equal(win.__test.state.bullets.length,pre+1,'rapid fire still fires normal bullets');
assert.equal(win.__test.serializeState().tanks[0].powerType,'rapid','network snapshot includes powerups');
assert.ok(win.__test.serializeState().fxEvents.length>0,'network snapshot includes visual event ids');
// Barrier absorbs one incoming hit and is consumed without taking a life.
const remaining=win.__test.state.lives[0];const victim=win.__test.state.tanks[0];
victim.powerType='guard';victim.powerTimer=4;victim.shield=0;
assert.equal(win.__test.registerHit(1,0),false,'guard absorbs hit');
assert.equal(win.__test.state.lives[0],remaining,'guard protects life');
assert.equal(victim.powerType,null,'guard is consumed');
// Turbo is an increase to movement capability, and timers expire.
victim.powerType='turbo';victim.powerTimer=.005;win.__test.step(.02);
assert.equal(victim.powerType,null,'expired bonuses are cleared');
// LAN state should bring over arena choice and pickups to a guest.
click('find');win.RR.nativeMessage(JSON.stringify({type:'connected'}));
win.RR.nativeMessage(JSON.stringify({type:'state',state:{tanks:[{x:130,y:300,a:0,shield:0,powerType:'rapid',powerTimer:4},{x:830,y:300,a:3,shield:0,powerType:null,powerTimer:0}],bullets:[],pickups:[{x:480,y:300,type:'turbo'}],arenaId:2,fxEvents:[],lives:[5,5],kos:[0,0],winner:-1,event:'',eventTimer:0,matchId:1}}));
assert.equal(win.__test.state.arenaId,2);
assert.equal(win.__test.state.pickups[0].type,'turbo');
assert.equal(win.__test.state.tanks[0].powerType,'rapid');
// Pinball's glowing bumpers are functional: shells reverse on impact.
click('solo'); // uses selected Crossroads in this harness until arena is changed explicitly
win.__test.setArena(2);
win.__test.state.arenaId=2;
win.__test.state.bullets=[{x:197,y:225,vx:200,vy:0,owner:0,life:1,bounces:0,age:0}];
win.__test.step(.03);
assert.ok(win.__test.state.bullets[0].vx<0,'Pinball bumper reflected incoming shell');
console.log('PASS: v0.3 lives, joystick, ricochets, 3 arenas, pickups, buffs, barrier, FX, network sync, and rematch.');
