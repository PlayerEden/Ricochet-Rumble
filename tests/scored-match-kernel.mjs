import assert from 'node:assert/strict';
import {
  SCORED_MATCH_PRESETS,createScoredMatch,recordPilotKO,recordScoredRespawn,
  advanceScoreClock,scoredOutcomeFor,chooseSafeScoreSpawn
} from '../game-data/rules/scored-match.v1.mjs';
let checks=0;
const ok=(label,fn)=>{fn();checks++;console.log('PASS '+label)};
const ffa=()=>createScoredMatch({mode:'ffa',playerCount:4,matchId:7,scoreTarget:10,clockSeconds:240});
const tdm=()=>createScoredMatch({mode:'teams',playerCount:4,teamIds:[0,1,0,1],matchId:9,scoreTarget:15,clockSeconds:300});
const hit=(m,a,v,n)=>recordPilotKO(m,{matchId:m.matchId,incidentId:'pilot:'+n,attacker:a,victim:v,kind:'pilot_ko'});
ok('Supported CQC/FFA/TDM score defaults are data-only, not auto-launched',()=>{
 assert.deepEqual(Object.keys(SCORED_MATCH_PRESETS),['cqc','scored_ffa','scored_tdm']);
 assert.equal(SCORED_MATCH_PRESETS.cqc.vehiclePolicy,'none');
 assert.equal(SCORED_MATCH_PRESETS.scored_tdm.scoreTarget,15);
});
ok('Initial scores and opponents are correctly initialized',()=>{
 const a=ffa(),b=tdm();
 assert.deepEqual(a.operatorKOs,[0,0,0,0]);assert.deepEqual(b.teamIds,[0,1,0,1]);
 assert.equal(a.elapsedSeconds,0);assert.equal(b.result,null);
 assert.equal(scoredOutcomeFor(b,0),'pending');
});
ok('Pilot KO counts one kill and one death',()=>{
 const m=hit(ffa(),0,1,1);
 assert.deepEqual(m.operatorKOs,[1,0,0,0]);
 assert.deepEqual(m.deaths,[0,1,0,0]);assert.equal(m.finished,false);
});
ok('Duplicate incident is ignored and original state remains immutable',()=>{
 const a=ffa(),b=hit(a,0,1,'dup'),c=hit(b,2,1,'dup');
 assert.equal(c,b);assert.deepEqual(a.operatorKOs,[0,0,0,0]);assert.ok(Object.isFrozen(b.operatorKOs));
});
ok('Armor hits, vehicle ejection, barrier block cannot award KO or death',()=>{
 const m=ffa();
 for(const kind of ['armor_hit','vehicle_eject','guard_block','miss']){
  const next=recordPilotKO(m,{matchId:m.matchId,incidentId:kind,attacker:0,victim:1,kind});
  assert.equal(next,m,kind);
 }
});
ok('Wrong match ID cannot credit stale bullet or another round',()=>{
 const m=ffa();
 assert.equal(recordPilotKO(m,{matchId:8,incidentId:'stale:1',attacker:0,victim:1,kind:'pilot_ko'}),m);
});
ok('Friendly fire does not score or count a death in teams',()=>{
 const m=tdm();
 assert.equal(hit(m,0,2,12),m);
 assert.deepEqual(m.operatorKOs,[0,0,0,0]);
});
ok('Self-death or environmental death gives no attacker KO',()=>{
 const m=ffa(),self=hit(m,0,0,1),env=hit(self,null,1,2);
 assert.deepEqual(env.operatorKOs,[0,0,0,0]);assert.deepEqual(env.deaths,[1,1,0,0]);
});
ok('Every valid respawn follows a death; no duplicate count',()=>{
 let m=hit(ffa(),1,0,1);
 m=recordScoredRespawn(m,{playerIndex:0});
 assert.deepEqual(m.respawns,[1,0,0,0]);
 assert.equal(recordScoredRespawn(m,{playerIndex:0}),m);
});
ok('FFA score target ends only when a player reaches cap',()=>{
 let m=ffa();
 for(let i=0;i<9;i++){m=hit(m,2,1,i);assert.equal(m.finished,false)}
 m=hit(m,2,1,9);assert.equal(m.finished,true);
 assert.equal(m.result.reason,'score_target');assert.equal(m.result.winningSide,2);
 assert.deepEqual(m.result.scores,[0,0,10,0]);
 assert.equal(scoredOutcomeFor(m,2),'victory');assert.equal(scoredOutcomeFor(m,0),'defeat');
 assert.equal(hit(m,0,2,'late'),m);
});
ok('TDM scores are aggregated across both allies, not per person',()=>{
 let m=tdm();
 for(let i=0;i<7;i++)m=hit(m,0,1,'blue-a'+i);
 for(let i=0;i<8;i++)m=hit(m,2,3,'blue-b'+i);
 assert.equal(m.finished,true);assert.deepEqual(m.result.scores,[15,0]);
 assert.equal(m.result.winningSide,0);
 assert.equal(scoredOutcomeFor(m,2),'victory');
 assert.equal(scoredOutcomeFor(m,1),'defeat');
});
ok('Timeout compares actual scores, independent of spare lives',()=>{
 let m=hit(ffa(),1,0,7);
 m=advanceScoreClock(m,239);assert.equal(m.finished,false);
 m=advanceScoreClock(m,1);assert.equal(m.finished,true);
 assert.equal(m.result.reason,'time_limit');assert.equal(m.result.winningSide,1);
 assert.equal(m.result.durationSeconds,240);
});
ok('Unresolved time-limit tie is DRAW, not an arbitrary player win',()=>{
 let m=tdm();
 m=hit(m,0,1,1);m=hit(m,1,2,2);
 m=advanceScoreClock(m,300);assert.equal(m.result.isDraw,true);
 assert.equal(m.result.winningSide,null);
 for(let i=0;i<4;i++)assert.equal(scoredOutcomeFor(m,i),'draw');
});
ok('Zero-score timeout tie is explicitly DRAW',()=>{
 const m=advanceScoreClock(ffa(),240);
 assert.equal(m.result.isDraw,true);assert.deepEqual(m.result.scores,[0,0,0,0]);
});
ok('Stopped clock is immutable after game conclusion',()=>{
 const m=advanceScoreClock(ffa(),240);
 assert.equal(advanceScoreClock(m,500),m);
});
ok('Mode invariants and unsupported team configurations fail early',()=>{
 assert.throws(()=>createScoredMatch({mode:'teams',playerCount:4,teamIds:[0,1,1,1],scoreTarget:15,clockSeconds:300,matchId:1}),/balanced/);
 assert.throws(()=>createScoredMatch({mode:'teams',playerCount:4,teamIds:[0,1],scoreTarget:15,clockSeconds:300,matchId:1}),/Blue\/Red/);
 assert.throws(()=>createScoredMatch({mode:'ffa',playerCount:4,scoreTarget:-1,clockSeconds:300,matchId:1}),/bounds/);
 assert.throws(()=>createScoredMatch({mode:'ffa',playerCount:4,scoreTarget:10,clockSeconds:300,matchId:0}),/matchId/);
 assert.throws(()=>advanceScoreClock(ffa(),-1),/delta/);
});
ok('Malformed incidents and out-of-range attacker/victim rejected',()=>{
 const m=ffa();
 assert.equal(recordPilotKO(m,{matchId:7,incidentId:' ',attacker:0,victim:1,kind:'pilot_ko'}),m);
 assert.throws(()=>hit(m,9,1,2),/attacker index/);
 assert.throws(()=>hit(m,0,9,2),/victim index/);
});
ok('Safe spawn rejects walls, occupied radius and bullets',()=>{
 const pool=[{x:10,y:10},{x:200,y:200},{x:400,y:400},{x:650,y:650}];
 const position=chooseSafeScoreSpawn(pool,{
  blocked:(x)=>x<50,actors:[{x:200,y:200}],bullets:[{x:400,y:410}],
  enemies:[{x:100,y:100}]
 });
 assert.deepEqual(position,{x:650,y:650});
});
ok('Safe spawn prioritizes cover and refuses unsafe fallback',()=>{
 const candidates=[{x:200,y:0},{x:200,y:300}];
 const safe=chooseSafeScoreSpawn(candidates,{
  enemies:[{x:0,y:0}],lineOfSight:(ex,ey,x,y)=>y===0
 });
 assert.deepEqual(safe,{x:200,y:300});
 const none=chooseSafeScoreSpawn([{x:10,y:10}],{
  enemies:[{x:20,y:10}],actors:[{x:12,y:10}]
 });
 assert.equal(none,null);
});
ok('Safe spawn tie-breaking is stable for deterministic replay',()=>{
 const v=Array.from({length:10},()=>chooseSafeScoreSpawn([{x:170,y:0},{x:-170,y:0}],{
  enemies:[{x:0,y:0}]
 }));
 assert.ok(v.every(p=>p.x===170));
});
console.log('PASS scored-match kernel: '+checks+' test groups. Pure mode rules only; not a live playable mode.');
