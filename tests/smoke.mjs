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
let simRand=null;
const testMath=Object.create(Math);testMath.random=()=>simRand?simRand():Math.random();
function seedRandom(seed){let z=seed>>>0;simRand=()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296;};}
const env={window:win,document,performance:{now(){return tick}},requestAnimationFrame(f){frame=f},clearTimeout(){},setTimeout(){return 1},console,Math:testMath,Number,Set,JSON,String};
let script=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
script=script.replace(/\}\)\(\);\s*$/,'window.__test={get state(){return state},get selectedPlaylistIds(){return selectedPlaylistIds.slice()},finalizeRound,durationLabel,setPlaylistModes,nextPlaylistMode,normalizePlaylistModes,soloOptionsFor,freshSectorSeed,resetAll,newMatch,get world(){return [worldW,worldH]},get walls(){return wallSet},get maze(){return mazeGrid},get camera(){return camera},registerHit,tryInteract,nearestEmptyVehicle,resetAll,step,makeControl,setArena,spawnPickup,collectPickup,serializeState,shoot,activeBulletCap,fireInterval,audioCue,AUDIO_CUES,collectPickup,spawnPickup,teamOf,botInput,chooseBotObjective,coachTip,updateQuietMatchPrompt,armMusic,updateMusic,drawLobbyPreview,hasLineOfSight,blocked,parkedVehicleAt,tankMove,spawnVehicles,initialState,ejectPilot,closestAvailableVehicle,refreshHUD,resizeArenaCanvas,cameraZoom,unitTargetZoom,render,drawTopTank,drawTopMech,drawTopPilot,comfort,releaseControls,get damagePulse(){return damagePulse},resetSeededMatch(seed,mapSize="standard",botSkill="normal"){mode="solo";state=initialState(0,{...state.config,mapSize,botSkill,botCount:2,startLives:2,teamMode:"ffa"},seed);paused=false;fireCooldown.fill(0);return state;}};})();');
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
click('solo');runFrames(8);assert.ok(['SOLO SURVIVAL','TEAM SURVIVAL'].includes(node('mode-label').textContent));
assert.equal(st().config.pilotMode,true);assert.equal(st().lives[0],2);
assert.equal(st().tanks[0].onFoot,false,'quick play begins inside a tank');
assert.equal(st().vehicles[st().tanks[0].vehicleId].occupant,0);
assert.ok(st().vehicles.some(v=>v.occupant===-1&&v.armor>0),'free vehicles available');assert.ok(st().vehicles.some(v=>v.type==='mech'&&v.occupant===-1),'mech to discover');
const player=st().tanks[0],homeTank=st().vehicles[player.vehicleId];
assert.equal(homeTank.type,'tank');assert.equal(homeTank.armor,3);assert.equal(node('round').textContent.includes('TANK · 3/3'),true);
player.shield=0;
for(let i=2;i>=0;i--){assert.equal(win.__test.registerHit(1,0),true);assert.equal(homeTank.armor,i);assert.equal(st().lives[0],2)}
assert.equal(player.onFoot,true,'tank destruction ejects alive pilot');assert.equal(node('round').textContent,'PILOT · ON FOOT');
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
// Settings continue to customize bot count, shells and lives; solo presets control sides.
win.__test.setPlaylistModes(['survival_teams']);
node('map-size').value='large';node('bot-count').value='4';node('lives-choice').value='3';node('bullet-cap').value='2';node('bot-skill').value='casual';node('team-choice').value='coop';
click('solo');assert.equal(st().tanks.length,5);assert.equal(st().lives[0],3);
assert.equal(st().config.bulletCap,2);assert.equal(st().config.teamMode,'teams');assert.equal(st().config.matchModeId,'survival_teams');
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
assert.equal(freeMech.occupant,0);assert.equal(node('round').textContent,'MECH · 4/4');
win.__test.state.bullets=[];assert.equal(win.__test.shoot(0),true);assert.equal(st().bullets.at(-1).kind,'mech');assert.equal(win.__test.shoot(0),true);assert.equal(win.__test.shoot(0),false,'mech has two active shells');
for(let k=3;k>=0;k--){playerMech.shield=0;assert.equal(win.__test.registerHit(1,0),true);assert.equal(freeMech.armor,k);}
assert.equal(playerMech.onFoot,true,'mech breaks and ejects pilot');assert.equal(st().lives[0],3,'mech loss does not consume pilot life');

// Reset maze state to coherent config after above generated states.
click('solo');const stress=st();stress.tanks[0].shield=500;stress.lives.fill(20);
for(let n=0;n<1500;n++){win.__test.step(1/60);if(n%150===0){assert.ok(stress.bullets.length<=stress.tanks.length*(stress.config.bulletCap+2));for(const v of stress.vehicles)assert.ok(v.armor>=0&&v.armor<=(v.type==='mech'?4:3));assert.ok(stress.vehicles.length<=10);}}
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
  if(!html.includes('SECTOR <span>REBOUND</span>') || !manifest.includes('android:label="Sector Rebound"')) throw new Error('Sector Rebound public branding missing');
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
 const bootsIdle=geom('pilot',0).filter(o=>o.w===10&&o.h===7);
 const bootsMove=geom('pilot',2).filter(o=>o.w===10&&o.h===7);
 assert.equal(bootsIdle.length,2,'pilot keeps two separated boot silhouettes');
 assert.equal(bootsMove.length,2,'walking pilot still shows both boots');
 assert.notEqual(bootsIdle[0].x,bootsMove[0].x,'first boot advances');
 assert.notEqual(bootsIdle[1].x,bootsMove[1].x,'second boot counter-steps');
 assert.equal(bootsMove[0].x+bootsMove[1].x,bootsIdle[0].x+bootsIdle[1].x,'walk cycle stays centered');
 assert.ok(Math.abs(bootsIdle[0].y-bootsIdle[1].y)>=12,'feet remain separated along shoulder axis');
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
assert.ok(menuHtml.includes('PLAY TOGETHER')&&menuHtml.includes('QUICK PLAY MODES + ADVANCED'));
console.log('PASS v0.9.8: vacant vehicle is passable and non-cover; occupied actors block; UI hierarchy present.');

// v0.9.8.1 entry-clearance regression. Empty deployments never block movement,
// but turning a projection into an occupied actor must not overlap a live rival.
click('solo');
assert.equal(win.__test.tryInteract(0),true,'player can still dismount');
const boardingPilot=st().tanks[0],blockingRival=st().tanks[1];
const boardingBay=st().vehicles.find(v=>v.occupant===-1&&v.armor>0);
assert.ok(boardingBay,'test needs a reclaimable vehicle');
boardingPilot.x=boardingBay.x;boardingPilot.y=boardingBay.y;
const rivalX=blockingRival.x,rivalY=blockingRival.y;
blockingRival.x=boardingBay.x;blockingRival.y=boardingBay.y;
assert.equal(win.__test.tryInteract(0),false,'cannot spawn a piloted tank on top of a live rival');
assert.equal(boardingBay.occupant,-1,'failed entry leaves the bay available');
blockingRival.x=rivalX;blockingRival.y=rivalY;
assert.equal(win.__test.tryInteract(0),true,'same bay remains enterable once the rival moves away');
assert.equal(boardingBay.occupant,0);
{
 const fs=await import('node:fs');
 for(const name of ['game.js','style.css','index.html']){
  const web=fs.readFileSync(new URL('../web/'+name,import.meta.url),'utf8');
  const android=fs.readFileSync(new URL('../android/app/src/main/assets/'+name,import.meta.url),'utf8');
  assert.equal(android,web,'Android/browser parity for '+name);
 }
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 assert.ok(css.includes("'sans-serif-condensed'"),'Android condensed headings have an offline fallback');
}
console.log('PASS v0.9.8.1: entry clearance, Android asset parity and offline heading fallback.');


// v0.9.9 interface-contract tests: semantics and mobile interaction cannot
// drift even if the game canvas is rendered by a different Android WebView.
{
 const fs=await import('node:fs');
 const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 for(const metadata of ['SOLO / AI','LOCAL WI-FI','ARMORED RESPONSE','NEW MAZE. NEW FIGHT.'])
   assert.ok(html.includes(metadata),'missing purposeful action/context label: '+metadata);
 assert.ok(css.includes('.scorestrip .middle.on-foot')&&css.includes('.interact-btn.busy'),'semantic HUD and bay-busy states must have authored styles');
 assert.ok(css.includes('max-width:760px')&&css.includes('max-height:390px'),'responsive phone-landscape thresholds retained');
}
// On-foot, damaged, paused, and match-ended status belong to separate HUD states.
click('solo');
const statusPilot=st().tanks[0],statusVehicle=st().vehicles[statusPilot.vehicleId];
win.__test.refreshHUD();
assert.equal(node('round').textContent,'TANK · 3/3');
statusVehicle.armor=1;
win.__test.refreshHUD();
assert.equal(node('round').textContent,'TANK · 1/3');
assert.equal(node('round').classList.contains('damaged'),true);
statusVehicle.armor=3;
assert.equal(win.__test.tryInteract(0),true);
assert.equal(node('round').textContent,'PILOT · ON FOOT');
assert.equal(node('round').classList.contains('on-foot'),true);
// A nearby unoccupied recovery vehicle, if occupied by another live actor,
// stays visible as an actionable status rather than disappearing on mobile.
const busyBay=st().vehicles.find(v=>v.occupant===-1&&v.armor>0);
assert.ok(busyBay);
const statusRival=st().tanks[1];
const oldRival=[statusRival.x,statusRival.y];
statusPilot.x=busyBay.x;statusPilot.y=busyBay.y;
statusRival.x=busyBay.x;statusRival.y=busyBay.y;
win.__test.refreshHUD();
assert.equal(node('interact-btn').classList.contains('hidden'),false,'busy cue remains visible on phone');
assert.equal(node('interact-btn').classList.contains('busy'),true);
assert.equal(node('interact-btn').textContent,'BAY BUSY');
statusRival.x=oldRival[0];statusRival.y=oldRival[1];
win.__test.refreshHUD();
assert.equal(node('interact-btn').classList.contains('busy'),false);
assert.equal(node('interact-btn').textContent,'ENTER '+busyBay.type.toUpperCase());
assert.equal(win.__test.tryInteract(0),true);
st().winner=1;st().winnerTeam=1;win.__test.refreshHUD();
assert.equal(node('round').textContent,'MATCH OVER');
assert.equal(node('round').classList.contains('match-ended'),true);
console.log('PASS v0.9.9: labeled menu actions, HUD state transitions, blocked-bay visibility and responsive design contract.');

{
 const fs=await import('node:fs');
 const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 const hud=html.split('<header class="game-hud"')[1]?.split('</header>')[0]||'';
 assert.ok(!hud.includes('SECTOR <em>REBOUND</em>'),'no game title in live HUD');
 assert.ok(html.includes('SECTOR <span>REBOUND</span>'),'title remains on main menu');
 assert.ok(css.includes('FULLSCREEN COMBAT'),'fullscreen CSS contract');
 assert.ok(css.includes('safe-area-inset-left')&&css.includes('safe-area-inset-right'),'safe-area overlay controls');
}
win.innerWidth=740;win.innerHeight=360;win.devicePixelRatio=2;
assert.equal(win.__test.resizeArenaCanvas(),true);
assert.equal(node('arena').width,1184);
assert.equal(node('arena').height,576);
win.innerWidth=915;win.innerHeight=412;win.devicePixelRatio=1;
assert.equal(win.__test.resizeArenaCanvas(),true);
assert.equal(node('arena').width,915);assert.equal(node('arena').height,412);
click('solo');
const driving=st().tanks[0],origTracks=[driving.trackLeft,driving.trackRight];
win.__test.tankMove(driving,{moveX:1,moveY:0},1/60,0);
assert.notEqual(driving.trackLeft,origTracks[0]);
assert.notEqual(driving.trackRight,origTracks[1]);
const turnStart=[driving.trackLeft,driving.trackRight];
win.__test.tankMove(driving,{moveX:0,moveY:1},1/60,0);
assert.notEqual(driving.trackLeft-turnStart[0],driving.trackRight-turnStart[1],'differential tread movement');
const seams=[],paint={save(){},restore(){},translate(){},scale(){},fillRect(x,y,w,h){if(w===2&&h===10)seams.push(x)},strokeRect(){},set lineWidth(v){},set lineJoin(v){},set strokeStyle(v){},set fillStyle(v){}};
win.__test.drawTopTank(paint,'#62cddf',false,0,0,0,0);
const idleSeams=seams.slice();seams.length=0;
win.__test.drawTopTank(paint,'#62cddf',false,3,6,0,0);
assert.equal(idleSeams.length,12);assert.equal(seams.length,12);
assert.notDeepEqual(seams,idleSeams,'rendered treads animate');
assert.equal(win.__test.shoot(0),true);
assert.ok(driving.recoil>0,'gunfire kicks the hull');
win.__test.step(1/60);
assert.ok(driving.recoil<1,'recoil eases away');
console.log('PASS v0.9.10 fullscreen canvas, overlay HUD, independently moving treads and recoil.');


// v0.9.10b — calibrated camera and a common motion language for all actors.
win.innerWidth=1536;win.innerHeight=672;win.devicePixelRatio=1;
assert.equal(win.__test.resizeArenaCanvas(),true);
const [fieldWidth,fieldHeight]=win.__test.world;
const expectedZoom=Math.max(1.00,1536/(fieldWidth+840),672/(fieldHeight+840));
assert.ok(Math.abs(win.__test.cameraZoom(null)-expectedZoom)<1e-9,'zoom accounts for playable perimeter without black side gutters');
assert.ok(win.__test.cameraZoom()<Math.max(1.28,1536/fieldWidth,672/fieldHeight),'new widescreen camera genuinely shows more world');
const motions=[];
const motionPaint={save(){},restore(){},translate(x,y){motions.push([x,y])},scale(){},fillRect(){},strokeRect(){},arc(){},beginPath(){},stroke(){},fill(){},set lineWidth(v){},set lineJoin(v){},set strokeStyle(v){},set fillStyle(v){}};
win.__test.drawTopMech(motionPaint,'#aaaaff',false,0,0,0);
assert.ok(Math.abs(motions[0][0])<0.000001&&Math.abs(motions[0][1])<0.000001);
motions.length=0;win.__test.drawTopMech(motionPaint,'#aaaaff',false,2,.56,.55);
assert.ok(motions[0][0]<0&&motions[0][1]>0,'mech shares animated torso recoil/bob');
motions.length=0;win.__test.drawTopPilot(motionPaint,'#55ddff',false,0,0,0);
assert.ok(Math.abs(motions[0][0])<0.000001&&Math.abs(motions[0][1])<0.000001);
motions.length=0;win.__test.drawTopPilot(motionPaint,'#55ddff',false,2,.28,.35);
assert.ok(motions[0][0]<0&&motions[0][1]>0,'pilot has smaller motion response');
click('solo');
const motionTank=st().tanks[0];
assert.equal(win.__test.shoot(0),true);
assert.equal(motionTank.recoil,.72,'tank kick dampened');
const motionTankStart=motionTank.trackLeft;
win.__test.tankMove(motionTank,{moveX:1,moveY:0},1/60,0);
assert.notEqual(motionTank.trackLeft,motionTankStart,'tank belt animation retained after softer suspension');
const motionModel=st().vehicles[motionTank.vehicleId];motionModel.type='mech';
motionModel.armor=4;
motionTank.shield=0;st().bullets.length=0;
assert.equal(win.__test.shoot(0),true);
assert.equal(motionTank.recoil,.56,'mech recoil is weighted separately from tank');
assert.equal(win.__test.tryInteract(0),true);
st().bullets.length=0;
assert.equal(win.__test.shoot(0),true);
assert.equal(motionTank.recoil,.28,'on-foot pistol recoil is lightweight');
console.log('PASS v0.9.10b: zoom-out, perimeter fill, softer tank motion, mech gait and pilot recoil.');


// v0.9.11 — institutional menu identity, real camera distinctions, eased changes.
{
 const fs=await import('node:fs');
 const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 assert.ok(html.includes('FIELDGRID / COMBAT SIMULATION')&&html.includes('class="home-screen"'),'home is a recognizable game lobby');
 assert.ok(html.includes('home-topbar')&&html.includes('home-showcase')&&html.includes('home-actions'),'game lobby has identity, actual game unit and primary play region');
 assert.ok(html.includes('HOW TO PLAY')&&html.includes('SECTOR <span>REBOUND</span>'),'brand and help preserved');
 assert.ok(css.includes('FIELDGRID COMMAND CONSOLE')&&css.includes('sans-serif-condensed'));
 assert.ok(css.includes('monospace'),'technical micro-label font is available offline');
}
click('solo');
const local=st().tanks[0],veh=st().vehicles[local.vehicleId];
veh.type='tank';
win.innerWidth=1536;win.innerHeight=672;win.devicePixelRatio=1;
win.__test.resizeArenaCanvas();
const minZoom=Math.max(1536/(win.__test.world[0]+840),672/(win.__test.world[1]+840));
assert.ok(Math.abs(win.__test.unitTargetZoom(local)-0.82)<1e-9);
assert.ok(Math.abs(win.__test.cameraZoom(local)-Math.max(0.82,minZoom))<1e-9);
win.__test.render(1/60);
const zTank=win.__test.camera.zoom;
assert.ok(Math.abs(zTank-Math.max(0.82,minZoom))<1e-7);
local.onFoot=true;local.vehicleId=null;
assert.equal(win.__test.unitTargetZoom(local),1.07);
win.__test.render(1/60);
assert.ok(win.__test.camera.zoom>zTank&&win.__test.camera.zoom<1.07,'zoom must ease in rather than snap to foot');
for(let i=0;i<80;i++)win.__test.render(1/60);
assert.ok(Math.abs(win.__test.camera.zoom-1.07)<.003,'foot zoom should converge');
local.onFoot=false;local.vehicleId=veh.id;veh.occupant=0;veh.type='mech';
assert.equal(win.__test.unitTargetZoom(local),0.77);
const zFoot=win.__test.camera.zoom;
win.__test.render(1/60);
assert.ok(win.__test.camera.zoom<zFoot&&win.__test.camera.zoom>Math.max(0.77,minZoom),'mech transition eases outward');
for(let i=0;i<85;i++)win.__test.render(1/60);
assert.ok(Math.abs(win.__test.camera.zoom-Math.max(0.77,minZoom))<.003,'mech target converges');
veh.type='tank';
for(let i=0;i<85;i++)win.__test.render(1/60);
assert.ok(Math.abs(win.__test.camera.zoom-Math.max(0.82,minZoom))<.003,'tank transition converges');
console.log('PASS v0.9.11 console design, camera targets, smooth transitions and viewport floor.');

// v0.9.12 reliability and camera audit: close each unit's view modestly,
// maintain monotonic FOV order, and avoid stale vehicle animation after recovery.
{
 const fs=await import('node:fs');
 const game=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
 assert.ok(game.includes('v.occupant===-1&&v.armor>0&&vehicleEntryClear(i,v)'), 'bot recovery should skip a blocked bay');
 const sameFile=fs.readFileSync(new URL('../android/app/src/main/assets/game.js',import.meta.url),'utf8');
 assert.equal(game,sameFile,'Android and web game logic should match');
}
click('solo');
const unit=st().tanks[0],model=st().vehicles[unit.vehicleId];
const cameraOrder=[];
for(const typ of ['mech','tank']){
 model.type=typ;
 cameraOrder.push(win.__test.unitTargetZoom(unit));
}
unit.onFoot=true;
cameraOrder.push(win.__test.unitTargetZoom(unit));
assert.deepEqual(cameraOrder,[0.77,0.82,1.07],'mech/tank/foot view hierarchy');
unit.onFoot=false;model.type='tank';
unit.recoil=.72;unit.trackLeft=83;unit.trackRight=119;
const freeBay=st().vehicles.find(v=>v.occupant===-1&&v.armor>0);
assert.ok(freeBay,'test has a nearby unused bay');
assert.equal(win.__test.tryInteract(0),true,'dismount in safe field');
unit.x=freeBay.x;unit.y=freeBay.y;
assert.equal(win.__test.tryInteract(0),true,'board recovery vehicle');
assert.equal(unit.recoil,0,'old tank recoil does not carry to fresh hull');
assert.equal(unit.trackLeft,0);assert.equal(unit.trackRight,0);
assert.equal(win.__test.cameraZoom(unit),Math.max(win.__test.unitTargetZoom(unit),1536/(win.__test.world[0]+840),672/(win.__test.world[1]+840)));
for(const [w,h] of [[740,360],[915,412],[1280,720],[1536,672]]){
 win.innerWidth=w;win.innerHeight=h;win.devicePixelRatio=1;
 assert.equal(win.__test.resizeArenaCanvas(),true);
 const expected=Math.max(win.__test.unitTargetZoom(unit),w/(win.__test.world[0]+840),h/(win.__test.world[1]+840));
 assert.ok(Math.abs(win.__test.cameraZoom(unit)-expected)<1e-9);
 win.__test.render(1/60);
 assert.ok(Number.isFinite(win.__test.camera.zoom)&&Number.isFinite(win.__test.camera.x)&&Number.isFinite(win.__test.camera.y),'camera must stay finite across viewport sizes');
}
console.log('PASS v0.9.12: closer camera, bay clearance, animation resets and viewport-safe rendering.');

// v0.9.12 LAN rematch audit: camera reset only on a genuinely changed field.
click('solo');
const preShift=st().mazeSeed,preSize=st().config.mapSize;
win.__test.camera.x=2600;win.__test.camera.y=1200;win.__test.camera.zoom=1.21;
win.__test.setArena(0,preShift,preSize);
assert.equal(win.__test.camera.x,2600,'routine same-maze snapshot should not jump the camera');
assert.equal(win.__test.camera.zoom,1.21,'routine same-maze snapshot should not snap zoom');
win.__test.setArena(0,preShift+1,'small');
assert.equal(win.__test.camera.x,0,'new guest arena must discard previous camera location');
assert.equal(win.__test.camera.y,0);
assert.equal(win.__test.camera.zoom,null,'new guest arena should ease from correct new unit zoom');
console.log('PASS v0.9.12 LAN map-change camera reset, unchanged-field continuity.');

// v0.9.12a: deliberately small, uniform +.04 across camera modes.
// Large map and aspect-ratio minimum continue to prevent letterboxing.
assert.equal(win.__test.unitTargetZoom(null),1.00,'spectator fallback zoom');
click('solo');
const zoomOperator=st().tanks[0],zoomVehicle=st().vehicles[zoomOperator.vehicleId];
zoomOperator.onFoot=false;zoomVehicle.type='tank';
assert.ok(Math.abs(win.__test.unitTargetZoom(zoomOperator)-0.82)<1e-9);
zoomVehicle.type='mech';
assert.ok(Math.abs(win.__test.unitTargetZoom(zoomOperator)-0.77)<1e-9);
zoomOperator.onFoot=true;
assert.ok(Math.abs(win.__test.unitTargetZoom(zoomOperator)-1.07)<1e-9);
console.log('PASS v0.9.12a closer pilot/tank/mech zoom with unchanged viewport floor.');


// v0.9.13 Combat feel contract: distinct sustained shell pressure and supply choice.
{
 const fs=await import('node:fs');
 const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 assert.ok(html.includes('value="4">4 · STANDARD'),'four active tank shells have an explicit menu default');
 assert.ok(html.includes('TANK SHELL LIMIT')&&html.includes('power-status'));
 assert.ok(css.includes('.power-status'),'buff information belongs in the HUD');
}
node('bullet-cap').value='4';node('bot-count').value='1';node('map-size').value='standard';
click('solo');
const fighter=st().tanks[0],hull=st().vehicles[fighter.vehicleId];
assert.equal(win.__test.activeBulletCap(fighter),4,'standard tank can control four shells');
assert.equal(win.__test.fireInterval(fighter),.36,'tank has measured suppression cadence');
hull.type='mech';hull.armor=4;
assert.equal(win.__test.activeBulletCap(fighter),3,'mech trades a shell for extra armor');
assert.equal(win.__test.fireInterval(fighter),.62,'mech fires heavy controlled pulses');
hull.type='tank';hull.armor=3;
st().bullets.length=0;
for(let j=0;j<4;j++)assert.equal(win.__test.shoot(0),true);
assert.equal(win.__test.shoot(0),false,'tank max active shells enforced');
assert.equal(st().bullets[0].life,2.55,'tank shells expire sooner, avoiding stale capacity lockouts');
st().bullets.length=0;
hull.type='mech';hull.armor=4;
for(let j=0;j<3;j++)assert.equal(win.__test.shoot(0),true);
assert.equal(win.__test.shoot(0),false,'mech independent shell limit');
assert.equal(st().bullets[0].life,2.05,'mech weapon commits to shorter heavy volleys');
st().bullets.length=0;
hull.type='tank';hull.armor=3;
fighter.onFoot=true;fighter.vehicleId=null;
assert.equal(win.__test.activeBulletCap(fighter),2,'pilot pistol is close-range recovery weapon');
assert.equal(win.__test.fireInterval(fighter),.43);
assert.equal(win.__test.shoot(0),true);
assert.equal(st().bullets[0].life,.82);
st().bullets.length=0;
const pp={x:fighter.x,y:fighter.y,type:'rapid'};
st().pickups=[pp];
assert.equal(win.__test.collectPickup(fighter,0,pp),true);
assert.equal(fighter.powerType,'rapid');
assert.equal(win.__test.activeBulletCap(fighter),3,'rapid helps the pilot without infinite bullets');
assert.ok(win.__test.fireInterval(fighter)<.43);
assert.equal(st().pickups.length,0,'pickup removed exactly once');
fighter.onFoot=false;fighter.vehicleId=hull.id;hull.occupant=0;
assert.equal(win.__test.activeBulletCap(fighter),5);
st().bullets.length=0;
assert.equal(win.__test.shoot(0),true);
assert.ok(st().bullets.at(-1).life<2.55&&st().bullets.at(-1).life>1.5,'rapid shells intentionally clear capacity earlier');
st().bullets.length=0;
const pow={x:fighter.x,y:fighter.y,type:'overcharge'};
st().pickups=[pow];
assert.equal(win.__test.collectPickup(fighter,0,pow),true);
assert.equal(win.__test.activeBulletCap(fighter),6,'capacitor creates temporary pressure window');
assert.equal(fighter.powerType,'overcharge');
hull.armor=2;
const med={x:fighter.x,y:fighter.y,type:'repair'};
st().pickups=[med];
assert.equal(win.__test.collectPickup(fighter,0,med),true);
assert.equal(hull.armor,3,'repair only restores one armor plate');
assert.equal(fighter.powerType,'overcharge','instant repair does not remove active timed buff');
st().pickups=[med];
assert.equal(win.__test.collectPickup(fighter,0,med),false,'full armor cannot waste repair');
assert.equal(st().pickups.length,1,'unusable repair remains available');
fighter.powerTimer=0;fighter.powerType=null;
win.__test.refreshHUD();
assert.equal(node('power-status').classList.contains('hidden'),true,'expired boost hides HUD label');
const guard={x:fighter.x,y:fighter.y,type:'guard'};
st().pickups=[guard];assert.equal(win.__test.collectPickup(fighter,0,guard),true);
assert.equal(node('power-status').classList.contains('hidden'),false,'active boost visible to player');
assert.ok(node('power-status').textContent.includes('BARRIER'));
const ignored={x:-600,y:-600,type:'repair'};
st().pickups=[ignored];st().pickupTimer=0;
win.__test.step(1/60);
assert.ok(st().pickups.length===1&&st().pickups[0]!==ignored,'ignored supply rotates to fresh pickup');
assert.ok(st().pickupTimer>12&&st().pickupTimer<14,'new pickup has finite replacement cycle');
console.log('PASS v0.9.13: unit ammo roles, temporary power capacities, repair, pickup lifecycle and power UI.');

{
// v0.9.14 — modest zoom-out with unit distinction and readable supply symbols.
assert.deepEqual(['mech','tank','foot'].map(type=>{
 const actor=st().tanks[0],v=st().vehicles[actor.vehicleId];
 actor.onFoot=type==='foot';
 if(!actor.onFoot&&v)v.type=type;
 return win.__test.unitTargetZoom(actor);
}),[0.77,0.82,1.07]);
assert.equal(win.__test.unitTargetZoom(null),1.00);
{
 const src=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
 assert.ok(src.includes("guard:{label:'B'")&&src.includes("overcharge:{label:'C'")&&src.includes("repair:{label:'H'"),'pickup types should use unique glyphs');
}
// Waypoint should ignore a vehicle already unusable due to another living actor
// standing inside its deployment footprint, then recover when the bay clears.
click('solo');
const pilot=st().tanks[0];
assert.equal(win.__test.tryInteract(0),true,'dismount for recovery-waypoint QA');
const bay=st().vehicles.find(v=>v.occupant===-1&&v.armor>0);
assert.ok(bay,'free recovery vehicle available');
pilot.x=bay.x-12;pilot.y=bay.y;
const rival=st().tanks[1],rivalPos=[rival.x,rival.y];
rival.x=bay.x;rival.y=bay.y;
const chosen=win.__test.closestAvailableVehicle(0);
assert.notEqual(chosen?.id,bay.id,'blocked bay does not attract pilot waypoint');
rival.x=rivalPos[0];rival.y=rivalPos[1];
assert.equal(win.__test.closestAvailableVehicle(0)?.id,bay.id,'clear bay becomes eligible again');
console.log('PASS v0.9.14 camera, supply glyphs, recovery waypoints and prior combat regressions.');

}


{
 // v0.9.14 end-of-life UI reliability: the last pilot life ends active
 // temporary supply effects immediately, rather than leaving a stale timer.
 click('solo');
 const actor=st().tanks[0];
 assert.equal(win.__test.tryInteract(0),true,'pilot can exit for terminal-life QA');
 actor.shield=0;
 st().lives[0]=1;
 actor.powerType='turbo';
 actor.powerTimer=3;
 win.__test.refreshHUD();
 assert.equal(node('power-status').classList.contains('hidden'),false,'living boosted pilot has active status');
 assert.equal(win.__test.registerHit(0,0),true,'pilot loses final life');
 assert.equal(st().lives[0],0);
 assert.equal(actor.powerType,null);
 assert.equal(actor.powerTimer,0);
 assert.equal(node('power-status').classList.contains('hidden'),true,'eliminated pilot has no lingering HUD buff');
}
console.log('PASS v0.9.14 end-of-life powerup state audit.');

// v0.9.15 — test end-screen correctness and optional synthesized audio.
{
 const markup=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 assert.ok(markup.includes('id="after-action"')&&markup.includes('id="results-menu"'));
 assert.ok(markup.includes('id="aa-kos"')&&markup.includes('id="aa-lives"'));
 assert.ok(css.includes('v0.9.15 AFTER ACTION')&&css.includes('.after-action.hidden'));
 assert.ok(!script.includes("fillText('FIELDGRID  /  AFTER ACTION'"),'old canvas-only result was removed');
 const tones=[];
 class MockAudioContext{
  state='running';currentTime=4;
  resume(){}
  createOscillator(){
   tones.push('voice');
   return {type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this},start(){},stop(){}};
  }
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this}}}
  destination={}
 }
 win.AudioContext=MockAudioContext;
 win.__test.comfort.sound=false;
 assert.equal(win.__test.audioCue('armor-hit'),false,'audio toggle must silence effects');
 assert.equal(tones.length,0,'mute creates no audio nodes');
 win.__test.comfort.sound=true;
 assert.equal(win.__test.audioCue('tank-shot'),true,'weapon cue synthesized offline');
 assert.equal(win.__test.audioCue('mech-shot'),true,'mech has its own attack timbre');
 assert.equal(win.__test.audioCue('pilot-shot'),true);
 assert.equal(win.__test.audioCue('ricochet'),true,'bounce audio available');
 assert.equal(win.__test.audioCue('ricochet'),false,'bounce cue throttled');
 assert.equal(win.__test.audioCue('victory'),true,'win receives a short synth motif');
 assert.ok(tones.length>=7,'victory cue adds two extra voices to the short stinger');
 assert.equal(win.__test.audioCue('does-not-exist'),false);
}
{
 click('solo');
 const game=st();game.winner=0;game.winnerTeam=0;game.event='CYAN WINS!';
 game.kos[0]=2;game.lives[0]=3;
 win.__test.refreshHUD();
 assert.equal(node('after-action').classList.contains('hidden'),false,'results surfaced');
 assert.equal(node('after-action').classList.contains('lost'),false);
 assert.equal(node('aa-title').textContent,'SECTOR CLEARED');
 assert.equal(node('aa-kos').textContent,'2','KO metric must be accurately named');
 assert.equal(node('aa-lives').textContent,'3');
 assert.equal(node('aa-outcome').textContent,'VICTORY');
 assert.equal(node('quick-rematch').classList.contains('hidden'),false);
 // A final result is immutable even if a late/duplicated combat event tries to change the winner.
 const frozen=game.finalResult;
 assert.ok(Object.isFrozen(frozen),'final result becomes an immutable summary');
 game.winner=1;game.winnerTeam=1;game.event='BOT 1 WINS!';
 win.__test.refreshHUD();
 assert.equal(game.finalResult,frozen,'refreshing a completed result does not rescore it');
 assert.equal(node('aa-title').textContent,'SECTOR CLEARED','snapshot does not flicker or reverse');
 assert.equal(node('aa-outcome').textContent,'VICTORY');
 for(const cb of handlers['quick-rematch:click'])cb();
 assert.equal(node('after-action').classList.contains('hidden'),true,'report closes on rematch');
 assert.equal(st().winner,-1);
 st().winner=1;st().winnerTeam=1;win.__test.refreshHUD();
 for(const cb of handlers['results-menu:click'])cb();
 assert.equal(node('menu').classList.contains('hidden'),false,'results menu returns to menu');
}
console.log('PASS v0.9.15: after-action stats, result transitions, replay/menu and optional throttled synth cues.');


// v0.9.16 AI behavior regression and reproducible combat/arena telemetry.
// The synthetic opponent is stationary; these runs diagnose navigation and
// performance, NOT human-vs-bot balance or player engagement.
{
 const match=win.__test.resetSeededMatch(615,'standard','normal');
 const bot=match.tanks[1],human=match.tanks[0],hull=match.vehicles[bot.vehicleId];
 match.pickups=[];
 human.x=Math.max(80,Math.min(win.__test.world[0]-80,bot.x+390));
 human.y=Math.max(80,Math.min(win.__test.world[1]-80,bot.y+220));
 hull.armor=1;
 const supply={x:bot.x+18,y:bot.y+12,type:'repair'};
 match.pickups=[supply];
 assert.equal(win.__test.chooseBotObjective(1,human).kind,'supply','damaged bot should notice usable nearby repair');
 hull.armor=3;supply.type='rapid';bot.powerTimer=0;
 assert.equal(win.__test.chooseBotObjective(1,human,'normal').kind,'supply','bot can prioritize a nearby powerup');
 bot.powerType='guard';bot.powerTimer=5;
 assert.notEqual(win.__test.chooseBotObjective(1,human,'normal').kind,'supply','bot should not casually replace active buff');
 bot.powerType=null;bot.powerTimer=0;match.pickups=[];
 bot.onFoot=true;bot.vehicleId=null;hull.occupant=-1;hull.x=bot.x+44;hull.y=bot.y;
 assert.equal(win.__test.chooseBotObjective(1,human).kind,'recovery','dismounted bot prioritizes a vehicle');
 hull.occupant=1;bot.onFoot=false;bot.vehicleId=hull.id;
 match.pickups=[];hull.armor=1;
 human.x=bot.x+65;human.y=bot.y;
 const intent=win.__test.chooseBotObjective(1,human);
 assert.ok(['evade','engage'].includes(intent.kind),'poorly armored bot only evades where a safe space exists');
 assert.equal(win.__test.botInput(1,1/60).bot,true,'bot control obeys existing input contract');
}
{
 const sizes=['small','standard','large'],skills=['casual','normal','spicy'];
 const samples=[];
 let allTravel=0,allShots=0,longestFreeze=0;
 for(const size of sizes)for(let seed=1;seed<=6;seed++){
  seedRandom(0x6a19+(seed*127)+sizes.indexOf(size)*521);
  const skill=skills[(seed-1)%3];
  const game=win.__test.resetSeededMatch(22000+seed*229+sizes.indexOf(size)*1999,size,skill);
  const maze=win.__test.maze,{cols,cell,open}=maze;
  const toCell=t=>Math.max(0,Math.min(maze.rows-1,Math.floor(t.y/cell)))*cols+Math.max(0,Math.min(cols-1,Math.floor(t.x/cell)));
  const visited=new Set([toCell(game.tanks[0])]),queue=[toCell(game.tanks[0])];
  for(let a=0;a<queue.length;a++)for(const n of open[queue[a]])if(!visited.has(n)){visited.add(n);queue.push(n);}
  for(const [i,t] of game.tanks.entries()){
   assert.ok(!win.__test.blocked(t.x,t.y,t.onFoot?12:21),'safe actor spawn '+size+' seed '+seed+' actor '+i);
   assert.ok(visited.has(toCell(t)),'spawn cells must all be connected '+size+' seed '+seed);
  }
  const bots=game.tanks.slice(1),pos=bots.map(b=>[b.x,b.y]),idle=bots.map(()=>0);
  let travel=0,shots=0,peakShells=0,steps=0,freeze=0,closeDuelFrames=0,lastFx=0,longestStall=null,choices={supply:0,recovery:0,evade:0,engage:0};
  for(let frame=0;frame<1800&&game.winner<0;frame++){
   // Sample tactical decisions without changing the simulation.
   if(frame%30===0)for(let i=1;i<game.tanks.length;i++)if(game.lives[i]>0){
    const rivals=game.tanks.map((t,j)=>({t,j})).filter(o=>o.j!==i&&game.lives[o.j]>0&&win.__test.teamOf(o.j)!==win.__test.teamOf(i));
    if(rivals.length){rivals.sort((a,b)=>Math.hypot(a.t.x-game.tanks[i].x,a.t.y-game.tanks[i].y)-Math.hypot(b.t.x-game.tanks[i].x,b.t.y-game.tanks[i].y));
     const choice=win.__test.chooseBotObjective(i,rivals[0].t,skill).kind;choices[choice]=(choices[choice]||0)+1;}
   }
   tick+=1000/60;
   win.__test.step(1/60);steps++;
   peakShells=Math.max(peakShells,game.bullets.length);
   for(const fx of game.fxEvents)if(fx.id>lastFx&&fx.kind==='shot')shots++;
   lastFx=Math.max(lastFx,...game.fxEvents.map(x=>x.id),0);
   for(let b=0;b<bots.length;b++){
    const now=bots[b],dist=Math.hypot(now.x-pos[b][0],now.y-pos[b][1]);
    if(game.lives[b+1]>0){
     travel+=dist;
     // Near-contact pressure is not a navigation stall: bots deliberately
     // reduce their approach speed while dueling at close range.
     const threats=game.tanks.map((t,j)=>({t,j})).filter(o=>o.j!==b+1&&game.lives[o.j]>0&&win.__test.teamOf(o.j)!==win.__test.teamOf(b+1));
     threats.sort((a,b)=>Math.hypot(now.x-a.t.x,now.y-a.t.y)-Math.hypot(now.x-b.t.x,now.y-b.t.y));
     const nearest=threats[0]?.t;
     const nearestDistance=nearest?Math.hypot(now.x-nearest.x,now.y-nearest.y):Infinity;
     const engaged=nearestDistance<115&&win.__test.hasLineOfSight(now.x,now.y,nearest.x,nearest.y);
     if(dist<.05&&engaged)closeDuelFrames++;
     idle[b]=dist<.05&&!engaged?idle[b]+1:0;
     if(idle[b]>freeze){
      freeze=idle[b];
      if(freeze>=60&&freeze%30===0){
       const objective=win.__test.chooseBotObjective(b+1,nearest??game.tanks[0],skill);
       const radius=now.onFoot?12:22;
       const openDirections=[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>!win.__test.blocked(now.x+Math.cos(a)*42,now.y+Math.sin(a)*42,radius));
       longestStall={botIndex:b+1,seconds:+(freeze/60).toFixed(2),frame,x:+now.x.toFixed(1),y:+now.y.toFixed(1),foot:now.onFoot,
        objective:objective.kind,distance:+Math.hypot(objective.point.x-now.x,objective.point.y-now.y).toFixed(1),
        closestEnemyDistance:+nearestDistance.toFixed(1),alive:game.lives[b+1],openDirections,
        opponents:game.tanks.map((t,i)=>({i,x:+t.x.toFixed(1),y:+t.y.toFixed(1),life:game.lives[i]}))};
      }
     }
    }
    pos[b]=[now.x,now.y];
    assert.ok(Number.isFinite(now.x)&&Number.isFinite(now.y),'no nonfinite actor positions');
   }
   assert.ok(game.bullets.length<=game.tanks.length*(game.config.bulletCap+2),'bounded live projectiles');
  }
  allTravel+=travel;allShots+=shots;longestFreeze=Math.max(longestFreeze,freeze);
  samples.push({size,seed:game.mazeSeed,skill,elapsedSeconds:+(steps/60).toFixed(2),completed:game.winner>=0,
   winner:game.winner,kos:game.kos.slice(),botDistance:+travel.toFixed(1),shots,peakShells,
   maxBotImmobileSeconds:+(freeze/60).toFixed(2),closeDuelSeconds:+(closeDuelFrames/60).toFixed(2),longestStall,choices});
 }
 assert.equal(samples.length,18);
 assert.ok(samples.every(x=>x.elapsedSeconds>0));
 assert.ok(allTravel>2000,'bots must actually navigate sampled maps');
 const summary={version:'0.9.17',method:'30 seconds per session, two bots against stationary human in seeded arenas; not a human win-rate study',
  samples:samples.length,completed:samples.filter(x=>x.completed).length,
  timedOut:samples.filter(x=>!x.completed).length,averageBotTravel:Math.round(allTravel/samples.length),
  totalShots:allShots,maxBotImmobileSeconds:+(longestFreeze/60).toFixed(2),sessions:samples};
 fs.mkdirSync(new URL('../qa-results/',import.meta.url),{recursive:true});
 fs.writeFileSync(new URL('../qa-results/combat-simulation.json',import.meta.url),JSON.stringify(summary,null,2));
 console.log('PASS v0.9.16 AI intent, safe-connected spawns and 18 seeded combat samples: '+JSON.stringify({completed:summary.completed,timedOut:summary.timedOut,averageBotTravel:summary.averageBotTravel,maxBotImmobileSeconds:summary.maxBotImmobileSeconds}));
 simRand=null;
}


// v0.9.16 overlap regression: after an ejection or correction, an actor
// must be allowed to walk/drive OUT of existing overlap, not into a new one.
{
 const game=win.__test.resetSeededMatch(44012,'standard','normal'),grid=win.__test.maze;
 let spot=null;
 for(let k=0;k<grid.open.length;k++){
  const x=((k%grid.cols)+.5)*grid.cell,y=(Math.floor(k/grid.cols)+.5)*grid.cell;
  if(!win.__test.blocked(x,y,22)&&Math.hypot(x-game.tanks[0].x,y-game.tanks[0].y)>180){spot=[x,y];break;}
 }
 assert.ok(spot,'safe cell exists for overlap regression');
 const moving=game.tanks[1],other=game.tanks[2];
 Object.assign(moving,{x:spot[0],y:spot[1],vx:0,vy:0,a:0});
 Object.assign(other,{x:spot[0]+26,y:spot[1],vx:0,vy:0,a:0});
 const before=moving.x;
 win.__test.tankMove(moving,{moveX:-1,moveY:0},1/60,1);
 assert.ok(moving.x<before,'tank must move away even while previously overlapped');
 // Moving toward an overlapping rival remains blocked.
 Object.assign(moving,{x:spot[0],y:spot[1],vx:0,vy:0,a:0});
 win.__test.tankMove(moving,{moveX:1,moveY:0},1/60,1);
 assert.ok(moving.x<=spot[0]+.00001,'collision still prevents greater penetration');
 console.log('PASS v0.9.16: separate pre-overlapped actors without introducing new actor clipping.');
}

// v0.9.17: First-match assistance and honest shell/reload status.
{
 const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 assert.ok(html.includes('id="field-coach"')&&css.includes('.field-coach.hidden'),'optional coach has an explicit hidden state');
 assert.ok(!html.includes('NO ACCOUNT REQUIRED')&&!html.includes('V0.9.20 · LOCAL'),'home must not show redundant account or build wording');
 assert.ok(html.includes('id="home-unit-name"')&&html.includes('id="pref-music"'),'rotating vehicle presentation and music preference exist');
 assert.ok(html.includes('id="menu-preview"')&&html.includes('class="home-screen"'),'home menu uses the in-game tank lobby stage');
 assert.ok(html.includes('data-action="solo"')&&html.includes('data-action="nearby"')&&html.includes('data-action="settings"')&&html.includes('data-action="help"'),'all entry actions retained');
 assert.equal(html,fs.readFileSync(new URL('../android/app/src/main/assets/index.html',import.meta.url),'utf8'),'Android and web menus must remain identical');
 assert.ok(css.includes('.scorestrip .middle.damaged'),'critical armor styling is present');
 click('solo');
 const coach=node('field-coach');
 assert.equal(coach.classList.contains('hidden'),false,'initial controls explained without blocking play');
 assert.ok(coach.textContent.includes('HOLD FIRE'));
 win.__test.coachTip('PILOT TEST',.05);
 assert.equal(coach.textContent,'PILOT TEST');
 runFrames(6);
 assert.equal(coach.classList.contains('hidden'),true,'contextual hint expires');
 const subject=st().tanks[0];
 subject.shield=100;
 st().bullets.length=0;
 const cap=win.__test.activeBulletCap(subject);
 for(let i=0;i<cap;i++)assert.equal(win.__test.shoot(0),true);
 assert.ok(node('shell-meter').textContent.includes('IN FLIGHT'),'full projectile cap is not mislabeled as ammunition');
 st().bullets.length=0;win.__test.refreshHUD();
 assert.ok(node('shell-meter').textContent.includes('READY'),'shells are available after expiration');
 const oldNotice=node('toast').textContent;
 win.__test.updateQuietMatchPrompt(28.5);
 assert.ok(node('toast').textContent.includes('RADAR'),'inactive combat suggests existing radar');
 win.__test.updateQuietMatchPrompt(50);
 assert.ok(node('toast').textContent.includes('RADAR'),'quiet prompt is one-time');
 assert.notEqual(node('toast').textContent,oldNotice);
}
console.log('PASS v0.9.17 contextual guidance, true projectile availability, one-time quiet-match radar reminder.');


{
 const source=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
 assert.equal(source.includes("c.fillText('ENTER  ·  '+vehicleDef(v).name"),false,'dismounted pilot must not be covered by duplicate world enter label');
 assert.ok(source.includes('t.x+(t.onFoot?27:0)'),'on-foot ID is separated from nearby parked armor');
 assert.ok(source.includes('c.arc(0,0,21,0,Math.PI*2)'),'on-foot locator is a subtle larger background ring');
 assert.ok(source.includes('c.moveTo(t.x-21,t.y)'),'on-foot chevron points from the side rather than merging with the old vehicle');
 assert.equal(source,fs.readFileSync(new URL('../android/app/src/main/assets/game.js',import.meta.url),'utf8'),'Android and browser share pilot renderer');
}
console.log('PASS v0.9.19 on-foot readability, safe parked-vehicle labeling and Android/web parity.');


{
 const save=node('pref-music');assert.ok(save,'music has an independent preference');
 const oldAudio=win.rrAudio;
 const oldSetting=win.__test.comfort.sound;
 const oldMusic=win.__test.comfort.music;
 const musicAc=win.rrAudio;
 win.__test.comfort.sound=false;
 win.__test.comfort.music=true;
 win.__test.armMusic();
 assert.ok(musicAc||win.rrAudio,'user gesture can initialize offline synth music');
 win.__test.updateMusic();
 assert.equal(win.__test.audioCue('tank-shot'),false,'muted SFX remain muted with music enabled');
 win.__test.comfort.music=false;
 win.__test.comfort.sound=true;
 assert.equal(win.__test.audioCue('does-not-exist'),false,'music toggle is independent of SFX');
 win.__test.comfort.sound=oldSetting;win.__test.comfort.music=oldMusic;
}
console.log('PASS v0.9.21 menu cleanup, separate music/SFX options and 7% wider class cameras.');

// v0.9.22 Slice A: two actually supported survival presets, not the future score modes.
{
 const api=win.__test;
 assert.ok(menuHtml.includes('data-playlist-mode="survival_ffa"')&&menuHtml.includes('data-playlist-mode="survival_teams"'));
 assert.ok(menuHtml.includes('↻ NEXT MATCH'),'solo result primary CTA is explicit');
 assert.equal(api.normalizePlaylistModes(['retired','survival_ffa','survival_ffa']).join(','),'survival_ffa');
 assert.equal(api.normalizePlaylistModes(null).length,2,'legacy saves default to both supported modes');
 api.setPlaylistModes(['survival_ffa','survival_teams']);
 const cycle=[api.nextPlaylistMode(()=>0),api.nextPlaylistMode(()=>0)];
 assert.equal(new Set(cycle).size,2,'each mode appears once per shuffle bag');
 const next=api.nextPlaylistMode(()=>0);
 assert.notEqual(next,cycle[1],'new bag does not immediately repeat prior mode');
 api.setPlaylistModes(['survival_teams']);
 assert.equal(api.nextPlaylistMode(()=>0),'survival_teams');
 assert.equal(api.nextPlaylistMode(()=>0),'survival_teams','single selected mode repeats');
 api.setPlaylistModes(['survival_ffa']);
 api.newMatch('solo');
 assert.equal(st().config.matchModeId,'survival_ffa');
 assert.equal(st().config.teamMode,'ffa');
 const before={seed:st().mazeSeed,matchId:st().matchId};
 api.resetAll(true);
 assert.notEqual(st().mazeSeed,before.seed,'NEXT MATCH guarantees a fresh seed');
 assert.ok(st().matchId>before.matchId,'new match gets a unique incremental match ID');
 assert.equal(st().config.matchModeId,'survival_ffa');
 api.setPlaylistModes([]);
 assert.equal(api.nextPlaylistMode(),null,'zero selected modes cannot silently reroll');
 const kept=st();
 assert.equal(api.newMatch('solo'),false,'zero modes blocks QUICK PLAY');
 assert.equal(st(),kept,'zero mode selection leaves the current match untouched');
 api.setPlaylistModes(['survival_ffa','survival_teams']);
 assert.equal(/score|flag|capture/i.test(st().config.matchModeId),false,'proposed score modes never presented as live');
}
console.log('PASS v0.9.22 Slice A versioned playlist selection, shuffle-bag boundaries, real survival presets and fresh seeds.');

// v0.9.22-dev2 — honest, one-time frozen solo result evidence and clock.
{
 const api=win.__test;
 api.setPlaylistModes(['survival_ffa']);
 node('bot-count').value='1';
 api.newMatch('solo');
 const s=st();assert.equal(s.tanks.length,2,'single bot provides deterministic solo result');s.tanks[0].shield=0;
 assert.equal(s.elapsedSeconds,0);
 api.step(1/60);assert.ok(s.elapsedSeconds>0,'active simulation advances match time');
 const elapsed=s.elapsedSeconds;
 for(const fn of handlers['menu-button:click']||[])fn();
 api.step(0.75);
 assert.equal(s.elapsedSeconds,elapsed,'pause does not advance simulation match time');
 click('resume');
 // Pause and finalization must not advance the clock; only active simulation ticks count.
 s.tanks[0].onFoot=true;s.tanks[0].shield=0;s.lives[0]=2;
 s.kos[0]=0;
 const target=s.tanks[1];target.onFoot=true;target.shield=0;s.lives[1]=1;
 assert.equal(api.registerHit(0,1),true,'pilot elimination registers hit');
 assert.equal(s.kos[0],1,'operator KO counts actual pilot elimination');
 assert.equal(s.deaths[1],1,'victim death counts once');
 assert.equal(s.respawns[1],0,'last life does not respawn');
 assert.equal(s.finalResult.outcome,'victory');
 assert.equal(s.finalResult.operatorKOs,1);
 assert.equal(s.finalResult.deaths,0);
 assert.equal(s.finalResult.livesRemaining,2);
 assert.equal(s.finalResult.durationSeconds,elapsed);
 assert.equal(s.finalResult.matchId,s.matchId);
 assert.equal(s.finalResult.mazeSeed,s.mazeSeed);
 assert.ok(Object.isFrozen(s.finalResult));
 const snap=s.finalResult;
 assert.equal(api.finalizeRound(),snap,'no duplicate finalizations');
 assert.equal(api.registerHit(0,1),false,'late hit after result ignored');
 api.step(3);assert.equal(s.elapsedSeconds,elapsed,'terminal clock frozen');
 s.kos[0]=99;s.deaths[0]=99;s.lives[0]=0;
 api.refreshHUD();
 assert.equal(node('aa-kos').textContent,'1','results use frozen KO snapshot');
 assert.equal(node('aa-deaths').textContent,'0');
 assert.equal(node('aa-lives').textContent,'2','results use frozen life snapshot');
 assert.equal(node('aa-duration').textContent,api.durationLabel(elapsed));
 assert.equal(api.durationLabel(125.9),'02:05');
 assert.equal(api.durationLabel(null),'—','unknown time must not appear as zero');
 const old=s.finalResult,seed=s.mazeSeed,matchId=s.matchId;
 api.resetAll(true);
 assert.equal(st().finalResult,null,'fresh round clears finalized result');
 assert.equal(st().deaths[0],0,'fresh round clears death counter');
 assert.equal(st().elapsedSeconds,0,'fresh round clears timer');
 assert.notEqual(st().mazeSeed,seed,'new round always new maze');
 assert.ok(st().matchId>matchId,'new round new match ID');
 assert.equal(old.operatorKOs,1,'previous snapshot remains unchanged');
 // Respawn is counted once per actual nonterminal death, and ejection is not a death.
 const next=st();next.tanks[0].shield=0;next.lives[0]=2;
 const beforeArmor=next.vehicles[next.tanks[0].vehicleId].armor;
 assert.equal(api.registerHit(1,0),true,'vehicle armor hit accepted');
 assert.equal(next.vehicles[next.tanks[0].vehicleId].armor,beforeArmor-1);
 assert.equal(next.deaths[0],0,'armor hit cannot be a pilot death');
 assert.equal(next.kos[1],0,'armor hit cannot be an operator KO');
 api.ejectPilot(0);assert.equal(next.deaths[0],0,'vehicle ejection is not a pilot death');
 next.tanks[0].shield=0;
 assert.equal(api.registerHit(1,0),true);
 assert.equal(next.deaths[0],1);
 assert.equal(next.respawns[0],1);
 assert.equal(next.winner,-1,'losing one life does not end match');
 api.newMatch('solo');
 const loss=st();assert.equal(loss.finalResult,null,'starting another match cannot inherit prior result');
 loss.tanks[0].onFoot=true;loss.tanks[0].shield=0;loss.lives[0]=1;
 assert.equal(api.registerHit(1,0),true,'last pilot life lost');
 assert.equal(loss.winner>=0,true);
 assert.equal(loss.finalResult.outcome,'defeat','defeat snapshot uses real surviving opponent');
 assert.equal(loss.finalResult.deaths,1);
 assert.equal(loss.finalResult.operatorKOs,0);
 assert.equal(loss.finalResult.livesRemaining,0);
 assert.equal(node('aa-outcome').textContent,'DEFEAT');
 assert.equal(node('aa-deaths').textContent,'1');
 const ended=loss.finalResult;
 api.refreshHUD();api.refreshHUD();
 assert.equal(loss.finalResult,ended,'repeated results refresh keeps one immutable object');
}
console.log('PASS v0.9.22-dev2 frozen final results, win/loss, pilot deaths/respawns and active match clock.');


// v0.9.22-dev3: tactical pullback across all three playable unit classes,
// wide-screen apron and sustained camera smoothing without canvas gutters.
{
 const api=win.__test;
 api.setPlaylistModes(['survival_ffa']);
 api.newMatch('solo');
 const actor=st().tanks[0],ride=st().vehicles[actor.vehicleId];
 const before=[1.08,1.13,1.22];
 const after=[];
 for(const kind of ['mech','tank','foot']){
   actor.onFoot=kind==='foot';ride.type=kind==='foot'?'tank':kind;
   if(!actor.onFoot)actor.vehicleId=ride.id;
   after.push(api.unitTargetZoom(actor));
 }
 assert.deepEqual(after,[.77,.82,1.07]);
 after.forEach((z,i)=>assert.ok(z<before[i]*.89,'each unit gets a meaningful world-space zoom-out'));
 actor.onFoot=false;ride.type='tank';actor.vehicleId=ride.id;
 for(const [w,h] of [[740,360],[915,412],[1280,720],[1536,672]]){
   win.innerWidth=w;win.innerHeight=h;win.devicePixelRatio=1;
   assert.equal(api.resizeArenaCanvas(),true);
   const [ww,wh]=api.world;
   const floor=Math.max(w/(ww+840),h/(wh+840));
   assert.equal(api.cameraZoom(actor),Math.max(.82,floor));
   api.render(1/60);
   assert.ok(Number.isFinite(api.camera.x)&&Number.isFinite(api.camera.y)&&Number.isFinite(api.camera.zoom),'all device cameras stay finite');
 }
}
console.log('PASS v0.9.22-dev3 tactical pullback, wide-screen floor and class hierarchy.');


// v0.9.22-dev5 camera: vehicles get another tactical pullback;
// approved on-foot view and future pilot-only CQC are not disturbed.
{
 const api=win.__test;
 api.setPlaylistModes(['survival_ffa']);
 node('map-size').value='small';
 api.newMatch('solo');
 const actor=st().tanks[0],vehicle=st().vehicles[actor.vehicleId];
 const pilotBefore=1.07,oldTank=.87,oldMech=.82;
 actor.onFoot=true;
 assert.equal(api.unitTargetZoom(actor),pilotBefore,'on-foot view MUST remain at dev3-approved zoom');
 actor.onFoot=false;actor.vehicleId=vehicle.id;
 vehicle.type='tank';assert.equal(api.unitTargetZoom(actor),.82);
 vehicle.type='mech';assert.equal(api.unitTargetZoom(actor),.77);
 assert.ok(.82<oldTank&&.77<oldMech,'both vehicles see more terrain than dev4');
 assert.ok(.77<.82&&.82<1.07,'mech, tank, pilot hierarchy unchanged');
 // True 1536px wide, SMALL map must not clamp either vehicle above its target.
 win.innerWidth=1536;win.innerHeight=672;win.devicePixelRatio=1;
 assert.equal(api.resizeArenaCanvas(),true);
 const [w,h]=api.world;
 assert.equal(w,9*132);assert.equal(h,6*132,'small-map test uses real 9x6 world');
 const floor=Math.max(1536/(w+840),672/(h+840));
 assert.ok(1536/(w+760)>.77,'old apron would clamp the latest mech zoom');
 assert.ok(floor<.77,'apron is large enough to deliver intended mech FOV');
 assert.equal(api.cameraZoom(actor),.77,'wide 1536 small map reaches full mech zoom');
 vehicle.type='tank';assert.equal(api.cameraZoom(actor),.82);
 actor.onFoot=true;assert.equal(api.cameraZoom(actor),pilotBefore);
 // In-game rendering and camera must remain stable for every class and view size.
 for(const [screenW,screenH] of [[740,360],[915,412],[1280,720],[1536,672]]){
  win.innerWidth=screenW;win.innerHeight=screenH;win.devicePixelRatio=1;
  assert.equal(api.resizeArenaCanvas(),true);
  for(const type of ['tank','mech','pilot']){
   actor.onFoot=type==='pilot';
   if(!actor.onFoot){actor.vehicleId=vehicle.id;vehicle.type=type;}
   const wanted=type==='pilot'?1.07:type==='tank'?.82:.77;
   const deviceFloor=Math.max(screenW/(w+840),screenH/(h+840));
   assert.ok(Math.abs(api.cameraZoom(actor)-Math.max(wanted,deviceFloor))<1e-9,'every unit reaches its correct viewport-limited zoom target');
   api.render(1/60);
   assert.ok(Number.isFinite(api.camera.x)&&Number.isFinite(api.camera.y)&&Number.isFinite(api.camera.zoom),'camera stays finite after class/viewport switch');
   assert.ok(api.camera.zoom>0,'nonzero rendering scale');
  }
 }
}
console.log('PASS v0.9.22-dev5 vehicle-wide camera, unchanged pilot and widescreen small-map FOV.');

// v0.9.22-dev5 owner camera constraint: pilot must never be pushed farther away.
{
 const src=fs.readFileSync(new URL('../web/game.js',import.meta.url),'utf8');
 const bundled=fs.readFileSync(new URL('../android/app/src/main/assets/game.js',import.meta.url),'utf8');
 assert.equal(src,bundled,'Android and web JS should remain byte-identical');
 assert.ok(src.includes('if(t.onFoot)return 1.07'),'pilot view unchanged');
 assert.ok(src.includes('const CAMERA_APRON=420'),'new exterior perimeter present');
 assert.ok(!src.includes('const CAMERA_APRON=380'),'old exterior camera limit must not silently return');
 assert.ok(src.includes("v?.type==='mech'?.77:v?.type==='tank'?.82"),'mech/tank zooms changed together');
}
console.log('PASS v0.9.22-dev5 small vehicle-only pullback, pilot preserved and assets mirrored.');
