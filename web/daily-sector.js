/* Sector Rebound — opt-in offline Daily Sector contract.
 * Pure service; the normal game does NOT load it until a separately QA'd mode
 * integration exists. No network, clock enforcement, commerce or ranking. */
(function(root){'use strict';
 const KEY='rr-daily-sector-v1',VERSION=1,MAX_DAYS=31,MAX_RECENT=32;
 const isObject=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const datePattern=/^(20[2-9]\d|2100)-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
 function validDay(day){
  if(typeof day!=='string'||!datePattern.test(day))return false;
  const [y,m,d]=day.split('-').map(Number);
  const t=new Date(Date.UTC(y,m-1,d));
  return t.toISOString().slice(0,10)===day;
 }
 function utcDay(date=new Date()){
  try{const d=date instanceof Date?date:new Date(date);return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):null;}
  catch(_){return null;}
 }
 // Stable cross-device maze ID for a specific UTC date and rules version.
 // Changing the app's generator version should deliberately version this salt.
 function seedFor(day){
  if(!validDay(day))return null;
  let h=2166136261;
  for(const char of 'SECTOR-DAILY-v1/'+day)h=Math.imul(h^char.charCodeAt(0),16777619)>>>0;
  return (h&0x7fffffff)||1;
 }
 function rulesFor(day){
  const seed=seedFor(day);
  if(seed===null)return null;
  return Object.freeze({dailySector:true,dailyDate:day,dailySeed:seed,
   matchModeId:'scored_ffa',mapSize:'standard',botCount:3,botSkill:'normal',
   bulletCap:4,startLives:2,teamMode:'ffa',pilotMode:true,quickPlayMatch:false});
 }
 function asScore(result){
  if(!isObject(result)||!['victory','draw','defeat'].includes(result.outcome)||
    !integer(result.operatorKOs,0,10000)||!integer(result.deaths,0,10000)||
    !Number.isFinite(result.durationSeconds)||result.durationSeconds<0||result.durationSeconds>86400)return null;
  return {outcome:result.outcome,kos:result.operatorKOs,deaths:result.deaths,
   seconds:Math.floor(result.durationSeconds)};
 }
 const rank={defeat:0,draw:1,victory:2};
 function isBetter(candidate,best){
  if(!best)return true;
  if(rank[candidate.outcome]!==rank[best.outcome])return rank[candidate.outcome]>rank[best.outcome];
  if(candidate.kos!==best.kos)return candidate.kos>best.kos;
  if(candidate.deaths!==best.deaths)return candidate.deaths<best.deaths;
  return candidate.seconds<best.seconds;
 }
 function validScore(score){
  return isObject(score)&&['victory','draw','defeat'].includes(score.outcome)&&
   integer(score.kos,0,10000)&&integer(score.deaths,0,10000)&&integer(score.seconds,0,86400)&&
   Object.keys(score).every(k=>['outcome','kos','deaths','seconds'].includes(k));
 }
 function empty(){return {version:VERSION,days:{},recentKeys:[]};}
 function normalize(input){
  if(!isObject(input)||input.version!==VERSION||!isObject(input.days)||!Array.isArray(input.recentKeys))return null;
  if(Object.keys(input).some(k=>!['version','days','recentKeys'].includes(k)))return null;
  const days=Object.keys(input.days);
  if(days.length>MAX_DAYS)return null;
  for(const day of days){
   const row=input.days[day];
   if(!validDay(day)||!isObject(row)||!integer(row.attempts,1,100000)||!validScore(row.best)||
    Object.keys(row).some(k=>!['attempts','best'].includes(k)))return null;
  }
  if(input.recentKeys.length>MAX_RECENT||
   input.recentKeys.some(k=>typeof k!=='string'||k.length<1||k.length>96)||
   new Set(input.recentKeys).size!==input.recentKeys.length)return null;
  return {version:VERSION,days:Object.fromEntries(days.sort().map(k=>[k,{
   attempts:input.days[k].attempts,best:{...input.days[k].best}}])),
   recentKeys:input.recentKeys.slice()};
 }
 function read(storage){
  if(!storage||typeof storage.getItem!=='function')return null;
  try{const value=storage.getItem(KEY);return value===null?empty():normalize(JSON.parse(value));}
  catch(_){return null;}
 }
 function record(storage,day,result,attemptKey){
  if(!validDay(day)||typeof attemptKey!=='string'||!attemptKey.length||attemptKey.length>96)
   return {ok:false,reason:'INVALID_ATTEMPT'};
  const score=asScore(result),existing=read(storage);
  if(!score||!existing)return {ok:false,reason:'INVALID_RESULT_OR_STORAGE'};
  if(existing.recentKeys.includes(attemptKey)){
   return {ok:true,recorded:false,improved:false,entry:existing.days[day]||null};
  }
  const before=existing.days[day],improved=isBetter(score,before?.best);
  if(before?.attempts>=100000)return {ok:false,reason:'ATTEMPT_LIMIT'};
  existing.days[day]={attempts:(before?.attempts||0)+1,best:improved?score:before.best};
  for(const stale of Object.keys(existing.days).sort().slice(0,Math.max(0,Object.keys(existing.days).length-MAX_DAYS)))delete existing.days[stale];
  existing.recentKeys.push(attemptKey);
  existing.recentKeys=existing.recentKeys.slice(-MAX_RECENT);
  const serialized=JSON.stringify(existing);
  if(serialized.length>14000)return {ok:false,reason:'STORAGE_LIMIT'};
  try{
   storage.setItem(KEY,serialized);
   if(storage.getItem(KEY)!==serialized)return {ok:false,reason:'WRITE_UNVERIFIED'};
  }catch(_){return {ok:false,reason:'STORAGE_UNAVAILABLE'};}
  return {ok:true,recorded:true,improved,entry:existing.days[day]||null};
 }
 root.SectorDaily=Object.freeze({KEY,VERSION,MAX_DAYS,utcDay,validDay,seedFor,rulesFor,
  asScore,isBetter,normalize,read,record});
})(typeof window==='undefined'?globalThis:window);
