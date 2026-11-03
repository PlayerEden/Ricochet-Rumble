import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const web=new URL('../web/lan-room.js',import.meta.url);
const android=new URL('../android/app/src/main/assets/lan-room.js',import.meta.url);
const source=fs.readFileSync(web,'utf8');
assert.equal(source,fs.readFileSync(android,'utf8'),'Web/Android room code must mirror');
const context={};
vm.runInNewContext(source,context);
const k=context.SectorLanRoom;
assert.ok(k,'D3-A0 host-owned room kernel exported');
function expectOk(r,message){assert.equal(k.valid(r),true,message);return r}
function sameArray(a,b,message){assert.deepEqual(Array.from(a),Array.from(b),message)}
function refuses(action,message){assert.equal(action,null,message)}
let cases=0;
for(const teamSize of [1,2,3])for(const hostSide of ['cyan','coral']){
 const room=expectOk(k.createRoom({teamSize,hostSide}));
 const roster=k.roster(room);
 const colors=Array.from({length:teamSize*2},(_,i)=>(i%2)^(hostSide==='coral'?1:0));
 sameArray(roster.teamIds,colors,'frozen faction order across sizes');
 sameArray(roster.controllers,['local',...Array(teamSize*2-1).fill('bot')],'vacant remote seat has active AI');
 assert.equal(roster.humans,1);assert.equal(roster.bots,teamSize*2-1);
 assert.equal(k.status(room).roomState,'OPEN');
 assert.equal(k.status(room).guestStatus,'AVAILABLE');
 assert.equal(Object.isFrozen(room),true);
 assert.equal(Object.isFrozen(roster.controllers),true);
 assert.equal(k.roster(room).teamIds[0],hostSide==='coral'?1:0);
 cases+=10;
}
assert.throws(()=>k.createRoom({teamSize:4}),e=>e?.name==='RangeError');
assert.throws(()=>k.createRoom({hostSide:'purple'}),e=>e?.name==='RangeError');
let room=expectOk(k.createRoom({teamSize:2,hostSide:'coral'}));
refuses(k.finishRound(room,{matchId:1}),'cannot finish lobby');
refuses(k.requestQueue(room,{expectedRevision:1,matchId:null}),'no spectator can queue');
let spectator=expectOk(k.connect(room));
assert.equal(spectator.peerRole,'spectator');
assert.equal(k.status(spectator).guestStatus,'SPECTATING');
refuses(k.connect(spectator),'second peer must not steal slot');
refuses(k.requestQueue(spectator,{expectedRevision:1,matchId:null}),'stale room revision rejected');
refuses(k.requestQueue(spectator,{expectedRevision:spectator.revision,matchId:null,boundary:'round',canAdvanceSeriesRound:true}),'round requires active series');
let queued=expectOk(k.requestQueue(spectator,{expectedRevision:spectator.revision,matchId:null,boundary:'match'}));
assert.equal(k.status(queued).guestStatus,'NEXT MATCH');
refuses(k.requestQueue(queued,{expectedRevision:queued.revision,matchId:null}),'duplicate request rejected');
refuses(k.cancelQueue(queued,{expectedRevision:queued.revision+1}),'stale cancel rejected');
let canceled=expectOk(k.cancelQueue(queued,{expectedRevision:queued.revision}));
assert.equal(canceled.peerRole,'spectator');
assert.equal(canceled.queue,null);
refuses(k.acceptGuestControl(canceled,{kind:'input',revision:canceled.revision,matchId:1,seq:1}),'spectator cannot send gameplay input');
const first=expectOk(k.startRound(room,{matchId:5,round:1}));
assert.equal(k.status(first).roomState,'IN MATCH');
assert.equal(k.status(first).humans,1,'host-alone match is really 1 human');
sameArray(k.roster(first).controllers,['local','bot','bot','bot']);
refuses(k.startRound(first,{matchId:6,round:2}),'cannot start while combat active');
refuses(k.finishRound(first,{matchId:4}),'wrong match cannot close');
const end=expectOk(k.finishRound(first,{matchId:5}));
refuses(k.finishRound(end,{matchId:5}),'duplicate results do not advance twice');
const r2=expectOk(k.startRound(end,{matchId:6,round:2}));
assert.equal(r2.round,2);
assert.equal(k.status(r2).bots,3);
const r2end=expectOk(k.finishRound(r2,{matchId:6}));
const r3=expectOk(k.startRound(r2end,{matchId:7,round:3}));
refuses(k.startRound(k.finishRound(r3,{matchId:7}),{matchId:8,round:4}),'fourth series round rejected');
const newSeries=expectOk(k.startRound(k.finishRound(r3,{matchId:7}),{matchId:8,round:1}));
assert.equal(newSeries.round,1);
refuses(k.startRound(end,{matchId:5,round:1}),'duplicate match ID rejected');
const lobby=expectOk(k.toLobby(end));
assert.equal(lobby.matchId,null);
assert.equal(lobby.lastMatchId,5);
refuses(k.toLobby(lobby),'only a result may return to lobby');

let active=expectOk(k.startRound(spectator,{matchId:20,round:1}));
refuses(k.acceptGuestControl(active,{kind:'fire-request',revision:active.revision,matchId:20,seq:1}),'spectator cannot shoot');
const qRound=expectOk(k.requestQueue(active,{boundary:'round',canAdvanceSeriesRound:true,
 expectedRevision:active.revision,matchId:20}));
assert.equal(qRound.peerRole,'queued');
assert.equal(k.roster(qRound).humans,1,'queue cannot mutate active match');
assert.equal(k.roster(qRound).teamIds[1],0,'guest faction preassigned even when AI driven');
refuses(k.acceptGuestControl(qRound,{kind:'interact',revision:qRound.revision,matchId:20,seq:1}),'queued player cannot interact');
const afterRound=expectOk(k.finishRound(qRound,{matchId:20}));
const human=expectOk(k.startRound(afterRound,{matchId:21,round:2}));
assert.equal(human.peerRole,'player');
assert.equal(k.roster(human).humans,2);
sameArray(k.roster(human).controllers,['local','remote','bot','bot'],'AI seat promoted at boundary');
sameArray(k.roster(human).teamIds,k.roster(qRound).teamIds,'promotion does not change factions');
refuses(k.acceptGuestControl(human,{kind:'input',matchId:20,revision:human.revision,seq:1}),'stale match input rejected');
refuses(k.acceptGuestControl(human,{kind:'input',matchId:21,revision:human.revision-1,seq:1}),'stale room revision rejected');
refuses(k.acceptGuestControl(human,{kind:'state',matchId:21,revision:human.revision,seq:1}),'guest cannot forge authoritative state');
let accepted=expectOk(k.acceptGuestControl(human,{kind:'input',matchId:21,revision:human.revision,seq:10}));
assert.equal(accepted.lastPeerSeq,10);
assert.equal(accepted.revision,human.revision,'input does not change room revision or require heartbeat sync');
const seq11=expectOk(k.acceptGuestControl(accepted,{kind:'fire-request',matchId:21,
 revision:accepted.revision,seq:11}));
assert.equal(seq11.revision,accepted.revision,'consecutive packets use stable room revision');
assert.equal(seq11.lastPeerSeq,11);
refuses(k.acceptGuestControl(seq11,{kind:'interact',matchId:21,revision:seq11.revision,seq:11}),'replayed guest command rejected');

refuses(k.acceptGuestControl(accepted,{kind:'input',matchId:21,revision:accepted.revision,seq:10}),'replayed sequence denied');
refuses(k.acceptGuestControl(accepted,{kind:'input',matchId:21,revision:accepted.revision,seq:11.5}),'noninteger seq denied');
assert.equal(k.roster(accepted).humans,2);
let dropped=expectOk(k.disconnect(accepted));
sameArray(k.roster(dropped).controllers,['local','bot','bot','bot'],'lost player returns to AI');
assert.equal(k.roster(dropped).humans,1);
assert.equal(dropped.phase,'active','host combat stays active after peer disconnect');
assert.equal(dropped.lastPeerSeq,0,'stale guest input invalidated');
assert.equal(k.disconnect(dropped),dropped,'second disconnect idempotent');
refuses(k.acceptGuestControl(dropped,{kind:'input',matchId:21,revision:dropped.revision,seq:50}),'disconnected guest cannot control AI');
let rejoin=expectOk(k.connect(dropped));
assert.equal(rejoin.peerRole,'spectator','rejoin never steals live pilot');
refuses(k.requestQueue(rejoin,{boundary:'round',expectedRevision:rejoin.revision,
 matchId:21,canAdvanceSeriesRound:false}),'clinched series cannot queue a non-existent round');
const lateQueue=expectOk(k.requestQueue(rejoin,{boundary:'match',expectedRevision:rejoin.revision,matchId:21}));
const nextResult=expectOk(k.finishRound(lateQueue,{matchId:21}));
const nextRoundNoPromotion=expectOk(k.startRound(nextResult,{matchId:22,round:3}));
assert.equal(nextRoundNoPromotion.peerRole,'queued','next-MATCH queue must not enter intermediate round');
assert.equal(k.roster(nextRoundNoPromotion).humans,1);
const result=expectOk(k.finishRound(nextRoundNoPromotion,{matchId:22}));
const afterLobby=expectOk(k.toLobby(result));
assert.equal(afterLobby.peerRole,'queued');
const promoted=expectOk(k.startRound(afterLobby,{matchId:23,round:1}));
assert.equal(promoted.peerRole,'player','next match joins successfully');
assert.equal(k.status(promoted).guestStatus,'PLAYING');

let closed=expectOk(k.close(promoted));
assert.equal(k.status(closed).roomState,'OFFLINE');
refuses(k.connect(closed),'closed room must not accept another peer');
refuses(k.startRound(closed,{matchId:24,round:1}),'closed room cannot restart');
assert.equal(k.close(closed),closed,'closing twice does not mutate');
for(const tampered of [
 {...promoted,version:1},{...promoted,revision:0},
 {...promoted,controllers:['remote','local']},
 {...promoted,controllers:['local','bot']},
 {...promoted,peerRole:'queued',queue:null},
 {...promoted,peerRole:'spectator'},
 {...promoted,round:4},{...promoted,matchId:19},
 {...promoted,teamSize:8},{...promoted,lastPeerSeq:-1},
 {...closed,peerRole:'player'},{...closed,phase:'active'}
])assert.equal(k.valid(tampered),false,'tampered room rejected');
assert.ok(cases>=60);
console.log('PASS D3-A0 room kernel: 1v1/2v2/3v3 AI seats, Cyan/Coral, repeat rounds, spectators, queue/cancel, promotion, stale replay rejection, disconnect AI takeover and close');
