/* Sector Rebound / offline CTF flag rules v1.
 * Pure deterministic transitions. All positions are WORLD coordinates.
 * No networking or Dossier entitlements; no implicit "bot intelligence". */
(function(root){'use strict';
 const CAPTURES_TO_WIN=3, CLOCK_SECONDS=360, AUTO_RETURN_SECONDS=20;
 const PICKUP_RADIUS=27,RETURN_RADIUS=30,CAPTURE_RADIUS=49;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const flagHome=(flag)=>flag.carrier===null&&flag.droppedFor===0;
 function create(bays){
  if(!Array.isArray(bays)||bays.length!==2||bays.some((b,i)=>b.team!==i||!Number.isFinite(b.x)||!Number.isFinite(b.y)))
   throw new Error('CTF requires two valid opposite Forward Bays');
  return {version:1,elapsed:0,clock:CLOCK_SECONDS,target:CAPTURES_TO_WIN,
   scores:[0,0],flags:bays.map(b=>({team:b.team,home:{x:b.x,y:b.y},
    x:b.x,y:b.y,carrier:null,droppedFor:0})),
   seq:0,event:null,finished:false,winner:null,reason:null};
 }
 function emit(s,kind,team,actor=null){s.seq++;s.event={seq:s.seq,kind,team,actor};}
 function finish(s,reason){
  if(s.finished)return;
  s.finished=true;s.reason=reason;
  s.winner=s.scores[0]===s.scores[1]?null:s.scores[0]>s.scores[1]?0:1;
 }
 // Accept only actual actors, with server/game authority choosing actor index.
 // Idempotent death/boarding drop; never allow one pilot to carry two flags.
 function drop(state,actor,x,y){
  if(!state||state.finished||!Number.isInteger(actor)||actor<0||
   !Number.isFinite(x)||!Number.isFinite(y))return state;
  const f=state.flags.find(flag=>flag.carrier===actor);
  if(!f)return state;
  const s={...state,flags:state.flags.map(q=>({...q,home:{...q.home}}))};
  const item=s.flags[f.team];item.carrier=null;item.x=x;item.y=y;item.droppedFor=.0001;
  emit(s,'dropped',item.team,actor);return s;
 }
 function tick(state,actors,dt){
  if(!state||state.finished)return state;
  if(!Number.isFinite(dt)||dt<0||dt>10||!Array.isArray(actors))throw new RangeError('invalid CTF tick');
  const s={...state,scores:state.scores.slice(),
   flags:state.flags.map(f=>({...f,home:{...f.home}}))};
  s.elapsed=Math.min(s.clock,s.elapsed+dt);
  // A stolen flag follows its carrier, or drops if pilot is no longer valid.
  for(const flag of s.flags){
   if(flag.carrier!==null){
    const actor=actors[flag.carrier];
    if(!actor||!actor.alive||!actor.onFoot||actor.team===flag.team){
     flag.carrier=null;flag.droppedFor=.0001;
     emit(s,'dropped',flag.team,null);
    }else{flag.x=actor.x;flag.y=actor.y;}
   }else if(flag.droppedFor>0){
    flag.droppedFor+=dt;
    if(flag.droppedFor>=AUTO_RETURN_SECONDS){
     flag.x=flag.home.x;flag.y=flag.home.y;flag.droppedFor=0;
     emit(s,'returned',flag.team,null);
    }
   }
  }
  // Returns always precede pick-ups; a carrier cannot grab any other flag.
  for(let i=0;i<actors.length;i++){
   const actor=actors[i];
   if(!actor||!actor.alive||!actor.onFoot||!Number.isFinite(actor.x)||!Number.isFinite(actor.y))continue;
   if(actor.team!==0&&actor.team!==1)continue;
   for(const flag of s.flags)if(flag.team===actor.team&&flag.carrier===null&&
      flag.droppedFor>0&&distance(actor,flag)<RETURN_RADIUS){
      flag.x=flag.home.x;flag.y=flag.home.y;flag.droppedFor=0;
      emit(s,'returned',flag.team,i);
   }
  }
  for(let i=0;i<actors.length;i++){
   const actor=actors[i];
   // No bot flag grabs until objective-aware AI is explicitly implemented.
   if(!actor||!actor.alive||!actor.onFoot||actor.canCarry!==true||
     (actor.team!==0&&actor.team!==1)||!Number.isFinite(actor.x)||!Number.isFinite(actor.y))continue;
   if(s.flags.some(f=>f.carrier===i))continue;
   const other=s.flags[1-actor.team];
   if(other.carrier===null&&distance(actor,other)<PICKUP_RADIUS){
    other.carrier=i;other.droppedFor=0;other.x=actor.x;other.y=actor.y;
    emit(s,'picked',other.team,i);
   }
  }
  // A capture is allowed only while own flag is physically back at base.
  for(let i=0;i<actors.length;i++){
   const a=actors[i];if(!a||!a.alive||!a.onFoot||a.canCarry!==true||
      (a.team!==0&&a.team!==1))continue;
   const own=s.flags[a.team],other=s.flags[1-a.team];
   if(other.carrier!==i||!flagHome(own)||distance(a,own.home)>=CAPTURE_RADIUS)continue;
   s.scores[a.team]++;
   other.carrier=null;other.x=other.home.x;other.y=other.home.y;other.droppedFor=0;
   emit(s,'captured',a.team,i);
   if(s.scores[a.team]>=s.target)finish(s,'capture_target');
   break;
  }
  if(!s.finished&&s.elapsed>=s.clock)finish(s,'time_limit');
  return s;
 }
 root.SectorFlags=Object.freeze({create,tick,drop,flagHome,
  CAPTURES_TO_WIN,CLOCK_SECONDS,AUTO_RETURN_SECONDS});
})(typeof window!=='undefined'?window:globalThis);
