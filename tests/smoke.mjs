// V0.5 headless game-logic and protocol regression checks, no npm dependencies.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers={},nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},
  classList:{add(){},remove(){},contains(){return false}},setPointerCapture(){},releasePointerCapture(){},
  getBoundingClientRect(){return {left:0,top:0,width:148,height:148}},
  addEventListener(name,fn){(handlers[id+':'+name]??=[]).push(fn)},querySelector(){return null}});return nodes.get(id)}
const ctx=new Proxy({fillText(){},scale(){},clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}},{get(t,p){return t[p]},set(t,p,v){t[p]=v;return true}});
node('arena').getContext=()=>ctx;
node('bot-count').value='1';node('bullet-cap').value='3';node('lives-choice').value='5';node('team-choice').value='ffa';node('arena-choice').value='0';
let frame=null,tick=0,hostCalled=false,discoverCalled=false,packets=[];
const android={hostGame(){hostCalled=true},findGames(){discoverCalled=true},joinGame(){},stopNetwork(){},sendPacket(p){packets.push(JSON.parse(p))}};
const win={AndroidBridge:android,addEventListener(){}},document={getElementById:node,querySelectorAll(){return []}};
const env={window:win,document,performance:{now(){return tick}},requestAnimationFrame(f){frame=f},clearTimeout(){},setTimeout(){return 1},console,Math,Number,Set,JSON,String};
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
script=script.replace(/\}\)\(\);\s*$/,'window.__test={get state(){return state},get world(){return [worldW,worldH]},get walls(){return wallSet},get maze(){return mazeGrid},get camera(){return camera},registerHit,resetAll,step,makeControl,setArena,spawnPickup,collectPickup,serializeState,shoot,teamOf};})();');
vm.runInNewContext(script,env,{filename:'game.js'});
assert.ok(frame,'animation callback scheduled');
function click(action){for(const f of handlers['menu:click'])f({target:{closest(){return {dataset:{action}}},dataset:{action}}})}
function runFrames(count){for(let i=0;i<count;i++){tick+=16.667;const fn=frame;frame=null;fn(tick);assert.ok(frame,'next animation frame scheduled')}}
const st=()=>win.__test.state;
click('solo');runFrames(12);assert.equal(node('mode-label').textContent,'SOLO VS BOTS');
assert.equal(st().tanks.length,2);assert.deepEqual([...st().lives],[5,5]);
assert.equal(win.__test.registerHit(0,1),true);assert.equal(st().lives[1],4);assert.equal(st().winner,-1);
assert.equal(win.__test.registerHit(0,1),false,'spawn shield prevents spawn camping');
runFrames(10);assert.equal(st().lives[1],4);
// Joystick precision and release.
const down=handlers['joystick:pointerdown'][0],move=handlers['joystick:pointermove'][0],up=handlers['joystick:pointerup'][0];
down({pointerId:1,clientX:74,clientY:74,preventDefault(){}});move({pointerId:1,clientX:103,clientY:74,preventDefault(){}});
assert.ok(win.__test.makeControl(true).moveX>.55);up({pointerId:1});assert.equal(win.__test.makeControl(true).moveX,0);
for(let i=0;i<4;i++){st().tanks[1].shield=0;assert.equal(win.__test.registerHit(0,1),true)}
assert.equal(st().winner,0);click('restart');assert.equal(st().winner,-1);
// Each owner has a hard projectile cap; additional presses cannot bypass it.
node('bullet-cap').value='2';click('solo');assert.equal(st().config.bulletCap,2);
assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),false);
assert.equal(st().bullets.filter(b=>b.owner===0).length,2);st().bullets[0].life=0;assert.equal(win.__test.shoot(0),true);
// Settings: lives, 4 bots, and team immunity.
node('bullet-cap').value='3';node('bot-count').value='4';node('lives-choice').value='3';node('team-choice').value='coop';
click('solo');assert.equal(st().tanks.length,5);assert.equal(st().lives[4],3);assert.equal(win.__test.teamOf(1),win.__test.teamOf(4));
assert.equal(win.__test.registerHit(1,4),false,'allied bots cannot hurt each other');
assert.equal(win.__test.registerHit(0,4),true,'human can fight enemy bots');
// Maze generator: seeded deterministic geometry; large navigable space and moving camera.
node('arena-choice').value='3';click('solo');assert.equal(st().arenaId,3);
assert.ok(win.__test.world[0]>960&&win.__test.world[1]>600);assert.ok(win.__test.walls.length>50);
const mazeHash=JSON.stringify(win.__test.walls);const seed=st().mazeSeed;
win.__test.setArena(0);win.__test.setArena(3,seed);assert.equal(JSON.stringify(win.__test.walls),mazeHash);
runFrames(15);const x0=win.__test.camera.x;st().tanks[0].x=900;st().tanks[0].y=650;runFrames(20);
assert.ok(win.__test.camera.x>x0,'camera tracks local tank across maze');
assert.equal(win.__test.serializeState().mazeSeed,seed);assert.equal(win.__test.serializeState().config.botCount,4);
// Settings and arena stay authoritative on host and propagate via snapshots.
click('host');assert.ok(hostCalled);win.RR.nativeMessage(JSON.stringify({type:'connected'}));runFrames(10);
assert.ok(packets.some(p=>p.type==='state'&&p.state.config.botCount===4&&p.state.tanks.length===6),'host sends bots/config');
win.RR.nativeMessage(JSON.stringify({type:'input',input:{moveX:.65,moveY:0,fire:true}}));
click('find');assert.ok(discoverCalled);win.RR.nativeMessage(JSON.stringify({type:'connected'}));
const authoritative=packets.find(p=>p.type==='state').state;
win.RR.nativeMessage(JSON.stringify({type:'state',state:authoritative}));
assert.equal(st().tanks.length,6);assert.equal(st().mazeSeed,authoritative.mazeSeed);
runFrames(6);assert.ok(packets.some(p=>p.type==='input'&&'moveX' in p.input),'guest sends analog input');
// Existing compact Pinball bumper remains functional in solo.
node('bot-count').value='1';node('team-choice').value='ffa';node('lives-choice').value='5';node('arena-choice').value='2';
click('solo');assert.equal(st().arenaId,2);st().bullets=[{x:197,y:225,vx:200,vy:0,owner:0,life:1,bounces:0,age:0}];
win.__test.step(.03);assert.ok(st().bullets[0].vx<0,'bumper reflects projectile');
// Barrier & turbo timers still work.
const victim=st().tanks[0];victim.powerType='guard';victim.powerTimer=4;victim.shield=0;
assert.equal(win.__test.registerHit(1,0),false);assert.equal(st().lives[0],5);
victim.powerType='turbo';victim.powerTimer=.005;win.__test.step(.02);assert.equal(victim.powerType,null);
console.log('PASS: v0.5 camera, seeded mazes, 4 bots, team rules, lives, bullet caps, ricochets, pickups and LAN snapshots.');