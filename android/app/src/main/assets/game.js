(()=>{'use strict';
let W=960,H=600;const START_LIVES=5,STEP=1/60;
const PREF_KEY='rr-options-v06'; // Preserve existing options across this patch.
let comfort={sound:true,shake:false,autoFire:false,leftHanded:false},fixedAccumulator=0;
let selectedRules={botCount:2,bulletCap:3,startLives:2,teamMode:'ffa',botSkill:'normal',mapSize:'small'};
// W/H are the camera canvas resolution. Mazes have much larger world coordinates.
let worldW=W,worldH=H,mazeGrid=null,currentArena=-1,currentSeed=0,currentMapSize='';const camera={x:0,y:0};
// Spatial buckets keep projectile and bot collision checks local, even in Maze XL.
const WALL_BUCKET=128;let wallLookup=new Map();
function rebuildWallLookup(){wallLookup=new Map();for(const w of wallSet){const x0=Math.floor(w.x/WALL_BUCKET),x1=Math.floor((w.x+w.w)/WALL_BUCKET),y0=Math.floor(w.y/WALL_BUCKET),y1=Math.floor((w.y+w.h)/WALL_BUCKET);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const key=x+','+y;if(!wallLookup.has(key))wallLookup.set(key,[]);wallLookup.get(key).push(w)}}}
function nearWall(x,y,r){const x0=Math.floor((x-r)/WALL_BUCKET),x1=Math.floor((x+r)/WALL_BUCKET),y0=Math.floor((y-r)/WALL_BUCKET),y1=Math.floor((y+r)/WALL_BUCKET);for(let yb=y0;yb<=y1;yb++)for(let xb=x0;xb<=x1;xb++){const nearby=wallLookup.get(xb+','+yb);if(nearby)for(const w of nearby){const nx=Math.max(w.x,Math.min(x,w.x+w.w)),ny=Math.max(w.y,Math.min(y,w.y+w.h));if((x-nx)**2+(y-ny)**2<r*r)return true}}return false}
const PALETTE=['#46d2f5','#fc856e','#ffdc77','#b69aff','#82e6a1','#fc8bde'];
const gameNames=['CYAN','CORAL','GOLD','VIOLET','MINT','PINK'];
// No map picker: every match is a newly generated connected battlefield.
const MAP_SIZES={small:{cols:9,rows:6,cell:132},standard:{cols:13,rows:9,cell:132},large:{cols:18,rows:12,cell:132}};
const ARENAS=[{name:'FIELDGRID',maze:MAP_SIZES.standard}];
const VEHICLE_TYPES={tank:{name:'TANK',armor:3,speed:1,fireCooldown:.41,projectileSpeed:405,bulletCap:3},mech:{name:'MECH',armor:4,speed:.76,fireCooldown:.7,projectileSpeed:350,bulletCap:2}};
const MAX_VEHICLES=10;
const PICKUPS={rapid:{label:'R',name:'RAPID FIRE',color:'#ffd46d'},turbo:{label:'»',name:'TURBO',color:'#76efaf'},guard:{label:'+',name:'BARRIER',color:'#b59aff'}};
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
let mode='idle',connected=false,paused=true,lastTime=performance.now(),sendTimer=0,snapshotTimer=0,toastTimer=0,botTimer=0,hudTimer=0;
const botBrains=new Map();
let state=null;let guestInput={moveX:0,moveY:0,fire:false};
let particles=[],screenKick=0,damagePulse=0,fxSeq=0,lastRemoteFxId=0,visualClock=0;
const keys1={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',fire:'Space'},keys2={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',fire:'Enter'};
const fireCooldown=Array(6).fill(0);
function value(id,fallback,min,max){const raw=document.getElementById(id)?.value;const n=Number(raw);return raw!==''&&raw!=null&&Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
function readSettings(){const prev=selectedRules;return {mapSize:MAP_SIZES[document.getElementById('map-size')?.value]?document.getElementById('map-size').value:prev.mapSize,botCount:value('bot-count',prev.botCount,0,4),bulletCap:value('bullet-cap',prev.bulletCap,1,8),startLives:value('lives-choice',prev.startLives,1,10),teamMode:['ffa','coop','teams'].includes(document.getElementById('team-choice')?.value)?document.getElementById('team-choice').value:prev.teamMode,botSkill:['casual','normal','spicy'].includes(document.getElementById('bot-skill')?.value)?document.getElementById('bot-skill').value:prev.botSkill};}
function savePrefs(){selectedRules=readSettings();try{window.localStorage?.setItem(PREF_KEY,JSON.stringify({settings:selectedRules,comfort}));}catch(_){}}
function loadPrefs(){try{const p=JSON.parse(window.localStorage?.getItem(PREF_KEY)||'null');if(p){const st=p.settings||{};selectedRules={mapSize:MAP_SIZES[st.mapSize]?st.mapSize:'small',botCount:Number.isInteger(st.botCount)&&st.botCount>=0&&st.botCount<=4?st.botCount:2,bulletCap:[1,2,3,5,8].includes(st.bulletCap)?st.bulletCap:3,startLives:[2,3,5].includes(st.startLives)?st.startLives:2,teamMode:['ffa','coop','teams'].includes(st.teamMode)?st.teamMode:'ffa',botSkill:['casual','normal','spicy'].includes(st.botSkill)?st.botSkill:'normal'};for(const key of Object.keys(comfort))if(typeof p.comfort?.[key]==='boolean')comfort[key]=p.comfort[key]}}catch(_){}applyPrefsToUI()}
function applyPrefsToUI(){const picks={mapSize:selectedRules.mapSize,botCount:selectedRules.botCount,bulletCap:selectedRules.bulletCap,startLives:selectedRules.startLives,teamMode:selectedRules.teamMode,botSkill:selectedRules.botSkill};const ids={mapSize:'map-size',botCount:'bot-count',bulletCap:'bullet-cap',startLives:'lives-choice',teamMode:'team-choice',botSkill:'bot-skill'};for(const [key,id] of Object.entries(ids)){const el=document.getElementById(id);if(el&&el.options&&[...el.options].some(o=>o.value===String(picks[key])))el.value=String(picks[key])}for(const key of Object.keys(comfort)){const el=document.getElementById('pref-'+key);if(el)el.checked=comfort[key]}const el=document.getElementById('fire-mode');if(el)el.textContent=comfort.autoFire?'AUTO ON':'HOLD TO FIRE';document.querySelector('.battlefield')?.classList.toggle('swap-controls',comfort.leftHanded);}
function releaseControls(){touch.clear();pressed.clear();clearStick();for(const el of document.querySelectorAll('[data-key]'))el.classList.remove('active')}

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
function deploymentSeed(seed,index){return ((seed>>>0)^(Math.imul(index+1,0x9e3779b1)>>>0))>>>0;}
function deployVehicle(forceType=null){if(!isPilotMatch()||state.winner>=0)return false;
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
function spawnVehicles(tanks,humans,seed=1){const vehicles=[];
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
 return vehicles;
}
function isPilotMatch(){return state?.config?.pilotMode===true;}
// A directional hint is only needed while on foot. Unlike ENTER range, this
// considers all healthy unoccupied vehicles (even around maze corners).
function closestAvailableVehicle(i){
 if(!isPilotMatch()||!state?.tanks[i]||state.lives[i]<=0)return null;
 const pilot=state.tanks[i];let best=null,distance=Infinity;
 for(const v of state.vehicles||[]){if(v.armor<=0||v.occupant!==-1)continue;
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
function tryInteract(i=0){if(!isPilotMatch()||paused||state.winner>=0||state.lives[i]<=0)return false;const t=state.tanks[i];
 if(t.onFoot){const v=nearestEmptyVehicle(i);if(!v){if(i===0){const bay=(state.vehicles||[]).some(q=>q.occupant===-1&&q.armor>0&&Math.hypot(q.x-t.x,q.y-t.y)<58&&hasLineOfSight(t.x,t.y,q.x,q.y)&&!vehicleEntryClear(i,q));notice(bay?'Vehicle bay occupied · clear the area':'Find a parked tank and move closer');}return false}
  v.occupant=i;t.vehicleId=v.id;t.onFoot=false;Object.assign(t,{x:v.x,y:v.y,a:v.a,vx:0,vy:0});state.event=vehicleDef(v).name+' ONLINE · '+v.armor+' ARMOR';state.eventTimer=.9;emitFx('pickup',v.x,v.y,colors[i],i);}
 else{const v=state.vehicles?.[t.vehicleId];if(!v)return false;
  const spot=pilotExitSite(i,v.id);
  if(!spot){if(i===0)notice('Need space beside the tank to exit');return false}
  v.x=t.x;v.y=t.y;v.a=t.a;v.occupant=-1;t.onFoot=true;t.vehicleId=null;Object.assign(t,{x:spot[0],y:spot[1],vx:0,vy:0,shield:Math.max(t.shield,.35)});state.event='VEHICLE AVAILABLE';state.eventTimer=.8;}
 refreshHUD();return true;}
function ejectPilot(i){const t=state.tanks[i],v=state.vehicles?.[t.vehicleId];if(!v)return;
 v.x=t.x;v.y=t.y;v.a=t.a;v.occupant=-1;v.armor=0;v.respawn=9;
 const exit=pilotExitSite(i,v.id)||[t.x,t.y];
 t.onFoot=true;t.vehicleId=null;Object.assign(t,{x:exit[0],y:exit[1],vx:0,vy:0,shield:EJECTION_SHIELD,powerType:null,powerTimer:0});
 t.ejectAnim=.62;state.event=label(i)+' EJECTED · FIND COVER!';state.eventTimer=1.15;emitFx('eject',v.x,v.y,colors[i],-1,i);
}
function initialState(arena=0,options=null,seed=null){const config={...readSettings(),pilotMode:true,...(options||{})};let count=mode==='solo'?1:2;
 // Zero bots is a legitimate free-roam practice setting; don't silently add an enemy.
 const mazeSeed=seed||Math.floor(Math.random()*0x7fffffff)||1,id=setArena(0,mazeSeed,config.mapSize);
 const numBots=config.botCount,humans=count,total=humans+numBots,tanks=Array.from({length:total},(_,i)=>freshTank(i));
 const vehicles=config.pilotMode?spawnVehicles(tanks,humans,mazeSeed):[];
 camera.x=0;camera.y=0;botBrains.clear();return {tanks,vehicles,vehicleDropTimer:28,dropIndex:0,vehicleBeacon:null,bullets:[],pickups:[],pickupTimer:5.5,arenaId:id,mazeSeed,config,humanCount:humans,fxEvents:[],lives:Array(total).fill(config.startLives),kos:Array(total).fill(0),winner:-1,winnerTeam:-1,event:'',eventTimer:0,matchId:0};}
state=initialState();
function teamOf(i,st=state){const mode=st.config?.teamMode||'ffa';if(mode==='ffa')return i;if(mode==='coop')return i<st.humanCount?0:1;
 // Alternating teams; solo play always puts bots on the opposing team.
 return st.humanCount===1?(i===0?0:1):i%2;}
function friendly(a,b){return teamOf(a)===teamOf(b)}
function label(i){return i===0?'CYAN':i===1&&state.humanCount===2?'CORAL':`BOT ${i-state.humanCount+1}`;}
function emitFx(kind,x,y,color,owner=-1,target=-1){const id=++fxSeq;state.fxEvents.push({id,kind,x,y,color,owner,target,ttl:kind==='shot'?1.8:kind==='hit'?.75:kind==='eject'?.8:.4});if(state.fxEvents.length>12)state.fxEvents.shift();spawnParticles(kind,x,y,color);lastRemoteFxId=id}
function spawnParticles(kind,x,y,color){const count=kind==='hit'?24:kind==='eject'?20:kind==='pickup'?17:kind==='bounce'?5:kind==='shot'?7:12;const speed=kind==='hit'?205:kind==='bounce'?95:kind==='shot'?115:135;
 for(let i=0;i<count;i++){const a=(i/count)*Math.PI*2+Math.random()*.4,velocity=speed*(.28+Math.random()*.72),life=(kind==='shot'?.17:kind==='bounce'?.14:.42)+Math.random()*.26;particles.push({x,y,vx:Math.cos(a)*velocity,vy:Math.sin(a)*velocity,life,maxLife:life,color,size:kind==='hit'?2.5+Math.random()*3:1.5+Math.random()*2.2})}if(particles.length>260)particles.splice(0,particles.length-260);}
function spawnPickup(){if(state.pickups.length||state.winner>=0)return;
 const spots=mazeGrid?Array.from({length:mazeGrid.cols*mazeGrid.rows},(_,i)=>[((i%mazeGrid.cols)+.5)*mazeGrid.cell,(Math.floor(i/mazeGrid.cols)+.5)*mazeGrid.cell]):pickupSpots;
 const candidates=spots.filter(([x,y])=>!blocked(x,y,32)&&state.tanks.every((t,i)=>state.lives[i]===0||Math.hypot(t.x-x,t.y-y)>83));if(!candidates.length)return;
 const [x,y]=candidates[Math.floor(Math.random()*candidates.length)],types=Object.keys(PICKUPS),type=types[Math.floor(Math.random()*types.length)];state.pickups=[{x,y,type}];}
function collectPickup(t,i,p){t.powerType=p.type;t.powerTimer=p.type==='guard'?4.0:7.0;state.event=label(i)+' GOT '+PICKUPS[p.type].name;state.eventTimer=1;emitFx('pickup',p.x,p.y,PICKUPS[p.type].color);state.pickups=[];state.pickupTimer=8+Math.random()*4;refreshHUD();}

function notice(t,duration=2400){toast.textContent=t;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),duration)}
function firstMatchHint(){try{if(window.localStorage?.getItem('rr-coach-v091'))return;window.localStorage?.setItem('rr-coach-v091','1')}catch(_){}notice('MOVE · FIRE · ENTER VEHICLES',3300)}
function setPanel(html){releaseControls();panel.innerHTML=html;menu.classList.remove('hidden')}
function exitMenu(){menu.classList.add('hidden');refreshHUD()}
function inputFrom(keys,isLocal){const down=k=>menu.classList.contains('hidden')&&(pressed.has(keys[k])||(isLocal&&touch.has(k)));let moveX=Number(down('right'))-Number(down('left')),moveY=Number(down('down'))-Number(down('up'));
 if(isLocal&&stick.pointerId!==null){moveX=stick.x;moveY=stick.y}
 const length=Math.hypot(moveX,moveY);if(length>1){moveX/=length;moveY/=length}
 return {moveX,moveY,fire:down('fire')||(isLocal&&comfort.autoFire&&mode!=='idle'&&menu.classList.contains('hidden')&&!paused)};}
function makeControl(isPlayer1){return isPlayer1?inputFrom(keys1,true):inputFrom(keys2,false)}
function serializeState(){return {tanks:state.tanks.map(t=>({...t})),vehicles:(state.vehicles||[]).map(v=>({...v})),bullets:state.bullets.map(b=>({...b})),pickups:state.pickups.map(p=>({...p})),pickupTimer:state.pickupTimer,vehicleDropTimer:state.vehicleDropTimer,dropIndex:state.dropIndex,vehicleBeacon:state.vehicleBeacon?{...state.vehicleBeacon}:null,arenaId:state.arenaId,mazeSeed:state.mazeSeed,config:{...state.config},humanCount:state.humanCount,fxEvents:state.fxEvents.slice(),lives:state.lives.slice(),kos:state.kos.slice(),winner:state.winner,winnerTeam:state.winnerTeam,event:state.event,eventTimer:state.eventTimer,matchId:state.matchId,hostPaused:mode==='host'&&paused};}
function refreshHUD(){const me=mode==='guest'?1:0,other=me===0?1:0;
 document.getElementById('score0').textContent=state.lives[me]??0;document.getElementById('score1').textContent=state.lives[other]??0;
 const botLives=state.lives.slice(state.humanCount||2).filter(v=>v>0).length,active=state.bullets.filter(b=>b.owner===me).length;
 const phase=document.getElementById('round'),localPilot=state.tanks[me],localVehicle=currentVehicle(localPilot),foot=!!localPilot?.onFoot,hostPaused=mode==='guest'&&state.hostPaused;
 const armor=localVehicle?.armor??0,maxArmor=vehicleDef(localVehicle).armor;
 phase.textContent=hostPaused?'HOST PAUSED':state.winner>=0?'MATCH OVER':foot?'PILOT · ON FOOT':`${vehicleDef(localVehicle).name} · ${armor}/${maxArmor}`;
 phase.classList.toggle('on-foot',foot&&state.winner<0&&!hostPaused);
 phase.classList.toggle('damaged',!foot&&armor<=1&&state.winner<0&&!hostPaused);
 phase.classList.toggle('match-ended',state.winner>=0);
 phase.classList.toggle('host-paused',hostPaused);
 if(typeof phase.setAttribute==='function')phase.setAttribute('aria-label',hostPaused?'Host paused the match':state.winner>=0?'Match over':foot?'Pilot on foot':`${vehicleDef(localVehicle).name} armor ${armor} of ${maxArmor}`);
 const interact=document.getElementById('interact-btn');if(interact){const canUse=isPilotMatch()&&state.lives[me]>0&&state.winner<0;
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
 const shellMeter=document.getElementById('shell-meter');if(shellMeter){const cap=state.tanks[me]?.onFoot?2:(currentVehicle(state.tanks[me])?.type==='mech'?2:(state.config?.bulletCap||3));shellMeter.textContent=`${Math.max(0,cap-active)}/${cap} READY`;shellMeter.classList.toggle('empty',active>=cap)}
 const ended=state.winner>=0&&mode!=='idle';if(ended||state.eventTimer>0)toast.classList.remove('visible');document.getElementById('game-screen')?.classList.toggle('match-finished',ended);const replay=document.getElementById('quick-rematch');if(replay)replay.classList.toggle('hidden',!(ended&&mode!=='guest'&&menu.classList.contains('hidden')));
 const label0=document.getElementById('player0-label');if(label0)label0.textContent='YOU';const label1=document.getElementById('player1-label');if(label1)label1.textContent=mode==='solo'?'ENEMIES':mode==='guest'?'HOST':'OPPONENT';if(mode==='solo')document.getElementById('score1').textContent=botLives;}
function newMatch(which){if(bridgeReady())window.AndroidBridge.stopNetwork();mode=which;paused=(which==='host'||which==='guest');connected=false;fixedAccumulator=0;savePrefs();
 const arena=selectArena();state=initialState(arena,{...selectedRules,pilotMode:true});particles=[];damagePulse=0;fxSeq=lastRemoteFxId=0;fireCooldown.fill(0);clearStick();refreshHUD();document.getElementById('mode-label').textContent=which==='solo'?(state.config.botCount===0?'PRACTICE FIELD':'QUICK MATCH'):which==='host'?'HOST MATCH':which==='guest'?'JOIN MATCH':'LOCAL MATCH';if(which==='solo'||which==='duel'){exitMenu();if(which==='solo')firstMatchHint();}}
function resetAll(){state=initialState(0,state.config);fixedAccumulator=0;particles=[];screenKick=damagePulse=0;lastRemoteFxId=fxSeq;fireCooldown.fill(0);clearStick();paused=(mode==='guest'||mode==='host')&&!connected;refreshHUD();if(mode!=='guest')notice('NEW FIELD GENERATED — GO!');}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function circlesRect(x,y,r,w){const nx=clamp(x,w.x,w.x+w.w),ny=clamp(y,w.y,w.y+w.h);return (x-nx)**2+(y-ny)**2<r*r}
function blocked(x,y,r=21){return x<r+13||x>worldW-r-13||y<r+13||y>worldH-r-13||nearWall(x,y,r)}
function tankMove(t,inp,dt,i){const beforeX=t.x,beforeY=t.y,beforeA=t.a;let mx=clamp(Number(inp.moveX)||0,-1,1),my=clamp(Number(inp.moveY)||0,-1,1);let mag=Math.hypot(mx,my);
 if(mag>1){mx/=mag;my/=mag;mag=1}if(mag<.09){mx=0;my=0;mag=0}
 const speed=(t.onFoot?(inp.bot?194:268):(inp.bot?178:222)*vehicleDef(currentVehicle(t)).speed)*(t.powerType==='turbo'&&t.powerTimer>0?1.48:1),blend=Math.min(1,dt*(mag?9:13));t.vx+=(mx*speed-t.vx)*blend;t.vy+=(my*speed-t.vy)*blend;
 if(mag){const target=Math.atan2(my,mx),diff=Math.atan2(Math.sin(target-t.a),Math.cos(target-t.a));t.a+=clamp(diff,-dt*12,dt*12)}
 const nx=t.x+t.vx*dt,ny=t.y+t.vy*dt;
 const radius=t.onFoot?10:21;const collides=(x,y)=>blocked(x,y,radius)||state.tanks.some((other,j)=>i!==j&&state.lives[j]>0&&(other.x-x)**2+(other.y-y)**2<(radius+(other.onFoot?12:21))**2);
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
function botInput(i,dt){const bot=state.tanks[i],enemies=state.tanks.map((t,j)=>({t,j})).filter(({j})=>j!==i&&state.lives[j]>0&&!friendly(i,j));
 if(!enemies.length)return {moveX:0,moveY:0,fire:false,bot:true};enemies.sort((a,b)=>Math.hypot(bot.x-a.t.x,bot.y-a.t.y)-Math.hypot(bot.x-b.t.x,bot.y-b.t.y));const target=enemies[0].t;
 // A dismounted bot should try to recover a nearby empty tank, not charge a tank forever with a pistol.
 let objective=target;
 if(isPilotMatch()&&bot.onFoot){const candidate=(state.vehicles||[]).filter(v=>v.occupant===-1&&v.armor>0)
   .sort((a,b)=>Math.hypot(a.x-bot.x,a.y-bot.y)-Math.hypot(b.x-bot.x,b.y-bot.y))[0];
  if(candidate){if(Math.hypot(candidate.x-bot.x,candidate.y-bot.y)<58&&hasLineOfSight(bot.x,bot.y,candidate.x,candidate.y))tryInteract(i);
    if(bot.onFoot)objective=candidate;}}
 let direction=Math.atan2(objective.y-bot.y,objective.x-bot.x),brain=botBrains.get(i)||{timer:0,path:[],goal:-1};brain.timer-=dt;
 if(mazeGrid){const {cols,cell,open}=mazeGrid,cellIndex=t=>clamp(Math.floor(t.y/cell),0,mazeGrid.rows-1)*cols+clamp(Math.floor(t.x/cell),0,cols-1),start=cellIndex(bot),goal=cellIndex(objective);
 if(brain.timer<=0||brain.goal!==goal){const prev=Array(open.length).fill(-1),q=[start];prev[start]=start;for(let h=0;h<q.length&&prev[goal]===-1;h++)for(const j of open[q[h]])if(prev[j]===-1){prev[j]=q[h];q.push(j)}
 const path=[];if(prev[goal]!==-1){let n=goal;while(n!==start&&path.length<open.length){path.push(n);n=prev[n]}}brain.path=path.reverse();brain.goal=goal;brain.timer=.45+(i%4)*.09;}
 const waypoint=brain.path[0];if(waypoint!==undefined){const wx=((waypoint%cols)+.5)*cell,wy=(Math.floor(waypoint/cols)+.5)*cell;if(Math.hypot(wx-bot.x,wy-bot.y)<18){brain.path.shift()}else direction=Math.atan2(wy-bot.y,wx-bot.x);}
 }else{const aheadX=bot.x+Math.cos(direction)*72,aheadY=bot.y+Math.sin(direction)*72;if(blocked(aheadX,aheadY,27))direction+=Math.sin(visualClock*.9+i)>0?1.4:-1.4;}
 botBrains.set(i,brain);
 const delta=Math.atan2(Math.sin(Math.atan2(target.y-bot.y,target.x-bot.x)-bot.a),Math.cos(Math.atan2(target.y-bot.y,target.x-bot.x)-bot.a));
 const skill=state.config?.botSkill||'normal',pace=skill==='casual'?.61:skill==='spicy'?.98:.81;
 const aim=skill==='casual'?.27:skill==='spicy'?.39:.33;
 const enemyDist=Math.hypot(bot.x-target.x,bot.y-target.y);
 const hasLine=enemyDist<(mazeGrid?385:750)&&hasLineOfSight(bot.x,bot.y,target.x,target.y);
 // Stop blindly ramming the player. Bots ease off the throttle for close duels.
 const chasePace=objective===target&&hasLine&&enemyDist<115?pace*.34:pace;
 return {moveX:Math.cos(direction)*chasePace,moveY:Math.sin(direction)*chasePace,fire:Math.abs(delta)<aim&&hasLine,bot:true};}
function shoot(owner){if(state.lives[owner]<=0)return false;
 const isFoot=isPilotMatch()&&state.tanks[owner].onFoot;
 const v=currentVehicle(state.tanks[owner]),def=vehicleDef(v);const cap=isFoot?2:(v?.type==='mech'?def.bulletCap:(state.config?.bulletCap||3));if(state.bullets.filter(b=>b.owner===owner&&b.life>0).length>=cap)return false;
 const t=state.tanks[owner],dx=Math.cos(t.a),dy=Math.sin(t.a);
 // Trace the barrel from the tank toward the muzzle. A tank beside a wall
 // must not launch its shell on the opposite side of that wall.
 let x=t.x+dx*(isFoot?7:12),y=t.y+dy*(isFoot?7:12);
 for(let distance=isFoot?9:14;distance<=(isFoot?17:34);distance+=2){const bx=t.x+dx*distance,by=t.y+dy*distance;if(blocked(bx,by,isFoot?3:5))break;x=bx;y=by;}
 t.shield=0; // Shooting cancels spawn/ejection immunity.
 const speed=isFoot?475:def.projectileSpeed;state.bullets.push({x,y,vx:dx*speed,vy:dy*speed,owner,life:isFoot?.9:3.8,bounces:0,age:0,kind:isFoot?'sidearm':v?.type==='mech'?'mech':'shell'});t.flash=.11;if(!isFoot)t.recoil=1;emitFx('shot',x,y,colors[owner],owner);sound(410+owner*80,.065,x,y);refreshHUD();return true;}
function respawn(victim){const enemies=state.tanks.filter((_,i)=>i!==victim&&state.lives[i]>0&&!friendly(victim,i));const spots=[];
 if(mazeGrid){for(let r=0;r<mazeGrid.rows;r++)for(let c=0;c<mazeGrid.cols;c++)spots.push([(c+.5)*mazeGrid.cell,(r+.5)*mazeGrid.cell]);}
 else spots.push(...[[130,300],[830,300],[130,100],[830,500],[480,96],[480,500],[130,480],[830,120],[340,70],[620,525]]);
 const pool=spots.filter(([x,y])=>!blocked(x,y,isPilotMatch()?11:25)&&(isPilotMatch()||!parkedVehicleAt(x,y,25))&&state.tanks.every((other,j)=>j===victim||state.lives[j]===0||Math.hypot(x-other.x,y-other.y)>65));
 pool.sort((a,b)=>Math.min(...enemies.map(t=>Math.hypot(b[0]-t.x,b[1]-t.y)),10000)-Math.min(...enemies.map(t=>Math.hypot(a[0]-t.x,a[1]-t.y)),10000));
 const [x,y]=pool[0]||startingPosition(victim),t=state.tanks[victim];Object.assign(t,{x,y,a:0,vx:0,vy:0,shield:1.8,powerType:null,powerTimer:0,flash:0,onFoot:isPilotMatch()?true:false,vehicleId:null});
 state.bullets=state.bullets.filter(b=>Math.hypot(b.x-x,b.y-y)>50);}
function registerHit(attacker,victim){if(state.winner>=0||state.lives[victim]<=0||state.tanks[victim].shield>0||(attacker!==victim&&friendly(attacker,victim)))return false;
 const target=state.tanks[victim];if(target.powerType==='guard'&&target.powerTimer>0){target.powerType=null;target.powerTimer=0;emitFx('pickup',target.x,target.y,'#b59aff');state.event='BARRIER BLOCKED THE HIT!';state.eventTimer=.8;return false;}
 if(isPilotMatch()&&!target.onFoot){const vehicle=state.vehicles?.[target.vehicleId];if(vehicle&&vehicle.armor>0){
   vehicle.armor--;emitFx('hit',target.x,target.y,colors[victim],attacker,victim);
   if(victim===0){screenKick=comfort.shake?2.3:0;damagePulse=.28;}
   if(vehicle.armor===0)ejectPilot(victim);else{state.event=label(victim)+' '+vehicleDef(vehicle).name+' ARMOR '+vehicle.armor+'/'+vehicleDef(vehicle).armor;state.eventTimer=.75;}
   sound(155,.12,target.x,target.y);refreshHUD();return true;
 }}
 emitFx('hit',target.x,target.y,colors[victim],attacker,victim);if(victim===(mode==='guest'?1:0)){screenKick=comfort.shake?3.2:0;damagePulse=.58;}state.lives[victim]--;if(attacker!==victim)state.kos[attacker]++;state.event=label(victim)+' LOSES A LIFE!';state.eventTimer=.85;sound(130+attacker*80,.16,target.x,target.y);
 if(state.lives[victim]>0)respawn(victim);else{target.vx=target.vy=0;state.bullets=state.bullets.filter(b=>b.owner!==victim);
 const active=state.tanks.map((_,i)=>i).filter(i=>state.lives[i]>0),teams=[...new Set(active.map(i=>teamOf(i)))];
 if(teams.length<=1){state.winnerTeam=teams[0]??teamOf(attacker);state.winner=active[0]??attacker;state.event=state.config.teamMode==='coop'?(state.winnerTeam===0?'HUMANS WIN!':'BOTS WIN!'):state.config.teamMode==='teams'?(`TEAM ${state.winnerTeam===0?'BLUE':'RED'} WINS!`):(label(state.winner)+' WINS!');state.eventTimer=0;}}
 refreshHUD();return true;}
function step(dt){if(paused||state.winner>=0)return;
 if(isPilotMatch())for(const vehicle of state.vehicles){
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
 if(state.vehicleDropTimer<=0){deployVehicle();state.vehicleDropTimer=30+mazeRandom(deploymentSeed(state.mazeSeed,state.dropIndex+9))()*12;}
 if(state.pickupTimer<=0){spawnPickup();state.pickupTimer=state.pickups.length?15:3;}
 const inputs=state.tanks.map((t,i)=>i===0?makeControl(true):i===1&&mode==='duel'?makeControl(false):i===1&&mode==='host'?guestInput:botInput(i,dt));
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]<=0)continue;
 t.powerTimer=Math.max(0,(t.powerTimer||0)-dt);if(t.powerTimer<=0)t.powerType=null;t.flash=Math.max(0,(t.flash||0)-dt);t.recoil=Math.max(0,(t.recoil||0)-dt*6);t.ejectAnim=Math.max(0,(t.ejectAnim||0)-dt);
 t.shield=Math.max(0,t.shield-dt);tankMove(t,inputs[i],dt,i);
 for(const p of state.pickups){if(!t.onFoot&&Math.hypot(t.x-p.x,t.y-p.y)<35){collectPickup(t,i,p);break}}
 fireCooldown[i]=Math.max(0,(fireCooldown[i]||0)-dt);if(inputs[i]?.fire&&fireCooldown[i]<=0&&shoot(i))fireCooldown[i]=t.onFoot?.48:(t.powerType==='rapid'?.13:vehicleDef(currentVehicle(t)).fireCooldown);}
 for(const b of state.bullets){b.age+=dt;b.life-=dt;const substeps=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*dt/5)),subDt=dt/substeps;
 for(let j=0;j<substeps&&b.life>0&&state.winner<0;j++){const nx=b.x+b.vx*subDt,ny=b.y+b.vy*subDt;
 if(blocked(nx,b.y,b.kind==='sidearm'?3:5)){if(b.kind==='sidearm'){b.life=0;break}b.vx=-b.vx;b.bounces++;emitFx('bounce',b.x,b.y,colors[b.owner]);sound(700,.018,b.x,b.y)}else b.x=nx;
 if(blocked(b.x,ny,b.kind==='sidearm'?3:5)){if(b.kind==='sidearm'){b.life=0;break}b.vy=-b.vy;b.bounces++;emitFx('bounce',b.x,b.y,colors[b.owner]);sound(700,.018)}else b.y=ny;
 for(const bump of bumpers){const dx=b.x-bump.x,dy=b.y-bump.y,dist=Math.hypot(dx,dy);if(dist>0&&dist<bump.r+6&&(b.bumpDelay||0)<=0){const ux=dx/dist,uy=dy/dist,dot=b.vx*ux+b.vy*uy;if(dot<0){b.vx-=2*dot*ux;b.vy-=2*dot*uy;b.x=bump.x+ux*(bump.r+7);b.y=bump.y+uy*(bump.r+7);b.bounces++;b.bumpDelay=.09;emitFx('bounce',b.x,b.y,'#ffdf7b');sound(940,.05,b.x,b.y)}}}
 b.bumpDelay=Math.max(0,(b.bumpDelay||0)-subDt);if(b.bounces>(b.kind==='mech'?2:5)){b.life=0;break}
 // Unoccupied vehicle bays are non-solid training projections. Projectiles
 // pass through as well; only a piloted vehicle has physical armor.
 if(b.life<=0)break;
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]>0&&(i===b.owner?(b.age>.38&&b.bounces>0):!friendly(i,b.owner))&&t.shield<=0&&(t.x-b.x)**2+(t.y-b.y)**2<((t.onFoot?14:26)+(b.kind==='mech'?5:0))**2){b.life=0;registerHit(b.owner,i);break}}}}
 state.bullets=state.bullets.filter(b=>b.life>0);}
function sound(freq,len=.09,x=null,y=null){if(!comfort.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!window.rrAudio)window.rrAudio=new AC;const ac=window.rrAudio;if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=freq;const me=state.tanks[mode==='guest'?1:0],dist=Number.isFinite(x)&&Number.isFinite(y)&&me?Math.hypot(x-me.x,y-me.y):0;const loudness=.028*Math.max(.065,1-dist/950);g.gain.setValueAtTime(loudness,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+len);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+len)}catch(_){}}
function updateVisuals(dt){visualClock+=dt;screenKick=Math.max(0,screenKick-dt*22);damagePulse=Math.max(0,damagePulse-dt*1.65);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.max(0,1-dt*3);p.vy*=Math.max(0,1-dt*3)}particles=particles.filter(p=>p.life>0)}

function drawTopTank(c,paint,parked=false,trackLeft=0,trackRight=0,recoil=0,suspension=0){
 // Art contract v0.9.6: vehicle local +X is FORWARD (toward the barrel).
 // Tracks run parallel to +X at BOTH sides of the hull. Mirror them from
 // one geometry definition, never draw the right tread with separate offsets.
 c.save();c.translate(-3*recoil,Math.sin((trackLeft+trackRight)*.35)*suspension*.65);c.lineJoin='miter';c.lineWidth=2;c.strokeStyle='#071820';
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
 c.fillStyle=paint;c.fillRect(-22,-15,43,30);c.strokeStyle='#071a22';c.strokeRect(-22,-15,43,30);
 c.fillStyle='#193845';c.fillRect(-17,-11,34,22);
 c.fillStyle='#3d6673';c.fillRect(-17,-11,7,22);
 c.fillStyle=paint;c.fillRect(-12,-10,24,20);c.strokeRect(-12,-10,24,20);
 c.fillStyle='#bfe3e6';c.fillRect(-7,-5,8,10);
 // A single centerline weapon (not an extra sideways track or misaligned gun).
 c.fillStyle='#081924';c.fillRect(10,-6,25,12);c.strokeRect(10,-6,25,12);
 c.fillStyle='#477e8b';c.fillRect(13,-3,22,6);
 c.fillStyle=paint;c.fillRect(33,-5,6,10);
 c.fillStyle='#eaf9f5';c.fillRect(38,-3,3,6);
 if(parked){c.strokeStyle='#83bba9';c.lineWidth=1.7;c.strokeRect(-29,-30,58,60)}
 c.restore();
}
function drawTopMech(c,paint,parked=false,stride=0){
 // True top-down walker: two separate articulated legs, shoulders and central cockpit.
 // Readable at phone scale; the dark gaps distinguish the mech from tracked tanks.
 c.save();c.lineWidth=2;c.strokeStyle='#071723';
 for(const side of [-1,1]){
   c.save();c.scale(1,side);
   // Alternating walking gait; mirrored limbs retain their geometry at rest.
   c.translate(side*stride,0);
   c.fillStyle='#111f2c';c.fillRect(-25,12,17,12);c.fillRect(-22,19,15,17);
   c.fillStyle=paint;c.fillRect(-23,15,12,9);c.strokeRect(-23,15,12,9);
   c.fillStyle='#6c84a0';c.fillRect(-20,28,16,7);c.strokeRect(-20,28,16,7);
   // Forward shoulder/arm, separated visibly from the torso.
   c.fillStyle=paint;c.fillRect(2,17,17,12);c.strokeRect(2,17,17,12);
   c.fillStyle='#192a3e';c.fillRect(13,19,12,7);c.strokeRect(13,19,12,7);
   c.restore();
 }
 c.fillStyle='#17283a';c.fillRect(-14,-17,32,34);
 c.fillStyle=paint;c.fillRect(-13,-15,27,30);c.strokeRect(-13,-15,27,30);
 c.fillStyle='#243d55';c.fillRect(-8,-10,16,20);
 c.fillStyle='#e5e5ff';c.fillRect(-3,-8,9,16);
 c.fillStyle='#162639';c.fillRect(12,-6,20,12);c.strokeRect(12,-6,20,12);
 c.fillStyle=paint;c.fillRect(27,-5,8,10);c.fillStyle='#e6f8ff';c.fillRect(33,-3,5,6);
 if(parked){c.strokeStyle='#cfb4fd';c.lineWidth=2;c.strokeRect(-29,-38,67,76)}
 c.restore();
}
function drawTopPilot(c,paint,shooting=false,stride=0){
 // True overhead pilot: two boots, shoulder pads, helmet visor and sidearm pointing +X.
 c.save();c.lineWidth=2;c.strokeStyle='#071720';
 c.fillStyle='#142b39';c.fillRect(-14+stride,-12,10,8);c.fillRect(-14-stride,4,10,8);
 c.fillStyle=paint;c.fillRect(-10,-11,16,22);c.strokeRect(-10,-11,16,22);
 c.fillStyle='#243b47';c.fillRect(-6,-7,13,14);
 c.fillStyle=paint;c.beginPath();c.arc(-1,0,8,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='#c7eff2';c.fillRect(1,-4,5,8);
 c.fillStyle='#152939';c.fillRect(7,-4,13,8);c.fillStyle='#b8ced4';c.fillRect(16,-3,5,6);
 if(shooting){c.fillStyle='#ffe5a0';c.beginPath();c.arc(25,0,4,0,Math.PI*2);c.fill()}
 c.restore();
}
function render(dt=STEP){const c=ctx;c.clearRect(0,0,W,H);c.save();if(screenKick>0)c.translate(Math.sin(visualClock*130)*screenKick,Math.cos(visualClock*98)*screenKick*.5);const zoom=mazeGrid?1.28:1,viewW=W/zoom,viewH=H/zoom,me=mode==='guest'?1:0,localTank=state.lives[me]>0?state.tanks[me]:(state.tanks.find((t,i)=>state.lives[i]>0)||state.tanks[me]||state.tanks[0]);
 const desiredX=clamp((localTank?.x||W/2)-viewW/2,0,Math.max(0,worldW-viewW)),desiredY=clamp((localTank?.y||H/2)-viewH/2,0,Math.max(0,worldH-viewH));
 const follow=1-Math.exp(-Math.min(.1,dt)*13);camera.x+=(desiredX-camera.x)*follow;camera.y+=(desiredY-camera.y)*follow;if(!mazeGrid){camera.x=0;camera.y=0}
 c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);
 c.fillStyle='#101f2b';c.fillRect(0,0,worldW,worldH);
 // Modular FIELDGRID surface, deterministic from cell coordinates with no per-frame randomness.
 // Culling ensures large mazes don't draw decorative details outside the camera.
 const left=camera.x-56,right=camera.x+viewW+56,top=camera.y-56,bottom=camera.y+viewH+56;
 const tile=132,xmin=Math.max(0,Math.floor(left/tile)),xmax=Math.min(Math.ceil(worldW/tile),Math.ceil(right/tile)),ymin=Math.max(0,Math.floor(top/tile)),ymax=Math.min(Math.ceil(worldH/tile),Math.ceil(bottom/tile));
 for(let gy=ymin;gy<ymax;gy++)for(let gx=xmin;gx<xmax;gx++){
   const x=gx*tile,y=gy*tile,hash=(gx*19+gy*37+currentSeed%23)%11;
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
 for(const p of state.pickups||[]){const def=PICKUPS[p.type];if(!def)continue;const pulse=1+Math.sin(visualClock*5)*.09;c.beginPath();c.arc(p.x,p.y,23*pulse,0,Math.PI*2);c.fillStyle='#0b2630';c.fill();c.strokeStyle=def.color;c.lineWidth=3;c.stroke();c.fillStyle=def.color;c.font='900 22px system-ui';c.textAlign='center';c.fillText(def.label,p.x,p.y+7)}
 if(isPilotMatch())for(const v of state.vehicles){if(v.occupant!==-1)continue;
   if(v.armor>0){c.beginPath();c.arc(v.x,v.y,v.type==='mech'?42:35,0,Math.PI*2);c.strokeStyle=v.type==='mech'?'#6a5486':'#3e7568';c.lineWidth=2;c.stroke();}
   c.save();c.translate(v.x,v.y);c.rotate(v.a);
   if(v.armor<=0){c.fillStyle='#192b31';c.fillRect(-19,-18,38,36);c.strokeStyle='#fd7858';c.lineWidth=3;c.strokeRect(-19,-18,38,36);}
   else {c.globalAlpha=.64;
    if(v.type==='mech')drawTopMech(c,'#b69aff',true);else drawTopTank(c,'#72c3a8',true);}
   c.restore();if(v.armor>0){const me=state.tanks[mode==='guest'?1:0];const near=me?.onFoot&&Math.hypot(me.x-v.x,me.y-v.y)<68;
     if(near){c.fillStyle='#bff9d9';c.font='bold 12px system-ui';c.textAlign='center';c.fillText('ENTER  ·  '+vehicleDef(v).name,v.x,v.y+48);c.strokeStyle='#aaf3da';c.lineWidth=2;c.beginPath();c.arc(v.x,v.y,37+Math.sin(visualClock*5)*3,0,Math.PI*2);c.stroke();}}
 }
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]<=0)continue;
 if(state.config?.teamMode!=='ffa'){c.beginPath();c.arc(t.x,t.y,29,0,Math.PI*2);c.strokeStyle=teamOf(i)===0?'#60dfff':'#ffb06e';c.lineWidth=4;c.stroke()}
 c.save();c.translate(t.x,t.y);c.rotate(t.a);
 if(t.onFoot){
   const stride=Math.sin(visualClock*15+i*1.7)*Math.min(3.5,Math.hypot(t.vx,t.vy)/65);
   drawTopPilot(c,colors[i],t.flash>0,stride);c.strokeStyle=colors[i];c.lineWidth=2;c.beginPath();c.arc(0,0,15,0,Math.PI*2);c.stroke();
   c.restore();
   if(t.ejectAnim>0){c.save();c.globalAlpha=Math.min(.7,t.ejectAnim/.62);c.strokeStyle='#e5faff';c.lineWidth=2;c.beginPath();c.arc(t.x,t.y,18+(1-t.ejectAnim/.62)*22,0,Math.PI*2);c.stroke();c.restore();}
 }else{
 if(t.shield>0){c.globalAlpha=.65+.25*Math.sin(t.shield*15)}
 (currentVehicle(t)?.type==='mech'?drawTopMech(c,colors[i],false,Math.sin(visualClock*10+i*1.9)*Math.min(4.1,Math.hypot(t.vx,t.vy)/42)):drawTopTank(c,colors[i],false,t.trackLeft||0,t.trackRight||0,t.recoil||0,Math.min(1,Math.hypot(t.vx,t.vy)/170)));if(t.flash>0){c.fillStyle='#fff3a0';c.beginPath();c.arc(39,0,8+t.flash*70,0,Math.PI*2);c.fill()}c.restore();
 if(isPilotMatch()){const v=state.vehicles?.[t.vehicleId];if(v){c.fillStyle='#16313b';c.fillRect(t.x-19,t.y+29,38,5);c.fillStyle='#79eab2';c.fillRect(t.x-19,t.y+29,38*v.armor/vehicleDef(v).armor,5);}}}
 if(t.powerType&&t.powerTimer>0&&PICKUPS[t.powerType]){c.fillStyle=PICKUPS[t.powerType].color;c.font='900 11px system-ui';c.textAlign='center';c.fillText(PICKUPS[t.powerType].name+' '+Math.ceil(t.powerTimer)+'s',t.x,t.y+48)}
 if(t.shield>0){c.beginPath();c.arc(t.x,t.y,32+Math.sin(t.shield*10)*2,0,Math.PI*2);c.strokeStyle=colors[i];c.globalAlpha=clamp(t.shield/1.8*.8,0,.8);c.lineWidth=3;c.stroke();c.globalAlpha=1}
 c.fillStyle=colors[i];c.font='bold 13px system-ui';c.textAlign='center';c.fillText(i<state.humanCount?'P'+(i+1):'AI'+(i-state.humanCount+1),t.x,t.y-38);
 if(i===(mode==='guest'?1:0)){c.beginPath();c.moveTo(t.x,t.y-59);c.lineTo(t.x-8,t.y-71);c.lineTo(t.x+8,t.y-71);c.closePath();c.fillStyle='#ffffff';c.fill();}}
 for(const b of state.bullets){
   const foot=b.kind==='sidearm',heavy=b.kind==='mech';
   const length=Math.min(foot?10:heavy?24:19,Math.hypot(b.vx,b.vy)*.037);
   c.beginPath();c.moveTo(b.x-b.vx/405*length,b.y-b.vy/405*length);c.lineTo(b.x,b.y);
   c.strokeStyle=foot?'#d9f3e8':colors[b.owner];c.lineWidth=foot?2.5:heavy?6:4;c.stroke();
   c.beginPath();c.arc(b.x,b.y,foot?3.2:heavy?8:6,0,Math.PI*2);
   c.fillStyle=foot?'#dbffd8':'#f8ffff';c.shadowColor=colors[b.owner];c.shadowBlur=foot?3:heavy?17:12;c.fill();c.shadowBlur=0;
   if(heavy){c.beginPath();c.arc(b.x,b.y,11,0,Math.PI*2);c.strokeStyle='#c5a6ff';c.lineWidth=2;c.stroke();}
 }
 // Short, readable impact rings; effects are serialized for nearby-play guests.
 for(const fx of state.fxEvents||[]){
   if(fx.kind!=='hit'&&fx.kind!=='eject'&&fx.kind!=='bounce')continue;
   const span=fx.kind==='eject'?.8:fx.kind==='hit'?.75:.4;const progress=1-clamp((fx.ttl||0)/span,0,1);
   const radius=fx.kind==='eject'?20+progress*48:fx.kind==='hit'?8+progress*33:4+progress*12;
   c.save();c.globalAlpha=(fx.kind==='bounce'?.5:.75)*(1-progress);c.strokeStyle=fx.kind==='eject'?'#f6e4bd':fx.kind==='hit'?'#fff0bf':'#9fd9f3';
   c.lineWidth=fx.kind==='eject'?4:2.5;c.beginPath();c.arc(fx.x,fx.y,radius,0,Math.PI*2);c.stroke();c.restore();
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
 for(let i=0;i<state.tanks.length;i++){if(state.lives[i]<=0)continue;const t=state.tanks[i],me=mode==='guest'?1:0;if(i!==me&&Math.hypot(t.x-state.tanks[me].x,t.y-state.tanks[me].y)>400)continue;c.beginPath();c.arc(t.x,t.y,37,0,Math.PI*2);c.fillStyle=colors[i];c.fill()}
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
 if(state.winner>=0){
   c.fillStyle='#06141ce8';c.fillRect(0,0,W,H);
   const pw=Math.min(570,W-80),left=(W-pw)/2,py=H/2-134;
   c.fillStyle='#102b38';c.fillRect(left,py,pw,214);c.strokeStyle='#557685';c.lineWidth=2;c.strokeRect(left+.5,py+.5,pw-1,213);
   c.fillStyle='#5dd4e9';c.fillRect(left,py,5,214);
   c.textAlign='center';c.fillStyle='#a6c2cd';c.font='800 15px system-ui';c.fillText('FIELDGRID  /  AFTER ACTION',W/2,py+37);
   const localWon=state.lives[me]>0&&teamOf(me)===state.winnerTeam;
   c.fillStyle=localWon?'#8fe3bf':'#f1d19d';c.font='900 42px system-ui';c.fillText(localWon?'SECTOR CLEARED':'SECTOR LOST',W/2,py+95);
   c.fillStyle='#e0f1f3';c.font='800 17px system-ui';c.fillText(String(state.event||'MATCH COMPLETE'),W/2,py+128);
   c.fillStyle='#9abac6';c.font='600 15px system-ui';c.fillText(`PILOT LIVES  ${state.lives[me]||0}   ·   HITS  ${state.kos[me]||0}`,W/2,py+163);
   c.fillStyle='#7f9daa';c.font='600 13px system-ui';c.fillText(mode==='guest'?'WAIT FOR HOST TO REDEPLOY':'NEW MAZE AVAILABLE',W/2,py+190);
 }
 if(paused&&mode==='host'&&!connected){c.fillStyle='#071b26b5';c.fillRect(0,0,W,H);c.fillStyle='#d4f0f2';c.font='bold 28px system-ui';c.textAlign='center';c.fillText('WAITING FOR PLAYER TWO',W/2,H/2)}
 if(damagePulse>0){c.strokeStyle='#ff766d';c.globalAlpha=Math.min(.65,damagePulse);c.lineWidth=12+damagePulse*24;c.strokeRect(7,7,W-14,H-14);c.globalAlpha=1}
 }
function nativePacket(packet){if(!window.AndroidBridge)return;try{window.AndroidBridge.sendPacket(JSON.stringify(packet))}catch(e){notice('Network send failed')}}
function loop(now){const dt=clamp((now-lastTime)/1000,0,.085);lastTime=now;
 if(mode==='solo'||mode==='duel'||mode==='host'){if(!paused&&state.winner<0){fixedAccumulator=Math.min(.12,fixedAccumulator+dt);let ticks=0;while(fixedAccumulator>=STEP&&ticks++<5){step(STEP);fixedAccumulator-=STEP}}else fixedAccumulator=0;}
 updateVisuals(dt);hudTimer+=dt;if(hudTimer>.15){hudTimer=0;refreshHUD();}
 if(mode==='host'&&connected){snapshotTimer+=dt;if(snapshotTimer>.09){snapshotTimer=0;nativePacket({type:'state',state:serializeState()})}}
 if(mode==='guest'&&connected){sendTimer+=dt;if(sendTimer>.05){sendTimer=0;nativePacket({type:'input',input:menu.classList.contains('hidden')&&!document.hidden?makeControl(true):{moveX:0,moveY:0,fire:false}})}}
 render(dt);requestAnimationFrame(loop)}
function bridgeReady(){return !!window.AndroidBridge}
function host(){if(!bridgeReady()){notice('Nearby mode requires the Android APK');return}newMatch('host');setPanel('<div class="eyebrow">NEARBY PLAY</div><h2>HOSTING MATCH</h2><p id="host-status">Starting local game...</p><div class="host-address" id="host-address"></div><button data-action="close">CANCEL</button>');window.AndroidBridge.hostGame()}
function find(){if(!bridgeReady()){notice('Nearby mode requires the Android APK');return}newMatch('guest');setPanel('<div class="eyebrow">NEARBY PLAY</div><h2>FIND A MATCH</h2><p id="find-status">Looking for games on the same Wi-Fi...</p><div id="rooms"></div><button data-action="manual">JOIN BY LOCAL IP</button><button data-action="close">BACK</button>');window.AndroidBridge.findGames()}
function manual(){if(!bridgeReady()){notice('Manual LAN join requires the Android APK');return}newMatch('guest');setPanel('<div class="eyebrow">FALLBACK</div><h2>JOIN BY ADDRESS</h2><p>Enter the IP:port shown on the host screen, such as 192.168.1.25:47321</p><input id="lan-address" placeholder="192.168.1.25:47321" inputmode="url" autocapitalize="off"><button data-action="ip-join">CONNECT</button><button data-action="find">FIND NEARBY</button>')}
function stop(){if(bridgeReady())window.AndroidBridge.stopNetwork();connected=false;paused=true;mode='idle';releaseControls();document.getElementById('mode-label').textContent='NO GAME ACTIVE';panel.innerHTML=originalPanel;applyPrefsToUI();menu.classList.remove('hidden')}
const originalPanel=panel.innerHTML;
panel.addEventListener('change',e=>{const el=e.target;if(el.id?.startsWith('pref-')){const key=el.id.slice(5);if(key in comfort)comfort[key]=el.checked;applyPrefsToUI()}savePrefs()});
loadPrefs();

menu.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='help'){setPanel('<div class="eyebrow">FIELDGRID / FIELD MANUAL</div><h2>HOW TO <span>PLAY</span></h2><div class="help-copy"><p><strong>01 / MOVE + FIRE</strong>Steer with the left thumb. Hold FIRE on the right; only a few shells can be active.</p><p><strong>02 / KEEP FIGHTING</strong>Hits remove vehicle armor first. A destroyed vehicle ejects its pilot; losing a life happens on foot.</p><p><strong>03 / RECOVER A RIDE</strong>Pilots are faster, smaller and armed. Walk or drive through an empty tank or mech. Tap ENTER when close to activate it.</p><p><strong>04 / READ THE FIELD</strong>Every match builds a new maze. The radar shows gunfire and incoming vehicle deployments.</p></div><button class="primary" data-action="help-back">BACK TO MENU</button>')}else if(a==='help-back'){panel.innerHTML=originalPanel;applyPrefsToUI()}else if(a==='settings'){savePrefs();setPanel(document.getElementById('settings-template').innerHTML);applyPrefsToUI()}else if(a==='settings-back'){savePrefs();panel.innerHTML=originalPanel;applyPrefsToUI()}else if(a==='settings-play'){savePrefs();newMatch('solo')}else if(a==='solo')newMatch('solo');else if(a==='nearby'){savePrefs();setPanel('<div class="eyebrow">TWO PHONES · SAME WI-FI</div><h2>PLAY <span>TOGETHER</span></h2><p>One phone hosts. The other finds and joins it. Both use the same match rules and can drive, eject, and enter tanks.</p><button class="primary" data-action="host">HOST GAME</button><button data-action="find">FIND GAME</button><button data-action="manual">JOIN BY IP</button><button data-action="help-back">◀ BACK</button>')}else if(a==='duel')newMatch('duel');else if(a==='host')host();else if(a==='find')find();else if(a==='manual')manual();else if(a==='close')stop();else if(a==='ip-join'){
 const s=document.getElementById('lan-address').value.trim(),m=s.match(/^([\da-fA-F:.]+):(\d{1,5})$/);
 if(!m||+m[2]>65535||+m[2]<1){notice('Please enter a valid address and port');return}document.getElementById('mode-label').textContent='CONNECTING';window.AndroidBridge.joinGame(m[1],Number(m[2]));}});
function showPauseMenu(){releaseControls();if(mode==='idle')return;
 if(mode==='solo'||mode==='duel'){paused=true;setPanel('<div class="eyebrow">FIELDGRID / PAUSED</div><h2>SECTOR <span>PAUSED</span></h2><p class="pause-hint">The field is frozen. Continue or generate a fresh sector.</p><div class="pause-actions"><button class="primary" data-action="resume">RESUME MATCH</button><button data-action="restart">NEW FIELD</button><button data-action="close">MAIN MENU</button></div>')}
 else if(mode==='host'){paused=true;guestInput={moveX:0,moveY:0,fire:false};setPanel('<div class="eyebrow">FIELDGRID / HOST PAUSED</div><h2>SECTOR <span>PAUSED</span></h2><p class="pause-hint">Both players are paused.</p><div class="pause-actions"><button class="primary" data-action="resume">RESUME MATCH</button><button data-action="restart">NEW FIELD</button><button data-action="close">DISCONNECT</button></div>')}
 else if(mode==='guest'){if(connected)nativePacket({type:'input',input:{moveX:0,moveY:0,fire:false}});setPanel('<div class="eyebrow">FIELDGRID / PLAYER MENU</div><h2>SECTOR <span>MENU</span></h2><p class="pause-hint">The host controls rematches.</p><div class="pause-actions"><button class="primary" data-action="resume">BACK TO ARENA</button><button data-action="close">DISCONNECT</button></div>')}}
document.getElementById('menu-button').addEventListener('click',showPauseMenu);
document.getElementById('quick-rematch')?.addEventListener('click',()=>{if(state.winner>=0&&mode!=='guest'&&mode!=='idle'){resetAll();notice('NEW FIELD · NEW FIGHT',1400)}});
document.getElementById('interact-btn')?.addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='guest'){if(connected&&!paused&&menu.classList.contains('hidden')&&!state.hostPaused)nativePacket({type:'interact'});}else tryInteract(0)});
menu.addEventListener('click',e=>{const a=e.target?.dataset?.action;
 if(a==='resume'){if(mode==='solo'||mode==='duel'||mode==='host')paused=false;exitMenu()}
 else if(a==='restart'&&mode!=='guest'){resetAll();exitMenu()}});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if([...Object.values(keys1),...Object.values(keys2)].includes(e.code))e.preventDefault();pressed.add(e.code);if(e.code==='KeyR'&&state.winner>=0&&mode!=='guest')resetAll();if(e.code==='KeyE'&&!e.repeat&&menu.classList.contains('hidden')){if(mode==='guest'&&connected&&!state.hostPaused)nativePacket({type:'interact'});else if(mode==='solo'||mode==='host'||mode==='duel')tryInteract(0)}});
window.addEventListener('keyup',e=>pressed.delete(e.code));window.addEventListener('blur',releaseControls);
for(const b of document.querySelectorAll('[data-key]')){const k=b.dataset.key;const release=e=>{touch.delete(k);b.classList.remove('active');try{b.releasePointerCapture(e.pointerId)}catch(_){}};
 b.addEventListener('pointerdown',e=>{e.preventDefault();touch.add(k);b.classList.add('active');b.setPointerCapture(e.pointerId)});b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',()=>{touch.delete(k);b.classList.remove('active')})}
const joystick=document.getElementById('joystick'),knob=document.getElementById('stick-knob');
function clearStick(){stick.x=stick.y=0;stick.pointerId=null;knob.style.transform='translate(-50%, -50%)';joystick.classList.remove('active')}
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
 case 'connected':{connected=true;paused=false;document.getElementById('mode-label').textContent=mode==='guest'?'YOU: CORAL':mode==='host'?'YOU: CYAN':'CONNECTED';exitMenu();notice('Player connected — FIGHT!');if(mode==='host'){state=initialState(state.arenaId,state.config,state.mazeSeed);refreshHUD()}break}
 case 'state':if(mode==='guest'&&msg.state&&Array.isArray(msg.state.tanks)&&msg.state.tanks.length>=2&&msg.state.tanks.length<=6&&Array.isArray(msg.state.lives)&&msg.state.lives.length===msg.state.tanks.length&&Array.isArray(msg.state.kos)&&msg.state.kos.length===msg.state.tanks.length){const upcoming=msg.state;const currentEvents=Array.isArray(upcoming.fxEvents)?upcoming.fxEvents:[];for(const event of currentEvents){if(event.id>lastRemoteFxId&&event.id<lastRemoteFxId+1000&&Number.isFinite(event.x)&&Number.isFinite(event.y)){spawnParticles(event.kind,event.x,event.y,event.color);if(event.kind==='hit'&&event.target===1){damagePulse=.58;screenKick=comfort.shake?3.2:0}if(event.kind==='shot')sound(420,.06,event.x,event.y);if(event.kind==='hit')sound(170,.13,event.x,event.y);lastRemoteFxId=event.id}}state=upcoming;setArena(0,state.mazeSeed,state.config?.mapSize);refreshHUD()}break;
 case 'input':if(mode==='host'&&msg.input){guestInput.moveX=clamp(Number(msg.input.moveX)||0,-1,1);guestInput.moveY=clamp(Number(msg.input.moveY)||0,-1,1);guestInput.fire=msg.input.fire===true}break;
 case 'interact':if(mode==='host'&&connected&&!paused)tryInteract(1);break;
 case 'disconnected':connected=false;paused=true;guestInput={moveX:0,moveY:0,fire:false};clearStick();notice('Other player disconnected');setPanel('<h2>CONNECTION LOST</h2><p>Return to the main menu and reconnect.</p><button data-action="close">MAIN MENU</button>');break;
 case 'error':notice(msg.message||'Network error');break;}}};
resizeArenaCanvas();refreshHUD();requestAnimationFrame(loop);
})();