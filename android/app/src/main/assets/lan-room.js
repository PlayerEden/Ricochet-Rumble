(function(root){'use strict';
/*
 * D3-A0: pure, host-owned LAN room/actor control contract.
 * No sockets, DOM, persistence, gameplay state or network side effects.
 * D3-A1 wires this into the live engine. Until then v0.9.71 behavior stays intact.
 */
const PHASES=['lobby','active','result','closed'];
const ROLES=['none','spectator','queued','player'];
const BOUNDARIES=['round','match'];
const KINDS=['input','fire-request','interact'];
const MAX_SEQ=2147483600;
function frozen(input){
 const controllers=Object.freeze([...input.controllers]);
 return Object.freeze({...input,controllers});
}
function createRoom({teamSize=1,hostSide='cyan'}={}){
 if(![1,2,3].includes(teamSize)||!['cyan','coral'].includes(hostSide))
  throw new RangeError('room requires 1-3 players per team and CYAN or CORAL host');
 return frozen({version:2,revision:1,phase:'lobby',teamSize,hostSide,
  controllers:['local','bot'],peerRole:'none',queue:null,matchId:null,
  lastMatchId:0,round:0,lastPeerSeq:0});
}
function valid(r){
 if(!r||r.version!==2||!Number.isSafeInteger(r.revision)||r.revision<1||
  !PHASES.includes(r.phase)||![1,2,3].includes(r.teamSize)||
  !['cyan','coral'].includes(r.hostSide)||!Array.isArray(r.controllers)||
  r.controllers.length!==2||r.controllers[0]!=='local'||
  !['bot','remote'].includes(r.controllers[1])||!ROLES.includes(r.peerRole)||
  !Number.isSafeInteger(r.lastMatchId)||r.lastMatchId<0||
  !Number.isInteger(r.round)||r.round<0||r.round>3||
  !Number.isSafeInteger(r.lastPeerSeq)||r.lastPeerSeq<0||r.lastPeerSeq>MAX_SEQ)return false;
 if(r.phase==='lobby'&&r.round!==0)return false;
 if(r.phase==='active'||r.phase==='result'){
  if(!Number.isSafeInteger(r.matchId)||r.matchId<1||
    r.lastMatchId!==r.matchId||r.round<1)return false;
 }else if(r.matchId!==null)return false;
 if((r.peerRole==='player')!==(r.controllers[1]==='remote'))return false;
 if(r.peerRole==='queued'){
  if(!BOUNDARIES.includes(r.queue)||r.phase==='closed')return false;
 }else if(r.queue!==null)return false;
 if(r.peerRole==='none'&&r.lastPeerSeq!==0)return false;
 if(r.phase==='closed'&&(r.peerRole!=='none'||r.queue!==null||
   r.controllers[1]!=='bot'||r.round!==0))return false;
 return true;
}
function next(r,patch){
 if(!valid(r))return null;
 const updated=frozen({...r,...patch,revision:r.revision+1});
 return valid(updated)?updated:null;
}
function connect(r){
 if(!valid(r)||r.phase==='closed'||r.peerRole!=='none')return null;
 return next(r,{peerRole:'spectator',lastPeerSeq:0});
}
function requestQueue(r,{expectedRevision,matchId,boundary='match',canAdvanceSeriesRound=false}={}){
 if(!valid(r)||r.peerRole!=='spectator'||r.phase==='closed'||
   expectedRevision!==r.revision||matchId!==r.matchId||
   !BOUNDARIES.includes(boundary))return null;
 if(boundary==='round'&&(!['active','result'].includes(r.phase)||
    r.round>=3||canAdvanceSeriesRound!==true))return null;
 return next(r,{peerRole:'queued',queue:boundary});
}
function cancelQueue(r,{expectedRevision}={}){
 if(!valid(r)||r.peerRole!=='queued'||r.revision!==expectedRevision)return null;
 return next(r,{peerRole:'spectator',queue:null});
}
function startRound(r,{matchId,round=1}={}){
 if(!valid(r)||!['lobby','result'].includes(r.phase)||
   !Number.isSafeInteger(matchId)||matchId<=r.lastMatchId||
   !Number.isInteger(round)||round<1||round>3)return null;
 if(round>1&&(r.phase!=='result'||round!==r.round+1))return null;
 const promote=r.peerRole==='queued'&&(r.queue==='round'||round===1);
 return next(r,{phase:'active',matchId,lastMatchId:matchId,round,
  peerRole:promote?'player':r.peerRole,queue:promote?null:r.queue,
  controllers:['local',promote||r.peerRole==='player'?'remote':'bot'],
  lastPeerSeq:0});
}
function finishRound(r,{matchId}={}){
 if(!valid(r)||r.phase!=='active'||r.matchId!==matchId)return null;
 return next(r,{phase:'result'});
}
function toLobby(r){
 if(!valid(r)||r.phase!=='result')return null;
 // A queued spectator keeps their place; an active peer remains reserved.
 return next(r,{phase:'lobby',matchId:null,round:0,lastPeerSeq:0,
  queue:r.queue==='round'?'match':r.queue});
}
function disconnect(r){
 if(!valid(r)||r.phase==='closed')return null;
 if(r.peerRole==='none')return r;
 // If the guest disappears during combat, host can hand its unchanged
 // faction seat to AI after clearing native guest input (D3-A1/C).
 return next(r,{peerRole:'none',queue:null,
  controllers:['local','bot'],lastPeerSeq:0});
}
function close(r){
 if(!valid(r))return null;
 if(r.phase==='closed')return r;
 return next(r,{phase:'closed',peerRole:'none',queue:null,
  controllers:['local','bot'],matchId:null,round:0,lastPeerSeq:0});
}
function roster(r){
 if(!valid(r))return null;
 const total=r.teamSize*2,side=r.hostSide==='coral'?1:0;
 const teamIds=Array.from({length:total},(_,i)=>(i%2)^side);
 const controllers=Array.from({length:total},(_,i)=>i===0?'local':
  i===1?r.controllers[1]:'bot');
 return Object.freeze({teamIds:Object.freeze(teamIds),
  controllers:Object.freeze(controllers),humans:controllers.filter(v=>v!=='bot').length,
  bots:controllers.filter(v=>v==='bot').length});
}
function status(r){
 if(!valid(r))return null;
 const slots=roster(r);
 return Object.freeze({protocol:2,revision:r.revision,
  phase:r.phase,round:r.round,matchId:r.matchId,
  roomState:r.phase==='active'?'IN MATCH':r.phase==='result'?'AFTER ACTION':
   r.phase==='lobby'?'OPEN':'OFFLINE',
  teamSize:r.teamSize,hostSide:r.hostSide,humans:slots.humans,bots:slots.bots,
  guestStatus:r.peerRole==='none'?'AVAILABLE':r.peerRole==='spectator'?'SPECTATING':
   r.peerRole==='queued'?'NEXT '+r.queue.toUpperCase():'PLAYING'});
}
function acceptGuestControl(r,{kind,matchId,revision,seq}={}){
 if(!valid(r)||r.phase!=='active'||r.peerRole!=='player'||
  r.controllers[1]!=='remote'||!KINDS.includes(kind)||
  matchId!==r.matchId||revision!==r.revision||
  !Number.isSafeInteger(seq)||seq<=r.lastPeerSeq||seq>MAX_SEQ)return null;
 return next(r,{lastPeerSeq:seq});
}
root.SectorLanRoom=Object.freeze({createRoom,valid,connect,requestQueue,
 cancelQueue,startRound,finishRound,toLobby,disconnect,close,roster,status,acceptGuestControl});
})(typeof window!=='undefined'?window:globalThis);
