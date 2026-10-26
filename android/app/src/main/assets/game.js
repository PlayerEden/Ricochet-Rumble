(()=>{'use strict';
const W=960,H=600,START_LIVES=5;
// W/H are the camera canvas resolution. Mazes have much larger world coordinates.
let worldW=W,worldH=H,mazeGrid=null,currentArena=-1,currentSeed=0;const camera={x:0,y:0};
const PALETTE=['#46d2f5','#fc856e','#ffdc77','#b69aff','#82e6a1','#fc8bde'];
const gameNames=['CYAN','CORAL','GOLD','VIOLET','MINT','PINK'];
const ARENAS=[
 {name:'Foundry',walls:[{x:215,y:145,w:116,h:28},{x:630,y:425,w:116,h:28},{x:438,y:92,w:84,h:146},{x:438,y:361,w:84,h:146},{x:278,y:330,w:28,h:104},{x:654,y:165,w:28,h:104}]},
 {name:'Crossroads',walls:[{x:376,y:220,w:208,h:30},{x:376,y:350,w:208,h:30},{x:310,y:260,w:30,h:80},{x:620,y:260,w:30,h:80},{x:178,y:110,w:120,h:30},{x:662,y:460,w:120,h:30}]},
 {name:'Pinball',bumpers:[{x:229,y:225,r:26},{x:731,y:375,r:26}],walls:[{x:300,y:115,w:32,h:154},{x:628,y:331,w:32,h:154},{x:420,y:280,w:120,h:40},{x:628,y:115,w:32,h:95},{x:300,y:390,w:32,h:95},{x:154,y:440,w:96,h:24},{x:710,y:136,w:96,h:24}]},
 {name:'Labyrinth',maze:{cols:12,rows:8,cell:118}},
 {name:'Maze XL',maze:{cols:20,rows:13,cell:118}}
];
const PICKUPS={rapid:{label:'R',name:'RAPID FIRE',color:'#ffd46d'},turbo:{label:'»',name:'TURBO',color:'#76efaf'},guard:{label:'+',name:'BARRIER',color:'#b59aff'}};
const pickupSpots=[[480,300],[195,300],[765,300],[372,300],[587,300],[390,90],[570,510],[395,520],[560,90]];
const canvas=document.getElementById('arena'),ctx=canvas.getContext('2d');
const menu=document.getElementById('menu'),panel=document.getElementById('panel'),toast=document.getElementById('toast');
let wallSet=ARENAS[0].walls,bumpers=ARENAS[0].bumpers||[];
const colors=PALETTE,pressed=new Set(),touch=new Set();
const stick={x:0,y:0,pointerId:null};
let mode='idle',connected=false,paused=true,lastTime=performance.now(),sendTimer=0,snapshotTimer=0,toastTimer=0,botTimer=0,hudTimer=0;
const botBrains=new Map();
let state=initialState();let guestInput={moveX:0,moveY:0,fire:false};
let particles=[],screenKick=0,fxSeq=0,lastRemoteFxId=0,visualClock=0;
const keys1={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',fire:'Space'},keys2={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',fire:'Enter'};
const fireCooldown=Array(6).fill(0);
function value(id,fallback,min,max){const raw=document.getElementById(id)?.value;const n=Number(raw);return raw!==''&&raw!=null&&Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
function readSettings(){return {botCount:value('bot-count',1,0,4),bulletCap:value('bullet-cap',3,1,8),startLives:value('lives-choice',5,1,10),teamMode:['ffa','coop','teams'].includes(document.getElementById('team-choice')?.value)?document.getElementById('team-choice').value:'ffa'};}
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
function setArena(id,seed=1){const v=Number(id),arena=Number.isInteger(v)&&v>=0&&v<ARENAS.length?v:0,def=ARENAS[arena];
 if(currentArena===arena&&currentSeed===seed)return arena;currentArena=arena;currentSeed=seed;
 mazeGrid=def.maze?createMaze(def.maze,seed):null;wallSet=mazeGrid?mazeGrid.walls:def.walls;bumpers=def.bumpers||[];
 worldW=mazeGrid?mazeGrid.cols*mazeGrid.cell:W;worldH=mazeGrid?mazeGrid.rows*mazeGrid.cell:H;return arena;}
function selectArena(){return setArena(document.getElementById('arena-choice')?.value||0)}
function startingPosition(i){if(mazeGrid){const {cols,rows,cell}=mazeGrid,spots=[[0,Math.floor(rows/2)],[cols-1,Math.floor(rows/2)],[Math.floor(cols/2),0],[Math.floor(cols/2),rows-1],[2,2],[cols-3,rows-3]];
 const [x,y]=spots[i%spots.length];return [(x+.5)*cell,(y+.5)*cell];}
 const spots=[[130,300],[830,300],[480,96],[480,500],[130,100],[830,500]];return spots[i%spots.length]}
function freshTank(i){const [x,y]=startingPosition(i);return {x,y,a:i%2?Math.PI:0,vx:0,vy:0,shield:0,powerType:null,powerTimer:0,flash:0};}
function initialState(arena=0,options=null,seed=null){const config={...readSettings(),...(options||{})};let count=mode==='solo'?1:2;
 if((mode==='solo'||config.teamMode==='coop')&&config.botCount===0)config.botCount=1;const id=setArena(arena,seed||1),mazeSeed=seed||Math.floor(Math.random()*0x7fffffff)||1;setArena(id,mazeSeed);
 const numBots=config.botCount,humans=count,total=humans+numBots,tanks=Array.from({length:total},(_,i)=>freshTank(i));
 camera.x=0;camera.y=0;botBrains.clear();return {tanks,bullets:[],pickups:[],pickupTimer:5.5,arenaId:id,mazeSeed,config,humanCount:humans,fxEvents:[],lives:Array(total).fill(config.startLives),kos:Array(total).fill(0),winner:-1,winnerTeam:-1,event:'',eventTimer:0,matchId:0};}
function teamOf(i,st=state){const mode=st.config?.teamMode||'ffa';if(mode==='ffa')return i;if(mode==='coop')return i<st.humanCount?0:1;
 // Alternating teams; solo play always puts bots on the opposing team.
 return st.humanCount===1?(i===0?0:1):i%2;}
function friendly(a,b){return teamOf(a)===teamOf(b)}
function label(i){return i===0?'CYAN':i===1&&state.humanCount===2?'CORAL':`BOT ${i-state.humanCount+1}`;}
function emitFx(kind,x,y,color){const id=++fxSeq;state.fxEvents.push({id,kind,x,y,color});if(state.fxEvents.length>12)state.fxEvents.shift();spawnParticles(kind,x,y,color);lastRemoteFxId=id}
function spawnParticles(kind,x,y,color){const count=kind==='hit'?24:kind==='pickup'?17:kind==='bounce'?5:kind==='shot'?7:12;const speed=kind==='hit'?205:kind==='bounce'?95:kind==='shot'?115:135;
 for(let i=0;i<count;i++){const a=(i/count)*Math.PI*2+Math.random()*.4,velocity=speed*(.28+Math.random()*.72),life=(kind==='shot'?.17:kind==='bounce'?.14:.42)+Math.random()*.26;particles.push({x,y,vx:Math.cos(a)*velocity,vy:Math.sin(a)*velocity,life,maxLife:life,color,size:kind==='hit'?2.5+Math.random()*3:1.5+Math.random()*2.2})}if(particles.length>260)particles.splice(0,particles.length-260);}
function spawnPickup(){if(state.pickups.length||state.winner>=0)return;
 const spots=mazeGrid?Array.from({length:mazeGrid.cols*mazeGrid.rows},(_,i)=>[((i%mazeGrid.cols)+.5)*mazeGrid.cell,(Math.floor(i/mazeGrid.cols)+.5)*mazeGrid.cell]):pickupSpots;
 const candidates=spots.filter(([x,y])=>!blocked(x,y,32)&&state.tanks.every((t,i)=>state.lives[i]===0||Math.hypot(t.x-x,t.y-y)>83));if(!candidates.length)return;
 const [x,y]=candidates[Math.floor(Math.random()*candidates.length)],types=Object.keys(PICKUPS),type=types[Math.floor(Math.random()*types.length)];state.pickups=[{x,y,type}];}
function collectPickup(t,i,p){t.powerType=p.type;t.powerTimer=p.type==='guard'?4.0:7.0;state.event=label(i)+' GOT '+PICKUPS[p.type].name;state.eventTimer=1;emitFx('pickup',p.x,p.y,PICKUPS[p.type].color);state.pickups=[];state.pickupTimer=8+Math.random()*4;refreshHUD();}

function notice(t){toast.textContent=t;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2400)}
function setPanel(html){panel.innerHTML=html;menu.classList.remove('hidden')}
function exitMenu(){menu.classList.add('hidden')}
function inputFrom(keys,isLocal){const down=k=>pressed.has(keys[k])||(isLocal&&touch.has(k));let moveX=Number(down('right'))-Number(down('left')),moveY=Number(down('down'))-Number(down('up'));
 if(isLocal&&stick.pointerId!==null){moveX=stick.x;moveY=stick.y}
 const length=Math.hypot(moveX,moveY);if(length>1){moveX/=length;moveY/=length}
 return {moveX,moveY,fire:down('fire')};}
function makeControl(isPlayer1){return isPlayer1?inputFrom(keys1,true):inputFrom(keys2,false)}
function serializeState(){return {tanks:state.tanks.map(t=>({...t})),bullets:state.bullets.map(b=>({...b})),pickups:state.pickups.map(p=>({...p})),pickupTimer:state.pickupTimer,arenaId:state.arenaId,mazeSeed:state.mazeSeed,config:{...state.config},humanCount:state.humanCount,fxEvents:state.fxEvents.slice(),lives:state.lives.slice(),kos:state.kos.slice(),winner:state.winner,winnerTeam:state.winnerTeam,event:state.event,eventTimer:state.eventTimer,matchId:state.matchId};}
function refreshHUD(){const me=mode==='guest'?1:0,other=me===0?1:0;
 document.getElementById('score0').textContent=state.lives[me]??0;document.getElementById('score1').textContent=state.lives[other]??0;
 const botLives=state.lives.slice(state.humanCount||2).filter(v=>v>0).length,active=state.bullets.filter(b=>b.owner===me).length;
 document.getElementById('round').textContent=state.winner>=0?'MATCH OVER · MENU TO REMATCH':`${active}/${state.config?.bulletCap||3} SHELLS · ${botLives} BOTS · ${state.kos[me]||0} KO`;
 const label0=document.getElementById('player0-label');if(label0)label0.textContent=mode==='guest'?'YOU':'CYAN';const label1=document.getElementById('player1-label');if(label1)label1.textContent=mode==='solo'?'BOT':mode==='guest'?'HOST':'CORAL';}
function newMatch(which){mode=which;paused=(which==='host'||which==='guest');connected=false;
 let arena=selectArena();if(which==='duel'&&ARENAS[arena].maze){arena=0;notice('Maze chase needs separate phones; keyboard duel uses Foundry')}
 state=initialState(arena);particles=[];fxSeq=lastRemoteFxId=0;fireCooldown.fill(0);clearStick();refreshHUD();document.getElementById('mode-label').textContent={solo:'SOLO VS BOTS',duel:'LOCAL DUEL',host:'HOST NEARBY',guest:'JOIN NEARBY'}[which]||'WAITING';if(which==='solo'||which==='duel')exitMenu();}
function resetAll(nextArena=false){let arena=nextArena?(state.arenaId+1)%ARENAS.length:state.arenaId;if(mode==='duel'&&ARENAS[arena].maze)arena=0;
 state=initialState(arena,state.config);particles=[];screenKick=0;lastRemoteFxId=fxSeq;fireCooldown.fill(0);clearStick();paused=(mode==='guest'||mode==='host')&&!connected;refreshHUD();if(mode!=='guest')notice(nextArena?'NEW ARENA — '+ARENAS[arena].name:'REMATCH — GO!');}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function circlesRect(x,y,r,w){const nx=clamp(x,w.x,w.x+w.w),ny=clamp(y,w.y,w.y+w.h);return (x-nx)**2+(y-ny)**2<r*r}
function blocked(x,y,r=21){return x<r+13||x>worldW-r-13||y<r+13||y>worldH-r-13||wallSet.some(w=>circlesRect(x,y,r,w))}
function tankMove(t,inp,dt,i){let mx=clamp(Number(inp.moveX)||0,-1,1),my=clamp(Number(inp.moveY)||0,-1,1);let mag=Math.hypot(mx,my);
 if(mag>1){mx/=mag;my/=mag;mag=1}if(mag<.09){mx=0;my=0;mag=0}
 const speed=(inp.bot?178:222)*(t.powerType==='turbo'&&t.powerTimer>0?1.48:1),blend=Math.min(1,dt*(mag?9:13));t.vx+=(mx*speed-t.vx)*blend;t.vy+=(my*speed-t.vy)*blend;
 if(mag){const target=Math.atan2(my,mx),diff=Math.atan2(Math.sin(target-t.a),Math.cos(target-t.a));t.a+=clamp(diff,-dt*12,dt*12)}
 const nx=t.x+t.vx*dt,ny=t.y+t.vy*dt;
 const collides=(x,y)=>blocked(x,y)||state.tanks.some((other,j)=>i!==j&&state.lives[j]>0&&(other.x-x)**2+(other.y-y)**2<42**2);
 if(!collides(nx,t.y))t.x=nx;else t.vx=0;
 if(!collides(t.x,ny))t.y=ny;else t.vy=0;}
function botInput(i,dt){const bot=state.tanks[i],enemies=state.tanks.map((t,j)=>({t,j})).filter(({j})=>j!==i&&state.lives[j]>0&&!friendly(i,j));
 if(!enemies.length)return {moveX:0,moveY:0,fire:false,bot:true};enemies.sort((a,b)=>Math.hypot(bot.x-a.t.x,bot.y-a.t.y)-Math.hypot(bot.x-b.t.x,bot.y-b.t.y));const target=enemies[0].t;
 let direction=Math.atan2(target.y-bot.y,target.x-bot.x),brain=botBrains.get(i)||{timer:0,path:[],goal:-1};brain.timer-=dt;
 if(mazeGrid){const {cols,cell,open}=mazeGrid,cellIndex=t=>clamp(Math.floor(t.y/cell),0,mazeGrid.rows-1)*cols+clamp(Math.floor(t.x/cell),0,cols-1),start=cellIndex(bot),goal=cellIndex(target);
 if(brain.timer<=0||brain.goal!==goal){const prev=Array(open.length).fill(-1),q=[start];prev[start]=start;for(let h=0;h<q.length&&prev[goal]===-1;h++)for(const j of open[q[h]])if(prev[j]===-1){prev[j]=q[h];q.push(j)}
 const path=[];if(prev[goal]!==-1){let n=goal;while(n!==start&&path.length<open.length){path.push(n);n=prev[n]}}brain.path=path.reverse();brain.goal=goal;brain.timer=.45+(i%4)*.09;}
 const waypoint=brain.path[0];if(waypoint!==undefined){const wx=((waypoint%cols)+.5)*cell,wy=(Math.floor(waypoint/cols)+.5)*cell;if(Math.hypot(wx-bot.x,wy-bot.y)<18){brain.path.shift()}else direction=Math.atan2(wy-bot.y,wx-bot.x);}
 }else{const aheadX=bot.x+Math.cos(direction)*72,aheadY=bot.y+Math.sin(direction)*72;if(blocked(aheadX,aheadY,27))direction+=Math.sin(visualClock*.9+i)>0?1.4:-1.4;}
 botBrains.set(i,brain);
 const delta=Math.atan2(Math.sin(Math.atan2(target.y-bot.y,target.x-bot.x)-bot.a),Math.cos(Math.atan2(target.y-bot.y,target.x-bot.x)-bot.a));
 const hasLine=!mazeGrid||Math.hypot(bot.x-target.x,bot.y-target.y)<310;
 return {moveX:Math.cos(direction)*.84,moveY:Math.sin(direction)*.84,fire:Math.abs(delta)<.31&&hasLine,bot:true};}
function shoot(owner){if(state.lives[owner]<=0)return false;
 const cap=state.config?.bulletCap||3;if(state.bullets.filter(b=>b.owner===owner&&b.life>0).length>=cap)return false;
 const t=state.tanks[owner],x=t.x+Math.cos(t.a)*34,y=t.y+Math.sin(t.a)*34;
 state.bullets.push({x,y,vx:Math.cos(t.a)*405,vy:Math.sin(t.a)*405,owner,life:3.8,bounces:0,age:0});t.flash=.11;emitFx('shot',x,y,colors[owner]);sound(410+owner*80,.065);refreshHUD();return true;}
function respawn(victim){const enemies=state.tanks.filter((_,i)=>i!==victim&&state.lives[i]>0&&!friendly(victim,i));const spots=[];
 if(mazeGrid){for(let r=0;r<mazeGrid.rows;r++)for(let c=0;c<mazeGrid.cols;c++)spots.push([(c+.5)*mazeGrid.cell,(r+.5)*mazeGrid.cell]);}
 else spots.push(...[[130,300],[830,300],[130,100],[830,500],[480,96],[480,500],[130,480],[830,120],[340,70],[620,525]]);
 const pool=spots.filter(([x,y])=>!blocked(x,y,25)&&state.tanks.every((other,j)=>j===victim||state.lives[j]===0||Math.hypot(x-other.x,y-other.y)>65));
 pool.sort((a,b)=>Math.min(...enemies.map(t=>Math.hypot(b[0]-t.x,b[1]-t.y)),10000)-Math.min(...enemies.map(t=>Math.hypot(a[0]-t.x,a[1]-t.y)),10000));
 const [x,y]=pool[0]||startingPosition(victim),t=state.tanks[victim];Object.assign(t,{x,y,a:0,vx:0,vy:0,shield:1.8,powerType:null,powerTimer:0,flash:0});
 state.bullets=state.bullets.filter(b=>Math.hypot(b.x-x,b.y-y)>50);}
function registerHit(attacker,victim){if(state.winner>=0||state.lives[victim]<=0||state.tanks[victim].shield>0||friendly(attacker,victim))return false;
 const target=state.tanks[victim];if(target.powerType==='guard'&&target.powerTimer>0){target.powerType=null;target.powerTimer=0;emitFx('pickup',target.x,target.y,'#b59aff');state.event='BARRIER BLOCKED THE HIT!';state.eventTimer=.8;return false;}
 emitFx('hit',target.x,target.y,colors[victim]);screenKick=4;state.lives[victim]--;state.kos[attacker]++;state.event=label(victim)+' LOSES A LIFE!';state.eventTimer=.85;sound(130+attacker*80,.16);
 if(state.lives[victim]>0)respawn(victim);else{target.vx=target.vy=0;state.bullets=state.bullets.filter(b=>b.owner!==victim);
 const active=state.tanks.map((_,i)=>i).filter(i=>state.lives[i]>0),teams=[...new Set(active.map(i=>teamOf(i)))];
 if(teams.length<=1){state.winnerTeam=teams[0]??teamOf(attacker);state.winner=active[0]??attacker;state.event=state.config.teamMode==='coop'?(state.winnerTeam===0?'HUMANS WIN!':'BOTS WIN!'):state.config.teamMode==='teams'?(`TEAM ${state.winnerTeam===0?'BLUE':'RED'} WINS!`):(label(state.winner)+' WINS!');state.eventTimer=0;}}
 refreshHUD();return true;}
function step(dt){if(paused||state.winner>=0)return;
 state.eventTimer=Math.max(0,state.eventTimer-dt);state.pickupTimer-=dt;
 if(state.pickupTimer<=0){spawnPickup();state.pickupTimer=state.pickups.length?15:3;}
 const inputs=state.tanks.map((t,i)=>i===0?makeControl(true):i===1&&mode==='duel'?makeControl(false):i===1&&mode==='host'?guestInput:botInput(i,dt));
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]<=0)continue;
 t.powerTimer=Math.max(0,(t.powerTimer||0)-dt);if(t.powerTimer<=0)t.powerType=null;t.flash=Math.max(0,(t.flash||0)-dt);
 t.shield=Math.max(0,t.shield-dt);tankMove(t,inputs[i],dt,i);
 for(const p of state.pickups){if(Math.hypot(t.x-p.x,t.y-p.y)<35){collectPickup(t,i,p);break}}
 fireCooldown[i]=Math.max(0,(fireCooldown[i]||0)-dt);if(inputs[i]?.fire&&fireCooldown[i]<=0&&shoot(i))fireCooldown[i]=t.powerType==='rapid'?.17:.42;}
 for(const b of state.bullets){b.age+=dt;b.life-=dt;const substeps=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*dt/5)),subDt=dt/substeps;
 for(let j=0;j<substeps&&b.life>0&&state.winner<0;j++){const nx=b.x+b.vx*subDt,ny=b.y+b.vy*subDt;
 if(blocked(nx,b.y,5)){b.vx=-b.vx;b.bounces++;emitFx('bounce',b.x,b.y,colors[b.owner]);sound(700,.018)}else b.x=nx;
 if(blocked(b.x,ny,5)){b.vy=-b.vy;b.bounces++;emitFx('bounce',b.x,b.y,colors[b.owner]);sound(700,.018)}else b.y=ny;
 for(const bump of bumpers){const dx=b.x-bump.x,dy=b.y-bump.y,dist=Math.hypot(dx,dy);if(dist>0&&dist<bump.r+6&&(b.bumpDelay||0)<=0){const ux=dx/dist,uy=dy/dist,dot=b.vx*ux+b.vy*uy;if(dot<0){b.vx-=2*dot*ux;b.vy-=2*dot*uy;b.x=bump.x+ux*(bump.r+7);b.y=bump.y+uy*(bump.r+7);b.bounces++;b.bumpDelay=.09;emitFx('bounce',b.x,b.y,'#ffdf7b');sound(940,.05)}}}
 b.bumpDelay=Math.max(0,(b.bumpDelay||0)-subDt);if(b.bounces>5){b.life=0;break}
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]>0&&!friendly(i,b.owner)&&t.shield<=0&&(t.x-b.x)**2+(t.y-b.y)**2<26**2){b.life=0;registerHit(b.owner,i);break}}}}
 state.bullets=state.bullets.filter(b=>b.life>0);}
function sound(freq,len=.09){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!window.rrAudio)window.rrAudio=new AC;const ac=window.rrAudio;if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.028,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+len);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+len)}catch(_){}}
function updateVisuals(dt){visualClock+=dt;screenKick=Math.max(0,screenKick-dt*22);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.max(0,1-dt*3);p.vy*=Math.max(0,1-dt*3)}particles=particles.filter(p=>p.life>0)}
function render(){const c=ctx;c.clearRect(0,0,W,H);c.save();if(screenKick>0)c.translate(Math.sin(visualClock*130)*screenKick,Math.cos(visualClock*98)*screenKick*.5);const zoom=mazeGrid?1.28:1,viewW=W/zoom,viewH=H/zoom,localTank=state.tanks[mode==='guest'?1:0]||state.tanks[0];
 const desiredX=clamp((localTank?.x||W/2)-viewW/2,0,Math.max(0,worldW-viewW)),desiredY=clamp((localTank?.y||H/2)-viewH/2,0,Math.max(0,worldH-viewH));
 camera.x+=(desiredX-camera.x)*.14;camera.y+=(desiredY-camera.y)*.14;if(!mazeGrid){camera.x=0;camera.y=0}
 c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);c.fillStyle='#0e2631';c.fillRect(0,0,worldW,worldH);c.strokeStyle='#1e4552';c.lineWidth=1;
 for(let x=0;x<=worldW;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<=worldH;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
 c.strokeStyle='#52a0b6';c.lineWidth=13;c.strokeRect(7,7,worldW-14,worldH-14);c.strokeStyle='#234a56';c.lineWidth=3;c.strokeRect(17,17,worldW-34,worldH-34);
 for(const w of wallSet){c.fillStyle='#133947';c.fillRect(w.x+5,w.y+6,w.w,w.h);c.fillStyle='#376375';c.fillRect(w.x,w.y,w.w,w.h);c.strokeStyle='#6a9ba9';c.lineWidth=2;c.strokeRect(w.x+2,w.y+2,w.w-4,w.h-4);c.fillStyle='#87bcc7';c.fillRect(w.x+10,w.y+5,Math.max(0,w.w-20),3)}
 for(const bump of bumpers){const glow=2.8*Math.sin(visualClock*4);c.beginPath();c.arc(bump.x,bump.y,bump.r+glow,0,Math.PI*2);c.fillStyle='#34464b';c.fill();c.strokeStyle='#ffd67d';c.lineWidth=4;c.stroke();c.beginPath();c.arc(bump.x,bump.y,11,0,Math.PI*2);c.fillStyle='#ffc76a';c.fill()}
 for(const p of state.pickups||[]){const def=PICKUPS[p.type];if(!def)continue;const pulse=1+Math.sin(visualClock*5)*.09;c.beginPath();c.arc(p.x,p.y,23*pulse,0,Math.PI*2);c.fillStyle='#0b2630';c.fill();c.strokeStyle=def.color;c.lineWidth=3;c.stroke();c.fillStyle=def.color;c.font='900 22px system-ui';c.textAlign='center';c.fillText(def.label,p.x,p.y+7)}
 for(let i=0;i<state.tanks.length;i++){const t=state.tanks[i];if(state.lives[i]<=0)continue;
 if(state.config?.teamMode!=='ffa'){c.beginPath();c.arc(t.x,t.y,29,0,Math.PI*2);c.strokeStyle=teamOf(i)===0?'#60dfff':'#ffb06e';c.lineWidth=4;c.stroke()}
 c.save();c.translate(t.x,t.y);c.rotate(t.a);
 if(t.shield>0){c.globalAlpha=.65+.25*Math.sin(t.shield*15)}
 c.fillStyle='#07161d';c.fillRect(-20,-23,43,47);c.fillStyle=colors[i];c.fillRect(-22,-20,44,40);c.fillStyle='#143442';c.fillRect(-15,-12,30,24);c.fillStyle=colors[i];c.fillRect(7,-7,28,14);c.fillStyle='#d6faff';c.fillRect(27,-4,7,8); c.fillStyle='#081e28';c.fillRect(-17,-24,30,6);c.fillRect(-17,18,30,6);if(t.flash>0){c.fillStyle='#fff3a0';c.beginPath();c.arc(39,0,8+t.flash*70,0,Math.PI*2);c.fill()}c.restore();
 if(t.powerType&&t.powerTimer>0&&PICKUPS[t.powerType]){c.fillStyle=PICKUPS[t.powerType].color;c.font='900 11px system-ui';c.textAlign='center';c.fillText(PICKUPS[t.powerType].name+' '+Math.ceil(t.powerTimer)+'s',t.x,t.y+48)}
 if(t.shield>0){c.beginPath();c.arc(t.x,t.y,32+Math.sin(t.shield*10)*2,0,Math.PI*2);c.strokeStyle=colors[i];c.globalAlpha=clamp(t.shield/1.8*.8,0,.8);c.lineWidth=3;c.stroke();c.globalAlpha=1}
 c.fillStyle=colors[i];c.font='bold 13px system-ui';c.textAlign='center';c.fillText(i<state.humanCount?'P'+(i+1):'AI'+(i-state.humanCount+1),t.x,t.y-38)}
 for(const b of state.bullets){const len=Math.min(19,Math.hypot(b.vx,b.vy)*.037);c.beginPath();c.moveTo(b.x-b.vx/405*len,b.y-b.vy/405*len);c.lineTo(b.x,b.y);c.strokeStyle=colors[b.owner];c.lineWidth=4;c.stroke();c.beginPath();c.arc(b.x,b.y,6,0,Math.PI*2);c.fillStyle='#f8ffff';c.shadowColor=colors[b.owner];c.shadowBlur=15;c.fill();c.shadowBlur=0}
 for(const p of particles){c.globalAlpha=clamp(p.life/p.maxLife,0,1);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size)}c.globalAlpha=1;
 c.restore();
 if(mazeGrid){const mw=150,mh=Math.round(mw*worldH/worldW),mx=W-mw-16,my=14;
 c.fillStyle='#06131ddc';c.fillRect(mx-5,my-5,mw+10,mh+10);c.strokeStyle='#5993a2';c.lineWidth=1;c.strokeRect(mx-5,my-5,mw+10,mh+10);
 c.save();c.translate(mx,my);c.scale(mw/worldW,mh/worldH);c.fillStyle='#163c4b';c.fillRect(0,0,worldW,worldH);
 c.fillStyle='#7aa8b6';for(const w of wallSet)c.fillRect(w.x,w.y,w.w,w.h);
 for(let i=0;i<state.tanks.length;i++){if(state.lives[i]<=0)continue;const t=state.tanks[i],me=mode==='guest'?1:0;if(i!==me&&Math.hypot(t.x-state.tanks[me].x,t.y-state.tanks[me].y)>400)continue;c.beginPath();c.arc(t.x,t.y,37,0,Math.PI*2);c.fillStyle=colors[i];c.fill()}
 c.strokeStyle='#ffffff';c.lineWidth=9;c.strokeRect(camera.x,camera.y,viewW,viewH);c.restore();}
 if(state.eventTimer>0&&state.winner<0){c.fillStyle='#071b26c9';c.fillRect(W/2-160,28,320,44);c.fillStyle='#f7e9b9';c.font='900 19px system-ui';c.textAlign='center';c.fillText(state.event,W/2,56)}
 if(state.winner>=0){c.fillStyle='#071b26da';c.fillRect(0,0,W,H);c.fillStyle=colors[state.winner]||'#fff';c.font='900 48px system-ui';c.textAlign='center';c.fillText(state.event,W/2,H/2-20);c.fillStyle='#deedf0';c.font='bold 18px system-ui';c.fillText('MATCH COMPLETE · OPEN MENU FOR REMATCH',W/2,H/2+28)}
 if(paused&&mode==='host'&&!connected){c.fillStyle='#071b26b5';c.fillRect(0,0,W,H);c.fillStyle='#d4f0f2';c.font='bold 28px system-ui';c.textAlign='center';c.fillText('WAITING FOR PLAYER TWO',W/2,H/2)}
 }
function nativePacket(packet){if(!window.AndroidBridge)return;try{window.AndroidBridge.sendPacket(JSON.stringify(packet))}catch(e){notice('Network send failed')}}
function loop(now){const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(mode==='solo'||mode==='duel'||mode==='host')step(dt);updateVisuals(dt);hudTimer+=dt;if(hudTimer>.15){hudTimer=0;refreshHUD();}
 if(mode==='host'&&connected){snapshotTimer+=dt;if(snapshotTimer>.09){snapshotTimer=0;nativePacket({type:'state',state:serializeState()})}}
 if(mode==='guest'&&connected){sendTimer+=dt;if(sendTimer>.05){sendTimer=0;nativePacket({type:'input',input:makeControl(true)})}}
 render();requestAnimationFrame(loop)}
function bridgeReady(){return !!window.AndroidBridge}
function host(){if(!bridgeReady()){notice('Nearby mode requires the Android APK');return}newMatch('host');setPanel('<div class="eyebrow">NEARBY PLAY</div><h2>HOSTING MATCH</h2><p id="host-status">Starting local game...</p><div class="host-address" id="host-address"></div><button data-action="close">CANCEL</button>');window.AndroidBridge.hostGame()}
function find(){if(!bridgeReady()){notice('Nearby mode requires the Android APK');return}newMatch('guest');setPanel('<div class="eyebrow">NEARBY PLAY</div><h2>FIND A MATCH</h2><p id="find-status">Looking for games on the same Wi-Fi...</p><div id="rooms"></div><button data-action="manual">JOIN BY LOCAL IP</button><button data-action="close">BACK</button>');window.AndroidBridge.findGames()}
function manual(){if(!bridgeReady()){notice('Manual LAN join requires the Android APK');return}newMatch('guest');setPanel('<div class="eyebrow">FALLBACK</div><h2>JOIN BY ADDRESS</h2><p>Enter the IP:port shown on the host screen, such as 192.168.1.25:47321</p><input id="lan-address" placeholder="192.168.1.25:47321" inputmode="url" autocapitalize="off"><button data-action="ip-join">CONNECT</button><button data-action="find">FIND NEARBY</button>')}
function stop(){if(bridgeReady())window.AndroidBridge.stopNetwork();connected=false;paused=true;mode='idle';clearStick();document.getElementById('mode-label').textContent='NO GAME ACTIVE';panel.innerHTML=originalPanel;menu.classList.remove('hidden')}
const originalPanel=panel.innerHTML;
menu.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='solo')newMatch('solo');else if(a==='duel')newMatch('duel');else if(a==='host')host();else if(a==='find')find();else if(a==='manual')manual();else if(a==='close')stop();else if(a==='ip-join'){
 const s=document.getElementById('lan-address').value.trim(),m=s.match(/^([\da-fA-F:.]+):(\d{1,5})$/);
 if(!m||+m[2]>65535||+m[2]<1){notice('Please enter a valid address and port');return}document.getElementById('mode-label').textContent='CONNECTING';window.AndroidBridge.joinGame(m[1],Number(m[2]));}});
function showPauseMenu(){clearStick();if(mode==='idle')return;
 if(mode==='solo'||mode==='duel'){paused=true;setPanel('<div class="eyebrow">PAUSED</div><h2>GAME MENU</h2><button data-action="resume">RESUME</button><button data-action="restart">REMATCH · FULL LIVES</button><button data-action="next-arena">NEXT ARENA</button><button data-action="close">MAIN MENU</button>')}
 else if(mode==='host'){setPanel('<div class="eyebrow">HOST OPTIONS</div><h2>GAME MENU</h2><p>Remote play continues while this menu is open.</p><button data-action="resume">BACK TO ARENA</button><button data-action="restart">REMATCH · BOTH PLAYERS</button><button data-action="next-arena">NEXT ARENA · BOTH PLAYERS</button><button data-action="close">DISCONNECT</button>')}
 else if(mode==='guest'){setPanel('<div class="eyebrow">PLAYER OPTIONS</div><h2>GAME MENU</h2><p>Only the host can restart the match.</p><button data-action="resume">BACK TO ARENA</button><button data-action="close">DISCONNECT</button>')}}
document.getElementById('menu-button').addEventListener('click',showPauseMenu);
menu.addEventListener('click',e=>{const a=e.target?.dataset?.action;
 if(a==='resume'){if(mode==='solo'||mode==='duel')paused=false;exitMenu()}
 else if(a==='restart'&&mode!=='guest'){resetAll();exitMenu()}else if(a==='next-arena'&&mode!=='guest'){resetAll(true);exitMenu()}});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if([...Object.values(keys1),...Object.values(keys2)].includes(e.code))e.preventDefault();pressed.add(e.code);if(e.code==='KeyR'&&state.winner>=0&&mode!=='guest')resetAll()});
window.addEventListener('keyup',e=>pressed.delete(e.code));window.addEventListener('blur',()=>{pressed.clear();touch.clear();clearStick()});
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
window.RR={openMenu(){if(menu.classList.contains('hidden'))showPauseMenu();else if(mode==='idle')stop();else if(mode==='solo'||mode==='duel'){paused=false;exitMenu()}else exitMenu()},appPause(){pressed.clear();touch.clear();clearStick();if((mode==='solo'||mode==='duel')&&menu.classList.contains('hidden'))showPauseMenu()},nativeMessage(json){let msg;try{msg=JSON.parse(json)}catch(_){return}if(!msg||typeof msg.type!=='string')return;
 switch(msg.type){case 'hosting':{const p=document.getElementById('host-status');if(p)p.textContent='Waiting for another phone to join...';const a=document.getElementById('host-address');if(a)a.textContent=(msg.address||'LOCAL NETWORK')+':'+msg.port;break}
 case 'found':{const r=document.getElementById('rooms');if(r&&!r.querySelector('[data-host="'+msg.host+'"]')){const b=document.createElement('button');b.textContent='JOIN '+(msg.name||'NEARBY GAME');b.dataset.host=msg.host;b.onclick=()=>{window.AndroidBridge.joinGame(msg.host,msg.port);document.getElementById('find-status').textContent='Connecting...'};r.appendChild(b)}break}
 case 'connected':{connected=true;paused=false;document.getElementById('mode-label').textContent=mode==='guest'?'YOU: CORAL':mode==='host'?'YOU: CYAN':'CONNECTED';exitMenu();notice('Player connected — FIGHT!');if(mode==='host'){state=initialState(state.arenaId,state.config,state.mazeSeed);refreshHUD()}break}
 case 'state':if(mode==='guest'&&msg.state&&Array.isArray(msg.state.tanks)&&msg.state.tanks.length>=2&&msg.state.tanks.length<=6&&Array.isArray(msg.state.lives)&&msg.state.lives.length===msg.state.tanks.length&&Array.isArray(msg.state.kos)&&msg.state.kos.length===msg.state.tanks.length){const upcoming=msg.state;const currentEvents=Array.isArray(upcoming.fxEvents)?upcoming.fxEvents:[];for(const event of currentEvents){if(event.id>lastRemoteFxId&&event.id<lastRemoteFxId+1000&&Number.isFinite(event.x)&&Number.isFinite(event.y)){spawnParticles(event.kind,event.x,event.y,event.color);lastRemoteFxId=event.id}}state=upcoming;setArena(state.arenaId,state.mazeSeed);refreshHUD()}break;
 case 'input':if(mode==='host'&&msg.input){guestInput.moveX=clamp(Number(msg.input.moveX)||0,-1,1);guestInput.moveY=clamp(Number(msg.input.moveY)||0,-1,1);guestInput.fire=msg.input.fire===true}break;
 case 'disconnected':connected=false;paused=true;guestInput={moveX:0,moveY:0,fire:false};clearStick();notice('Other player disconnected');setPanel('<h2>CONNECTION LOST</h2><p>Return to the main menu and reconnect.</p><button data-action="close">MAIN MENU</button>');break;
 case 'error':notice(msg.message||'Network error');break;}}};
refreshHUD();requestAnimationFrame(loop);
})();