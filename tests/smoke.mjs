// V0.6 headless game-logic and protocol regression checks, no npm dependencies.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers={},nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},
  classList:(()=>{const flags=new Set();return {add(k){flags.add(k)},remove(k){flags.delete(k)},contains(k){return flags.has(k)},toggle(k,v){const active=v===undefined?!flags.has(k):!!v;if(active)flags.add(k);else flags.delete(k);return active}}})(),setPointerCapture(){},releasePointerCapture(){},
  getBoundingClientRect(){return {left:0,top:0,width:148,height:148}},
  addEventListener(name,fn){(handlers[id+':'+name]??=[]).push(fn)},querySelector(){return null}});return nodes.get(id)}
const ctx=new Proxy({fillText(){},scale(){},clearRect(){},fillRect(){},strokeRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}},{get(t,p){return t[p]},set(t,p,v){t[p]=v;return true}});
node('arena').getContext=()=>ctx;
node('bot-skill').value='normal';
node('bot-count').value='1';node('bullet-cap').value='3';node('lives-choice').value='5';node('team-choice').value='ffa';node('arena-choice').value='0';
let frame=null,tick=0,hostCalled=false,discoverCalled=false,packets=[];
const android={hostGame(){hostCalled=true},findGames(){discoverCalled=true},joinGame(){},stopNetwork(){},sendPacket(p){packets.push(JSON.parse(p))}};
const win={AndroidBridge:android,addEventListener(){},localStorage:{getItem(){return null},setItem(){}}},document={addEventListener(){},getElementById:node,querySelector(){return node('battlefield')},querySelectorAll(){return []}};
const env={window:win,document,performance:{now(){return tick}},requestAnimationFrame(f){frame=f},clearTimeout(){},setTimeout(){return 1},console,Math,Number,Set,JSON,String};
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
script=script.replace(/\}\)\(\);\s*$/,'window.__test={get state(){return state},get world(){return [worldW,worldH]},get walls(){return wallSet},get maze(){return mazeGrid},get camera(){return camera},registerHit,resetAll,step,makeControl,setArena,spawnPickup,collectPickup,serializeState,shoot,teamOf,botInput,hasLineOfSight,comfort,releaseControls};})();');
vm.runInNewContext(script,env,{filename:'game.js'});
assert.ok(frame,'animation callback scheduled');
function click(action){for(const f of handlers['menu:click'])f({target:{closest(){return {dataset:{action}}},dataset:{action}}})}
function runFrames(count,ms=16.667){for(let i=0;i<count;i++){tick+=ms;const fn=frame;frame=null;fn(tick);assert.ok(frame,'next animation frame scheduled')}}
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
// New mobile accessibility: swappable touch columns, controls guide, and pause on background.
click('solo');click('help');assert.ok(node('panel').innerHTML.includes('HOW TO <span>PLAY</span>'));
click('help-back');assert.equal(node('panel').innerHTML,'','returns to original menu markup in this DOM test');
node('pref-leftHanded').checked=true;for(const cb of handlers['panel:change'])cb({target:{id:'pref-leftHanded',checked:true}});
assert.equal(win.__test.comfort.leftHanded,true);assert.equal(node('battlefield').classList.contains('swap-controls'),true);
// The muzzle cannot cross a solid wall even if the tank body is right beside it.
node('arena-choice').value='0';click('solo');const nearWall=st().tanks[0];nearWall.x=190;nearWall.y=160;nearWall.a=0;
assert.equal(win.__test.shoot(0),true);assert.ok(st().bullets.at(-1).x<=210,'shell starts in front of wall, not behind it');
click('host');win.RR.nativeMessage(JSON.stringify({type:'connected'}));
assert.equal(win.__test.serializeState().hostPaused,false);
win.RR.appPause();assert.equal(win.__test.serializeState().hostPaused,true,'background host must pause');
assert.ok(packets.some(p=>p.type==='state'&&p.state.hostPaused===true),'paused state immediately sent to guest');
// Existing compact Pinball bumper remains functional in solo.
node('bot-count').value='1';node('team-choice').value='ffa';node('lives-choice').value='5';node('arena-choice').value='2';
click('solo');assert.equal(st().arenaId,2);st().bullets=[{x:197,y:225,vx:200,vy:0,owner:0,life:1,bounces:0,age:0}];
win.__test.step(.03);assert.ok(st().bullets[0].vx<0,'bumper reflects projectile');
// Barrier & turbo timers still work.
const victim=st().tanks[0];victim.powerType='guard';victim.powerTimer=4;victim.shield=0;
assert.equal(win.__test.registerHit(1,0),false);assert.equal(st().lives[0],5);
victim.powerType='turbo';victim.powerTimer=.005;win.__test.step(.02);assert.equal(victim.powerType,null);
// v0.6 QA regression: skill tiers, shield fairness, line of sight and self-ricochet.
node('arena-choice').value='0';node('bot-count').value='1';node('team-choice').value='ffa';node('bot-skill').value='casual';
click('solo');assert.equal(st().config.botSkill,'casual');
let movement=win.__test.botInput(1,1/60);assert.ok(Math.hypot(movement.moveX,movement.moveY)<=.62,'relaxed bot has gentler movement');
assert.equal(win.__test.hasLineOfSight(130,170,830,170),false,'central Foundry wall blocks direct bot shots');
st().tanks[0].shield=1.8;assert.equal(win.__test.shoot(0),true);assert.equal(st().tanks[0].shield,0,'firing cancels respawn protection');
click('solo');st().tanks[0].shield=0;
const oldLives=st().lives[0];st().bullets=[{x:st().tanks[0].x+8,y:st().tanks[0].y,vx:0,vy:0,owner:0,life:1,bounces:1,age:.6}];
win.__test.step(.016);assert.equal(st().lives[0],oldLives-1,'own rebounded shell can cause a self KO');
assert.equal(st().kos[0],0,'self KO cannot increase own kill count');
// Fixed-time physics: near-equal movement across nominal 60 and 30 FPS.
function distanceAt(fps,frames){click('solo');const down=handlers['joystick:pointerdown'][0],move=handlers['joystick:pointermove'][0],up=handlers['joystick:pointerup'][0];down({pointerId:51,clientX:74,clientY:74,preventDefault(){}});move({pointerId:51,clientX:134,clientY:74,preventDefault(){}});const x0=st().tanks[0].x;runFrames(frames,1000/fps);const dx=st().tanks[0].x-x0;up({pointerId:51});return dx}
const dx60=distanceAt(60,24),dx30=distanceAt(30,12);
assert.ok(Math.abs(dx60-dx30)<5,`consistent distance at 60/30fps: ${dx60} vs ${dx30}`);
// Multiplayer host menu pauses match for both players and releases thumb controls.
click('host');win.RR.nativeMessage(JSON.stringify({type:'connected'}));
const md=handlers['joystick:pointerdown'][0],mm=handlers['joystick:pointermove'][0];md({pointerId:71,clientX:74,clientY:74,preventDefault(){}});mm({pointerId:71,clientX:125,clientY:74,preventDefault(){}});
assert.ok(win.__test.makeControl(true).moveX>.8);
handlers['menu-button:click'][0]();assert.equal(win.__test.makeControl(true).moveX,0);
assert.equal(win.__test.serializeState().hostPaused,true,'host pause is synchronized');
console.log('PASS v0.6.2: originals + visual options, bot skill, safe wall aiming, shield fairness, reflected self-hits, fixed-step simulation, synced host pause and input release.');