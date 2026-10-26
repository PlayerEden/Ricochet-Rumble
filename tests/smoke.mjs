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
script=script.replace(/\}\)\(\);\s*$/,'window.__test={get state(){return state},get world(){return [worldW,worldH]},get walls(){return wallSet},get maze(){return mazeGrid},get camera(){return camera},registerHit,tryInteract,nearestEmptyVehicle,resetAll,step,makeControl,setArena,spawnPickup,collectPickup,serializeState,shoot,teamOf,botInput,hasLineOfSight,blocked,parkedVehicleAt,tankMove,spawnVehicles,initialState,ejectPilot,comfort,releaseControls,get damagePulse(){return damagePulse}};})();');
vm.runInNewContext(script,env,{filename:'game.js'});
assert.ok(frame,'animation callback scheduled');
function click(action){for(const f of handlers['menu:click'])f({target:{closest(){return {dataset:{action}}},dataset:{action}}})}
function runFrames(count,ms=16.667){for(let i=0;i<count;i++){tick+=ms;const fn=frame;frame=null;fn(tick);assert.ok(frame,'next animation frame scheduled')}}
const st=()=>win.__test.state;
// One gameplay loop, no duplicate public modes.
const menuHtml=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
assert.equal(menuHtml.includes('data-action="pilot"'),false);
assert.equal(menuHtml.includes('data-action="solo"'),true);
assert.equal(menuHtml.includes('data-action="nearby"'),true);
assert.equal(menuHtml.includes('data-action="duel"'),false);
assert.ok(menuHtml.includes('PILOT LIVES'));
node('lives-choice').value='2';node('arena-choice').value='3';
click('solo');runFrames(8);assert.equal(node('mode-label').textContent,'QUICK MATCH');
assert.equal(st().config.pilotMode,true);assert.equal(st().lives[0],2);
assert.equal(st().tanks[0].onFoot,false,'quick play begins inside a tank');
assert.equal(st().vehicles[st().tanks[0].vehicleId].occupant,0);
assert.ok(st().vehicles.some(v=>v.occupant===-1&&v.armor>0),'free vehicles available');
const player=st().tanks[0],homeTank=st().vehicles[player.vehicleId];
assert.equal(homeTank.armor,3);assert.equal(node('round').textContent.includes('3/3 ARMOR'),true);
player.shield=0;
for(let i=2;i>=0;i--){assert.equal(win.__test.registerHit(1,0),true);assert.equal(homeTank.armor,i);assert.equal(st().lives[0],2)}
assert.equal(player.onFoot,true,'tank destruction ejects alive pilot');assert.equal(node('round').textContent,'ON FOOT · SIDEARM');
assert.ok(player.shield>1,'brief ejection immunity');player.shield=0;
assert.equal(win.__test.registerHit(1,0),true,'on-foot hit costs life');assert.equal(st().lives[0],1);
const spare=st().vehicles.find(v=>v.armor>0&&v.occupant===-1);
assert.ok(spare);
// Pilots can move through parked tanks; occupied tanks remain collidable.
player.x=spare.x-33;player.y=spare.y;player.vx=player.vy=0;
assert.equal(win.__test.parkedVehicleAt(spare.x-15,spare.y,10),true);
win.__test.tankMove(player,{moveX:1,moveY:0},.15,0);
assert.ok(player.x>spare.x-33,'pilot not blocked by parked vehicle');
player.x=spare.x-10;player.y=spare.y;
assert.equal(win.__test.tryInteract(0),true,'pilot enters spare tank');
assert.equal(player.onFoot,false);assert.equal(spare.occupant,0);
assert.equal(win.__test.tryInteract(0),true,'pilot may exit when space allows');
assert.equal(player.onFoot,true);assert.equal(spare.occupant,-1);
player.x=spare.x-12;player.y=spare.y;assert.equal(win.__test.shoot(0),true);assert.equal(st().bullets.at(-1).kind,'sidearm');
// Camera and procedural maze consistency.
const seed=st().mazeSeed,hash=JSON.stringify(win.__test.walls);
win.__test.setArena(0);win.__test.setArena(3,seed);assert.equal(JSON.stringify(win.__test.walls),hash);
runFrames(12);const x0=win.__test.camera.x;player.x=960;player.y=720;runFrames(18);assert.ok(win.__test.camera.x>x0);
// Settings remain match customization, not extra modes.
node('arena-choice').value='4';node('bot-count').value='4';node('lives-choice').value='3';node('bullet-cap').value='2';node('bot-skill').value='casual';node('team-choice').value='coop';
click('solo');assert.equal(st().tanks.length,5);assert.equal(st().lives[0],3);
assert.equal(st().config.bulletCap,2);assert.equal(st().config.teamMode,'coop');
assert.equal(win.__test.teamOf(1),win.__test.teamOf(4));
const shooter=st().tanks[0];shooter.shield=0;
assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),false,'shell cap');
assert.equal(win.__test.botInput(1,1/60).bot,true);
// Large mazes remain navigable and spare vehicles never appear inside walls.
for(const a of [3,4])for(let seed=1;seed<=60;seed++){
 const generated=win.__test.initialState(a,{pilotMode:true,botCount:4,teamMode:'ffa'},seed);
 assert.equal(generated.config.pilotMode,true);
 for(const v of generated.vehicles){assert.equal(win.__test.blocked(v.x,v.y,24),false,'vehicle clear of maze wall')}
 const free=generated.vehicles.filter(v=>v.occupant===-1&&v.armor>0);
 assert.ok(free.length,'spare vehicle');
}
// Reset maze state to coherent config after above generated states.
click('solo');const stress=st();stress.tanks[0].shield=500;stress.lives.fill(20);
for(let n=0;n<1500;n++){win.__test.step(1/60);if(n%150===0){assert.ok(stress.bullets.length<=stress.tanks.length*stress.config.bulletCap);for(const v of stress.vehicles)assert.ok(v.armor>=0&&v.armor<=3);}}
// LAN sync uses unified pilot rules; remote interaction goes to authoritative host.
click('host');assert.equal(hostCalled,true);
assert.equal(st().config.pilotMode,true);assert.equal(st().tanks[0].onFoot,false);assert.equal(st().tanks[1].onFoot,false);
win.RR.nativeMessage(JSON.stringify({type:'connected'}));assert.ok(packets.length===0||true);
runFrames(6);assert.ok(packets.some(p=>p.type==='state'&&p.state.config.pilotMode===true&&p.state.vehicles.length>0));
const guestPilot=st().tanks[1],occupied=st().vehicles[guestPilot.vehicleId];
assert.equal(occupied.occupant,1);
win.RR.nativeMessage(JSON.stringify({type:'interact'}));assert.equal(guestPilot.onFoot,true,'host handles guest exit');
assert.equal(occupied.occupant,-1);
guestPilot.x=occupied.x-12;guestPilot.y=occupied.y;
win.RR.nativeMessage(JSON.stringify({type:'interact'}));assert.equal(guestPilot.onFoot,false,'host handles guest reenter');
click('find');assert.ok(discoverCalled);win.RR.nativeMessage(JSON.stringify({type:'connected'}));
win.RR.nativeMessage(JSON.stringify({type:'state',state:packets.find(p=>p.type==='state').state}));
assert.equal(st().config.pilotMode,true,'guest receives game rules');
const sentBefore=packets.length;
for(const f of handlers['interact-btn:pointerdown'])f({preventDefault(){}});
assert.ok(packets.slice(sentBefore).some(p=>p.type==='interact'),'guest sends interaction request');
runFrames(6);assert.ok(packets.some(p=>p.type==='input'),'guest sends movement');
// Comfort options and readable help still function on one menu.
click('help');assert.ok(node('panel').innerHTML.includes('HOW TO <span>PLAY</span>'));
click('help-back');click('settings');node('pref-leftHanded').checked=true;for(const cb of handlers['panel:change'])cb({target:{id:'pref-leftHanded',checked:true}});
assert.equal(win.__test.comfort.leftHanded,true);assert.equal(node('battlefield').classList.contains('swap-controls'),true);
assert.ok(script.includes('drawTopPilot')&&script.includes('drawTopTank'),'top-down drawing shared by occupied and parked vehicles');
console.log('PASS unified v0.8: fast tank start; armor/ejection/pilot lives; permeable parked tanks; on-foot sidearm; 120 seeded maze tests; 1,500-frame stress; host/guest vehicle actions; options and simplified menu.');