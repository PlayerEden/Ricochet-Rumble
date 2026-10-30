/* Sector Rebound offline backup v1.
 * User-directed text only: no cloud, upload, clipboard reads or Android permissions.
 * A recovery snapshot is committed before touching existing app storage. */
(function(root){'use strict';
const FORMAT='sector-rebound-local-v1',VERSION=1,MAX_INPUT=60000,RECOVERY_KEY='rr-restore-recovery-v1';
const KEYS=Object.freeze(['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1']);
const MISSING=Symbol('missing');
const modeIds=['survival_ffa','survival_teams','cqc','scored_ffa','scored_tdm'];
function object(x){return !!x&&typeof x==='object'&&!Array.isArray(x)}
function validJson(key,raw){
 if(typeof raw!=='string'||raw.length>30000||raw.length<2)return false;
 let obj;try{obj=JSON.parse(raw)}catch(_){return false}
 if(!object(obj))return false;
 if(key==='rr-options-v06'){
  if(!object(obj.settings)||!object(obj.comfort))return false;
  if(obj.playlist!==undefined&&(!object(obj.playlist)||obj.playlist.version!==1||!Array.isArray(obj.playlist.enabled)||obj.playlist.enabled.some(x=>!modeIds.includes(x))))return false;
  return true;
 }
 if(key==='rr-custom-v1')return obj.version===1&&object(obj.rules)&&modeIds.includes(obj.rules.modeId);
 if(key==='rr-custom-presets-v1')return obj.version===1&&Array.isArray(obj.entries)&&obj.entries.length<=5&&obj.entries.every(e=>object(e)&&typeof e.name==='string'&&e.name.length<=24&&object(e.rules)&&modeIds.includes(e.rules.modeId));
 if(key==='rr-dossier-v1'){
  if(obj.schemaVersion!==1||!object(obj.byMode)||!Array.isArray(obj.recentKeys)||obj.recentKeys.length>64)return false;
  if(!root.SectorDossier?.normalized(obj))return false;
  for(const n of ['matches','wins','losses','draws','kos','deaths','seconds'])if(!Number.isSafeInteger(obj[n])||obj[n]<0||obj[n]>1000000000)return false;
  if(obj.matches!==obj.wins+obj.losses+obj.draws)return false;
  return true;
 }
 return false;
}
function hasUnsupportedVersion(key,raw){
 try{const o=JSON.parse(raw);return key==='rr-dossier-v1'?Number.isInteger(o?.schemaVersion)&&o.schemaVersion>1:
  ['rr-custom-v1','rr-custom-presets-v1'].includes(key)?Number.isInteger(o?.version)&&o.version>1:
  key==='rr-options-v06'?Number.isInteger(o?.playlist?.version)&&o.playlist.version>1:false;}catch(_){return false}
}
function checkedEntries(text){
 if(typeof text!=='string'||text.length>MAX_INPUT||text.length<20)return {ok:false,error:'INVALID OR OVERSIZED BACKUP'};
 let data;try{data=JSON.parse(text)}catch(_){return {ok:false,error:'BACKUP TEXT IS NOT VALID JSON'}}
 if(!object(data)||data.format!==FORMAT||data.version!==VERSION||!object(data.entries))return {ok:false,error:'UNKNOWN BACKUP VERSION OR FORMAT'};
 const names=Object.keys(data.entries);
 if(!names.length||names.length>KEYS.length||names.some(k=>!KEYS.includes(k)))return {ok:false,error:'BACKUP CONTAINS UNKNOWN STORAGE KEYS'};
 if(names.some(k=>!validJson(k,data.entries[k])))return {ok:false,error:'BACKUP CONTAINS INVALID OR UNSUPPORTED DATA'};
 return {ok:true,entries:data.entries,names:names.filter(k=>KEYS.includes(k))};
}
function makeBackup(storage){
 if(!storage)return {ok:false,error:'DEVICE STORAGE UNAVAILABLE'};
 const entries={};try{
  for(const k of KEYS){
   const raw=storage.getItem(k);
   if(raw===null)continue;
   if(!validJson(k,raw))return {ok:false,error:'EXISTING '+k+' CANNOT BE SAFELY EXPORTED'};
   entries[k]=raw;
  }
 }catch(_){return {ok:false,error:'STORAGE READ FAILED'}}
 if(!Object.keys(entries).length)return {ok:false,error:'NO SAVED SETTINGS OR MATCH DATA YET'};
 return {ok:true,text:JSON.stringify({format:FORMAT,version:VERSION,entries},null,2),count:Object.keys(entries).length};
}
function previewImport(storage,text){
 const parsed=checkedEntries(text);if(!parsed.ok)return parsed;
 if(!storage)return {ok:false,error:'DEVICE STORAGE UNAVAILABLE'};
 try{for(const k of parsed.names){
  const old=storage.getItem(k);
  if(old!==null&&hasUnsupportedVersion(k,old))return {ok:false,error:'NEWER LOCAL '+k+' IS PROTECTED: NO OVERWRITE'};
 }}catch(_){return {ok:false,error:'CANNOT READ EXISTING DATA'}}
 return {...parsed,willReplace:parsed.names.filter(k=>storage.getItem(k)!==null)};
}
function restore(storage,text){
 const pre=previewImport(storage,text);if(!pre.ok)return pre;
 const previous={};let wroteRecovery=false;
 try{
  for(const k of pre.names)previous[k]=storage.getItem(k);
  // Recovery copy of every targeted pre-existing value is committed *before* first mutation.
  storage.setItem(RECOVERY_KEY,JSON.stringify({format:FORMAT,version:VERSION,entries:previous}));
  if(!storage.getItem(RECOVERY_KEY))throw Error('recovery_write');
  wroteRecovery=true;
  for(const k of pre.names){storage.setItem(k,pre.entries[k]);if(storage.getItem(k)!==pre.entries[k])throw Error('verify_write')}
  return {ok:true,count:pre.names.length,message:'RESTORED '+pre.names.length+' LOCAL RECORDS · RELOAD TO APPLY'};
 }catch(_){
  if(wroteRecovery){try{for(const k of pre.names){if(previous[k]===null)storage.removeItem(k);else storage.setItem(k,previous[k])}}catch(__){return {ok:false,error:'RESTORE INTERRUPTED; RECOVERY SNAPSHOT SAVED UNDER '+RECOVERY_KEY}}}
  return {ok:false,error:wroteRecovery?'RESTORE FAILED; PREVIOUS DATA RECOVERED':'COULD NOT SAVE PRE-RESTORE RECOVERY COPY'};
 }
}
root.SectorBackup=Object.freeze({FORMAT,VERSION,KEYS,RECOVERY_KEY,validJson,checkedEntries,makeBackup,previewImport,restore});
})(window);
