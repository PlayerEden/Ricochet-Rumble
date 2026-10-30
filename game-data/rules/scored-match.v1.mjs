// Sector Rebound / FIELDGRID scored match kernel v1.
// PURE, deterministic rule transitions: not registered with any live playlist.
// Match times are simulation seconds, NEVER wall-clock time. All events must
// originate from authoritative, successfully resolved pilot death events.
export const SCORED_MATCH_PRESETS = Object.freeze({
  cqc: Object.freeze({mode:'ffa',scoreTarget:10,clockSeconds:180,vehiclePolicy:'none'}),
  scored_ffa: Object.freeze({mode:'ffa',scoreTarget:10,clockSeconds:240,vehiclePolicy:'standard'}),
  scored_tdm: Object.freeze({mode:'teams',scoreTarget:15,clockSeconds:300,vehiclePolicy:'standard'})
});

function integer(n,from,to,label){
  if(!Number.isInteger(n)||n<from||n>to)throw new RangeError(label+' out of bounds');
  return n;
}
function checkIndex(index,n,label){
  if(!Number.isInteger(index)||index<0||index>=n)throw new RangeError(label+' index invalid');
  return index;
}
export function createScoredMatch({mode,playerCount,teamIds=null,scoreTarget,clockSeconds,matchId}){
  if(mode!=='ffa'&&mode!=='teams')throw new RangeError('unknown score mode');
  integer(playerCount,2,12,'playerCount');
  integer(scoreTarget,1,100,'scoreTarget');
  integer(clockSeconds,30,1800,'clockSeconds');
  if(!Number.isSafeInteger(matchId)||matchId<1)throw new RangeError('matchId required');
  let assigned;
  if(mode==='ffa'){
    assigned=Array.from({length:playerCount},(_,i)=>i);
  }else{
    if(!Array.isArray(teamIds)||teamIds.length!==playerCount||
       !teamIds.every(id=>id===0||id===1))
      throw new RangeError('teams need exact Blue/Red assignments');
    const blue=teamIds.filter(id=>id===0).length,red=teamIds.filter(id=>id===1).length;
    if(!blue||blue!==red)throw new RangeError('scored TDM requires balanced teams');
    assigned=[...teamIds];
  }
  return Object.freeze({
    version:1,mode,playerCount,matchId,teamIds:Object.freeze(assigned),
    scoreTarget,clockSeconds,elapsedSeconds:0,
    operatorKOs:Object.freeze(Array(playerCount).fill(0)),
    deaths:Object.freeze(Array(playerCount).fill(0)),
    respawns:Object.freeze(Array(playerCount).fill(0)),
    // Event ID is stable from combat engine / host sequence, NOT from animation.
    creditedIncidents:Object.freeze([]),
    finished:false,result:null
  });
}

function scoreTable(match){
  if(match.mode==='ffa')return [...match.operatorKOs];
  const table=[0,0];
  match.operatorKOs.forEach((kos,i)=>table[match.teamIds[i]]+=kos);
  return table;
}
function finish(match,reason){
  if(match.finished)return match;
  const scores=scoreTable(match),highest=Math.max(...scores);
  const leaders=scores.flatMap((score,i)=>score===highest?[i]:[]);
  // No automatic win for first-created team when two sides tie at timeout.
  const winningSide=leaders.length===1?leaders[0]:null;
  const frozenResult=Object.freeze({
    version:1,matchId:match.matchId,reason,mode:match.mode,
    winningSide,isDraw:winningSide===null,
    scores:Object.freeze(scores),operatorKOs:match.operatorKOs,
    deaths:match.deaths,respawns:match.respawns,
    scoreTarget:match.scoreTarget,clockSeconds:match.clockSeconds,
    durationSeconds:match.elapsedSeconds
  });
  return Object.freeze({...match,finished:true,result:frozenResult});
}

/**
 * Score exactly one REAL pilot death event.
 * kind=armor_hit, vehicle_eject, guard_block, miss and teammate damage are
 * intentionally never awarded score or a death. Invalid/duplicate incidents
 * are rejected with the unchanged immutable match object.
 */
export function recordPilotKO(match,{matchId,incidentId,attacker,victim,kind}){
  if(match.finished||matchId!==match.matchId||kind!=='pilot_ko')return match;
  if(typeof incidentId!=='string'||!/^[-a-zA-Z0-9_:]{1,80}$/.test(incidentId)||
     match.creditedIncidents.includes(incidentId))return match;
  checkIndex(victim,match.playerCount,'victim');
  if(attacker!==null)checkIndex(attacker,match.playerCount,'attacker');
  if(attacker!==null&&attacker!==victim&&match.mode==='teams'&&
     match.teamIds[attacker]===match.teamIds[victim])return match;
  const operatorKOs=[...match.operatorKOs],deaths=[...match.deaths];
  deaths[victim]++;
  if(attacker!==null&&attacker!==victim)operatorKOs[attacker]++;
  const updated=Object.freeze({...match,
    operatorKOs:Object.freeze(operatorKOs),deaths:Object.freeze(deaths),
    creditedIncidents:Object.freeze([...match.creditedIncidents,incidentId])
  });
  const scores=scoreTable(updated);
  return Math.max(...scores)>=match.scoreTarget?finish(updated,'score_target'):updated;
}
export function recordScoredRespawn(match,{playerIndex}){
  if(match.finished)return match;
  checkIndex(playerIndex,match.playerCount,'respawn');
  if(match.respawns[playerIndex]>=match.deaths[playerIndex])return match;
  const respawns=[...match.respawns];respawns[playerIndex]++;
  return Object.freeze({...match,respawns:Object.freeze(respawns)});
}
export function advanceScoreClock(match,deltaSeconds){
  if(match.finished)return match;
  if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)throw new RangeError('invalid match clock delta');
  const elapsedSeconds=Math.min(match.clockSeconds,match.elapsedSeconds+deltaSeconds);
  const updated=Object.freeze({...match,elapsedSeconds});
  return elapsedSeconds>=match.clockSeconds?finish(updated,'time_limit'):updated;
}
export function scoredOutcomeFor(match,playerIndex){
  checkIndex(playerIndex,match.playerCount,'player');
  if(!match.finished)return 'pending';
  if(match.result.isDraw)return 'draw';
  const side=match.mode==='teams'?match.teamIds[playerIndex]:playerIndex;
  return side===match.result.winningSide?'victory':'defeat';
}

/**
 * Pure spawn site selection. Caller supplies collision/line-of-sight functions
 * for the generated maze. Return null if no validated safe cell; DO NOT
 * teleport into a dangerous fallback position when all candidates fail.
 */
export function chooseSafeScoreSpawn(candidates,{
  enemies=[],actors=[],bullets=[],blocked=()=>false,lineOfSight=()=>false,
  recentDeaths=[]
}={}){
  if(!Array.isArray(candidates)||!Array.isArray(enemies)||!Array.isArray(actors)||
     !Array.isArray(bullets)||!Array.isArray(recentDeaths))throw new TypeError('spawn data must be arrays');
  function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  const eligible=candidates.flatMap((pos,index)=>{
    if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.y)||blocked(pos.x,pos.y))return [];
    if(actors.some(a=>distance(a,pos)<90)||bullets.some(b=>distance(b,pos)<65))return [];
    const minEnemy=enemies.length?Math.min(...enemies.map(e=>distance(e,pos))):1000;
    if(minEnemy<160)return [];
    const visible=enemies.filter(e=>distance(e,pos)<540&&lineOfSight(e.x,e.y,pos.x,pos.y)).length;
    const deaths=recentDeaths.filter(d=>distance(d,pos)<200).length;
    // Avoid direct LOS when an unseen alternative is available; keep a
    // deterministic best candidate if the generated maze has no hidden cell.
    const rank=Math.min(900,minEnemy)-visible*950-deaths*210;
    return [{pos:Object.freeze({x:pos.x,y:pos.y}),rank,index,visible}];
  });
  eligible.sort((a,b)=>b.rank-a.rank||a.index-b.index);
  return eligible.length?eligible[0].pos:null;
}
