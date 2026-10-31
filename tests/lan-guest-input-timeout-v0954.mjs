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


assert.ok(/\}\)\(\);\s*$/.test(script),"Original game source trailer changed");
script=script.replace(/\}\)\(\);\s*$/,"window.__freshness={\n start(seed=175102){\n  mode='host';paused=false;connected=true;\n  state=initialState(0,{...selectedRules,pilotMode:true,botCount:0,startLives:3,mapSize:'standard'},seed);\n  guestInput={moveX:0,moveY:0,fire:false};\n  guestInputAge=Infinity;\n  fireCooldown.fill(0);menu.classList.add('hidden');\n  state.tanks.forEach(t=>t.shield=90);return state;\n },\n input(v){window.RR.nativeMessage(JSON.stringify({type:'input',input:v}));},\n step(n){for(let i=0;i<n;i++)step(1/60);return {guest:{...guestInput},age:guestInputAge};},\n get guest(){return {...guestInput}},\n get age(){return guestInputAge},\n setPaused(v){paused=!!v},\n get paused(){return paused},\n newHost(){newMatch('host')},\n setConnection(v){connected=!!v},\n disconnect(){window.RR.nativeMessage(JSON.stringify({type:'disconnected'}))},\n connect(){window.RR.nativeMessage(JSON.stringify({type:'connected'}))},\n openHostPause(){showPauseMenu()},\n get connected(){return connected}\n};})();");
vm.runInNewContext(script,env,{filename:'real-host-input-freshness.js'});
const v=win.__freshness;assert.ok(v&&frame,'Loaded actual game and Android packet handler');
const neutral=x=>{assert.equal(x.moveX,0);assert.equal(x.moveY,0);assert.equal(x.fire,false);assert.equal(x.aimX,undefined);assert.equal(x.aimY,undefined)};
v.start();
neutral(v.guest);
v.input({moveX:1,moveY:0.1,aimX:0,aimY:1,fire:true});
assert.equal(v.guest.fire,true,'guest can fire on fresh packet');
assert.equal(v.guest.aimY,1,'fresh pilot aim preserved');
v.step(18); // 300ms simulated physics: still within tolerance.
assert.equal(v.guest.fire,true,'normal LAN packet jitter should not immediately cancel input');
v.step(10); // total 466.7ms without any input.
neutral(v.guest);
assert.ok(v.age>=.4,'expired packet marked stale');
v.step(90);neutral(v.guest); // no endless ghost firing after a stalled connection
v.input({moveX:-1,moveY:0.2,aimX:1,aimY:0,fire:true});
assert.equal(v.guest.fire,true,'new valid packet revives the control immediately');
assert.ok(v.guest.moveX<0,'new packet directional movement restored');
v.input({moveX:0,moveY:0,fire:false});
neutral(v.guest);
v.setPaused(true);
v.input({moveX:1,moveY:1,aimX:1,aimY:0,fire:true});
neutral(v.guest);
v.setPaused(false);
v.input({moveX:0,moveY:-1,fire:true});
assert.equal(v.guest.fire,true);
v.openHostPause();
neutral(v.guest);
v.newHost();
neutral(v.guest);
assert.equal(v.paused,true,'fresh host lobby starts paused');
v.connect();
neutral(v.guest);
assert.equal(v.connected,true);
v.input({moveX:1,moveY:0,fire:true});
assert.equal(v.guest.fire,true);
v.disconnect();
neutral(v.guest);
assert.equal(v.connected,false);
v.start(999);
v.input({moveX:1,moveY:0,fire:true});
assert.equal(v.guest.fire,true);
v.setConnection(false);
v.step(40);
neutral(v.guest);
console.log('PASS v0.9.54 actual network host: held guest control expires after 0.4 simulated seconds, ignores paused/absent client, resumes on fresh input and resets on pause/rematch/reconnect/disconnect.');
