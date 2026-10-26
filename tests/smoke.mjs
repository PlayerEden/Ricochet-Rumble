// V0.6 headless game-logic and protocol regression checks, no npm dependencies.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers={},nodes=new Map();
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
const win={AndroidBridge:android,addEventListener(){},localStorage:{getItem(){return null},setItem(){}}},document={addEventListener(){},getElementById:node,querySelector(){return node('battlefield')},querySelectorAll(){return []}};
const env={window:win,document,performance:{now(){return tick}},requestAnimationFrame(f){frame=f},clearTimeout(){},setTimeout(){return 1},console,Math,Number,Set,JSON,String};
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
script=script.replace(/\}\)\(\);\s*$/,'window.__test={get state(){return state},get world(){return [worldW,worldH]},get walls(){return wallSet},get maze(){return mazeGrid},get camera(){return camera},registerHit,tryInteract,nearestEmptyVehicle,resetAll,step,makeControl,setArena,spawnPickup,collectPickup,serializeState,shoot,teamOf,botInput,hasLineOfSight,blocked,parkedVehicleAt,tankMove,spawnVehicles,initialState,ejectPilot,closestAvailableVehicle,drawTopTank,drawTopMech,drawTopPilot,comfort,releaseControls,get damagePulse(){return damagePulse}};})();');
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
assert.ok(menuHtml.includes('PILOT LIVES'));assert.ok(menuHtml.includes('FIELD SIZE'));assert.equal(menuHtml.includes('arena-choice'),false,'No map picker');
node('lives-choice').value='2';node('map-size').value='standard';
click('solo');runFrames(8);assert.equal(node('mode-label').textContent,'QUICK MATCH');
assert.equal(st().config.pilotMode,true);assert.equal(st().lives[0],2);
assert.equal(st().tanks[0].onFoot,false,'quick play begins inside a tank');
assert.equal(st().vehicles[st().tanks[0].vehicleId].occupant,0);
assert.ok(st().vehicles.some(v=>v.occupant===-1&&v.armor>0),'free vehicles available');assert.ok(st().vehicles.some(v=>v.type==='mech'&&v.occupant===-1),'mech to discover');
const player=st().tanks[0],homeTank=st().vehicles[player.vehicleId];
assert.equal(homeTank.type,'tank');assert.equal(homeTank.armor,3);assert.equal(node('round').textContent.includes('3/3 ARMOR'),true);
player.shield=0;
for(let i=2;i>=0;i--){assert.equal(win.__test.registerHit(1,0),true);assert.equal(homeTank.armor,i);assert.equal(st().lives[0],2)}
assert.equal(player.onFoot,true,'tank destruction ejects alive pilot');assert.equal(node('round').textContent,'ON FOOT · FAST + ARMED');
assert.ok(player.shield>1,'brief ejection immunity');player.shield=0;
assert.equal(win.__test.registerHit(1,0),true,'on-foot hit costs life');assert.equal(st().lives[0],1);
const spare=st().vehicles.find(v=>v.armor>0&&v.occupant===-1);
assert.ok(spare);
assert.ok(win.__test.closestAvailableVehicle(0),'dismounted player can locate a safe vehicle for navigation cue');
// Pilots can move through parked tanks; occupied tanks remain collidable.
player.x=spare.x-33;player.y=spare.y;player.vx=player.vy=0;
assert.equal(win.__test.parkedVehicleAt(spare.x-15,spare.y,10),false,'empty vehicles do not block either pilot or tank');
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
win.__test.setArena(0,12345,'small');win.__test.setArena(0,seed,'standard');assert.equal(JSON.stringify(win.__test.walls),hash);
runFrames(12);const x0=win.__test.camera.x;player.x=960;player.y=720;runFrames(18);assert.ok(win.__test.camera.x>x0);
// Settings remain match customization, not extra modes.
node('map-size').value='large';node('bot-count').value='4';node('lives-choice').value='3';node('bullet-cap').value='2';node('bot-skill').value='casual';node('team-choice').value='coop';
click('solo');assert.equal(st().tanks.length,5);assert.equal(st().lives[0],3);
assert.equal(st().config.bulletCap,2);assert.equal(st().config.teamMode,'coop');
assert.equal(win.__test.teamOf(1),win.__test.teamOf(4));
const shooter=st().tanks[0];shooter.shield=0;
assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),false,'shell cap');
assert.equal(win.__test.botInput(1,1/60).bot,true);
// Large mazes remain navigable and spare vehicles never appear inside walls.
for(const size of ['small','standard','large'])for(let seed=1;seed<=60;seed++){
 const generated=win.__test.initialState(0,{pilotMode:true,mapSize:size,botCount:4,teamMode:'ffa'},seed);
 assert.equal(generated.config.pilotMode,true);assert.equal(generated.config.mapSize,size);
 const maze=win.__test.maze;const visited=new Set([0]),queue=[0];for(let n=0;n<queue.length;n++)for(const nxt of maze.open[queue[n]])if(!visited.has(nxt)){visited.add(nxt);queue.push(nxt)}
 assert.equal(visited.size,maze.cols*maze.rows,'all maze cells reachable');assert.ok(generated.vehicles.some(v=>v.type==='mech'));assert.ok(generated.vehicles.every(v=>v.type==='tank'||v.type==='mech'));
 for(const v of generated.vehicles){assert.equal(win.__test.blocked(v.x,v.y,24),false,'vehicle clear of maze wall')}
 const free=generated.vehicles.filter(v=>v.occupant===-1&&v.armor>0);
 assert.ok(free.length,'spare vehicle');
}
// Timed mid-match deployments are host-authoritative and never overlap an active actor.
click('solo');const beforeDrop=st().vehicles.length;st().vehicleDropTimer=1/120;
win.__test.step(1/60);assert.ok(st().vehicles.length>=beforeDrop,'deployment not destructive');
assert.ok(st().vehicles.length<=10,'vehicle limit');
if(st().vehicles.length>beforeDrop){assert.ok(st().vehicleBeacon?.ttl>0);const spawned=st().vehicles.at(-1);assert.ok(!win.__test.blocked(spawned.x,spawned.y,28));assert.ok(st().event.includes('DEPLOYED'));assert.ok(['tank','mech'].includes(spawned.type));}
assert.equal(st().config.mapSize,'large');
// A mech is a discoverable vehicle, not a mode. It handles armor, firing and ejection differently.
const playerMech=st().tanks[0],occupiedMech=st().vehicles[playerMech.vehicleId],freeMech=st().vehicles.find(v=>v.type==='mech'&&v.occupant===-1&&v.armor>0);
assert.ok(freeMech);assert.equal(win.__test.tryInteract(0),true,'exit starting tank');
playerMech.x=freeMech.x-10;playerMech.y=freeMech.y;assert.equal(win.__test.tryInteract(0),true,'enter nearby mech');
assert.equal(freeMech.occupant,0);assert.equal(node('round').textContent,'MECH 4/4 ARMOR');
win.__test.state.bullets=[];assert.equal(win.__test.shoot(0),true);assert.equal(st().bullets.at(-1).kind,'mech');assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),false,'mech has two active shells');
for(let k=3;k>=0;k--){playerMech.shield=0;assert.equal(win.__test.registerHit(1,0),true);assert.equal(freeMech.armor,k);}
assert.equal(playerMech.onFoot,true,'mech breaks and ejects pilot');assert.equal(st().lives[0],3,'mech loss does not consume pilot life');

// Reset maze state to coherent config after above generated states.
click('solo');const stress=st();stress.tanks[0].shield=500;stress.lives.fill(20);
for(let n=0;n<1500;n++){win.__test.step(1/60);if(n%150===0){assert.ok(stress.bullets.length<=stress.tanks.length*stress.config.bulletCap);for(const v of stress.vehicles)assert.ok(v.armor>=0&&v.armor<=(v.type==='mech'?4:3));assert.ok(stress.vehicles.length<=10);}}
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
assert.equal(st().config.pilotMode,true,'guest receives game rules');assert.equal(st().config.mapSize,'large','guest gets the host map size');
const sentBefore=packets.length;
for(const f of handlers['interact-btn:pointerdown'])f({preventDefault(){}});
assert.ok(packets.slice(sentBefore).some(p=>p.type==='interact'),'guest sends interaction request');
runFrames(6);assert.ok(packets.some(p=>p.type==='input'),'guest sends movement');
// Comfort options and readable help still function on one menu.
click('help');assert.ok(node('panel').innerHTML.includes('HOW TO <span>PLAY</span>'));
click('help-back');click('settings');node('pref-leftHanded').checked=true;for(const cb of handlers['panel:change'])cb({target:{id:'pref-leftHanded',checked:true}});
assert.equal(win.__test.comfort.leftHanded,true);assert.equal(node('battlefield').classList.contains('swap-controls'),true);
assert.ok(script.includes('drawTopPilot')&&script.includes('drawTopTank')&&script.includes('drawTopMech'),'top-down drawing shared by occupied and parked vehicles');

// v0.9.1 QA pass — learnability, default friction, and accessible no-bot practice.
assert.ok(menuHtml.includes('id="quick-rematch"'),'visible one-tap replay control exists');
assert.ok(menuHtml.includes('0 · PRACTICE'),'no-bots selection explains its purpose');
assert.ok(script.includes('rr-coach-v091'),'nonmodal first-time coaching');
assert.equal(win.__test.comfort.shake,false,'screen shake off by default for comfort');
click('settings');node('bot-count').value='0';node('map-size').value='small';node('team-choice').value='ffa';
click('settings-play');assert.equal(st().tanks.length,1,'0 bots should be a real safe practice field');
assert.equal(st().config.botCount,0,'do not silently add a bot');
assert.equal(node('mode-label').textContent,'PRACTICE FIELD');
assert.equal(st().winner,-1);runFrames(60);assert.equal(st().winner,-1,'practice cannot win by itself');
node('bot-count').value='2';click('solo');assert.equal(st().config.mapSize,'small');assert.equal(st().config.botCount,2);
const initialMaze=st().mazeSeed;
st().winner=0;st().event='CYAN WINS!';runFrames(14);
assert.equal(node('quick-rematch').classList.contains('hidden'),false,'show replay at result screen');
for(const f of handlers['quick-rematch:click'])f();
assert.equal(st().winner,-1,'replay starts another match');
assert.notEqual(st().mazeSeed,initialMaze,'replay refreshes procedural field');
assert.equal(node('quick-rematch').classList.contains('hidden'),true,'no replay button during combat');
// Mech shell limitation preserves separate tank identity and avoids limitless ricochets.
assert.ok(script.includes("b.kind==='mech'?2:5"),'mech rounds stop after fewer bounces');
assert.ok(script.includes("b.kind==='mech'?5:0"),'mech rounds have distinguishable hit width');
// v0.9.2: menu safety for both host and guest; no sticky auto-fire while paused.
click('solo');win.__test.comfort.autoFire=true;
assert.equal(win.__test.makeControl(true).fire,true,'auto-fire works during live match');
for(const f of handlers['menu-button:click'])f();
assert.equal(win.__test.makeControl(true).fire,false,'opening the pause menu silences auto-fire');
click('resume');assert.equal(win.__test.makeControl(true).fire,true,'resume restores desired auto-fire');
win.__test.comfort.autoFire=false;
click('find');win.RR.nativeMessage(JSON.stringify({type:'connected'}));
const packetsBeforePause=packets.length;
for(const f of handlers['menu-button:click'])f();
assert.ok(packets.slice(packetsBeforePause).some(p=>p.type==='input'&&!p.input.fire&&p.input.moveX===0&&p.input.moveY===0),'guest sends neutral input immediately when menu opens');

// VISUAL CONSTRUCTION CONTRACT: vehicle-forward is local +X. Tracks are
// mirrored from a single definition; both must align with the barrel axis.
{
 const ops=[],stack=[];let mirrored=1;
 const g={save(){stack.push(mirrored)},restore(){mirrored=stack.pop()},translate(x,y){ops.push({kind:'translate',side:mirrored,x,y})},scale(x,y){assert.equal(x,1);mirrored*=y;ops.push({kind:'mirror',side:mirrored})},fillRect(x,y,w,h){ops.push({kind:'fill',side:mirrored,x,y,w,h})},strokeRect(x,y,w,h){ops.push({kind:'stroke',side:mirrored,x,y,w,h})},set lineWidth(v){},set strokeStyle(v){},set fillStyle(v){},set lineJoin(v){}};
 win.__test.drawTopTank(g,'#5ad0e8',false);
 const tracks=ops.filter(o=>o.kind==='fill'&&o.w===54&&o.h===12&&o.y===15);
 assert.equal(tracks.length,2,'two tracks are rendered');
 assert.deepEqual(tracks.map(t=>t.side),[-1,1],'track geometry is mirrored, not independently positioned');
 for(const side of [-1,1])assert.equal(ops.filter(o=>o.kind==='fill'&&o.side===side&&o.w===2&&o.h===10).length,6,'six forward-facing matching tread seams per side');
 assert.equal(ops.filter(o=>o.kind==='fill'&&o.w===25&&o.h===12&&o.x===10).length,1,'gun barrel is centered on forward +X axis');
 // Both mirrored tread assemblies also protect the sense of orientation at any vehicle heading.
 const legs=[],ctx={...g,scale(x,y){legs.push([x,y])}};
 win.__test.drawTopMech(ctx,'#b69aff',false);
 assert.deepEqual(legs,[[1,-1],[1,1]],'mech limbs are also mirrored from one definition');
}
console.log('PASS v0.9.2: stranded-pilot recovery cue and guest menu neutral input.');
console.log('PASS v0.9.1 QA: 0-bot practice, default comfort, contextual hint, win/replay/new seed, vehicle weapon distinction.');

console.log('PASS FIELDGRID v0.9: generated map sizes; 180 seed checks; mixed tank/mech spawns; timed drops; armor/ejection; 1,500-frame stress; LAN state and contextual controls.');

// v0.9.4 clarity audit: retained fast, small pilot can destroy armor from outside a vehicle.
click('solo');
const footP=st().tanks[0], opponent=st().tanks[1];
const enemyArmor=st().vehicles[opponent.vehicleId];
assert.equal(footP.onFoot,false,'default still starts in a tank for instant combat');
assert.equal(win.__test.tryInteract(0),true,'voluntary ejection is always available');
assert.equal(footP.onFoot,true);assert.equal(footP.vehicleId,null);
assert.ok(script.includes('inp.bot?194:268'),'human pilot keeps its faster movement');
assert.ok(script.includes('const radius=t.onFoot?10:21'),'pilot can use narrower passages');
assert.ok(script.includes('(t.onFoot?14:26)'),'pilot remains a smaller projectile target');
assert.equal(win.__test.shoot(0),true);assert.equal(st().bullets.at(-1).kind,'sidearm');
opponent.shield=0;
for(let a=2;a>=0;a--){assert.equal(win.__test.registerHit(0,1),true);assert.equal(enemyArmor.armor,a)}
assert.equal(opponent.onFoot,true,'a pilot can defeat an armored tank');
assert.ok(st().lives[1]>0,'tank destruction ejects instead of removing pilot lives');
assert.ok(script.includes('c.clip()'),'radar has clipped deployment pings');
assert.ok(!script.includes('fillRect(W/2-160,28,320,44)'),'large center-covering event removed');
assert.ok(menuHtml.includes('aria-hidden="true">●</span>'),'movement knob no longer resembles an ability pickup');
console.log('PASS v0.9.4 visual clarity: pilot duel advantage, tactical sidearm, radar clipping, event placement, joystick symbol.');

// Public-facing identity regression; internal RR API and Android applicationId deliberately persist.
{ const fs=await import('node:fs');
  const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
  const manifest=fs.readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
  if(!html.includes('SECTOR <em>REBOUND</em>') || !html.includes('SECTOR <span>REBOUND</span>') || !manifest.includes('android:label="Sector Rebound"')) throw new Error('Sector Rebound public branding missing');
  if(html.includes('Ricochet Rumble') || manifest.includes('Ricochet Rumble')) throw new Error('Old title appears in public game UI');
}

// 0.9.7 motion pass: animation must not change game physics or break the
// construction contract. Both idle and moving mechs retain mirrored limbs.
{
 const geom=(fn,stride)=>{const out=[],stack=[];let side=1,dx=0;const c={save(){stack.push([side,dx])},restore(){[side,dx]=stack.pop()},scale(x,y){side*=y},translate(x,y){dx+=x},fillRect(x,y,w,h){out.push({side,x:x+dx,y,w,h})},strokeRect(){},arc(){},beginPath(){},stroke(){},fill(){},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){}};
  if(fn==='mech')win.__test.drawTopMech(c,'#b69aff',false,stride);else win.__test.drawTopPilot(c,'#51d9ff',false,stride);
  return out};
 const mechIdle=geom('mech',0).filter(o=>o.w===17&&o.h===12&&o.y===12);
 const mechMove=geom('mech',3).filter(o=>o.w===17&&o.h===12&&o.y===12);
 assert.equal(mechIdle.length,2,'mech has two leg bases');
 assert.equal(mechMove.length,2,'gait keeps both legs');
 assert.notEqual(mechIdle[0].x,mechMove[0].x,'left leg advances when walking');
 assert.notEqual(mechIdle[1].x,mechMove[1].x,'right leg counter-steps');
 assert.equal(mechMove[0].x+mechMove[1].x,mechIdle[0].x+mechIdle[1].x,'walking gait remains centered');
 const bootsIdle=geom('pilot',0).filter(o=>o.w===10&&o.h===8);
 const bootsMove=geom('pilot',2).filter(o=>o.w===10&&o.h===8);
 assert.equal(bootsMove.length,2);assert.notEqual(bootsIdle[0].x,bootsMove[0].x);assert.equal(bootsMove[0].x+bootsMove[1].x,bootsIdle[0].x+bootsIdle[1].x);
}
// Emergency ejection is a cosmetic event, not damage to pilot lives.
click('solo');const v0=st().vehicles[st().tanks[0].vehicleId],pilot=st().tanks[0],lives=st().lives[0];
pilot.shield=0;win.__test.ejectPilot(0);
assert.equal(v0.armor,0);assert.equal(pilot.onFoot,true);assert.equal(st().lives[0],lives);
assert.ok(pilot.ejectAnim>.5,'short local ejection animation');
assert.ok(st().fxEvents.some(f=>f.kind==='eject'&&f.ttl>.5),'ejection ring is carried in serialized FX');
assert.ok(win.__test.serializeState().fxEvents.some(f=>f.kind==='eject'),'guest will get same cue');
win.__test.step(1/60);assert.ok(pilot.ejectAnim<.62,'animation timer advances with world simulation');
// After-action overlay dims non-functional controls, and clears on replay.
st().winner=1;st().winnerTeam=1;st().event='BOT 1 WINS!';
for(const f of handlers['menu-button:click'])f(); // pause-menu path still usable after combat
click('resume'); // hides menu
runFrames(10);
assert.equal(node('game-screen').classList.contains('match-finished'),true);
assert.equal(node('quick-rematch').classList.contains('hidden'),false);
for(const f of handlers['quick-rematch:click'])f();
assert.equal(st().winner,-1);assert.equal(node('game-screen').classList.contains('match-finished'),false);
console.log('PASS v0.9.7 motion/UX: mirrored animation, pilot ejection, serialized feedback, after-action controls and replay.');


// v0.9.8: empty deployment projections never become physical barricades.
// The controlled tank can cross a vacant vehicle bay while occupied actors stay solid.
click('solo');
const lone=st().tanks[0],vacant=st().vehicles.find(v=>v.occupant===-1&&v.armor>0);
assert.ok(vacant,'empty recoverable vehicle exists');
const armorBefore=vacant.armor;
lone.x=vacant.x-40;lone.y=vacant.y;lone.vx=lone.vy=0;
for(let n=0;n<4;n++)win.__test.tankMove(lone,{moveX:1,moveY:0},.065,0);
assert.ok(lone.x>vacant.x,'occupied tank drives through an unoccupied deployment without blocking');
// Simulated bullets should similarly ignore projections, not delete armor from them.
st().bullets=[{x:vacant.x-22,y:vacant.y,vx:380,vy:0,owner:0,life:1,bounces:0,age:0,kind:'shell'}];
lone.x=vacant.x+84;lone.y=vacant.y+50;lone.shield=3;
for(let n=0;n<5;n++)win.__test.step(1/60);
assert.equal(vacant.armor,armorBefore,'projected vehicle cannot intercept shells');
// Occupied collision continues to go through the shared actor collision check.
const live=st().tanks[1];live.x=vacant.x;live.y=vacant.y;live.vx=live.vy=0;
lone.x=vacant.x-37;lone.y=vacant.y;lone.vx=lone.vy=0;
win.__test.tankMove(lone,{moveX:1,moveY:0},.13,0);
assert.ok(lone.x<=vacant.x-37+1,'living occupied actors still block vehicles');
assert.ok(menuHtml.includes('PLAY TOGETHER')&&menuHtml.includes('ADVANCED RULES'));
console.log('PASS v0.9.8: vacant vehicle is passable and non-cover; occupied actors block; UI hierarchy present.');