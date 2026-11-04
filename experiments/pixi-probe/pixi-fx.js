// Sector Rebound visual-ceiling experiment only.
// PixiJS pooled, GPU-composited additive lights, sparks, glow and trails.
// No gameplay logic, hit detection, save state, network requests or production assets.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';

const PICKUPS=[{x:190,y:155,team:0},{x:1270,y:215,team:1},{x:620,y:740,team:0}];
const MAX_EVENTS=80,MAX_PARTICLES=420,MAX_LIGHTS=100,MAX_RINGS=50,MAX_SMOKE=50;
const COLOR={cyan:0x75e6fa,coral:0xffa78c,white:0xfafff7,gold:0xffd38b,pilot:0xb9ffe5,mech:0xc7afff};
const between=(n,min,max)=>Math.max(min,Math.min(max,n));
const rgba=(team)=>team===0?COLOR.cyan:COLOR.coral;
function radialTexture(){
 const c=document.createElement('canvas');c.width=c.height=128;
 const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,63);
 g.addColorStop(0,'rgba(255,255,255,.95)');
 g.addColorStop(.16,'rgba(255,255,255,.55)');
 g.addColorStop(.46,'rgba(255,255,255,.18)');
 g.addColorStop(1,'rgba(255,255,255,0)');
 x.fillStyle=g;x.fillRect(0,0,128,128);
 return Texture.from(c);
}
function sparkleTexture(){
 const c=document.createElement('canvas');c.width=36;c.height=10;
 const x=c.getContext('2d');
 x.fillStyle='#ffffff';x.fillRect(1,4,30,2);x.fillRect(19,3,10,4);
 return Texture.from(c);
}
function ringTexture(){
 const c=document.createElement('canvas');c.width=c.height=128;
 const x=c.getContext('2d');
 x.strokeStyle='rgba(255,255,255,.24)';x.lineWidth=13;
 x.beginPath();x.arc(64,64,43,0,Math.PI*2);x.stroke();
 x.strokeStyle='#ffffff';x.lineWidth=3.5;
 x.beginPath();x.arc(64,64,43,0,Math.PI*2);x.stroke();
 return Texture.from(c);
}
function smokeTexture(){
 const c=document.createElement('canvas');c.width=c.height=96;
 const x=c.getContext('2d'),g=x.createRadialGradient(48,48,5,48,48,47);
 g.addColorStop(0,'rgba(185,209,216,.66)');
 g.addColorStop(.5,'rgba(107,139,148,.19)');
 g.addColorStop(1,'rgba(25,54,68,0)');
 x.fillStyle=g;x.fillRect(0,0,96,96);
 return Texture.from(c);
}
function pooled(layer,texture,count,additive=true){
 const arr=[];
 for(let i=0;i<count;i++){
  const v=new Sprite(texture);v.anchor.set(.5);v.visible=false;
  if(additive)v.blendMode='add';
  layer.addChild(v);arr.push(v);
 }
 return arr;
}
export class PixiFxLab {
 constructor(world,walls=[]){
  this.layer=new Container();this.layer.label='EXPERIMENTAL FX only';
  world.addChild(this.layer);
  this.lightTex=radialTexture();this.sparkTex=sparkleTexture();
  this.ringTex=ringTexture();this.smokeTex=smokeTexture();
  this.lights=pooled(this.layer,this.lightTex,MAX_LIGHTS);
  this.sparks=pooled(this.layer,this.sparkTex,MAX_PARTICLES);
  this.rings=pooled(this.layer,this.ringTex,MAX_RINGS);
  this.smoke=pooled(this.layer,this.smokeTex,MAX_SMOKE,false);
  this.bulletGlow=pooled(this.layer,this.lightTex,180);
  this.pickups=pooled(this.layer,this.lightTex,PICKUPS.length);
  this.exhaust=pooled(this.layer,this.smokeTex,22,false);
  // Static facility accent lighting: no huge bloom / full-screen postprocess.
  const rails=new Graphics();
  for(let i=0;i<walls.length;i++){
   const w=walls[i];if(i%3!==1)continue;
   if(w.w>w.h)rails.rect(w.x+8,w.y+1,Math.max(8,w.w-16),2).fill(0x5bb4ba);
   else rails.rect(w.x+1,w.y+8,2,Math.max(8,w.h-16)).fill(0x5bb4ba);
  }
  rails.alpha=.32;this.layer.addChildAt(rails,0);
  this.staticRails=rails;
  this.enabled=true;this.activeCount=0;
 }
 setEnabled(on){
  this.enabled=!!on;this.layer.visible=this.enabled;
  if(!on)this.activeCount=0;
 }
 render(now,events,shots,units){
  if(!this.enabled)return;
  let nl=0,ns=0,nr=0,nm=0,nb=0;
  const addLight=(x,y,size,color,alpha)=>{
   if(nl>=this.lights.length)return;
   const s=this.lights[nl++];s.visible=true;s.position.set(x,y);
   s.width=s.height=size;s.tint=color;s.alpha=between(alpha,0,.50);
  };
  const addSpark=(x,y,angle,length,color,alpha)=>{
   if(ns>=this.sparks.length)return;
   const s=this.sparks[ns++];s.visible=true;s.position.set(x,y);
   s.rotation=angle;s.width=length;s.height=length*.27;
   s.tint=color;s.alpha=between(alpha,0,.85);
  };
  const addRing=(x,y,r,color,alpha)=>{
   if(nr>=this.rings.length)return;
   const s=this.rings[nr++];s.visible=true;s.position.set(x,y);
   s.width=s.height=r*2.75;s.tint=color;s.alpha=between(alpha,0,.56);
  };
  const addSmoke=(x,y,r,alpha)=>{
   if(nm>=this.smoke.length)return;
   const s=this.smoke[nm++];s.visible=true;s.position.set(x,y);
   s.width=s.height=r;s.alpha=between(alpha,0,.18);
  };
  // Each event is a short, bounded snapshot of a real combat cue.
  // Numerical seed makes individual spark paths deterministic for freeze/A-B QA.
  for(const ev of events.slice(-MAX_EVENTS)){
   const q=between(ev.age/ev.life,0,1),fade=(1-q);
   const color=rgba(ev.team);
   if(ev.kind==='muzzle'){
    addLight(ev.x,ev.y,68+q*25,COLOR.gold,.34*fade);
    addLight(ev.x,ev.y,39,color,.23*fade);
    for(let k=0;k<3;k++){
     const theta=ev.angle+(k-1)*.28;
     addSpark(ev.x+Math.cos(theta)*(13+k*5),ev.y+Math.sin(theta)*(13+k*5),theta,17+q*11,COLOR.gold,.68*fade);
    }
   }
   if(ev.kind==='bounce'||ev.kind==='hit'||ev.kind==='damage'){
    addLight(ev.x,ev.y,ev.kind==='hit'?88:57,ev.kind==='damage'?COLOR.white:color,.23*fade);
    if(ev.kind!=='bounce')addRing(ev.x,ev.y,9+q*24,ev.kind==='damage'?COLOR.white:color,.38*fade);
    const count=ev.kind==='bounce'?6:ev.kind==='damage'?4:9;
    for(let k=0;k<count;k++){
     const a=(k/count)*Math.PI*2+ev.seed*.78;
     const dist=6+q*(ev.kind==='bounce'?28:39);
     addSpark(ev.x+Math.cos(a)*dist,ev.y+Math.sin(a)*dist,a,
       (ev.kind==='bounce'?14:19)*(1-q*.4),k%3?color:COLOR.gold,.58*fade);
    }
   }
   if(ev.kind==='death'){
    addLight(ev.x,ev.y,110+q*68,COLOR.gold,.36*fade);
    addRing(ev.x,ev.y,17+q*53,color,.44*fade);
    for(let k=0;k<14;k++){
     const a=(k/14)*Math.PI*2+ev.seed*.18;
     const dist=8+q*(37+(k%3)*10);
     addSpark(ev.x+Math.cos(a)*dist,ev.y+Math.sin(a)*dist,a,21*(1-q*.5),k%4?color:COLOR.gold,.74*fade);
    }
    for(let k=0;k<3;k++)addSmoke(ev.x+Math.sin(ev.seed+k*3)*13+q*k*7,ev.y-12-q*(25+k*9),33+q*55,.11*fade);
   }
  }
  // Animated pickups and sparse wall accents improve scene depth but remain
  // low-opacity so players can still read aim lines and silhouettes.
  for(let i=0;i<this.pickups.length;i++){
   const p=PICKUPS[i],s=this.pickups[i],wave=Math.sin(now*3+i*1.9);
   s.visible=true;s.position.set(p.x,p.y);s.width=s.height=67+wave*8;
   s.tint=rgba(p.team);s.alpha=.13+wave*.025;
  }
  // Weapon identities differ only in illumination, never hitbox or speed.
  for(const b of shots){
   if(nb>=this.bulletGlow.length)break;
   const s=this.bulletGlow[nb++],heavy=b.kind==='mech',small=b.kind==='pilot';
   s.visible=true;s.position.set(b.x-b.vx*.022,b.y-b.vy*.022);
   s.rotation=Math.atan2(b.vy,b.vx);
   s.width=small?42:heavy?105:76;s.height=small?25:heavy?57:38;
   s.tint=heavy?COLOR.mech:small?COLOR.pilot:rgba(b.team);
   s.alpha=heavy?.28:small?.14:.22;
  }
  // Very faint engine puffs; slow-moving or stationary actors are unaffected.
  let nx=0;
  for(const u of units){
   if(nx>=this.exhaust.length)break;
   const drift=u.engineSpeed||0;
   const item=this.exhaust[nx++];
   item.visible=drift>10;
   if(!item.visible)continue;
   const back=u.a+Math.PI;
   item.position.set(u.x+Math.cos(back)*31,u.y+Math.sin(back)*31);
   item.width=item.height=16+Math.min(32,drift*.12);
   item.alpha=Math.min(.13,drift/1400);
  }
  for(let i=nl;i<this.lights.length;i++)this.lights[i].visible=false;
  for(let i=ns;i<this.sparks.length;i++)this.sparks[i].visible=false;
  for(let i=nr;i<this.rings.length;i++)this.rings[i].visible=false;
  for(let i=nm;i<this.smoke.length;i++)this.smoke[i].visible=false;
  for(let i=nb;i<this.bulletGlow.length;i++)this.bulletGlow[i].visible=false;
  for(let i=nx;i<this.exhaust.length;i++)this.exhaust[i].visible=false;
  this.activeCount=nl+ns+nr+nm+nb+nx+this.pickups.length;
 }
 destroy(){this.layer.destroy({children:true});}
}
