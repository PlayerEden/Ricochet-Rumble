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

assert.ok(/\}\)\(\);\s*$/.test(script),'Production IIFE trailer must remain intact');
script=script.replace(/\}\)\(\);\s*$/ , "window.__lan={\n host(seed=93577){\n  mode='host';paused=false;connected=true;state=initialState(0,{...selectedRules,mapSize:'standard',botCount:0,pilotMode:true},seed);\n  menu.classList.add('hidden');fireCooldown.fill(0);guestInput={moveX:0,moveY:0,fire:false};clearFireAim();touch.clear();\n  for(let i=0;i<2;i++){const t=state.tanks[i];const v=state.vehicles[t.vehicleId];if(v)v.occupant=-1;t.vehicleId=null;t.onFoot=true;t.vx=0;t.vy=0;t.a=0;t.shield=0;}\n  return state;\n },\n guest(seed=93577){\n  mode='guest';paused=false;connected=true;state=initialState(0,{...selectedRules,mapSize:'standard',botCount:0,pilotMode:true},seed);\n  state.tanks[1].onFoot=true;state.tanks[1].vehicleId=null;\n  menu.classList.add('hidden');clearFireAim();touch.clear();return state;\n },\n input(raw){window.RR.nativeMessage(JSON.stringify({type:'input',input:raw}));return {...guestInput}},\n normalize:normalizeLanInput,\n get inputState(){return {...guestInput}},\n controls(){return makeControl(true)},\n startDrag(){touch.add('fire');beginFireAim({pointerId:4,clientX:100,clientY:100},'fire');updateFireAim({pointerId:4,clientX:100,clientY:185});},\n stopDrag(){touch.delete('fire');clearFireAim();},\n closeMenu(){menu.classList.remove('hidden')},\n moveHostSeat(i,raw,dt=1/60){const t=state.tanks[i];const previous=t.a;tankMove(t,raw,dt,i);return {turn:Math.atan2(Math.sin(t.a-previous),Math.cos(t.a-previous)),x:t.x,y:t.y}},\n fireHostSeat(i){fireCooldown[i]=0;return shoot(i)},\n get state(){return state},\n get mode(){return mode},\n get fireAim(){return {...fireAim}},\n setHost(){mode='host';},\n setGuest(){mode='guest';},\n get connected(){return connected},\n get paused(){return paused},\n setConnected(value){connected=value;},\n get packetQueue(){return []}\n};})();");
vm.runInNewContext(script,env,{filename:'actual-lan-pilot-game.js'});
const lan=win.__lan;assert.ok(lan&&win.RR&&frame,'Original gameplay/Android bridge loaded');
const close=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<.0001,label+' '+actual+' != '+expected);
// Actual host receives input message and preserves finite independent aim.
const host=lan.host();
assert.equal(host.humanCount,2);
const input=lan.input({moveX:0.6,moveY:0.8,aimX:0,aimY:1,fire:true});
assert.equal(input.fire,true);
close(input.moveX,0.6,'move x');close(input.aimY,1,'aim y');
const guestTurn=lan.moveHostSeat(1,input);
close(guestTurn.turn,6.5/60,'guest on-foot precision turn under host authority');
assert.equal(lan.fireHostSeat(1),true,'guest pilot can shoot after authoritative aim');
const projectile=host.bullets.at(-1);
assert.equal(projectile.owner,1,'guest owns authoritative shot');
assert.equal(projectile.kind,'sidearm');
assert.ok(projectile.vy>0&&Math.abs(projectile.vx)<.0001,'guest bullet follows aimed bearing, not movement');
// Host pilot is governed by identical on-foot rotation.
const hostTurn=lan.moveHostSeat(0,{moveX:0.6,moveY:0.8,aimX:0,aimY:1,fire:true});
close(hostTurn.turn,guestTurn.turn,'both LAN seats have identical pilot turn step');
// Guest touch FIRE gesture can send both movement and an independent bearing.
lan.guest();
lan.startDrag();
const ctrl=lan.controls();
assert.equal(ctrl.fire,true,'dragging FIRE keeps shooting');
close(ctrl.aimX,0,'guest independent fire drag x');
close(ctrl.aimY,1,'guest independent fire drag y');
assert.ok(Number.isFinite(ctrl.moveX)&&Number.isFinite(ctrl.moveY));
lan.stopDrag();
const released=lan.controls();
assert.equal(released.fire,false);
assert.equal(released.aimX,undefined,'releasing thumb removes aim axes');
assert.equal(released.aimY,undefined);
lan.startDrag();lan.closeMenu();
assert.equal(lan.controls().fire,false,'opening menu suppresses fire');
lan.stopDrag();
// Ignore untrusted NaN, Infinity, strings, out-of-range magnitudes, incomplete aim.
lan.host(417);
const bad=lan.input({moveX:Infinity,moveY:"1",aimX:1,aimY:null,fire:"true"});
assert.equal(bad.moveX,0);assert.equal(bad.moveY,0);
assert.equal(bad.fire,false);
assert.equal(bad.aimX,undefined);
const normalized=lan.input({moveX:1,moveY:1,aimX:1,aimY:1,fire:true});
close(Math.hypot(normalized.moveX,normalized.moveY),1,'diagonal movement clamp');
close(Math.hypot(normalized.aimX,normalized.aimY),1,'diagonal independent aim normalization');
const stale=lan.input({moveX:0,moveY:0,fire:false});
assert.equal(stale.aimX,undefined,'stale aim vector is cleared');
assert.equal(stale.fire,false,'stale FIRE state is cleared');
lan.setConnected(false);
lan.input({moveX:1,moveY:1,aimX:1,aimY:0,fire:true});
assert.equal(lan.inputState.fire,false,'disconnected sender cannot revive host FIRE');
assert.equal(lan.inputState.aimX,undefined,'disconnected sender cannot revive AIM');
console.log('PASS v0.9.53 actual LAN host-authoritative pilot: both human seats aim and FIRE independently, guest touch drag is serialized, malformed and disconnected input fail closed; no new tank aim mode.');
