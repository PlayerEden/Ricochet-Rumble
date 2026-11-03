(function(root){'use strict';
/* D3-B2: pure host-authoritative JOIN NEXT protocol adapter.
   No socket, DOM, player-input, reward, match-state or side effects.
   Must not be treated as live wired until Android/Chromium acceptance. */
const MAX_SEQ=2147483600;
function chooseBoundary(room,series){
 if(!root.SectorLanRoom?.valid(room)||!['active','result'].includes(room.phase))return 'match';
 const future=series?.rounds===3&&Number.isInteger(series.round)&&series.round>=1&&series.round<3&&
  series.canAdvance===true&&series.matchId===room.matchId;
 return future?'round':'match';
}
function request(room,packet,series){
 const k=root.SectorLanRoom;
 if(!k?.valid(room)||!packet||packet.type!=='join-next'||packet.version!==1||
  packet.matchId!==room.matchId||packet.revision!==room.revision||
  packet.intent!=='queue'||room.peerRole!=='spectator')return null;
 const boundary=chooseBoundary(room,series);
 const next=k.requestQueue(room,{expectedRevision:packet.revision,matchId:packet.matchId,
  boundary,canAdvanceSeriesRound:boundary==='round'});
 return next?Object.freeze({room:next,reply:status(next)}):null;
}
function cancel(room,packet){
 const k=root.SectorLanRoom;
 if(!k?.valid(room)||!packet||packet.type!=='join-next'||packet.version!==1||
  packet.intent!=='cancel'||packet.matchId!==room.matchId||
  packet.revision!==room.revision||room.peerRole!=='queued')return null;
 const next=k.cancelQueue(room,{expectedRevision:packet.revision});
 return next?Object.freeze({room:next,reply:status(next)}):null;
}
function status(room){
 const k=root.SectorLanRoom;
 if(!k?.valid(room))return null;
 return Object.freeze({type:'seat-status',version:1,revision:room.revision,matchId:room.matchId,
  role:room.peerRole,queue:room.queue,phase:room.phase});
}
function acceptSeatInput(room,packet){
 const k=root.SectorLanRoom;
 if(!k?.valid(room)||!packet||packet.version!==1||packet.matchId!==room.matchId||
  packet.revision!==room.revision||!Number.isSafeInteger(packet.seq)||
  packet.seq<1||packet.seq>MAX_SEQ)return null;
 const kind=packet.type;
 if(!['input','fire-request','interact'].includes(kind))return null;
 return k.acceptGuestControl(room,{kind,matchId:packet.matchId,revision:packet.revision,seq:packet.seq});
}
function advance(room,{matchId,round=1}={}){
 const k=root.SectorLanRoom;
 if(!k?.valid(room)||!['lobby','result'].includes(room.phase))return null;
 const next=k.startRound(room,{matchId,round});
 if(!next)return null;
 return Object.freeze({room:next,reply:status(next),promoted:room.peerRole==='queued'&&next.peerRole==='player'});
}
root.SectorJoinNext=Object.freeze({chooseBoundary,request,cancel,status,acceptSeatInput,advance});
})(typeof window!=='undefined'?window:globalThis);
