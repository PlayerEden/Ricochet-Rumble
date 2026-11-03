import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
const root={};for(const name of ['lan-room.js','lan-join-next.js']){
 const a=fs.readFileSync('web/'+name,'utf8'),b=fs.readFileSync('android/app/src/main/assets/'+name,'utf8');
 assert.equal(a,b,'WebView mirror '+name);vm.runInNewContext(a,root);
}
const k=root.SectorLanRoom,j=root.SectorJoinNext;assert.ok(k&&j);
let count=0;const ok=(x,msg)=>{assert.ok(x,msg);count++};
const no=(x,msg)=>{assert.equal(x,null,msg);count++};
for(const size of [1,2,3])for(const side of ['cyan','coral']){
 let r=k.createRoom({teamSize:size,hostSide:side});r=k.connect(r);r=k.startRound(r,{matchId:11});
 const pkt={type:'join-next',version:1,intent:'queue',matchId:11,revision:r.revision};
 const series={rounds:3,round:1,canAdvance:true,matchId:11};
 const requested=j.request(r,pkt,series);ok(requested?.room.peerRole==='queued'&&requested.room.queue==='round','valid live round queue');
 ok(requested.reply.role==='queued'&&requested.reply.revision===requested.room.revision,'host revision status');
 no(j.request(r,{...pkt,revision:r.revision-1},series),'reject stale revision');
 no(j.request(r,{...pkt,matchId:12},series),'reject wrong match');
 no(j.request(r,{...pkt,version:2},series),'reject unsupported version');
 no(j.request(requested.room,{...pkt,revision:requested.room.revision},series),'reject duplicate queue');
 no(j.acceptSeatInput(requested.room,{type:'input',version:1,matchId:11,revision:requested.room.revision,seq:1}),'queue cannot drive bot');
 const canceled=j.cancel(requested.room,{...pkt,intent:'cancel',revision:requested.room.revision});
 ok(canceled?.room.peerRole==='spectator','cancel safely');
 no(j.cancel(requested.room,{...pkt,intent:'cancel',revision:r.revision}),'stale cancel rejected');
 let ended=k.finishRound(requested.room,{matchId:11});
 const moved=j.advance(ended,{matchId:12,round:2});
 ok(moved?.promoted&&moved.room.controllers[1]==='remote','promote at eligible next round');
 ok(k.roster(moved.room).teamIds[1]===k.roster(r).teamIds[1],'no faction swap');
 no(j.acceptSeatInput(moved.room,{type:'input',version:1,matchId:11,revision:moved.room.revision,seq:1}),'stale match input blocked');
 const accepted=j.acceptSeatInput(moved.room,{type:'input',version:1,matchId:12,revision:moved.room.revision,seq:1});
 ok(accepted?.lastPeerSeq===1,'fresh player input accepted');
 no(j.acceptSeatInput(accepted,{type:'fire-request',version:1,matchId:12,revision:accepted.revision,seq:1}),'replay rejected');
 const lost=k.disconnect(accepted);
 ok(lost.peerRole==='none'&&lost.controllers[1]==='bot','disconnect returns seat to AI');
 no(j.acceptSeatInput(lost,{type:'input',version:1,matchId:12,revision:lost.revision,seq:2}),'disconnected cannot control AI');
 let later=k.connect(lost);
 const matchQueue=j.request(later,{...pkt,revision:later.revision,matchId:12},{rounds:3,round:2,canAdvance:false,matchId:12});
 ok(matchQueue?.room.queue==='match','no false next round if series cannot advance');
 let finish=k.finishRound(matchQueue.room,{matchId:12});
 let next=j.advance(finish,{matchId:13,round:3});
 ok(next&&!next.promoted&&next.room.peerRole==='queued','next-match queue cannot join round 3');
 finish=k.finishRound(next.room,{matchId:13});const lobby=k.toLobby(finish);
 next=j.advance(lobby,{matchId:14,round:1});
 ok(next?.promoted&&next.room.peerRole==='player','next match promotion');
}
console.log('D3_B2_JOIN_NEXT_CONTRACT_PASS '+JSON.stringify({checks:count,teams:[1,2,3],sides:['cyan','coral'],liveWiring:false}));
