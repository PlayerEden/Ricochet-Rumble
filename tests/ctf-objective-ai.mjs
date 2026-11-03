import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const win={};
vm.runInNewContext(fs.readFileSync(new URL('../web/ctf-ai.js',import.meta.url),'utf8'),{window:win,Array,Math,Number,Object});
const ai=win.SectorCtfAI;
const actors=[{team:0,x:100,y:100,alive:true},{team:1,x:750,y:100,alive:true},
 {team:0,x:110,y:150,alive:true},{team:1,x:710,y:120,alive:true}];
const bays=[{team:0,x:100,y:100},{team:1,x:750,y:100}];
const flags=[{team:0,x:100,y:100,home:{x:100,y:100},carrier:null,droppedFor:0},
 {team:1,x:750,y:100,home:{x:750,y:100},carrier:null,droppedFor:0}];
const decide=i=>ai.choose({index:i,humanCount:1,actors,flags,bays});
assert.deepEqual([1,2,3].map(i=>ai.roleFor(i,1,actors)),['runner','escort','defender']);
assert.equal(ai.choose({index:0,humanCount:1,actors,flags,bays}),null);
// With a real Forward Bay, defender holds off the primary flag-return lane.
// This changes no flag/collision rules; no positional warping or boosted stats.
bays[1].entrances=[{x:618,y:100},{x:750,y:232}];
const guard=decide(3);
assert.equal(guard.kind,'defend');
assert.equal(guard.point.x,750);
assert.ok(guard.point.y>180&&guard.point.y<205);
bays[1].entrances=undefined;
assert.deepEqual([decide(1).kind,decide(2).kind,decide(3).kind],['steal','escort','defend']);
assert.deepEqual({...decide(1).point},{x:100,y:100});
assert.equal(decide(1).requiresPilot,true);
flags[0].carrier=1; flags[0].x=600;flags[0].y=105;
assert.deepEqual([decide(1).kind,decide(2).kind,decide(3).kind],['capture','intercept','defend']);
assert.deepEqual({...decide(1).point},{x:750,y:100});
flags[0].carrier=null; flags[1].droppedFor=2; flags[1].x=695;flags[1].y=112;
assert.equal(decide(3).kind,'return');
assert.equal(decide(3).requiresPilot,true);
flags[1].droppedFor=0; flags[1].x=750; flags[1].y=100;
flags[1].carrier=0;flags[1].x=150;flags[1].y=110;
assert.equal(decide(2).kind,'escort');
assert.deepEqual({...decide(2).point},{x:100,y:100});
assert.equal(decide(3).kind,'intercept','defender prioritizes a stolen Coral flag');
flags[1].carrier=null; flags[1].x=750; flags[1].y=100;
actors[1].x=145;actors[1].y=110; flags[1].droppedFor=2;flags[1].x=151;flags[1].y=110;
assert.equal(decide(1).kind,'return','nearby bot runner can recover own dropped flag');
assert.equal(decide(1).requiresPilot,true);
assert.equal(ai.choose({index:99,humanCount:1,actors,flags,bays}),null);
console.log('CTF_OBJECTIVE_AI_CONTRACT_PASS: human + runner/escort/defender roles, capture, stolen-flag interception, recoveries, carried flag escort, sane invalid inputs');
