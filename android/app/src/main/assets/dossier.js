/* FIELDGRID LOCAL DOSSIER v1 — data only. No commerce, remote identity, or runtime cosmetics.
 * Preserve malformed/unknown future storage without overwriting it. */
(function(){
'use strict';
const KEY='rr-dossier-v1',BACKUP='rr-dossier-v1-recovery-backup',VERSION=1,MAX=1000000000;
const MODES=['survival_ffa','survival_teams','cqc','scored_ffa','scored_tdm'];
const MODE_LABELS=Object.freeze({'survival_ffa':'Solo Survival','survival_teams':'Team Survival','cqc':'Close Quarters','scored_ffa':'Vehicle FFA','scored_tdm':'Team Deathmatch'});
const empty=()=>({schemaVersion:VERSION,matches:0,wins:0,losses:0,draws:0,kos:0,deaths:0,seconds:0,byMode:{},recentKeys:[]});
const clean=(n,max=MAX)=>Number.isSafeInteger(n)&&n>=0&&n<=max?n:0;
function normalized(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.schemaVersion!==VERSION)return null;
 const out=empty();
 for(const k of ['matches','wins','losses','draws','kos','deaths','seconds'])out[k]=clean(raw[k]);
 for(const id of MODES){
  const entry=raw.byMode?.[id];if(!entry||typeof entry!=='object'||Array.isArray(entry))continue;
  out.byMode[id]={};for(const k of ['matches','wins','losses','draws','kos','deaths','seconds'])out.byMode[id][k]=clean(entry[k]);
 }
 if(Array.isArray(raw.recentKeys))out.recentKeys=[...new Set(raw.recentKeys.filter(k=>typeof k==='string'&&k.length>=5&&k.length<=120))].slice(-64);
 return out;
}
function eligible(state){
 const s=normalized(state)||empty();
 // Existing game-data pilot_icons.v1.json catalog is CONCEPT ONLY, NOT AUTHORIZED for runtime or sale.
 // This is a non-entitlement eligibility preview, not unlock inventory.
 return [
  {id:'pilot.er.001',name:'First Responder',metric:'matches',current:s.matches,target:5,eligible:s.matches>=5,available:false},
  {id:'pilot.er.002',name:'Vehicle Recovery',metric:'recoveries',current:null,target:8,eligible:false,available:false},
  {id:'pilot.er.003',name:'Sector Veteran',metric:'wins',current:s.wins,target:12,eligible:s.wins>=12,available:false}
 ];
}
function validResult(r,key){
 if(!r||r.version!==1||!MODES.includes(r.matchModeId)||!['victory','defeat','draw'].includes(r.outcome))return false;
 if(typeof key!=='string'||key.length<5||key.length>120||!Number.isInteger(r.matchId)||r.matchId<=0)return false;
 if(!Number.isInteger(r.mazeSeed)||r.mazeSeed<=0||!Number.isFinite(r.durationSeconds)||r.durationSeconds<0||r.durationSeconds>3600)return false;
 for(const k of ['operatorKOs','deaths'])if(!Number.isInteger(r[k])||r[k]<0||r[k]>10000)return false;
 return true;
}
function addResult(data,r,key){
 const next=normalized(data);if(!next||!validResult(r,key))return null;
 if(next.recentKeys.includes(key))return null;
 const id=r.matchModeId,stats=next.byMode[id]||{matches:0,wins:0,losses:0,draws:0,kos:0,deaths:0,seconds:0};
 const outcome=r.outcome==='victory'?'wins':r.outcome==='defeat'?'losses':'draws';
 const secs=Math.floor(r.durationSeconds);
 for(const o of [next,stats]){
  o.matches=Math.min(MAX,o.matches+1);o[outcome]=Math.min(MAX,o[outcome]+1);
  o.kos=Math.min(MAX,o.kos+r.operatorKOs);o.deaths=Math.min(MAX,o.deaths+r.deaths);
  o.seconds=Math.min(MAX,o.seconds+secs);
 }
 next.byMode[id]=stats;next.recentKeys=[...next.recentKeys,key].slice(-64);
 return next;
}
function createStore(storage){
 let data=empty(),status='LOCAL STORAGE READY',writeAllowed=true,available=!!storage;
 let raw=null;
 try{raw=storage?.getItem(KEY)??null;}catch(_){available=false;writeAllowed=false;status='STORAGE BLOCKED · RESULTS CANNOT BE SAVED'}
 if(raw!==null){
  try{
   const parsed=JSON.parse(raw),candidate=normalized(parsed);
   if(candidate){data=candidate;}
   else if(parsed&&Number.isInteger(parsed.schemaVersion)&&parsed.schemaVersion>VERSION){
    writeAllowed=false;status='NEWER SAVE FORMAT · READ-ONLY TO PREVENT DATA LOSS';
   }else{
    // Preserve unknown, malformed or older saves before using a fresh v1 record.
    if(!available){writeAllowed=false;status='SAVE RECOVERY BLOCKED';}
    else try{if(storage.getItem(BACKUP)===null)storage.setItem(BACKUP,raw);status='INVALID SAVE BACKED UP · NEW DOSSIER';}catch(_){writeAllowed=false;status='SAVE RECOVERY NEEDS STORAGE · READ ONLY';}
   }
  }catch(_){
   try{if(storage.getItem(BACKUP)===null)storage.setItem(BACKUP,raw);status='DAMAGED SAVE BACKED UP · NEW DOSSIER';}
   catch(_){writeAllowed=false;status='DAMAGED SAVE · BACKUP FAILED · READ ONLY';}
  }
 }
 if(!available&&raw===null){writeAllowed=false;status='STORAGE UNAVAILABLE · RESULTS CANNOT BE SAVED';}
 return {
  get status(){return status},
  get canWrite(){return !!(available&&writeAllowed)},
  snapshot(){return normalized(data)},
  eligibility(){return eligible(data)},
  record(result,key){
   if(!available||!writeAllowed)return {ok:false,reason:'storage_unavailable'};
   if(data.recentKeys.includes(key))return {ok:false,reason:'duplicate'};
   const next=addResult(data,result,key);
   if(!next)return {ok:false,reason:'invalid_result'};
   try{storage.setItem(KEY,JSON.stringify(next));data=next;status='LOCAL STORAGE READY';return {ok:true,reason:'saved'};}
   catch(_){status='SAVE FAILED · RESULTS NOT RECORDED';return {ok:false,reason:'write_failed'};}
  }
 };
}
window.SectorDossier=Object.freeze({KEY,VERSION,MODES,MODE_LABELS,empty,normalized,addResult,validResult,eligible,createStore});
})();
