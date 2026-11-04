// Sector Rebound renderer probe: isolated deterministic mini-arena, NOT game.js.
// Shared motion/ballistics for both renderers. No account, saves, LAN or online requests.
import { Application, Graphics, Container, Sprite, Texture } from 'pixi.js';
import { TEAM_COLORS, WORLD_WIDTH, WORLD_HEIGHT, WALLS, buildUnitArt, createFieldgridFloor, makeBulletCanvas } from './fieldgrid-art.js';

const W=960,H=540,MAX_SHOTS=180,BASE_COLOR=0x101f2b;
const walls=WALLS;
const colors={cyan:TEAM_COLORS[0],coral:TEAM_COLORS[1]};
const baseBotPositions=[[1210,168,'tank'],[1220,515,'mech'],[850,790,'pilot'],[1020,305,'tank'],[520,805,'mech'],[570,200,'pilot'],[1090,805,'tank'],[1130,645,'mech'],[920,110,'pilot'],[1200,335,'tank'],[615,615,'mech'],[910,520,'pilot'],[280,760,'tank'],[300,175,'pilot'],[780,410,'mech'],[1320,755,'tank'],[1280,880,'pilot'],[570,360,'mech']];
let floorCanvas=null,art=null,bulletArt=null,unitTextures=null,projectileTexture=null;
let load='match',camera={x:0,y:0,zoom:.73},effects=[];
const unitSize=120;
const $=(id)=>document.getElementById(id);
const root=$('field'),normal=$('canvas2d'),ctx=normal.getContext('2d',{alpha:false});
let scene=null, pixi=null, engine='pixi',time=0,prev=0,frame=0;
let move={x:0,y:0},aim=null,keyboard=new Set(),paused=false;
let renderSamples=[],frameSamples=[],running=true;
const R=19;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const norm=(x,y)=>{const mag=Math.hypot(x,y);return mag<.02?{x:0,y:0}:{x:x/mag,y:y/mag}};
function reset(){
 const n=load==='stress'?18:5;
 scene={
  player:{x:175,y:448,a:0,dir:0,team:0,type:'tank',hp:4,cool:.1},
  bots:baseBotPositions.slice(0,n).map((v,i)=>({x:v[0],y:v[1],a:Math.PI,dir:Math.PI,team:1,type:v[2],hp:3,cool:.7+i*.11})),
  parked:[{x:395,y:175,a:.32,dir:.32,team:0,type:'mech',hp:3},{x:280,y:595,a:-.65,dir:-.65,team:0,type:'tank',hp:3}],
  shots:[],kills:0,deaths:0
 };
 effects=[];time=0;renderSamples=[];frameSamples=[];frame=0;
 camera.x=0;camera.y=0;camera.zoom=.73;
 if(load==='stress')for(let i=0;i<80;i++){
  const a=i*2.39996,spd=130+(i%5)*37;
  scene.shots.push({x:400+(i*71)%770,y:100+(i*43)%690,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,team:i%2,bounces:0,life:2.9+(i%5)*.2,active:true});
 }
 updateHud();
}
function addFx(x,y,team){
 for(let i=0;i<8;i++){
  const theta=(i/8)*Math.PI*2+time*.3;
  effects.push({x,y,vx:Math.cos(theta)*(42+i*9),vy:Math.sin(theta)*(42+i*9),life:.4+i*.018,maxLife:.56,size:i%3===0?4:2,team});
 }
 if(effects.length>230)effects.splice(0,effects.length-230);
}
function occupied(x,y,r=R){
 if(x<24+r||x>WORLD_WIDTH-24-r||y<24+r||y>WORLD_HEIGHT-24-r)return true;
 return walls.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h);
}
function moveUnit(u,dx,dy){
 if(!occupied(u.x+dx,u.y))u.x+=dx;
 if(!occupied(u.x,u.y+dy))u.y+=dy;
}
function shoot(u){
 if(u.hp<=0||u.cool>0||scene.shots.length>=MAX_SHOTS)return;
 const dx=Math.cos(u.a),dy=Math.sin(u.a);
 scene.shots.push({x:u.x+dx*32,y:u.y+dy*32,vx:dx*345,vy:dy*345,team:u.team,bounces:0,life:3.6,active:true});
 u.cool=u.team===0?.29:(load==='stress'?.55:.78);
}
function intersectBullet(b){
 for(const w of walls){
  const left=w.x-3,right=w.x+w.w+3,top=w.y-3,bottom=w.y+w.h+3;
  if(b.x>left&&b.x<right&&b.y>top&&b.y<bottom)return w;
 }
 return null;
}
function bounceBullet(b,oldX,oldY){
 const w=intersectBullet(b);if(!w)return;
 const fromSide=oldX<=w.x-3||oldX>=w.x+w.w+3;
 const fromTop=oldY<=w.y-3||oldY>=w.y+w.h+3;
 if(fromSide)b.vx*=-1;
 if(fromTop)b.vy*=-1;
 if(!fromSide&&!fromTop){b.vx*=-1;b.vy*=-1;}
 b.x=oldX;b.y=oldY;b.bounces++;
 if(b.bounces>3)b.life=0;
 addFx(b.x,b.y,b.team);
}
function hitUnit(b,u){
 if(u.hp<=0||u.team===b.team||Math.hypot(b.x-u.x,b.y-u.y)>R+4)return false;
 u.hp--;b.life=0;addFx(b.x,b.y,b.team);
 if(u.hp<=0){
  if(u.team===0){scene.deaths++;u.x=175;u.y=448;u.hp=4;}
  else {scene.kills++;u.x=u.x>850?1200:775;u.y=u.y<480?170:700;u.hp=3;}
 }
 updateHud();return true;
}
function advance(dt){
 if(paused||!scene)return;
 time+=dt;
 const p=scene.player;
 const arrows={x:Number(keyboard.has('d')||keyboard.has('arrowright'))-Number(keyboard.has('a')||keyboard.has('arrowleft')),y:Number(keyboard.has('s')||keyboard.has('arrowdown'))-Number(keyboard.has('w')||keyboard.has('arrowup'))};
 const direction=(arrows.x||arrows.y)?norm(arrows.x,arrows.y):move;
 moveUnit(p,direction.x*160*dt,direction.y*160*dt);
 if(direction.x||direction.y)p.dir=Math.atan2(direction.y,direction.x);
 if(aim)p.a=Math.atan2(aim.y,aim.x);
 else p.a=p.dir;
 p.cool=Math.max(0,p.cool-dt);
 scene.bots.forEach((u,i)=>{
  u.cool=Math.max(0,u.cool-dt);
  const desired=Math.atan2(p.y-u.y,p.x-u.x);
  const angle=Math.atan2(Math.sin(desired-u.a),Math.cos(desired-u.a));
  u.a+=clamp(angle,-.72*dt,.72*dt);
  u.dir=u.a;
  const desiredMove=Math.sin(time*.63+i*1.4)*.65;
  moveUnit(u,Math.cos(u.a)*desiredMove*55*dt,Math.sin(u.a)*desiredMove*55*dt);
  if(Math.abs(angle)<.22&&Math.hypot(u.x-p.x,u.y-p.y)<1000)shoot(u);
 });
 for(const b of scene.shots){
  if(b.life<=0)continue;
  b.life-=dt;
  for(let i=0;i<3&&b.life>0;i++){
   const px=b.x,py=b.y;
   b.x+=b.vx*dt/3;b.y+=b.vy*dt/3;
   bounceBullet(b,px,py);
   if(hitUnit(b,p))break;
   if(scene.bots.some(u=>hitUnit(b,u)))break;
  }
 }
 scene.shots=scene.shots.filter(b=>b.life>0);
 if(load==='stress'&&scene.shots.length<75&&Math.floor(time*10)%2===0){const i=Math.floor(time*30)%scene.bots.length,u=scene.bots[i];u.cool=0;shoot(u);}
 for(const fx of effects){fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;fx.life-=dt;}
 effects=effects.filter(fx=>fx.life>0);
 const zoom=.73,viewW=W/zoom,viewH=H/zoom;
 camera.zoom=zoom;camera.x=clamp(p.x-viewW/2,0,WORLD_WIDTH-viewW);
 camera.y=clamp(p.y-viewH/2,0,WORLD_HEIGHT-viewH);
 if(keyboard.has(' '))shoot(p);
}
// The baseline and Pixi now draw the SAME exact production art textures.
// Pre-rendering is an optimization applied to BOTH paths, not just Pixi.
function textureKey(unit){
 const p=((Math.floor(time*8+unit.x*.01)%4)+4)%4;
 return unit.team+'-'+unit.type+'-'+p;
}
function canvasFrame(){
 ctx.clearRect(0,0,W,H);
 ctx.save();ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
 ctx.drawImage(floorCanvas,0,0);
 const units=[...scene.parked,scene.player,...scene.bots];
 for(let i=0;i<units.length;i++){
  const u=units[i],image=art[textureKey(u)];
  ctx.save();ctx.translate(u.x,u.y);ctx.rotate(u.a);
  if(i<scene.parked.length)ctx.globalAlpha=.58;
  ctx.drawImage(image,-unitSize/2,-unitSize/2);ctx.restore();
 }
 for(const b of scene.shots){
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));
  ctx.drawImage(bulletArt,-38,-20);ctx.restore();
 }
 for(const fx of effects){ctx.globalAlpha=Math.max(0,fx.life/fx.maxLife);ctx.fillStyle=TEAM_COLORS[fx.team];ctx.fillRect(fx.x,fx.y,fx.size,fx.size);}
 ctx.globalAlpha=1;ctx.restore();
}
async function makePixi(){
 const app=new Application();
 await app.init({width:W,height:H,preference:'webgl',backgroundColor:BASE_COLOR,antialias:false,resolution:1,autoStart:false});
 $('pixi-host').appendChild(app.canvas);
 app.canvas.style.width='100%';app.canvas.style.height='100%';
 unitTextures=Object.fromEntries(Object.entries(art).map(([id,c])=>[id,Texture.from(c)]));
 projectileTexture=Texture.from(bulletArt);
 const world=new Container();app.stage.addChild(world);
 world.addChild(new Sprite(Texture.from(floorCanvas)));
 const units=Array.from({length:21},()=>{
  const sprite=new Sprite(unitTextures['0-tank-0']);sprite.anchor.set(.5);
  sprite.visible=false;world.addChild(sprite);return sprite;
 });
 const bullets=Array.from({length:MAX_SHOTS},()=>{
  const sprite=new Sprite(projectileTexture);
  sprite.anchor.set(38/64,.5);sprite.visible=false;world.addChild(sprite);return sprite;
 });
 const fx=Array.from({length:240},()=>{
  const item=new Graphics().rect(0,0,4,4).fill(0xffffff);
  item.visible=false;world.addChild(item);return item;
 });
 return {app,world,units,bullets,fx};
}
function pixiFrame(){
 const units=[...scene.parked,scene.player,...scene.bots];
 for(let i=0;i<pixi.units.length;i++){
  const v=pixi.units[i],u=units[i];v.visible=!!u;if(!u)continue;
  v.texture=unitTextures[textureKey(u)];v.position.set(u.x,u.y);v.rotation=u.a;
  v.alpha=i<scene.parked.length?.58:1;
 }
 for(let i=0;i<pixi.bullets.length;i++){
  const v=pixi.bullets[i],b=scene.shots[i];v.visible=!!b;if(!b)continue;
  v.position.set(b.x,b.y);v.rotation=Math.atan2(b.vy,b.vx);
  v.tint=b.team===0?0xc8f8ff:0xffd1bd;
 }
 for(let i=0;i<pixi.fx.length;i++){
  const v=pixi.fx[i],fx=effects[i];v.visible=!!fx;if(!fx)continue;
  v.position.set(fx.x,fx.y);v.scale.set(fx.size/4);v.alpha=Math.max(0,fx.life/fx.maxLife);
  v.tint=fx.team===0?0x60dfff:0xffb06e;
 }
 pixi.world.scale.set(camera.zoom);
 pixi.world.position.set(-camera.x*camera.zoom,-camera.y*camera.zoom);
 pixi.app.render();
}
function updateHud(){
 if(!scene)return;
 $('kills').textContent=String(scene.kills);$('deaths').textContent=String(scene.deaths);
 $('shots').textContent='SHOTS '+String(scene.shots.length)+' · BOTS '+scene.bots.length;
}
function percentile(samples,q){
 if(!samples.length)return 0;
 const x=[...samples].sort((a,b)=>a-b);
 return x[Math.min(x.length-1,Math.floor((x.length-1)*q))];
}
function stats(dt,renderDuration){
 if(frameSamples.length>=150)frameSamples.shift();
 if(renderSamples.length>=150)renderSamples.shift();
 frameSamples.push(dt*1000);renderSamples.push(renderDuration);
 frame++;
 if(frame%8!==0)return;
 const fps=frameSamples.length?1000/(frameSamples.reduce((a,b)=>a+b,0)/frameSamples.length):0;
 $('fps').textContent='FPS '+fps.toFixed(1);
 $('render-ms').textContent='CPU submit p95 '+percentile(renderSamples,.95).toFixed(2)+' ms';
 updateHud();
 window.__pixiProbe={ready:!!pixi,engine,frames:frame,fps,renderP95:percentile(renderSamples,.95),shots:scene.shots.length,kills:scene.kills,bots:scene.bots.length,load,visuals:'production-path-art',backend:pixi?.app?.renderer?.name||'none'};
}
function switchRenderer(next){
 if(next==='pixi'&&!pixi)return;
 engine=next;normal.style.display=engine==='canvas'?'block':'none';
 $('pixi-host').style.display=engine==='pixi'?'block':'none';
 $('backend').textContent=engine==='pixi'?'PIXI / '+String(pixi.app.renderer.name).toUpperCase():'CANVAS / 2D';
 $('use-pixi').classList.toggle('selected',engine==='pixi');
 $('use-canvas').classList.toggle('selected',engine==='canvas');
 frameSamples=[];renderSamples=[];frame=0;prev=0;
 window.__pixiProbe={...(window.__pixiProbe||{}),ready:!!pixi,engine,frames:0,fps:0,renderP95:0,shots:scene.shots.length,kills:scene.kills,bots:scene.bots.length,load,visuals:'production-path-art',backend:pixi?.app?.renderer?.name||'none'};
}
function bindStick(){
 const el=$('stick'),knob=$('knob');
 let pointerId=null;
 function update(e){
  const r=el.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const rad=Math.min(r.width,r.height)*.37,m=Math.hypot(dx,dy);
  const scale=m>rad?rad/m:1;
  const x=dx*scale,y=dy*scale;
  move={x:x/rad,y:y/rad};knob.style.transform='translate('+x+'px,'+y+'px)';
 }
 el.addEventListener('pointerdown',e=>{e.preventDefault();pointerId=e.pointerId;el.setPointerCapture(pointerId);update(e);});
 el.addEventListener('pointermove',e=>{if(pointerId===e.pointerId)update(e);});
 function end(e){if(pointerId!==e.pointerId)return;pointerId=null;move={x:0,y:0};knob.style.transform='translate(0,0)';}
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}
function bindFire(){
 const el=$('fire');let pointerId=null;
 function update(e){
  const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
  if(Math.hypot(x,y)>12)aim=norm(x,y);
 }
 el.addEventListener('pointerdown',e=>{e.preventDefault();pointerId=e.pointerId;el.setPointerCapture(pointerId);update(e);});
 el.addEventListener('pointermove',e=>{if(pointerId===e.pointerId)update(e);});
 el.addEventListener('pointerup',e=>{if(pointerId!==e.pointerId)return;pointerId=null;shoot(scene.player);});
 el.addEventListener('pointercancel',e=>{if(pointerId===e.pointerId)pointerId=null;});
}
function setLoad(next){load=next;$('use-match').classList.toggle('selected',load==='match');$('use-stress').classList.toggle('selected',load==='stress');reset();}
function bindControls(){
 bindStick();bindFire();
 $('use-pixi').addEventListener('click',()=>switchRenderer('pixi'));
 $('use-canvas').addEventListener('click',()=>switchRenderer('canvas'));
 $('reset').addEventListener('click',()=>reset());
 $('use-match').addEventListener('click',()=>setLoad('match'));
 $('use-stress').addEventListener('click',()=>setLoad('stress'));
 window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keyboard.add(k);});
 window.addEventListener('keyup',e=>keyboard.delete(e.key.toLowerCase()));
 document.addEventListener('visibilitychange',()=>{paused=document.hidden;prev=0;});
}
function loop(now){
 if(!running)return;
 const dt=prev?clamp((now-prev)/1000,0,.04):.0167;
 prev=now;advance(dt);
 const t0=performance.now();
 if(engine==='pixi'&&pixi)pixiFrame();else canvasFrame();
 const t1=performance.now();stats(dt,t1-t0);
 requestAnimationFrame(loop);
}
async function start(){
 reset();art=buildUnitArt();floorCanvas=createFieldgridFloor();bulletArt=makeBulletCanvas();bindControls();
 try{
  pixi=await makePixi();
  switchRenderer('pixi');
  $('notice').textContent='FIELDGRID game art & tiled arena • SAME animated units in both renderers • benchmark only';
 }catch(error){
  console.error('Pixi backend unavailable:',error);
  switchRenderer('canvas');
  $('use-pixi').disabled=true;
  $('notice').textContent='Pixi WebGL could not initialize; Canvas baseline remains playable. '+String(error).slice(0,90);
 }
 requestAnimationFrame(loop);
}
start();
