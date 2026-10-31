(()=>{'use strict';
let W=960,H=600;const START_LIVES=5,STEP=1/60;
const PREF_KEY='rr-options-v06'; // Preserve existing options across this patch.
const CUSTOM_PREF_KEY='rr-custom-v1';
const DOSSIER_SESSION=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let dossierStore=null,dossierAttemptedKey='',roundUnlocks=[];
function currentDossier(){return dossierStore?.snapshot()||window.SectorDossier?.empty()||null;}
function dossierLines(){
 const info=currentDossier(),eligible=dossierStore?.eligibility()||[],modes=window.SectorDossier?.MODE_LABELS||{};
 if(!info)return;
 for(const key of ['matches','wins','losses','draws','kos','deaths']){const el=document.getElementById('dossier-'+key);if(el)el.textContent=String(info[key]||0)}
 const time=document.getElementById('dossier-time');if(time)time.textContent=Math.floor((info.seconds||0)/60)+' MIN';
 const availability=document.getElementById('dossier-save-status');if(availability)availability.textContent=dossierStore?.status||'STORAGE NOT AVAILABLE';
 const list=document.getElementById('dossier-modes');if(list){list.replaceChildren();for(const [id,label] of Object.entries(modes)){
  const row=document.createElement('div');row.className='dossier-mode';const name=document.createElement('span');name.textContent=label;
  const score=document.createElement('strong'),stats=info.byMode[id]||{};score.textContent=(stats.matches||0)+' MATCHES · '+(stats.wins||0)+' WINS';
  row.append(name,score);list.appendChild(row);
 }}
 const goals=document.getElementById('dossier-eligibility');if(goals){goals.replaceChildren();for(const entry of eligible){
  const row=document.createElement('div');row.className='dossier-mode';const name=document.createElement('span');name.textContent=entry.name;
  const progress=document.createElement('strong');progress.textContent=entry.current===null?'TRACKING NOT AVAILABLE':entry.current+'/'+entry.target+(entry.eligible?' · REQUIREMENT MET':'');
  row.append(name,progress);goals.appendChild(row);
 }}
}
function openDossier(){setPanel(document.getElementById('dossier-template').innerHTML);dossierLines();
 const mark=document.getElementById('dossier-emblem-mark'),name=document.getElementById('dossier-emblem-name');
 if(mark)mark.textContent=OPERATOR_EMBLEMS[equippedEmblem].glyph;
 if(name)name.textContent=OPERATOR_EMBLEMS[equippedEmblem].label;
}
function refreshHangar(){
 const status=document.getElementById('hangar-status');
 if(status)status.textContent='EQUIPPED · '+HANGAR_PAINTS[equippedPaint].label+' · SOLO ONLY';
 for(const el of document.querySelectorAll('[data-action="equip-paint"]')){
  const id=el.dataset.paintId,selected=id===equippedPaint,unlock=paintProgress(id);
  el.classList.toggle('selected',selected);
  el.classList.toggle('locked',!unlock.eligible);
  el.disabled=!unlock.eligible;
  if(typeof el.setAttribute==='function'){
   el.setAttribute('aria-pressed',String(selected));
   el.setAttribute('aria-label',HANGAR_PAINTS[id]?.label+' · '+(unlock.eligible?'AVAILABLE':'LOCKED · '+unlock.current+' OF '+unlock.target+' '+unlock.metric.toUpperCase()));
  }
  const label=el.querySelector?.('small');
  if(label&&unlock.target)label.textContent=unlock.eligible?'UNLOCKED':unlock.current+' / '+unlock.target+' '+unlock.metric.toUpperCase();
 }
 const emblemStatus=document.getElementById('emblem-status');
 if(emblemStatus)emblemStatus.textContent='OPERATOR INSIGNIA · '+OPERATOR_EMBLEMS[equippedEmblem].glyph+' '+OPERATOR_EMBLEMS[equippedEmblem].label;
 for(const el of document.querySelectorAll('[data-action="equip-emblem"]')){
  const id=el.dataset.emblemId,def=OPERATOR_EMBLEMS[id],progress=emblemProgress(id),selected=id===equippedEmblem;
  el.classList.toggle('selected',selected);
  el.classList.toggle('locked',!progress.eligible);
  el.disabled=!progress.eligible;
  el.setAttribute?.('aria-pressed',String(selected));
  el.setAttribute?.('aria-label',def.label+' · '+(progress.eligible?'AVAILABLE':'LOCKED · '+progress.current+' OF '+progress.target+' '+progress.metric.toUpperCase()));
  const small=el.querySelector?.('small');
  if(small)small.textContent=progress.target?(progress.eligible?'UNLOCKED':progress.current+' / '+progress.target+' '+progress.metric.toUpperCase()):'STANDARD ISSUE';
 }
}
function openHangar(){setPanel(document.getElementById('hangar-template').innerHTML);refreshHangar();}
let pendingRestoreText='';
function openBackupScreen(){pendingRestoreText='';setPanel(document.getElementById('backup-template').innerHTML);}
function backupNotice(message){const el=document.getElementById('backup-message');if(el)el.textContent=message;}
function localBackupStorage(){try{return window.localStorage}catch(_){return null}}
function doBackupAction(action){
 const backups=window.SectorBackup;
 if(!backups){backupNotice('BACKUP MODULE NOT AVAILABLE');return}
 if(action==='backup-export'){
  const result=backups.makeBackup(localBackupStorage());
  if(!result.ok){backupNotice(result.error);return}
  const el=document.getElementById('backup-output');if(el)el.value=result.text;
  backupNotice('READY: '+result.count+' SAVED RECORDS · COPY AND STORE THIS TEXT BEFORE UNINSTALL');
 }
 if(action==='backup-copy'){
  const el=document.getElementById('backup-output');if(!el||!el.value){backupNotice('GENERATE BACKUP TEXT FIRST');return}
  el.focus();el.select();
  let copied=false;try{copied=!!document.execCommand('copy')}catch(_){}
  backupNotice(copied?'COPIED · SAVE THE TEXT OUTSIDE THE GAME':'TEXT SELECTED · USE YOUR DEVICE COPY MENU');
 }
 if(action==='backup-preview'){
  pendingRestoreText='';
  const btn=document.getElementById('backup-restore');if(btn)btn.disabled=true;
  const code=document.getElementById('backup-import')?.value||'';
  const result=backups.previewImport(localBackupStorage(),code);
  if(!result.ok){backupNotice(result.error);return}
  pendingRestoreText=code;if(btn)btn.disabled=false;
  backupNotice('VALID BACKUP: '+result.names.length+' RECORDS · '+result.willReplace.length+' EXISTING WILL BE REPLACED. SAVE CURRENT DATA FIRST, THEN CONFIRM.');
 }
 if(action==='backup-restore'){
  const current=document.getElementById('backup-import')?.value||'';
  if(!pendingRestoreText||current!==pendingRestoreText){backupNotice('BACKUP TEXT CHANGED · PREVIEW IT AGAIN');pendingRestoreText='';const btn=document.getElementById('backup-restore');if(btn)btn.disabled=true;return}
  pendingRestoreText='';
  const btn=document.getElementById('backup-restore');if(btn)btn.disabled=true;
  const result=backups.restore(localBackupStorage(),current);
  backupNotice(result.ok?'RESTORE COMPLETE · RELOADING LOCAL DATA':result.error);
  if(result.ok)window.location.reload();
 }
}


const CUSTOM_PRESETS_KEY='rr-custom-presets-v1';
let comfort={sound:true,music:true,shake:false,autoFire:false,leftHanded:false},fixedAccumulator=0;
let selectedRules={botCount:2,bulletCap:4,startLives:2,teamMode:'ffa',botSkill:'normal',mapSize:'small'};
// v0.9.22 / Slice A: stable solo presets backed by CURRENT survival combat, not proposed score modes.
const MATCH_MODE_PRESETS=Object.freeze({
 survival_ffa:Object.freeze({id:'survival_ffa',label:'SOLO SURVIVAL',teamMode:'ffa',objective:'last_side_standing',vehiclePolicy:'existing',allowedSizes:Object.freeze(['small','standard','large'])}),
 survival_teams:Object.freeze({id:'survival_teams',label:'TEAM SURVIVAL',teamMode:'teams',objective:'last_side_standing',vehiclePolicy:'existing',allowedSizes:Object.freeze(['small','standard','large'])})
});
const RELEASED_MATCH_MODES=Object.freeze(Object.keys(MATCH_MODE_PRESETS)); // Defaults remain existing Survival modes.
// CQC is an EXPLICIT test button, NOT silently added to approved survival playlists.
const CQC_RULES=Object.freeze({mode:'ffa',scoreTarget:10,clockSeconds:180,vehiclePolicy:'none'});
const VEHICLE_FFA_RULES=Object.freeze({mode:'ffa',scoreTarget:10,clockSeconds:240,vehiclePolicy:'standard'});
const VEHICLE_TDM_RULES=Object.freeze({mode:'teams',scoreTarget:15,clockSeconds:300,vehiclePolicy:'standard'});
const SCORED_MATCH_RULES=Object.freeze({cqc:CQC_RULES,scored_ffa:VEHICLE_FFA_RULES,scored_tdm:VEHICLE_TDM_RULES});
// V1 Survival selections remain valid. Scored modes are deliberate opt-in, never default.
const QUICK_PLAY_OPT_IN_MODES=Object.freeze(['cqc','scored_ffa','scored_tdm']);
const QUICK_PLAY_MODE_IDS=Object.freeze([...RELEASED_MATCH_MODES,...QUICK_PLAY_OPT_IN_MODES]);
let selectedPlaylistIds=RELEASED_MATCH_MODES.slice(),playlistBag=[],lastSoloModeId=null,matchSerial=0;

const CUSTOM_MODE_IDS=Object.freeze(['survival_ffa','survival_teams','cqc','scored_ffa','scored_tdm']);
const CUSTOM_DEFAULT=Object.freeze({modeId:'survival_ffa',mapSize:'standard',botCount:2,botSkill:'normal',startLives:2,bulletCap:4});
let customDraft={...CUSTOM_DEFAULT};

const CUSTOM_PRESET_LIMIT=5,CUSTOM_PRESET_NAME_LIMIT=24;
let customPresets=[],pendingPresetDelete='';
function cleanPresetName(raw){
 if(typeof raw!=='string')return '';
 const name=raw.replace(/[\u0000-\u001f\u007f-\u009f]/g,'').replace(/\s+/g,' ').trim();
 return [...name].length<=CUSTOM_PRESET_NAME_LIMIT?name:'';
}
function normalizeCustomPresets(raw){
 if(!Array.isArray(raw))return [];
 const safe=[],seen=new Set();
 for(const entry of raw){
  if(!entry||typeof entry!=='object'||Array.isArray(entry))continue;
  const name=cleanPresetName(entry.name),key=name.toLocaleLowerCase();
  if(!name||seen.has(key)||!entry.rules||typeof entry.rules!=='object'||Array.isArray(entry.rules))continue;
  // Explicitly require a supported mode ID; other stale/invalid fields fall back
  // to the existing bounded custom rule validator on load.
  if(!CUSTOM_MODE_IDS.includes(entry.rules.modeId))continue;
  safe.push({name,rules:normalizeCustomDraft(entry.rules)});seen.add(key);
  if(safe.length===CUSTOM_PRESET_LIMIT)break;
 }
 return safe;
}
function loadCustomPresets(){
 try{const saved=JSON.parse(window.localStorage?.getItem(CUSTOM_PRESETS_KEY)||'null');
  customPresets=saved?.version===1?normalizeCustomPresets(saved.entries):[];
 }catch(_){customPresets=[]}
 pendingPresetDelete='';return customPresets.map(p=>({name:p.name,rules:{...p.rules}}));
}
function persistCustomPresets(entries){
 try{if(!window.localStorage?.setItem)return false;window.localStorage.setItem(CUSTOM_PRESETS_KEY,JSON.stringify({version:1,entries}));return true}catch(_){return false}
}
function saveNamedCustomPreset(rawName){
 const name=cleanPresetName(rawName);
 if(!name)return {ok:false,message:'ENTER A NAME (1–24 CHARACTERS)'};
 const key=name.toLocaleLowerCase();
 if(customPresets.some(p=>p.name.toLocaleLowerCase()===key))return {ok:false,message:'NAME ALREADY SAVED · CHOOSE ANOTHER'};
 if(customPresets.length>=CUSTOM_PRESET_LIMIT)return {ok:false,message:'FIVE PRESETS MAX · DELETE ONE FIRST'};
 const next=[...customPresets,{name,rules:normalizeCustomDraft(customDraft)}];
 if(!persistCustomPresets(next))return {ok:false,message:'SAVE FAILED · DEVICE STORAGE UNAVAILABLE'};
 customPresets=next;pendingPresetDelete='';return {ok:true,message:'SAVED · '+name};
}
function loadNamedCustomPreset(name){
 const item=customPresets.find(p=>p.name===name);
 if(!item)return {ok:false,message:'CHOOSE A SAVED PRESET'};
 setCustomDraft(item.rules);pendingPresetDelete='';
 return {ok:true,message:'LOADED · '+item.name};
}
function deleteNamedCustomPreset(name){
 const item=customPresets.find(p=>p.name===name);
 if(!item)return {ok:false,message:'CHOOSE A SAVED PRESET'};
 if(pendingPresetDelete!==name){pendingPresetDelete=name;return {ok:false,message:'TAP DELETE AGAIN TO REMOVE · '+name};}
 const next=customPresets.filter(p=>p.name!==name);
 if(!persistCustomPresets(next))return {ok:false,message:'DELETE FAILED · DEVICE STORAGE UNAVAILABLE'};
 customPresets=next;pendingPresetDelete='';return {ok:true,message:'DELETED · '+name};
}
function resetCustomDraft(){pendingPresetDelete='';return setCustomDraft({...CUSTOM_DEFAULT})}
function customPresetStatus(message){const el=document.getElementById('custom-preset-status');if(el)el.textContent=message;}
function refreshCustomPresetUI(preferredName){
 const select=document.getElementById('custom-preset-select');if(!select)return;
 const current=preferredName??select.value;
 select.replaceChildren();
 const empty=document.createElement('option');empty.value='';empty.textContent=customPresets.length?'CHOOSE SAVED PRESET':'NO PRESETS SAVED';select.appendChild(empty);
 for(const p of customPresets){const opt=document.createElement('option');opt.value=p.name;opt.textContent=p.name;select.appendChild(opt)}
 select.value=customPresets.some(p=>p.name===current)?current:'';
 const chosen=!!select.value;
 for(const id of ['custom-preset-load','custom-preset-delete']){const button=document.getElementById(id);if(button)button.disabled=!chosen}
 const count=document.getElementById('custom-preset-count');if(count)count.textContent=customPresets.length+'/'+CUSTOM_PRESET_LIMIT+' SAVED ON THIS DEVICE';
}

function normalizeCustomDraft(raw){
 const p=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const choose=(key,values)=>values.includes(p[key])?p[key]:CUSTOM_DEFAULT[key];
 return {modeId:choose('modeId',CUSTOM_MODE_IDS),mapSize:choose('mapSize',['small','standard','large']),
 botCount:choose('botCount',[0,1,2,3,4]),botSkill:choose('botSkill',['casual','normal','spicy']),
 startLives:choose('startLives',[2,3,5]),bulletCap:choose('bulletCap',[1,2,3,4,5,8])};
}
function saveCustomDraft(){try{window.localStorage?.setItem(CUSTOM_PREF_KEY,JSON.stringify({version:1,rules:customDraft}))}catch(_){}return {...customDraft}}
function loadCustomDraft(){try{const p=JSON.parse(window.localStorage?.getItem(CUSTOM_PREF_KEY)||'null');if(p?.version===1)customDraft=normalizeCustomDraft(p.rules)}catch(_){}return {...customDraft}}
function setCustomDraft(patch){customDraft=normalizeCustomDraft({...customDraft,...patch});pendingPresetDelete='';return saveCustomDraft()}
function customOptionsFor(raw=customDraft){
 const d=normalizeCustomDraft(raw),scored=SCORED_MATCH_RULES[d.modeId];
 if(scored)return {...selectedRules,matchModeId:d.modeId,customMatch:true,pilotMode:true,
  mapSize:d.modeId==='cqc'?'small':'standard',botCount:3,botSkill:d.botSkill,
  bulletCap:4,startLives:2,teamMode:scored.mode==='teams'?'teams':'ffa'};
 const base={...selectedRules,mapSize:d.mapSize,botCount:d.botCount,botSkill:d.botSkill,
  bulletCap:d.bulletCap,startLives:d.startLives,teamMode:d.modeId==='survival_teams'?'teams':'ffa'};
 return {...soloOptionsFor(d.modeId,base),customMatch:true};
}
function refreshCustomUI(){
 const root=document.getElementById('custom-match');if(!root)return;
 const ids={modeId:'custom-mode',mapSize:'custom-size',botCount:'custom-bots',botSkill:'custom-skill',startLives:'custom-lives',bulletCap:'custom-shells'};
 const scored=!!SCORED_MATCH_RULES[customDraft.modeId],options=customOptionsFor();
 for(const [key,id] of Object.entries(ids)){
  const el=document.getElementById(id);
  if(el)el.value=String(scored&&['mapSize','botCount','startLives','bulletCap'].includes(key)?options[key]:customDraft[key]);
 }
 for(const id of ['custom-size','custom-bots','custom-lives','custom-shells']){const el=document.getElementById(id);if(el)el.disabled=scored}
 const count=options.botCount,p=document.getElementById('custom-preview');
 if(p)p.textContent=soloModeLabel(options)+' · '+options.mapSize.toUpperCase()+' · '+(count?count+1+' COMBATANTS':'PRACTICE · NO OPPONENTS')+' · '+(scored?'SCORE '+SCORED_MATCH_RULES[customDraft.modeId].scoreTarget+' KOs / '+SCORED_MATCH_RULES[customDraft.modeId].clockSeconds/60+' MIN':'LAST SIDE STANDING');
 const note=document.getElementById('custom-rule-note');
 if(note)note.textContent=scored?'SCORED TEST PRESET: MAP, BOTS, LIVES AND SHELLS LOCKED; AI SKILL ADJUSTABLE.':customDraft.modeId==='survival_teams'&&customDraft.botCount===1?'TEAM SURVIVAL: 1 BOT SETTING DEPLOYS 2 (ALLY + ENEMY).':'CASUAL · SAVED SEPARATELY FROM QUICK PLAY';
}
function readCustomScreen(){
 if(!document.getElementById('custom-match'))return {...customDraft};
 const ids={modeId:'custom-mode',mapSize:'custom-size',botCount:'custom-bots',botSkill:'custom-skill',startLives:'custom-lives',bulletCap:'custom-shells'},patch={};
 for(const [key,id] of Object.entries(ids)){const el=document.getElementById(id);if(!el||el.disabled)continue;patch[key]=['botCount','startLives','bulletCap'].includes(key)?Number(el.value):el.value}
 return setCustomDraft(patch);
}
function openCustomScreen(){setPanel(document.getElementById('custom-template').innerHTML);refreshCustomUI();refreshCustomPresetUI();}

function normalizePlaylistModes(ids){
 if(!Array.isArray(ids))return RELEASED_MATCH_MODES.slice();
 return QUICK_PLAY_MODE_IDS.filter(id=>ids.includes(id));
}
function setPlaylistModes(ids){
 const next=normalizePlaylistModes(ids);
 if(next.join('|')!==selectedPlaylistIds.join('|')){selectedPlaylistIds=next;playlistBag=[];}
 return selectedPlaylistIds.slice();
}
function nextPlaylistMode(random=Math.random){
 if(!selectedPlaylistIds.length)return null;
 playlistBag=playlistBag.filter(id=>selectedPlaylistIds.includes(id));
 if(!playlistBag.length){
  playlistBag=selectedPlaylistIds.slice();
  for(let i=playlistBag.length-1;i>0;i--){
   const raw=Number(random());const j=Math.min(i,Math.max(0,Math.floor((Number.isFinite(raw)?raw:0)* (i+1))));
   [playlistBag[i],playlistBag[j]]=[playlistBag[j],playlistBag[i]];
  }
  if(playlistBag.length>1&&playlistBag[0]===lastSoloModeId){
   const index=playlistBag.findIndex(id=>id!==lastSoloModeId);
   [playlistBag[0],playlistBag[index]]=[playlistBag[index],playlistBag[0]];
  }
 }
 const id=playlistBag.shift();
 lastSoloModeId=id;
 return id;
}
function soloOptionsFor(id,base=selectedRules){
 const preset=MATCH_MODE_PRESETS[id];if(!preset)return null;
 // Team Survival needs an ally AND a foe. Preserve intentionally empty
 // zero-bot practice instead of silently creating opposition.
 const teamBotMinimum=preset.teamMode==='teams'&&base.botCount>0?Math.max(2,base.botCount):base.botCount;
 return {...base,botCount:teamBotMinimum,teamMode:preset.teamMode,matchModeId:id,pilotMode:true};
}
function quickPlayOptionsFor(id,base=selectedRules){
 const scored=SCORED_MATCH_RULES[id];
 if(scored)return {...base,matchModeId:id,pilotMode:true,quickPlayMatch:true,
  mapSize:id==='cqc'?'small':'standard',botCount:3,bulletCap:4,startLives:2,
  teamMode:scored.mode==='teams'?'teams':'ffa'};
 const survival=soloOptionsFor(id,base);
 return survival?{...survival,quickPlayMatch:true}:null;
}
function freshSectorSeed(previous=0){
 let s=Math.floor(Math.random()*0x7fffffff)||1;
 if(s===previous)s=s===0x7ffffffe?1:s+1;
 return s;
}
function soloModeLabel(config){return config?.matchModeId==='cqc'?'CLOSE QUARTERS':config?.matchModeId==='scored_ffa'?'SCORED FREE-FOR-ALL':config?.matchModeId==='scored_tdm'?'TEAM DEATHMATCH':MATCH_MODE_PRESETS[config?.matchModeId]?.label||'SURVIVAL';}
function isScoredMatch(){return !!state?.scored&&!!SCORED_MATCH_RULES[state?.config?.matchModeId];}
function isCqcMatch(){return state?.config?.matchModeId==='cqc'&&isScoredMatch();}
function isScoredVehicleMatch(){return isScoredMatch()&&(state.config.matchModeId==='scored_ffa'||state.config.matchModeId==='scored_tdm');}

// W/H are the camera canvas resolution. Mazes have much larger world coordinates.
let worldW=W,worldH=H,mazeGrid=null,currentArena=-1,currentSeed=0,currentMapSize='';const camera={x:0,y:0,zoom:null};
// Spatial buckets keep projectile and bot collision checks local, even in Maze XL.
const WALL_BUCKET=128;let wallLookup=new Map();
function rebuildWallLookup(){wallLookup=new Map();for(const w of wallSet){const x0=Math.floor(w.x/WALL_BUCKET),x1=Math.floor((w.x+w.w)/WALL_BUCKET),y0=Math.floor(w.y/WALL_BUCKET),y1=Math.floor((w.y+w.h)/WALL_BUCKET);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const key=x+','+y;if(!wallLookup.has(key))wallLookup.set(key,[]);wallLookup.get(key).push(w)}}}
function nearWall(x,y,r){const x0=Math.floor((x-r)/WALL_BUCKET),x1=Math.floor((x+r)/WALL_BUCKET),y0=Math.floor((y-r)/WALL_BUCKET),y1=Math.floor((y+r)/WALL_BUCKET);for(let yb=y0;yb<=y1;yb++)for(let xb=x0;xb<=x1;xb++){const nearby=wallLookup.get(xb+','+yb);if(nearby)for(const w of nearby){const nx=Math.max(w.x,Math.min(x,w.x+w.w)),ny=Math.max(w.y,Math.min(y,w.y+w.h));if((x-nx)**2+(y-ny)**2<r*r)return true}}return false}
const PALETTE=['#46d2f5','#fc856e','#ffdc77','#b69aff','#82e6a1','#fc8bde'];
const gameNames=['CYAN','CORAL','GOLD','VIOLET','MINT','PINK'];
// No map picker: every match is a newly generated connected battlefield.
const MAP_SIZES={small:{cols:9,rows:6,cell:132},standard:{cols:13,rows:9,cell:132},large:{cols:18,rows:12,cell:132}};
const ARENAS=[{name:'FIELDGRID',maze:MAP_SIZES.standard}];
const VEHICLE_TYPES={tank:{name:'TANK',armor:3,speed:1,fireCooldown:.36,projectileSpeed:415,bulletCap:4},mech:{name:'MECH',armor:4,speed:.76,fireCooldown:.62,projectileSpeed:355,bulletCap:3}};
const MAX_VEHICLES=10;
const PICKUPS={rapid:{label:'R',name:'RAPID FIRE',color:'#ffd46d',duration:7},turbo:{label:'»',name:'TURBO',color:'#76efaf',duration:6},guard:{label:'B',name:'BARRIER',color:'#b59aff',duration:4},overcharge:{label:'C',name:'CAPACITOR',color:'#7bdbff',duration:6},repair:{label:'H',name:'FIELD REPAIR',color:'#f6ba8b',duration:0}};
const pickupSpots=[[480,300],[195,300],[765,300],[372,300],[587,300],[390,90],[570,510],[395,520],[560,90]];
const canvas=document.getElementById('arena'),ctx=canvas.getContext('2d');
// Viewport owns the arena resolution, not a fixed 960:600 content window.
// Clamp render pixel density for stable Android GPU memory/frame pacing.
function resizeArenaCanvas(){
 const vw=Number(window.innerWidth),vh=Number(window.innerHeight);
 if(!Number.isFinite(vw)||!Number.isFinite(vh)||vw<280||vh<200)return false;
 W=Math.round(vw);H=Math.round(vh);
 const dpr=Math.min(1.6,Math.max(1,Number(window.devicePixelRatio)||1));
 canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
 if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
 return true;
}
window.addEventListener('resize',resizeArenaCanvas);
window.addEventListener('orientationchange',resizeArenaCanvas);
const menu=document.getElementById('menu'),panel=document.getElementById('panel'),toast=document.getElementById('toast');
let wallSet=[],bumpers=[];
const colors=PALETTE,pressed=new Set(),touch=new Set();
const stick={x:0,y:0,pointerId:null};
// CQC mobile: right FIRE thumb can drag to aim while left thumb steers.
const fireAim={pointerId:null,source:null,startX:0,startY:0,x:0,y:0,active:false};
// Tactical scored-FFA test: let bounced shells work ahead of the tank.
// Other modes and all shell speeds, bounce rules and caps remain untouched.
// Thumb-comfort experiment: modestly slower hull, much calmer maximum slew.
// Keep CQC pilot, shells, normal Survival and LAN on their accepted rules.
// This pass deliberately slows FFA hulls a little, but aims more than it moves:
// No separate AIM pad now the movement joystick's center-pivot steering is approved.
// Preserve the slower scored vehicle pace, turn cap and existing shell mechanics.
const SCORED_FFA_VEHICLE_PACE=Object.freeze({human:166,bot:136,turnRate:2.6});
const SOLO_PILOT_TURN_RATE=6.5; // owner-approved CQC speed; experimental parity for offline Solo Survival
const CQC_PILOT_HIT_RADIUS=17.5; // modestly forgiving for ALL CQC pilots, not homing
let mode='idle',connected=false,paused=true,lastTime=performance.now(),sendTimer=0,snapshotTimer=0,toastTimer=0,botTimer=0,hudTimer=0;
const botBrains=new Map();
let state=null;let guestInput={moveX:0,moveY:0,fire:false};
// LAN input arrives ~20 times/sec. If packets stop without a TCP disconnect,
// the host must not keep applying the last guest's movement/FIRE indefinitely.
// 0.4s tolerates several delayed messages without granting ghost controls.
const LAN_GUEST_INPUT_TIMEOUT=.4;
let guestInputAge=Infinity;
function neutralizeGuestInput(){
 guestInput={moveX:0,moveY:0,fire:false};
 guestInputAge=Infinity;
}
// Host-authoritative LAN pilot input. Explicit axes are accepted only as a
// finite unit vector; malformed/partial aim can NEVER cause NaN rotation.
function normalizeLanInput(raw){
 const axis=k=>Number.isFinite(raw?.[k])?clamp(raw[k],-1,1):0;
 let moveX=axis('moveX'),moveY=axis('moveY');
 const mag=Math.hypot(moveX,moveY);if(mag>1){moveX/=mag;moveY/=mag;}
 const input={moveX,moveY,fire:raw?.fire===true};
 if(Number.isFinite(raw?.aimX)&&Number.isFinite(raw?.aimY)){
  const x=clamp(raw.aimX,-1,1),y=clamp(raw.aimY,-1,1),size=Math.hypot(x,y);
  if(size>.6){input.aimX=x/size;input.aimY=y/size;}
 }
 return input;
}
let particles=[],screenKick=0,damagePulse=0,fxSeq=0,lastRemoteFxId=0,visualClock=0;
const keys1={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',fire:'Space'},keys2={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',fire:'Enter'};
const fireCooldown=Array(6).fill(0);
let resultCuePlayed=false;
let coachEnabled=false,coachRemaining=0,coachPilotShown=false,coachSupplyShown=false;
let quietContactSeconds=0,radarReminderShown=false;
function value(id,fallback,min,max){const raw=document.getElementById(id)?.value;const n=Number(raw);return raw!==''&&raw!=null&&Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
function readSettings(){const prev=selectedRules;return {mapSize:MAP_SIZES[document.getElementById('map-size')?.value]?document.getElementById('map-size').value:prev.mapSize,botCount:value('bot-count',prev.botCount,0,4),bulletCap:value('bullet-cap',prev.bulletCap,1,8),startLives:value('lives-choice',prev.startLives,1,10),teamMode:['ffa','coop','teams'].includes(document.getElementById('team-choice')?.value)?document.getElementById('team-choice').value:prev.teamMode,botSkill:['casual','normal','spicy'].includes(document.getElementById('bot-skill')?.value)?document.getElementById('bot-skill').value:prev.botSkill};}
function savePrefs(){selectedRules=readSettings();
 const inputs=[...document.querySelectorAll('input[data-playlist-mode]')];
 if(inputs.length)setPlaylistModes(inputs.filter(el=>el.checked).map(el=>el.dataset.playlistMode));
 try{window.localStorage?.setItem(PREF_KEY,JSON.stringify({settings:selectedRules,comfort,playlist:{version:1,enabled:selectedPlaylistIds}}));}catch(_){}
 applyPlaylistUI();
}
function applyPlaylistUI(){
 for(const el of document.querySelectorAll('input[data-playlist-mode]'))el.checked=selectedPlaylistIds.includes(el.dataset.playlistMode);
 for(const button of document.querySelectorAll('[data-action="solo"],[data-action="settings-play"]'))button.disabled=!selectedPlaylistIds.length;
 const status=document.getElementById('playlist-status');
 if(status){const count=selectedPlaylistIds.length,scored=selectedPlaylistIds.filter(id=>QUICK_PLAY_OPT_IN_MODES.includes(id)).length;
   status.textContent=!count?'SELECT AT LEAST ONE MODE':count+' SELECTED · '+(scored?scored+' SCORING TRIAL'+(scored===1?'':'S')+' ENABLED':'SURVIVAL MODES ONLY');
 }
}
function loadPrefs(){try{const p=JSON.parse(window.localStorage?.getItem(PREF_KEY)||'null');if(p){const st=p.settings||{};selectedRules={mapSize:MAP_SIZES[st.mapSize]?st.mapSize:'small',botCount:Number.isInteger(st.botCount)&&st.botCount>=0&&st.botCount<=4?st.botCount:2,bulletCap:[1,2,3,4,5,8].includes(st.bulletCap)?st.bulletCap:4,startLives:[2,3,5].includes(st.startLives)?st.startLives:2,teamMode:['ffa','coop','teams'].includes(st.teamMode)?st.teamMode:'ffa',botSkill:['casual','normal','spicy'].includes(st.botSkill)?st.botSkill:'normal'};for(const key of Object.keys(comfort))if(typeof p.comfort?.[key]==='boolean')comfort[key]=p.comfort[key];if(p.playlist?.version===1&&Array.isArray(p.playlist.enabled))setPlaylistModes(p.playlist.enabled)}}catch(_){}loadCustomDraft();loadCustomPresets();applyPrefsToUI()}
function applyPrefsToUI(){const picks={mapSize:selectedRules.mapSize,botCount:selectedRules.botCount,bulletCap:selectedRules.bulletCap,startLives:selectedRules.startLives,teamMode:selectedRules.teamMode,botSkill:selectedRules.botSkill};const ids={mapSize:'map-size',botCount:'bot-count',bulletCap:'bullet-cap',startLives:'lives-choice',teamMode:'team-choice',botSkill:'bot-skill'};for(const [key,id] of Object.entries(ids)){const el=document.getElementById(id);if(el&&el.options&&[...el.options].some(o=>o.value===String(picks[key])))el.value=String(picks[key])}for(const key of Object.keys(comfort)){const el=document.getElementById('pref-'+key);if(el)el.checked=comfort[key]}const el=document.getElementById('fire-mode');if(el)el.textContent=comfort.autoFire?'AUTO ON':'HOLD TO FIRE';document.querySelector('.battlefield')?.classList.toggle('swap-controls',comfort.leftHanded);applyPlaylistUI();}
function releaseControls(){touch.clear();pressed.clear();clearStick();clearFireAim();for(const el of document.querySelectorAll('[data-key]'))el.classList.remove('active')}

function mazeRandom(seed){let x=(seed>>>0)||1;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};}
function createMaze(def,seed){const {cols,rows,cell}=def,rng=mazeRandom(seed),open=Array.from({length:cols*rows},()=>[]),visited=new Set([0]),stack=[0];
 const adjacent=(i)=>{const x=i%cols,y=Math.floor(i/cols),a=[];if(x>0)a.push(i-1);if(x<cols-1)a.push(i+1);if(y>0)a.push(i-cols);if(y<rows-1)a.push(i+cols);return a};
 const link=(a,b)=>{if(!open[a].includes(b)){open[a].push(b);open[b].push(a)}};
 while(stack.length){const a=stack.at(-1),candidates=adjacent(a).filter(i=>!visited.has(i));if(!candidates.length){stack.pop();continue}const b=candidates[Math.floor(rng()*candidates.length)];link(a,b);visited.add(b);stack.push(b)}
 // Braided loops prevent the map from turning into a single tedious corridor.
 for(let i=0;i<open.length;i++)for(const j of adjacent(i)){if(j<=i||open[i].includes(j))continue;if(rng()<.16)link(i,j)}
 const walls=[],thick=19;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*cols+x;
 if(x<cols-1&&!open[i].includes(i+1))walls.push({x:(x+1)*cell-thick/2,y:y*cell,w:thick,h:cell});
 if(y<rows-1&&!open[i].includes(i+cols))walls.push({x:x*cell,y:(y+1)*cell-thick/2,w:cell,h:thick});}
 return {cols,rows,cell,open,walls};}
function setArena(id=0,seed=1,size=selectedRules.mapSize){const sizeId=MAP_SIZES[size]?size:'standard';
 if(currentArena===0&&currentSeed===seed&&currentMapSize===sizeId)return 0;
 // A host-authoritative LAN rematch can replace a large map with a small
 // one while the guest camera still points far outside the new world.
 // Reset only when the arena actually changes, never on regular snapshots.
 if(currentArena===0){camera.x=0;camera.y=0;camera.zoom=null;}
 currentArena=0;currentSeed=seed;currentMapSize=sizeId;
 mazeGrid=createMaze(MAP_SIZES[sizeId],seed);wallSet=mazeGrid.walls;bumpers=[];
 worldW=mazeGrid.cols*mazeGrid.cell;worldH=mazeGrid.rows*mazeGrid.cell;rebuildWallLookup();return 0;}
function selectArena(){return 0;}
function startingPosition(i){if(mazeGrid){const {cols,rows,cell}=mazeGrid,spots=[[0,Math.floor(rows/2)],[cols-1,Math.floor(rows/2)],[Math.floor(cols/2),0],[Math.floor(cols/2),rows-1],[2,2],[cols-3,rows-3]];
 const [x,y]=spots[i%spots.length];return [(x+.5)*cell,(y+.5)*cell];}
 const spots=[[130,300],[830,300],[480,96],[480,500],[130,100],[830,500]];return spots[i%spots.length]}
function freshTank(i){const [x,y]=startingPosition(i);return {x,y,a:i%2?Math.PI:0,vx:0,vy:0,shield:0,powerType:null,powerTimer:0,flash:0,onFoot:false,vehicleId:null,trackLeft:0,trackRight:0,recoil:0};}
// All players are pilots. Tank and mech share one enter/exit/armor framework.
const TANK_ARMOR=3,EJECTION_SHIELD=1.35;
function vehicleDef(v){return VEHICLE_TYPES[v?.type]||VEHICLE_TYPES.tank;}
function currentVehicle(t){return t&&!t.onFoot?state?.vehicles?.[t.vehicleId]:null;}
// The cap is for shells simultaneously airborne, NOT an ammo clip.
// A short lifetime keeps holding FIRE responsive even on open maps.
function activeBulletCap(t){if(!t)return 2;const base=t.onFoot?2:currentVehicle(t)?.type==='mech'?Math.max(1,Math.ceil((state.config?.bulletCap||4)*.75)):(state.config?.bulletCap||4);return base+(t.powerTimer>0&&t.powerType==='rapid'?1:0)+(t.powerTimer>0&&t.powerType==='overcharge'?2:0);}
function fireInterval(t){const base=t.onFoot?.43:vehicleDef(currentVehicle(t)).fireCooldown;return t.powerTimer>0&&t.powerType==='rapid'?base*.66:base;}
function deploymentSeed(seed,index){return ((seed>>>0)^(Math.imul(index+1,0x9e3779b1)>>>0))>>>0;}
function deployVehicle(forceType=null){if(!isPilotMatch()||isCqcMatch()||state.winner>=0)return false;
 const available=state.vehicles.filter(v=>v.armor>0).length;
 if(available>=MAX_VEHICLES||state.vehicles.length>=MAX_VEHICLES)return false;
 const rng=mazeRandom(deploymentSeed(state.mazeSeed,state.dropIndex++));
 const type=forceType|| (rng()<.32?'mech':'tank');
 const cells=Array.from({length:mazeGrid.cols*mazeGrid.rows},(_,i)=>i);
 for(let i=cells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 for(const i of cells){const x=((i%mazeGrid.cols)+.5)*mazeGrid.cell,y=(Math.floor(i/mazeGrid.cols)+.5)*mazeGrid.cell;
   if(blocked(x,y,28)||state.vehicles.some(v=>v.armor>0&&Math.hypot(x-v.x,y-v.y)<90)||state.tanks.some((t,j)=>state.lives[j]>0&&Math.hypot(t.x-x,t.y-y)<180))continue;
   const v={id:state.vehicles.length,x,y,a:Math.floor(rng()*4)*Math.PI/2,type,armor:VEHICLE_TYPES[type].armor,occupant:-1,respawn:0};
   state.vehicles.push(v);state.vehicleBeacon={x,y,type,ttl:7};state.event=type==='mech'?'MECH DEPLOYED':'TANK DEPLOYED';state.eventTimer=2.25;
   emitFx('pickup',x,y,type==='mech'?'#e5a8ff':'#7df1c8');return true;}
 return false;}

// An empty deployment is a non-solid recovery opportunity, not improvised cover.
// Keep this helper for compatibility with older test hooks. Occupied actors and
// maze walls still collide through tankMove(). All players/bots share this rule.
function parkedVehicleAt(x,y,r=12,exceptId=null){return false;}
function vehicleSite(x,y,vehicles=[],pilots=[]){
 // Try positions close to the requested garage first, then search safe cell centers.
 const offsets=[[0,0],[-44,0],[0,-44],[0,44],[44,0],[-44,-44],[-44,44],[44,-44],[44,44],[-88,0],[0,88],[0,-88],[88,0]];
 const candidates=offsets.map(([dx,dy])=>[x+dx,y+dy]);
 if(mazeGrid)for(let row=0;row<mazeGrid.rows;row++)for(let col=0;col<mazeGrid.cols;col++)candidates.push([(col+.5)*mazeGrid.cell,(row+.5)*mazeGrid.cell]);
 const valid=([px,py])=>!blocked(px,py,24)&&vehicles.every(v=>v.armor<=0||Math.hypot(px-v.x,py-v.y)>=58)&&pilots.every(t=>Math.hypot(px-t.x,py-t.y)>=38);
 // Prefer the requested location, without allowing a tank to materialize in a wall or another actor.
 const near=candidates.slice(0,offsets.length).find(valid);
 if(near)return near;
 return candidates.slice(offsets.length).filter(valid).sort((a,b)=>Math.hypot(a[0]-x,a[1]-y)-Math.hypot(b[0]-x,b[1]-y))[0]||null;
}
// v0.9.51 preview-only policy: real corridor distance (not minimap straight line).
// Deterministic and bounded to <=2 spare relocations. Legacy remains selectable.
function corridorSteps(start){
 const open=mazeGrid.open,cols=mazeGrid.cols,cell=mazeGrid.cell;
 const index=Math.floor(start.y/cell)*cols+Math.floor(start.x/cell);
 const distance=new Int16Array(open.length).fill(-1),queue=[index];distance[index]=0;
 for(let i=0;i<queue.length;i++)for(const adjacent of open[queue[i]])
  if(distance[adjacent]===-1){distance[adjacent]=distance[queue[i]]+1;queue.push(adjacent);}
 return distance;
}
function balanceSpareRecovery(vehicles,tanks,config,shuffledCells){
 const free=vehicles.filter(v=>v.occupant===-1&&v.armor>0);
 if(!mazeGrid||free.length<2||!tanks.length)return;
 const {cell,cols,rows}=mazeGrid,seatRoutes=tanks.map(t=>corridorSteps(t));
 const at=p=>Math.floor(p.y/cell)*cols+Math.floor(p.x/cell);
 const nearest=sites=>seatRoutes.map(routes=>Math.min(...sites.map(v=>routes[at(v)])));
 const worst=values=>Math.max(...values),sum=values=>values.reduce((a,b)=>a+b,0);
 const competitive=!!SCORED_MATCH_RULES[config.matchModeId]||mode==='host'||mode==='duel';
 const maxPasses=competitive?2:1;
 const original=nearest(free);
 // Solo already has a reachable spare within a reasonable corridor walk.
 // Don't turn a dangerous on-foot recovery into an instant two-cell bailout.
 if(!competitive&&original[0]<=8)return;
 const candidates=shuffledCells.map(index=>({x:((index%cols)+.5)*cell,y:(Math.floor(index/cols)+.5)*cell}))
  .filter(p=>!blocked(p.x,p.y,28)&&tanks.every(t=>Math.hypot(t.x-p.x,t.y-p.y)>=150)
    &&seatRoutes.every(routes=>routes[at(p)]>=4));
 const eligible=(candidate,k)=>free.every((v,j)=>j===k||Math.hypot(v.x-candidate.x,v.y-candidate.y)>=150);
 let current=nearest(free);
 const evaluation=values=>competitive?worst(values)*100+sum(values):Math.abs(values[0]-6)*100+worst(values)*2+sum(values);
 for(let pass=0;pass<maxPasses;pass++){
  let best=evaluation(current),bestMove=null;
  for(let k=0;k<free.length;k++)for(const p of candidates){
   if(!eligible(p,k))continue;
   const draft=free.slice();draft[k]=p;
   const distances=nearest(draft);
   if(!competitive){
    if(distances[0]<4||distances[0]>8||distances[0]>=current[0])continue;
    if(worst(distances)>worst(original)+2)continue;
   }
   const score=evaluation(distances);
   if(score<best){best=score;bestMove={k,p,distances};}
  }
  if(!bestMove)break;
  const vehicle=free[bestMove.k];vehicle.x=bestMove.p.x;vehicle.y=bestMove.p.y;
  current=bestMove.distances;
 }
}
function spawnVehicles(tanks,humans,seed=1,config=null){const vehicles=[];
 for(let i=0;i<tanks.length;i++){const t=tanks[i];t.onFoot=false;t.vehicleId=vehicles.length;
  vehicles.push({id:vehicles.length,x:t.x,y:t.y,a:t.a,type:'tank',armor:VEHICLE_TYPES.tank.armor,occupant:i,respawn:0});}
 const rng=mazeRandom(deploymentSeed(seed,42)),cells=Array.from({length:mazeGrid.cols*mazeGrid.rows},(_,i)=>i);
 for(let i=cells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 // One accessible vehicle near the human starting point; remaining vehicles spread around the map.
 const first=tanks[0],nearCells=cells.filter(i=>Math.hypot(((i%mazeGrid.cols)+.5)*mazeGrid.cell-first.x,(Math.floor(i/mazeGrid.cols)+.5)*mazeGrid.cell-first.y)<440);
 const place=index=>{const x=((index%mazeGrid.cols)+.5)*mazeGrid.cell,y=(Math.floor(index/mazeGrid.cols)+.5)*mazeGrid.cell;
   if(blocked(x,y,28)||vehicles.some(v=>Math.hypot(v.x-x,v.y-y)<150)||tanks.some(t=>Math.hypot(t.x-x,t.y-y)<90))return false;
   const type=vehicles.some(v=>v.type==='mech')||rng()>=.38?'tank':'mech';
   vehicles.push({id:vehicles.length,x,y,a:Math.floor(rng()*4)*Math.PI/2,type,armor:VEHICLE_TYPES[type].armor,occupant:-1,respawn:0});return true;};
 // First spare is discoverable without a long hike. Others use the wider map.
 for(const index of nearCells){if(place(index))break;}
 for(const index of cells){if(vehicles.filter(v=>v.occupant===-1).length>=3)break;
   const x=((index%mazeGrid.cols)+.5)*mazeGrid.cell,y=(Math.floor(index/mazeGrid.cols)+.5)*mazeGrid.cell;
   if(Math.hypot(first.x-x,first.y-y)>500)place(index);}
 for(const index of cells){if(vehicles.filter(v=>v.occupant===-1).length>=3)break;place(index);}
 // Guarantee a mech appears among the spare vehicles when feasible, without forcing the player to select it.
 const free=vehicles.filter(v=>v.occupant===-1);if(free.length&&!free.some(v=>v.type==='mech')){const v=free.at(-1);v.type='mech';v.armor=VEHICLE_TYPES.mech.armor;}
 if(config?.recoveryPolicy==='corridor-v1')balanceSpareRecovery(vehicles,tanks,config,cells);
 return vehicles;
}
function isPilotMatch(){return state?.config?.pilotMode===true;}
// A directional hint is only needed while on foot. Unlike ENTER range, this
// considers all healthy unoccupied vehicles (even around maze corners).
function closestAvailableVehicle(i){
 if(!isPilotMatch()||!state?.tanks[i]||state.lives[i]<=0)return null;
 const pilot=state.tanks[i];let best=null,distance=Infinity;
 for(const v of state.vehicles||[]){if(v.armor<=0||v.occupant!==-1||!vehicleEntryClear(i,v))continue;
  const d=Math.hypot(v.x-pilot.x,v.y-pilot.y);
  if(d<distance){best=v;distance=d;}}
 return best;
}
// Empty vehicles are pass-through, but must have a clear deployment footprint
// before a new driver materializes. Otherwise two live actors can overlap.
function vehicleEntryClear(i,v){return !state.tanks.some((other,j)=>j!==i&&state.lives[j]>0&&Math.hypot(other.x-v.x,other.y-v.y)<(other.onFoot?37:47));}
function nearestEmptyVehicle(i){if(!isPilotMatch()||state.lives[i]<=0)return null;const t=state.tanks[i];let best=null,bestD=58;
 for(const v of state.vehicles||[]){if(v.occupant!==-1||v.armor<=0||!vehicleEntryClear(i,v))continue;const d=Math.hypot(v.x-t.x,v.y-t.y);if(d<bestD&&hasLineOfSight(t.x,t.y,v.x,v.y)){best=v;bestD=d}}
 return best;}
// Use the same safe exit search for manual exits and forced ejections.
// Search a compact ring before falling back to the vacated tank's position.
function pilotExitSite(i,vehicleId){const t=state.tanks[i];
 for(const radius of [46,57,70])for(let n=0;n<16;n++){
   const a=n*Math.PI/8,px=t.x+Math.cos(a)*radius,py=t.y+Math.sin(a)*radius;
   if(blocked(px,py,11)||!hasLineOfSight(t.x,t.y,px,py))continue;
   if(state.tanks.some((other,j)=>j!==i&&state.lives[j]>0&&Math.hypot(other.x-px,other.y-py)<(other.onFoot?27:39)))continue;
   return [px,py];
 }
 return null;
}
function tryInteract(i=0){if(!isPilotMatch()||isCqcMatch()||paused||state.winner>=0||state.lives[i]<=0)return false;const t=state.tanks[i];
 if(t.onFoot){const v=nearestEmptyVehicle(i);if(!v){if(i===0){const bay=(state.vehicles||[]).some(q=>q.occupant===-1&&q.armor>0&&Math.hypot(q.x-t.x,q.y-t.y)<58&&hasLineOfSight(t.x,t.y,q.x,q.y)&&!vehicleEntryClear(i,q));notice(bay?'Vehicle bay occupied · clear the area':'Find a parked tank and move closer');}return false}
  v.occupant=i;t.vehicleId=v.id;t.onFoot=false;Object.assign(t,{x:v.x,y:v.y,a:v.a,vx:0,vy:0,recoil:0,trackLeft:0,trackRight:0});state.event=vehicleDef(v).name+' ONLINE · '+v.armor+' ARMOR';state.eventTimer=.9;emitFx('pickup',v.x,v.y,combatColor(i),i);}
 else{const v=state.vehicles?.[t.vehicleId];if(!v)return false;
  const spot=pilotExitSite(i,v.id);
  if(!spot){if(i===0)notice('Need space beside the tank to exit');return false}
  v.x=t.x;v.y=t.y;v.a=t.a;v.occupant=-1;t.onFoot=true;t.vehicleId=null;Object.assign(t,{x:spot[0],y:spot[1],vx:0,vy:0,shield:Math.max(t.shield,.35)});if(i===0&&coachEnabled&&!coachPilotShown){coachPilotShown=true;coachTip('ON FOOT · APPROACH AN EMPTY VEHICLE · ENTER TO BOARD',4.4);}state.event='VEHICLE AVAILABLE';state.eventTimer=.8;}
 if(i===0&&mode==='solo')clearFireAim(); // cancel the previous control family's active gesture
 refreshHUD();return true;}
function ejectPilot(i){const t=state.tanks[i],v=state.vehicles?.[t.vehicleId];if(!v)return;
 v.x=t.x;v.y=t.y;v.a=t.a;v.occupant=-1;v.armor=0;v.respawn=9;
 const exit=pilotExitSite(i,v.id)||[t.x,t.y];
 t.onFoot=true;t.vehicleId=null;Object.assign(t,{x:exit[0],y:exit[1],vx:0,vy:0,shield:EJECTION_SHIELD,powerType:null,powerTimer:0});
 if(i===0&&mode==='solo')clearFireAim(); // no vehicle AIM leaking into pilot FIRE drag
 t.ejectAnim=.62;if(i===0&&coachEnabled&&!coachPilotShown){coachPilotShown=true;coachTip('ON FOOT · FOLLOW THE VEHICLE ARROW · ENTER TO BOARD',4.4);}audioCue('eject',v.x,v.y);state.event=label(i)+' EJECTED · FIND COVER!';state.eventTimer=1.15;emitFx('eject',v.x,v.y,combatColor(i),-1,i);
}
function initialState(arena=0,options=null,seed=null){const config={...readSettings(),pilotMode:true,recoveryPolicy:'corridor-v1',...(options||{})};let count=mode==='solo'?1:2;
 // Zero bots is a legitimate free-roam practice setting; don't silently add an enemy.
 const mazeSeed=seed||Math.floor(Math.random()*0x7fffffff)||1,id=setArena(0,mazeSeed,config.mapSize);
 const numBots=config.botCount,humans=count,total=humans+numBots,tanks=Array.from({length:total},(_,i)=>freshTank(i));
 const cqc=config.matchModeId==='cqc',scoredRules=SCORED_MATCH_RULES[config.matchModeId]||null;
 const vehicles=cqc?[]:config.pilotMode?spawnVehicles(tanks,humans,mazeSeed,config):[];
 if(cqc)for(const t of tanks){t.onFoot=true;t.vehicleId=null;t.shield=1.5;t.respawnWait=0;}
 const matchId=++matchSerial;
 // Shared real scoring system for both on-foot CQC and tank/mech Free-for-All.
 const scored=scoredRules?window.SectorScored.createScoredMatch({mode:scoredRules.mode,playerCount:total,teamIds:scoredRules.mode==='teams'?Array.from({length:total},(_,i)=>i%2):null,scoreTarget:scoredRules.scoreTarget,clockSeconds:scoredRules.clockSeconds,matchId}):null;
 camera.x=0;camera.y=0;botBrains.clear();return {tanks,vehicles,vehicleDropTimer:28,dropIndex:0,vehicleBeacon:null,bullets:[],pickups:[],pickupTimer:5.5,arenaId:id,mazeSeed,config,humanCount:humans,fxEvents:[],lives:Array(total).fill(scoredRules?1:config.startLives),kos:Array(total).fill(0),winner:-1,winnerTeam:-1,event:'',eventTimer:0,matchId,elapsedSeconds:0,deaths:Array(total).fill(0),respawns:Array(total).fill(0),scored,scoreSerial:0,finalResult:null};}
state=initialState();
function teamOf(i,st=state){
 const rules=st.config?.teamMode||'ffa';
 if(rules==='ffa')return i;
 if(rules==='coop')return i<st.humanCount?0:1;
 // Solo Team Survival: human BLUE, AI1 RED, AI2 BLUE, AI3 RED, AI4 BLUE.
 // In two-human matches, player indices 0/1 sit on opposite teams.
 // Keep this deterministic for network state, scoring, and bot target filters.
 return i%2;
}
function friendly(a,b){return teamOf(a)===teamOf(b)}
function combatColor(i,st=state){
 return st.config?.teamMode==='ffa'?colors[i]:(teamOf(i,st)===0?'#46d2f5':'#fc856e');
}
function opposingCount(i,st=state){
 return st.lives.reduce((sum,lives,j)=>sum+(lives>0&&!friendlyForState(i,j,st)?1:0),0);
}
function friendlyForState(a,b,st){return teamOf(a,st)===teamOf(b,st);}
function label(i){return i===0?'CYAN':i===1&&state.humanCount===2?'CORAL':`BOT ${i-state.humanCount+1}`;}
// A completed result is a frozen per-match record. HUD refreshes must never re-score it.
function finalizeRound(){
 if(!state||state.winner<0||state.finalResult)return state?.finalResult||null;
 if(isScoredMatch()){
  const scored=state.scored,local=mode==='guest'?1:0;
  const outcome=window.SectorScored.scoredOutcomeFor(scored,local);
  const teams=scored.mode==='teams',winnerLabel=teams?(scored.result.winningSide===0?'BLUE':'RED'):label(scored.result.winningSide);
   const summary={version:1,matchId:state.matchId,mazeSeed:state.mazeSeed,matchModeId:state.config.matchModeId,teamMode:teams?'teams':'ffa',mapSize:state.config.mapSize,objective:teams?'team_operator_ko_target':'operator_ko_target',outcome,winner:scored.result.winningSide,winnerTeam:teams?(scored.result.winningSide??-1):-1,operatorKOs:scored.operatorKOs[local],deaths:scored.deaths[local],respawns:scored.respawns[local],livesRemaining:0,scoreTarget:scored.scoreTarget,scoreboard:scored.result.scores,reason:scored.result.reason,durationSeconds:scored.elapsedSeconds,event:scored.result.isDraw?'DRAW · TIME LIMIT':scored.result.reason==='time_limit'?'TIME LIMIT · '+winnerLabel+' LEADS':winnerLabel+(teams?' TEAM':'')+' REACHED '+scored.scoreTarget+' KOs'};
  state.finalResult=Object.freeze(summary);return state.finalResult;
 }
 const local=mode==='guest'?1:0,winningTeam=state.winnerTeam,playerAlive=(state.lives[local]||0)>0;
 // Team Survival is a SIDE victory. A living teammate can win the match
 // after the player has been eliminated; do not report that as DEFEAT.
 const won=teamOf(local,state)===winningTeam&&(state.config?.teamMode==='teams'||playerAlive);
 const summary={
  version:1,matchId:state.matchId,mazeSeed:state.mazeSeed,
  matchModeId:state.config.matchModeId||null,teamMode:state.config.teamMode,mapSize:state.config.mapSize,
  objective:'last_side_standing',outcome:won?'victory':'defeat',winner:state.winner,winnerTeam:winningTeam,
  operatorKOs:state.kos[local]||0,deaths:state.deaths?.[local]??null,
  respawns:state.respawns?.[local]??null,livesRemaining:state.lives[local]||0,
  durationSeconds:state.elapsedSeconds??null,event:String(state.event||'MATCH COMPLETE')
 };
 state.finalResult=Object.freeze(summary);
 return state.finalResult;
}
function durationLabel(seconds){
 if(!Number.isFinite(seconds))return '—';
 const n=Math.max(0,Math.floor(seconds));
 return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
}
function emitFx(kind,x,y,color,owner=-1,target=-1){const id=++fxSeq;state.fxEvents.push({id,kind,x,y,color,owner,target,ttl:kind==='shot'?1.8:kind==='hit'?.75:kind==='armor'?.55:kind==='eject'?.8:kind==='guard'?.5:.4});if(state.fxEvents.length>12)state.fxEvents.shift();spawnParticles(kind,x,y,color);lastRemoteFxId=id}
function spawnParticles(kind,x,y,color){const count=kind==='hit'?24:kind==='armor'?12:kind==='eject'?20:kind==='pickup'?17:kind==='bounce'?5:kind==='shot'?7:12;const speed=kind==='hit'?205:kind==='armor'?145:kind==='bounce'?95:kind==='shot'?115:135;
 for(let i=0;i<count;i++){const a=(i/count)*Math.PI*2+Math.random()*.4,velocity=speed*(.28+Math.random()*.72),life=(kind==='shot'?.17:kind==='bounce'?.14:.42)+Math.random()*.26;particles.push({x,y,vx:Math.cos(a)*velocity,vy:Math.sin(a)*velocity,life,maxLife:life,color,size:kind==='hit'?2.5+Math.random()*3:kind==='armor'?2+Math.random()*1.7:1.5+Math.random()*2.2})}if(particles.length>260)particles.splice(0,particles.length-260);}
function spawnPickup(){if(state.pickups.length||state.winner>=0)return;
 const spots=mazeGrid?Array.from({length:mazeGrid.cols*mazeGrid.rows},(_,i)=>[((i%mazeGrid.cols)+.5)*mazeGrid.cell,(Math.floor(i/mazeGrid.cols)+.5)*mazeGrid.cell]):pickupSpots;
 const candidates=spots.filter(([x,y])=>!blocked(x,y,32)&&state.tanks.every((t,i)=>state.lives[i]===0||Math.hypot(t.x-x,t.y-y)>83));if(!candidates.length)return;
 const [x,y]=candidates[Math.floor(Math.random()*candidates.length)],types=Object.keys(PICKUPS).filter(type=>type!=='repair'||state.tanks.some((t,i)=>state.lives[i]>0&&!t.onFoot&&currentVehicle(t)?.armor<vehicleDef(currentVehicle(t)).armor));const type=types[Math.floor(Math.random()*types.length)];state.pickups=[{x,y,type}];}
function collectPickup(t,i,p){const def=PICKUPS[p.type];if(!def)return false;
 if(p.type==='repair'){const v=currentVehicle(t);if(!v||v.armor>=vehicleDef(v).armor)return false;v.armor=Math.min(vehicleDef(v).armor,v.armor+1);}
 else{t.powerType=p.type;t.powerTimer=def.duration;}
 state.event=label(i)+' GOT '+def.name;state.eventTimer=1;
 emitFx('pickup',p.x,p.y,def.color);audioCue('pickup',p.x,p.y);if(i===0&&coachEnabled&&!coachSupplyShown){coachSupplyShown=true;coachTip('SUPPLY ACQUIRED · WATCH THE POWER TIMER',3.3);}state.pickups=state.pickups.filter(item=>item!==p);state.pickupTimer=9+Math.random()*4;refreshHUD();return true;}

function notice(t,duration=2400){toast.textContent=t;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),duration)}
// One-time, contextual guidance; it never blocks touch input or interrupts play.
function coachTip(message,seconds=3.8){
 if(!coachEnabled||mode!=='solo')return false;
 const display=document.getElementById('field-coach');
 if(!display)return false;
 display.textContent=message;
 display.classList.remove('hidden');
 coachRemaining=seconds;
 return true;
}
// Once-per-control-scheme briefing, shown only when an actual Solo match begins.
// Do not replay a modal tutorial or show misleading Survival controls in scored modes.
function firstMatchHint(){
 const cqc=isCqcMatch(),scoredVehicle=isScoredVehicleMatch();
 const key=cqc?'rr-coach-cqc-v1':scoredVehicle?'rr-coach-scored-vehicle-v2':'rr-coach-v0917';
 const hint=cqc?'DRAG FIRE TO AIM · PILOT KOs SCORE':
   scoredVehicle?'MOVE TO STEER · TAP FIRE TO SHOOT':
   'MOVE TO AIM · HOLD FIRE TO SHOOT';
 try{
  if(window.localStorage?.getItem(key))return false;
  window.localStorage?.setItem(key,'1');
 }catch(_){}
 coachEnabled=true;
 return coachTip(hint,cqc||scoredVehicle?4.6:4);
}
function setPanel(html){releaseControls();panel.innerHTML=html;menu.classList.remove('hidden')}
function exitMenu(){menu.classList.add('hidden');refreshHUD()}
function inputFrom(keys,isLocal){const down=k=>menu.classList.contains('hidden')&&(pressed.has(keys[k])||(isLocal&&touch.has(k)));let moveX=Number(down('right'))-Number(down('left')),moveY=Number(down('down'))-Number(down('up'));
 if(isLocal&&stick.pointerId!==null){moveX=stick.x;moveY=stick.y}
 const length=Math.hypot(moveX,moveY);if(length>1){moveX/=length;moveY/=length}
 // Keep Solo's accepted FIRE-drag for the local on-foot pilot in nearby LAN
 // as well; the guest sends its aim vector to the authoritative host.
 const localSeat=mode==='guest'?1:0;
 const localFoot=isLocal&&['solo','host','guest'].includes(mode)&&!!state?.tanks?.[localSeat]?.onFoot;
 const fineAim=fireAim.active&&localFoot&&fireAim.source==='fire'&&touch.has('fire');
 // Only on-foot pilots use independent FIRE-drag vectors; vehicle steering uses MOVE.
 return {moveX,moveY,aimX:fineAim?fireAim.x:undefined,aimY:fineAim?fireAim.y:undefined,fire:down('fire')||(isLocal&&comfort.autoFire&&mode!=='idle'&&menu.classList.contains('hidden')&&!paused)};}
function makeControl(isPlayer1){return isPlayer1?inputFrom(keys1,true):inputFrom(keys2,false)}
function serializeState(){return {tanks:state.tanks.map(t=>({...t})),vehicles:(state.vehicles||[]).map(v=>({...v})),bullets:state.bullets.map(b=>({...b})),pickups:state.pickups.map(p=>({...p})),pickupTimer:state.pickupTimer,vehicleDropTimer:state.vehicleDropTimer,dropIndex:state.dropIndex,vehicleBeacon:state.vehicleBeacon?{...state.vehicleBeacon}:null,arenaId:state.arenaId,mazeSeed:state.mazeSeed,config:{...state.config},humanCount:state.humanCount,fxEvents:state.fxEvents.slice(),lives:state.lives.slice(),kos:state.kos.slice(),winner:state.winner,winnerTeam:state.winnerTeam,event:state.event,eventTimer:state.eventTimer,matchId:state.matchId,hostPaused:mode==='host'&&paused};}
function refreshHUD(){const me=mode==='guest'?1:0,other=me===0?1:0;
 document.getElementById('score0').textContent=state.lives[me]??0;document.getElementById('score1').textContent=state.lives[other]??0;
 const botLives=mode==='solo'?opposingCount(me):state.lives.slice(state.humanCount||2).filter(v=>v>0).length,active=state.bullets.filter(b=>b.owner===me).length;
 const phase=document.getElementById('round'),localPilot=state.tanks[me],localVehicle=currentVehicle(localPilot),foot=!!localPilot?.onFoot,hostPaused=mode==='guest'&&state.hostPaused;
 const armor=localVehicle?.armor??0,maxArmor=vehicleDef(localVehicle).armor;
 phase.textContent=hostPaused?'HOST PAUSED':state.winner>=0?'MATCH OVER':isScoredMatch()&&state.lives[me]===0?'RESPAWNING · '+Math.max(0,state.tanks[me].respawnWait||0).toFixed(1)+'s':foot?(isCqcMatch()?'PILOT · CQC':'PILOT · ON FOOT'):`${vehicleDef(localVehicle).name} · ${armor}/${maxArmor}`;
 phase.classList.toggle('on-foot',foot&&state.winner<0&&!hostPaused);
 phase.classList.toggle('damaged',!foot&&armor<=1&&state.winner<0&&!hostPaused);
 phase.classList.toggle('match-ended',state.winner>=0);
 phase.classList.toggle('host-paused',hostPaused);
 if(typeof phase.setAttribute==='function')phase.setAttribute('aria-label',hostPaused?'Host paused the match':state.winner>=0?'Match over':foot?'Pilot on foot':`${vehicleDef(localVehicle).name} armor ${armor} of ${maxArmor}`);
 const interact=document.getElementById('interact-btn');if(interact){const canUse=isPilotMatch()&&!isCqcMatch()&&state.lives[me]>0&&state.winner<0;
  const near=canUse&&foot?nearestEmptyVehicle(me):null;
  // A temporary occupied bay is still visible and provides useful feedback,
  // rather than making the mobile ENTER button mysteriously disappear.
  const bayBusy=canUse&&foot&&!near&&(state.vehicles||[]).some(v=>v.occupant===-1&&v.armor>0&&!vehicleEntryClear(me,v)&&Math.hypot(v.x-localPilot.x,v.y-localPilot.y)<58&&hasLineOfSight(localPilot.x,localPilot.y,v.x,v.y));
  interact.classList.toggle('hidden',!canUse||(foot&&!near&&!bayBusy));
  interact.classList.toggle('busy',!!bayBusy);
  interact.textContent=foot?(near?'ENTER '+vehicleDef(near).name:'BAY BUSY'):'EXIT '+vehicleDef(localVehicle).name;
  if(typeof interact.setAttribute==='function')interact.setAttribute('aria-label',bayBusy?'Vehicle bay occupied. Move clear to enter a vehicle':foot?'Enter nearby '+vehicleDef(near).name:'Exit '+vehicleDef(localVehicle).name);
 }
 document.getElementById('game-screen')?.classList.toggle('pilot-match',isPilotMatch());
 const shellMeter=document.getElementById('shell-meter');if(shellMeter){const cap=activeBulletCap(state.tanks[me]);shellMeter.textContent=active>=cap?`0/${cap} IN FLIGHT`:`${Math.max(0,cap-active)}/${cap} READY`;shellMeter.classList.toggle('empty',active>=cap);shellMeter.title=active>=cap?'All projectiles are in flight; capacity returns when a shot expires':'Available simultaneous projectile slots'}
 const power=document.getElementById('power-status');if(power){const def=PICKUPS[localPilot?.powerType];const activePower=(state.lives[me]??0)>0&&!!def&&localPilot.powerTimer>0;power.classList.toggle('hidden',!activePower);power.textContent=activePower?def.name+' · '+Math.ceil(localPilot.powerTimer)+'s':'';if(activePower)power.style.borderColor=def.color;}
 const ended=state.winner>=0&&mode!=='idle';if(ended||state.eventTimer>0)toast.classList.remove('visible');
 document.getElementById('game-screen')?.classList.toggle('match-finished',ended);
 const report=document.getElementById('after-action');
 // Solo results are captured once from combat state. LAN guest uses the existing
 // replicated winner/KO fields until a host-authoritative result packet exists.
 const soloResult=ended&&mode==='solo'?finalizeRound():null;
 // Count only actual offline Solo-vs-bots final results, once per match.
 if(soloResult&&state.config?.botCount>0&&state.humanCount===1&&dossierStore){
  const key=DOSSIER_SESSION+':'+soloResult.matchId+':'+soloResult.mazeSeed;
  if(dossierAttemptedKey!==key){
    dossierAttemptedKey=key;
    const before=dossierStore.snapshot(),saved=dossierStore.record(soloResult,key);
    roundUnlocks=saved.ok?unlocksFromResult(before,dossierStore.snapshot()):[];
   }
 }
 const scoredDraw=!!soloResult&&soloResult.outcome==='draw';
 const localWon=ended&&(soloResult?soloResult.outcome==='victory':state.lives[me]>0&&teamOf(me)===state.winnerTeam);
 if(!ended)resultCuePlayed=false;
 else if(!resultCuePlayed){resultCuePlayed=true;audioCue(localWon?'victory':'defeat');}
 if(report){
   report.classList.toggle('hidden',!ended);
   report.classList.toggle('lost',ended&&!localWon&&!scoredDraw);
   const rewardEl=document.getElementById('aa-rewards'),newRewards=ended&&mode==='solo'&&roundUnlocks.length>0;
   if(rewardEl){rewardEl.classList.toggle('hidden',!newRewards);rewardEl.textContent=newRewards?'NEW IN HANGAR · '+roundUnlocks.join(' · '):'';}
   if(ended){
     const modeTitle=document.getElementById('aa-mode-label');if(modeTitle&&mode==='solo')modeTitle.textContent=(state.config?.customMatch?'CUSTOM · ':'')+soloModeLabel(state.config);
     document.getElementById('aa-title').textContent=scoredDraw?'MATCH DRAW':localWon?'SECTOR CLEARED':'SECTOR LOST';
     document.getElementById('aa-event').textContent=soloResult?.event??String(state.event||'EXERCISE COMPLETE');
     document.getElementById('aa-kos').textContent=String(soloResult?.operatorKOs??state.kos[me]??0);
     document.getElementById('aa-deaths').textContent=soloResult?String(soloResult.deaths):'—';
     document.getElementById('aa-duration').textContent=soloResult?durationLabel(soloResult.durationSeconds):'—';
     document.getElementById('aa-lives').textContent=String(isScoredMatch()?state.scored.scoreTarget:soloResult?.livesRemaining??state.lives[me]??0);
     const metric=document.getElementById('aa-lives-label');if(metric)metric.textContent=isScoredMatch()?(state.scored.mode==='teams'?'TEAM KO TARGET':'KO TARGET'):'LIVES LEFT';
     document.getElementById('aa-outcome').textContent=scoredDraw?'DRAW':localWon?'VICTORY':'DEFEAT';
     document.getElementById('aa-note').textContent=mode==='guest'?'AWAIT HOST REDEPLOYMENT':state.config?.customMatch?'CUSTOM RULES · NEW SECTOR READY':'NEW PROCEDURAL SECTOR READY';
   }
 }
 const replay=document.getElementById('quick-rematch');if(replay){replay.textContent=state.config?.customMatch?'↻ SAME RULES · NEW SECTOR':mode==='solo'?'↻ NEXT MATCH':'↻ NEW SECTOR';replay.classList.toggle('hidden',!(ended&&mode!=='guest'&&menu.classList.contains('hidden')));}
 const tdm=isScoredMatch()&&state.scored.mode==='teams';
 const editRules=document.getElementById('custom-edit');if(editRules)editRules.classList.toggle('hidden',!(ended&&mode==='solo'&&!!state.config?.customMatch));
 const label0=document.getElementById('player0-label');if(label0)label0.textContent=tdm?'BLUE':isScoredMatch()?'YOU KOs':'YOU';
 const label1=document.getElementById('player1-label');if(label1)label1.textContent=tdm?'RED':isScoredMatch()?'LEADER':mode==='solo'&&state.config?.teamMode==='teams'?'RED':mode==='solo'?'ENEMIES':mode==='guest'?'HOST':'OPPONENT';
 if(mode==='solo')document.getElementById('score1').textContent=botLives;
 const fireHint=document.getElementById('fire-mode');if(fireHint)fireHint.textContent=foot&&['solo','host','guest'].includes(mode)?'HOLD · DRAG TO AIM':comfort.autoFire?'AUTO ON':'HOLD TO FIRE';
 const clock=document.getElementById('score-clock'),life=document.querySelector('.scorestrip .hud-life');
 if(clock){clock.classList.toggle('hidden',!isScoredMatch());if(isScoredMatch())clock.textContent=durationLabel(Math.ceil(Math.max(0,state.scored.clockSeconds-state.scored.elapsedSeconds)));}
 if(life)life.classList.toggle('hidden',isScoredMatch());
 if(isScoredMatch()){
   const scores=state.scored.operatorKOs;document.getElementById('score0').textContent=tdm?scores.reduce((sum,k,i)=>sum+(state.scored.teamIds[i]===0?k:0),0):scores[me];
   document.getElementById('score1').textContent=tdm?scores.reduce((sum,k,i)=>sum+(state.scored.teamIds[i]===1?k:0),0):Math.max(0,...scores);
 }
}
function newMatch(which){
 savePrefs();
 const scoredLaunch=!!SCORED_MATCH_RULES[which],customLaunch=which==='custom',cqcLaunch=which==='cqc';
 if(which==='solo'&&!selectedPlaylistIds.length){notice('SELECT A QUICK PLAY MODE IN MATCH SETTINGS',2300);return false;}
 const playlistId=which==='solo'?nextPlaylistMode():null;
 if(bridgeReady())window.AndroidBridge.stopNetwork();mode=scoredLaunch||customLaunch?'solo':which;paused=(which==='host'||which==='guest');connected=false;fixedAccumulator=0;neutralizeGuestInput();
 const arena=selectArena(),options=customLaunch?customOptionsFor():scoredLaunch?{...selectedRules,mapSize:cqcLaunch?'small':'standard',botCount:3,teamMode:which==='scored_tdm'?'teams':'ffa',matchModeId:which,pilotMode:true}:playlistId?quickPlayOptionsFor(playlistId):{...selectedRules,pilotMode:true};
 state=initialState(arena,options,freshSectorSeed(state?.mazeSeed));roundUnlocks=[];camera.zoom=null;resultCuePlayed=false;quietContactSeconds=0;radarReminderShown=false;coachEnabled=false;coachRemaining=0;coachPilotShown=false;coachSupplyShown=false;document.getElementById('field-coach')?.classList.add('hidden');particles=[];damagePulse=0;fxSeq=lastRemoteFxId=0;fireCooldown.fill(0);clearStick();clearFireAim();refreshHUD();document.getElementById('mode-label').textContent=(which==='solo'||scoredLaunch||customLaunch)?(state.config.botCount===0?'PRACTICE FIELD':(customLaunch?'CUSTOM · ':'')+soloModeLabel(state.config)):which==='host'?'HOST MATCH':which==='guest'?'JOIN MATCH':'LOCAL MATCH';if(which==='solo'||which==='duel'||scoredLaunch||customLaunch){exitMenu();audioCue('deploy');if(mode==='solo')firstMatchHint();}}
function resetAll(advancePlaylist=false){
 const previousSeed=state.mazeSeed;
 let options={...state.config};
 if(advancePlaylist&&mode==='solo'&&state.config?.quickPlayMatch&&!state.config?.customMatch){
  const id=nextPlaylistMode();if(!id){notice('SELECT A QUICK PLAY MODE IN MATCH SETTINGS',2300);return false;}
  // Derive the next preset from the SAVED user settings, not the prior
  // mode's effective bot count (Team Survival may need an extra ally).
  // Prevent a 1-bot FFA silently becoming 2 bots after Team Survival.
  options=quickPlayOptionsFor(id,selectedRules);
 }
 state=initialState(0,options,freshSectorSeed(previousSeed));
 if(mode==='host')neutralizeGuestInput();
 if(mode==='solo')document.getElementById('mode-label').textContent=options.botCount===0?'PRACTICE FIELD':(options.customMatch?'CUSTOM · ':'')+soloModeLabel(options);
 camera.zoom=null;resultCuePlayed=false;roundUnlocks=[];quietContactSeconds=0;radarReminderShown=false;coachRemaining=0;document.getElementById('field-coach')?.classList.add('hidden');fixedAccumulator=0;particles=[];screenKick=damagePulse=0;lastRemoteFxId=fxSeq;fireCooldown.fill(0);clearStick();clearFireAim();paused=(mode==='guest'||mode==='host')&&!connected;refreshHUD();if(mode!=='guest')notice('NEW FIELD GENERATED — GO!');}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function circlesRect(x,y,r,w){const nx=clamp(x,w.x,w.x+w.w),ny=clamp(y,w.y,w.y+w.h);return (x-nx)**2+(y-ny)**2<r*r}
function blocked(x,y,r=21){return x<r+13||x>worldW-r-13||y<r+13||y>worldH-r-13||nearWall(x,y,r)}
function tankMove(t,inp,dt,i){const beforeX=t.x,beforeY=t.y,beforeA=t.a;let mx=clamp(Number(inp.moveX)||0,-1,1),my=clamp(Number(inp.moveY)||0,-1,1);let mag=Math.hypot(mx,my);
 if(mag>1){mx/=mag;my/=mag;mag=1}if(mag<.09){mx=0;my=0;mag=0}
 const tacticalVehicle=isScoredVehicleMatch()&&!t.onFoot;
 const baseVehicleSpeed=tacticalVehicle?(inp.bot?SCORED_FFA_VEHICLE_PACE.bot:SCORED_FFA_VEHICLE_PACE.human):(inp.bot?178:222);
 const speed=(t.onFoot?(inp.bot?194:268):baseVehicleSpeed*vehicleDef(currentVehicle(t)).speed)*(t.powerType==='turbo'&&t.powerTimer>0?1.48:1);
 // Apply CQC's accepted 6.5rad/s aim to the local Solo Survival pilot too.
 // AI, guest/host LAN, duel, and all vehicles retain their existing behavior.
 // Both human seats in LAN can independently aim a vulnerable pilot.
 // One local player remains seat 0 in offline Solo. No new tank AIM mode.
 const precisionFoot=t.onFoot&&!inp.bot&&((mode==='solo'&&i===0)||(mode==='host'&&(i===0||i===1)));
 const independentAim=precisionFoot;
 const aimed=independentAim&&Number.isFinite(inp.aimX)&&Number.isFinite(inp.aimY)&&Math.hypot(inp.aimX,inp.aimY)>.6;
 if(mag||aimed){const target=aimed?Math.atan2(inp.aimY,inp.aimX):Math.atan2(my,mx),diff=Math.atan2(Math.sin(target-t.a),Math.cos(target-t.a)),maxTurn=dt*(precisionFoot?SOLO_PILOT_TURN_RATE:tacticalVehicle?SCORED_FFA_VEHICLE_PACE.turnRate:12);t.a+=clamp(diff,-maxTurn,maxTurn)}
 // Solo human tanks used to slide toward the thumb before the hull faced that
 // direction. During a deliberate, slow turn that appears like an off-center
 // orbit. Throttle forward drive until the tracks align with the requested path.
 // Do not change angular rates, pilot FIRE-drag, mech, bots, or LAN.
 const soloTankDrive=mode==='solo'&&i===0&&!inp.bot&&!t.onFoot&&currentVehicle(t)?.type==='tank'&&!aimed;
 let driveX=mx,driveY=my,turningToFace=false;
 if(soloTankDrive&&mag){
  const intended=Math.atan2(my,mx);
  const diff=Math.atan2(Math.sin(intended-t.a),Math.cos(intended-t.a));
  const alignment=clamp((Math.cos(diff)-.3)/.7,0,1);
  driveX=Math.cos(t.a)*mag*alignment;
  driveY=Math.sin(t.a)*mag*alignment;
  turningToFace=alignment<.5;
 }
 const blend=Math.min(1,dt*(turningToFace?17:mag?9:13));
 t.vx+=(driveX*speed-t.vx)*blend;t.vy+=(driveY*speed-t.vy)*blend;
 const nx=t.x+t.vx*dt,ny=t.y+t.vy*dt;
 const radius=t.onFoot?10:21;
 const collides=(x,y)=>blocked(x,y,radius)||state.tanks.some((other,j)=>{
  if(i===j||state.lives[j]<=0)return false;
  const limit=(radius+(other.onFoot?12:21))**2;
  const nextDist=(other.x-x)**2+(other.y-y)**2;
  if(nextDist>=limit)return false;
  const priorDist=(other.x-t.x)**2+(other.y-t.y)**2;
  // Existing overlap may occur after spawns/ejections or network corrections.
  // Let an actor move strictly AWAY from an overlap, never farther into it.
  // Without this exception both actors can stay collision-locked indefinitely.
  return !(priorDist<limit&&nextDist>priorDist+0.0001);
 });
 if(!collides(nx,t.y))t.x=nx;else t.vx=0;
 if(!collides(t.x,ny))t.y=ny;else t.vy=0;
 // Differential track travel: turning rotates the two tread belts at different
 // rates, including a near-stationary pivot. No extra forces or speed changes.
 if(!t.onFoot){const forward=(t.x-beforeX)*Math.cos(t.a)+(t.y-beforeY)*Math.sin(t.a);
  const heading=Math.atan2(Math.sin(t.a-beforeA),Math.cos(t.a-beforeA));
  t.trackLeft=(t.trackLeft||0)+forward*.44-heading*17;
  t.trackRight=(t.trackRight||0)+forward*.44+heading*17;
 }
}
function hasLineOfSight(x,y,tx,ty){const length=Math.hypot(tx-x,ty-y),steps=Math.ceil(length/15);for(let n=1;n<steps;n++){const p=n/steps;if(nearWall(x+(tx-x)*p,y+(ty-y)*p,4))return false}return true;}
// AI priorities are readable: recover a vehicle, choose an available supply,
// evade a close enemy when nearly destroyed, then return to a fair duel.
// All decisions use existing visible game state: no enhanced accuracy or damage.
function chooseBotObjective(i,target,skill='normal'){
 const bot=state.tanks[i];
 if(isPilotMatch()&&bot.onFoot){
  const recovery=(state.vehicles||[]).filter(v=>v.occupant===-1&&v.armor>0&&vehicleEntryClear(i,v))
   .sort((a,b)=>Math.hypot(a.x-bot.x,a.y-bot.y)-Math.hypot(b.x-bot.x,b.y-bot.y))[0];
  if(recovery)return {kind:'recovery',point:recovery};
 }
 const pickup=state.pickups?.[0];
 if(pickup){
  const v=currentVehicle(bot),armor=v?.armor??0,maxArmor=vehicleDef(v).armor;
  const repairUseful=pickup.type==='repair'&&!bot.onFoot&&armor<maxArmor;
  const buffUseful=pickup.type!=='repair'&&!(bot.powerTimer>1.3&&bot.powerType);
  const maxRange=skill==='casual'?205:skill==='spicy'?425:325;
  const distance=Math.hypot(bot.x-pickup.x,bot.y-pickup.y);
  const enemyDist=Math.hypot(bot.x-target.x,bot.y-target.y);
  // A nearby useful repair can outweigh a duel; never chase across the whole
  // level while under direct close-range fire.
  if((repairUseful||buffUseful)&&distance<=maxRange&&(enemyDist>135||repairUseful&&armor<=1&&enemyDist>82)){
   return {kind:'supply',point:pickup};
  }
 }
 const armor=currentVehicle(bot)?.armor??0;
 const threatened=Math.hypot(bot.x-target.x,bot.y-target.y);
 if((bot.onFoot||armor===1)&&threatened<115&&hasLineOfSight(bot.x,bot.y,target.x,target.y)){
  const nx=bot.x+(bot.x-target.x)/(threatened||1)*125;
  const ny=bot.y+(bot.y-target.y)/(threatened||1)*125;
  const px=clamp(nx,42,worldW-42),py=clamp(ny,42,worldH-42);
  if(!blocked(px,py,bot.onFoot?12:22))return {kind:'evade',point:{x:px,y:py}};
 }
 return {kind:'engage',point:target};
}
function botInput(i,dt){
 const bot=state.tanks[i],enemies=state.tanks.map((t,j)=>({t,j})).filter(({j})=>j!==i&&state.lives[j]>0&&!friendly(i,j));
 if(!enemies.length)return {moveX:0,moveY:0,fire:false,bot:true};
 enemies.sort((a,b)=>Math.hypot(bot.x-a.t.x,bot.y-a.t.y)-Math.hypot(bot.x-b.t.x,bot.y-b.t.y));
 const target=enemies[0].t,skill=state.config?.botSkill||'normal';
 let brain=botBrains.get(i)||{timer:0,path:[],goal:-1,intent:'engage'};
 const choice=chooseBotObjective(i,target,skill);
 let objective=choice.point;
 if(choice.kind==='recovery'&&Math.hypot(objective.x-bot.x,objective.y-bot.y)<58&&hasLineOfSight(bot.x,bot.y,objective.x,objective.y)){
  tryInteract(i);
  if(!bot.onFoot){objective=target;}
 }
 let direction=Math.atan2(objective.y-bot.y,objective.x-bot.x);
 // Short local recovery when another actor or a narrow corner pins the bot.
 // This is steering, not teleportation, boosted speed, or perfect aim.
 const travelled=Number.isFinite(brain.lastX)?Math.hypot(bot.x-brain.lastX,bot.y-brain.lastY):999;
 const objectiveDistance=Math.hypot(objective.x-bot.x,objective.y-bot.y);
 brain.stuckFor=(objectiveDistance>58&&travelled<.08)?(brain.stuckFor||0)+dt:0;
 brain.lastX=bot.x;brain.lastY=bot.y;
 brain.timer-=dt;
 if(brain.intent!==choice.kind){brain.timer=0;brain.path=[];brain.goal=-1;}
 brain.intent=choice.kind;
 if(mazeGrid){
  const {cols,cell,open}=mazeGrid;
  const cellIndex=t=>clamp(Math.floor(t.y/cell),0,mazeGrid.rows-1)*cols+clamp(Math.floor(t.x/cell),0,cols-1);
  const start=cellIndex(bot),goal=cellIndex(objective);
  if(brain.timer<=0||brain.goal!==goal){
   const prev=Array(open.length).fill(-1),q=[start];prev[start]=start;
   for(let h=0;h<q.length&&prev[goal]===-1;h++)for(const j of open[q[h]])if(prev[j]===-1){prev[j]=q[h];q.push(j);}
   const path=[];if(prev[goal]!==-1){let n=goal;while(n!==start&&path.length<open.length){path.push(n);n=prev[n]}}
   brain.path=path.reverse();brain.goal=goal;brain.timer=.45+(i%4)*.09;
  }
  const waypoint=brain.path[0];
  if(waypoint!==undefined){
   const wx=((waypoint%cols)+.5)*cell,wy=(Math.floor(waypoint/cols)+.5)*cell;
   if(Math.hypot(wx-bot.x,wy-bot.y)<18)brain.path.shift();
   else direction=Math.atan2(wy-bot.y,wx-bot.x);
  }
 }else{
  const aheadX=bot.x+Math.cos(direction)*72,aheadY=bot.y+Math.sin(direction)*72;
  if(blocked(aheadX,aheadY,27))direction+=Math.sin(visualClock*.9+i)>0?1.4:-1.4;
 }
 if(brain.stuckFor>.95){
  // Try the left and right shoulders on alternate stuck intervals. Unlike
  // applying an arbitrary force, this still respects the usual collisions.
  const side=((i+Math.floor(brain.stuckFor/.75))%2===0)?1:-1;
  direction+=side*1.18;
  if(brain.stuckFor<1.04){brain.timer=0;brain.path=[];brain.goal=-1;}
 }
 botBrains.set(i,brain);
 const delta=Math.atan2(Math.sin(Math.atan2(target.y-bot.y,target.x-bot.x)-bot.a),Math.cos(Math.atan2(target.y-bot.y,target.x-bot.x)-bot.a));
 const pace=skill==='casual'?.61:skill==='spicy'?.98:.81;
 const aim=skill==='casual'?.27:skill==='spicy'?.39:.33;
 const enemyDist=Math.hypot(bot.x-target.x,bot.y-target.y);
 const hasLine=enemyDist<(mazeGrid?385:750)&&hasLineOfSight(bot.x,bot.y,target.x,target.y);
 const chasePace=choice.kind==='engage'&&hasLine&&enemyDist<115?pace*.34:pace;
 return {moveX:Math.cos(direction)*chasePace,moveY:Math.sin(direction)*chasePace,fire:Math.abs(delta)<aim&&hasLine,bot:true};
}
// One shared local-space pistol muzzle anchor, used by BOTH art and physics.
// +X is actor facing; +Y is the tiny visual hand offset in top-down view.
const PILOT_MUZZLE_X=28,PILOT_MUZZLE_Y=2;
function pilotMuzzlePoint(t){
 const forward=Math.cos(t.a),side=Math.sin(t.a);
 return {x:t.x+forward*PILOT_MUZZLE_X-side*PILOT_MUZZLE_Y,
         y:t.y+side*PILOT_MUZZLE_X+forward*PILOT_MUZZLE_Y};
}
function projectileHitRadius(target,bullet){
 // Only CQC sidearms get the slightly larger impact tolerance. Wall/collision
 // geometry, cover checks, shields and the other modes are unchanged.
 return (target.onFoot?(isScoredMatch()&&bullet.kind==='sidearm'?CQC_PILOT_HIT_RADIUS:14):26)+(bullet.kind==='mech'?5:0);
}
function shoot(owner){if(state.lives[owner]<=0)return false;
 const isFoot=isPilotMatch()&&state.tanks[owner].onFoot;
 const v=currentVehicle(state.tanks[owner]),def=vehicleDef(v);const cap=activeBulletCap(state.tanks[owner]);if(state.bullets.filter(b=>b.owner===owner&&b.life>0).length>=cap)return false;
 const t=state.tanks[owner],dx=Math.cos(t.a),dy=Math.sin(t.a);
 // Trace the visible weapon path, not the middle of the operator's head.
 // A muzzle too close to solid cover stops at the last unobstructed point,
 // preventing an offset pistol from firing through walls.
 let x=t.x+dx*(isFoot?7:12),y=t.y+dy*(isFoot?7:12);
 if(isFoot){
  const muzzle=pilotMuzzlePoint(t);
  for(let k=1;k<=12;k++){
   const bx=t.x+(muzzle.x-t.x)*k/12,by=t.y+(muzzle.y-t.y)*k/12;
   if(blocked(bx,by,3))break;
   x=bx;y=by;
  }
 }else{
  for(let distance=14;distance<=34;distance+=2){const bx=t.x+dx*distance,by=t.y+dy*distance;if(blocked(bx,by,5))break;x=bx;y=by;}
 }
 t.shield=0; // Shooting cancels spawn/ejection immunity.
 const speed=isFoot?475:def.projectileSpeed;const baselineLife=isFoot?.82:v?.type==='mech'?2.05:2.55;
 const rapid=t.powerTimer>0&&t.powerType==='rapid';const shellLife=rapid&&!isFoot?baselineLife*.68:baselineLife;
 state.bullets.push({x,y,vx:dx*speed,vy:dy*speed,owner,life:shellLife,bounces:0,age:0,kind:isFoot?'sidearm':v?.type==='mech'?'mech':'shell'});t.flash=.11;t.recoil=isFoot?.28:v?.type==='mech'?.56:.72;emitFx('shot',x,y,combatColor(owner),owner);audioCue(isFoot?'pilot-shot':v?.type==='mech'?'mech-shot':'tank-shot',x,y);refreshHUD();return true;}
function respawn(victim){const enemies=state.tanks.filter((_,i)=>i!==victim&&state.lives[i]>0&&!friendly(victim,i));const spots=[];
 if(mazeGrid){for(let r=0;r<mazeGrid.rows;r++)for(let c=0;c<mazeGrid.cols;c++)spots.push([(c+.5)*mazeGrid.cell,(r+.5)*mazeGrid.cell]);}
 else spots.push(...[[130,300],[830,300],[130,100],[830,500],[480,96],[480,500],[130,480],[830,120],[340,70],[620,525]]);
 const pool=spots.filter(([x,y])=>!blocked(x,y,isPilotMatch()?11:25)&&(isPilotMatch()||!parkedVehicleAt(x,y,25))&&state.tanks.every((other,j)=>j===victim||state.lives[j]===0||Math.hypot(x-other.x,y-other.y)>65));
 pool.sort((a,b)=>Math.min(...enemies.map(t=>Math.hypot(b[0]-t.x,b[1]-t.y)),10000)-Math.min(...enemies.map(t=>Math.hypot(a[0]-t.x,a[1]-t.y)),10000));
 const [x,y]=pool[0]||startingPosition(victim),t=state.tanks[victim];Object.assign(t,{x,y,a:0,vx:0,vy:0,shield:1.8,powerType:null,powerTimer:0,flash:0,recoil:0,trackLeft:0,trackRight:0,ejectAnim:0,onFoot:isPilotMatch()?true:false,vehicleId:null});
 state.bullets=state.bullets.filter(b=>Math.hypot(b.x-x,b.y-y)>50);}
function registerHit(attacker,victim){if(state.winner>=0||state.lives[victim]<=0||state.tanks[victim].shield>0||(attacker!==victim&&friendly(attacker,victim)))return false;
 quietContactSeconds=0;const target=state.tanks[victim];if(target.powerType==='guard'&&target.powerTimer>0){target.powerType=null;target.powerTimer=0;emitFx('guard',target.x,target.y,'#b59aff');audioCue('barrier',target.x,target.y);state.event='BARRIER BLOCKED THE HIT!';state.eventTimer=.8;return false;}
 if(isScoredMatch()&&target.onFoot)return creditScoredPilotKO(attacker,victim);
 if(isPilotMatch()&&!target.onFoot){const vehicle=state.vehicles?.[target.vehicleId];if(vehicle&&vehicle.armor>0){
   vehicle.armor--;emitFx('armor',target.x,target.y,combatColor(victim),attacker,victim);
   if(victim===0){screenKick=comfort.shake?2.3:0;damagePulse=.28;}
   if(vehicle.armor===0)ejectPilot(victim);else{state.event=label(victim)+' '+vehicleDef(vehicle).name+' ARMOR '+vehicle.armor+'/'+vehicleDef(vehicle).armor;state.eventTimer=.75;}
   audioCue('armor-hit',target.x,target.y);refreshHUD();return true;
 }}
 // A scored vehicle life can ONLY end when its pilot is genuinely on foot.
 if(isScoredMatch())return false;
 emitFx('hit',target.x,target.y,combatColor(victim),attacker,victim);if(victim===(mode==='guest'?1:0)){screenKick=comfort.shake?3.2:0;damagePulse=.58;}state.lives[victim]--;if(state.deaths)state.deaths[victim]++;if(attacker!==victim)state.kos[attacker]++;state.event=label(victim)+' LOSES A LIFE!';state.eventTimer=.85;audioCue('pilot-hit',target.x,target.y);
 if(state.lives[victim]>0){respawn(victim);if(state.respawns)state.respawns[victim]++;}else{target.vx=target.vy=0;target.powerType=null;target.powerTimer=0;state.bullets=state.bullets.filter(b=>b.owner!==victim);
 const active=state.tanks.map((_,i)=>i).filter(i=>state.lives[i]>0),teams=[...new Set(active.map(i=>teamOf(i)))];
 if(teams.length<=1){state.winnerTeam=teams[0]??teamOf(attacker);state.winner=active[0]??attacker;state.event=state.config.teamMode==='coop'?(state.winnerTeam===0?'HUMANS WIN!':'BOTS WIN!'):state.config.teamMode==='teams'?(`TEAM ${state.winnerTeam===0?'BLUE':'RED'} WINS!`):(label(state.winner)+' WINS!');state.eventTimer=0;}}
 if(state.winner>=0)finalizeRound();
 refreshHUD();return true;}

// Scored CQC is deliberately a separate branch from finite-life Survival.
function finishScoredMatch(){
 if(!isScoredMatch()||!state.scored.finished||state.winner>=0)return;
 state.winner=state.scored.result.winningSide??state.tanks.length; // draw sentinel
 state.winnerTeam=state.scored.mode==='teams'?(state.scored.result.winningSide??-1):-1;
 state.event=state.scored.result.isDraw?soloModeLabel(state.config)+' · DRAW':state.scored.result.reason==='time_limit'?'TIME LIMIT':'KO TARGET REACHED';
 state.eventTimer=0;
 finalizeRound();
 refreshHUD();
}
function creditScoredPilotKO(attacker,victim){
 const t=state.tanks[victim];if(!t.onFoot)return false;const api=window.SectorScored;
 const next=api.recordPilotKO(state.scored,{matchId:state.matchId,incidentId:state.config.matchModeId+':'+state.matchId+':'+(++state.scoreSerial),attacker,victim,kind:'pilot_ko'});
 if(next===state.scored)return false;
 state.scored=next;state.kos=[...next.operatorKOs];state.deaths=[...next.deaths];
 state.lives[victim]=0;t.respawnWait=1.6;t.shield=0;t.vx=0;t.vy=0;t.powerType=null;t.powerTimer=0;
 state.bullets=state.bullets.filter(b=>b.owner!==victim);
 emitFx('hit',t.x,t.y,combatColor(victim),attacker,victim);
 if(victim===0){screenKick=comfort.shake?3.2:0;damagePulse=.58;}
 audioCue('pilot-hit',t.x,t.y);const teamScore=next.mode==='teams'?next.operatorKOs.reduce((sum,k,i)=>sum+(next.teamIds[i]===next.teamIds[attacker]?k:0),0):null;
  state.event=attacker===victim?'SELF RICOCHET · NO KO':next.mode==='teams'?(next.teamIds[attacker]===0?'BLUE':'RED')+' TEAM KO · '+teamScore+'/'+next.scoreTarget:label(attacker)+' KO · '+state.kos[attacker]+'/'+next.scoreTarget;state.eventTimer=.9;
 finishScoredMatch();refreshHUD();return true;
}
// Shared scored delayed spawn: pilots recover on foot; surviving empty vehicles
// stay in the procedural sector for later boarding. Keep legacy test alias.
function tryCqcRespawn(victim){
 if(!isScoredMatch()||state.winner>=0)return false;
 const alive=state.tanks.map((t,i)=>({t,i})).filter(o=>o.i!==victim&&state.lives[o.i]>0);
 const candidates=[];
 if(mazeGrid)for(let r=0;r<mazeGrid.rows;r++)for(let c=0;c<mazeGrid.cols;c++)
  candidates.push({x:(c+.5)*mazeGrid.cell,y:(r+.5)*mazeGrid.cell});
 const site=window.SectorScored.chooseSafeScoreSpawn(candidates,{
  blocked:(x,y)=>blocked(x,y,12),enemies:alive.filter(o=>!friendly(victim,o.i)).map(o=>o.t),
  actors:alive.map(o=>o.t),bullets:state.bullets,
  lineOfSight:hasLineOfSight,recentDeaths:state.recentDeaths||[]
 });
 if(!site)return false; // retry next simulation tick, NEVER unsafe spawn
 const t=state.tanks[victim];
 Object.assign(t,{x:site.x,y:site.y,a:0,vx:0,vy:0,shield:1.65,respawnWait:0,powerType:null,powerTimer:0,flash:0,recoil:0,trackLeft:0,trackRight:0,onFoot:true,vehicleId:null});
 state.lives[victim]=1;
 state.scored=window.SectorScored.recordScoredRespawn(state.scored,{playerIndex:victim});
 state.respawns=[...state.scored.respawns];return true;
}
// Reassurance only: the minimap already shows contacts, and the reminder
// cannot reveal enemies, change AI, or fire in multiplayer.
function updateQuietMatchPrompt(dt){
 if(mode==='solo'&&!radarReminderShown&&state.config.botCount>0&&state.lives[0]>0&&menu.classList.contains('hidden')){
  quietContactSeconds+=Math.max(0,dt);
  if(quietContactSeconds>=28){radarReminderShown=true;notice('CONTACT SEARCH · CHECK THE RADAR',2500);}
 }
}
function step(dt){if(paused||state.winner>=0)return;
 if(mode==='host'){
  if(!connected)neutralizeGuestInput();
  else{
   guestInputAge+=dt;
   if(guestInputAge>LAN_GUEST_INPUT_TIMEOUT)neutralizeGuestInput();
  }
 }
 if(Number.isFinite(dt)&&dt>0)state.elapsedSeconds=(state.elapsedSeconds||0)+dt;
 if(isScoredMatch()){
  state.scored=window.SectorScored.advanceScoreClock(state.scored,dt);
  if(state.scored.finished){finishScoredMatch();return;}
  for(let i=0;i<state.tanks.length;i++)if(state.lives[i]===0){
   state.tanks[i].respawnWait=Math.max(0,(state.tanks[i].respawnWait||0)-dt);
   if(state.tanks[i].respawnWait<=0)tryCqcRespawn(i);
  }
 }
 updateQuietMatchPrompt(dt);
 if(isPilotMatch()&&!isCqcMatch())for(const vehicle of state.vehicles){
   if(vehicle.occupant>=0){const t=state.tanks[vehicle.occupant];vehicle.x=t.x;vehicle.y=t.y;vehicle.a=t.a;}
   else if(vehicle.armor<=0){vehicle.respawn-=dt;if(vehicle.respawn<=0){const others=state.vehicles.filter(v=>v.id!==vehicle.id&&v.armor>0);
     const actors=state.tanks.filter((t,i)=>state.lives[i]>0);
     const spot=vehicleSite(vehicle.x,vehicle.y,others,actors);
     if(spot){vehicle.x=spot[0];vehicle.y=spot[1];vehicle.armor=vehicleDef(vehicle).armor;vehicle.respawn=0;}
     else vehicle.respawn=2;}}
 }
 for(const fx of state.fxEvents)fx.ttl=Math.max(0,(fx.ttl||0)-dt);state.fxEvents=state.fxEvents.filter(fx=>fx.ttl>0);
 state.eventTimer=Math.max(0,state.eventTimer-dt);state.pickupTimer-=dt;
 if(state.vehicleBeacon){state.vehicleBeacon.ttl-=dt;if(state.vehicleBeacon.ttl<=0)state.vehicleBeacon=null;}
 state.vehicleDropTimer=(state.vehicleDropTimer??28)-dt;
 if(!isCqcMatch()&&state.vehicleDropTimer<=0){deployVehicle();state.vehicleDropTimer=30+mazeRandom(deploymentSeed(state.mazeSeed,state.dropIndex+9))()*12;}
 if(!isCqcMatch()&&state.pickupTimer<=0){if(state.pickups.length)state.pickups=[];spawnPickup();state.pickupTimer=state.pickups.length?13:3;}
 const inputs=state.tanks.map((t,i)=>i===0?makeControl(true):i===1&&mode==='duel'?makeControl(false):i===1&&mode==='host'?guestInput:botInput(i,dt));
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]<=0)continue;
 t.powerTimer=Math.max(0,(t.powerTimer||0)-dt);if(t.powerTimer<=0)t.powerType=null;t.flash=Math.max(0,(t.flash||0)-dt);t.recoil=Math.max(0,(t.recoil||0)-dt*6);t.ejectAnim=Math.max(0,(t.ejectAnim||0)-dt);
 t.shield=Math.max(0,t.shield-dt);tankMove(t,inputs[i],dt,i);
 for(const p of state.pickups){if(Math.hypot(t.x-p.x,t.y-p.y)<(t.onFoot?23:35)&&collectPickup(t,i,p))break}
 fireCooldown[i]=Math.max(0,(fireCooldown[i]||0)-dt);if(inputs[i]?.fire&&fireCooldown[i]<=0&&shoot(i))fireCooldown[i]=fireInterval(t);}
 for(const b of state.bullets){b.age+=dt;b.life-=dt;const substeps=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*dt/5)),subDt=dt/substeps;
 for(let j=0;j<substeps&&b.life>0&&state.winner<0;j++){const nx=b.x+b.vx*subDt,ny=b.y+b.vy*subDt;
 if(blocked(nx,b.y,b.kind==='sidearm'?3:5)){if(b.kind==='sidearm'){b.life=0;break}b.vx=-b.vx;b.bounces++;emitFx('bounce',b.x,b.y,combatColor(b.owner));audioCue('ricochet',b.x,b.y)}else b.x=nx;
 if(blocked(b.x,ny,b.kind==='sidearm'?3:5)){if(b.kind==='sidearm'){b.life=0;break}b.vy=-b.vy;b.bounces++;emitFx('bounce',b.x,b.y,combatColor(b.owner));audioCue('ricochet',b.x,b.y)}else b.y=ny;
 for(const bump of bumpers){const dx=b.x-bump.x,dy=b.y-bump.y,dist=Math.hypot(dx,dy);if(dist>0&&dist<bump.r+6&&(b.bumpDelay||0)<=0){const ux=dx/dist,uy=dy/dist,dot=b.vx*ux+b.vy*uy;if(dot<0){b.vx-=2*dot*ux;b.vy-=2*dot*uy;b.x=bump.x+ux*(bump.r+7);b.y=bump.y+uy*(bump.r+7);b.bounces++;b.bumpDelay=.09;emitFx('bounce',b.x,b.y,'#ffdf7b');audioCue('bumper',b.x,b.y)}}}
 b.bumpDelay=Math.max(0,(b.bumpDelay||0)-subDt);if(b.bounces>(b.kind==='mech'?2:5)){b.life=0;break}
 // Unoccupied vehicle bays are non-solid training projections. Projectiles
 // pass through as well; only a piloted vehicle has physical armor.
 if(b.life<=0)break;
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]>0&&(i===b.owner?(b.age>.38&&b.bounces>0):!friendly(i,b.owner))&&t.shield<=0&&(t.x-b.x)**2+(t.y-b.y)**2<projectileHitRadius(t,b)**2){b.life=0;registerHit(b.owner,i);break}}}}
 state.bullets=state.bullets.filter(b=>b.life>0);}
// Offline synthesized FIELDGRID audio. No downloaded samples or backing music.
// One shared AudioContext, short tails and a ricochet throttle protect phone CPU.
const AUDIO_CUES={
 'tank-shot':{wave:'sawtooth',start:137,end:67,duration:.13,gain:.035},
 'mech-shot':{wave:'sawtooth',start:94,end:43,duration:.19,gain:.038},
 'pilot-shot':{wave:'square',start:510,end:190,duration:.075,gain:.019},
 'ricochet':{wave:'triangle',start:820,end:490,duration:.052,gain:.012,minGap:75},
 'bumper':{wave:'triangle',start:1050,end:650,duration:.086,gain:.018,minGap:95},
 'armor-hit':{wave:'sawtooth',start:215,end:76,duration:.19,gain:.039},
 'pilot-hit':{wave:'triangle',start:180,end:49,duration:.25,gain:.035},
 'eject':{wave:'sawtooth',start:380,end:95,duration:.32,gain:.037},
 'barrier':{wave:'triangle',start:640,end:1070,duration:.14,gain:.020},
 'pickup':{wave:'sine',start:420,end:920,duration:.15,gain:.020},
 'victory':{wave:'triangle',start:390,end:550,duration:.18,gain:.021},
 'defeat':{wave:'triangle',start:240,end:85,duration:.25,gain:.022},
 // Deliberately quiet, short UI tones; existing SOUND FX preference governs them.
 'ui-select':{wave:'sine',start:540,end:660,duration:.055,gain:.008,minGap:55},
 'ui-back':{wave:'sine',start:480,end:360,duration:.065,gain:.007,minGap:55},
 'deploy':{wave:'triangle',start:330,end:495,duration:.14,gain:.015,minGap:150}
};
// v0.9.21 original offline procedural music: same Web Audio context as SFX.
// This is a tiny, consciously composed four-bar tonal pattern, not a copy
// or a streaming track. Audio starts only after a real player gesture.
let musicGesture=false,musicNext=0,musicStep=0,musicScene='';
function armMusic(){
 musicGesture=true;
 if(!comfort.music)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!window.rrAudio)window.rrAudio=new AC();
  if(window.rrAudio.state==='suspended')window.rrAudio.resume();
 }catch(_){}
}
document.addEventListener('pointerdown',armMusic,{passive:true});
function updateMusic(){
 if(!musicGesture||!comfort.music||document.hidden)return;
 const scene=(mode==='idle' || !menu.classList.contains('hidden'))?'menu':(!paused&&state?.winner<0?'combat':null);
 if(!scene)return;
 const ac=window.rrAudio;
 if(!ac||ac.state!=='running')return;
 if(musicScene!==scene){musicScene=scene;musicStep=0;musicNext=ac.currentTime+.035;}
 const beat=60/(scene==='menu'?96:116)/2; // steady quiet eighth notes
 const notes=[130.81,155.56,196.0,233.08,174.61,196.0,155.56,116.54];
 // Schedule only a short horizon; browser lifecycle/pause must stop cleanly.
 if(musicNext<ac.currentTime-.2)musicNext=ac.currentTime+.03;
 let scheduled=0;
 while(musicNext<ac.currentTime+.10&&scheduled++<2){
  const k=musicStep%16,at=musicNext;
  const pitch=notes[(Math.floor(k/2)+Math.floor(musicStep/16))%notes.length];
  if(k%2===0){
   const o=ac.createOscillator(),g=ac.createGain();
   o.type='triangle';o.frequency.setValueAtTime(pitch/2,at);
   g.gain.setValueAtTime(.0001,at);
   g.gain.linearRampToValueAtTime(scene==='menu'?.005:.004,at+.025);
   g.gain.exponentialRampToValueAtTime(.0001,at+beat*.88);
   o.connect(g).connect(ac.destination);o.start(at);o.stop(at+beat*.90);
  }
  if((scene==='combat'&&k%4===2)||(scene==='menu'&&k===6)){
   const o=ac.createOscillator(),g=ac.createGain();
   o.type='sine';o.frequency.setValueAtTime(pitch*2,at);
   g.gain.setValueAtTime(.0001,at);
   g.gain.linearRampToValueAtTime(.0025,at+.012);
   g.gain.exponentialRampToValueAtTime(.0001,at+beat*.3);
   o.connect(g).connect(ac.destination);o.start(at);o.stop(at+beat*.32);
  }
  musicNext+=beat;musicStep++;
 }
}

const lastAudioCue=new Map();
function audioCue(kind,x=null,y=null){
 if(!comfort.sound)return false;
 const cue=AUDIO_CUES[kind];if(!cue)return false;
 const now=performance.now();
 if(now-(lastAudioCue.get(kind)??-1e9)<(cue.minGap||0))return false;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  if(!window.rrAudio)window.rrAudio=new AC();
  const ac=window.rrAudio;if(ac.state==='suspended')ac.resume();
  const me=state?.tanks?.[mode==='guest'?1:0],distance=Number.isFinite(x)&&Number.isFinite(y)&&me?Math.hypot(x-me.x,y-me.y):0;
  const falloff=Math.max(.09,1-distance/1000),t=ac.currentTime;
  function tone(start,end,delay=0,vol=1,duration=cue.duration){
   const oscillator=ac.createOscillator(),gain=ac.createGain();
   oscillator.type=cue.wave;
   oscillator.frequency.setValueAtTime(Math.max(30,start),t+delay);
   oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+delay+duration);
   const level=Math.max(.0002,cue.gain*falloff*vol);
   gain.gain.setValueAtTime(.0001,t+delay);
   gain.gain.linearRampToValueAtTime(level,t+delay+.009);
   gain.gain.exponentialRampToValueAtTime(.0001,t+delay+duration);
   oscillator.connect(gain).connect(ac.destination);
   oscillator.start(t+delay);oscillator.stop(t+delay+duration+.008);
  }
  tone(cue.start,cue.end);
  if(kind==='victory'){tone(490,680,.14,.67,.17);tone(620,940,.27,.55,.20)}
  if(kind==='defeat')tone(170,60,.13,.65,.21);
  lastAudioCue.set(kind,now);
  return true;
 }catch(_){return false;}
}
// In-match audio controls share existing persisted preferences.
function pauseAudioControls(){
 return '<div class="pause-audio" role="group" aria-label="In-match audio controls"><span class="pause-audio-label">AUDIO</span>'+
  '<button type="button" data-action="toggle-sound" aria-pressed="'+comfort.sound+'">SFX · '+(comfort.sound?'ON':'OFF')+'</button>'+
  '<button type="button" data-action="toggle-music" aria-pressed="'+comfort.music+'">MUSIC · '+(comfort.music?'ON':'OFF')+'</button></div>';
}
function togglePauseAudio(setting,button){
 if(setting!=='sound'&&setting!=='music')return false;
 comfort[setting]=!comfort[setting];
 savePrefs();
 if(button){button.textContent=(setting==='sound'?'SFX':'MUSIC')+' · '+(comfort[setting]?'ON':'OFF');button.setAttribute?.('aria-pressed',String(comfort[setting]));}
 if(setting==='music'){musicScene='';if(comfort.music)armMusic();}
 else if(comfort.sound)audioCue('ui-select');
 return comfort[setting];
}
function updateVisuals(dt){visualClock+=dt;if(coachRemaining>0){coachRemaining=Math.max(0,coachRemaining-dt);if(coachRemaining===0)document.getElementById('field-coach')?.classList.add('hidden');}screenKick=Math.max(0,screenKick-dt*22);damagePulse=Math.max(0,damagePulse-dt*1.65);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.max(0,1-dt*3);p.vy*=Math.max(0,1-dt*3)}particles=particles.filter(p=>p.life>0)}


 // LAB E. Gameplay-only materials, separate from pilot dossier portraits or shop.
 // A skin ID changes three flat paint planes, never gameplay or team ownership.
 // Null armor/trim means: preserve existing per-player painted vehicle color.
// Four free OFFLINE starter materials. No commerce or network entitlement.
const HANGAR_KEY='rr-hangar-paint-v1';
const OPERATOR_EMBLEMS=Object.freeze({
 'mark.field':{label:'FIELD',glyph:'◇'},
 'mark.vector':{label:'VECTOR',glyph:'△',metric:'matches',target:3},
 'mark.ace':{label:'ACE',glyph:'✦',metric:'kos',target:10},
 'mark.command':{label:'COMMAND',glyph:'◆',metric:'wins',target:12}
});
let equippedEmblem='mark.field';
function emblemProgress(id,info=currentDossier()){
 const def=Object.prototype.hasOwnProperty.call(OPERATOR_EMBLEMS,id)?OPERATOR_EMBLEMS[id]:null;
 if(!def)return {eligible:false,current:0,target:0,metric:'unknown'};
 if(!def.metric)return {eligible:true,current:0,target:0,metric:'free'};
 const current=Number.isSafeInteger(info?.[def.metric])&&info[def.metric]>=0?info[def.metric]:0;
 return {eligible:current>=def.target,current,target:def.target,metric:def.metric};
}
const HANGAR_PAINTS=Object.freeze({
 'fieldgrid.standard':{label:'STANDARD'},
 'fieldgrid.moss':{label:'MOSS'},
 'fieldgrid.dune':{label:'DUNE'},
 'fieldgrid.oxide':{label:'OXIDE'},
 'fieldgrid.vanguard':{label:'VANGUARD',metric:'matches',target:5},
 'fieldgrid.veteran':{label:'VETERAN',metric:'wins',target:12}
});
let equippedPaint='fieldgrid.standard';
function paintProgress(id,info=currentDossier()){
 const def=Object.prototype.hasOwnProperty.call(HANGAR_PAINTS,id)?HANGAR_PAINTS[id]:null;
 if(!def)return {eligible:false,current:0,target:0,metric:'unknown'};
 if(!def.metric)return {eligible:true,current:0,target:0,metric:'free'};
 const current=Number.isSafeInteger(info?.[def.metric])&&info[def.metric]>=0?info[def.metric]:0;
 return {eligible:current>=def.target,current,target:def.target,metric:def.metric};
}
// Reward notices only reflect thresholds crossed by one successfully saved Solo match.
function unlocksFromResult(before,after){
 if(!before||!after)return [];
 const unlocked=[];
 for(const [id,def] of Object.entries(HANGAR_PAINTS))
  if(def.metric&&!paintProgress(id,before).eligible&&paintProgress(id,after).eligible)unlocked.push(def.label+' PAINT');
 for(const [id,def] of Object.entries(OPERATOR_EMBLEMS))
  if(def.metric&&!emblemProgress(id,before).eligible&&emblemProgress(id,after).eligible)unlocked.push(def.glyph+' '+def.label+' INSIGNIA');
 return unlocked;
}
function normalizePaint(id){return paintProgress(id).eligible?id:'fieldgrid.standard';}
function normalizeEmblem(id){return emblemProgress(id).eligible?id:'mark.field';}
// Keep v1 backward compatible: legacy paint-only files remain valid and
// retain their exact old JSON shape until an operator chooses an emblem.
function hangarRecord(paint,emblem){
 const data={version:1,equipped:paint};
 if(emblem!=='mark.field')data.emblem=emblem;
 return JSON.stringify(data);
}
function saveHangar(paint,emblem){
 const data=hangarRecord(paint,emblem);
 try{window.localStorage?.setItem(HANGAR_KEY,data);
  if(window.localStorage?.getItem(HANGAR_KEY)!==data)return false;
 }catch(_){return false;}
 equippedPaint=paint;equippedEmblem=emblem;return true;
}
function loadPaint(){
 equippedPaint='fieldgrid.standard';equippedEmblem='mark.field';
 try{const raw=JSON.parse(window.localStorage?.getItem(HANGAR_KEY)||'null');
  if(raw?.version===1){equippedPaint=normalizePaint(raw.equipped);equippedEmblem=normalizeEmblem(raw.emblem||'mark.field');}
 }catch(_){}
 return equippedPaint;
}
function equipPaint(id){
 if(!paintProgress(id).eligible)return false;
 return saveHangar(id,equippedEmblem);
}
function equipEmblem(id){
 if(!emblemProgress(id).eligible)return false;
 return saveHangar(equippedPaint,id);
}
const FIELDGRID_UNIT_SKINS=Object.freeze({
 'fieldgrid.standard':{
  pilot:{armor:'#607a85',shadow:'#294650',light:'#9fb7bc',trim:'#78949b'},
  tank:{armor:null,shadow:'#193845',light:'#bfe3e6',trim:null},
  mech:{armor:null,shadow:'#243d55',light:'#e5e5ff',trim:null}},
 'fieldgrid.moss':{
  pilot:{armor:'#71866f',shadow:'#354b3f',light:'#b5c6a0',trim:'#98ad7c'},
  tank:{armor:'#759376',shadow:'#354e42',light:'#c6d9ad',trim:'#93b58f'},
  mech:{armor:'#779480',shadow:'#3a5145',light:'#c2d3ae',trim:'#93ae96'}},
 'fieldgrid.dune':{
  pilot:{armor:'#b49c74',shadow:'#5e5142',light:'#ead8aa',trim:'#d2b788'},
  tank:{armor:'#c0a675',shadow:'#5c4f40',light:'#f0dfb0',trim:'#d5be89'},
  mech:{armor:'#b6a27f',shadow:'#615548',light:'#f0e0bd',trim:'#d3c398'}},
 'fieldgrid.oxide':{
  pilot:{armor:'#9e6858',shadow:'#512f31',light:'#d9a18c',trim:'#bf795f'},
  tank:{armor:'#a66d5b',shadow:'#573637',light:'#e5b5a2',trim:'#c4836f'},
  mech:{armor:'#a46c64',shadow:'#573940',light:'#dfaaa1',trim:'#be8479'}},
 'fieldgrid.vanguard':{
  pilot:{armor:'#648f9d',shadow:'#253f4d',light:'#a5cbd1',trim:'#80b5bd'},
  tank:{armor:'#5d8899',shadow:'#254454',light:'#afd5db',trim:'#78aebe'},
  mech:{armor:'#688c9d',shadow:'#2b4359',light:'#b9d4e1',trim:'#80acbb'}},
 'fieldgrid.veteran':{
  pilot:{armor:'#9e9070',shadow:'#514a3b',light:'#dbcaa0',trim:'#d1b873'},
  tank:{armor:'#9a8b67',shadow:'#4b4639',light:'#e0d5ac',trim:'#c0a468'},
  mech:{armor:'#a09470',shadow:'#534a3d',light:'#dfd1a6',trim:'#c4af77'}}
});
function resolveUnitMaterials(unit,teamPaint,skinId='fieldgrid.standard'){
 const preset=FIELDGRID_UNIT_SKINS[skinId]||FIELDGRID_UNIT_SKINS['fieldgrid.standard'];
 const role=preset[unit]||preset.pilot;
 return {armor:role.armor||teamPaint,shadow:role.shadow,light:role.light,
         trim:role.trim||teamPaint,team:teamPaint};
}

function drawTopTank(c,paint,parked=false,trackLeft=0,trackRight=0,recoil=0,suspension=0,skinId='fieldgrid.standard'){
 const skin=resolveUnitMaterials('tank',paint,skinId);
 // Art contract v0.9.6: vehicle local +X is FORWARD (toward the barrel).
 // Tracks run parallel to +X at BOTH sides of the hull. Mirror them from
 // one geometry definition, never draw the right tread with separate offsets.
 c.save();c.translate(-2.2*recoil,Math.sin((trackLeft+trackRight)*.35)*suspension*.35);c.lineJoin='miter';c.lineWidth=2;c.strokeStyle='#071820';
 for(const side of [-1,1]){
   c.save();c.scale(1,side);
   // Road track and six identically-spaced treads: all seams are perpendicular to travel.
   c.fillStyle='#091b25';c.fillRect(-27,15,54,12);
   c.strokeStyle='#06131c';c.strokeRect(-27,15,54,12);
   c.fillStyle='#36505d';c.fillRect(-24,17,48,8);
   c.fillStyle='#7b929b';
   const phase=side<0?trackLeft:trackRight;
   const offset=((phase%8)+8)%8;
   for(let n=0;n<6;n++){const x=-24+((3+n*8+offset)%48);c.fillRect(x,16,2,10);}
   // Dark end caps mask the cycling belt seams at either end.
   c.fillStyle='#091b25';c.fillRect(-27,15,3,12);c.fillRect(24,15,3,12);
   c.fillStyle='#142b38';c.fillRect(-20,25,40,2);
   c.restore();
 }
 // Center chassis is bilaterally symmetric; armor plate has a visible forward nose.
 c.fillStyle='#0a1d27';c.fillRect(-23,-16,46,32);
 c.fillStyle=skin.armor;c.fillRect(-22,-15,43,30);c.strokeStyle='#071a22';c.strokeRect(-22,-15,43,30);
 c.fillStyle=skin.shadow;c.fillRect(-17,-11,34,22);
 c.fillStyle='#3d6673';c.fillRect(-17,-11,7,22);
 c.fillStyle=skin.armor;c.fillRect(-12,-10,24,20);c.strokeRect(-12,-10,24,20);
 c.fillStyle=skin.light;c.fillRect(-7,-5,8,10);
 // A single centerline weapon (not an extra sideways track or misaligned gun).
 c.fillStyle='#081924';c.fillRect(10,-6,25,12);c.strokeRect(10,-6,25,12);
 c.fillStyle='#477e8b';c.fillRect(13,-3,22,6);
 c.fillStyle=skin.armor;c.fillRect(33,-5,6,10);
 c.fillStyle='#eaf9f5';c.fillRect(38,-3,3,6);
 if(parked){c.strokeStyle='#83bba9';c.lineWidth=1.7;c.strokeRect(-29,-30,58,60)}
 c.restore();
}
function drawTopMech(c,paint,parked=false,stride=0,recoil=0,bob=0,skinId='fieldgrid.standard'){
 const skin=resolveUnitMaterials('mech',paint,skinId);
 // True top-down walker: two separate articulated legs, shoulders and central cockpit.
 // Readable at phone scale; the dark gaps distinguish the mech from tracked tanks.
 // Weight is subtle and only affects this unit's own art, not physics.
 c.save();c.translate(-1.3*recoil,bob);c.lineWidth=2;c.strokeStyle='#071723';
 for(const side of [-1,1]){
   c.save();c.scale(1,side);
   // Alternating walking gait; mirrored limbs retain their geometry at rest.
   c.translate(side*stride,0);
   c.fillStyle='#111f2c';c.fillRect(-25,12,17,12);c.fillRect(-22,19,15,17);
   c.fillStyle=skin.armor;c.fillRect(-23,15,12,9);c.strokeRect(-23,15,12,9);
   c.fillStyle='#6c84a0';c.fillRect(-20,28,16,7);c.strokeRect(-20,28,16,7);
   // Forward shoulder/arm, separated visibly from the torso.
   c.fillStyle=skin.armor;c.fillRect(2,17,17,12);c.strokeRect(2,17,17,12);
   c.fillStyle='#192a3e';c.fillRect(13,19,12,7);c.strokeRect(13,19,12,7);
   c.restore();
 }
 c.fillStyle='#17283a';c.fillRect(-14,-17,32,34);
 c.fillStyle=skin.armor;c.fillRect(-13,-15,27,30);c.strokeRect(-13,-15,27,30);
 c.fillStyle=skin.shadow;c.fillRect(-8,-10,16,20);
 c.fillStyle=skin.light;c.fillRect(-3,-8,9,16);
 c.fillStyle='#162639';c.fillRect(12,-6,20,12);c.strokeRect(12,-6,20,12);
 c.fillStyle=skin.armor;c.fillRect(27,-5,8,10);c.fillStyle='#e6f8ff';c.fillRect(33,-3,5,6);
 if(parked){c.strokeStyle='#cfb4fd';c.lineWidth=2;c.strokeRect(-29,-38,67,76)}
 c.restore();
}
// Main lobby uses the actual in-game tank renderer. No stock-art background.
// Live showroom uses actual game renderers — no disconnected asset images.
let lobbyDrawClock=0,lobbyPreviewClock=0,lobbyLastUnit=-1;
function drawLobbyPreview(dt){
 const preview=document.getElementById('menu-preview');
 if(!preview?.getContext||menu.classList.contains('hidden'))return;
 const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 if(!reduced)lobbyPreviewClock+=Math.max(0,dt);
 lobbyDrawClock+=Math.max(0,dt);
 if(lobbyDrawClock<1/24)return;
 lobbyDrawClock=0;
 const showMech=!reduced&&Math.floor(lobbyPreviewClock/8)%2===1;
 const index=showMech?1:0;
 if(index!==lobbyLastUnit){
  const type=document.getElementById('home-unit-type'),name=document.getElementById('home-unit-name');
  if(type)type.textContent=showMech?'MECH / FIELD UNIT':'TANK / FIELD UNIT';
  if(name)name.textContent=showMech?'MECHANIZED RESPONSE':'ARMORED RESPONSE';
  lobbyLastUnit=index;
 }
 const c=preview.getContext('2d'),w=preview.width,h=preview.height;
 c.clearRect(0,0,w,h);
 c.fillStyle='#142f3d';c.fillRect(0,0,w,h);
 c.strokeStyle='#335766';c.lineWidth=2;
 for(let x=17;x<w;x+=78){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}
 for(let y=22;y<h;y+=78){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
 c.fillStyle='#203f4c';c.fillRect(0,h*.72,w,17);
 c.fillStyle='#779da7';c.fillRect(0,h*.72,w,3);
 // Subtle conveyor-like track below the unit, not a strobing UI animation.
 const phase=reduced?0:lobbyPreviewClock*.6;
 c.globalAlpha=.25;c.strokeStyle='#81bec7';c.lineWidth=1;
 c.beginPath();c.arc(w*.5,h*.43,109,0,Math.PI*2);c.stroke();
 c.globalAlpha=1;
 c.save();c.translate(w*.51,h*.40);
 c.rotate(-.25+(reduced?0:Math.sin(phase)*.14));
 c.scale(2.55,2.55);
 const amount=!reduced?lobbyPreviewClock:0;
 if(showMech)drawTopMech(c,'#d5bb77',false,Math.sin(amount*2.3)*1.7,0,Math.sin(amount*3)*.5,equippedPaint);
 else drawTopTank(c,'#6bcde0',false,amount*10,amount*10,0,.38,equippedPaint);
 c.restore();
 c.fillStyle='#73c7d6';c.globalAlpha=.4;
 c.fillRect(w*.12,h*.26,55,2);c.fillRect(w*.77,h*.66,47,2);
 c.globalAlpha=1;
}
function drawTopPilot(c,paint,shooting=false,stride=0,recoil=0,bob=0,skinId='fieldgrid.standard',squadPaint=false){
 // v0.9.45 FIELDGRID P-03: compact overhead operator; no exposed legs.
 // +X is forward for the pilot, tank, mech AND the real projectile muzzle.
 // Only shoulders and short arms mirror across Y; two hands hold ONE pistol.
 // No foreshortened face/profile, segmented circles, fake depth or glow rings.
 const skin=resolveUnitMaterials('pilot',paint,skinId);
 const armorPaint=squadPaint&&skinId==='fieldgrid.standard'?paint:skin.armor;
 // Movement rhythm is driven by real velocity in render(), not fake foot steps.
 // Only the unified vest and shoulder plates move. Helmet, hands, pistol,
 // muzzle and projectile origin stay on the exact same forward axis.
 const gait=clamp(stride,-3.5,3.5);
 c.save();c.translate(-recoil*.15,bob*.25);
 c.lineJoin='miter';c.lineWidth=1.6;c.strokeStyle='#071923';
 // Tiny grounded upper-body sway while moving, zero movement at rest.
 // The rear vest sways as ONE solid block; no boots/knees are drawn.
 c.save();c.translate(-Math.abs(gait)*.18,gait*.32);
 c.fillStyle='#071923';c.fillRect(-20,-10,28,20);
 c.fillStyle=armorPaint;c.fillRect(-18,-8,24,16);
 c.fillStyle=skin.shadow;c.fillRect(-16,-7,8,14);
 c.fillStyle=skin.light;c.fillRect(-14,-8,3,15);
 c.fillStyle='#132c38';c.fillRect(-19,-5,4,10);
 c.fillStyle=skin.trim;c.fillRect(-17,-8,2,3);
 c.restore();
 // Mirrored shoulder plates gently counter-shift along the pilot's forward
 // axis; the actual two-hand gun hold remains fixed and fully aligned.
 // There is deliberately no counterstepping lower-body animation.
 for(const side of [-1,1]){
  c.save();c.scale(1,side);
  // Both shoulders subtly travel in opposing phases. No leg geometry.
  c.save();c.translate(side*gait*.5,0);
  c.fillStyle='#071923';c.fillRect(-9,11,17,11);
  c.fillStyle=armorPaint;c.fillRect(-7,13,14,7);
  c.fillStyle=skin.light;c.fillRect(-6,13,10,2);
  c.fillStyle=skin.team;c.fillRect(-7,19,6,2);
  c.restore();
  // Weapon-gripping forearms do not move with the animated shoulder plates,
  // so drawn muzzle position stays in sync with actual sidearm projectiles.
  // Each arm is one angular armored bent limb — not a second barrel.
  c.fillStyle='#071923';c.beginPath();
  c.moveTo(6,16);c.lineTo(11,15);c.lineTo(20,6);
  c.lineTo(20,3);c.lineTo(16,3);c.lineTo(8,12);c.closePath();c.fill();
  c.fillStyle=armorPaint;c.beginPath();
  c.moveTo(9,14);c.lineTo(12,14);c.lineTo(19,6);
  c.lineTo(19,5);c.lineTo(17,5);c.lineTo(9,12);c.closePath();c.fill();
  c.fillStyle=skin.light;c.fillRect(16,6,3,2);
  // One glove per hand on a shared centerline sidearm.
  c.fillStyle='#071923';c.fillRect(16,2,8,6);
  c.fillStyle='#bdcac8';c.fillRect(18,3,5,3);
  c.restore();
 }
 // Compact chamfered helmet, viewed entirely from above — no face in profile.
 c.fillStyle='#071923';c.beginPath();
 c.moveTo(-11,-7);c.lineTo(-7,-12);c.lineTo(6,-12);
 c.lineTo(12,-7);c.lineTo(12,7);c.lineTo(6,12);
 c.lineTo(-7,12);c.lineTo(-11,7);c.closePath();c.fill();
 c.fillStyle=armorPaint;c.fillRect(-8,-9,17,18);
 c.fillStyle=skin.shadow;c.fillRect(-7,4,15,4);
 c.fillStyle=skin.light;c.fillRect(-6,-9,11,3);
 // Narrow forward visor band makes facing direction visible at zoomed-out scale.
 c.fillStyle='#112a36';c.fillRect(6,-6,5,12);
 c.fillStyle=skin.trim;c.fillRect(9,-5,2,10);
 c.fillStyle='#d5eeea';c.fillRect(10,-3,1,6);
 // Shared real weapon muzzle remains exactly local-space (28,2).
 c.fillStyle='#071923';c.fillRect(17,0,11,4);
 c.fillStyle='#849fa8';c.fillRect(19,0,7,1);
 c.fillStyle='#3f5963';c.fillRect(18,4,5,2);
 c.fillStyle='#e1f3d8';c.fillRect(PILOT_MUZZLE_X-1,PILOT_MUZZLE_Y-1,2,2);
 if(shooting){c.fillStyle='#ffda91';c.beginPath();
  c.moveTo(PILOT_MUZZLE_X+1,2);c.lineTo(PILOT_MUZZLE_X+5,-2);
  c.lineTo(PILOT_MUZZLE_X+4,2);c.lineTo(PILOT_MUZZLE_X+5,6);
  c.closePath();c.fill();}
 c.restore();
}
// Four fixed WORLD-SPACE corner brackets, not a rotating ring/turret silhouette.
// Team color replaces player color for team matches; never stack both locators.
function drawPilotLocator(c,x,y,color){
 c.save();c.strokeStyle=color;c.globalAlpha=.54;c.lineWidth=1.4;
 c.beginPath();
 for(const sx of [-1,1])for(const sy of [-1,1]){
  const bx=x+sx*26,by=y+sy*25;
  c.moveTo(bx-sx*6,by);c.lineTo(bx,by);c.lineTo(bx,by-sy*6);
 }
 c.stroke();c.restore();
}
// v0.9.22-dev5: final small vehicle-only pullback after owner phone feedback.
// Keep pilot at approved scale for future pilot-only Close Quarters.
const CAMERA_APRON=420;
function unitTargetZoom(t){
 if(!t)return 1.00;
 if(t.onFoot)return 1.07; // Explicitly unchanged from dev3 / dev4.
 const v=currentVehicle(t);
 return v?.type==='mech'?.77:v?.type==='tank'?.82:1.00;
}
function cameraZoom(t=state?.tanks?.[mode==='guest'?1:0]){
 return mazeGrid?Math.max(unitTargetZoom(t),W/(worldW+CAMERA_APRON*2),H/(worldH+CAMERA_APRON*2)):1;
}
function render(dt=STEP){const c=ctx;c.clearRect(0,0,W,H);c.save();if(screenKick>0)c.translate(Math.sin(visualClock*130)*screenKick,Math.cos(visualClock*98)*screenKick*.5);// Widened tactical camera. The perimeter includes enough rendered exterior
 // floor tiles so wide Android screens do not reveal blank side gutters.
 const me=mode==='guest'?1:0,localTank=state.lives[me]>0?state.tanks[me]:(state.tanks.find((t,i)=>state.lives[i]>0)||state.tanks[me]||state.tanks[0]);
 const zoomTarget=cameraZoom(localTank);
 if(!Number.isFinite(camera.zoom))camera.zoom=zoomTarget;
 const zoomFloor=mazeGrid?Math.max(W/(worldW+CAMERA_APRON*2),H/(worldH+CAMERA_APRON*2)):1;
 camera.zoom=Math.max(zoomFloor,camera.zoom+(zoomTarget-camera.zoom)*(1-Math.exp(-Math.min(.1,Math.max(0,dt))*5.2)));
 const zoom=camera.zoom,viewW=W/zoom,viewH=H/zoom;
 const apron=mazeGrid?CAMERA_APRON:0;const desiredX=clamp((localTank?.x||W/2)-viewW/2,-apron,Math.max(-apron,worldW+apron-viewW)),desiredY=clamp((localTank?.y||H/2)-viewH/2,-apron,Math.max(-apron,worldH+apron-viewH));
 const follow=1-Math.exp(-Math.min(.1,dt)*13);camera.x+=(desiredX-camera.x)*follow;camera.y+=(desiredY-camera.y)*follow;if(!mazeGrid){camera.x=0;camera.y=0}
 c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);
 // Paint past the playable perimeter so a small camera pullback remains
 // immersive rather than showing untextured side gutters.
 c.fillStyle='#112631';c.fillRect(camera.x-8,camera.y-8,viewW+16,viewH+16);
 c.fillStyle='#101f2b';c.fillRect(0,0,worldW,worldH);
 // Modular FIELDGRID surface, deterministic from cell coordinates with no per-frame randomness.
 // Culling ensures large mazes don't draw decorative details outside the camera.
 const left=camera.x-56,right=camera.x+viewW+56,top=camera.y-56,bottom=camera.y+viewH+56;
 const tile=132,apronCells=Math.ceil(CAMERA_APRON/tile)+1;
 const xmin=Math.max(-apronCells,Math.floor(left/tile)),xmax=Math.min(Math.ceil(worldW/tile)+apronCells,Math.ceil(right/tile)),ymin=Math.max(-apronCells,Math.floor(top/tile)),ymax=Math.min(Math.ceil(worldH/tile)+apronCells,Math.ceil(bottom/tile));
 for(let gy=ymin;gy<ymax;gy++)for(let gx=xmin;gx<xmax;gx++){
   const x=gx*tile,y=gy*tile,hash=(gx*19+gy*37+currentSeed%23)%11;
   if(x<0||y<0||x>=worldW||y>=worldH){c.fillStyle='#10242e';c.fillRect(x+1,y+1,tile-2,tile-2);c.strokeStyle='#25414b';c.lineWidth=1;c.strokeRect(x+2,y+2,tile-4,tile-4);continue;}
   c.fillStyle=hash%3===0?'#132632':hash%3===1?'#142733':'#162a36';c.fillRect(x+1,y+1,tile-2,tile-2);
   c.strokeStyle='#29424e';c.lineWidth=1;c.strokeRect(x+2,y+2,tile-4,tile-4);
   c.fillStyle='#29424e';for(const dx of [12,tile-16])for(const dy of [12,tile-16])c.fillRect(x+dx,y+dy,3,3);
   if(hash===0||hash===6){c.fillStyle='#264654';c.fillRect(x+15,y+16,36,4);c.fillRect(x+15,y+22,20,2)}
   if(hash===4){c.fillStyle='#33454b';c.fillRect(x+tile-32,y+tile-24,20,8);c.fillStyle='#91773d';c.fillRect(x+tile-32,y+tile-26,8,2)}
   if(hash===8){c.fillStyle='#314c54';c.font='800 13px system-ui';c.textAlign='left';c.fillText('FG',x+17,y+tile-18)}
   if(hash===2){c.fillStyle='#564f3b';for(let stripe=0;stripe<4;stripe++)c.fillRect(x+65+stripe*12,y+tile-22,7,3)}
   if(hash===10){c.strokeStyle='#345261';c.lineWidth=2;c.strokeRect(x+tile-40,y+tile-40,24,24)}
 }
 // Facility perimeter is solid in play and visually signals a different layer than floor tiles.
 c.fillStyle='#253f4e';c.fillRect(0,0,worldW,15);c.fillRect(0,worldH-15,worldW,15);c.fillRect(0,0,15,worldH);c.fillRect(worldW-15,0,15,worldH);
 c.fillStyle='#66a7b3';c.fillRect(0,0,worldW,3);c.fillRect(0,worldH-3,worldW,3);c.fillRect(0,0,3,worldH);c.fillRect(worldW-3,0,3,worldH);
 for(const w of wallSet){
   if(w.x>right+26||w.x+w.w<left-26||w.y>bottom+26||w.y+w.h<top-26)continue;
   c.fillStyle='#071620';c.fillRect(w.x+5,w.y+7,w.w,w.h);
   c.fillStyle='#293f4d';c.fillRect(w.x,w.y,w.w,w.h);
   c.fillStyle='#456574';c.fillRect(w.x+2,w.y+2,w.w-4,Math.max(3,w.h-5));
   c.fillStyle='#304c5b';c.fillRect(w.x+4,w.y+5,w.w-8,Math.max(2,w.h-10));
   c.fillStyle='#83a7b1';if(w.w>w.h)c.fillRect(w.x+7,w.y+3,Math.max(0,w.w-14),2);else c.fillRect(w.x+3,w.y+7,2,Math.max(0,w.h-14));
   c.fillStyle='#9b8250';if(w.w>w.h){if(w.w>70)c.fillRect(w.x+w.w/2-7,w.y+4,14,3)}else if(w.h>70)c.fillRect(w.x+4,w.y+w.h/2-7,3,14);
   c.fillStyle='#162a36';if(w.w>w.h){for(let x=w.x+25;x<w.x+w.w-10;x+=65)c.fillRect(x,w.y+7,3,4)}else for(let y=w.y+25;y<w.y+w.h-10;y+=65)c.fillRect(w.x+7,y,4,3);
 }
 
for(const bump of bumpers){const glow=2.8*Math.sin(visualClock*4);c.beginPath();c.arc(bump.x,bump.y,bump.r+glow,0,Math.PI*2);c.fillStyle='#34464b';c.fill();c.strokeStyle='#ffd67d';c.lineWidth=4;c.stroke();c.beginPath();c.arc(bump.x,bump.y,11,0,Math.PI*2);c.fillStyle='#ffc76a';c.fill()}
 for(const p of state.pickups||[]){const def=PICKUPS[p.type];if(!def)continue;
   const pulse=Math.sin(visualClock*4.8+p.x*.013),radius=24+pulse*2.5;
   c.save();c.translate(p.x,p.y);
   c.globalAlpha=.16;c.fillStyle=def.color;c.beginPath();c.arc(0,0,radius+9,0,Math.PI*2);c.fill();
   c.globalAlpha=1;c.fillStyle='#071e29';c.fillRect(-21,-21,42,42);c.strokeStyle=def.color;c.lineWidth=2;c.strokeRect(-21,-21,42,42);
   c.strokeStyle='#b8e4e2';c.globalAlpha=.8;c.lineWidth=2;
   for(const sx of [-1,1])for(const sy of [-1,1]){c.beginPath();c.moveTo(sx*24,sy*13);c.lineTo(sx*24,sy*24);c.lineTo(sx*13,sy*24);c.stroke();}
   c.globalAlpha=1;c.fillStyle=def.color;c.font='900 23px monospace';c.textAlign='center';c.fillText(def.label,0,8);
   c.font='700 9px monospace';c.fillStyle='#d0e9ec';c.fillText(p.type.toUpperCase(),0,35);
   c.restore();
 }
 if(isPilotMatch())for(const v of state.vehicles){if(v.occupant!==-1)continue;
   if(v.armor>0){c.beginPath();c.arc(v.x,v.y,v.type==='mech'?42:35,0,Math.PI*2);c.strokeStyle=v.type==='mech'?'#6a5486':'#3e7568';c.lineWidth=2;c.stroke();}
   c.save();c.translate(v.x,v.y);c.rotate(v.a);
   if(v.armor<=0){c.fillStyle='#192b31';c.fillRect(-19,-18,38,36);c.strokeStyle='#fd7858';c.lineWidth=3;c.strokeRect(-19,-18,38,36);}
   else {c.globalAlpha=.64;
    if(v.type==='mech')drawTopMech(c,'#b69aff',true);else drawTopTank(c,'#72c3a8',true);}
   c.restore();if(v.armor>0){const me=state.tanks[mode==='guest'?1:0];const near=me?.onFoot&&Math.hypot(me.x-v.x,me.y-v.y)<68;
     if(near){ // The real ENTER action is in the touch HUD; a floating label
       // used to cover the small pilot standing beside this vehicle.
       c.strokeStyle='#aaf3da';c.lineWidth=1.5;c.beginPath();c.arc(v.x,v.y,36+Math.sin(visualClock*5)*2,0,Math.PI*2);c.stroke();
      }}
 }
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]<=0)continue;
 if(state.config?.teamMode!=='ffa'&&!t.onFoot){c.beginPath();c.arc(t.x,t.y,29,0,Math.PI*2);c.strokeStyle=teamOf(i)===0?'#60dfff':'#ffb06e';c.lineWidth=4;c.stroke()}
 if(t.onFoot)drawPilotLocator(c,t.x,t.y,state.config?.teamMode!=='ffa'?(teamOf(i)===0?'#60dfff':'#ffb06e'):combatColor(i));
 const paint=combatColor(i);
 c.save();c.translate(t.x,t.y);c.rotate(t.a);
 if(t.onFoot){
   const stride=Math.sin(visualClock*15+i*1.7)*Math.min(3.5,Math.hypot(t.vx,t.vy)/65);
   // No permanent ring. Fixed world-space FIELDGRID brackets render behind the operator.
   drawTopPilot(c,paint,t.flash>0,stride,t.recoil||0,Math.sin(visualClock*15+i*1.7)*Math.min(.45,Math.hypot(t.vx,t.vy)/400),mode==='solo'&&i===0?equippedPaint:'fieldgrid.standard',state.config?.teamMode!=='ffa');
   c.restore();
   if(t.ejectAnim>0){c.save();c.globalAlpha=Math.min(.7,t.ejectAnim/.62);c.strokeStyle='#e5faff';c.lineWidth=2;c.beginPath();c.arc(t.x,t.y,18+(1-t.ejectAnim/.62)*22,0,Math.PI*2);c.stroke();c.restore();}
 }else{
 if(t.shield>0){c.globalAlpha=.65+.25*Math.sin(t.shield*15)}
 (currentVehicle(t)?.type==='mech'?drawTopMech(c,paint,false,Math.sin(visualClock*10+i*1.9)*Math.min(3.2,Math.hypot(t.vx,t.vy)/55),t.recoil||0,Math.sin(visualClock*20+i*3.8)*Math.min(.65,Math.hypot(t.vx,t.vy)/320),mode==='solo'&&i===0?equippedPaint:'fieldgrid.standard'):drawTopTank(c,paint,false,t.trackLeft||0,t.trackRight||0,t.recoil||0,Math.min(1,Math.hypot(t.vx,t.vy)/240),mode==='solo'&&i===0?equippedPaint:'fieldgrid.standard'));if(t.flash>0){c.fillStyle='#fff3a0';c.beginPath();c.arc(39,0,8+t.flash*70,0,Math.PI*2);c.fill()}c.restore();
 if(isPilotMatch()){const v=state.vehicles?.[t.vehicleId];if(v){c.fillStyle='#16313b';c.fillRect(t.x-19,t.y+29,38,5);c.fillStyle='#79eab2';c.fillRect(t.x-19,t.y+29,38*v.armor/vehicleDef(v).armor,5);}}}
 if(t.powerType&&t.powerTimer>0&&PICKUPS[t.powerType]){c.fillStyle=PICKUPS[t.powerType].color;c.font='800 10px monospace';c.textAlign='center';c.fillText(PICKUPS[t.powerType].name+' '+Math.ceil(t.powerTimer)+'s',t.x,t.y+49)}
 if(t.shield>0){c.beginPath();c.arc(t.x,t.y,32+Math.sin(t.shield*10)*2,0,Math.PI*2);c.strokeStyle=paint;c.globalAlpha=clamp(t.shield/1.8*(t.onFoot?.42:.8),0,t.onFoot?.42:.8);c.lineWidth=t.onFoot?1.8:3;c.stroke();c.globalAlpha=1}
 c.fillStyle=paint;c.font='bold 13px system-ui';c.textAlign='center';
 // Ground personnel stand close to parked vehicles. Move their label
 // to the side, rather than painting it across the abandoned tank.
 c.fillText(i<state.humanCount?'P'+(i+1):state.config?.teamMode==='teams'&&friendly(i,mode==='guest'?1:0)?'ALLY '+(i-state.humanCount+1):'AI'+(i-state.humanCount+1),t.x+(t.onFoot?42:0),t.y+(t.onFoot?-18:-38));
 if(i===(mode==='guest'?1:0)){
  c.beginPath();
  if(t.onFoot){c.moveTo(t.x-30,t.y);c.lineTo(t.x-40,t.y-6);c.lineTo(t.x-40,t.y+6);}
  else{c.moveTo(t.x,t.y-59);c.lineTo(t.x-8,t.y-71);c.lineTo(t.x+8,t.y-71);}
  c.closePath();c.fillStyle='#ffffff';c.fill();
 }}
 for(const b of state.bullets){
   const foot=b.kind==='sidearm',heavy=b.kind==='mech';
   const length=Math.min(foot?10:heavy?24:19,Math.hypot(b.vx,b.vy)*.037);
   c.beginPath();c.moveTo(b.x-b.vx/405*length,b.y-b.vy/405*length);c.lineTo(b.x,b.y);
   c.strokeStyle=foot?'#d9f3e8':combatColor(b.owner);c.lineWidth=foot?2.5:heavy?6:4;c.stroke();
   c.beginPath();c.arc(b.x,b.y,foot?3.2:heavy?8:6,0,Math.PI*2);
   c.fillStyle=foot?'#dbffd8':'#f8ffff';c.shadowColor=combatColor(b.owner);c.shadowBlur=foot?3:heavy?17:12;c.fill();c.shadowBlur=0;
   if(heavy){c.beginPath();c.arc(b.x,b.y,11,0,Math.PI*2);c.strokeStyle='#c5a6ff';c.lineWidth=2;c.stroke();}
 }
 // Short, readable impact rings; effects are serialized for nearby-play guests.
 for(const fx of state.fxEvents||[]){
   if(fx.kind!=='hit'&&fx.kind!=='armor'&&fx.kind!=='eject'&&fx.kind!=='bounce'&&fx.kind!=='guard')continue;
   const span=fx.kind==='eject'?.8:fx.kind==='hit'?.75:fx.kind==='armor'?.55:fx.kind==='guard'?.5:.4;const progress=1-clamp((fx.ttl||0)/span,0,1);
   const radius=fx.kind==='eject'?20+progress*48:fx.kind==='hit'?8+progress*33:fx.kind==='armor'?15+progress*19:fx.kind==='guard'?18+progress*29:4+progress*12;
   c.save();c.globalAlpha=(fx.kind==='bounce'?.5:.75)*(1-progress);c.strokeStyle=fx.kind==='eject'?'#f6e4bd':fx.kind==='hit'?'#fff0bf':fx.kind==='armor'?'#a8ecfa':fx.kind==='guard'?'#bfa6ff':'#9fd9f3';
   c.lineWidth=fx.kind==='eject'?4:2.5;c.beginPath();
   // Angular armor plate strike versus the rounded operator-hit pulse.
   if(fx.kind==='armor'){c.moveTo(fx.x,fx.y-radius);c.lineTo(fx.x+radius,fx.y);c.lineTo(fx.x,fx.y+radius);c.lineTo(fx.x-radius,fx.y);c.closePath();}
   else c.arc(fx.x,fx.y,radius,0,Math.PI*2);
   c.stroke();
   if((fx.kind==='armor'||fx.kind==='hit'||fx.kind==='eject')&&progress<.76){
    const rays=fx.kind==='eject'?9:fx.kind==='armor'?4:7;
    c.lineWidth=fx.kind==='eject'?3:2;
    for(let n=0;n<rays;n++){
     const a=n*Math.PI*2/rays,inner=radius+5,outer=inner+(1-progress)*12;
     c.beginPath();c.moveTo(fx.x+Math.cos(a)*inner,fx.y+Math.sin(a)*inner);
     c.lineTo(fx.x+Math.cos(a)*outer,fx.y+Math.sin(a)*outer);c.stroke();
    }
   }
   c.restore();
 }
 for(const p of particles){c.globalAlpha=clamp(p.life/p.maxLife,0,1);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size)}c.globalAlpha=1;
 c.restore();
 // Help a recently ejected pilot recover without a map-reading tutorial.
 // Never expose an enemy's position or draw this when already near a vehicle.
 if(state.lives[me]>0&&localTank?.onFoot){
   const target=closestAvailableVehicle(me);
   if(target){const tx=(target.x-camera.x)*zoom,ty=(target.y-camera.y)*zoom;
    if(tx<30||tx>W-30||ty<30||ty>H-30){
      const cx=W/2,cy=H/2,angle=Math.atan2(ty-cy,tx-cx);
      const radius=Math.min(W*.37,H*.36);
      const px=clamp(cx+Math.cos(angle)*radius,52,W-52),py=clamp(cy+Math.sin(angle)*radius,95,H-63);
      c.save();c.translate(px,py);c.rotate(angle);c.fillStyle='#bbffda';c.strokeStyle='#06352f';c.lineWidth=3;
      c.beginPath();c.moveTo(15,0);c.lineTo(-4,-10);c.lineTo(-4,10);c.closePath();c.fill();c.stroke();c.restore();
      c.fillStyle='#ccffe7';c.font='900 13px system-ui';c.textAlign='center';
      c.fillText(vehicleDef(target).name,px,py+24);
    }
   }
 }
 if(mazeGrid){const mw=clamp(Math.round(W*.16),100,150),mh=Math.round(mw*worldH/worldW),mx=W-mw-12,my=15;
 c.fillStyle='#071722ed';c.fillRect(mx-5,my-5,mw+10,mh+10);c.strokeStyle='#5b8997';c.lineWidth=1;c.strokeRect(mx-5,my-5,mw+10,mh+10);
 // FIELDGRID radar is an instrument, not a floating decorative card.
 c.strokeStyle='#8cd3db';c.lineWidth=2;for(const sx of [mx-5,mx+mw+5])for(const sy of [my-5,my+mh+5]){const dx=sx<mx?1:-1,dy=sy<my?1:-1;c.beginPath();c.moveTo(sx+dx*12,sy);c.lineTo(sx,sy);c.lineTo(sx,sy+dy*12);c.stroke();}
 c.save();c.translate(mx,my);
 // Constrain *all* minimap markers and deployment rings to the actual radar panel.
 // Without this, near-edge deployment rings spill across its frame and HUD.
 c.beginPath();c.moveTo(0,0);c.lineTo(mw,0);c.lineTo(mw,mh);c.lineTo(0,mh);c.closePath();c.clip();
 c.scale(mw/worldW,mh/worldH);c.fillStyle='#19313e';c.fillRect(0,0,worldW,worldH);
 c.fillStyle='#789ba7';for(const w of wallSet)c.fillRect(w.x,w.y,w.w,w.h);if(isPilotMatch()){for(const v of state.vehicles)if(v.occupant===-1&&v.armor>0){c.fillStyle=v.type==='mech'?'#d7a8ff':'#74e0a6';c.fillRect(v.x-28,v.y-28,56,56);}}
 if(state.vehicleBeacon?.ttl>0){c.strokeStyle='#fff6bf';c.lineWidth=19;c.beginPath();c.arc(state.vehicleBeacon.x,state.vehicleBeacon.y,55+Math.sin(visualClock*6)*15,0,Math.PI*2);c.stroke();}
 for(let i=0;i<state.tanks.length;i++){if(state.lives[i]<=0)continue;const t=state.tanks[i],me=mode==='guest'?1:0;if(i!==me&&Math.hypot(t.x-state.tanks[me].x,t.y-state.tanks[me].y)>400)continue;c.beginPath();c.arc(t.x,t.y,37,0,Math.PI*2);c.fillStyle=combatColor(i);c.fill()}
 // Nearby hostile gunfire briefly appears as a *rough* sound ring, not a permanent wallhack.
 const local=state.tanks[me];if(local)for(const fx of (state.fxEvents||[])){if(fx.kind!=='shot'||!(fx.ttl>0)||!Number.isInteger(fx.owner)||fx.owner<0||fx.owner>=state.tanks.length||friendly(fx.owner,me))continue;
   if(Math.hypot(fx.x-local.x,fx.y-local.y)>1000)continue;
   c.globalAlpha=.75*Math.min(1,fx.ttl/.4);c.strokeStyle='#ffd17c';c.lineWidth=22;c.beginPath();c.arc(fx.x,fx.y,80+(1.8-fx.ttl)*95,0,Math.PI*2);c.stroke();}
 c.globalAlpha=1;c.strokeStyle='#ffffff';c.lineWidth=9;c.strokeRect(camera.x,camera.y,viewW,viewH);c.restore();}
 if(state.eventTimer>0&&state.winner<0){
   // Events belong to the world and should not interrupt center-screen combat.
   // Enemy life losses are secondary information, not a blocking announcement.
   const msg=String(state.event||'').toUpperCase();const text=msg.length>38?msg.slice(0,35)+'…':msg;
   const secondary=/^BOT \d+ LOSES A LIFE/.test(msg);
   const width=Math.min(400,Math.max(158,text.length*8.4+34));
   c.fillStyle='#081d29e0';c.fillRect(15,56,width,30);
   c.fillStyle=secondary?'#738d9b':'#e5be7b';c.fillRect(15,56,3,30);
   c.fillStyle=secondary?'#aac5d0':'#f8eacb';c.font='800 15px system-ui';c.textAlign='left';
   c.fillText(text,27,76);
 }
 // End-of-round report is a responsive DOM overlay with real touch targets.
 if(paused&&mode==='host'&&!connected){c.fillStyle='#071b26b5';c.fillRect(0,0,W,H);c.fillStyle='#d4f0f2';c.font='bold 28px system-ui';c.textAlign='center';c.fillText('WAITING FOR PLAYER TWO',W/2,H/2)}
 if(damagePulse>0){c.strokeStyle='#ff766d';c.globalAlpha=Math.min(.65,damagePulse);c.lineWidth=12+damagePulse*24;c.strokeRect(7,7,W-14,H-14);c.globalAlpha=1}
 }
function nativePacket(packet){if(!window.AndroidBridge)return;try{window.AndroidBridge.sendPacket(JSON.stringify(packet))}catch(e){notice('Network send failed')}}
function loop(now){const dt=clamp((now-lastTime)/1000,0,.085);lastTime=now;
 if(mode==='solo'||mode==='duel'||mode==='host'){if(!paused&&state.winner<0){fixedAccumulator=Math.min(.12,fixedAccumulator+dt);let ticks=0;while(fixedAccumulator>=STEP&&ticks++<5){step(STEP);fixedAccumulator-=STEP}}else fixedAccumulator=0;}
 updateVisuals(dt);hudTimer+=dt;if(hudTimer>.15){hudTimer=0;refreshHUD();}
 if(mode==='host'&&connected){snapshotTimer+=dt;if(snapshotTimer>.09){snapshotTimer=0;nativePacket({type:'state',state:serializeState()})}}
 if(mode==='guest'&&connected){sendTimer+=dt;if(sendTimer>.05){sendTimer=0;nativePacket({type:'input',input:menu.classList.contains('hidden')&&!document.hidden?makeControl(true):{moveX:0,moveY:0,fire:false}})}}
 render(dt);drawLobbyPreview(dt);updateMusic();requestAnimationFrame(loop)}
function bridgeReady(){return !!window.AndroidBridge}
function host(){if(!bridgeReady()){notice('Nearby mode requires the Android APK');return}newMatch('host');setPanel('<div class="eyebrow">NEARBY PLAY</div><h2>HOSTING MATCH</h2><p id="host-status">Starting local game...</p><div class="host-address" id="host-address"></div><button data-action="close">CANCEL</button>');window.AndroidBridge.hostGame()}
function find(){if(!bridgeReady()){notice('Nearby mode requires the Android APK');return}newMatch('guest');setPanel('<div class="eyebrow">NEARBY PLAY</div><h2>FIND A MATCH</h2><p id="find-status">Looking for games on the same Wi-Fi...</p><div id="rooms"></div><button data-action="manual">JOIN BY LOCAL IP</button><button data-action="close">BACK</button>');window.AndroidBridge.findGames()}
function manual(){if(!bridgeReady()){notice('Manual LAN join requires the Android APK');return}newMatch('guest');setPanel('<div class="eyebrow">FALLBACK</div><h2>JOIN BY ADDRESS</h2><p>Enter the IP:port shown on the host screen, such as 192.168.1.25:47321</p><input id="lan-address" placeholder="192.168.1.25:47321" inputmode="url" autocapitalize="off"><button data-action="ip-join">CONNECT</button><button data-action="find">FIND NEARBY</button>')}
function stop(){if(bridgeReady())window.AndroidBridge.stopNetwork();connected=false;paused=true;neutralizeGuestInput();mode='idle';playlistBag=[];lastSoloModeId=null;releaseControls();document.getElementById('mode-label').textContent='NO GAME ACTIVE';panel.innerHTML=originalPanel;applyPrefsToUI();menu.classList.remove('hidden')}
const originalPanel=panel.innerHTML;
panel.addEventListener('change',e=>{const el=e.target;if(el.id==='custom-preset-select'){pendingPresetDelete='';refreshCustomPresetUI();customPresetStatus('SELECT LOAD TO APPLY SAVED RULES');return;}if(el.id?.startsWith('custom-')){readCustomScreen();refreshCustomUI();return;}if(el.id?.startsWith('pref-')){const key=el.id.slice(5);if(key in comfort)comfort[key]=el.checked;applyPrefsToUI()}savePrefs()});
loadPrefs();
dossierStore=window.SectorDossier?.createStore((()=>{try{return window.localStorage}catch(_){return null}})())||null;
loadPaint(); // Dossier milestones must be available before restoring earned selections.

menu.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='toggle-sound'||a==='toggle-music'){togglePauseAudio(a==='toggle-sound'?'sound':'music',b);return;}
 if(!['solo','settings-play','cqc','scored_ffa','scored_tdm','custom-play','duel','host','find','custom-preset-save','custom-preset-delete','custom-preset-load','ip-join'].includes(a))
  audioCue(['settings-back','help-back','dossier-back','backup-back','custom-back','close','resume'].includes(a)?'ui-back':'ui-select');
 if(a==='dossier'){openDossier()}else if(a==='hangar'){openHangar()}else if(a==='hangar-back'){panel.innerHTML=originalPanel;applyPrefsToUI()}else if(a==='equip-paint'){
   const ok=equipPaint(b.dataset.paintId);
   refreshHangar();const status=document.getElementById('hangar-status');
   if(!ok&&status)status.textContent=paintProgress(b.dataset.paintId).eligible?'COULD NOT SAVE PAINT · CURRENT PAINT KEPT':'LOCKED · COMPLETE DOSSIER MILESTONE FIRST';
  }else if(a==='equip-emblem'){
   const ok=equipEmblem(b.dataset.emblemId);refreshHangar();
   const status=document.getElementById('emblem-status');
   if(!ok&&status)status.textContent=emblemProgress(b.dataset.emblemId).eligible?'COULD NOT SAVE INSIGNIA':'INSIGNIA LOCKED · COMPLETE DOSSIER MILESTONE';
  }else if(a==='dossier-back'){panel.innerHTML=originalPanel;applyPrefsToUI()}else if(a==='backup'){openBackupScreen()}else if(a==='backup-back'){openDossier()}else if(['backup-export','backup-copy','backup-preview','backup-restore'].includes(a)){doBackupAction(a)}else if(a==='help'){setPanel('<div class="eyebrow">FIELDGRID / FIELD MANUAL</div><h2>HOW TO <span>PLAY</span></h2><div class="help-copy"><p><strong>01 / MOVE + FIRE</strong>Steer with the left thumb. Hold FIRE on the right. When on foot in SOLO, drag FIRE to aim independently. In SCORED VEHICLE FFA or TEAM DEATHMATCH, point the hull with the movement joystick. Sharp changes pivot the tank before accelerating; tap FIRE when lined up.</p><p><strong>02 / KEEP FIGHTING</strong>Hits remove vehicle armor first. A destroyed vehicle ejects its pilot; losing a life happens on foot.</p><p><strong>03 / RECOVER A RIDE</strong>Pilots are faster, smaller and armed. Walk or drive through an empty tank or mech. Tap ENTER when close to activate it.</p><p><strong>04 / READ THE FIELD</strong>Every match builds a new maze. The radar shows gunfire and incoming vehicle deployments.</p></div><button class="primary" data-action="help-back">BACK TO MENU</button>')}else if(a==='help-back'){panel.innerHTML=originalPanel;applyPrefsToUI()}else if(a==='settings'){savePrefs();setPanel(document.getElementById('settings-template').innerHTML);applyPrefsToUI()}else if(a==='settings-back'){savePrefs();panel.innerHTML=originalPanel;applyPrefsToUI()}else if(a==='settings-play'){savePrefs();newMatch('solo')}else if(a==='solo')newMatch('solo');else if(a==='cqc')newMatch('cqc');else if(a==='scored_ffa')newMatch('scored_ffa');else if(a==='scored_tdm')newMatch('scored_tdm');else if(a==='custom')openCustomScreen();else if(a==='custom-back'){panel.innerHTML=originalPanel;applyPrefsToUI();}else if(a==='custom-play'){readCustomScreen();newMatch('custom');}
 else if(a==='custom-reset'){resetCustomDraft();refreshCustomUI();customPresetStatus('DEFAULT RULES RESTORED · SAVED PRESETS KEPT');}
 else if(a==='custom-preset-save'){
  readCustomScreen();const input=document.getElementById('custom-preset-name'),name=cleanPresetName(input?.value);
  const outcome=saveNamedCustomPreset(name);customPresetStatus(outcome.message);
  if(outcome.ok){if(input)input.value='';refreshCustomPresetUI(name);}
 }
 else if(a==='custom-preset-load'){
  const outcome=loadNamedCustomPreset(document.getElementById('custom-preset-select')?.value);
  customPresetStatus(outcome.message);if(outcome.ok)refreshCustomUI();
 }
 else if(a==='custom-preset-delete'){
  const name=document.getElementById('custom-preset-select')?.value;
  const outcome=deleteNamedCustomPreset(name);customPresetStatus(outcome.message);
  if(outcome.ok)refreshCustomPresetUI();
 }
 else if(a==='nearby'){savePrefs();setPanel('<div class="eyebrow">TWO PHONES · SAME WI-FI</div><h2>PLAY <span>TOGETHER</span></h2><p>One phone hosts. The other finds and joins it. Both use the same match rules and can drive, eject, and enter tanks.</p><button class="primary" data-action="host">HOST GAME</button><button data-action="find">FIND GAME</button><button data-action="manual">JOIN BY IP</button><button data-action="help-back">◀ BACK</button>')}else if(a==='duel')newMatch('duel');else if(a==='host')host();else if(a==='find')find();else if(a==='manual')manual();else if(a==='close')stop();else if(a==='ip-join'){
 const s=document.getElementById('lan-address').value.trim(),m=s.match(/^([\da-fA-F:.]+):(\d{1,5})$/);
 if(!m||+m[2]>65535||+m[2]<1){notice('Please enter a valid address and port');return}document.getElementById('mode-label').textContent='CONNECTING';window.AndroidBridge.joinGame(m[1],Number(m[2]));}});
function showPauseMenu(){releaseControls();if(mode==='idle')return;
 if(mode==='solo'||mode==='duel'){paused=true;setPanel('<div class="eyebrow">FIELDGRID / PAUSED</div><h2>SECTOR <span>PAUSED</span></h2><p class="pause-hint">The field is frozen. Continue or generate a fresh sector.</p><div class="pause-actions"><button class="primary" data-action="resume">RESUME MATCH</button><button data-action="restart">NEW FIELD</button><button data-action="close">MAIN MENU</button></div>'+pauseAudioControls())}
 else if(mode==='host'){paused=true;neutralizeGuestInput();setPanel('<div class="eyebrow">FIELDGRID / HOST PAUSED</div><h2>SECTOR <span>PAUSED</span></h2><p class="pause-hint">Both players are paused.</p><div class="pause-actions"><button class="primary" data-action="resume">RESUME MATCH</button><button data-action="restart">NEW FIELD</button><button data-action="close">DISCONNECT</button></div>'+pauseAudioControls())}
 else if(mode==='guest'){if(connected)nativePacket({type:'input',input:{moveX:0,moveY:0,fire:false}});setPanel('<div class="eyebrow">FIELDGRID / PLAYER MENU</div><h2>SECTOR <span>MENU</span></h2><p class="pause-hint">The host controls rematches.</p><div class="pause-actions"><button class="primary" data-action="resume">BACK TO ARENA</button><button data-action="close">DISCONNECT</button></div>'+pauseAudioControls())}}
document.getElementById('menu-button').addEventListener('click',()=>{if(mode!=='idle')audioCue('ui-select');showPauseMenu()});
document.getElementById('quick-rematch')?.addEventListener('click',()=>{if(state.winner>=0&&mode!=='guest'&&mode!=='idle'){if(resetAll(mode==='solo'&&!!state.config?.quickPlayMatch)!==false){audioCue('deploy');notice('NEW FIELD · NEW FIGHT',1400)}}});
 document.getElementById('results-menu')?.addEventListener('click',()=>{if(state.winner>=0&&mode!=='idle'){audioCue('ui-back');stop()}});
 document.getElementById('custom-edit')?.addEventListener('click',()=>{if(state.winner>=0&&mode==='solo'&&state.config?.customMatch){stop();openCustomScreen();}});
document.getElementById('interact-btn')?.addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='guest'){if(connected&&!paused&&menu.classList.contains('hidden')&&!state.hostPaused)nativePacket({type:'interact'});}else tryInteract(0)});
menu.addEventListener('click',e=>{const a=e.target?.dataset?.action;
 if(a==='resume'){if(mode==='solo'||mode==='duel'||mode==='host')paused=false;exitMenu()}
 else if(a==='restart'&&mode!=='guest'){resetAll();exitMenu()}});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if([...Object.values(keys1),...Object.values(keys2)].includes(e.code))e.preventDefault();pressed.add(e.code);if(e.code==='KeyR'&&state.winner>=0&&mode!=='guest')resetAll(mode==='solo'&&!!state.config?.quickPlayMatch);if(e.code==='KeyE'&&!e.repeat&&menu.classList.contains('hidden')){if(mode==='guest'&&connected&&!state.hostPaused)nativePacket({type:'interact'});else if(mode==='solo'||mode==='host'||mode==='duel')tryInteract(0)}});
window.addEventListener('keyup',e=>pressed.delete(e.code));window.addEventListener('blur',releaseControls);
for(const b of document.querySelectorAll('[data-key]')){const k=b.dataset.key;const release=e=>{touch.delete(k);b.classList.remove('active');if(k==='fire'&&fireAim.pointerId===e.pointerId)clearFireAim();try{b.releasePointerCapture(e.pointerId)}catch(_){}};
 b.addEventListener('pointerdown',e=>{e.preventDefault();touch.add(k);b.classList.add('active');if(k==='fire')beginFireAim(e);b.setPointerCapture(e.pointerId)});
 if(k==='fire')b.addEventListener('pointermove',e=>{if(fireAim.pointerId===e.pointerId){e.preventDefault();updateFireAim(e)}});
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',e=>{touch.delete(k);b.classList.remove('active');if(k==='fire'&&fireAim.pointerId===e.pointerId)clearFireAim()})}
const joystick=document.getElementById('joystick'),knob=document.getElementById('stick-knob');
function clearStick(){stick.x=stick.y=0;stick.pointerId=null;knob.style.transform='translate(-50%, -50%)';joystick.classList.remove('active')}
function clearFireAim(){fireAim.pointerId=null;fireAim.source=null;fireAim.x=0;fireAim.y=0;fireAim.active=false;}
function beginFireAim(e,source='fire'){
 if(fireAim.pointerId!==null||source!=='fire')return;
 // On-foot FIRE-drag works for both LAN seats, with guest state sourced
 // from the latest authoritative host snapshot (seat 1).
 if(source==='fire'&&!(('solo'===mode||'host'===mode||'guest'===mode)&&state?.tanks?.[mode==='guest'?1:0]?.onFoot))return;
 fireAim.pointerId=e.pointerId;fireAim.source=source;fireAim.startX=Number(e.clientX)||0;fireAim.startY=Number(e.clientY)||0;
 fireAim.x=0;fireAim.y=0;fireAim.active=false;
}
function updateFireAim(e){
 if(fireAim.pointerId!==e.pointerId)return;
 if(!(['solo','host','guest'].includes(mode)&&state?.tanks?.[mode==='guest'?1:0]?.onFoot)){clearFireAim();return;}
 const dx=(Number(e.clientX)||0)-fireAim.startX,dy=(Number(e.clientY)||0)-fireAim.startY,d=Math.hypot(dx,dy);
 // Preserve accepted pilot FIRE drag sensitivity without new tuning.
 if(d<14)return;
 fireAim.x=dx/d;fireAim.y=dy/d;fireAim.active=true;
}
function updateStick(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,rad=Math.max(1,r.width*.32);
 const dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy),factor=Math.min(1,rad/Math.max(1,d));stick.x=dx*factor/rad;stick.y=dy*factor/rad;
 if(Math.hypot(stick.x,stick.y)<.12){stick.x=stick.y=0}
 knob.style.transform=`translate(calc(-50% + ${stick.x*rad}px), calc(-50% + ${stick.y*rad}px))`;}
joystick.addEventListener('pointerdown',e=>{if(stick.pointerId!==null)return;e.preventDefault();stick.pointerId=e.pointerId;joystick.setPointerCapture(e.pointerId);joystick.classList.add('active');updateStick(e)});
joystick.addEventListener('pointermove',e=>{if(stick.pointerId===e.pointerId){e.preventDefault();updateStick(e)}});
for(const key of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(key,e=>{if(stick.pointerId===e.pointerId){clearStick();try{joystick.releasePointerCapture(e.pointerId)}catch(_){}}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&window.RR?.appPause)window.RR.appPause()});
window.RR={openMenu(){if(menu.classList.contains('hidden'))showPauseMenu();else if(mode==='idle')stop();else if(mode==='solo'||mode==='duel'||mode==='host'){paused=false;exitMenu()}else exitMenu()},appPause(){releaseControls();if((mode==='solo'||mode==='duel'||mode==='host')&&menu.classList.contains('hidden')){showPauseMenu();if(mode==='host'&&connected)nativePacket({type:'state',state:serializeState()});}
  if(mode==='guest'&&connected)nativePacket({type:'input',input:{moveX:0,moveY:0,fire:false}})},nativeMessage(json){let msg;try{msg=JSON.parse(json)}catch(_){return}if(!msg||typeof msg.type!=='string')return;
 switch(msg.type){case 'hosting':{const p=document.getElementById('host-status');if(p)p.textContent='Waiting for another phone to join...';const a=document.getElementById('host-address');if(a)a.textContent=(msg.address||'LOCAL NETWORK')+':'+msg.port;break}
 case 'found':{const r=document.getElementById('rooms');if(r&&!r.querySelector('[data-host="'+msg.host+'"]')){const b=document.createElement('button');b.textContent='JOIN '+(msg.name||'NEARBY GAME');b.dataset.host=msg.host;b.onclick=()=>{window.AndroidBridge.joinGame(msg.host,msg.port);document.getElementById('find-status').textContent='Connecting...'};r.appendChild(b)}break}
 case 'connected':{if(mode==='host')neutralizeGuestInput();connected=true;paused=false;document.getElementById('mode-label').textContent=mode==='guest'?'YOU: CORAL':mode==='host'?'YOU: CYAN':'CONNECTED';exitMenu();notice('Player connected — FIGHT!');if(mode==='host'){state=initialState(state.arenaId,state.config,state.mazeSeed);refreshHUD()}break}
 case 'state':if(mode==='guest'&&msg.state&&Array.isArray(msg.state.tanks)&&msg.state.tanks.length>=2&&msg.state.tanks.length<=6&&Array.isArray(msg.state.lives)&&msg.state.lives.length===msg.state.tanks.length&&Array.isArray(msg.state.kos)&&msg.state.kos.length===msg.state.tanks.length){const upcoming=msg.state;const currentEvents=Array.isArray(upcoming.fxEvents)?upcoming.fxEvents:[];for(const event of currentEvents){if(event.id>lastRemoteFxId&&event.id<lastRemoteFxId+1000&&Number.isFinite(event.x)&&Number.isFinite(event.y)){spawnParticles(event.kind,event.x,event.y,event.color);if(event.kind==='hit'&&event.target===1){damagePulse=.58;screenKick=comfort.shake?3.2:0}if(event.kind==='shot'){
 const shooter=upcoming.tanks?.[event.owner],vehicle=upcoming.vehicles?.[shooter?.vehicleId];
 audioCue(shooter?.onFoot?'pilot-shot':vehicle?.type==='mech'?'mech-shot':'tank-shot',event.x,event.y);
 }
 if(event.kind==='armor')audioCue('armor-hit',event.x,event.y);
  if(event.kind==='hit')audioCue('pilot-hit',event.x,event.y);
 if(event.kind==='eject')audioCue('eject',event.x,event.y);
 if(event.kind==='guard')audioCue('barrier',event.x,event.y);
 if(event.kind==='pickup')audioCue('pickup',event.x,event.y);lastRemoteFxId=event.id}}state=upcoming;setArena(0,state.mazeSeed,state.config?.mapSize);refreshHUD()}break;
 case 'input':if(mode==='host'&&connected&&!paused&&state.winner<0&&msg.input){guestInput=normalizeLanInput(msg.input);guestInputAge=0;}break;
 case 'interact':if(mode==='host'&&connected&&!paused)tryInteract(1);break;
 case 'disconnected':connected=false;paused=true;neutralizeGuestInput();clearStick();notice('Other player disconnected');setPanel('<h2>CONNECTION LOST</h2><p>Return to the main menu and reconnect.</p><button data-action="close">MAIN MENU</button>');break;
 case 'error':notice(msg.message||'Network error');break;}}};
resizeArenaCanvas();refreshHUD();requestAnimationFrame(loop);
})();