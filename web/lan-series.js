(function(root){'use strict';
// Opt-in LAN TDM series coordinator. One winner per finished, unique match ID.
// A draw consumes one of at most three rounds, never awards either faction.
function createSeries(rounds=3){
 if(rounds!==3)throw new RangeError('only best-of-three series supported');
 return Object.freeze({version:1,rounds:3,round:1,wins:Object.freeze([0,0]),
  completedMatchId:null,concluded:false,winner:null});
}
function valid(series,{matchId=null,finished=null}={}){
 if(!series||series.version!==1||series.rounds!==3||
   !Number.isInteger(series.round)||series.round<1||series.round>3||
   !Array.isArray(series.wins)||series.wins.length!==2||
   !series.wins.every(n=>Number.isInteger(n)&&n>=0&&n<=2)||
   typeof series.concluded!=='boolean')return false;
 const recorded=series.completedMatchId!==null;
 if(recorded&&(!Number.isSafeInteger(series.completedMatchId)||series.completedMatchId<1))return false;
 if(matchId!==null&&recorded&&series.completedMatchId!==matchId)return false;
 if(finished!==null&&recorded!==finished)return false;
 const total=series.wins[0]+series.wins[1];
 if(total>series.round-(recorded?0:1)||(!recorded&&series.concluded))return false;
 const shouldEnd=recorded&&(series.wins.some(w=>w>=2)||series.round===series.rounds);
 if(series.concluded!==shouldEnd)return false;
 const leader=series.wins[0]===series.wins[1]?null:series.wins[0]>series.wins[1]?0:1;
 if(series.concluded){
  if(series.winner!==leader)return false;
 }else if(series.winner!==null)return false;
 return true;
}
function awardRound(series,{matchId,winningSide}){
 if(!valid(series)||series.completedMatchId!==null||series.concluded||
  !Number.isSafeInteger(matchId)||matchId<1||
  (winningSide!==null&&winningSide!==0&&winningSide!==1))return series;
 const wins=[...series.wins];if(winningSide!==null)wins[winningSide]++;
 const concluded=wins.some(x=>x>=2)||series.round>=series.rounds;
 const winner=concluded?(wins[0]===wins[1]?null:wins[0]>wins[1]?0:1):null;
 return Object.freeze({...series,wins:Object.freeze(wins),completedMatchId:matchId,concluded,winner});
}
function nextRound(series){
 if(!valid(series)||series.completedMatchId===null||series.concluded)return null;
 return Object.freeze({...series,round:series.round+1,completedMatchId:null});
}
root.SectorLanSeries=Object.freeze({createSeries,valid,awardRound,nextRound});
})(typeof window!=='undefined'?window:globalThis);
